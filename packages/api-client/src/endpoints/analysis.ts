import { YBISApiClient } from '../client';
import { ApiResponse, AnalyzeTextRequest } from '../types';

export class AnalysisEndpoints {
  constructor(private client: YBISApiClient) {}

  public async analyzeText(request: AnalyzeTextRequest): Promise<ApiResponse<any>> {
    return this.client.post('/api/analyze', request);
  }

  public async analyzeSentiment(text: string): Promise<ApiResponse<any>> {
    return this.client.post('/api/analyze', {
      text,
      analysisType: 'sentiment',
    });
  }

  public async extractEntities(text: string): Promise<ApiResponse<any>> {
    return this.client.post('/api/analyze', {
      text,
      analysisType: 'entities',
    });
  }

  public async extractKeywords(text: string): Promise<ApiResponse<any>> {
    return this.client.post('/api/analyze', {
      text,
      analysisType: 'keywords',
    });
  }

  public async summarizeText(text: string): Promise<ApiResponse<any>> {
    return this.client.post('/api/analyze', {
      text,
      analysisType: 'summary',
    });
  }

  public async performFullAnalysis(text: string): Promise<ApiResponse<any>> {
    return this.client.post('/api/analyze', {
      text,
      analysisType: 'all',
    });
  }
}