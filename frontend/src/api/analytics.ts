import { apiClient } from './client';
export const analyticsApi = {
  getStats: (period: string) => apiClient<any>('/analytics/stats', { params: { period } }),
};
