import { API_BASE_URL } from './config';

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
    const healthCheck = await fetch(`${API_BASE_URL}/health`).catch(() => null);
    if (!healthCheck?.ok) {
      throw new Error("Le serveur n'est pas accessible. Veuillez vérifier que le serveur est démarré.");
    }

    const response = await fetch(`${API_BASE_URL}/scraper/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
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

export async function checkScriptStatus(): Promise<ScriptStatus> {
  try {
    const response = await fetch(`${API_BASE_URL}/scraper/status`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
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