/**
 * TanStack Query hooks for maintenance scheduling
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useApiClient } from '../api/apiClient';

const MAINTENANCE_QUERY_KEYS = {
  list: (filters) => ['maintenance', 'list', filters],
  overdue: ['maintenance', 'overdue'],
};

export function useMaintenanceList(filters = {}) {
  const api = useApiClient();

  return useQuery({
    queryKey: MAINTENANCE_QUERY_KEYS.list(filters),
    queryFn: async () => {
      const { data } = await api.get('/api/v1/maintenance', { params: filters });
      return data;
    },
    staleTime: 1000 * 60 * 5,
  });
}

export function useCreateMaintenance() {
  const api = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload) => {
      const { data } = await api.post('/api/v1/maintenance', payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MAINTENANCE_QUERY_KEYS.list({}) });
      queryClient.invalidateQueries({ queryKey: MAINTENANCE_QUERY_KEYS.overdue });
    },
  });
}

export function useUpdateMaintenance() {
  const api = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }) => {
      const { data: response } = await api.patch(`/api/v1/maintenance/${id}`, data);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MAINTENANCE_QUERY_KEYS.list({}) });
      queryClient.invalidateQueries({ queryKey: MAINTENANCE_QUERY_KEYS.overdue });
    },
  });
}

export function useOverdueMaintenance() {
  const api = useApiClient();

  return useQuery({
    queryKey: MAINTENANCE_QUERY_KEYS.overdue,
    queryFn: async () => {
      const { data } = await api.get('/api/v1/maintenance/overdue');
      return data;
    },
    staleTime: 1000 * 60 * 5,
  });
}
