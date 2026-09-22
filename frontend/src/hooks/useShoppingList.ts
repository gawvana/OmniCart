import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { itemsApi, CreateItemRequest } from '../api/items';
import { ShoppingItem } from '../types';
import { subscribeToShoppingItems } from '@/lib/supabase/client';

export function useShoppingItems(listId: string) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!listId) return;
    const sub = subscribeToShoppingItems(listId, () => {
      queryClient.invalidateQueries({ queryKey: ['items', listId] });
    });
    return () => {
      sub.unsubscribe();
    };
  }, [listId, queryClient]);

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

export function useUpdateItem(listId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ itemId, data }: { itemId: string; data: Partial<ShoppingItem> }) => itemsApi.update(itemId, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['items', listId] }),
  });
}

