import { useQuery } from '@tanstack/react-query';
import { budgetApi } from '../api/budget';

export function useBudget() {
  return useQuery({ queryKey: ['budget'], queryFn: budgetApi.get });
}
