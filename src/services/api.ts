const API_BASE_URL = 'https://trainwreckontherail-production.up.railway.app';

export const api = {
  async startDownload(credentials: { email: string; password: string }) {
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
