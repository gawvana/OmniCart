import { apiClient } from './client';
export const authApi = {
  validate: (initData: string) => apiClient<any>('/auth/validate', { method: 'POST', body: { init_data: initData } }),
};
