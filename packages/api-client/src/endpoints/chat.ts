import { YBISApiClient } from '../client';
import { ApiResponse, ChatSendRequest, ChatConfirmRequest, ChatResponse } from '../types';

export class ChatEndpoints {
  constructor(private client: YBISApiClient) {}

  public async sendMessage(request: ChatSendRequest): Promise<ApiResponse<ChatResponse>> {
    return this.client.post('/api/chat', request);
  }

  public async confirmPlan(request: ChatConfirmRequest): Promise<ApiResponse<ChatResponse>> {
    return this.client.post('/api/chat', request);
  }

  public async rejectPlan(planId: string, userId: string): Promise<ApiResponse<ChatResponse>> {
    return this.client.post('/api/chat', {
      planId,
      confirmExecution: false,
      userId,
    });
  }

  public async getPlan(planId: string): Promise<ApiResponse<any>> {
    return this.client.get(`/api/chat/plans/${planId}`);
  }

  public async listPlans(userId: string): Promise<ApiResponse<any[]>> {
    return this.client.get(`/api/chat/plans?userId=${userId}`);
  }
}