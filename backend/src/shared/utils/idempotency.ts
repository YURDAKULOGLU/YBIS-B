import { Redis } from '@upstash/redis';

// Redis client for idempotency key storage
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

// In-memory fallback for development (if Redis is not available)
const memoryStore = new Map<string, { timestamp: number; ttl: number }>();

function cleanupMemoryStore() {
  const now = Date.now();
  for (const [key, value] of memoryStore.entries()) {
    if (now > value.timestamp + value.ttl * 1000) {
      memoryStore.delete(key);
    }
  }
}

/**
 * Check if an idempotency key has been used and set it if not
 * @param key Idempotency key
 * @param ttlSec Time to live in seconds (default: 24 hours)
 * @returns true if key was successfully set (first time), false if already exists
 */
export async function checkAndSet(key: string, ttlSec: number = 86400): Promise<boolean> {
  if (!key || key.trim().length === 0) {
    throw new Error('Idempotency key cannot be empty');
  }

  const prefixedKey = `idempotency:${key}`;
  
  try {
    const client = getRedisClient();
    
    // Use SET with NX (only set if not exists) and EX (expire time in seconds)
    const result = await client.set(prefixedKey, '1', { nx: true, ex: ttlSec });
    
    // Redis returns 'OK' if the key was set, null if it already existed
    return result === 'OK';
    
  } catch (error) {
    console.warn('Redis unavailable, falling back to memory store:', error);
    
    // Fallback to in-memory store
    cleanupMemoryStore();
    
    const now = Date.now();
    const existing = memoryStore.get(prefixedKey);
    
    if (existing && now <= existing.timestamp + existing.ttl * 1000) {
      return false; // Key already exists and hasn't expired
    }
    
    // Set the key in memory store
    memoryStore.set(prefixedKey, { timestamp: now, ttl: ttlSec });
    return true;
  }
}

/**
 * Get the stored result for an idempotency key
 * @param key Idempotency key
 * @returns Stored result or null if not found
 */
export async function getStoredResult(key: string): Promise<any | null> {
  if (!key || key.trim().length === 0) {
    return null;
  }

  const resultKey = `idempotency_result:${key}`;
  
  try {
    const client = getRedisClient();
    const result = await client.get(resultKey);
    
    if (result) {
      return JSON.parse(result as string);
    }
    
    return null;
    
  } catch (error) {
    console.warn('Failed to get stored result:', error);
    return null;
  }
}

/**
 * Store a result for an idempotency key
 * @param key Idempotency key
 * @param result Result to store
 * @param ttlSec Time to live in seconds (default: 24 hours)
 */
export async function storeResult(key: string, result: any, ttlSec: number = 86400): Promise<void> {
  if (!key || key.trim().length === 0) {
    return;
  }

  const resultKey = `idempotency_result:${key}`;
  
  try {
    const client = getRedisClient();
    await client.set(resultKey, JSON.stringify(result), { ex: ttlSec });
    
  } catch (error) {
    console.warn('Failed to store result:', error);
    // Don't throw error here as it's not critical for functionality
  }
}

/**
 * Delete an idempotency key and its stored result
 * @param key Idempotency key
 */
export async function deleteKey(key: string): Promise<void> {
  if (!key || key.trim().length === 0) {
    return;
  }

  const prefixedKey = `idempotency:${key}`;
  const resultKey = `idempotency_result:${key}`;
  
  try {
    const client = getRedisClient();
    await Promise.all([
      client.del(prefixedKey),
      client.del(resultKey)
    ]);
    
  } catch (error) {
    console.warn('Failed to delete idempotency key:', error);
    
    // Fallback: remove from memory store
    memoryStore.delete(prefixedKey);
  }
}

/**
 * Generate a unique idempotency key based on user and operation
 * @param userId User identifier
 * @param operation Operation type (e.g., 'create_event', 'send_email')
 * @param params Operation parameters (will be hashed)
 * @returns Generated idempotency key
 */
export function generateIdempotencyKey(userId: string, operation: string, params: any = {}): string {
  const timestamp = Date.now();
  const paramsHash = Buffer.from(JSON.stringify(params)).toString('base64').slice(0, 16);
  
  return `${userId}_${operation}_${timestamp}_${paramsHash}`;
}

/**
 * Validate idempotency key format
 * @param key Idempotency key to validate
 * @returns true if valid, false otherwise
 */
export function validateIdempotencyKey(key: string): boolean {
  if (!key || typeof key !== 'string') {
    return false;
  }
  
  // Key should be at least 10 characters and contain only alphanumeric, underscore, and dash
  const keyPattern = /^[a-zA-Z0-9_-]{10,}$/;
  return keyPattern.test(key);
}

/**
 * Middleware to check idempotency for create operations
 * Returns the stored result if key exists, null if this is the first request
 */
export async function checkIdempotency(
  idempotencyKey: string,
  ttlSec: number = 86400
): Promise<{ isFirst: boolean; storedResult?: any }> {
  if (!validateIdempotencyKey(idempotencyKey)) {
    throw new Error('Invalid idempotency key format');
  }
  
  // Check if this is the first request with this key
  const isFirst = await checkAndSet(idempotencyKey, ttlSec);
  
  if (!isFirst) {
    // Key exists, try to get stored result
    const storedResult = await getStoredResult(idempotencyKey);
    return { isFirst: false, storedResult };
  }
  
  return { isFirst: true };
}

/**
 * Complete an idempotent operation by storing the result
 */
export async function completeIdempotentOperation(
  idempotencyKey: string,
  result: any,
  ttlSec: number = 86400
): Promise<void> {
  await storeResult(idempotencyKey, result, ttlSec);
}

// Cleanup function for graceful shutdown
export async function cleanup(): Promise<void> {
  memoryStore.clear();
  // Redis connections are automatically managed by Upstash
}