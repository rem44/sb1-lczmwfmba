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
    console.log(`API request to: ${url}`, {
      method: options.method,
      headers: options.headers,
      hasBody: !!options.body
    });
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      let errorData: any = { 
        message: `HTTP error ${response.status}` 
      };
      
      try {
        errorData = await response.json();
      } catch {
        // Unable to parse response as JSON, use default message
      }
      
      throw new Error(errorData.message || errorData.error || `Request failed with status ${response.status}`);
    }

    const data = await response.json();
    console.log(`API response from: ${url}`, data);
    return data;
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
    const maxRetries = 2;
    let retryCount = 0;
    let lastError: any = null;
    
    while (retryCount <= maxRetries) {
      try {
        console.log(`Submitting security code to ${API_BASE_URL}/scraper/verify-code${retryCount > 0 ? ` (retry ${retryCount}/${maxRetries})` : ''}`);
        
        // Create payload object
        const payload: Record<string, string> = { 
          code, 
          session_id: sessionId
        };
        
        // Only add job_id if provided and not undefined/null
        if (jobId && jobId !== 'undefined' && jobId !== 'null') {
          payload.job_id = jobId;
        }
        
        // Add extra timeout for this critical operation
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 seconds timeout
        
        const response = await fetch(`${API_BASE_URL}/scraper/verify-code`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
  
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ 
            message: `HTTP error ${response.status}` 
          }));
          
          throw new Error(errorData.message || errorData.error || `Request failed with status ${response.status}`);
        }
  
        const data = await response.json();
        console.log(`Security code response:`, data);
        
        return data;
      } catch (error) {
        lastError = error;
        retryCount++;
        console.error(`Error during security code verification (attempt ${retryCount}/${maxRetries}):`, error);
        
        // Only retry on network errors or timeouts
        const isNetworkError = error instanceof TypeError || 
                              (error instanceof Error && 
                              (error.message?.includes("timeout") || 
                               error.message?.includes("network") ||
                               error.name === 'AbortError'));
                              
        if (retryCount <= maxRetries && isNetworkError) {
          console.log(`Retrying in 2 seconds...`);
          await new Promise(resolve => setTimeout(resolve, 2000));
          continue;
        }
        break;
      }
    }
    
    // If we've exhausted all retries, throw the last error
    throw lastError;
  },
  
  async checkJobStatus(jobId: string) {
    return fetchWithJson(`${API_BASE_URL}/scraper/status/${jobId}`);
  },
  
  // Download functions
  async startDownload(credentials?: { username: string; password: string }) {
    console.log(`Starting download at ${API_BASE_URL}/start_download`);
    
    const payload = credentials 
      ? { username: credentials.username, password: credentials.password }
      : {};
      
    return fetchWithJson(`${API_BASE_URL}/start_download`, {
      method: 'POST',
      body: JSON.stringify(payload),
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
      console.log(`Testing connection to ${API_BASE_URL}/health`);
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
      console.error('Connection test failed:', error);
      return {
        success: false,
        status: 0, // Connection failed
        error: error instanceof Error ? error.message : String(error),
        data: null
      };
    }
  },
  
  // Debug function to help troubleshoot API issues
  async debugRequest(endpoint: string, method: string = 'GET', body?: any) {
    console.log(`Debug request to ${API_BASE_URL}/${endpoint}`);
    try {
      const options: RequestInit = {
        method,
        headers: {
          'Content-Type': 'application/json'
        }
      };
      
      if (body) {
        options.body = JSON.stringify(body);
      }
      
      const response = await fetch(`${API_BASE_URL}/${endpoint}`, options);
      const responseData = await response.json().catch(() => null);
      
      return {
        success: response.ok,
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        data: responseData
      };
    } catch (error) {
      console.error(`Debug request failed:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }
};
