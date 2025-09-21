import { ApiResponse } from '../types';

// API Response helpers
export function Ok<T>(data: T): ApiResponse<T> {
  return {
    ok: true,
    data,
  };
}

export function Err(code: string, message: string, details?: any): ApiResponse {
  return {
    ok: false,
    error: {
      code,
      message,
      details,
    },
  };
}

// Generic utilities
export function pick<T extends object, K extends keyof T>(obj: T, keys: readonly K[]): Pick<T, K> {
  const out = {} as Pick<T, K>;
  for (const key of keys) {
    if (key in obj) {
      out[key] = obj[key];
    }
  }
  return out;
}

export function pickRecord<V>(obj: Record<string, V>, keys: readonly string[]): Record<string, V> {
  const out: Record<string, V> = {};
  for (const k of keys) if (k in obj) out[k] = obj[k]!;
  return out;
}

// Date utilities
export function formatDate(date: string | Date, locale: string = 'en-US'): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString(locale);
}

export function formatDateTime(date: string | Date, locale: string = 'en-US'): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleString(locale);
}

// String utilities
export function truncate(text: string, maxLength: number, suffix: string = '...'): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - suffix.length) + suffix;
}

export function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

// ID generation
export function generateId(prefix?: string): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substr(2, 9);
  return prefix ? `${prefix}_${timestamp}_${random}` : `${timestamp}_${random}`;
}

