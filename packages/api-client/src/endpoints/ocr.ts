import { YBISApiClient } from '../client';
import { ApiResponse, OCRRequest } from '../types';

export class OCREndpoints {
  constructor(private client: YBISApiClient) {}

  public async processImage(request: OCRRequest): Promise<ApiResponse<any>> {
    return this.client.post('/api/ocr', request);
  }

  public async extractText(imageData: string, language?: string): Promise<ApiResponse<any>> {
    return this.client.post('/api/ocr', {
      imageData,
      language,
      outputFormat: 'text',
    });
  }

  public async extractStructuredData(imageData: string, language?: string): Promise<ApiResponse<any>> {
    return this.client.post('/api/ocr', {
      imageData,
      language,
      outputFormat: 'json',
    });
  }

  public async processDocument(imageData: string): Promise<ApiResponse<any>> {
    return this.client.post('/api/ocr/document', { imageData });
  }

  public async processReceipt(imageData: string): Promise<ApiResponse<any>> {
    return this.client.post('/api/ocr/receipt', { imageData });
  }

  public async processBusinessCard(imageData: string): Promise<ApiResponse<any>> {
    return this.client.post('/api/ocr/business-card', { imageData });
  }
}