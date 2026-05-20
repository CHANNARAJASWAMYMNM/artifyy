'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiRequest } from './api';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'customer' | 'seller' | 'admin';
  sellerStatus?: 'pending' | 'approved' | 'rejected' | null;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, password: string, role: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateUserSession: () => Promise<void>;
  backendUrl: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000/api';

  useEffect(() => {
    const loadStoredAuth = async () => {
      const storedToken = localStorage.getItem('artify_token');
      if (storedToken) {
        setToken(storedToken);
        try {
          const data = await apiRequest('/auth/me', {
            headers: { Authorization: `Bearer ${storedToken}` },
          });
          if (data.success) {
            setUser(data.user);
          } else {
            localStorage.removeItem('artify_token');
            setUser(null);
            setToken(null);
          }
        } catch (err) {
          console.error('Failed to load user session:', err);
        }
      }
      setLoading(false);
    };

    loadStoredAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const data = await apiRequest('/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (data.success) {
        localStorage.setItem('artify_token', data.token);
        setToken(data.token);
        setUser(data.user);
        return { success: true };
      } else {
        return { success: false, error: data.error || 'Invalid credentials' };
      }
    } catch (err) {
      return { success: false, error: 'Network error, please try again' };
    }
  };

  const register = async (name: string, email: string, password: string, role: string) => {
    try {
      const data = await apiRequest('/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role }),
      });
      if (data.success) {
        localStorage.setItem('artify_token', data.token);
        setToken(data.token);
        setUser(data.user);
        return { success: true };
      } else {
        return { success: false, error: data.error || 'Registration failed' };
      }
    } catch (err) {
      return { success: false, error: 'Network error, please try again' };
    }
  };

  const logout = () => {
    localStorage.removeItem('artify_token');
    setUser(null);
    setToken(null);
  };

  const updateUserSession = async () => {
    const currentToken = token || localStorage.getItem('artify_token');
    if (!currentToken) return;
    try {
      const data = await apiRequest('/auth/me', {
        headers: { Authorization: `Bearer ${currentToken}` },
      });
      if (data.success) {
        setUser(data.user);
      }
    } catch (err) {
      console.error('Failed to update session:', err);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, updateUserSession, backendUrl }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
