import { useQuery } from '@tanstack/react-query';
import { useApiClient } from '../api/apiClient';

const VENDOR_KEYS = {
  list: () => ['vendors'],
};

export function useVendorList() {
  const api = useApiClient();
  return useQuery({
    queryKey: VENDOR_KEYS.list(),
    queryFn: async () => {
      const { data } = await api.get('/api/v1/vendors');
      return data;
    },
    staleTime: 1000 * 60 * 5,
  });
}
