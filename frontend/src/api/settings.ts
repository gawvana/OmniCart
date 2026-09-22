import { apiClient } from './client';
export const settingsApi = {
  get: () => apiClient<any>('/settings'),
  update: (data: any) => apiClient<any>('/settings', { method: 'PATCH', body: data }),
};
