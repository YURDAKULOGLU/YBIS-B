import { createYBISClient, YBISClient } from '@ybis/api-client';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Configuration based on environment
const getApiConfig = () => {
  const isDevelopment = __DEV__;
  
  // For development, use localhost with platform-specific URLs
  if (isDevelopment) {
    if (Platform.OS === 'ios') {
      return {
        baseURL: 'http://localhost:3000',
      };
    } else {
      // Android emulator uses 10.0.2.2 to reach host machine
      return {
        baseURL: 'http://10.0.2.2:3000',
      };
    }
  }
  
  // For production, use your actual API URL
  return {
    baseURL: 'https://api.ybis.app',
  };
};

// Initialize API client
export const apiClient: YBISClient = createYBISClient({
  ...getApiConfig(),
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Storage adapter for React Native
export class AsyncStorageAdapter {
  async getItem(key: string): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(key);
    } catch (error) {
      console.error('AsyncStorage getItem error:', error);
      return null;
    }
  }

  async setItem(key: string, value: string): Promise<void> {
    try {
      await AsyncStorage.setItem(key, value);
    } catch (error) {
      console.error('AsyncStorage setItem error:', error);
    }
  }

  async removeItem(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error('AsyncStorage removeItem error:', error);
    }
  }

  async clear(): Promise<void> {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      console.error('AsyncStorage clear error:', error);
    }
  }
}

export const storage = new AsyncStorageAdapter();

// Auth token management
const AUTH_TOKENS_KEY = 'ybis_auth_tokens';
const USER_DATA_KEY = 'ybis_user_data';

export const authManager = {
  async saveAuth(tokens: any, user: any): Promise<void> {
    try {
      await storage.setItem(AUTH_TOKENS_KEY, JSON.stringify(tokens));
      await storage.setItem(USER_DATA_KEY, JSON.stringify(user));
      apiClient.setAuth(tokens, user);
    } catch (error) {
      console.error('Error saving auth:', error);
    }
  },

  async loadAuth(): Promise<boolean> {
    try {
      const tokensJson = await storage.getItem(AUTH_TOKENS_KEY);
      const userJson = await storage.getItem(USER_DATA_KEY);

      if (tokensJson && userJson) {
        const tokens = JSON.parse(tokensJson);
        const user = JSON.parse(userJson);
        apiClient.setAuth(tokens, user);
        return true;
      }
    } catch (error) {
      console.error('Error loading auth:', error);
    }
    return false;
  },

  async clearAuth(): Promise<void> {
    try {
      await storage.removeItem(AUTH_TOKENS_KEY);
      await storage.removeItem(USER_DATA_KEY);
      apiClient.clearAuth();
    } catch (error) {
      console.error('Error clearing auth:', error);
    }
  },

  isAuthenticated(): boolean {
    return apiClient.getAuthState().isAuthenticated;
  },

  getCurrentUser(): any {
    return apiClient.getAuthState().user;
  },
};

// Initialize auth on app start
authManager.loadAuth();

// API helpers with error handling
export const apiHelpers = {
  handleError(error: any): string {
    if (error.response?.data?.error?.message) {
      return error.response.data.error.message;
    }
    if (error.message) {
      return error.message;
    }
    return 'An unknown error occurred';
  },

  async withErrorHandling<T>(
    apiCall: () => Promise<{ ok: boolean; data?: T; error?: any }>,
    fallbackValue?: T
  ): Promise<{ success: boolean; data?: T; error?: string }> {
    try {
      const response = await apiCall();
      
      if (response.ok && response.data !== undefined) {
        return { success: true, data: response.data };
      } else {
        const errorMessage = response.error?.message || 'API call failed';
        return { success: false, error: errorMessage };
      }
    } catch (error) {
      const errorMessage = this.handleError(error);
      return { 
        success: false, 
        error: errorMessage,
        data: fallbackValue
      };
    }
  },

  generateIdempotencyKey(prefix?: string): string {
    return apiClient.generateIdempotencyKey(prefix);
  },
};

// Export the configured API client
export default apiClient;