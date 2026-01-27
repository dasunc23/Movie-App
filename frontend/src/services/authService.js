import api from './api';

/**
 * Register a new user
 */
export const register = async (name, email, password) => {
  const response = await api.post('/login/register', {
    name,
    email,
    password
  });
  
  // Save token and user to localStorage
  if (response.data.success) {
    localStorage.setItem('token', response.data.data.token);
    localStorage.setItem('user', JSON.stringify(response.data.data));
  }
  
  return response.data;
};

/**
 * Login user
 */
export const login = async (email, password) => {
  const response = await api.post('/login', {
    email,
    password
  });
  
  // Save token and user to localStorage
  if (response.data.success) {
    localStorage.setItem('token', response.data.data.token);
    localStorage.setItem('user', JSON.stringify(response.data.data));
  }
  
  return response.data;
};

/**
 * Logout user
 */
export const logout = async () => {
  try {
    await api.post('/login/logout');
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    // Clear localStorage regardless of API response
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
};

/**
 * Get current user profile
 */
export const getProfile = async () => {
  const response = await api.get('/login/profile');
  return response.data;
};

/**
 * Update user profile
 */
export const updateProfile = async (name, preferences, avatar) => {
  const response = await api.put('/login/profile', {
    name,
    preferences,
    avatar
  });
  
  // Update user in localStorage
  if (response.data.success) {
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    const updatedUser = { ...currentUser, ...response.data.data };
    localStorage.setItem('user', JSON.stringify(updatedUser));
  }
  
  return response.data;
};

/**
 * Change password
 */
export const changePassword = async (currentPassword, newPassword) => {
  const response = await api.put('/login/change-password', {
    currentPassword,
    newPassword
  });
  return response.data;
};

/**
 * Get current user from localStorage
 */
export const getCurrentUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = () => {
  return !!localStorage.getItem('token');
};