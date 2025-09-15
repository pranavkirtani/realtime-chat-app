import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { User, LoginData, RegisterData } from '../types';
import { authService } from '../services/auth.service';
import { socketService } from '../services/socket.service';
import { getStoredTokens } from '../services/api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (data: LoginData) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const tokens = getStoredTokens();
        if (tokens) {
          const currentUser = await authService.getCurrentUser();
          setUser(currentUser);
          socketService.connect(tokens.accessToken);
        }
      } catch (err) {
        console.error('Failed to restore auth session:', err);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (data: LoginData) => {
    try {
      setError(null);
      const response = await authService.login(data);
      setUser(response.user);
      socketService.connect(response.tokens.accessToken);
    } catch (err: any) {
      const message = err.response?.data?.error || 'Login failed';
      setError(message);
      throw new Error(message);
    }
  };

  const register = async (data: RegisterData) => {
    try {
      setError(null);
      const response = await authService.register(data);
      setUser(response.user);
      socketService.connect(response.tokens.accessToken);
    } catch (err: any) {
      const message = err.response?.data?.error || 'Registration failed';
      const details = err.response?.data?.details;
      if (details && Array.isArray(details)) {
        const detailMessage = details.map((d: any) => d.message).join(', ');
        setError(detailMessage);
        throw new Error(detailMessage);
      }
      setError(message);
      throw new Error(message);
    }
  };

  const logout = () => {
    authService.logout();
    socketService.disconnect();
    setUser(null);
    setError(null);
  };

  const clearError = () => {
    setError(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        register,
        logout,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};