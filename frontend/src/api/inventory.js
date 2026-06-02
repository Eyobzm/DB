// Inventory API helper (placeholder)

import apiClient from './apiClient';

const BASE = '/api/v1/inventory';

export async function fetchInventory(params) {
  const { data } = await apiClient.get(BASE, { params });
  return data;
}

export async function fetchLowStock() {
  const { data } = await apiClient.get(`${BASE}/low-stock`);
  return data;
}

export async function createInventoryItem(payload) {
  const { data } = await apiClient.post(BASE, payload);
  return data;
}
