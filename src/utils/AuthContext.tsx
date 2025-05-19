// src/utils/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

interface AuthContextType {
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<any>;
  submitSecurityCode: (code: string, sessionId: string) => Promise<any>;
  logout: () => void;
  serverAvailable: boolean;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  login: async () => ({ success: false }),
  submitSecurityCode: async () => ({ success: false }),
  logout: () => {},
  serverAvailable: true,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [serverAvailable, setServerAvailable] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const sessionValid = await api.checkSession();
        setIsAuthenticated(sessionValid);
        setServerAvailable(true);
      } catch (error) {
        setServerAvailable(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await api.login(email, password);
      if (response.success) {
        setIsAuthenticated(true);
      }
      return response;
    } catch (error) {
      if (error instanceof Error) {
        return { success: false, message: error.message };
      }
      return { success: false, message: 'Une erreur est survenue' };
    }
  };

  const submitSecurityCode = async (code: string, sessionId: string) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL}/api/verify-code`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code, sessionId }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setIsAuthenticated(true);
      }
      
      return data;
    } catch (error) {
      if (error instanceof Error) {
        return { success: false, message: error.message };
      }
      return { success: false, message: 'Une erreur est survenue' };
    }
  };

  const logout = async () => {
    try {
      await fetch(`${import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL}/api/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } finally {
      setIsAuthenticated(false);
    }
  };

  const value = {
    isAuthenticated,
    login,
    submitSecurityCode,
    logout,
    serverAvailable,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
