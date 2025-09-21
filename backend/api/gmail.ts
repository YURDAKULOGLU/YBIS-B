import { Hono, Context } from 'hono';
import { z } from 'zod';
import axios from 'axios';
import { getValidAccessToken } from '../src/shared/auth/google';
import { checkRateLimit } from '../src/shared/utils/rateLimit';
import {
  GmailSendSchema,
  GmailSearchSchema,
  GmailSummarySchema,
  Ok,
  Err,
} from '../src/shared/tools/schemas';

const app = new Hono();

// Gmail API base URL
const GMAIL_API_BASE = 'https://gmail.googleapis.com/gmail/v1';

interface EmailCard {
  id: string;
  threadId: string;
  from: string;
  subject: string;
  snippet: string;
  date: string;
  isUnread: boolean;
  labels: string[];
}

/**
 * Convert Gmail API message to EmailCard format
 */
function convertToEmailCard(message: any, headers: any): EmailCard {
  const getHeader = (name: string) => {
    const header = headers.find((h: any) => h.name.toLowerCase() === name.toLowerCase());
    return header?.value || '';
  };

  return {
    id: message.id,
    threadId: message.threadId,
    from: getHeader('from'),
    subject: getHeader('subject'),
    snippet: message.snippet || '',
    date: new Date(parseInt(message.internalDate)).toISOString(),
    isUnread: !message.labelIds?.includes('UNREAD') ? false : true,
    labels: message.labelIds || [],
  };
}

/**
 * Get Gmail messages with query
 */
async function getGmailMessages(
  accessToken: string,
  query: string = 'in:inbox',
  maxResults: number = 10,
  pageToken?: string
): Promise<{ emails: EmailCard[]; nextPageToken?: string }> {
  try {
    // First, get list of message IDs
    const listUrl = `${GMAIL_API_BASE}/users/me/messages`;
    const listParams = new URLSearchParams({
      q: query,
      maxResults: maxResults.toString(),
    });
    
    if (pageToken) {
      listParams.append('pageToken', pageToken);
    }

    const listResponse = await axios.get(`${listUrl}?${listParams}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const messageIds = listResponse.data.messages || [];
    const nextPageToken = listResponse.data.nextPageToken;

    if (messageIds.length === 0) {
      return { emails: [], nextPageToken };
    }

    // Get full message details for each message
    const emails: EmailCard[] = [];
    
    for (const msgRef of messageIds) {
      try {
        const msgResponse = await axios.get(
          `${GMAIL_API_BASE}/users/me/messages/${msgRef.id}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
            params: {
              format: 'metadata',
              metadataHeaders: 'From,Subject,Date',
            },
          }
        );

        const email = convertToEmailCard(msgResponse.data, msgResponse.data.payload?.headers || []);
        emails.push(email);
        
      } catch (error) {
        console.warn(`Failed to get message ${msgRef.id}:`, error);
        // Continue with other messages
      }
    }

    return { emails, nextPageToken };
    
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      const errorData = error.response?.data;
      
      if (status === 401) {
        throw new Error('Gmail authentication expired. Please re-authenticate.');
      }
      
      if (status === 403) {
        throw new Error('Gmail access forbidden. Check API permissions.');
      }
      
      if (status === 429) {
        throw new Error('Gmail API rate limit exceeded. Please try again later.');
      }
      
      throw new Error(`Gmail API error: ${errorData?.error?.message || error.message}`);
    }
    
    throw error;
  }
}

/**
 * Send email via Gmail API
 */
async function sendGmailMessage(
  accessToken: string,
  to: string,
  subject: string,
  body: string,
  replyToThreadId?: string
): Promise<{ messageId: string; threadId: string }> {
  try {
    const email = [
      `To: ${to}`,
      `Subject: ${subject}`,
      `Content-Type: text/html; charset=utf-8`,
      '',
      body,
    ].join('\n');

    const encodedEmail = Buffer.from(email).toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    const payload: any = {
      raw: encodedEmail,
    };

    if (replyToThreadId) {
      payload.threadId = replyToThreadId;
    }

    const response = await axios.post(
      `${GMAIL_API_BASE}/users/me/messages/send`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return {
      messageId: response.data.id,
      threadId: response.data.threadId,
    };
    
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      const errorData = error.response?.data;
      
      if (status === 401) {
        throw new Error('Gmail authentication expired. Please re-authenticate.');
      }
      
      if (status === 403) {
        throw new Error('Gmail send permission denied. Check API scopes.');
      }
      
      throw new Error(`Gmail send error: ${errorData?.error?.message || error.message}`);
    }
    
    throw error;
  }
}

// Gmail Summary endpoint
app.post('/summary', async (c: Context) => {
  try {
    const userId = 'current-user-id';
    
    const rateLimitResult = await checkRateLimit(userId, 'tool', 20, 600);
    if (!rateLimitResult.allowed) {
      return c.json(Err('RATE_LIMIT_EXCEEDED', 'Too many requests'), 429);
    }

    const body = await c.req.json();
    const request = GmailSummarySchema.parse(body);
    
    const accessToken = await getValidAccessToken(userId);
    
    const { emails } = await getGmailMessages(
      accessToken,
      request.query || 'in:inbox is:unread',
      request.maxEmails || 20
    );
    
    return c.json(Ok({
      count: emails.length,
      emails,
      timeframe: request.timeframe,
    }));
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json(Err('VALIDATION_ERROR', error.issues[0]?.message || 'Invalid request'), 400);
    }
    return c.json(Err('INTERNAL_ERROR', 'Failed to get Gmail summary'), 500);
  }
});

// Gmail Search endpoint
app.post('/search', async (c: Context) => {
  try {
    const userId = 'current-user-id';
    
    const rateLimitResult = await checkRateLimit(userId, 'tool', 50, 600);
    if (!rateLimitResult.allowed) {
      return c.json(Err('RATE_LIMIT_EXCEEDED', 'Too many requests'), 429);
    }

    const body = await c.req.json();
    const request = GmailSearchSchema.parse(body);
    
    const accessToken = await getValidAccessToken(userId);
    
    const { emails } = await getGmailMessages(
      accessToken,
      request.query,
      request.maxResults
    );
    
    return c.json(Ok({ emails }));
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json(Err('VALIDATION_ERROR', error.issues[0]?.message || 'Invalid request'), 400);
    }
    return c.json(Err('INTERNAL_ERROR', 'Failed to search Gmail'), 500);
  }
});

// Gmail Send endpoint
app.post('/send', async (c: Context) => {
  try {
    const userId = 'current-user-id';
    
    const rateLimitResult = await checkRateLimit(userId, 'tool', 10, 600);
    if (!rateLimitResult.allowed) {
      return c.json(Err('RATE_LIMIT_EXCEEDED', 'Too many requests'), 429);
    }

    const body = await c.req.json();
    const request = GmailSendSchema.parse(body);
    
    const accessToken = await getValidAccessToken(userId);
    
    const { messageId, threadId } = await sendGmailMessage(
      accessToken,
      request.to,
      request.subject,
      request.body
    );
    
    return c.json(Ok({
      messageId,
      threadId,
      sentAt: new Date().toISOString(),
    }));
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json(Err('VALIDATION_ERROR', error.issues[0]?.message || 'Invalid request'), 400);
    }
    return c.json(Err('INTERNAL_ERROR', 'Failed to send email'), 500);
  }
});

// Health check endpoint
app.get('/health', (c: Context) => {
  return c.json({
    ok: true,
    service: 'gmail-api',
    status: 'healthy',
    timestamp: new Date().toISOString(),
  });
});

export default app;
