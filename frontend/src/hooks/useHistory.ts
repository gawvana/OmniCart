import { useQuery } from '@tanstack/react-query';
import { historyApi } from '../api/history';

export function useHistory(params: any) {
  return useQuery({ queryKey: ['history', params], queryFn: () => historyApi.get(params) });
}
