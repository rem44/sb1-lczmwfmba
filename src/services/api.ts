// src/services/api.ts
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000').replace(/\/api$/, '');

export const api = {
  // Authentication functions
  async login(email: string, password: string) {
    const response = await fetch(`${API_BASE_URL}/api/scraper`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username: email, password }),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Erreur de connexion' }));
      throw new Error(errorData.message || 'Échec de la connexion au serveur');
    }
    
    return response.json();
  },
  
  async checkSession() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/health`);
      return response.ok;
    } catch (error) {
      return false;
    }
  },
  
  async submitSecurityCode(code: string, sessionId: string, jobId: string = '') {
    const response = await fetch(`${API_BASE_URL}/api/scraper/verify-code`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        code, 
        session_id: sessionId,
        job_id: jobId
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Erreur de vérification' }));
      throw new Error(errorData.message || 'Échec de la vérification du code');
    }
    
    return response.json();
  },
  
  // Download functions
  async startDownload(credentials: { email: string; password: string }) {
    console.log("Sending credentials to API:", credentials.email);
    const response = await fetch(`${API_BASE_URL}/api/start_download`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Erreur de réseau' }));
      throw new Error(errorData.message || 'Erreur de démarrage du téléchargement');
    }
    
    return response.json();
  },
  
  async checkDownloadStatus(taskId: string) {
    const response = await fetch(`${API_BASE_URL}/api/download_status/${taskId}`);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Erreur de réseau' }));
      throw new Error(errorData.message || 'Erreur lors de la vérification du statut');
    }
    
    return response.json();
  },
  
  getDownloadUrl(downloadId: string) {
    return `${API_BASE_URL}/api/download/${downloadId}`;
  },
};
