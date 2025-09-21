import { nanoid } from 'nanoid';
import { UserContext, ToolResult, ExecutionPlan, ExecutionStep } from '../tools/types';
import { executeAction } from '../tools/registry';

// Intent detection patterns
const INTENT_PATTERNS = {
  email_summary: [
    /email.*summary|özet.*email|mail.*özet/i,
    /son.*email|günlük.*mail|bugünkü.*email/i,
    /email.*listele|mail.*göster/i
  ],
  create_event: [
    /toplantı.*oluştur|meeting.*create|etkinlik.*ekle/i,
    /takvim.*ekle|calendar.*add|randevu.*ver/i,
    /.*tarihinde.*toplantı|.*saatinde.*meeting/i
  ],
  create_task: [
    /görev.*oluştur|task.*create|yapılacak.*ekle/i,
    /hatırlat|remind.*me|not.*al/i,
    /todo.*add|liste.*ekle/i
  ],
  create_note: [
    /not.*oluştur|note.*create|kaydet/i,
    /yazdır|write.*down|belge.*oluştur/i,
    /dokümante.*et|document/i
  ],
  general_qa: [
    /nasıl|how.*to|ne.*demek|what.*is/i,
    /açıkla|explain|anlat|tell.*me/i,
    /yardım|help|destek/i
  ]
} as const;

type Intent = keyof typeof INTENT_PATTERNS;

class ChatOrchestrator {
  detectIntent(message: string): Intent {
    for (const [intent, patterns] of Object.entries(INTENT_PATTERNS)) {
      if (patterns.some(pattern => pattern.test(message))) {
        return intent as Intent;
      }
    }
    return 'general_qa';
  }

  enrichContext(userId: string, context?: any): UserContext {
    return {
      userId,
      preferences: context?.preferences || {},
      recentItems: context?.recentItems || [],
      timezone: 'Europe/Istanbul',
      language: 'tr',
    };
  }

  async llmPlan(intent: Intent, context: UserContext, message: string): Promise<ExecutionPlan> {
    const planId = nanoid();
    const steps: ExecutionStep[] = [];
    let requiresUserApproval = false;

    switch (intent) {
      case 'email_summary':
        steps.push({
          stepId: nanoid(),
          tool: 'gmail',
          action: 'gmail_summary',
          parameters: {
            userId: context.userId,
            timeframe: this.extractTimeframe(message) || 'today',
            maxEmails: 20,
          },
          description: 'Son e-postalarınızın özetini çıkaracağım',
          requiresConfirmation: false,
        });
        break;

      case 'create_event':
        const eventDetails = this.extractEventDetails(message);
        if (!eventDetails.title || !eventDetails.start) {
          return {
            planId,
            intent,
            steps: [{
              stepId: nanoid(),
              tool: 'clarify',
              action: 'clarify',
              parameters: {},
              description: 'Eksik bilgi talebi',
              requiresConfirmation: false,
            }],
            requiresUserApproval: false,
          };
        }
        
        steps.push({
          stepId: nanoid(),
          tool: 'calendar',
          action: 'calendar_create_event',
          parameters: {
            userId: context.userId,
            ...eventDetails,
          },
          description: `"${eventDetails.title}" etkinliğini takvime ekleyeceğim`,
          requiresConfirmation: false,
        });
        requiresUserApproval = true;
        break;

      case 'create_task':
        const taskDetails = this.extractTaskDetails(message);
        if (!taskDetails.title) {
          return {
            planId,
            intent,
            steps: [{
              stepId: nanoid(),
              tool: 'clarify',
              action: 'clarify',
              parameters: {},
              description: 'Eksik bilgi talebi',
              requiresConfirmation: false,
            }],
            requiresUserApproval: false,
          };
        }

        steps.push({
          stepId: nanoid(),
          tool: 'tasks',
          action: 'task_create',
          parameters: {
            userId: context.userId,
            ...taskDetails,
          },
          description: `"${taskDetails.title}" görevini oluşturacağım`,
          requiresConfirmation: false,
        });
        requiresUserApproval = true;
        break;

      case 'create_note':
        const noteDetails = this.extractNoteDetails(message);
        if (!noteDetails.title || !noteDetails.content) {
          return {
            planId,
            intent,
            steps: [{
              stepId: nanoid(),
              tool: 'clarify',
              action: 'clarify',
              parameters: {},
              description: 'Eksik bilgi talebi',
              requiresConfirmation: false,
            }],
            requiresUserApproval: false,
          };
        }

        steps.push({
          stepId: nanoid(),
          tool: 'notes',
          action: 'note_create',
          parameters: {
            userId: context.userId,
            ...noteDetails,
          },
          description: `"${noteDetails.title}" notunu oluşturacağım`,
          requiresConfirmation: false,
        });
        break;

      default:
        // General QA - no tool actions needed
        break;
    }

    return {
      planId,
      intent,
      steps,
      requiresUserApproval,
      estimatedDuration: steps.length * 2000, // 2s per step estimate
    };
  }

  async executeToolStep(userId: string, step: ExecutionStep, context: UserContext): Promise<ToolResult> {
    if (step.action === 'clarify') {
      return this.handleClarification(step, context);
    }

    return executeAction(step.action as any, step.parameters, context);
  }

  private handleClarification(step: ExecutionStep, context: UserContext): ToolResult {
    // Determine what clarification is needed based on the step context
    const questions = {
      event_missing_title: "Etkinlik başlığı nedir?",
      event_missing_time: "Hangi tarih ve saatte?",
      event_missing_location: "Nerede yapılacak?",
      task_missing_title: "Görev başlığı nedir?",
      task_missing_due: "Ne zaman tamamlanmalı?",
      note_missing_title: "Not başlığı nedir?",
      note_missing_content: "Not içeriği nedir?",
    };

    return {
      success: false,
      message: "Ek bilgiye ihtiyacım var",
      clarificationNeeded: true,
      clarificationQuestion: questions.event_missing_title, // Default, should be determined by context
    };
  }

  llmSummarize(intent: Intent, context: UserContext, results: ToolResult[], originalMessage: string): string {
    const successfulResults = results.filter(r => r.success);
    const failedResults = results.filter(r => !r.success);

    if (failedResults.length > 0) {
      return `İşlem tamamlanamadı: ${failedResults.map(r => r.message).join(', ')}`;
    }

    switch (intent) {
      case 'email_summary':
        return `E-posta özetiniz hazır: ${successfulResults.length} işlem tamamlandı.`;
      case 'create_event':
        return `Etkinlik başarıyla oluşturuldu ve takvime eklendi.`;
      case 'create_task':
        return `Görev başarıyla oluşturuldu ve görev listenize eklendi.`;
      case 'create_note':
        return `Not başarıyla oluşturuldu ve kaydedildi.`;
      default:
        return `İşlemleriniz tamamlandı: ${successfulResults.length} başarılı.`;
    }
  }

  private extractTimeframe(message: string): 'today' | 'week' | 'month' | null {
    if (/bugün|today/i.test(message)) return 'today';
    if (/hafta|week/i.test(message)) return 'week';
    if (/ay|month/i.test(message)) return 'month';
    return null;
  }

  private extractEventDetails(message: string): any {
    // Simple extraction - in production, use NLP
    const titleMatch = message.match(/toplantı[sı]?\s*["']?([^"'\n]+)["']?/i);
    const timeMatch = message.match(/(\d{1,2}):(\d{2})|(\d{1,2})\s*(saatte?)/i);
    const dateMatch = message.match(/(\d{1,2})\.(\d{1,2})\.(\d{4})|yarın|bugün/i);
    
    return {
      title: titleMatch?.[1]?.trim() || null,
      start: this.parseDateTime(dateMatch, timeMatch),
      end: null, // Will be calculated based on start + 1 hour
      description: null,
      location: null,
    };
  }

  private extractTaskDetails(message: string): any {
    const titleMatch = message.match(/görev[i]?\s*["']?([^"'\n]+)["']?/i) || 
                      message.match(/yapılacak[lar]?\s*["']?([^"'\n]+)["']?/i);
    
    return {
      title: titleMatch?.[1]?.trim() || null,
      description: null,
      dueDate: null,
      priority: 'medium',
    };
  }

  private extractNoteDetails(message: string): any {
    const titleMatch = message.match(/not[u]?\s*["']?([^"'\n]+)["']?/i);
    const contentMatch = message.match(/içerik[i]?\s*["']?([^"'\n]+)["']?/i);
    
    return {
      title: titleMatch?.[1]?.trim() || null,
      content: contentMatch?.[1]?.trim() || null,
      tags: [],
    };
  }

  private parseDateTime(dateMatch: RegExpMatchArray | null, timeMatch: RegExpMatchArray | null): string | null {
    // Simple date/time parsing - in production, use proper date library
    const now = new Date();
    
    if (dateMatch && timeMatch) {
      // Combine date and time
      const hour = parseInt(timeMatch[1] || timeMatch[3]);
      const minute = parseInt(timeMatch[2] || '0');
      
      if (dateMatch[0] === 'bugün') {
        now.setHours(hour, minute, 0, 0);
      } else if (dateMatch[0] === 'yarın') {
        now.setDate(now.getDate() + 1);
        now.setHours(hour, minute, 0, 0);
      }
      
      return now.toISOString();
    }
    
    return null;
  }
}

export const chatOrchestrator = new ChatOrchestrator();