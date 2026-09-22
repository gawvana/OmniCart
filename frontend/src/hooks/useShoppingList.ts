import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { itemsApi, CreateItemRequest } from '../api/items';
import { ShoppingItem } from '../types';

export function useShoppingItems(listId: string) {
  return useQuery({
    queryKey: ['items', listId],
    queryFn: () => itemsApi.getByList(listId),
  });
}

export function useAddItem(listId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateItemRequest) => itemsApi.create(listId, data),
    onMutate: async (newItem) => {
      await queryClient.cancelQueries({ queryKey: ['items', listId] });
      const previous = queryClient.getQueryData(['items', listId]);
      queryClient.setQueryData(['items', listId], (old: ShoppingItem[] = []) => [
        ...old, { ...newItem, id: crypto.randomUUID(), isPurchased: false, createdAt: new Date().toISOString() }
      ]);
      return { previous };
    },
    onError: (_, __, context) => queryClient.setQueryData(['items', listId], context?.previous),
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['items', listId] }),
  });
}

export function usePurchaseItem(listId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (itemId: string) => itemsApi.purchase(itemId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['items', listId] }),
  });
}

export function useDeleteItem(listId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (itemId: string) => itemsApi.delete(itemId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['items', listId] }),
  });
}
