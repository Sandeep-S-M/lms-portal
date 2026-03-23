import { apiClient } from './apiClient';
import { useAuthStore } from '../store/authStore';

export const logoutUser = async () => {
  try {
    await apiClient.post('/auth/logout');
  } catch (error) {
    console.error('Logout failed:', error);
  } finally {
    useAuthStore.getState().logout();
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  }
};
