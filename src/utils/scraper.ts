// API configuration - Optimisé pour Vite
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

// Configuration API unifiée
export const API_CONFIG = {
  baseUrl: API_BASE_URL,
  
  // Helper method pour construire des URLs d'API complètes
  getUrl: (endpoint: string): string => {
    const formattedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    return `${API_BASE_URL}${formattedEndpoint}`;
  }
};

// Fonction pour vérifier si l'API est accessible
export async function checkApiHealth(): Promise<boolean> {
  try {
    console.log('Tentative de connexion à:', `${API_BASE_URL}/health`);
    
    const response = await fetch(`${API_BASE_URL}/health`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    
    console.log('Réponse reçue:', response);
    
    if (!response.ok) {
      console.error('Erreur de réponse:', response.status, response.statusText);
      return false;
    }
    
    const data = await response.json();
    console.log('Données reçues:', data);
    return data.status === 'ok';
  } catch (error) {
    console.error('Erreur lors de la vérification:', error);
    return false;
  }
}

// Fonction pour démarrer un job de scraping
export async function startScrapingJob(username: string, password: string, searchTerms?: string[]): Promise<{jobId: string} | null> {
  try {
    console.log('Démarrage d\'un job de scraping pour:', username);
    
    // IMPORTANT: Utiliser la méthode POST et non GET
    const response = await fetch(`${API_BASE_URL}/scraper`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password, searchTerms })
    });
    
    console.log('Réponse reçue:', response);
    
    if (!response.ok) {
      console.error('Erreur de réponse:', response.status, response.statusText);
      return null;
    }
    
    const data = await response.json();
    console.log('Données reçues:', data);
    return data;
  } catch (error) {
    console.error('Erreur lors du démarrage du job de scraping:', error);
    return null;
  }
}

// Version alternative utilisant /scraper/start
export async function startScrapingJobAlt(username: string, password: string, searchTerms?: string[]): Promise<{jobId: string} | null> {
  try {
    console.log('Démarrage d\'un job de scraping (alt) pour:', username);
    
    const response = await fetch(`${API_BASE_URL}/scraper/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password, searchTerms })
    });
    
    console.log('Réponse reçue:', response);
    
    if (!response.ok) {
      console.error('Erreur de réponse:', response.status, response.statusText);
      return null;
    }
    
    const data = await response.json();
    console.log('Données reçues:', data);
    return data;
  } catch (error) {
    console.error('Erreur lors du démarrage du job de scraping:', error);
    return null;
  }
}

// Fonction pour vérifier le statut d'un job
export async function checkJobStatus(jobId: string): Promise<any> {
  try {
    console.log('Vérification du statut du job:', jobId);
    
    const response = await fetch(`${API_BASE_URL}/scraper/status/${jobId}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (!response.ok) {
      console.error('Erreur de réponse:', response.status, response.statusText);
      return null;
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Erreur lors de la vérification du statut:', error);
    return null;
  }
}