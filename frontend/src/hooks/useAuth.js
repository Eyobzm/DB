/**
 * TanStack Query hooks for authentication
 */

import { useMutation, useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { loginAPI, logoutAPI } from '../api/auth';
import { useAuthContext } from '../context/AuthContext';

/**
 * Login mutation hook
 *
 * Usage:
 *   const loginMutation = useLogin();
 *   await loginMutation.mutateAsync({
 *     employeeNumber: 'EMP001',
 *     password: 'password123'
 *   });
 *
 * @returns {UseMutationResult} with mutateAsync function
 */
export function useLogin() {
  const navigate = useNavigate();
  const { login } = useAuthContext();

  return useMutation({
    mutationFn: async ({ employeeNumber, password }) => {
      const response = await loginAPI(employeeNumber, password);
      return response;
    },
    onSuccess: (data) => {
      // Store token and user info in auth context (memory)
      login(data.access_token, {
        staff_id: data.staff_id,
        employee_number: data.employee_number,
        first_name: data.first_name,
        last_name: data.last_name,
        role: data.role,
      });

      // Redirect to dashboard
      navigate('/dashboard');
    },
    onError: (error) => {
      console.error('Login error:', error.message);
    },
  });
}

/**
 * Logout mutation hook
 *
 * Usage:
 *   const logoutMutation = useLogout();
 *   await logoutMutation.mutateAsync();
 *
 * @returns {UseMutationResult}
 */
export function useLogout() {
  const navigate = useNavigate();
  const { logout } = useAuthContext();

  return useMutation({
    mutationFn: async () => {
      await logoutAPI();
    },
    onSuccess: () => {
      // Clear auth context
      logout();
      // Redirect to login
      navigate('/login');
    },
    onError: (error) => {
      console.error('Logout error:', error.message);
      // Still clear auth context on error
      logout();
      navigate('/login');
    },
  });
}

/**
 * Check if user token is valid (lightweight check)
 * Can be used on app startup to restore session
 *
 * Usage:
 *   const { data: isValid } = useCheckAuth();
 *
 * @returns {UseQueryResult}
 */
export function useCheckAuth() {
  const { token } = useAuthContext();
  const navigate = useNavigate();

  return useQuery({
    queryKey: ['auth', 'check'],
    queryFn: async () => {
      if (!token) return false;
      // Token exists in memory; consider valid until expiration
      // For more rigorous validation, call /api/v1/auth/me endpoint
      return true;
    },
    enabled: !!token,
    staleTime: Infinity, // Don't refetch automatically
    onError: () => {
      navigate('/login');
    },
  });
}
