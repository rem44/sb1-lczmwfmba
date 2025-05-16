import { API_CONFIG, API_ENDPOINTS } from '../utils/api-config';

class ApiService {
  private static instance: ApiService;
  private token: string | null = null;

  private constructor() {
    // Load token from storage if exists
    this.token = localStorage.getItem('seao_token');
  }

  static getInstance(): ApiService {
    if (!ApiService.instance) {
      ApiService.instance = new ApiService();
    }
    return ApiService.instance;
  }

  private getHeaders(): HeadersInit {
    const headers = { ...API_CONFIG.headers };
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    return headers;
  }

  private async handleResponse(response: Response) {
    const data = await response.json();
    
    if (!response.ok) {
      if (response.status === 401) {
        // Clear token and trigger re-authentication
        this.clearToken();
        throw new Error('Session expirée. Veuillez vous reconnecter.');
      }
      throw new Error(data.message || 'Une erreur est survenue');
    }
    
    return data;
  }

  private setToken(token: string) {
    this.token = token;
    localStorage.setItem('seao_token', token);
  }

  private clearToken() {
    this.token = null;
    localStorage.removeItem('seao_token');
  }

  async login(email: string, password: string) {
    try {
      const response = await fetch(API_CONFIG.getUrl(AUTH_ENDPOINTS.login), {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ email, password })
      });

      const data = await this.handleResponse(response);
      
      if (data.token) {
        this.setToken(data.token);
      }
      
      return data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  async verifySecurityCode(code: string, sessionId: string) {
    try {
      const response = await fetch(API_CONFIG.getUrl(AUTH_ENDPOINTS.verify), {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ code, sessionId })
      });

      const data = await this.handleResponse(response);
      
      if (data.token) {
        this.setToken(data.token);
      }
      
      return data;
    } catch (error) {
      console.error('Security code verification error:', error);
      throw error;
    }
  }

  async checkServerStatus() {
    try {
      const response = await fetch(API_CONFIG.getUrl(AUTH_ENDPOINTS.status), {
        headers: this.getHeaders()
      });
      return response.ok;
    } catch (error) {
      console.error('Server status check error:', error);
      return false;
    }
  }

  async startDownload(options = {}) {
    try {
      const response = await fetch(API_CONFIG.getUrl(SEAO_ENDPOINTS.download), {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(options)
      });
      return await this.handleResponse(response);
    } catch (error) {
      console.error('Download start error:', error);
      throw error;
    }
  }

  async checkDownloadStatus(taskId: string) {
    try {
      const response = await fetch(API_CONFIG.getUrl(`${SEAO_ENDPOINTS.status}/${taskId}`), {
        headers: this.getHeaders()
      });
      return await this.handleResponse(response);
    } catch (error) {
      console.error('Download status check error:', error);
      throw error;
    }
  }

  async analyzePDF(files: File[]) {
    try {
      const formData = new FormData();
      files.forEach(file => formData.append('files', file));

      const response = await fetch(API_CONFIG.getUrl(SEAO_ENDPOINTS.analyze), {
        method: 'POST',
        headers: {
          ...this.getHeaders(),
          // Remove Content-Type for FormData
          'Content-Type': undefined
        },
        body: formData
      });
      return await this.handleResponse(response);
    } catch (error) {
      console.error('PDF analysis error:', error);
      throw error;
    }
  }
}

export const api = ApiService.getInstance();
