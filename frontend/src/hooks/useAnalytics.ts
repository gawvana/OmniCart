import { useQuery } from '@tanstack/react-query';
import { analyticsApi } from '../api/analytics';

export function useAnalytics(period: string) {
  return useQuery({ queryKey: ['analytics', period], queryFn: () => analyticsApi.getStats(period) });
}
