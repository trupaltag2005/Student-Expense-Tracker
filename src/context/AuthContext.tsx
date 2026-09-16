import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api.ts';
import { User } from '../types/index.ts';

interface AuthContextValue {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  register: (
    name: string,
    email: string,
    password: string,
    confirmPassword: string
  ) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  updateUser: (user: User) => void;
  deleteAccount: (password: string) => Promise<{ success: boolean; message?: string }>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('auth_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Check auth state on mount
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('auth_token');
      if (!storedToken) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await api.get('/auth/me');
        if (response.data.success && response.data.user) {
          setUser(response.data.user);
          setToken(storedToken);
        } else {
          localStorage.removeItem('auth_token');
          setToken(null);
          setUser(null);
        }
      } catch (err) {
        console.error('Session validation failed:', err);
        localStorage.removeItem('auth_token');
        setToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; message?: string }> => {
    try {
      const response = await api.post('/auth/login', { email, password });
      if (response.data.success) {
        const { token: newToken, user: newUser } = response.data;
        localStorage.setItem('auth_token', newToken);
        setToken(newToken);
        setUser(newUser);
        return { success: true, message: response.data.message };
      }
      return { success: false, message: response.data.message || 'Login failed' };
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Invalid email or password.';
      return { success: false, message: msg };
    }
  };

  const register = async (
    name: string,
    email: string,
    password: string,
    confirmPassword: string
  ): Promise<{ success: boolean; message?: string }> => {
    try {
      const response = await api.post('/auth/register', { name, email, password, confirmPassword });
      if (response.data.success) {
        const { token: newToken, user: newUser } = response.data;
        localStorage.setItem('auth_token', newToken);
        setToken(newToken);
        setUser(newUser);
        return { success: true, message: response.data.message };
      }
      return { success: false, message: response.data.message || 'Registration failed' };
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Registration failed.';
      return { success: false, message: msg };
    }
  };

  const logout = useCallback(() => {
    localStorage.removeItem('auth_token');
    setToken(null);
    setUser(null);
  }, []);

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
  };

  const deleteAccount = async (password: string): Promise<{ success: boolean; message?: string }> => {
    try {
      const response = await api.delete('/auth/account', { data: { password } });
      if (response.data.success) {
        logout();
        return { success: true, message: response.data.message };
      }
      return { success: false, message: response.data.message };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to delete account.',
      };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        updateUser,
        deleteAccount,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
