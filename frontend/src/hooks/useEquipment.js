/**
 * TanStack Query hooks for equipment management
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useApiClient } from '../api/apiClient';

const EQUIPMENT_QUERY_KEYS = {
  all: ['equipment'],
  list: (filters) => ['equipment', 'list', filters],
  detail: (id) => ['equipment', 'detail', id],
  insurance: (id) => ['equipment', 'insurance', id],
  attachments: (id) => ['equipment', 'attachments', id],
};

/**
 * Fetch equipment list with filtering and pagination
 *
 * Usage:
 *   const { data, isLoading, isFetching } = useEquipmentList({
 *     skip: 0,
 *     limit: 20,
 *     status: 'Available',
 *     category: 'Truck',
 *     siteId: 1
 *   });
 */
export function useEquipmentList(filters = {}) {
  const api = useApiClient();

  return useQuery({
    queryKey: EQUIPMENT_QUERY_KEYS.list(filters),
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.skip !== undefined) params.append('skip', filters.skip);
      if (filters.limit !== undefined) params.append('limit', filters.limit);
      if (filters.status) params.append('status', filters.status);
      if (filters.category) params.append('category', filters.category);
      if (filters.siteId !== undefined) params.append('site_id', filters.siteId);

      const { data } = await api.get(`/api/v1/equipment?${params.toString()}`);
      return data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Fetch single equipment detail
 *
 * Usage:
 *   const { data: equipment } = useEquipmentDetail(1);
 */
export function useEquipmentDetail(equipmentId) {
  const api = useApiClient();

  return useQuery({
    queryKey: EQUIPMENT_QUERY_KEYS.detail(equipmentId),
    queryFn: async () => {
      const { data } = await api.get(`/api/v1/equipment/${equipmentId}`);
      return data;
    },
    enabled: !!equipmentId,
    staleTime: 1000 * 60 * 5,
  });
}

/**
 * Create equipment mutation
 *
 * Usage:
 *   const createMutation = useCreateEquipment();
 *   await createMutation.mutateAsync({
 *     equipment_code: 'TR001',
 *     equipment_name: 'Truck 1',
 *     equipment_category: 'Truck'
 *   });
 */
export function useCreateEquipment() {
  const api = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (equipmentData) => {
      const { data } = await api.post('/api/v1/equipment', equipmentData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EQUIPMENT_QUERY_KEYS.all });
    },
  });
}

/**
 * Update equipment mutation
 *
 * Usage:
 *   const updateMutation = useUpdateEquipment();
 *   await updateMutation.mutateAsync({
 *     id: 1,
 *     status: 'In_Use'
 *   });
 */
export function useUpdateEquipment() {
  const api = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updateData }) => {
      const { data } = await api.patch(`/api/v1/equipment/${id}`, updateData);
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: EQUIPMENT_QUERY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: EQUIPMENT_QUERY_KEYS.detail(data.equipment_id) });
    },
  });
}

/**
 * Delete equipment mutation
 *
 * Usage:
 *   const deleteMutation = useDeleteEquipment();
 *   await deleteMutation.mutateAsync(1);
 */
export function useDeleteEquipment() {
  const api = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (equipmentId) => {
      await api.delete(`/api/v1/equipment/${equipmentId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EQUIPMENT_QUERY_KEYS.all });
    },
  });
}

/**
 * Fetch equipment insurance policies
 *
 * Usage:
 *   const { data: insurances } = useEquipmentInsurance(1);
 */
export function useEquipmentInsurance(equipmentId) {
  const api = useApiClient();

  return useQuery({
    queryKey: EQUIPMENT_QUERY_KEYS.insurance(equipmentId),
    queryFn: async () => {
      const { data } = await api.get(`/api/v1/equipment/${equipmentId}/insurance`);
      return data;
    },
    enabled: !!equipmentId,
    staleTime: 1000 * 60 * 5,
  });
}

/**
 * Create insurance policy mutation
 *
 * Usage:
 *   const createInsuranceMutation = useCreateInsurance();
 *   await createInsuranceMutation.mutateAsync({
 *     equipmentId: 1,
 *     policy_number: 'POL001',
 *     ...
 *   });
 */
export function useCreateInsurance() {
  const api = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ equipmentId, ...insuranceData }) => {
      const { data } = await api.post(
        `/api/v1/equipment/${equipmentId}/insurance`,
        insuranceData
      );
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: EQUIPMENT_QUERY_KEYS.insurance(data.equipment_id) });
    },
  });
}

/**
 * Fetch equipment attachments
 *
 * Usage:
 *   const { data: attachments } = useEquipmentAttachments(1);
 */
export function useEquipmentAttachments(equipmentId) {
  const api = useApiClient();

  return useQuery({
    queryKey: EQUIPMENT_QUERY_KEYS.attachments(equipmentId),
    queryFn: async () => {
      const { data } = await api.get(`/api/v1/equipment/${equipmentId}/attachments`);
      return data;
    },
    enabled: !!equipmentId,
    staleTime: 1000 * 60 * 5,
  });
}
