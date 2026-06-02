import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useApiClient } from '../api/apiClient';

const INV_KEYS = {
  list: (filters) => ['inventory', filters],
  lowstock: ['inventory', 'low-stock'],
};

export function useInventoryList(filters = {}) {
  const api = useApiClient();
  return useQuery({
    queryKey: INV_KEYS.list(filters),
    queryFn: async () => {
      const { data } = await api.get('/api/v1/inventory', { params: filters });
      return data;
    },
    staleTime: 1000 * 60 * 5,
  });
}

export function useLowStock() {
  const api = useApiClient();
  return useQuery({
    queryKey: INV_KEYS.lowstock,
    queryFn: async () => {
      const { data } = await api.get('/api/v1/inventory/low-stock');
      return data;
    },
  });
}

export function useCreateInventoryItem() {
  const api = useApiClient();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload) => {
      const { data } = await api.post('/api/v1/inventory', payload);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['inventory'] }),
  });
}
