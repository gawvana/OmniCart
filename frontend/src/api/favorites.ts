import { apiClient } from './client';
export const favoritesApi = {
  get: () => apiClient<any>('/favorites'),
};
