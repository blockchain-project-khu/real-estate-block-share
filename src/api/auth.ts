
import { apiClient } from './client';
import { LoginRequest, RegisterRequest, LoginResponse } from './types';

export const authApi = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    return apiClient.login(credentials);
  },

  register: async (userData: RegisterRequest): Promise<void> => {
    return apiClient.register(userData);
  },

  logout: async (): Promise<void> => {
    return apiClient.logout();
  },

  isAuthenticated: (): boolean => {
    const access = localStorage.getItem('access');
    return !!access;
  },

  getUserId: (): number | null => {
    const userId = localStorage.getItem('userId');
    return userId ? parseInt(userId, 10) : null;
  }
};
