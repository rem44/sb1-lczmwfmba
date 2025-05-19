// src/services/api.ts

// Get base URL from environment or fallback to localhost
const getApiBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_BASE_URL;
  
  // Add safety check to ensure URL has a protocol
  if (!envUrl) return 'http://localhost:5000/api';
  
  // Ensure URL has protocol
  if (!envUrl.startsWith('http://') && !envUrl.startsWith('https://')) {
    return `https://${envUrl}`;
  }
  
  // Make sure we don't double up on /api
  if (envUrl.endsWith('/api')) return envUrl;
  return `${envUrl}/api`;
};

const API_BASE_URL = getApiBaseUrl();

// Helper for common fetch options with error handling
const fetchWithJson = async (url: string, options: RequestInit = {}) => {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ 
        message: `HTTP error ${response.status}` 
      }));
      throw new Error(errorData.message || `Request failed with status ${response.status}`);
    }

    return response.json();
  } catch (error) {
    console.error(`API error for ${url}:`, error);
    throw error;
  }
};

export const api = {
  // Authentication functions
  async login(username: string, password: string) {
    console.log(`Attempting login to ${API_BASE_URL}/scraper`);
    return fetchWithJson(`${API_BASE_URL}/scraper`, {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
  },
  
  async checkSession() {
    try {
      const response = await fetch(`${API_BASE_URL}/health`);
      return response.ok;
    } catch (error) {
      console.error('Health check failed:', error);
      return false;
    }
  },
  
  async submitSecurityCode(code: string, sessionId: string, jobId?: string) {
    console.log(`Submitting security code to ${API_BASE_URL}/scraper/verify-code`);
    const payload: any = { 
      code, 
      session_id: sessionId
    };
    
    // Only add job_id if provided
    if (jobId) {
      payload.job_id = jobId;
    }
    
    return fetchWithJson(`${API_BASE_URL}/scraper/verify-code`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
  
  async checkJobStatus(jobId: string) {
    return fetchWithJson(`${API_BASE_URL}/scraper/status/${jobId}`);
  },
  
  // Download functions
  async startDownload(credentials: { username: string; password: string }) {
    console.log(`Starting download at ${API_BASE_URL}/start_download`);
    return fetchWithJson(`${API_BASE_URL}/start_download`, {
      method: 'POST',
      body: JSON.stringify({ 
        username: credentials.username,
        password: credentials.password 
      }),
    });
  },
  
  async checkDownloadStatus(taskId: string) {
    return fetchWithJson(`${API_BASE_URL}/download_status/${taskId}`);
  },
  
  getDownloadUrl(downloadId: string) {
    return `${API_BASE_URL}/download/${downloadId}`;
  },
  
  // Utility functions
  async testConnection() {
    try {
      const healthResponse = await fetch(`${API_BASE_URL}/health`, {
        method: 'GET',
        cache: 'no-cache',
      });
      
      const result = {
        success: healthResponse.ok,
        status: healthResponse.status,
        data: null as any
      };
      
      if (healthResponse.ok) {
        result.data = await healthResponse.json();
      }
      
      return result;
    } catch (error) {
      return {
        success: false,
        status: 0, // Connection failed
        error: error instanceof Error ? error.message : String(error),
        data: null
      };
    }
  }
};
