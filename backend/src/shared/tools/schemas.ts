import { z } from 'zod';

// Zod v4 - New features and syntax
// Base tool schemas with enhanced validation
export const BaseToolInputSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
}).strict(); // Zod v4 strict mode

export const BaseToolOutputSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: z.unknown().optional(), // Zod v4: unknown instead of any
  clarificationNeeded: z.boolean().default(false),
  clarificationQuestion: z.string().optional(),
  timestamp: z.string().datetime().optional(), // Zod v4 datetime validation
}).strict();

// Gmail schemas with Zod v4 enhancements
export const GmailSendSchema = z.object({
  to: z.string().email("Invalid email format"),
  subject: z.string().min(1, "Subject is required"),
  body: z.string().min(1, "Body is required"),
  cc: z.array(z.string().email()).optional().default([]),
  bcc: z.array(z.string().email()).optional().default([]),
}).merge(BaseToolInputSchema).strict();

export const GmailSearchSchema = z.object({
  query: z.string().min(1, "Search query is required"),
  maxResults: z.number().int().positive().max(100).default(10),
}).merge(BaseToolInputSchema).strict();

export const GmailSummarySchema = z.object({
  query: z.string().optional(),
  timeframe: z.enum(['today', 'week', 'month']).default('today'),
  maxEmails: z.number().int().positive().max(50).default(20),
}).merge(BaseToolInputSchema).strict();

// Calendar schemas with Zod v4 datetime validation
export const CalendarCreateEventSchema = z.object({
  title: z.string().min(1, "Event title is required").max(200),
  start: z.string().datetime("Invalid start datetime format"),
  end: z.string().datetime("Invalid end datetime format"),
  description: z.string().max(1000).optional(),
  location: z.string().max(200).optional(),
  attendees: z.array(z.string().email()).optional().default([]),
}).merge(BaseToolInputSchema).strict()
  .refine(data => new Date(data.end) > new Date(data.start), {
    message: "End time must be after start time",
    path: ["end"],
  });

export const CalendarListEventsSchema = z.object({
  timeMin: z.string().datetime().optional(),
  timeMax: z.string().datetime().optional(),
  maxResults: z.number().int().positive().max(100).default(10),
}).merge(BaseToolInputSchema).strict()
  .refine(data => {
    if (data.timeMin && data.timeMax) {
      return new Date(data.timeMax) > new Date(data.timeMin);
    }
    return true;
  }, {
    message: "timeMax must be after timeMin",
    path: ["timeMax"],
  });

// Tasks schemas with priority validation
export const TaskCreateSchema = z.object({
  title: z.string().min(1, "Task title is required").max(200),
  description: z.string().max(1000).optional(),
  dueDate: z.string().datetime().optional(),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  tags: z.array(z.string().max(50)).optional().default([]),
}).merge(BaseToolInputSchema).strict();

export const TaskListSchema = z.object({
  status: z.enum(['pending', 'completed', 'all']).default('pending'),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  maxResults: z.number().int().positive().max(100).default(20),
}).merge(BaseToolInputSchema).strict();

// Notes schemas with content validation
export const NoteCreateSchema = z.object({
  title: z.string().min(1, "Note title is required").max(200),
  content: z.string().min(1, "Note content is required").max(10000),
  tags: z.array(z.string().max(50)).optional().default([]),
  category: z.string().max(100).optional(),
}).merge(BaseToolInputSchema).strict();

export const NoteSearchSchema = z.object({
  query: z.string().min(1, "Search query is required"),
  tags: z.array(z.string()).optional(),
  category: z.string().optional(),
  maxResults: z.number().int().positive().max(50).default(10),
}).merge(BaseToolInputSchema).strict();

// Analysis schemas with enhanced validation
export const AnalyzeTextSchema = z.object({
  text: z.string().min(10, "Text must be at least 10 characters").max(50000),
  type: z.enum(['sentiment', 'keywords', 'summary', 'entities']),
  language: z.string().regex(/^[a-z]{2}$/, "Language must be 2-letter code").default('tr'),
  options: z.object({
    maxKeywords: z.number().int().positive().max(50).optional(),
    summaryLength: z.number().int().positive().max(10).optional(),
  }).optional(),
}).merge(BaseToolInputSchema).strict();

// Calculate schemas with expression validation
export const CalculateSchema = z.object({
  expression: z.string()
    .min(1, "Expression is required")
    .regex(/^[0-9+\-*/().\s]+$/, "Expression contains invalid characters"),
  variables: z.record(z.string(), z.number()).optional(),
}).merge(BaseToolInputSchema).strict();

// Generate schemas with enhanced options
export const GenerateContentSchema = z.object({
  prompt: z.string().min(10, "Prompt must be at least 10 characters").max(1000),
  type: z.enum(['text', 'summary', 'email', 'note']),
  length: z.number().int().positive().min(50).max(2000).default(100),
  language: z.string().regex(/^[a-z]{2}$/, "Language must be 2-letter code").default('tr'),
  style: z.enum(['formal', 'casual', 'professional', 'creative']).optional(),
}).merge(BaseToolInputSchema).strict();

// Transform schemas with operation validation
export const TransformTextSchema = z.object({
  input: z.string().min(1, "Input text is required").max(10000),
  operation: z.enum(['translate', 'format', 'clean', 'extract']),
  targetLanguage: z.string().regex(/^[a-z]{2}$/, "Target language must be 2-letter code").optional(),
  format: z.string().max(50).optional(),
  options: z.object({
    preserveFormatting: z.boolean().default(true),
    removeEmptyLines: z.boolean().default(false),
  }).optional(),
}).merge(BaseToolInputSchema).strict();

// Zod v4 - Enhanced tool action mapping with discriminated unions
export const ToolSchemas = {
  // Gmail actions
  'gmail_send': GmailSendSchema,
  'gmail_search': GmailSearchSchema,
  'gmail_summary': GmailSummarySchema,
  
  // Calendar actions
  'calendar_create_event': CalendarCreateEventSchema,
  'calendar_list_events': CalendarListEventsSchema,
  
  // Tasks actions
  'task_create': TaskCreateSchema,
  'task_list': TaskListSchema,
  
  // Notes actions
  'note_create': NoteCreateSchema,
  'note_search': NoteSearchSchema,
  
  // Analysis actions
  'analyze_text': AnalyzeTextSchema,
  
  // Calculate actions
  'calculate': CalculateSchema,
  
  // Generate actions
  'generate_content': GenerateContentSchema,
  
  // Transform actions
  'transform_text': TransformTextSchema,
} as const;

// Zod v4 enhanced types with better inference
export type ToolAction = keyof typeof ToolSchemas;
export type ToolInputFor<T extends ToolAction> = z.infer<typeof ToolSchemas[T]>;
export type ToolOutput = z.infer<typeof BaseToolOutputSchema>;

// Zod v4 - Runtime validation helpers
export function validateToolInput<T extends ToolAction>(
  action: T,
  input: unknown
): ToolInputFor<T> {
  const schema = ToolSchemas[action];
  const result = schema.safeParse(input);
  
  if (!result.success) {
    throw new Error(`Validation failed for ${action}: ${result.error.message}`);
  }
  
  return result.data as ToolInputFor<T>;
}

export function createToolOutput(
  success: boolean,
  message: string,
  data?: unknown,
  clarificationNeeded = false,
  clarificationQuestion?: string
): ToolOutput {
  return BaseToolOutputSchema.parse({
    success,
    message,
    data,
    clarificationNeeded,
    clarificationQuestion,
    timestamp: new Date().toISOString(),
  });
}

// API Response helpers
export function Ok<T>(data: T) {
  return {
    ok: true,
    data,
  };
}

export function Err(code: string, message: string, details?: any) {
  return {
    ok: false,
    error: {
      code,
      message,
      details,
    },
  };
}