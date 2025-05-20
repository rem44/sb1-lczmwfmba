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
  requires_security_code?: boolean;
  sessionId?: string | null;
  session_id?: string | null;
  jobId?: string | null;
  job_id?: string | null;
  message?: string;
  requires_reconnect?: boolean;
  auth_result?: {
    requires_security_code?: boolean;
    session_id?: string;
    job_id?: string;
  };
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
      
      // Debugging: Log all relevant fields for checking security code requirement
      console.log("AuthContext: Security code check fields:", {
        directRequires: response.requiresSecurityCode,
        snakeCaseRequires: response.requires_security_code,
        auth_result: response.auth_result,
        auth_result_requires: response.auth_result?.requires_security_code
      });
      
      // Cas 1: Succès standard sans code de sécurité
      if ((response.success === true || response.status === "success") && 
          !response.requiresSecurityCode && 
          !response.requires_security_code && 
          !response.auth_result?.requires_security_code) {
        console.log("AuthContext: Login successful");
        
        // Save session ID if available
        if (response.session_id || response.sessionId) {
          const sessionId = response.session_id || response.sessionId;
          setSessionToken(sessionId);
          localStorage.setItem('auth_session_id', sessionId);
        }
        
        setIsAuthenticated(true);
        
        return {
          success: true,
          sessionId: response.session_id || response.sessionId,
          jobId: response.jobId || response.job_id
        };
      }
      
      // Cas 2: Code de sécurité requis - format direct
      if (response.requiresSecurityCode === true || response.requires_security_code === true) {
        console.log("AuthContext: Security code required (direct format)");
        return {
          success: false,
          requiresSecurityCode: true,
          requires_security_code: true,
          sessionId: response.sessionId || response.session_id,
          jobId: response.jobId || response.job_id,
          message: "Un code de sécurité est requis pour poursuivre."
        };
      }
      
      // Cas 3: Code de sécurité requis - format auth_result
      if (response.auth_result && response.auth_result.requires_security_code === true) {
        console.log("AuthContext: Security code required (auth_result format)");
        return {
          success: false,
          requiresSecurityCode: true,
          requires_security_code: true,
          sessionId: response.auth_result.session_id,
          jobId: response.auth_result.job_id || response.jobId || response.job_id,
          message: "Un code de sécurité est requis pour poursuivre."
        };
      }
      
      // Cas 4: Échec générique
      console.log("AuthContext: Login failed with generic response:", response);
      return { 
        success: false, 
        message: response.message || response.error || 'Échec de l\'authentification' 
      };
    } catch (error) {
      console.error("AuthContext: Login error:", error);
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Erreur lors de la connexion' 
      };
    }
  };

  const submitSecurityCode = async (code: string, sessionId: string, jobId?: string): Promise<LoginResponse> => {
    try {
      console.log("AuthContext: Submitting security code details:", { 
        code: code.substring(0, 1) + '*'.repeat(code.length - 1), 
        sessionId: sessionId.substring(0, 8) + '...',
        jobId: jobId ? jobId.substring(0, 8) + '...' : undefined 
      });
      
      // Clean up the code - remove any non-digit characters
      const cleanCode = code.replace(/\D/g, '');
      console.log("AuthContext: Using clean code:", cleanCode.substring(0, 1) + '*'.repeat(cleanCode.length - 1));

      // Add explicit retries for code verification
      let attempts = 0;
      const maxAttempts = 3;
      
      while (attempts < maxAttempts) {
        attempts++;
        try {
          const response = await api.submitSecurityCode(cleanCode, sessionId, jobId);
          console.log("AuthContext: Security code response:", response);
          
          if (response.success) {
            // Save the session token
            if (response.session_id || response.sessionId) {
              const newSessionId = response.session_id || response.sessionId;
              setSessionToken(newSessionId);
              localStorage.setItem('auth_session_id', newSessionId);
            }
            
            setIsAuthenticated(true);
            
            return {
              success: true,
              sessionId: response.session_id || response.sessionId
            };
          }
          
          // If we get a "session expired" error that requires reconnect, break the loop
          if (response.requires_reconnect) {
            return { 
              success: false, 
              message: response.message || 'Session expired. Please restart the login process.',
              requires_reconnect: true
            };
          }
          
          return { 
            success: false, 
            message: response.message || 'Invalid security code' 
          };
        } catch (error) {
          console.error(`AuthContext: Security code error (attempt ${attempts}/${maxAttempts}):`, error);
          
          // Only retry on network errors, not application errors
          if (error instanceof Error && 
              (error.message.includes('network') || error.message.includes('timeout')) &&
              attempts < maxAttempts) {
            console.log(`Retrying security code verification (attempt ${attempts}/${maxAttempts})...`);
            // Add a small delay before retrying
            await new Promise(resolve => setTimeout(resolve, 1000));
            continue;
          }
          
          throw error;
        }
      }
      
      return { 
        success: false, 
        message: `Security code verification failed after ${maxAttempts} attempts` 
      };
    } catch (error) {
      console.error("AuthContext: Security code error:", error);
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Error during code verification' 
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
