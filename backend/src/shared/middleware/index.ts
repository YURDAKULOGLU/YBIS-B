import type { Context, Next } from 'hono';

// Simple in-memory rate limiter (use Redis in production)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

export function rateLimit(maxRequests: number = 10, windowMs: number = 60000) {
  return async (c: Context, next: Next) => {
    const clientId = c.req.header('x-client-id') || 
                     c.req.header('x-forwarded-for') || 
                     'anonymous';
    
    const now = Date.now();
    const key = `rate_limit:${clientId}`;
    const current = rateLimitStore.get(key);
    
    if (!current || now > current.resetTime) {
      rateLimitStore.set(key, { count: 1, resetTime: now + windowMs });
    } else if (current.count >= maxRequests) {
      return c.json({
        ok: false,
        meta: { requestId: 'rate-limited', elapsedMs: 0 },
        error: {
          code: 'RATE_LIMIT',
          message: 'Çok fazla istek',
          hint: 'Lütfen bir süre bekleyip tekrar deneyin',
        },
      }, 429);
    } else {
      current.count++;
    }
    
    await next();
  };
}

// Simple idempotency check (use Redis in production)
const idempotencyStore = new Map<string, any>();

export function idempotency() {
  return async (c: Context, next: Next) => {
    const idempotencyKey = c.req.header('idempotency-key');
    
    if (idempotencyKey) {
      const cached = idempotencyStore.get(idempotencyKey);
      if (cached) {
        return c.json(cached.response, cached.status);
      }
      
      // Store the response after processing
      await next();
      
      // Cache the response (simplified - in production, handle streaming responses)
      const response = await c.res.clone();
      idempotencyStore.set(idempotencyKey, {
        response: await response.json(),
        status: response.status,
        timestamp: Date.now(),
      });
      
      // Clean up old entries (basic TTL)
      setTimeout(() => {
        idempotencyStore.delete(idempotencyKey);
      }, 300000); // 5 minutes
    } else {
      await next();
    }
  };
}

export function telemetry() {
  return async (c: Context, next: Next) => {
    const startTime = Date.now();
    const requestId = c.req.header('x-request-id') || 'unknown';
    
    console.log(`[${requestId}] ${c.req.method} ${c.req.url} - Start`);
    
    await next();
    
    const elapsedMs = Date.now() - startTime;
    console.log(`[${requestId}] ${c.req.method} ${c.req.url} - ${c.res.status} (${elapsedMs}ms)`);
  };
}
