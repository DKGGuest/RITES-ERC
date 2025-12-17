/**
 * Authentication Service
 * Handles login API calls and token management
 */

// TODO: Uncomment for production with backend
// const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8081/sarthi-backend';

/**
 * Login user with userId and password
 * @param {number} userId - User ID
 * @param {string} password - User password
 * @returns {Promise<Object>} Login response with user data and token
 */
export const loginUser = async (userId, password) => {
  // TODO: Uncomment for production with backend
  /*
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: parseInt(userId, 10),
        password: password,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Invalid login credentials');
    }

    return data;
  } catch (error) {
    throw error;
  }
  */

  // Mock login for Vercel deployment (no backend)
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // Accept any userId with password "password" or "123456" for demo
      if (password === 'password' || password === '123456' || password === 'admin') {
        resolve({
          data: {
            token: 'mock-jwt-token-for-vercel-deployment',
            userId: userId,
            userName: `User ${userId}`,
            roleName: 'Inspector'
          }
        });
      } else {
        reject(new Error('Invalid credentials. Use password: "password" or "123456"'));
      }
    }, 500); // Simulate network delay
  });
};

/**
 * Store authentication data in localStorage
 * @param {Object} authData - Authentication data from login response
 */
export const storeAuthData = (authData) => {
  localStorage.setItem('authToken', authData.token);
  localStorage.setItem('userId', authData.userId);
  localStorage.setItem('userName', authData.userName);
  localStorage.setItem('roleName', authData.roleName);
};

/**
 * Get stored authentication token
 * @returns {string|null} JWT token or null if not logged in
 */
export const getAuthToken = () => {
  return localStorage.getItem('authToken');
};

/**
 * Get stored user data
 * @returns {Object|null} User data or null if not logged in
 */
export const getStoredUser = () => {
  const token = localStorage.getItem('authToken');
  if (!token) return null;

  return {
    userId: localStorage.getItem('userId'),
    userName: localStorage.getItem('userName'),
    roleName: localStorage.getItem('roleName'),
    token: token,
  };
};

/**
 * Check if user is authenticated
 * @returns {boolean} True if user has valid token
 */
export const isAuthenticated = () => {
  return !!localStorage.getItem('authToken');
};

/**
 * Logout user - clear all auth data
 */
export const logoutUser = () => {
  localStorage.removeItem('authToken');
  localStorage.removeItem('userId');
  localStorage.removeItem('userName');
  localStorage.removeItem('roleName');
};

/**
 * Get authorization header for API requests
 * @returns {Object} Headers object with Authorization
 */
export const getAuthHeaders = () => {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

