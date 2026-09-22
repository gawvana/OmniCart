import { apiClient } from './client';
import { ShoppingList } from '../types';
export const listsApi = {
  getAll: () => apiClient<ShoppingList[]>('/lists'),
  create: (data: { name: string; emoji?: string; color?: string }) => apiClient<ShoppingList>('/lists', { method: 'POST', body: data }),
  update: (id: string, data: Partial<ShoppingList>) => apiClient<ShoppingList>(`/lists/${id}`, { method: 'PATCH', body: data }),
  getMembers: (id: string) => apiClient<any[]>(`/lists/${id}/members`),
};
