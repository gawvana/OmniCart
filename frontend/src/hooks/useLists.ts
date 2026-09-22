import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { listsApi } from '../api/lists';

export function useLists() {
  return useQuery({ queryKey: ['lists'], queryFn: listsApi.getAll });
}

export function useCreateList() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: listsApi.create,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['lists'] }),
  });
}
