import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { 
  ApiClientConfig, 
  RequestOptions, 
  ApiResponse, 
  ApiError, 
  AuthTokens,
  AuthState 
} from './types';

export class YBISApiClient {
  private axiosInstance: AxiosInstance;
  private config: Required<ApiClientConfig>;
  private authState: AuthState = { isAuthenticated: false };
  private refreshPromise: Promise<void> | null = null;

  constructor(config: ApiClientConfig) {
    this.config = {
      timeout: 30000,
      retries: 3,
      retryDelay: 1000,
      headers: {},
      ...config,
    };

    this.axiosInstance = axios.create({
      baseURL: this.config.baseURL,
      timeout: this.config.timeout,
      headers: {
        'Content-Type': 'application/json',
        ...this.config.headers,
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor for auth
    this.axiosInstance.interceptors.request.use(
      async (config) => {
        if (!(config as any).skipAuth && this.authState.tokens?.accessToken) {
          config.headers.Authorization = `Bearer ${this.authState.tokens.accessToken}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for error handling and token refresh
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        // Handle 401 errors and token refresh
        if (error.response?.status === 401 && !originalRequest._retry && this.authState.tokens?.refreshToken) {
          originalRequest._retry = true;

          try {
            if (!this.refreshPromise) {
              this.refreshPromise = this.refreshToken();
            }
            await this.refreshPromise;
            this.refreshPromise = null;

            // Retry original request with new token
            if (this.authState.tokens?.accessToken) {
              originalRequest.headers.Authorization = `Bearer ${this.authState.tokens.accessToken}`;
              return this.axiosInstance(originalRequest);
            }
          } catch (refreshError) {
            this.clearAuth();
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  private async refreshToken(): Promise<void> {
    if (!this.authState.tokens?.refreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      const response = await this.axiosInstance.post('/auth/refresh', {
        refreshToken: this.authState.tokens.refreshToken,
      });

      if (response.data.ok) {
        this.setAuth(response.data.data.tokens, response.data.data.user);
      } else {
        throw new Error(response.data.error?.message || 'Token refresh failed');
      }
    } catch (error) {
      this.clearAuth();
      throw error;
    }
  }

  public setAuth(tokens: AuthTokens, user?: any): void {
    this.authState = {
      isAuthenticated: true,
      tokens,
      user,
    };
  }

  public clearAuth(): void {
    this.authState = { isAuthenticated: false };
  }

  public getAuthState(): AuthState {
    return { ...this.authState };
  }

  private async makeRequest<T>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    url: string,
    data?: any,
    options: RequestOptions = {}
  ): Promise<ApiResponse<T>> {
    const { idempotencyKey, skipAuth, retries = this.config.retries, retryDelay = this.config.retryDelay, ...axiosOptions } = options;

    const config: AxiosRequestConfig = {
      method,
      url,
      data,
      ...axiosOptions,
    };
    
    // Handle skipAuth separately
    if (skipAuth) {
      (config as any).skipAuth = true;
    }

    if (idempotencyKey) {
      config.headers = {
        ...config.headers,
        'X-Idempotency-Key': idempotencyKey,
      };
    }

    let lastError: any;
    
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const response: AxiosResponse = await this.axiosInstance(config);
        return this.handleResponse<T>(response);
      } catch (error: any) {
        lastError = error;
        
        if (attempt === retries) break;
        
        // Only retry on network errors or 5xx errors
        if (this.shouldRetry(error)) {
          await this.delay(retryDelay * Math.pow(2, attempt));
          continue;
        }
        
        break;
      }
    }

    return this.handleError(lastError);
  }

  private shouldRetry(error: any): boolean {
    if (!error.response) return true; // Network error
    const status = error.response.status;
    return status >= 500 || status === 429; // Server error or rate limit
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private handleResponse<T>(response: AxiosResponse): ApiResponse<T> {
    const data = response.data;
    
    // If response follows our API format
    if (typeof data === 'object' && 'ok' in data) {
      return data as ApiResponse<T>;
    }
    
    // For direct responses
    return {
      ok: true,
      data: data as T,
    };
  }

  private handleError(error: any): ApiResponse {
    let apiError: ApiError;

    if (error.response) {
      const data = error.response.data;
      
      if (data && typeof data === 'object' && 'error' in data) {
        apiError = data.error;
      } else {
        apiError = {
          code: 'HTTP_ERROR',
          message: error.message || 'Request failed',
          status: error.response.status,
        };
      }
    } else if (error.request) {
      apiError = {
        code: 'NETWORK_ERROR',
        message: 'Network request failed',
      };
    } else {
      apiError = {
        code: 'REQUEST_ERROR',
        message: error.message || 'Unknown error occurred',
      };
    }

    return {
      ok: false,
      error: apiError,
    };
  }

  // Public request methods
  public async get<T>(url: string, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.makeRequest<T>('GET', url, undefined, options);
  }

  public async post<T>(url: string, data?: any, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.makeRequest<T>('POST', url, data, options);
  }

  public async put<T>(url: string, data?: any, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.makeRequest<T>('PUT', url, data, options);
  }

  public async delete<T>(url: string, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.makeRequest<T>('DELETE', url, undefined, options);
  }

  // Utility methods
  public updateConfig(config: Partial<ApiClientConfig>): void {
    this.config = { ...this.config, ...config };
    
    if (config.baseURL) {
      this.axiosInstance.defaults.baseURL = config.baseURL;
    }
    
    if (config.timeout) {
      this.axiosInstance.defaults.timeout = config.timeout;
    }
    
    if (config.headers) {
      this.axiosInstance.defaults.headers = {
        ...this.axiosInstance.defaults.headers,
        ...config.headers,
      };
    }
  }

  public getConfig(): ApiClientConfig {
    return { ...this.config };
  }

  // Health check
  public async healthCheck(): Promise<ApiResponse<{ status: string; timestamp: string }>> {
    return this.get('/health');
  }

  // Generate idempotency key
  public generateIdempotencyKey(prefix?: string): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 9);
    return prefix ? `${prefix}_${timestamp}_${random}` : `${timestamp}_${random}`;
  }
}