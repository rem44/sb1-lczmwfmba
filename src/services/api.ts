// src/services/api.ts
const API_BASE_URL = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL;

export const api = {
  async startDownload(credentials: { email: string; password: string }) {
    const response = await fetch(`${API_BASE_URL}/api/start_download`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials), // Send credentials in the request body
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Erreur de réseau' }));
      throw new Error(errorData.message || 'Erreur de démarrage du téléchargement');
    }
    
    return response.json();
  },

  // Other methods remain the same
  async checkDownloadStatus(taskId: string) {
    const response = await fetch(`${API_BASE_URL}/api/download_status/${taskId}`, {
      credentials: 'include',
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Erreur de réseau' }));
      throw new Error(errorData.message || 'Erreur lors de la vérification du statut');
    }
    
    return response.json();
  },

  getDownloadUrl(downloadId: string) {
    return `${API_BASE_URL}/api/download/${downloadId}`;
  },

  async login(email: string, password: string) {
    const response = await fetch(`${API_BASE_URL}/api/login`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Erreur de connexion' }));
      throw new Error(errorData.message || 'Échec de la connexion au serveur');
    }
    
    return response.json();
  },

  async checkSession() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/session`, {
        credentials: 'include',
      });
      
      return response.ok;
    } catch (error) {
      return false;
    }
  },
};
