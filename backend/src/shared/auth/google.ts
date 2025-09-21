import axios from 'axios';
import { Redis } from '@upstash/redis';
import { createHmac, randomBytes } from 'crypto';

// Redis client for token storage
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

// Google OAuth configuration
const GOOGLE_CONFIG = {
  clientId: process.env.GOOGLE_CLIENT_ID!,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
  redirectUri: process.env.GOOGLE_REDIRECT_URI!,
  tokenUrl: 'https://oauth2.googleapis.com/token',
  userInfoUrl: 'https://www.googleapis.com/oauth2/v2/userinfo',
  scopes: [
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile',
    'https://www.googleapis.com/auth/gmail.readonly',
    'https://www.googleapis.com/auth/gmail.send',
    'https://www.googleapis.com/auth/calendar',
    'https://www.googleapis.com/auth/tasks',
  ],
};

// Encryption for refresh tokens
const ENCRYPTION_KEY = process.env.TOKEN_ENCRYPTION_KEY || 'default-key-change-in-production';

function encrypt(text: string): string {
  const algorithm = 'aes-256-gcm';
  const key = Buffer.from(ENCRYPTION_KEY.padEnd(32, '0').slice(0, 32));
  const iv = randomBytes(16);
  
  const cipher = createHmac('sha256', key);
  cipher.update(text);
  const encrypted = cipher.digest('hex');
  
  return `${iv.toString('hex')}:${encrypted}`;
}

function decrypt(encryptedText: string): string {
  try {
    const [ivHex, encrypted] = encryptedText.split(':');
    if (!ivHex || !encrypted) {
      throw new Error('Invalid encrypted format');
    }
    
    const key = Buffer.from(ENCRYPTION_KEY.padEnd(32, '0').slice(0, 32));
    const decipher = createHmac('sha256', key);
    decipher.update(encrypted, 'hex');
    
    return decipher.digest('hex');
  } catch (error) {
    console.error('Decryption failed:', error);
    throw new Error('Failed to decrypt token');
  }
}

export interface GoogleTokens {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  token_type: string;
  scope?: string;
  id_token?: string;
}

export interface GoogleUserInfo {
  id: string;
  email: string;
  verified_email: boolean;
  name: string;
  given_name: string;
  family_name: string;
  picture: string;
  locale: string;
}

export interface StoredTokenData {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  scope: string;
  userInfo: GoogleUserInfo;
}

/**
 * Exchange authorization code for tokens
 */
export async function getTokens(authCode: string): Promise<GoogleTokens> {
  if (!authCode) {
    throw new Error('Authorization code is required');
  }

  try {
    const response = await axios.post(GOOGLE_CONFIG.tokenUrl, {
      code: authCode,
      client_id: GOOGLE_CONFIG.clientId,
      client_secret: GOOGLE_CONFIG.clientSecret,
      redirect_uri: GOOGLE_CONFIG.redirectUri,
      grant_type: 'authorization_code',
    }, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    const tokens: GoogleTokens = response.data;
    
    if (!tokens.access_token) {
      throw new Error('No access token received from Google');
    }

    return tokens;
    
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const errorData = error.response?.data;
      throw new Error(`Google OAuth error: ${errorData?.error_description || errorData?.error || error.message}`);
    }
    throw error;
  }
}

/**
 * Refresh access token using refresh token
 */
export async function refreshAccessToken(refreshToken: string): Promise<GoogleTokens> {
  if (!refreshToken) {
    throw new Error('Refresh token is required');
  }

  try {
    const response = await axios.post(GOOGLE_CONFIG.tokenUrl, {
      refresh_token: refreshToken,
      client_id: GOOGLE_CONFIG.clientId,
      client_secret: GOOGLE_CONFIG.clientSecret,
      grant_type: 'refresh_token',
    }, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    const tokens: GoogleTokens = response.data;
    
    if (!tokens.access_token) {
      throw new Error('No access token received from Google');
    }

    return tokens;
    
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const errorData = error.response?.data;
      
      // Handle specific error cases
      if (errorData?.error === 'invalid_grant') {
        throw new Error('Refresh token is invalid or expired. User needs to re-authorize.');
      }
      
      throw new Error(`Google token refresh error: ${errorData?.error_description || errorData?.error || error.message}`);
    }
    throw error;
  }
}

/**
 * Get user information using access token
 */
export async function getUserInfo(accessToken: string): Promise<GoogleUserInfo> {
  if (!accessToken) {
    throw new Error('Access token is required');
  }

  try {
    const response = await axios.get(GOOGLE_CONFIG.userInfoUrl, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const userInfo: GoogleUserInfo = response.data;
    
    if (!userInfo.email) {
      throw new Error('No user email received from Google');
    }

    return userInfo;
    
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const errorData = error.response?.data;
      throw new Error(`Google user info error: ${errorData?.error_description || errorData?.error || error.message}`);
    }
    throw error;
  }
}

/**
 * Store tokens securely in Redis
 */
export async function storeTokens(
  userId: string,
  tokens: GoogleTokens,
  userInfo: GoogleUserInfo
): Promise<void> {
  if (!userId || !tokens.access_token) {
    throw new Error('User ID and access token are required');
  }

  const key = `google_tokens:${userId}`;
  const expiresAt = Date.now() + (tokens.expires_in * 1000);
  
  const tokenData: StoredTokenData = {
    accessToken: tokens.access_token,
    refreshToken: tokens.refresh_token ? encrypt(tokens.refresh_token) : '',
    expiresAt,
    scope: tokens.scope || GOOGLE_CONFIG.scopes.join(' '),
    userInfo,
  };

  try {
    const client = getRedisClient();
    
    // Store with TTL slightly longer than access token expiry
    const ttlSeconds = Math.max(tokens.expires_in + 300, 3600); // At least 1 hour
    
    await client.setex(key, ttlSeconds, JSON.stringify(tokenData));
    
  } catch (error) {
    console.error('Failed to store tokens:', error);
    throw new Error('Failed to store authentication tokens');
  }
}

/**
 * Get stored tokens for a user
 */
export async function getStoredTokens(userId: string): Promise<StoredTokenData | null> {
  if (!userId) {
    throw new Error('User ID is required');
  }

  const key = `google_tokens:${userId}`;

  try {
    const client = getRedisClient();
    const data = await client.get(key);
    
    if (!data) {
      return null;
    }

    const tokenData: StoredTokenData = JSON.parse(data as string);
    
    // Decrypt refresh token if present
    if (tokenData.refreshToken) {
      try {
        tokenData.refreshToken = decrypt(tokenData.refreshToken);
      } catch (error) {
        console.error('Failed to decrypt refresh token:', error);
        // Continue without refresh token
        tokenData.refreshToken = '';
      }
    }

    return tokenData;
    
  } catch (error) {
    console.error('Failed to get stored tokens:', error);
    return null;
  }
}

/**
 * Get valid access token for a user (with automatic refresh)
 */
export async function getValidAccessToken(userId: string): Promise<string> {
  const storedTokens = await getStoredTokens(userId);
  
  if (!storedTokens) {
    throw new Error('No stored tokens found. User needs to authenticate.');
  }

  // Check if access token is still valid (with 5-minute buffer)
  const buffer = 5 * 60 * 1000; // 5 minutes
  if (Date.now() + buffer < storedTokens.expiresAt) {
    return storedTokens.accessToken;
  }

  // Access token is expired or expiring soon, try to refresh
  if (!storedTokens.refreshToken) {
    throw new Error('Access token expired and no refresh token available. User needs to re-authenticate.');
  }

  try {
    const newTokens = await refreshAccessToken(storedTokens.refreshToken);
    
    // Update stored tokens
    await storeTokens(userId, newTokens, storedTokens.userInfo);
    
    return newTokens.access_token;
    
  } catch (error) {
    console.error('Failed to refresh access token:', error);
    throw new Error('Authentication expired. User needs to re-authenticate.');
  }
}

/**
 * Revoke Google tokens for a user
 */
export async function revokeTokens(userId: string): Promise<void> {
  const storedTokens = await getStoredTokens(userId);
  
  if (storedTokens?.refreshToken) {
    try {
      // Revoke the refresh token with Google
      await axios.post('https://oauth2.googleapis.com/revoke', null, {
        params: {
          token: storedTokens.refreshToken,
        },
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });
    } catch (error) {
      console.warn('Failed to revoke tokens with Google:', error);
      // Continue with local cleanup
    }
  }

  // Remove tokens from storage
  const key = `google_tokens:${userId}`;
  
  try {
    const client = getRedisClient();
    await client.del(key);
  } catch (error) {
    console.error('Failed to delete stored tokens:', error);
  }
}

/**
 * Generate Google OAuth authorization URL
 */
export function getAuthUrl(state?: string): string {
  const params = new URLSearchParams({
    client_id: GOOGLE_CONFIG.clientId,
    redirect_uri: GOOGLE_CONFIG.redirectUri,
    scope: GOOGLE_CONFIG.scopes.join(' '),
    response_type: 'code',
    access_type: 'offline',
    prompt: 'consent',
  });

  if (state) {
    params.append('state', state);
  }

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

/**
 * Validate required environment variables
 */
export function validateConfig(): { valid: boolean; missing: string[] } {
  const required = ['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET', 'GOOGLE_REDIRECT_URI'];
  const missing = required.filter(key => !process.env[key]);
  
  return {
    valid: missing.length === 0,
    missing,
  };
}

/**
 * Check if user has valid authentication
 */
export async function isAuthenticated(userId: string): Promise<boolean> {
  try {
    await getValidAccessToken(userId);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get authentication status and user info
 */
export async function getAuthStatus(userId: string): Promise<{
  authenticated: boolean;
  userInfo?: GoogleUserInfo;
  expiresAt?: number;
  scopes?: string[];
}> {
  const storedTokens = await getStoredTokens(userId);
  
  if (!storedTokens) {
    return { authenticated: false };
  }

  try {
    // Try to get a valid access token (this will refresh if needed)
    await getValidAccessToken(userId);
    
    return {
      authenticated: true,
      userInfo: storedTokens.userInfo,
      expiresAt: storedTokens.expiresAt,
      scopes: storedTokens.scope.split(' '),
    };
  } catch {
    return { authenticated: false };
  }
}