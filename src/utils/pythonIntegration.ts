import { API_CONFIG, API_ENDPOINTS } from './api-config';

interface Credentials {
  email: string;
  password: string;
}

interface ScriptStatus {
  status: 'running' | 'completed' | 'failed';
  progress: number;
  message: string;
}

export async function runPythonScript(credentials: Credentials): Promise<string> {
  try {
    // Validation des identifiants
    if (!credentials?.email?.trim() || !credentials?.password?.trim()) {
      throw new Error("Le nom d'utilisateur et le mot de passe sont requis");
    }

    // Vérification de la disponibilité de l'API
    const healthCheck = await fetch(API_CONFIG.getUrl(API_ENDPOINTS.health)).catch(() => null);
    if (!healthCheck?.ok) {
      throw new Error("Le serveur n'est pas accessible. Veuillez vérifier que le serveur est démarré.");
    }

    // CORRECTION: Utiliser le bon endpoint
    const response = await fetch(API_CONFIG.getUrl(API_ENDPOINTS.scraper), {
      method: 'POST',
      headers: API_CONFIG.headers,
      body: JSON.stringify({
        username: credentials.email.trim(),
        password: credentials.password.trim()
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ 
        message: 'Le serveur a retourné une erreur. Veuillez réessayer plus tard.' 
      }));
      throw new Error(errorData.message);
    }

    const data = await response.json();
    return data.message || 'Opération démarrée avec succès';
  } catch (error) {
    console.error('Error in runPythonScript:', error);
    throw error instanceof Error ? error : new Error('Une erreur inattendue s\'est produite');
  }
}

export async function checkScriptStatus(jobId: string): Promise<ScriptStatus> {
  try {
    // CORRECTION: Utiliser le bon endpoint avec l'ID
    const response = await fetch(API_CONFIG.getUrl(API_ENDPOINTS.scraperStatus(jobId)), {
      method: 'GET',
      headers: API_CONFIG.headers
    });
    
    if (!response.ok) {
      throw new Error('Impossible de vérifier le statut');
    }

    return await response.json();
  } catch (error) {
    console.error('Error checking script status:', error);
    return {
      status: 'failed',
      progress: 0,
      message: 'Impossible de vérifier le statut'
    };
  }
}
