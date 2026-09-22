import { apiClient } from './client';
export const profileApi = {
  get: () => apiClient<any>('/profile'),
  update: (data: any) => apiClient<any>('/profile', { method: 'PATCH', body: data }),
};
