import { YBISApiClient } from '../client';
import { ApiResponse, TransformTextRequest } from '../types';

export class TransformEndpoints {
  constructor(private client: YBISApiClient) {}

  public async transformText(request: TransformTextRequest): Promise<ApiResponse<any>> {
    return this.client.post('/api/transform', request);
  }

  public async translate(text: string, targetLanguage: string): Promise<ApiResponse<any>> {
    return this.client.post('/api/transform', {
      text,
      transformType: 'translate',
      options: { targetLanguage },
    });
  }

  public async summarize(text: string, maxLength?: number): Promise<ApiResponse<any>> {
    return this.client.post('/api/transform', {
      text,
      transformType: 'summarize',
      options: { maxLength },
    });
  }

  public async rewrite(text: string, style?: string): Promise<ApiResponse<any>> {
    return this.client.post('/api/transform', {
      text,
      transformType: 'rewrite',
      options: { style },
    });
  }

  public async formatText(text: string, format?: string): Promise<ApiResponse<any>> {
    return this.client.post('/api/transform', {
      text,
      transformType: 'format',
      options: { format },
    });
  }

  public async getSupportedLanguages(): Promise<ApiResponse<string[]>> {
    return this.client.get('/api/transform/languages');
  }
}