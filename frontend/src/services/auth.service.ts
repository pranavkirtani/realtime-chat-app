import api, { setAuthTokens } from './api';
import { AuthResponse, LoginData, RegisterData } from '../types';

export const authService = {
  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await api.post<{ data: AuthResponse }>('/auth/register', data);
    const authData = response.data.data;
    setAuthTokens(authData.tokens);
    return authData;
  },

  async login(data: LoginData): Promise<AuthResponse> {
    const response = await api.post<{ data: AuthResponse }>('/auth/login', data);
    const authData = response.data.data;
    setAuthTokens(authData.tokens);
    return authData;
  },

  async getCurrentUser() {
    const response = await api.get<{ data: { user: any } }>('/auth/me');
    return response.data.data.user;
  },

  logout() {
    setAuthTokens(null);
  }
};