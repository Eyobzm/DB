import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useApiClient } from '../api/apiClient';

const CERT_KEYS = {
  list: (filters) => ['certifications', filters],
  detail: (id) => ['certifications', 'detail', id],
};

export function useCertifications(filters = {}) {
  const api = useApiClient();
  return useQuery({
    queryKey: CERT_KEYS.list(filters),
    queryFn: async () => {
      const { data } = await api.get('/api/v1/certifications', { params: filters });
      return data;
    },
    staleTime: 1000 * 60 * 5,
  });
}

export function useCreateCertification() {
  const api = useApiClient();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload) => {
      const { data } = await api.post('/api/v1/certifications', payload);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['certifications'] }),
  });
}

export function useUpdateCertification() {
  const api = useApiClient();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...payload }) => {
      const { data } = await api.patch(`/api/v1/certifications/${id}`, payload);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['certifications'] }),
  });
}
