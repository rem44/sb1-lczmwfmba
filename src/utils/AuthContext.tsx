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
      // Use the api.login function to authenticate
      const response = await api.login(email, password);
      
      // Check if authentication was successful
      if (response && (response.success || response.status === "success")) {
        setIsAuthenticated(true);
        return {
          success: true,
          jobId: response.jobId,
          // Check if security code is required
          requiresSecurityCode: response.auth_result?.requires_security_code || false,
          sessionId: response.auth_result?.session_id || null
        };
      }
      
      // If authentication requires a security code
      if (response && response.auth_result?.requires_security_code) {
        return {
          success: false,
          requiresSecurityCode: true,
          sessionId: response.auth_result.session_id,
          jobId: response.jobId
        };
      }
      
      return { 
        success: false,
        message: response.message || 'Authentication failed' 
      };
    } catch (error) {
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Error during login' 
      };
    }
  };

  const submitSecurityCode = async (code: string, sessionId: string) => {
    try {
      const response = await api.submitSecurityCode(code, sessionId);
      
      if (response.success) {
        setIsAuthenticated(true);
      }
      
      return response;
    } catch (error) {
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Error verifying code' 
      };
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
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
