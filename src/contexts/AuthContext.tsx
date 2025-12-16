"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'viewer' | 'technician' | 'admin';
  createdAt: string;
  lastLogin?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, role?: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  hasRole: (roles: string[]) => boolean;
  canControlDevices: () => boolean;
  canAccessSettings: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Load user from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('auth_token');
    const storedUser = localStorage.getItem('auth_user');

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }

    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      // Save token and user data
      localStorage.setItem('auth_token', data.data.token);
      localStorage.setItem('auth_user', JSON.stringify(data.data.user));

      setToken(data.data.token);
      setUser(data.data.user);

      toast.success('Login successful!');
      router.push('/');
    } catch (error: any) {
      toast.error(error.message || 'Login failed');
      throw error;
    }
  };

  const register = async (name: string, email: string, password: string, role: string = 'viewer') => {
    try {
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password, role }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      // Save token and user data
      localStorage.setItem('auth_token', data.data.token);
      localStorage.setItem('auth_user', JSON.stringify(data.data.user));

      setToken(data.data.token);
      setUser(data.data.user);

      toast.success('Registration successful!');
      router.push('/');
    } catch (error: any) {
      toast.error(error.message || 'Registration failed');
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    setToken(null);
    setUser(null);
    toast.success('Logged out successfully');
    router.push('/login');
  };

  const hasRole = (roles: string[]): boolean => {
    if (!user) return false;
    return roles.includes(user.role);
  };

  const canControlDevices = (): boolean => {
    return hasRole(['technician', 'admin']);
  };

  const canAccessSettings = (): boolean => {
    return hasRole(['admin']);
  };

  const value = {
    user,
    token,
    isLoading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
    hasRole,
    canControlDevices,
    canAccessSettings,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
