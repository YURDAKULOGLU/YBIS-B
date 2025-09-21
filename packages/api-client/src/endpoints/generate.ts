import { YBISApiClient } from '../client';
import { ApiResponse, GenerateContentRequest } from '../types';

export class GenerateEndpoints {
  constructor(private client: YBISApiClient) {}

  public async generateContent(request: GenerateContentRequest): Promise<ApiResponse<any>> {
    return this.client.post('/api/generate', request);
  }

  public async generateEmail(prompt: string, tone?: string): Promise<ApiResponse<any>> {
    return this.client.post('/api/generate', {
      prompt,
      contentType: 'email',
      options: { tone },
    });
  }

  public async generateDocument(prompt: string, length?: 'short' | 'medium' | 'long'): Promise<ApiResponse<any>> {
    return this.client.post('/api/generate', {
      prompt,
      contentType: 'document',
      options: { length },
    });
  }

  public async generateResponse(prompt: string, tone?: string): Promise<ApiResponse<any>> {
    return this.client.post('/api/generate', {
      prompt,
      contentType: 'response',
      options: { tone },
    });
  }

  public async generateCreativeContent(prompt: string, format?: string): Promise<ApiResponse<any>> {
    return this.client.post('/api/generate', {
      prompt,
      contentType: 'creative',
      options: { format },
    });
  }

  public async getSupportedTones(): Promise<ApiResponse<string[]>> {
    return this.client.get('/api/generate/tones');
  }

  public async getSupportedFormats(): Promise<ApiResponse<string[]>> {
    return this.client.get('/api/generate/formats');
  }
}