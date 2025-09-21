import { AxiosRequestConfig } from 'axios';

export interface ApiClientConfig {
  baseURL: string;
  timeout?: number;
  headers?: Record<string, string>;
  retries?: number;
  retryDelay?: number;
}

export interface RequestOptions extends Omit<AxiosRequestConfig, 'url' | 'method' | 'data'> {
  idempotencyKey?: string;
  skipAuth?: boolean;
  retries?: number;
  retryDelay?: number;
}

export interface ApiError {
  code: string;
  message: string;
  details?: any;
  status?: number;
}

export interface ApiResponse<T = any> {
  ok: boolean;
  data?: T;
  error?: ApiError;
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

export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: number;
  tokenType?: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  tokens?: AuthTokens;
  user?: {
    id: string;
    email: string;
    name: string;
  };
}

// Chat related types
export interface ChatSendRequest {
  message: string;
  userId: string;
  context?: Record<string, any>;
}

export interface ChatConfirmRequest {
  planId: string;
  confirmExecution: boolean;
  userId: string;
}

export interface ChatResponse {
  response: string;
  intent?: string;
  planId?: string;
  requiresConfirmation?: boolean;
  metadata?: any;
}

// Gmail related types
export interface GmailListRequest {
  maxResults?: number;
  query?: string;
  labelIds?: string[];
  pageToken?: string;
}

export interface GmailSummaryRequest {
  maxResults?: number;
  query?: string;
}

export interface GmailSendRequest {
  to: string[];
  subject: string;
  body: string;
  cc?: string[];
  bcc?: string[];
  attachments?: Array<{
    filename: string;
    content: string;
    mimeType: string;
  }>;
}

// Calendar related types
export interface CalendarListRequest {
  timeMin?: string;
  timeMax?: string;
  maxResults?: number;
  calendarId?: string;
}

export interface CalendarCreateRequest {
  title: string;
  start: string;
  end: string;
  description?: string;
  location?: string;
  attendees?: string[];
  calendarId?: string;
}

export interface CalendarUpdateRequest {
  eventId: string;
  title?: string;
  start?: string;
  end?: string;
  description?: string;
  location?: string;
  attendees?: string[];
  calendarId?: string;
}

export interface CalendarDeleteRequest {
  eventId: string;
  calendarId?: string;
}

// Tasks related types
export interface TaskListRequest {
  limit?: number;
  offset?: number;
  priority?: 'low' | 'medium' | 'high';
  completed?: boolean;
}

export interface TaskCreateRequest {
  title: string;
  description?: string;
  priority?: 'low' | 'medium' | 'high';
  dueDate?: string;
}

export interface TaskUpdateRequest {
  taskId: string;
  title?: string;
  description?: string;
  priority?: 'low' | 'medium' | 'high';
  dueDate?: string;
}

export interface TaskDeleteRequest {
  taskId: string;
}

export interface TaskCompleteRequest {
  taskId: string;
  completed: boolean;
}

// Notes related types
export interface NoteListRequest {
  limit?: number;
  offset?: number;
  folderId?: string;
  tags?: string[];
  search?: string;
}

export interface NoteCreateRequest {
  title: string;
  content: string;
  tags?: string[];
  folderId?: string;
}

export interface NoteUpdateRequest {
  noteId: string;
  title?: string;
  content?: string;
  tags?: string[];
  folderId?: string;
  isArchived?: boolean;
  isStarred?: boolean;
}

export interface NoteDeleteRequest {
  noteId: string;
}

// Analysis related types
export interface AnalyzeTextRequest {
  text: string;
  analysisType?: 'sentiment' | 'entities' | 'keywords' | 'summary' | 'all';
}

// OCR related types
export interface OCRRequest {
  imageData: string; // base64 encoded image
  language?: string;
  outputFormat?: 'text' | 'json';
}

// Voice related types
export interface VoiceTranscribeRequest {
  audioData: string; // base64 encoded audio
  language?: string;
  format?: 'wav' | 'mp3' | 'ogg';
}

// Transform related types
export interface TransformTextRequest {
  text: string;
  transformType: 'translate' | 'summarize' | 'rewrite' | 'format';
  options?: {
    targetLanguage?: string;
    style?: string;
    maxLength?: number;
  };
}

// Generate related types
export interface GenerateContentRequest {
  prompt: string;
  contentType: 'email' | 'document' | 'response' | 'creative';
  options?: {
    tone?: string;
    length?: 'short' | 'medium' | 'long';
    format?: string;
  };
}

// Calculate related types
export interface CalculateRequest {
  expression: string;
  precision?: number;
  unit?: string;
}