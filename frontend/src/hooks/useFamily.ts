import { useQuery } from '@tanstack/react-query';
import { familyApi } from '../api/family';

export function useFamily() {
  return useQuery({ queryKey: ['family'], queryFn: familyApi.get });
}
