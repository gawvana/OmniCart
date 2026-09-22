import { apiClient } from './client';
export const searchApi = {
  query: (q: string) => apiClient<any>('/search/', { params: { q } }),
};
