/**
 * TanStack Query hooks for activity log management
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useApiClient } from '../api/apiClient';

const ACTIVITY_LOG_QUERY_KEYS = {
  list: (filters) => ['activityLogs', filters],
  detail: (id) => ['activityLogs', 'detail', id],
};

export function useActivityLogList(filters = {}) {
  const api = useApiClient();

  return useQuery({
    queryKey: ACTIVITY_LOG_QUERY_KEYS.list(filters),
    queryFn: async () => {
      const { data } = await api.get('/api/v1/activity-logs', { params: filters });
      return data;
    },
    staleTime: 1000 * 60 * 5,
  });
}

export function useCreateActivityLog() {
  const api = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload) => {
      const { data } = await api.post('/api/v1/activity-logs', payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activityLogs'] });
    },
  });
}

export function useVerifyActivityLog() {
  const api = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (activityId) => {
      const { data } = await api.patch(`/api/v1/activity-logs/${activityId}/verify`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activityLogs'] });
    },
  });
}
