import { Hono, Context } from 'hono';
import { z } from 'zod';
import { nanoid } from 'nanoid';
import { chatOrchestrator } from '../src/shared/planner/plan';
import { UserContextSchema, ToolResult } from '../src/shared/tools/types';
import { errorToUserMessage } from '../src/shared/errors';
import { rateLimit, idempotency, telemetry } from '../src/shared/middleware';

const app = new Hono();

// Apply middleware
app.use('*', telemetry());
app.use('*', rateLimit(20, 60000)); // 20 requests per minute
app.use('*', idempotency());

// API Envelope schemas
const OkResponseSchema = z.object({
  ok: z.literal(true),
  meta: z.object({
    requestId: z.string(),
    elapsedMs: z.number(),
  }),
  data: z.unknown(),
});

const ErrorResponseSchema = z.object({
  ok: z.literal(false),
  meta: z.object({
    requestId: z.string(),
    elapsedMs: z.number(),
  }),
  error: z.object({
    code: z.string(),
    message: z.string(),
    hint: z.string().optional(),
  }),
});

// Request schemas
const ChatRequestSchema = z.object({
  message: z.string().min(1),
  userId: z.string().min(1),
  context: z.object({
    preferences: z.record(z.string(), z.unknown()).optional(),
    recentItems: z.array(z.unknown()).optional(),
  }).optional(),
  planId: z.string().optional(), // For continuing execution of a plan
  confirmExecution: z.boolean().optional(), // User confirmation for plan execution
});

const ChatResponseSchema = z.object({
  response: z.string(),
  intent: z.string(),
  planId: z.string().optional(),
  requiresConfirmation: z.boolean().default(false),
  executionPlan: z.object({
    steps: z.array(z.object({
      stepId: z.string(),
      tool: z.string(),
      action: z.string(),
      description: z.string(),
      requiresConfirmation: z.boolean(),
    })),
    estimatedDuration: z.number(),
  }).optional(),
  clarificationNeeded: z.boolean().default(false),
  clarificationQuestion: z.string().optional(),
  timestamp: z.string(),
});

// In-memory plan storage (in production, use Redis/DB)
const activePlans = new Map<string, any>();

app.post('/', async (c: Context) => {
  const startTime = Date.now();
  const requestId = nanoid();
  
  try {
    const body = await c.req.json();
    const validatedRequest = ChatRequestSchema.parse(body);
    const { message, userId, context, planId, confirmExecution } = validatedRequest;
    
    // Enrich user context
    const userContext = chatOrchestrator.enrichContext(userId, context);
    
    // Handle plan execution confirmation
    if (planId && confirmExecution !== undefined) {
      const plan = activePlans.get(planId);
      if (!plan) {
        const elapsedMs = Date.now() - startTime;
        return c.json(ErrorResponseSchema.parse({
          ok: false,
          meta: { requestId, elapsedMs },
          error: {
            code: 'PLAN_NOT_FOUND',
            message: 'Plan not found or expired',
            hint: 'Please try your request again'
          }
        }), 404);
      }
      
      if (!confirmExecution) {
        // User rejected the plan
        activePlans.delete(planId);
        const elapsedMs = Date.now() - startTime;
        return c.json(OkResponseSchema.parse({
          ok: true,
          meta: { requestId, elapsedMs },
          data: ChatResponseSchema.parse({
            response: "Tamam, işlemi iptal ettim. Başka nasıl yardımcı olabilirim?",
            intent: plan.intent,
            timestamp: new Date().toISOString(),
          })
        }));
      }
      
      // Execute the confirmed plan
      const results: ToolResult[] = [];
      let hasErrors = false;
      let clarificationNeeded = false;
      let clarificationQuestion = '';
      
      for (const step of plan.steps) {
        const result = await chatOrchestrator.executeToolStep(userId, step, userContext);
        results.push(result);
        
        if (!result.success) {
          hasErrors = true;
          if (result.clarificationNeeded && result.clarificationQuestion) {
            clarificationNeeded = true;
            clarificationQuestion = result.clarificationQuestion;
            break; // Stop execution on clarification needed
          }
        }
      }
      
      // Clean up plan after execution
      activePlans.delete(planId);
      
      if (clarificationNeeded) {
        const elapsedMs = Date.now() - startTime;
        return c.json(OkResponseSchema.parse({
          ok: true,
          meta: { requestId, elapsedMs },
          data: ChatResponseSchema.parse({
            response: "İşlem sırasında ek bilgiye ihtiyacım var:",
            intent: plan.intent,
            clarificationNeeded: true,
            clarificationQuestion,
            timestamp: new Date().toISOString(),
          })
        }));
      }
      
      const summaryResponse = chatOrchestrator.llmSummarize(
        plan.intent,
        userContext,
        results,
        message
      );
      
      const elapsedMs = Date.now() - startTime;
      return c.json(OkResponseSchema.parse({
        ok: true,
        meta: { requestId, elapsedMs },
        data: ChatResponseSchema.parse({
          response: summaryResponse,
          intent: plan.intent,
          timestamp: new Date().toISOString(),
        })
      }));
    }
    
    // 1. Detect Intent
    const intent = chatOrchestrator.detectIntent(message);
    
    // 2. Generate Plan
    const executionPlan = await chatOrchestrator.llmPlan(intent, userContext, message);
    
    // 3. Handle different scenarios
    if (executionPlan.steps.length === 0) {
      // No tool actions needed - direct response for general QA
      const elapsedMs = Date.now() - startTime;
      return c.json(OkResponseSchema.parse({
        ok: true,
        meta: { requestId, elapsedMs },
        data: ChatResponseSchema.parse({
          response: "Bu konuda size nasıl yardımcı olabilirim? Lütfen daha spesifik bir talep belirtin.",
          intent: intent,
          timestamp: new Date().toISOString(),
        })
      }));
    }
    
    if (executionPlan.requiresUserApproval) {
      // Store plan and ask for confirmation
      activePlans.set(executionPlan.planId, executionPlan);
      
      const stepDescriptions = executionPlan.steps.map(step => `• ${step.description}`).join('\n');
      const confirmationMessage = `Aşağıdaki işlemleri yapmak istiyorum:\n\n${stepDescriptions}\n\nOnaylıyor musunuz? (Evet/Hayır)`;
      
      const elapsedMs = Date.now() - startTime;
      return c.json(OkResponseSchema.parse({
        ok: true,
        meta: { requestId, elapsedMs },
        data: ChatResponseSchema.parse({
          response: confirmationMessage,
          intent: intent,
          planId: executionPlan.planId,
          requiresConfirmation: true,
          executionPlan: {
            steps: executionPlan.steps.map(step => ({
              stepId: step.stepId,
              tool: step.tool,
              action: step.action,
              description: step.description,
              requiresConfirmation: step.requiresConfirmation,
            })),
            estimatedDuration: executionPlan.estimatedDuration || 0,
          },
          timestamp: new Date().toISOString(),
        })
      }));
    }
    
    // 4. Execute plan immediately (for safe operations)
    const results: ToolResult[] = [];
    let clarificationNeeded = false;
    let clarificationQuestion = '';
    
    for (const step of executionPlan.steps) {
      const result = await chatOrchestrator.executeToolStep(userId, step, userContext);
      results.push(result);
      
      if (!result.success && result.clarificationNeeded && result.clarificationQuestion) {
        clarificationNeeded = true;
        clarificationQuestion = result.clarificationQuestion;
        break; // Stop on first clarification needed
      }
    }
    
    if (clarificationNeeded) {
      const elapsedMs = Date.now() - startTime;
      return c.json(OkResponseSchema.parse({
        ok: true,
        meta: { requestId, elapsedMs },
        data: ChatResponseSchema.parse({
          response: "İşleminizi tamamlamak için ek bilgiye ihtiyacım var:",
          intent: intent,
          clarificationNeeded: true,
          clarificationQuestion,
          timestamp: new Date().toISOString(),
        })
      }));
    }
    
    // 5. Summarize results
    const summaryResponse = chatOrchestrator.llmSummarize(
      intent,
      userContext,
      results,
      message
    );
    
    const elapsedMs = Date.now() - startTime;
    return c.json(OkResponseSchema.parse({
      ok: true,
      meta: { requestId, elapsedMs },
      data: ChatResponseSchema.parse({
        response: summaryResponse,
        intent: intent,
        timestamp: new Date().toISOString(),
      })
    }));
    
   } catch (error) {
     const elapsedMs = Date.now() - startTime;
     const userError = errorToUserMessage(error);
     
     console.error('Chat orchestrator error:', error);
     
     const statusCode = error instanceof z.ZodError ? 400 : 500;
     
     return c.json(ErrorResponseSchema.parse({
       ok: false,
       meta: { requestId, elapsedMs },
       error: userError,
     }), statusCode);
   }
});

// Health check endpoint
app.get('/health', (c: Context) => {
  return c.json({
    ok: true,
    service: 'chat-orchestrator',
    status: 'healthy',
    timestamp: new Date().toISOString(),
  });
});

export default app;
