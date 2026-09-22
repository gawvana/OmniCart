import { apiClient } from './client';
export const notificationsApi = {
  get: () => apiClient<any>('/notifications'),
};
