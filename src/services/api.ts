import { API_CONFIG } from '../utils/config';

interface AuthResponse {
  requires_security_code?: boolean;
  session_id?: string;
  token?: string;
  error?: string;
}

interface StatusResponse {
  status: string;
  progress: number;
  message: string;
}

export const api = {
  async login(email: string, password: string): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_CONFIG.baseUrl}/auth`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      if (!response.ok) {
        throw new Error('Erreur de connexion');
      }

      return await response.json();
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  async submitSecurityCode(code: string, sessionId: string): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_CONFIG.baseUrl}/auth`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, session_id: sessionId })
      });

      if (!response.ok) {
        throw new Error('Code invalide');
      }

      return await response.json();
    } catch (error) {
      console.error('Security code error:', error);
      throw error;
    }
  },

  async checkSession(): Promise<boolean> {
    try {
      const token = localStorage.getItem('seao_token');
      if (!token) return false;

      const response = await fetch(`${API_CONFIG.baseUrl}/auth/check`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      return response.ok;
    } catch {
      return false;
    }
  },

  async startDownload(): Promise<{ task_id: string }> {
    try {
      const token = localStorage.getItem('seao_token');
      const response = await fetch(`${API_CONFIG.baseUrl}/download/start`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Erreur de démarrage du téléchargement');
      }

      return await response.json();
    } catch (error) {
      console.error('Download start error:', error);
      throw error;
    }
  },

  async checkDownloadStatus(taskId: string): Promise<StatusResponse> {
    try {
      const token = localStorage.getItem('seao_token');
      const response = await fetch(`${API_CONFIG.baseUrl}/download/status?task_id=${taskId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) {
        throw new Error('Erreur de vérification du statut');
      }

      return await response.json();
    } catch (error) {
      console.error('Status check error:', error);
      throw error;
    }
  },

  getDownloadUrl(downloadId: string): string {
    const token = localStorage.getItem('seao_token');
    return `${API_CONFIG.baseUrl}/download/files?download_id=${downloadId}&token=${token}`;
  }
};