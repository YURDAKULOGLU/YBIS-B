// Core business types
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  preferences?: UserPreferences;
  createdAt: string;
  updatedAt: string;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: string;
  timezone: string;
  notifications: NotificationPreferences;
}

export interface NotificationPreferences {
  email: boolean;
  push: boolean;
  inApp: boolean;
  marketing: boolean;
}

// Chat related types
export interface ChatMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: string;
  metadata?: ChatMessageMetadata;
}

export interface ChatMessageMetadata {
  intent?: string;
  planId?: string;
  requiresConfirmation?: boolean;
  cards?: MessageCard[];
  tools?: ToolUsage[];
}

export interface MessageCard {
  kind: 'event' | 'task' | 'note' | 'email' | 'file';
  payload: any;
  actions?: CardAction[];
}

export interface CardAction {
  id: string;
  label: string;
  type: 'primary' | 'secondary' | 'danger';
  action: string;
}

export interface ToolUsage {
  toolName: string;
  input: any;
  output?: any;
  status: 'pending' | 'running' | 'completed' | 'failed';
  executedAt?: string;
}

// Task related types
export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  dueDate?: string;
  assigneeId?: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface TaskCreate {
  title: string;
  description?: string;
  priority?: 'low' | 'medium' | 'high';
  dueDate?: string;
  assigneeId?: string;
  tags?: string[];
}

export interface TaskUpdate {
  title?: string;
  description?: string;
  priority?: 'low' | 'medium' | 'high';
  status?: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  dueDate?: string;
  assigneeId?: string;
  tags?: string[];
}

export interface TaskListRequest {
  limit?: number;
  offset?: number;
  priority?: 'low' | 'medium' | 'high';
  completed?: boolean;
}

// Note related types
export interface Note {
  id: string;
  title: string;
  content: string;
  tags?: string[];
  folderId?: string;
  isArchived: boolean;
  isStarred: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Folder {
  id: string;
  name: string;
  parentId?: string;
  color?: string;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

// Calendar related types
export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  start: string;
  end: string;
  location?: string;
  attendees?: string[];
  isAllDay: boolean;
  recurrence?: RecurrenceRule;
  calendarId: string;
  createdAt: string;
  updatedAt: string;
}

export interface RecurrenceRule {
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  interval: number;
  until?: string;
  count?: number;
  byWeekDay?: number[];
  byMonthDay?: number[];
}

export interface Calendar {
  id: string;
  name: string;
  color: string;
  isDefault: boolean;
  isVisible: boolean;
  permissions: CalendarPermissions;
}

export interface CalendarPermissions {
  canRead: boolean;
  canWrite: boolean;
  canDelete: boolean;
  canShare: boolean;
}

// Email related types
export interface Email {
  id: string;
  threadId: string;
  subject: string;
  from: EmailAddress;
  to: EmailAddress[];
  cc?: EmailAddress[];
  bcc?: EmailAddress[];
  body: string;
  bodyHtml?: string;
  attachments?: EmailAttachment[];
  labels: string[];
  isRead: boolean;
  isStarred: boolean;
  isImportant: boolean;
  receivedAt: string;
}

export interface EmailAddress {
  email: string;
  name?: string;
}

export interface EmailAttachment {
  id: string;
  filename: string;
  mimeType: string;
  size: number;
  downloadUrl?: string;
}

// API related types
export interface ApiResponse<T = any> {
  ok: boolean;
  data?: T;
  error?: ApiError;
}

export interface ApiError {
  code: string;
  message: string;
  details?: any;
}

export interface PaginationParams {
  limit?: number;
  offset?: number;
  cursor?: string;
}

export interface PaginationResponse<T = any> {
  items: T[];
  pagination: {
    total?: number;
    limit: number;
    offset?: number;
    cursor?: string;
    hasMore: boolean;
  };
}

// Execution plan types
export interface ExecutionPlan {
  id: string;
  title: string;
  description: string;
  steps: PlanStep[];
  status: 'pending' | 'approved' | 'rejected' | 'executing' | 'completed' | 'failed';
  estimatedDuration?: number;
  createdAt: string;
  updatedAt: string;
}

export interface PlanStep {
  id: string;
  title: string;
  description: string;
  toolName: string;
  input: any;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
  output?: any;
  executedAt?: string;
  duration?: number;
}

// Configuration types
export interface AppConfig {
  apiBaseUrl: string;
  environment: 'development' | 'staging' | 'production';
  features: FeatureFlags;
  integrations: IntegrationConfig;
}

export interface FeatureFlags {
  chatEnabled: boolean;
  voiceEnabled: boolean;
  ocrEnabled: boolean;
  calendarIntegration: boolean;
  emailIntegration: boolean;
  notesEnabled: boolean;
  tasksEnabled: boolean;
}

export interface IntegrationConfig {
  gmail: {
    enabled: boolean;
    scopes: string[];
  };
  calendar: {
    enabled: boolean;
    scopes: string[];
  };
  drive: {
    enabled: boolean;
    scopes: string[];
  };
}