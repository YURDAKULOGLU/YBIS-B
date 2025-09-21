import React from 'react';

interface StateProviderProps {
  children: React.ReactNode;
}

/**
 * Global state provider for Zustand stores
 * In Zustand v5, stores are already global, so this is mainly for 
 * future state initialization and cleanup if needed
 */
export function StateProvider({ children }: StateProviderProps) {
  return <React.Fragment>{children}</React.Fragment>;
}
