import axios, { AxiosError } from 'axios';
import { AuthTokens } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

let authTokens: AuthTokens | null = null;

export const setAuthTokens = (tokens: AuthTokens | null) => {
  authTokens = tokens;
  if (tokens) {
    localStorage.setItem('authTokens', JSON.stringify(tokens));
    api.defaults.headers.common['Authorization'] = `Bearer ${tokens.accessToken}`;
  } else {
    localStorage.removeItem('authTokens');
    delete api.defaults.headers.common['Authorization'];
  }
};

export const getStoredTokens = (): AuthTokens | null => {
  const stored = localStorage.getItem('authTokens');
  if (stored) {
    try {
      const tokens = JSON.parse(stored) as AuthTokens;
      setAuthTokens(tokens);
      return tokens;
    } catch {
      localStorage.removeItem('authTokens');
    }
  }
  return null;
};

api.interceptors.request.use(
  (config) => {
    if (authTokens) {
      config.headers.Authorization = `Bearer ${authTokens.accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && originalRequest && authTokens) {
      try {
        const response = await axios.post(`${API_URL}/auth/refresh`, {
          refreshToken: authTokens.refreshToken,
        });
        
        const newTokens = response.data.data.tokens;
        setAuthTokens(newTokens);
        
        originalRequest.headers.Authorization = `Bearer ${newTokens.accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        setAuthTokens(null);
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;