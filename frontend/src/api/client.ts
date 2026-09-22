import { ApiError } from '../types';

const ENV_BASE = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');
const BASE_URL = ENV_BASE ? (ENV_BASE.includes('/api/v1') ? ENV_BASE : `${ENV_BASE}/api/v1`) : '/api/v1';

export interface ApiClientOptions extends Omit<RequestInit, 'body'> {
  body?: any;
  params?: Record<string, any>;
}

function normalizeData(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(normalizeData);
  }
  if (obj !== null && typeof obj === 'object' && !(obj instanceof Date) && !(obj instanceof Blob)) {
    const res: any = {};
    for (const key of Object.keys(obj)) {
      const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
      const val = normalizeData(obj[key]);
      res[key] = val;
      if (camelKey !== key && res[camelKey] === undefined) {
        res[camelKey] = val;
      }
    }
    if (res.note !== undefined && res.notes === undefined) res.notes = res.note;
    if (res.estimatedPrice !== undefined && res.price === undefined) res.price = res.estimatedPrice;
    return res;
  }
  return obj;
}

export async function apiClient<T>(endpoint: string, options: ApiClientOptions = {}): Promise<T> {
  const { body, params, ...customConfig } = options;
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  let url = cleanEndpoint.startsWith('/api/v1') ? cleanEndpoint : `${BASE_URL}${cleanEndpoint}`;
  url = url.replace(/\/+$/, '');
  
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
      const errObj = typeof errorData.error === 'object' && errorData.error !== null ? errorData.error : null;
      throw {
        error: errObj?.message || (typeof errorData.error === 'string' ? errorData.error : (typeof errorData.detail === 'string' ? errorData.detail : 'Request failed')),
        code: errObj?.code || errorData.code || response.status.toString(),
        details: errObj?.details || errorData.details,
      } as ApiError;
    }
    if (response.status === 204) {
      return undefined as unknown as T;
    }
    const data = await response.json();
    const payload = data && data.data !== undefined ? data.data : data;
    return normalizeData(payload) as T;
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
