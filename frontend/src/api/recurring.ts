import { apiClient } from './client';
export const recurringApi = {
  get: () => apiClient<any>('/recurring'),
  create: (data: any) => apiClient<any>('/recurring', { method: 'POST', body: data }),
};
