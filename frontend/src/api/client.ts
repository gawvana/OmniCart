import { ApiError } from '../types';

const BASE_URL = '/api';

export interface ApiClientOptions extends Omit<RequestInit, 'body'> {
  body?: any;
  params?: Record<string, any>;
}

export async function apiClient<T>(endpoint: string, options: ApiClientOptions = {}): Promise<T> {
  const { body, params, ...customConfig } = options;
  let url = `${BASE_URL}${endpoint}`;
  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null) {
        searchParams.append(key, String(val));
      }
    });
    const qs = searchParams.toString();
    if (qs) {
      url += (url.includes('?') ? '&' : '?') + qs;
    }
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(customConfig.headers as Record<string, string>),
  };
  
  const initData = typeof window !== 'undefined' ? (window as any).Telegram?.WebApp?.initData : undefined;
  if (initData) {
    headers['X-Telegram-Init-Data'] = initData;
  }

  const config: RequestInit = {
    ...customConfig,
    headers,
  };
  if (body !== undefined) {
    config.body = typeof body === 'string' ? body : JSON.stringify(body);
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);
  config.signal = controller.signal;

  try {
    const response = await fetch(url, config);
    clearTimeout(timeoutId);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw {
        error: errorData.error || 'Request failed',
        code: errorData.code || response.status.toString(),
        details: errorData.details,
      } as ApiError;
    }
    if (response.status === 204) {
      return undefined as unknown as T;
    }
    const data = await response.json();
    return data.data !== undefined ? data.data : data;
  } catch (error) {
    clearTimeout(timeoutId);
    if ((error as Error).name === 'AbortError') {
      throw { error: 'Request timeout', code: 'TIMEOUT' } as ApiError;
    }
    throw error;
  }
}

export const api = {
  get: <T>(endpoint: string, options?: ApiClientOptions) => apiClient<T>(endpoint, { ...options, method: 'GET' }),
  post: <T>(endpoint: string, body?: any, options?: ApiClientOptions) => apiClient<T>(endpoint, { ...options, method: 'POST', body }),
  patch: <T>(endpoint: string, body?: any, options?: ApiClientOptions) => apiClient<T>(endpoint, { ...options, method: 'PATCH', body }),
  put: <T>(endpoint: string, body?: any, options?: ApiClientOptions) => apiClient<T>(endpoint, { ...options, method: 'PUT', body }),
  delete: <T>(endpoint: string, options?: ApiClientOptions) => apiClient<T>(endpoint, { ...options, method: 'DELETE' }),
};
