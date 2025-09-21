import { YBISApiClient } from '../client';
import { ApiResponse, CalendarListRequest, CalendarCreateRequest, CalendarUpdateRequest, CalendarDeleteRequest } from '../types';

export class CalendarEndpoints {
  constructor(private client: YBISApiClient) {}

  public async listEvents(request: CalendarListRequest = {}): Promise<ApiResponse<any>> {
    return this.client.post('/api/calendar/list', request);
  }

  public async createEvent(request: CalendarCreateRequest, idempotencyKey?: string): Promise<ApiResponse<any>> {
    const options = idempotencyKey ? { idempotencyKey } : {};
    return this.client.post('/api/calendar/create', request, options);
  }

  public async updateEvent(request: CalendarUpdateRequest): Promise<ApiResponse<any>> {
    return this.client.post('/api/calendar/update', request);
  }

  public async deleteEvent(request: CalendarDeleteRequest): Promise<ApiResponse<any>> {
    return this.client.post('/api/calendar/delete', request);
  }

  public async getEvent(eventId: string, calendarId: string = 'primary'): Promise<ApiResponse<any>> {
    return this.client.get(`/api/calendar/events/${eventId}?calendarId=${calendarId}`);
  }

  public async listCalendars(): Promise<ApiResponse<any[]>> {
    return this.client.get('/api/calendar/calendars');
  }

  public async getCalendar(calendarId: string): Promise<ApiResponse<any>> {
    return this.client.get(`/api/calendar/calendars/${calendarId}`);
  }

  public async createCalendar(request: { name: string; description?: string; timeZone?: string }): Promise<ApiResponse<any>> {
    return this.client.post('/api/calendar/calendars', request);
  }

  public async updateCalendar(calendarId: string, request: { name?: string; description?: string }): Promise<ApiResponse<any>> {
    return this.client.put(`/api/calendar/calendars/${calendarId}`, request);
  }

  public async deleteCalendar(calendarId: string): Promise<ApiResponse<any>> {
    return this.client.delete(`/api/calendar/calendars/${calendarId}`);
  }

  public async getFreeBusy(request: {
    timeMin: string;
    timeMax: string;
    items: Array<{ id: string }>;
  }): Promise<ApiResponse<any>> {
    return this.client.post('/api/calendar/freebusy', request);
  }
}