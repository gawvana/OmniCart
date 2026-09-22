import { apiClient } from './client';
export const budgetApi = {
  get: () => apiClient<any>('/budget/'),
  create: (data: any) => apiClient<any>('/budget/', { method: 'POST', body: data }),
  update: (id: string, data: any) => apiClient<any>(`/budget/${id}`, { method: 'PATCH', body: data }),
  delete: (id: string) => apiClient<any>(`/budget/${id}`, { method: 'DELETE' }),
  status: (listId: string) => apiClient<any>(`/budget/status/${listId}`),
};

