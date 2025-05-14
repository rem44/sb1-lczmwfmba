// API configuration - Optimisé pour Vite
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

// Configuration API unifiée
export const API_CONFIG = {
  baseUrl: API_BASE_URL,
  
  // Helper method pour construire des URLs d'API complètes et éviter les double slashes
  getUrl: (endpoint: string): string => {
    // Normaliser l'URL de base (enlever le slash final s'il existe)
    const baseUrlWithoutTrailingSlash = API_BASE_URL.endsWith('/') 
      ? API_BASE_URL.slice(0, -1) 
      : API_BASE_URL;
    
    // Normaliser l'endpoint (ajouter un slash initial s'il n'existe pas)
    const endpointWithLeadingSlash = endpoint.startsWith('/') 
      ? endpoint 
      : `/${endpoint}`;
    
    return `${baseUrlWithoutTrailingSlash}${endpointWithLeadingSlash}`;
  }
};

// Fonction pour vérifier si l'API est accessible
// Utilise maintenant l'endpoint /status qui existe déjà sur votre backend
export async function checkApiHealth(): Promise<boolean> {
  try {
    // Utiliser /status comme endpoint de health check
    const statusUrl = API_CONFIG.getUrl('/status');
    console.log('Tentative de connexion à:', statusUrl);
    
    const response = await fetch(statusUrl, {
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
    // On considère que si on reçoit une réponse, le service est up
    return true;
  } catch (error) {
    console.error('Erreur lors de la vérification:', error);
    return false;
  }
}

// Fonction pour démarrer un job de scraping
export async function startScrapingJob(username: string, password: string, searchTerms?: string[]): Promise<any> {
  try {
    console.log('Démarrage d\'un job de scraping pour:', username);
    
    // Utiliser directement l'endpoint /start de votre API Railway
    const startUrl = API_CONFIG.getUrl('/start');
    console.log('URL d\'appel:', startUrl);
    
    const response = await fetch(startUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      // Adapter les paramètres pour correspondre à ce qu'attend votre API
      body: JSON.stringify({ 
        email: username, 
        password: password 
        // Retirer searchTerms qui n'est peut-être pas supporté par votre API
      })
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

// Version alternative (maintenue pour compatibilité)
export async function startScrapingJobAlt(username: string, password: string, searchTerms?: string[]): Promise<any> {
  // Appeler la méthode principale pour maintenir un seul point de vérité
  return startScrapingJob(username, password, searchTerms);
}

// Fonction pour vérifier le statut d'un job
export async function checkJobStatus(): Promise<any> {
  try {
    console.log('Vérification du statut du job');
    
    // Utiliser l'endpoint /status de votre API Railway
    const statusUrl = API_CONFIG.getUrl('/status');
    console.log('URL d\'appel:', statusUrl);
    
    const response = await fetch(statusUrl, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (!response.ok) {
      console.error('Erreur de réponse:', response.status, response.statusText);
      return null;
    }
    
    const data = await response.json();
    console.log('Données reçues:', data);
    return data;
  } catch (error) {
    console.error('Erreur lors de la vérification du statut:', error);
    return null;
  }
}

// Fonction utilitaire pour exécuter le script Python (si nécessaire)
export async function runPythonScript(username: string, password: string): Promise<any> {
  // Réutiliser directement la fonction de démarrage du scraping
  return startScrapingJob(username, password);
}
