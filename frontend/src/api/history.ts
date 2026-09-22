import { apiClient } from './client';
export const historyApi = {
  get: (params: any) => apiClient<any>('/history', { params }),
};
