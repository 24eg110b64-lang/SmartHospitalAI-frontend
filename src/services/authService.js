import { apiClient } from './api';

const USER_STORAGE_KEY = 'loggedInUser';
const ROLE_STORAGE_KEY = 'userRole';
const USER_DATA_KEY = 'userData';

export const authService = {
  /**
   * Log in user via Spring Boot backend: POST /auth/login
   * @param {string} username
   * @param {string} password
   */
  async login(username, password) {
    try {
      const response = await apiClient.post('/auth/login', { username, password });
      const data = response.data;

      // Check if backend returned invalid credentials string
      if (typeof data === 'string' && data.toLowerCase().includes('invalid')) {
        throw new Error(data);
      }

      if (data && (data.username || data.id)) {
        const userInfo = {
          id: data.id || null,
          username: data.username || username,
          role: data.role || 'Admin',
        };

        localStorage.setItem(USER_STORAGE_KEY, userInfo.username);
        localStorage.setItem(ROLE_STORAGE_KEY, userInfo.role);
        localStorage.setItem(USER_DATA_KEY, JSON.stringify(userInfo));

        return userInfo;
      }

      throw new Error('Unexpected response from server.');
    } catch (error) {
      throw error;
    }
  },

  /**
   * Log out current user
   */
  logout() {
    localStorage.removeItem(USER_STORAGE_KEY);
    localStorage.removeItem(ROLE_STORAGE_KEY);
    localStorage.removeItem(USER_DATA_KEY);
  },

  /**
   * Get current stored user info
   */
  getCurrentUser() {
    const username = localStorage.getItem(USER_STORAGE_KEY);
    const role = localStorage.getItem(ROLE_STORAGE_KEY) || 'Staff';
    if (!username) return null;

    try {
      const data = localStorage.getItem(USER_DATA_KEY);
      if (data) return JSON.parse(data);
    } catch {
      // fallback to basic
    }

    return { username, role };
  },

  /**
   * Check if user is logged in
   */
  isAuthenticated() {
    return !!localStorage.getItem(USER_STORAGE_KEY);
  },
};

export default authService;
