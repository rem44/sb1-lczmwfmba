// src/services/api.ts
import config from '../utils/config';

interface ApiResponse {
  success: boolean;
  message?: string;
  [key: string]: any;
}

interface LoginResponse extends ApiResponse {
  session_id?: string;
  requires_security_code?: boolean;
}

interface DownloadStartResponse extends ApiResponse {
  task_id?: string;
}

interface DownloadStatusResponse extends ApiResponse {
  task?: {
    id: string;
    status: 'initializing' | 'running' | 'completed' | 'failed';
    progress: number;
    message: string;
    result?: {
      download_id: string;
      [key: string]: any;
    };
  };
}

const API = {
  // Méthode générique pour les appels avec gestion des erreurs
  async fetchWithAuth(endpoint: string, options: RequestInit = {}): Promise<any> {
    const sessionId = localStorage.getItem('sessionId');
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    };

    const fullOptions: RequestInit = {
      ...options,
      headers
    };

    try {
      const response = await fetch(`${config.API_BASE_URL}${endpoint}`, fullOptions);
      
      // Vérifier si le serveur est accessible
      if (!response.ok) {
        if (response.status === 401) {
          // Rediriger vers la page de connexion si la session a expiré
          localStorage.removeItem('sessionId');
          window.location.href = '/login';
          throw new Error('Session expirée. Veuillez vous reconnecter.');
        }
        
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'Failed to fetch') {
          throw new Error('Le serveur n\'est pas accessible. Veuillez vérifier que le serveur est démarré.');
        }
        throw error;
      }
      throw new Error('Une erreur inconnue est survenue');
    }
  },
  
  // Vérifier si le serveur est accessible
  async checkServerStatus(): Promise<boolean> {
    try {
      const response = await fetch(`${config.API_BASE_URL}/healthcheck`);
      return response.ok;
    } catch (error) {
      console.error('Erreur lors de la vérification du statut du serveur', error);
      return false;
    }
  },
  
  // Authentification
  async login(email: string, password: string): Promise<LoginResponse> {
    return this.fetchWithAuth('/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
  },
  
  // Soumettre le code de sécurité
  async submitSecurityCode(securityCode: string, sessionId: string): Promise<LoginResponse> {
    return this.fetchWithAuth('/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ security_code: securityCode, session_id: sessionId })
    });
  },
  
  // Vérifier si la session est valide
  async checkSession(sessionId: string): Promise<ApiResponse> {
    return this.fetchWithAuth('/auth/check', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session_id: sessionId })
    });
  },
  
  // Démarrer un téléchargement
  async startDownload(sessionId: string, options: Record<string, any> = {}): Promise<DownloadStartResponse> {
    return this.fetchWithAuth('/download/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session_id: sessionId, options })
    });
  },
  
  // Vérifier l'état d'un téléchargement
  async checkDownloadStatus(taskId: string): Promise<DownloadStatusResponse> {
    return this.fetchWithAuth(`/download/status?task_id=${taskId}`);
  },
  
  // Obtenir l'URL de téléchargement du ZIP
  getDownloadUrl(downloadId: string): string {
    return `${config.API_BASE_URL}/download/files?download_id=${downloadId}`;
  }
};

export default API;
