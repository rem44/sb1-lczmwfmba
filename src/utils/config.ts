// API configuration
export const API_CONFIG = {
  baseUrl: import.meta.env.VITE_API_BASE_URL ||
  
  // Helper method to build API URLs
  getUrl: (endpoint: string): string => {
    const baseUrl = API_CONFIG.baseUrl.endsWith('/') 
      ? API_CONFIG.baseUrl.slice(0, -1) 
      : API_CONFIG.baseUrl;
    
    const formattedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    return `${baseUrl}${formattedEndpoint}`;
  },

  // Common headers for API requests
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
};

// Authentication endpoints
export const AUTH_ENDPOINTS = {
  login: '/auth/login',
  verify: '/auth/verify',
  status: '/auth/status'
};

// SEAO endpoints
export const SEAO_ENDPOINTS = {
  download: '/seao/download',
  analyze: '/seao/analyze',
  status: '/seao/status'
};
