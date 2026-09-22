import { apiClient } from './client';
export const familyApi = {
  get: () => apiClient<any>('/family'),
  create: (data: any) => apiClient<any>('/family', { method: 'POST', body: data }),
  invite: (data: any) => apiClient<any>('/family/invite', { method: 'POST', body: data }),
};
