'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import apiClient from '@/lib/api-client';
import { ApiResponse, AuthData, User } from '@/types/api';
import { useQueryClient } from '@tanstack/react-query';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (credentials: { email: string; password: string }) => Promise<User>;
  register: (data: { name: string; email: string; password: string; phone?: string }) => Promise<User>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const queryClient = useQueryClient();

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('auth_token');
      const storedUser = localStorage.getItem('auth_user');

      if (storedToken) {
        setToken(storedToken);
        if (storedUser) {
          try {
            setUser(JSON.parse(storedUser));
          } catch {
            // ignore JSON parse error
          }
        }
      } else {
        setIsLoading(false);
        return;
      }

      try {
        const response = await apiClient.get<ApiResponse<User>>('/auth/me');
        if (response.data.success && response.data.data) {
          setUser(response.data.data);
          localStorage.setItem('auth_user', JSON.stringify(response.data.data));
        }
      } catch {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
        setToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (credentials: { email: string; password: string }): Promise<User> => {
    const response = await apiClient.post<ApiResponse<AuthData>>('/auth/login', credentials);
    const authData = response.data.data;

    localStorage.setItem('auth_token', authData.token);
    localStorage.setItem('auth_user', JSON.stringify(authData.user));
    setToken(authData.token);
    setUser(authData.user);

    return authData.user;
  };

  const register = async (data: { name: string; email: string; password: string; phone?: string }): Promise<User> => {
    const payload = {
      ...data,
      password_confirmation: data.password,
    };
    const response = await apiClient.post<ApiResponse<AuthData>>('/auth/register', payload);
    const authData = response.data.data;

    localStorage.setItem('auth_token', authData.token);
    localStorage.setItem('auth_user', JSON.stringify(authData.user));
    setToken(authData.token);
    setUser(authData.user);

    return authData.user;
  };

  const logout = async (): Promise<void> => {
    try {
      await apiClient.post('/auth/logout');
    } catch {
      // Ignore network errors during logout cleanup
    } finally {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
      setUser(null);
      setToken(null);
      queryClient.clear();
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
