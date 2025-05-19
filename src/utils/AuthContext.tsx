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
      console.log("AuthContext: Submitting security code details:", { 
        code, 
        sessionId,
        jobId 
      });
      
      // Clean up the code - remove any non-digit characters
      const cleanCode = code.replace(/\D/g, '');
      console.log(`AuthContext: Using clean code: ${cleanCode.substring(0, 2)}****`);
      
      // Handle test session specially
      if (sessionId === "test-session-id") {
        console.log("AuthContext: Using test session");
        
        // For test sessions, simulate success
        if (cleanCode === "123456") {
          setIsAuthenticated(true);
          const testSessionId = "test-auth-session";
          setSessionToken(testSessionId);
          localStorage.setItem('auth_session_id', testSessionId);
          
          return {
            success: true,
            sessionId: testSessionId
          };
        } else {
          return {
            success: false,
            message: "Code de test invalide. Utilisez '123456' pour le test."
          };
        }
      }
      
      // Regular API call for real sessions
      const payload = { 
        code: cleanCode, 
        session_id: sessionId
      };
      
      // Only add job_id if it exists and isn't undefined or null
      if (jobId && jobId !== 'undefined') {
        payload.job_id = jobId;
      }
      
      console.log("AuthContext: Security code payload:", payload);
      const response = await api.submitSecurityCode(cleanCode, sessionId, jobId);
      console.log("AuthContext: Security code response:", response);
      
      if (response.success) {
        // Save the session token
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
