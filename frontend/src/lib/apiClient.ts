import axios from 'axios';
import { API_BASE_URL } from './config';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

// ─── REQUEST INTERCEPTOR ─────────────────────────────────────────────────────
// Reads the token from Zustand store on EVERY request.
// This ensures the Authorization header is always correct regardless of 
// which component mounts first or navigation order.
apiClient.interceptors.request.use((config) => {
  try {
    // Dynamically import the store to avoid SSR issues
    // getState() is synchronous and safe to call anywhere
    const { useAuthStore } = require('../store/authStore');
    const token = useAuthStore.getState().accessToken;
    if (token) {
      config.headers = config.headers || {};
      config.headers['Authorization'] = `Bearer ${token}`;
    }
  } catch (e) {
    // Safe to ignore in SSR context
  }
  return config;
});

// ─── RESPONSE INTERCEPTOR ────────────────────────────────────────────────────
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    // If 401 Unauthorized and we haven't already retried
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const { data } = await axios.post(`${API_BASE_URL}/auth/refresh`, {}, { withCredentials: true });
        // Update store with new token
        const { useAuthStore } = require('../store/authStore');
        useAuthStore.getState().login(useAuthStore.getState().user, data.accessToken);
        originalRequest.headers['Authorization'] = `Bearer ${data.accessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        if (typeof window !== 'undefined') {
          window.location.href = '/auth/login';
        }
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

