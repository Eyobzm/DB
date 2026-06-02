/**
 * Axios instance with automatic JWT header injection
 * Handles 401 responses by redirecting to login
 */

import React from 'react';
import axios from 'axios';
import { useAuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

/**
 * Create axios instance with base configuration
 */
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

let requestInterceptorId = null;
let responseInterceptorId = null;

/**
 * Setup axios interceptor to inject JWT token
 * This is called from a hook (see useApiClient below)
 */
export function setupApiInterceptors(token, navigate) {
  if (requestInterceptorId !== null) {
    apiClient.interceptors.request.eject(requestInterceptorId);
  }
  if (responseInterceptorId !== null) {
    apiClient.interceptors.response.eject(responseInterceptorId);
  }

  requestInterceptorId = apiClient.interceptors.request.use(
    (config) => {
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  responseInterceptorId = apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        navigate('/login');
      }
      return Promise.reject(error);
    }
  );
}

/**
 * Custom hook to get configured axios instance
 * Automatically handles JWT injection and 401 redirects
 *
 * Usage:
 *   const api = useApiClient();
 *   const { data } = await api.get('/api/v1/staff');
 */
export function useApiClient() {
  const { token } = useAuthContext();
  const navigate = useNavigate();

  // Setup interceptors when token changes
  React.useEffect(() => {
    setupApiInterceptors(token, navigate);
  }, [token, navigate]);

  return apiClient;
}

export default apiClient;
