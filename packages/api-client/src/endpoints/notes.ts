import { YBISApiClient } from '../client';
import { ApiResponse, NoteListRequest, NoteCreateRequest, NoteUpdateRequest, NoteDeleteRequest } from '../types';

export class NotesEndpoints {
  constructor(private client: YBISApiClient) {}

  public async listNotes(request: NoteListRequest = {}): Promise<ApiResponse<any>> {
    return this.client.post('/api/notes/list', request);
  }

  public async createNote(request: NoteCreateRequest, idempotencyKey?: string): Promise<ApiResponse<any>> {
    const options = idempotencyKey ? { idempotencyKey } : {};
    return this.client.post('/api/notes/create', request, options);
  }

  public async updateNote(request: NoteUpdateRequest): Promise<ApiResponse<any>> {
    return this.client.post('/api/notes/update', request);
  }

  public async deleteNote(request: NoteDeleteRequest): Promise<ApiResponse<any>> {
    return this.client.post('/api/notes/delete', request);
  }

  public async getNote(noteId: string): Promise<ApiResponse<any>> {
    return this.client.get(`/api/notes/${noteId}`);
  }

  public async searchNotes(query: string, filters?: {
    tags?: string[];
    folderId?: string;
    isArchived?: boolean;
    isStarred?: boolean;
  }): Promise<ApiResponse<any>> {
    return this.client.post('/api/notes/search', { query, filters });
  }

  public async starNote(noteId: string): Promise<ApiResponse<any>> {
    return this.client.post(`/api/notes/${noteId}/star`);
  }

  public async unstarNote(noteId: string): Promise<ApiResponse<any>> {
    return this.client.post(`/api/notes/${noteId}/unstar`);
  }

  public async archiveNote(noteId: string): Promise<ApiResponse<any>> {
    return this.client.post(`/api/notes/${noteId}/archive`);
  }

  public async unarchiveNote(noteId: string): Promise<ApiResponse<any>> {
    return this.client.post(`/api/notes/${noteId}/unarchive`);
  }

  public async duplicateNote(noteId: string): Promise<ApiResponse<any>> {
    return this.client.post(`/api/notes/${noteId}/duplicate`);
  }

  public async exportNote(noteId: string, format: 'md' | 'html' | 'pdf'): Promise<ApiResponse<any>> {
    return this.client.get(`/api/notes/${noteId}/export?format=${format}`);
  }

  // Folder management
  public async listFolders(): Promise<ApiResponse<any[]>> {
    return this.client.get('/api/notes/folders');
  }

  public async createFolder(request: { name: string; parentId?: string; color?: string }): Promise<ApiResponse<any>> {
    return this.client.post('/api/notes/folders', request);
  }

  public async updateFolder(folderId: string, request: { name?: string; color?: string }): Promise<ApiResponse<any>> {
    return this.client.put(`/api/notes/folders/${folderId}`, request);
  }

  public async deleteFolder(folderId: string): Promise<ApiResponse<any>> {
    return this.client.delete(`/api/notes/folders/${folderId}`);
  }

  // Tag management
  public async getTags(): Promise<ApiResponse<string[]>> {
    return this.client.get('/api/notes/tags');
  }

  public async createTag(tag: string): Promise<ApiResponse<any>> {
    return this.client.post('/api/notes/tags', { tag });
  }

  public async deleteTag(tag: string): Promise<ApiResponse<any>> {
    return this.client.delete(`/api/notes/tags/${encodeURIComponent(tag)}`);
  }
}