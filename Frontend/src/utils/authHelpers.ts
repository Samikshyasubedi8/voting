/**
 * Authentication Helper Functions
 * Provides utilities for checking authentication status and managing auth tokens
 */

/**
 * Check if user is currently authenticated
 * @returns boolean - true if user has valid auth token
 */
export const isAuthenticated = (): boolean => {
  const token = localStorage.getItem('auth_token');
  return !!token;
};

/**
 * Get the stored auth token
 * @returns string | null - auth token or null if not found
 */
export const getAuthToken = (): string | null => {
  return localStorage.getItem('auth_token');
};

/**
 * Get the stored user data
 * @returns object - user data or empty object if not found
 */
export const getUserData = () => {
  const userData = localStorage.getItem('user_data');
  return userData ? JSON.parse(userData) : {};
};

/**
 * Get user's full name from localStorage
 * @returns string - formatted full name or 'Voter'
 */
export const getUserName = (): string => {
  const userData = getUserData();
  if (userData.firstName && userData.lastName) {
    return `${userData.firstName} ${userData.lastName}`;
  }
  return userData.firstName || userData.name || 'Voter';
};

/**
 * Clear all authentication data from localStorage
 */
export const clearAuthData = (): void => {
  localStorage.removeItem('auth_token');
  localStorage.removeItem('user_data');
};

/**
 * Store authentication data in localStorage
 * @param token - JWT token
 * @param userData - user information object
 */
export const storeAuthData = (token: string, userData: any): void => {
  localStorage.setItem('auth_token', token);
  localStorage.setItem('user_data', JSON.stringify(userData));
};
