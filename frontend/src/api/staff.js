// Staff API helper functions

import apiClient from './apiClient';

export const STAFF_ENDPOINT = '/api/v1/staff';

export async function fetchStaffList(params) {
  const { data } = await apiClient.get(STAFF_ENDPOINT, { params });
  return data;
}

export async function fetchStaff(id) {
  const { data } = await apiClient.get(`${STAFF_ENDPOINT}/${id}`);
  return data;
}

export async function createStaff(payload) {
  const { data } = await apiClient.post(STAFF_ENDPOINT, payload);
  return data;
}

export async function updateStaff(id, payload) {
  const { data } = await apiClient.patch(`${STAFF_ENDPOINT}/${id}`, payload);
  return data;
}

export async function deactivateStaff(id) {
  const { data } = await apiClient.patch(`${STAFF_ENDPOINT}/${id}/deactivate`);
  return data;
}
