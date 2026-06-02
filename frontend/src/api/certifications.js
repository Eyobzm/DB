// Certifications API helper

import apiClient from './apiClient';

const BASE = '/api/v1/certifications';

export async function fetchCertifications(params) {
  const { data } = await apiClient.get(BASE, { params });
  return data;
}

export async function createCertification(payload) {
  const { data } = await apiClient.post(BASE, payload);
  return data;
}

export async function updateCertification(id, payload) {
  const { data } = await apiClient.patch(`${BASE}/${id}`, payload);
  return data;
}

export async function fetchCertification(id) {
  const { data } = await apiClient.get(`${BASE}/${id}`);
  return data;
}
