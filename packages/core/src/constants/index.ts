// API Constants
export const API_ENDPOINTS = {
  CHAT: '/api/chat',
  GMAIL: {
    SUMMARY: '/api/gmail/summary',
    LIST: '/api/gmail/list',
    SEND: '/api/gmail/send',
  },
  CALENDAR: {
    LIST: '/api/calendar/list',
    CREATE: '/api/calendar/create',
    UPDATE: '/api/calendar/update',
    DELETE: '/api/calendar/delete',
  },
  TASKS: {
    LIST: '/api/tasks/list',
    CREATE: '/api/tasks/create',
    UPDATE: '/api/tasks/update',
    DELETE: '/api/tasks/delete',
    COMPLETE: '/api/tasks/complete',
  },
  NOTES: {
    LIST: '/api/notes/list',
    CREATE: '/api/notes/create',
    UPDATE: '/api/notes/update',
    DELETE: '/api/notes/delete',
  },
  ANALYSIS: '/api/analyze',
  OCR: '/api/ocr',
  VOICE: '/api/voice',
  TRANSFORM: '/api/transform',
  GENERATE: '/api/generate',
  CALCULATE: '/api/calculate',
} as const;

// Error Codes
export const ERROR_CODES = {
  // Authentication errors
  AUTHENTICATION_ERROR: 'AUTHENTICATION_ERROR',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  
  // Validation errors
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INVALID_REQUEST: 'INVALID_REQUEST',
  MISSING_REQUIRED_FIELD: 'MISSING_REQUIRED_FIELD',
  
  // Rate limiting
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  TOO_MANY_REQUESTS: 'TOO_MANY_REQUESTS',
  
  // Resource errors
  NOT_FOUND: 'NOT_FOUND',
  ALREADY_EXISTS: 'ALREADY_EXISTS',
  CONFLICT: 'CONFLICT',
  
  // External service errors
  EXTERNAL_SERVICE_ERROR: 'EXTERNAL_SERVICE_ERROR',
  GMAIL_API_ERROR: 'GMAIL_API_ERROR',
  CALENDAR_API_ERROR: 'CALENDAR_API_ERROR',
  
  // System errors
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
  TIMEOUT: 'TIMEOUT',
  
  // Chat specific errors
  PLAN_NOT_FOUND: 'PLAN_NOT_FOUND',
  PLAN_ALREADY_EXECUTED: 'PLAN_ALREADY_EXECUTED',
  INVALID_PLAN_STATUS: 'INVALID_PLAN_STATUS',
  
  // Idempotency errors
  INVALID_IDEMPOTENCY_KEY: 'INVALID_IDEMPOTENCY_KEY',
  IDEMPOTENCY_CONFLICT: 'IDEMPOTENCY_CONFLICT',
} as const;

// Rate Limiting Constants
export const RATE_LIMITS = {
  CHAT: {
    REQUESTS_PER_WINDOW: 60,
    WINDOW_SECONDS: 600, // 10 minutes
  },
  GMAIL: {
    LIST: { REQUESTS_PER_WINDOW: 100, WINDOW_SECONDS: 600 },
    SEND: { REQUESTS_PER_WINDOW: 10, WINDOW_SECONDS: 600 },
    SUMMARY: { REQUESTS_PER_WINDOW: 100, WINDOW_SECONDS: 600 },
  },
  CALENDAR: {
    LIST: { REQUESTS_PER_WINDOW: 100, WINDOW_SECONDS: 600 },
    CREATE: { REQUESTS_PER_WINDOW: 10, WINDOW_SECONDS: 600 },
    UPDATE: { REQUESTS_PER_WINDOW: 50, WINDOW_SECONDS: 600 },
    DELETE: { REQUESTS_PER_WINDOW: 20, WINDOW_SECONDS: 600 },
  },
  TASKS: {
    LIST: { REQUESTS_PER_WINDOW: 100, WINDOW_SECONDS: 600 },
    CREATE: { REQUESTS_PER_WINDOW: 10, WINDOW_SECONDS: 600 },
    UPDATE: { REQUESTS_PER_WINDOW: 50, WINDOW_SECONDS: 600 },
    DELETE: { REQUESTS_PER_WINDOW: 20, WINDOW_SECONDS: 600 },
    COMPLETE: { REQUESTS_PER_WINDOW: 100, WINDOW_SECONDS: 600 },
  },
} as const;

// Task Priority Mapping
export const TASK_PRIORITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
} as const;

export const TASK_PRIORITY_COLORS = {
  low: '#10b981', // green
  medium: '#f59e0b', // amber
  high: '#ef4444', // red
} as const;

export const TASK_PRIORITY_LABELS = {
  low: 'Low Priority',
  medium: 'Medium Priority',
  high: 'High Priority',
} as const;

// Task Status
export const TASK_STATUS = {
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const;

export const TASK_STATUS_COLORS = {
  pending: '#6b7280', // gray
  in_progress: '#3b82f6', // blue
  completed: '#10b981', // green
  cancelled: '#6b7280', // gray
} as const;

export const TASK_STATUS_LABELS = {
  pending: 'Pending',
  in_progress: 'In Progress',
  completed: 'Completed',
  cancelled: 'Cancelled',
} as const;

// Chat Message Roles
export const CHAT_MESSAGE_ROLES = {
  USER: 'user',
  ASSISTANT: 'assistant',
} as const;

// Plan Status
export const PLAN_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  EXECUTING: 'executing',
  COMPLETED: 'completed',
  FAILED: 'failed',
} as const;

export const PLAN_STATUS_COLORS = {
  pending: '#f59e0b', // amber
  approved: '#10b981', // green
  rejected: '#ef4444', // red
  executing: '#3b82f6', // blue
  completed: '#10b981', // green
  failed: '#ef4444', // red
} as const;

// Theme Constants
export const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system',
} as const;

// Default Pagination
export const DEFAULT_PAGINATION = {
  LIMIT: 20,
  MAX_LIMIT: 100,
  OFFSET: 0,
} as const;

// File Size Limits
export const FILE_LIMITS = {
  MAX_ATTACHMENT_SIZE: 25 * 1024 * 1024, // 25MB
  MAX_IMAGE_SIZE: 10 * 1024 * 1024, // 10MB
  MAX_DOCUMENT_SIZE: 50 * 1024 * 1024, // 50MB
} as const;

// Supported File Types
export const SUPPORTED_FILE_TYPES = {
  IMAGES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  DOCUMENTS: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'text/csv',
  ],
  SPREADSHEETS: [
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ],
} as const;

// Environment Types
export const ENVIRONMENTS = {
  DEVELOPMENT: 'development',
  STAGING: 'staging',
  PRODUCTION: 'production',
} as const;

// Cache Keys
export const CACHE_KEYS = {
  USER_PREFERENCES: 'user_preferences',
  CHAT_MESSAGES: 'chat_messages',
  TASKS: 'tasks',
  NOTES: 'notes',
  CALENDAR_EVENTS: 'calendar_events',
  GMAIL_MESSAGES: 'gmail_messages',
} as const;

// Cache TTL (Time To Live) in seconds
export const CACHE_TTL = {
  SHORT: 300, // 5 minutes
  MEDIUM: 1800, // 30 minutes
  LONG: 3600, // 1 hour
  VERY_LONG: 86400, // 24 hours
} as const;

// Google OAuth Scopes
export const GOOGLE_SCOPES = {
  GMAIL: [
    'https://www.googleapis.com/auth/gmail.readonly',
    'https://www.googleapis.com/auth/gmail.send',
    'https://www.googleapis.com/auth/gmail.modify',
  ],
  CALENDAR: [
    'https://www.googleapis.com/auth/calendar',
    'https://www.googleapis.com/auth/calendar.events',
  ],
  DRIVE: [
    'https://www.googleapis.com/auth/drive.file',
    'https://www.googleapis.com/auth/drive.readonly',
  ],
} as const;

// Tool Names (for chat orchestrator)
export const TOOL_NAMES = {
  GMAIL_SEND: 'gmail_send',
  GMAIL_LIST: 'gmail_list',
  GMAIL_SUMMARY: 'gmail_summary',
  CALENDAR_CREATE: 'calendar_create',
  CALENDAR_LIST: 'calendar_list',
  CALENDAR_UPDATE: 'calendar_update',
  CALENDAR_DELETE: 'calendar_delete',
  TASK_CREATE: 'task_create',
  TASK_LIST: 'task_list',
  TASK_UPDATE: 'task_update',
  TASK_DELETE: 'task_delete',
  TASK_COMPLETE: 'task_complete',
  NOTE_CREATE: 'note_create',
  NOTE_LIST: 'note_list',
  NOTE_UPDATE: 'note_update',
  NOTE_DELETE: 'note_delete',
  ANALYZE_TEXT: 'analyze_text',
  OCR_IMAGE: 'ocr_image',
  VOICE_TRANSCRIBE: 'voice_transcribe',
  TRANSFORM_TEXT: 'transform_text',
  GENERATE_CONTENT: 'generate_content',
  CALCULATE_EXPRESSION: 'calculate_expression',
} as const;

export type ToolName = typeof TOOL_NAMES[keyof typeof TOOL_NAMES];