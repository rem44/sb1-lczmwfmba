// api-config.ts
// Détection de l'environnement de production
const isProduction = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';

// Configuration centralisée de l'API
export const API_BASE_URL = isProduction
  ? 'https://super-scraper-production.up.railway.app'
  : (import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001');

console.log('Environnement:', isProduction ? 'PRODUCTION' : 'DÉVELOPPEMENT');
console.log('API_BASE_URL utilisé:', API_BASE_URL);

// Configuration API unifiée
export const API_CONFIG = {
  baseUrl: API_BASE_URL,
  
  // Helper method pour construire des URLs d'API complètes
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
  },
  
  // Headers communs
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
};

// Endpoints uniformisés en un seul endroit
export const API_ENDPOINTS = {
  // Auth
  authLogin: '/auth/login',
  authVerify: '/auth/verify',
  authStatus: '/auth/status',
  
  // SEAO
  seaoDownload: '/seao/download',
  seaoAnalyze: '/seao/analyze',
  seaoStatus: (id) => `/seao/status/${id}`,
  
  // Scraper
  health: '/api/health',
  ping: '/ping',
  scraper: '/api/scraper',
  scraperStatus: (id) => `/api/scraper/status/${id}`
};
