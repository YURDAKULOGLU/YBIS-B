import { YBISApiClient } from '../client';
import { ApiResponse, GmailListRequest, GmailSummaryRequest, GmailSendRequest } from '../types';

export class GmailEndpoints {
  constructor(private client: YBISApiClient) {}

  public async getSummary(request: GmailSummaryRequest = {}): Promise<ApiResponse<any>> {
    return this.client.post('/api/gmail/summary', request);
  }

  public async listEmails(request: GmailListRequest = {}): Promise<ApiResponse<any>> {
    return this.client.post('/api/gmail/list', request);
  }

  public async sendEmail(request: GmailSendRequest, idempotencyKey?: string): Promise<ApiResponse<any>> {
    const options = idempotencyKey ? { idempotencyKey } : {};
    return this.client.post('/api/gmail/send', request, options);
  }

  public async getEmail(emailId: string): Promise<ApiResponse<any>> {
    return this.client.get(`/api/gmail/messages/${emailId}`);
  }

  public async markAsRead(emailId: string): Promise<ApiResponse<any>> {
    return this.client.post(`/api/gmail/messages/${emailId}/read`);
  }

  public async markAsUnread(emailId: string): Promise<ApiResponse<any>> {
    return this.client.post(`/api/gmail/messages/${emailId}/unread`);
  }

  public async starEmail(emailId: string): Promise<ApiResponse<any>> {
    return this.client.post(`/api/gmail/messages/${emailId}/star`);
  }

  public async unstarEmail(emailId: string): Promise<ApiResponse<any>> {
    return this.client.post(`/api/gmail/messages/${emailId}/unstar`);
  }

  public async deleteEmail(emailId: string): Promise<ApiResponse<any>> {
    return this.client.delete(`/api/gmail/messages/${emailId}`);
  }

  public async getLabels(): Promise<ApiResponse<any[]>> {
    return this.client.get('/api/gmail/labels');
  }

  public async addLabel(emailId: string, labelId: string): Promise<ApiResponse<any>> {
    return this.client.post(`/api/gmail/messages/${emailId}/labels`, { labelId });
  }

  public async removeLabel(emailId: string, labelId: string): Promise<ApiResponse<any>> {
    return this.client.delete(`/api/gmail/messages/${emailId}/labels/${labelId}`);
  }
}