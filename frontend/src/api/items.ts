import { apiClient } from './client';
import { ShoppingItem } from '../types';
export type CreateItemRequest = Omit<ShoppingItem, 'id' | 'createdAt' | 'updatedAt' | 'isPurchased' | 'listId'>;
export const itemsApi = {
  getByList: (listId: string, includePurchased?: boolean) => apiClient<ShoppingItem[]>(`/items/${listId}`, { params: { include_purchased: includePurchased } }),
  create: (listId: string, data: CreateItemRequest) => apiClient<ShoppingItem>(`/items/${listId}`, { method: 'POST', body: data }),
  bulkCreate: (listId: string, items: CreateItemRequest[]) => apiClient<ShoppingItem[]>(`/items/${listId}/bulk`, { method: 'POST', body: { items } }),
  update: (itemId: string, data: Partial<ShoppingItem>) => apiClient<ShoppingItem>(`/items/${itemId}`, { method: 'PATCH', body: data }),
  delete: (itemId: string) => apiClient<void>(`/items/${itemId}`, { method: 'DELETE' }),
  purchase: (itemId: string) => apiClient<ShoppingItem>(`/items/${itemId}/purchase`, { method: 'POST' }),
};
