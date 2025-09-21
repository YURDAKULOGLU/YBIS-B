import { YBISApiClient } from '../client';
import { ApiResponse, VoiceTranscribeRequest } from '../types';

export class VoiceEndpoints {
  constructor(private client: YBISApiClient) {}

  public async transcribe(request: VoiceTranscribeRequest): Promise<ApiResponse<any>> {
    return this.client.post('/api/voice', request);
  }

  public async transcribeAudio(audioData: string, language?: string): Promise<ApiResponse<any>> {
    return this.client.post('/api/voice', {
      audioData,
      language,
    });
  }

  public async transcribeWithTimestamps(audioData: string, language?: string): Promise<ApiResponse<any>> {
    return this.client.post('/api/voice/timestamps', {
      audioData,
      language,
    });
  }

  public async detectLanguage(audioData: string): Promise<ApiResponse<any>> {
    return this.client.post('/api/voice/detect-language', { audioData });
  }

  public async getSupportedLanguages(): Promise<ApiResponse<string[]>> {
    return this.client.get('/api/voice/languages');
  }
}