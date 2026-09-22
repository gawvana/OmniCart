import { apiClient } from './client';
import { ShoppingList } from '../types';

export const listsApi = {
  getAll: () => apiClient<ShoppingList[]>('/lists/'),
  get: (id: string) => apiClient<ShoppingList>(`/lists/${id}`),
  create: (data: { name: string; emoji?: string; color?: string; is_default?: boolean }) =>
    apiClient<ShoppingList>('/lists/', { method: 'POST', body: data }),
  createList: (data: { name: string; emoji?: string; color?: string; is_default?: boolean }) =>
    apiClient<ShoppingList>('/lists/', { method: 'POST', body: data }),
  update: (id: string, data: Partial<ShoppingList>) =>
    apiClient<ShoppingList>(`/lists/${id}`, { method: 'PATCH', body: data }),
  delete: (id: string) => apiClient<{ success: boolean }>(`/lists/${id}`, { method: 'DELETE' }),
  deleteList: (id: string) => apiClient<{ success: boolean }>(`/lists/${id}`, { method: 'DELETE' }),
  share: (id: string, data: { target_user_id: string; role?: string }) =>
    apiClient<any>(`/lists/${id}/share`, { method: 'POST', body: data }),
  getMembers: (id: string) => apiClient<any[]>(`/lists/${id}/members`),
};
