/**
 * Authentication API functions
 * Handles login/logout API calls
 */

import apiClient from './apiClient';

const AUTH_ENDPOINTS = {
  LOGIN: '/api/v1/auth/login',
  LOGOUT: '/api/v1/auth/logout',
};

/**
 * Login API call
 *
 * @param {string} employeeNumber - Employee number
 * @param {string} password - User password
 * @returns {Promise<{access_token, token_type, staff_id, employee_number, first_name, last_name, role}>}
 * @throws {Error} on invalid credentials or network error
 */
export async function loginAPI(employeeNumber, password) {
  try {
    const response = await apiClient.post(AUTH_ENDPOINTS.LOGIN, {
      employee_number: employeeNumber,
      password: password,
    });
    return response.data;
  } catch (error) {
    if (error.response?.status === 401) {
      throw new Error('Invalid employee number or password');
    }
    throw error;
  }
}

/**
 * Logout API call (client-side only)
 * Server has no token revocation; client removes token from memory
 *
 * @returns {Promise<{message}>}
 */
export async function logoutAPI() {
  try {
    const response = await apiClient.post(AUTH_ENDPOINTS.LOGOUT);
    return response.data;
  } catch (error) {
    // Ignore errors on logout
    console.warn('Logout error:', error);
    return { message: 'Logged out' };
  }
}
