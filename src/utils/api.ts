// API configuration with security enhancements
import { trackApiError } from './errorTracker';

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Token storage keys
const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

// API error handler
interface ApiError {
  error?: string;
  message?: string;
  [key: string]: any;
}

const handleApiError = (error: any): string => {
  if (error instanceof TypeError) {
    return 'Network error. Please check your connection.';
  }
  
  if (error.error) {
    return error.error;
  }
  
  if (error.message) {
    return error.message;
  }
  
  return 'An unexpected error occurred. Please try again.';
};

export const api = {
  // Auth endpoints
  login: async (email: string, password: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(handleApiError(data));
      }

      // Store token and user info securely
      if (data.token) {
        localStorage.setItem(TOKEN_KEY, data.token);
        if (data.user) {
          localStorage.setItem(USER_KEY, JSON.stringify(data.user));
        }
      }

      return data;
    } catch (err) {
      throw new Error(handleApiError(err));
    }
  },

  register: async (email: string, password: string, name: string, role?: string) => {
    try {
      // Validate input on frontend before sending
      if (!email || !password || !name) {
        throw new Error('Email, password, and name are required');
      }

      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, password, name, role: role || 'agent' }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(handleApiError(data));
      }

      // Store token and user info
      if (data.token) {
        localStorage.setItem(TOKEN_KEY, data.token);
        if (data.user) {
          localStorage.setItem(USER_KEY, JSON.stringify(data.user));
        }
      }

      return data;
    } catch (err) {
      trackApiError(err, '/auth/register');
      throw new Error(handleApiError(err));
    }
  },

  getProfile: async () => {
    try {
      const response = await api.authenticatedFetch('/auth/me');
      return response;
    } catch (err) {
      throw new Error(handleApiError(err));
    }
  },

  // Refresh token
  refreshToken: async () => {
    try {
      const response = await api.authenticatedFetch('/auth/refresh', {
        method: 'POST',
      });
      
      if (response.token) {
        localStorage.setItem(TOKEN_KEY, response.token);
      }
      
      return response;
    } catch (err) {
      // If refresh fails, logout user
      trackApiError(err, '/auth/refresh');
      api.logout();
      throw new Error(handleApiError(err));
    }
  },

  // Health check
  healthCheck: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Health check failed');
      }
      
      return response.json();
    } catch (err) {
      trackApiError(err, '/health');
      throw new Error('Backend is not available');
    }
  },

  // Logout
  logout: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    window.location.href = '/login';
  },

  // Get stored user
  getStoredUser: () => {
    const user = localStorage.getItem(USER_KEY);
    return user ? JSON.parse(user) : null;
  },

  // Get stored token
  getToken: () => {
    return localStorage.getItem(TOKEN_KEY);
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    return !!localStorage.getItem(TOKEN_KEY);
  },

  // Utility to make authenticated requests
  authenticatedFetch: async (endpoint: string, options: RequestInit = {}) => {
    const token = localStorage.getItem(TOKEN_KEY);

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        credentials: 'include',
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle 401 - token expired or invalid
        if (response.status === 401) {
          localStorage.removeItem(TOKEN_KEY);
          localStorage.removeItem(USER_KEY);
          window.location.href = '/login';
          throw new Error('Session expired. Please login again.');
        }

        throw new Error(handleApiError(data));
      }

      return data;
    } catch (err) {
      throw new Error(handleApiError(err));
    }
  },
};

export default api;
