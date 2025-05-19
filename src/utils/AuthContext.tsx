// src/utils/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

interface AuthContextType {
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<any>;
  submitSecurityCode: (code: string, sessionId: string, jobId?: string) => Promise<any>;
  logout: () => void;
  serverAvailable: boolean;
}

interface LoginResponse {
  success: boolean;
  requiresSecurityCode?: boolean;
  sessionId?: string | null;
  jobId?: string | null;
  message?: string;
}

// Default context value
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
  const [sessionToken, setSessionToken] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check for saved session
        const savedSession = localStorage.getItem('auth_session_id');
        
        if (savedSession) {
          // Attempt to validate the session by making a request
          // If the backend had a specific endpoint for this, we'd use that instead
          const sessionValid = await api.checkSession();
          setIsAuthenticated(sessionValid);
          if (sessionValid) {
            setSessionToken(savedSession);
          } else {
            // Clear invalid session
            localStorage.removeItem('auth_session_id');
          }
        }
        
        setServerAvailable(true);
      } catch (error) {
        console.error("Auth check error:", error);
        setServerAvailable(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (username: string, password: string): Promise<LoginResponse> => {
  try {
    console.log("AuthContext: Attempting login with:", username);
    const response = await api.login(username, password);
      console.log("AuthContext: Login response received:", response);
      
      // Case 1: Standard success response
      if (response.success === true || response.status === "success") {
        console.log("AuthContext: Login successful");
        
        // Save session ID if available
        if (response.session_id) {
          setSessionToken(response.session_id);
          localStorage.setItem('auth_session_id', response.session_id);
        }
        
        setIsAuthenticated(true);
        
        return {
          success: true,
          jobId: response.jobId,
          sessionId: response.session_id
        };
      }
      
      // Case 2: Security code required from main response
      if (response.requires_security_code) {
        console.log("AuthContext: Security code required from main response");
        return {
          success: false,
          requiresSecurityCode: true,
          sessionId: response.session_id,
          jobId: response.jobId
        };
      }
      
      // Case 3: Security code required nested in auth_result
      if (response.auth_result && response.auth_result.requires_security_code) {
        console.log("AuthContext: Security code required from auth_result");
        return {
          success: false,
          requiresSecurityCode: true,
          sessionId: response.auth_result.session_id,
          jobId: response.jobId
        };
      }
      
      // Case 4: Generic failure
      console.log("AuthContext: Login failed with response:", response);
      return { 
        success: false, 
        message: response.message || response.error || 'Authentication failed' 
      };
    } catch (error) {
      console.error("AuthContext: Login error:", error);
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Error during login' 
      };
    }
  };

  const submitSecurityCode = async (code: string, sessionId: string, jobId?: string): Promise<LoginResponse> => {
    try {
      console.log("AuthContext: Submitting security code for session:", sessionId);
      const response = await api.submitSecurityCode(code, sessionId, jobId);
      console.log("AuthContext: Security code response:", response);
      
      if (response.success) {
        // Save the session
        if (response.session_id) {
          setSessionToken(response.session_id);
          localStorage.setItem('auth_session_id', response.session_id);
        }
        
        setIsAuthenticated(true);
        
        return {
          success: true,
          sessionId: response.session_id
        };
      }
      
      return { 
        success: false, 
        message: response.message || 'Invalid security code' 
      };
    } catch (error) {
      console.error("AuthContext: Security code error:", error);
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Error verifying code' 
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('auth_session_id');
    setSessionToken(null);
    setIsAuthenticated(false);
  };

  // Prepare context value
  const value = {
    isAuthenticated,
    login,
    submitSecurityCode,
    logout,
    serverAvailable,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
