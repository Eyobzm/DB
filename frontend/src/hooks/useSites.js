import { useQuery } from '@tanstack/react-query';
import { useApiClient } from '../api/apiClient';

const SITE_KEYS = {
  list: () => ['sites'],
};

export function useSiteList() {
  const api = useApiClient();
  return useQuery({
    queryKey: SITE_KEYS.list(),
    queryFn: async () => {
      const { data } = await api.get('/api/v1/sites');
      return data;
    },
    staleTime: 1000 * 60 * 5,
  });
}
