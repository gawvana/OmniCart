import { apiClient } from './client';
export const budgetApi = {
  get: () => apiClient<any>('/budget'),
  create: (data: any) => apiClient<any>('/budget', { method: 'POST', body: data }),
};
