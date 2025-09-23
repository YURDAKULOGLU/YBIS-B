export type MessageRole = 'user' | 'assistant' | 'system';

export interface MessageMetadata extends Record<string, unknown> {
  intent?: string;
  planId?: string;
  requiresConfirmation?: boolean;
  cards?: MessageCard[];
  tools?: ToolUsage[];
}

export interface CardAction {
  id: string;
  label: string;
  type: 'primary' | 'secondary' | 'danger';
  action: string;
}

export interface MessageCard {
  kind: 'event' | 'task' | 'note' | 'email' | 'file';
  payload: unknown;
  actions?: CardAction[];
}

export interface ToolUsage {
  toolName: string;
  input: unknown;
  output?: unknown;
  status: 'pending' | 'running' | 'completed' | 'failed';
  executedAt?: string;
}

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: number;
  metadata?: MessageMetadata;
}

export type ChatMessage = Message;
