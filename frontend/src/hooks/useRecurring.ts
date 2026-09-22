import { useQuery } from '@tanstack/react-query';
import { recurringApi } from '../api/recurring';

export function useRecurring() {
  return useQuery({ queryKey: ['recurring'], queryFn: recurringApi.get });
}
