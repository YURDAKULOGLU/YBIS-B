import { YBISApiClient } from '../client';
import { ApiResponse, TaskListRequest, TaskCreateRequest, TaskUpdateRequest, TaskDeleteRequest, TaskCompleteRequest } from '../types';

export class TasksEndpoints {
  constructor(private client: YBISApiClient) {}

  public async listTasks(request: TaskListRequest = {}): Promise<ApiResponse<any>> {
    return this.client.post('/api/tasks/list', request);
  }

  public async createTask(request: TaskCreateRequest, idempotencyKey?: string): Promise<ApiResponse<any>> {
    const options = idempotencyKey ? { idempotencyKey } : {};
    return this.client.post('/api/tasks/create', request, options);
  }

  public async updateTask(request: TaskUpdateRequest): Promise<ApiResponse<any>> {
    return this.client.post('/api/tasks/update', request);
  }

  public async deleteTask(request: TaskDeleteRequest): Promise<ApiResponse<any>> {
    return this.client.post('/api/tasks/delete', request);
  }

  public async completeTask(request: TaskCompleteRequest): Promise<ApiResponse<any>> {
    return this.client.post('/api/tasks/complete', request);
  }

  public async getTask(taskId: string): Promise<ApiResponse<any>> {
    return this.client.get(`/api/tasks/${taskId}`);
  }

  public async getTaskStats(): Promise<ApiResponse<{
    total: number;
    completed: number;
    pending: number;
    inProgress: number;
    byPriority: Record<string, number>;
  }>> {
    return this.client.get('/api/tasks/stats');
  }

  public async searchTasks(query: string, filters?: {
    priority?: string;
    status?: string;
    dueDate?: string;
  }): Promise<ApiResponse<any>> {
    return this.client.post('/api/tasks/search', { query, filters });
  }

  public async bulkUpdateTasks(taskIds: string[], updates: Partial<TaskUpdateRequest>): Promise<ApiResponse<any>> {
    return this.client.post('/api/tasks/bulk-update', { taskIds, updates });
  }

  public async bulkDeleteTasks(taskIds: string[]): Promise<ApiResponse<any>> {
    return this.client.post('/api/tasks/bulk-delete', { taskIds });
  }
}