import { Hono, Context } from 'hono';
import { z } from 'zod';
import { nanoid } from 'nanoid';
import axios from 'axios';
import { getValidAccessToken } from '../src/shared/auth/google';
import { checkRateLimit } from '../src/shared/utils/rateLimit';
import { checkIdempotency, completeIdempotentOperation } from '../src/shared/utils/idempotency';

const app = new Hono();

// API Envelope schemas
const OkResponseSchema = z.object({
  ok: z.literal(true),
  meta: z.object({
    requestId: z.string(),
    elapsedMs: z.number(),
  }),
  data: z.any(),
});

const ErrorResponseSchema = z.object({
  ok: z.literal(false),
  meta: z.object({
    requestId: z.string(),
    elapsedMs: z.number(),
  }),
  error: z.object({
    code: z.string(),
    message: z.string(),
    hint: z.string().optional(),
  }),
});

// Calendar API schemas (based on updated shared schemas)
const CalendarListReqSchema = z.object({
  userId: z.string().min(1),
  action: z.literal('list'),
  params: z.object({
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    max: z.number().int().min(1).max(100).optional().default(50),
    cursor: z.string().optional(),
  }),
});

const CalendarCreateReqSchema = z.object({
  userId: z.string().min(1),
  action: z.literal('create'),
  params: z.object({
    title: z.string().min(1),
    description: z.string().optional(),
    startTime: z.string(),
    endTime: z.string().optional(),
    location: z.string().optional(),
    attendees: z.array(z.string().email()).optional().default([]),
    isAllDay: z.boolean().optional().default(false),
    timezone: z.string().optional().default('Europe/Istanbul'),
  }),
  idempotencyKey: z.string().min(1),
});

const CalendarUpdateReqSchema = z.object({
  userId: z.string().min(1),
  action: z.literal('update'),
  params: z.object({
    eventId: z.string().min(1),
    title: z.string().optional(),
    description: z.string().optional(),
    startTime: z.string().optional(),
    endTime: z.string().optional(),
    location: z.string().optional(),
    attendees: z.array(z.string().email()).optional(),
    isAllDay: z.boolean().optional(),
  }),
});

const CalendarDeleteReqSchema = z.object({
  userId: z.string().min(1),
  action: z.literal('delete'),
  params: z.object({
    eventId: z.string().min(1),
  }),
});

// Google Calendar API base URL
const CALENDAR_API_BASE = 'https://www.googleapis.com/calendar/v3';

/**
 * Convert Google Calendar event to our format
 */
function convertToCalendarEvent(event: any): any {
  return {
    id: event.id,
    title: event.summary || 'Untitled Event',
    description: event.description || '',
    startTime: event.start?.dateTime || event.start?.date,
    endTime: event.end?.dateTime || event.end?.date,
    location: event.location || '',
    attendees: event.attendees?.map((a: any) => a.email) || [],
    isAllDay: !!event.start?.date, // All-day events use date instead of dateTime
    timezone: event.start?.timeZone || 'Europe/Istanbul',
  };
}

/**
 * Get calendar events
 */
async function getCalendarEvents(
  accessToken: string,
  startDate?: string,
  endDate?: string,
  maxResults: number = 50,
  pageToken?: string
): Promise<{ events: any[]; nextPageToken?: string }> {
  try {
    const params = new URLSearchParams({
      maxResults: maxResults.toString(),
      singleEvents: 'true',
      orderBy: 'startTime',
    });

    if (startDate) {
      params.append('timeMin', new Date(startDate).toISOString());
    }
    if (endDate) {
      params.append('timeMax', new Date(endDate).toISOString());
    }
    if (pageToken) {
      params.append('pageToken', pageToken);
    }

    const response = await axios.get(
      `${CALENDAR_API_BASE}/calendars/primary/events?${params}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    const events = response.data.items?.map(convertToCalendarEvent) || [];
    const nextPageToken = response.data.nextPageToken;

    return { events, nextPageToken };
    
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      const errorData = error.response?.data;
      
      if (status === 401) {
        throw new Error('Calendar authentication expired. Please re-authenticate.');
      }
      
      if (status === 403) {
        throw new Error('Calendar access forbidden. Check API permissions.');
      }
      
      throw new Error(`Calendar API error: ${errorData?.error?.message || error.message}`);
    }
    
    throw error;
  }
}

/**
 * Create calendar event
 */
async function createCalendarEvent(
  accessToken: string,
  eventData: any
): Promise<any> {
  try {
    const googleEvent: any = {
      summary: eventData.title,
      description: eventData.description,
      location: eventData.location,
      start: eventData.isAllDay 
        ? { date: eventData.startTime.split('T')[0] }
        : { 
            dateTime: eventData.startTime,
            timeZone: eventData.timezone || 'Europe/Istanbul'
          },
      end: eventData.isAllDay
        ? { date: eventData.endTime?.split('T')[0] || eventData.startTime.split('T')[0] }
        : {
            dateTime: eventData.endTime || new Date(new Date(eventData.startTime).getTime() + 60 * 60 * 1000).toISOString(),
            timeZone: eventData.timezone || 'Europe/Istanbul'
          },
    };

    if (eventData.attendees?.length > 0) {
      googleEvent.attendees = eventData.attendees.map((email: string) => ({ email }));
    }

    const response = await axios.post(
      `${CALENDAR_API_BASE}/calendars/primary/events`,
      googleEvent,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return convertToCalendarEvent(response.data);
    
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      const errorData = error.response?.data;
      
      if (status === 401) {
        throw new Error('Calendar authentication expired. Please re-authenticate.');
      }
      
      if (status === 403) {
        throw new Error('Calendar create permission denied. Check API scopes.');
      }
      
      throw new Error(`Calendar create error: ${errorData?.error?.message || error.message}`);
    }
    
    throw error;
  }
}

/**
 * Update calendar event
 */
async function updateCalendarEvent(
  accessToken: string,
  eventId: string,
  updates: any
): Promise<any> {
  try {
    // First get the existing event
    const getResponse = await axios.get(
      `${CALENDAR_API_BASE}/calendars/primary/events/${eventId}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    const existingEvent = getResponse.data;
    
    // Merge updates
    const updatedEvent: any = {
      ...existingEvent,
    };

    if (updates.title) updatedEvent.summary = updates.title;
    if (updates.description !== undefined) updatedEvent.description = updates.description;
    if (updates.location !== undefined) updatedEvent.location = updates.location;
    
    if (updates.startTime) {
      updatedEvent.start = updates.isAllDay
        ? { date: updates.startTime.split('T')[0] }
        : { dateTime: updates.startTime, timeZone: 'Europe/Istanbul' };
    }
    
    if (updates.endTime) {
      updatedEvent.end = updates.isAllDay
        ? { date: updates.endTime.split('T')[0] }
        : { dateTime: updates.endTime, timeZone: 'Europe/Istanbul' };
    }

    if (updates.attendees) {
      updatedEvent.attendees = updates.attendees.map((email: string) => ({ email }));
    }

    const response = await axios.put(
      `${CALENDAR_API_BASE}/calendars/primary/events/${eventId}`,
      updatedEvent,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return convertToCalendarEvent(response.data);
    
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      const errorData = error.response?.data;
      
      if (status === 401) {
        throw new Error('Calendar authentication expired. Please re-authenticate.');
      }
      
      if (status === 404) {
        throw new Error('Calendar event not found.');
      }
      
      throw new Error(`Calendar update error: ${errorData?.error?.message || error.message}`);
    }
    
    throw error;
  }
}

/**
 * Delete calendar event
 */
async function deleteCalendarEvent(
  accessToken: string,
  eventId: string
): Promise<void> {
  try {
    await axios.delete(
      `${CALENDAR_API_BASE}/calendars/primary/events/${eventId}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      const errorData = error.response?.data;
      
      if (status === 401) {
        throw new Error('Calendar authentication expired. Please re-authenticate.');
      }
      
      if (status === 404) {
        throw new Error('Calendar event not found.');
      }
      
      throw new Error(`Calendar delete error: ${errorData?.error?.message || error.message}`);
    }
    
    throw error;
  }
}

// Calendar List endpoint
app.post('/list', async (c: Context) => {
  const startTime = Date.now();
  const requestId = nanoid();
  
  try {
    const body = await c.req.json();
    const request = CalendarListReqSchema.parse(body);
    const { userId, params } = request;
    
    // Rate limiting
    const rateLimit = await checkRateLimit(userId, 'tool');
    if (!rateLimit.allowed) {
      const elapsedMs = Date.now() - startTime;
      return c.json(ErrorResponseSchema.parse({
        ok: false,
        meta: { requestId, elapsedMs },
        error: rateLimit.error,
      }), 429, rateLimit.headers);
    }
    
    // Get access token
    const accessToken = await getValidAccessToken(userId);
    
    // Get events
    const { events, nextPageToken } = await getCalendarEvents(
      accessToken,
      params.startDate,
      params.endDate,
      params.max || 50,
      params.cursor
    );
    
    const response = {
      events,
      pagination: {
        cursor: nextPageToken,
        hasMore: !!nextPageToken,
      },
    };
    
    const elapsedMs = Date.now() - startTime;
    return c.json(OkResponseSchema.parse({
      ok: true,
      meta: { requestId, elapsedMs },
      data: response,
    }), 200, rateLimit.headers);
    
  } catch (error) {
    const elapsedMs = Date.now() - startTime;
    
    if (error instanceof z.ZodError) {
      return c.json(ErrorResponseSchema.parse({
        ok: false,
        meta: { requestId, elapsedMs },
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid request format',
          hint: 'Check required fields: userId, action, params',
        },
      }), 400);
    }
    
    console.error('Calendar list error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return c.json(ErrorResponseSchema.parse({
      ok: false,
      meta: { requestId, elapsedMs },
      error: {
        code: 'CALENDAR_ERROR',
        message: errorMessage,
        hint: 'Check Calendar authentication and permissions',
      },
    }), 500);
  }
});

// Calendar Create endpoint (requires idempotency)
app.post('/create', async (c: Context) => {
  const startTime = Date.now();
  const requestId = nanoid();
  
  try {
    const body = await c.req.json();
    const request = CalendarCreateReqSchema.parse(body);
    const { userId, params, idempotencyKey } = request;
    
    // Rate limiting
    const rateLimit = await checkRateLimit(userId, 'tool');
    if (!rateLimit.allowed) {
      const elapsedMs = Date.now() - startTime;
      return c.json(ErrorResponseSchema.parse({
        ok: false,
        meta: { requestId, elapsedMs },
        error: rateLimit.error,
      }), 429, rateLimit.headers);
    }
    
    // Idempotency check
    const idempotencyResult = await checkIdempotency(idempotencyKey);
    if (!idempotencyResult.isFirst) {
      const elapsedMs = Date.now() - startTime;
      return c.json(OkResponseSchema.parse({
        ok: true,
        meta: { requestId, elapsedMs },
        data: idempotencyResult.storedResult,
      }), 200, rateLimit.headers);
    }
    
    // Get access token
    const accessToken = await getValidAccessToken(userId);
    
    // Create event
    const event = await createCalendarEvent(accessToken, params);
    
    const response = {
      event,
      createdAt: new Date().toISOString(),
    };
    
    // Store result for idempotency
    await completeIdempotentOperation(idempotencyKey, response);
    
    const elapsedMs = Date.now() - startTime;
    return c.json(OkResponseSchema.parse({
      ok: true,
      meta: { requestId, elapsedMs },
      data: response,
    }), 200, rateLimit.headers);
    
  } catch (error) {
    const elapsedMs = Date.now() - startTime;
    
    if (error instanceof z.ZodError) {
      return c.json(ErrorResponseSchema.parse({
        ok: false,
        meta: { requestId, elapsedMs },
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid request format',
          hint: 'Check required fields: userId, action, params, idempotencyKey',
        },
      }), 400);
    }
    
    console.error('Calendar create error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return c.json(ErrorResponseSchema.parse({
      ok: false,
      meta: { requestId, elapsedMs },
      error: {
        code: 'CALENDAR_ERROR',
        message: errorMessage,
        hint: 'Check Calendar authentication and create permissions',
      },
    }), 500);
  }
});

// Calendar Update endpoint
app.post('/update', async (c: Context) => {
  const startTime = Date.now();
  const requestId = nanoid();
  
  try {
    const body = await c.req.json();
    const request = CalendarUpdateReqSchema.parse(body);
    const { userId, params } = request;
    
    // Rate limiting
    const rateLimit = await checkRateLimit(userId, 'tool');
    if (!rateLimit.allowed) {
      const elapsedMs = Date.now() - startTime;
      return c.json(ErrorResponseSchema.parse({
        ok: false,
        meta: { requestId, elapsedMs },
        error: rateLimit.error,
      }), 429, rateLimit.headers);
    }
    
    // Get access token
    const accessToken = await getValidAccessToken(userId);
    
    // Update event
    const event = await updateCalendarEvent(accessToken, params.eventId, params);
    
    const response = {
      event,
      updatedAt: new Date().toISOString(),
    };
    
    const elapsedMs = Date.now() - startTime;
    return c.json(OkResponseSchema.parse({
      ok: true,
      meta: { requestId, elapsedMs },
      data: response,
    }), 200, rateLimit.headers);
    
  } catch (error) {
    const elapsedMs = Date.now() - startTime;
    
    if (error instanceof z.ZodError) {
      return c.json(ErrorResponseSchema.parse({
        ok: false,
        meta: { requestId, elapsedMs },
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid request format',
          hint: 'Check required fields: userId, action, params',
        },
      }), 400);
    }
    
    console.error('Calendar update error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return c.json(ErrorResponseSchema.parse({
      ok: false,
      meta: { requestId, elapsedMs },
      error: {
        code: 'CALENDAR_ERROR',
        message: errorMessage,
        hint: 'Check Calendar authentication and permissions',
      },
    }), 500);
  }
});

// Calendar Delete endpoint
app.post('/delete', async (c: Context) => {
  const startTime = Date.now();
  const requestId = nanoid();
  
  try {
    const body = await c.req.json();
    const request = CalendarDeleteReqSchema.parse(body);
    const { userId, params } = request;
    
    // Rate limiting
    const rateLimit = await checkRateLimit(userId, 'tool');
    if (!rateLimit.allowed) {
      const elapsedMs = Date.now() - startTime;
      return c.json(ErrorResponseSchema.parse({
        ok: false,
        meta: { requestId, elapsedMs },
        error: rateLimit.error,
      }), 429, rateLimit.headers);
    }
    
    // Get access token
    const accessToken = await getValidAccessToken(userId);
    
    // Delete event
    await deleteCalendarEvent(accessToken, params.eventId);
    
    const response = {
      deleted: true,
      eventId: params.eventId,
      deletedAt: new Date().toISOString(),
    };
    
    const elapsedMs = Date.now() - startTime;
    return c.json(OkResponseSchema.parse({
      ok: true,
      meta: { requestId, elapsedMs },
      data: response,
    }), 200, rateLimit.headers);
    
  } catch (error) {
    const elapsedMs = Date.now() - startTime;
    
    if (error instanceof z.ZodError) {
      return c.json(ErrorResponseSchema.parse({
        ok: false,
        meta: { requestId, elapsedMs },
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid request format',
          hint: 'Check required fields: userId, action, params',
        },
      }), 400);
    }
    
    console.error('Calendar delete error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return c.json(ErrorResponseSchema.parse({
      ok: false,
      meta: { requestId, elapsedMs },
      error: {
        code: 'CALENDAR_ERROR',
        message: errorMessage,
        hint: 'Check Calendar authentication and permissions',
      },
    }), 500);
  }
});

// Health check endpoint
app.get('/health', (c: Context) => {
  return c.json({
    ok: true,
    service: 'calendar-api',
    status: 'healthy',
    timestamp: new Date().toISOString(),
  });
});

export default app;
