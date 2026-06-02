import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useApiClient } from '../api/apiClient';

const STAFF_KEYS = {
  list: (filters) => ['staff', filters],
  detail: (id) => ['staff', 'detail', id],
};

export function useStaffList(filters = {}) {
  const api = useApiClient();
  return useQuery({
    queryKey: STAFF_KEYS.list(filters),
    queryFn: async () => {
      const { data } = await api.get('/api/v1/staff', { params: filters });
      return data;
    },
    staleTime: 1000 * 60 * 5,
  });
}

export function useStaffDetail(id) {
  const api = useApiClient();
  return useQuery({
    queryKey: STAFF_KEYS.detail(id),
    queryFn: async () => {
      const { data } = await api.get(`/api/v1/staff/${id}`);
      return data;
    },
    enabled: !!id,
  });
}

export function useCreateStaff() {
  const api = useApiClient();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload) => {
      const { data } = await api.post('/api/v1/staff', payload);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['staff'] }),
  });
}

export function useUpdateStaff() {
  const api = useApiClient();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...payload }) => {
      const { data } = await api.patch(`/api/v1/staff/${id}`, payload);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['staff'] }),
  });
}
