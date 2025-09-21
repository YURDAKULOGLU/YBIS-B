// Export all API client functionality
export * from './client';
export * from './types';
export * from './endpoints';

// Create a convenience function to initialize the client
import { YBISApiClient } from './client';
import { YBISApiEndpoints } from './endpoints';
import { ApiClientConfig } from './types';

export function createYBISClient(config: ApiClientConfig) {
  const client = new YBISApiClient(config);
  const endpoints = new YBISApiEndpoints(client);
  
  return {
    ...endpoints,
    // Core client methods
    setAuth: client.setAuth.bind(client),
    clearAuth: client.clearAuth.bind(client),
    getAuthState: client.getAuthState.bind(client),
    healthCheck: client.healthCheck.bind(client),
    generateIdempotencyKey: client.generateIdempotencyKey.bind(client),
    // Raw client access if needed
    rawClient: client,
  };
}

export type YBISClient = ReturnType<typeof createYBISClient>;