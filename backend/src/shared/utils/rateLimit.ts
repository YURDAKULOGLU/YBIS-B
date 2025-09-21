import { Redis } from '@upstash/redis';

// Redis client for rate limiting
let redis: Redis | null = null;

function getRedisClient(): Redis {
  if (!redis) {
    const redisUrl = process.env.REDIS_URL;
    if (!redisUrl) {
      throw new Error('REDIS_URL environment variable is not set');
    }
    redis = Redis.fromEnv();
  }
  return redis;
}

// In-memory fallback for development
const memoryStore = new Map<string, { requests: number[]; windowStart: number }>();

function cleanupMemoryStore() {
  const now = Date.now();
  for (const [key, value] of memoryStore.entries()) {
    // Clean up entries older than 1 hour
    if (now - value.windowStart > 3600000) {
      memoryStore.delete(key);
    }
  }
}

// Rate limit configurations
export const RATE_LIMITS = {
  chat: {
    requests: 30,
    windowSec: 600, // 10 minutes
    burst: 5,
  },
  tool: {
    requests: 60,
    windowSec: 600, // 10 minutes  
    burst: 10,
  },
  auth: {
    requests: 10,
    windowSec: 300, // 5 minutes
    burst: 3,
  },
} as const;

export type RateLimitBucket = keyof typeof RATE_LIMITS;

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: number; // Unix timestamp when limit resets
  retryAfter?: number; // Seconds to wait before retry (if not allowed)
  backoffSuggestion?: {
    baseDelayMs: number;
    jitterMs: number;
    maxRetries: number;
  };
}

/**
 * Check if a user is allowed to make a request within rate limits
 * @param userId User identifier
 * @param bucket Rate limit bucket (chat, tool, auth)
 * @param customLimit Optional custom limit override
 * @param customWindowSec Optional custom window override
 * @returns Rate limit result
 */
export async function allow(
  userId: string,
  bucket: RateLimitBucket,
  customLimit?: number,
  customWindowSec?: number
): Promise<RateLimitResult> {
  const config = RATE_LIMITS[bucket];
  const limit = customLimit ?? config.requests;
  const windowSec = customWindowSec ?? config.windowSec;
  const burstLimit = config.burst;
  
  const key = `ratelimit:${bucket}:${userId}`;
  const now = Date.now();
  const windowMs = windowSec * 1000;
  const windowStart = Math.floor(now / windowMs) * windowMs;
  const resetTime = windowStart + windowMs;
  
  try {
    const client = getRedisClient();
    
    // Use Redis pipeline for atomic operations
    const pipeline = client.pipeline();
    
    // Get current window data
    pipeline.hgetall(key);
    
    const results = await pipeline.exec();
    const windowData = results[0] as { count?: string; window?: string; burst?: string } | null;
    
    let currentCount = 0;
    let burstCount = 0;
    let isNewWindow = true;
    
    if (windowData?.window) {
      const storedWindow = parseInt(windowData.window);
      if (storedWindow === windowStart) {
        // Same window
        isNewWindow = false;
        currentCount = parseInt(windowData.count || '0');
        burstCount = parseInt(windowData.burst || '0');
      }
    }
    
    // Check burst limit first (for immediate requests)
    const timeSinceWindowStart = now - windowStart;
    const burstWindowMs = 60000; // 1 minute burst window
    
    if (timeSinceWindowStart < burstWindowMs && burstCount >= burstLimit) {
      const retryAfter = Math.ceil((burstWindowMs - timeSinceWindowStart) / 1000);
      return {
        allowed: false,
        remaining: 0,
        resetTime: Math.floor(resetTime / 1000),
        retryAfter,
        backoffSuggestion: generateBackoffSuggestion(burstCount, burstLimit),
      };
    }
    
    // Check main rate limit
    if (currentCount >= limit) {
      const retryAfter = Math.ceil((resetTime - now) / 1000);
      return {
        allowed: false,
        remaining: 0,
        resetTime: Math.floor(resetTime / 1000),
        retryAfter,
        backoffSuggestion: generateBackoffSuggestion(currentCount, limit),
      };
    }
    
    // Allow the request - update counters
    const newCount = currentCount + 1;
    const newBurstCount = timeSinceWindowStart < burstWindowMs ? burstCount + 1 : 1;
    
    // Store updated counts
    const updatePipeline = client.pipeline();
    updatePipeline.hset(key, {
      count: newCount.toString(),
      window: windowStart.toString(),
      burst: newBurstCount.toString(),
    });
    updatePipeline.expire(key, windowSec + 60); // TTL slightly longer than window
    
    await updatePipeline.exec();
    
    return {
      allowed: true,
      remaining: limit - newCount,
      resetTime: Math.floor(resetTime / 1000),
    };
    
  } catch (error) {
    console.warn('Redis unavailable, falling back to memory store:', error);
    
    // Fallback to in-memory rate limiting
    return allowMemoryFallback(userId, bucket, limit, windowSec, burstLimit);
  }
}

/**
 * Memory-based rate limiting fallback
 */
function allowMemoryFallback(
  userId: string,
  bucket: RateLimitBucket,
  limit: number,
  windowSec: number,
  burstLimit: number
): RateLimitResult {
  cleanupMemoryStore();
  
  const key = `${bucket}:${userId}`;
  const now = Date.now();
  const windowMs = windowSec * 1000;
  const windowStart = Math.floor(now / windowMs) * windowMs;
  const resetTime = windowStart + windowMs;
  
  const userData = memoryStore.get(key);
  
  if (!userData || userData.windowStart !== windowStart) {
    // New window
    memoryStore.set(key, {
      requests: [now],
      windowStart,
    });
    
    return {
      allowed: true,
      remaining: limit - 1,
      resetTime: Math.floor(resetTime / 1000),
    };
  }
  
  // Clean old requests from current window
  userData.requests = userData.requests.filter(time => time >= windowStart);
  
  // Check burst limit (requests in last minute)
  const recentRequests = userData.requests.filter(time => now - time < 60000);
  if (recentRequests.length >= burstLimit) {
    const oldestRecent = Math.min(...recentRequests);
    const retryAfter = Math.ceil((60000 - (now - oldestRecent)) / 1000);
    
    return {
      allowed: false,
      remaining: 0,
      resetTime: Math.floor(resetTime / 1000),
      retryAfter,
      backoffSuggestion: generateBackoffSuggestion(recentRequests.length, burstLimit),
    };
  }
  
  // Check main limit
  if (userData.requests.length >= limit) {
    const retryAfter = Math.ceil((resetTime - now) / 1000);
    
    return {
      allowed: false,
      remaining: 0,
      resetTime: Math.floor(resetTime / 1000),
      retryAfter,
      backoffSuggestion: generateBackoffSuggestion(userData.requests.length, limit),
    };
  }
  
  // Allow request
  userData.requests.push(now);
  
  return {
    allowed: true,
    remaining: limit - userData.requests.length,
    resetTime: Math.floor(resetTime / 1000),
  };
}

/**
 * Generate exponential backoff suggestion with jitter
 */
function generateBackoffSuggestion(currentCount: number, limit: number): {
  baseDelayMs: number;
  jitterMs: number;
  maxRetries: number;
} {
  const overageRatio = currentCount / limit;
  const baseDelayMs = Math.min(1000 * Math.pow(2, Math.floor(overageRatio)), 30000); // Cap at 30 seconds
  const jitterMs = Math.floor(baseDelayMs * 0.1); // 10% jitter
  const maxRetries = 3;
  
  return {
    baseDelayMs,
    jitterMs,
    maxRetries,
  };
}

/**
 * Apply exponential backoff with jitter
 */
export function applyBackoff(
  attempt: number,
  baseDelayMs: number,
  jitterMs: number,
  maxRetries: number
): { delayMs: number; shouldRetry: boolean } {
  if (attempt >= maxRetries) {
    return { delayMs: 0, shouldRetry: false };
  }
  
  const exponentialDelay = baseDelayMs * Math.pow(2, attempt);
  const jitter = Math.random() * jitterMs;
  const delayMs = exponentialDelay + jitter;
  
  return {
    delayMs: Math.min(delayMs, 60000), // Cap at 1 minute
    shouldRetry: true,
  };
}

/**
 * Get current rate limit status for a user
 */
export async function getStatus(
  userId: string,
  bucket: RateLimitBucket
): Promise<{
  requests: number;
  limit: number;
  remaining: number;
  resetTime: number;
  windowSec: number;
}> {
  const config = RATE_LIMITS[bucket];
  const limit = config.requests;
  const windowSec = config.windowSec;
  
  const key = `ratelimit:${bucket}:${userId}`;
  const now = Date.now();
  const windowMs = windowSec * 1000;
  const windowStart = Math.floor(now / windowMs) * windowMs;
  const resetTime = windowStart + windowMs;
  
  try {
    const client = getRedisClient();
    const windowData = await client.hgetall(key) as { count?: string; window?: string } | null;
    
    let currentCount = 0;
    
    if (windowData?.window) {
      const storedWindow = parseInt(windowData.window);
      if (storedWindow === windowStart) {
        currentCount = parseInt(windowData.count || '0');
      }
    }
    
    return {
      requests: currentCount,
      limit,
      remaining: Math.max(0, limit - currentCount),
      resetTime: Math.floor(resetTime / 1000),
      windowSec,
    };
    
  } catch (error) {
    console.warn('Failed to get rate limit status:', error);
    
    // Return default status
    return {
      requests: 0,
      limit,
      remaining: limit,
      resetTime: Math.floor(resetTime / 1000),
      windowSec,
    };
  }
}

/**
 * Reset rate limit for a user (admin function)
 */
export async function reset(userId: string, bucket: RateLimitBucket): Promise<void> {
  const key = `ratelimit:${bucket}:${userId}`;
  
  try {
    const client = getRedisClient();
    await client.del(key);
    
  } catch (error) {
    console.warn('Failed to reset rate limit:', error);
    
    // Fallback: remove from memory store
    const memKey = `${bucket}:${userId}`;
    memoryStore.delete(memKey);
  }
}

/**
 * Middleware function to check rate limits in API handlers
 */
export async function checkRateLimit(
  userId: string,
  bucket: RateLimitBucket,
  customLimit?: number,
  customWindowSec?: number
): Promise<{ allowed: boolean; headers: Record<string, string>; error?: any }> {
  const result = await allow(userId, bucket, customLimit, customWindowSec);
  
  const headers: Record<string, string> = {
    'X-RateLimit-Limit': (customLimit ?? RATE_LIMITS[bucket].requests).toString(),
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': result.resetTime.toString(),
  };
  
  if (!result.allowed) {
    headers['Retry-After'] = (result.retryAfter || 60).toString();
    
    const error = {
      code: 'RATE_LIMIT_EXCEEDED',
      message: `Rate limit exceeded for ${bucket}`,
      hint: result.backoffSuggestion 
        ? `Try again in ${result.retryAfter} seconds. Use exponential backoff with ${result.backoffSuggestion.baseDelayMs}ms base delay.`
        : `Try again in ${result.retryAfter} seconds.`,
      retryAfter: result.retryAfter,
      backoff: result.backoffSuggestion,
    };
    
    return { allowed: false, headers, error };
  }
  
  return { allowed: true, headers };
}

// Cleanup function for graceful shutdown
export async function cleanup(): Promise<void> {
  memoryStore.clear();
  // Redis connections are automatically managed by Upstash
}