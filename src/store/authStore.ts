import { create } from 'zustand';
import { api } from '../services/api';

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  sessionId: string | null;
  requiresSecurityCode: boolean;
  login: (email: string, password: string) => Promise<void>;
  submitSecurityCode: (code: string) => Promise<void>;
  checkSession: () => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  isAuthenticated: false,
  isLoading: false,
  error: null,
  sessionId: null,
  requiresSecurityCode: false,

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.login(email, password);
      
      if (response.requires_security_code) {
        set({ 
          requiresSecurityCode: true, 
          sessionId: response.session_id,
          isLoading: false 
        });
      } else if (response.token) {
        localStorage.setItem('seao_token', response.token);
        set({ 
          isAuthenticated: true,
          requiresSecurityCode: false,
          sessionId: null,
          isLoading: false 
        });
      }
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Erreur de connexion',
        isLoading: false 
      });
    }
  },

  submitSecurityCode: async (code: string) => {
    const { sessionId } = get();
    if (!sessionId) {
      set({ error: 'Session invalide' });
      return;
    }

    set({ isLoading: true, error: null });
    try {
      const response = await api.submitSecurityCode(code, sessionId);
      
      if (response.token) {
        localStorage.setItem('seao_token', response.token);
        set({ 
          isAuthenticated: true,
          requiresSecurityCode: false,
          sessionId: null,
          isLoading: false 
        });
      }
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Code invalide',
        isLoading: false 
      });
    }
  },

  checkSession: async () => {
    set({ isLoading: true, error: null });
    try {
      const isValid = await api.checkSession();
      set({ isAuthenticated: isValid, isLoading: false });
    } catch (error) {
      set({ 
        isAuthenticated: false, 
        error: 'Erreur de vérification de session',
        isLoading: false 
      });
    }
  },

  logout: () => {
    localStorage.removeItem('seao_token');
    set({ 
      isAuthenticated: false,
      requiresSecurityCode: false,
      sessionId: null,
      error: null 
    });
  }
}));