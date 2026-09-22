import { useQuery } from '@tanstack/react-query';
import { searchApi } from '../api/search';

export function useSearch(q: string) {
  return useQuery({ queryKey: ['search', q], queryFn: () => searchApi.query(q), enabled: !!q });
}
