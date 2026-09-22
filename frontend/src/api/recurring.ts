import { apiClient } from './client';

export const recurringApi = {
  get: () => apiClient<any>('/recurring/'),
  getSuggestions: () => apiClient<any>('/recurring/suggestions'),
  calculate: () => apiClient<any>('/recurring/calculate', { method: 'POST' }),
  accept: (id: string) => apiClient<any>(`/recurring/suggestions/${id}/accept`, { method: 'POST' }),
  dismiss: (id: string) => apiClient<any>(`/recurring/suggestions/${id}/dismiss`, { method: 'POST' }),
};
