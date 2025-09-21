import { z } from 'zod';

export const UserContextSchema = z.object({
  userId: z.string(),
  preferences: z.record(z.string(), z.unknown()).optional(),
  recentItems: z.array(z.unknown()).optional(),
  timezone: z.string().default('Europe/Istanbul'),
  language: z.string().default('tr'),
});

export const ToolResultSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: z.unknown().optional(),
  clarificationNeeded: z.boolean().default(false),
  clarificationQuestion: z.string().optional(),
  elapsedMs: z.number().optional(),
});

export const ExecutionStepSchema = z.object({
  stepId: z.string(),
  tool: z.string(),
  action: z.string(),
  parameters: z.record(z.string(), z.unknown()),
  description: z.string(),
  requiresConfirmation: z.boolean().default(false),
});

export const ExecutionPlanSchema = z.object({
  planId: z.string(),
  intent: z.string(),
  steps: z.array(ExecutionStepSchema),
  requiresUserApproval: z.boolean().default(false),
  estimatedDuration: z.number().optional(),
});

export type UserContext = z.infer<typeof UserContextSchema>;
export type ToolResult = z.infer<typeof ToolResultSchema>;
export type ExecutionStep = z.infer<typeof ExecutionStepSchema>;
export type ExecutionPlan = z.infer<typeof ExecutionPlanSchema>;