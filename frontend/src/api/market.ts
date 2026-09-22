import { apiClient } from './client';
export const marketApi = {
  get: () => apiClient<any>('/market'),
};
