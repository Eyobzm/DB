/**
 * TanStack Query hooks for dashboard data
 */

import { useQuery } from '@tanstack/react-query';
import { useApiClient } from '../api/apiClient';

const DASHBOARD_QUERY_KEYS = {
  summary: ['dashboard', 'summary'],
  overdueList: ['dashboard', 'overdue-maintenance'],
};

export function useDashboardSummary() {
  const api = useApiClient();

  return useQuery({
    queryKey: DASHBOARD_QUERY_KEYS.summary,
    queryFn: async () => {
      const { data } = await api.get('/api/v1/dashboard/summary');
      return data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchInterval: 1000 * 60, // 60 seconds auto-refresh
  });
}

export function useOverdueMaintenanceList() {
  const api = useApiClient();

  return useQuery({
    queryKey: DASHBOARD_QUERY_KEYS.overdueList,
    queryFn: async () => {
      const { data } = await api.get('/api/v1/dashboard/overdue-maintenance');
      return data;
    },
    staleTime: 1000 * 60 * 5,
    refetchInterval: 1000 * 60,
  });
}
