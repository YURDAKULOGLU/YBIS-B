import { z } from 'zod';

// Base schemas
export const EmailAddressSchema = z.object({
  email: z.string().email(),
  name: z.string().optional(),
});

export const PaginationParamsSchema = z.object({
  limit: z.number().int().positive().max(100).default(20),
  offset: z.number().int().min(0).default(0),
  cursor: z.string().optional(),
});

export const ApiResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    ok: z.literal(true),
    data: dataSchema,
  }).or(z.object({
    ok: z.literal(false),
    error: z.object({
      code: z.string(),
      message: z.string(),
      details: z.any().optional(),
    }),
  }));

// User schemas
export const UserPreferencesSchema = z.object({
  theme: z.enum(['light', 'dark', 'system']).default('system'),
  language: z.string().default('en'),
  timezone: z.string().default('UTC'),
  notifications: z.object({
    email: z.boolean().default(true),
    push: z.boolean().default(true),
    inApp: z.boolean().default(true),
    marketing: z.boolean().default(false),
  }),
});

export const UserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string().min(1).max(100),
  avatar: z.string().url().optional(),
  preferences: UserPreferencesSchema.optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

// Chat schemas
export const MessageCardSchema = z.object({
  kind: z.enum(['event', 'task', 'note', 'email', 'file']),
  payload: z.any(),
  actions: z.array(z.object({
    id: z.string(),
    label: z.string(),
    type: z.enum(['primary', 'secondary', 'danger']),
    action: z.string(),
  })).optional(),
});

export const ToolUsageSchema = z.object({
  toolName: z.string(),
  input: z.any(),
  output: z.any().optional(),
  status: z.enum(['pending', 'running', 'completed', 'failed']),
  executedAt: z.string().datetime().optional(),
});

export const ChatMessageMetadataSchema = z.object({
  intent: z.string().optional(),
  planId: z.string().optional(),
  requiresConfirmation: z.boolean().optional(),
  cards: z.array(MessageCardSchema).optional(),
  tools: z.array(ToolUsageSchema).optional(),
});

export const ChatMessageSchema = z.object({
  id: z.string(),
  content: z.string().min(1).max(10000),
  role: z.enum(['user', 'assistant']),
  timestamp: z.string().datetime(),
  metadata: ChatMessageMetadataSchema.optional(),
});

// Task schemas
export const TaskSchema = z.object({
  id: z.string(),
  title: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  priority: z.enum(['low', 'medium', 'high']),
  status: z.enum(['pending', 'in_progress', 'completed', 'cancelled']),
  dueDate: z.string().datetime().optional(),
  assigneeId: z.string().optional(),
  tags: z.array(z.string()).optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const TaskCreateSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  dueDate: z.string().datetime().optional(),
  assigneeId: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

export const TaskUpdateSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(1000).optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  status: z.enum(['pending', 'in_progress', 'completed', 'cancelled']).optional(),
  dueDate: z.string().datetime().optional(),
  assigneeId: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

// Note schemas
export const NoteSchema = z.object({
  id: z.string(),
  title: z.string().min(1).max(200),
  content: z.string().max(50000),
  tags: z.array(z.string()).optional(),
  folderId: z.string().optional(),
  isArchived: z.boolean().default(false),
  isStarred: z.boolean().default(false),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const NoteCreateSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().max(50000),
  tags: z.array(z.string()).optional(),
  folderId: z.string().optional(),
});

export const NoteUpdateSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  content: z.string().max(50000).optional(),
  tags: z.array(z.string()).optional(),
  folderId: z.string().optional(),
  isArchived: z.boolean().optional(),
  isStarred: z.boolean().optional(),
});

// Calendar schemas
export const RecurrenceRuleSchema = z.object({
  frequency: z.enum(['daily', 'weekly', 'monthly', 'yearly']),
  interval: z.number().int().positive(),
  until: z.string().datetime().optional(),
  count: z.number().int().positive().optional(),
  byWeekDay: z.array(z.number().int().min(0).max(6)).optional(),
  byMonthDay: z.array(z.number().int().min(1).max(31)).optional(),
});

export const CalendarEventSchema = z.object({
  id: z.string(),
  title: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  start: z.string().datetime(),
  end: z.string().datetime(),
  location: z.string().max(200).optional(),
  attendees: z.array(z.string().email()).optional(),
  isAllDay: z.boolean().default(false),
  recurrence: RecurrenceRuleSchema.optional(),
  calendarId: z.string(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
}).refine(data => new Date(data.end) > new Date(data.start), {
  message: "End time must be after start time",
  path: ["end"],
});

export const CalendarEventCreateSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  start: z.string().datetime(),
  end: z.string().datetime(),
  location: z.string().max(200).optional(),
  attendees: z.array(z.string().email()).optional(),
  isAllDay: z.boolean().default(false),
  recurrence: RecurrenceRuleSchema.optional(),
  calendarId: z.string().default('primary'),
}).refine(data => new Date(data.end) > new Date(data.start), {
  message: "End time must be after start time",
  path: ["end"],
});

// Email schemas
export const EmailAttachmentSchema = z.object({
  id: z.string(),
  filename: z.string(),
  mimeType: z.string(),
  size: z.number().int().positive(),
  downloadUrl: z.string().url().optional(),
});

export const EmailSchema = z.object({
  id: z.string(),
  threadId: z.string(),
  subject: z.string().max(500),
  from: EmailAddressSchema,
  to: z.array(EmailAddressSchema),
  cc: z.array(EmailAddressSchema).optional(),
  bcc: z.array(EmailAddressSchema).optional(),
  body: z.string(),
  bodyHtml: z.string().optional(),
  attachments: z.array(EmailAttachmentSchema).optional(),
  labels: z.array(z.string()),
  isRead: z.boolean(),
  isStarred: z.boolean(),
  isImportant: z.boolean(),
  receivedAt: z.string().datetime(),
});

export const EmailSendSchema = z.object({
  to: z.array(z.string().email()).min(1),
  subject: z.string().min(1).max(500),
  body: z.string().min(1),
  cc: z.array(z.string().email()).optional(),
  bcc: z.array(z.string().email()).optional(),
  attachments: z.array(z.object({
    filename: z.string(),
    content: z.string(), // base64 encoded
    mimeType: z.string(),
  })).optional(),
});

// Execution plan schemas
export const PlanStepSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  toolName: z.string(),
  input: z.any(),
  status: z.enum(['pending', 'running', 'completed', 'failed', 'skipped']),
  output: z.any().optional(),
  executedAt: z.string().datetime().optional(),
  duration: z.number().optional(),
});

export const ExecutionPlanSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  steps: z.array(PlanStepSchema),
  status: z.enum(['pending', 'approved', 'rejected', 'executing', 'completed', 'failed']),
  estimatedDuration: z.number().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

// Note: Inferred types are exported from ./types/index.ts to avoid duplication