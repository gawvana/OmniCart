import { apiClient } from './client';
export const analyticsApi = {
  getSpending: (period: string = '30d') => apiClient<any>('/analytics/spending', { params: { period } }),
  getStats: (period: string = '30d') => apiClient<any>('/analytics/spending', { params: { period } }),
};
