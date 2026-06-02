/**
 * AuthContext - React context for JWT token storage in memory
 * Provides user authentication state and token management
 */

import React, { createContext, useContext, useState, useCallback } from 'react';

/**
 * AuthContextType definition
 */
export const AuthContext = createContext(null);

/**
 * AuthProvider component
 * Wraps application to provide auth state and functions
 *
 * Usage:
 *   <AuthProvider>
 *     <App />
 *   </AuthProvider>
 */
export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Store token and user info in memory
   */
  const login = useCallback((accessToken, userData) => {
    setToken(accessToken);
    setUser(userData);
  }, []);

  /**
   * Clear token and user info from memory
   */
  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
  }, []);

  /**
   * Check if user is authenticated
   */
  const isAuthenticated = !!token;

  const value = {
    token,
    user,
    isLoading,
    setIsLoading,
    login,
    logout,
    isAuthenticated,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Custom hook to use auth context
 *
 * Usage:
 *   const { token, user, login, logout } = useAuthContext();
 */
export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within AuthProvider');
  }
  return context;
}
