/**
 * TanStack Query hooks for finance workflows
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useApiClient } from '../api/apiClient';

const FINANCE_QUERY_KEYS = {
  clientPayments: (filters) => ['finance', 'client-payments', filters],
  vendorPayments: (filters) => ['finance', 'vendor-payments', filters],
  vendors: ['finance', 'vendors'],
  operationalFunds: (filters) => ['finance', 'operational-funds', filters],
  siteBudgets: (filters) => ['finance', 'site-budgets', filters],
};

export function useClientPayments(filters = {}) {
  const api = useApiClient();

  return useQuery({
    queryKey: FINANCE_QUERY_KEYS.clientPayments(filters),
    queryFn: async () => {
      const { data } = await api.get('/api/v1/client-payments', { params: filters });
      return data;
    },
    staleTime: 1000 * 60 * 5,
  });
}

export function useCreateClientPayment() {
  const api = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload) => {
      const { data } = await api.post('/api/v1/client-payments', payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: FINANCE_QUERY_KEYS.clientPayments({}) });
    },
  });
}

export function useVendorPayments(filters = {}) {
  const api = useApiClient();

  return useQuery({
    queryKey: FINANCE_QUERY_KEYS.vendorPayments(filters),
    queryFn: async () => {
      const { data } = await api.get('/api/v1/vendor-payments', { params: filters });
      return data;
    },
    staleTime: 1000 * 60 * 5,
  });
}

export function useVendors() {
  const api = useApiClient();

  return useQuery({
    queryKey: FINANCE_QUERY_KEYS.vendors,
    queryFn: async () => {
      const { data } = await api.get('/api/v1/vendor-payments/vendors');
      return data;
    },
    staleTime: 1000 * 60 * 5,
  });
}

export function useCreateVendorPayment() {
  const api = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload) => {
      const { data } = await api.post('/api/v1/vendor-payments', payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: FINANCE_QUERY_KEYS.vendorPayments({}) });
      queryClient.invalidateQueries({ queryKey: FINANCE_QUERY_KEYS.vendors });
    },
  });
}

export function useOperationalFunds(filters = {}) {
  const api = useApiClient();

  return useQuery({
    queryKey: FINANCE_QUERY_KEYS.operationalFunds(filters),
    queryFn: async () => {
      const { data } = await api.get('/api/v1/operational-funds', { params: filters });
      return data;
    },
    staleTime: 1000 * 60 * 5,
  });
}

export function useCreateOperationalFund() {
  const api = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload) => {
      const { data } = await api.post('/api/v1/operational-funds', payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: FINANCE_QUERY_KEYS.operationalFunds({}) });
    },
  });
}

export function useUpdateOperationalFund() {
  const api = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...payload }) => {
      const { data } = await api.patch(`/api/v1/operational-funds/${id}`, payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: FINANCE_QUERY_KEYS.operationalFunds({}) });
    },
  });
}

export function useSiteBudgets(filters = {}) {
  const api = useApiClient();

  return useQuery({
    queryKey: FINANCE_QUERY_KEYS.siteBudgets(filters),
    queryFn: async () => {
      const { data } = await api.get('/api/v1/site-budget', { params: filters });
      return data;
    },
    staleTime: 1000 * 60 * 5,
  });
}

export function useCreateSiteBudget() {
  const api = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload) => {
      const { data } = await api.post('/api/v1/site-budget', payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: FINANCE_QUERY_KEYS.siteBudgets({}) });
    },
  });
}

export function useUpdateSiteBudget() {
  const api = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...payload }) => {
      const { data } = await api.patch(`/api/v1/site-budget/${id}`, payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: FINANCE_QUERY_KEYS.siteBudgets({}) });
    },
  });
}
