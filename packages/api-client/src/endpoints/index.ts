import { YBISApiClient } from '../client';
import { ApiResponse } from '../types';
import { ChatEndpoints } from './chat';
import { GmailEndpoints } from './gmail';
import { CalendarEndpoints } from './calendar';
import { TasksEndpoints } from './tasks';
import { NotesEndpoints } from './notes';
import { AnalysisEndpoints } from './analysis';
import { OCREndpoints } from './ocr';
import { VoiceEndpoints } from './voice';
import { TransformEndpoints } from './transform';
import { GenerateEndpoints } from './generate';
import { CalculateEndpoints } from './calculate';

export class YBISApiEndpoints {
  public chat: ChatEndpoints;
  public gmail: GmailEndpoints;
  public calendar: CalendarEndpoints;
  public tasks: TasksEndpoints;
  public notes: NotesEndpoints;
  public analysis: AnalysisEndpoints;
  public ocr: OCREndpoints;
  public voice: VoiceEndpoints;
  public transform: TransformEndpoints;
  public generate: GenerateEndpoints;
  public calculate: CalculateEndpoints;

  constructor(private client: YBISApiClient) {
    this.chat = new ChatEndpoints(client);
    this.gmail = new GmailEndpoints(client);
    this.calendar = new CalendarEndpoints(client);
    this.tasks = new TasksEndpoints(client);
    this.notes = new NotesEndpoints(client);
    this.analysis = new AnalysisEndpoints(client);
    this.ocr = new OCREndpoints(client);
    this.voice = new VoiceEndpoints(client);
    this.transform = new TransformEndpoints(client);
    this.generate = new GenerateEndpoints(client);
    this.calculate = new CalculateEndpoints(client);
  }

  // Auth endpoints
  public async login(email: string, password: string): Promise<ApiResponse<{ tokens: any; user: any }>> {
    return this.client.post('/auth/login', { email, password }, { skipAuth: true });
  }

  public async register(email: string, password: string, name: string): Promise<ApiResponse<{ tokens: any; user: any }>> {
    return this.client.post('/auth/register', { email, password, name }, { skipAuth: true });
  }

  public async logout(): Promise<ApiResponse<{ success: boolean }>> {
    const response = await this.client.post('/auth/logout');
    if (response.ok) {
      this.client.clearAuth();
    }
    return response as ApiResponse<{ success: boolean }>;
  }

  public async refreshToken(): Promise<ApiResponse<{ tokens: any }>> {
    return this.client.post('/auth/refresh');
  }

  public async getProfile(): Promise<ApiResponse<any>> {
    return this.client.get('/auth/profile');
  }

  public async updateProfile(data: any): Promise<ApiResponse<any>> {
    return this.client.put('/auth/profile', data);
  }

  // Google OAuth endpoints
  public async getGoogleAuthUrl(): Promise<ApiResponse<{ authUrl: string }>> {
    return this.client.get('/auth/google/url');
  }

  public async handleGoogleCallback(code: string): Promise<ApiResponse<{ tokens: any }>> {
    return this.client.post('/auth/google/callback', { code });
  }

  public async disconnectGoogle(): Promise<ApiResponse<{ success: boolean }>> {
    return this.client.post('/auth/google/disconnect');
  }
}

// Export all endpoint classes
export * from './chat';
export * from './gmail';
export * from './calendar';
export * from './tasks';
export * from './notes';
export * from './analysis';
export * from './ocr';
export * from './voice';
export * from './transform';
export * from './generate';
export * from './calculate';