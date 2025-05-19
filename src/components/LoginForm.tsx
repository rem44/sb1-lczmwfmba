// src/components/LoginForm.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';

const LoginForm: React.FC = () => {
  const [username, setusername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [securityCode, setSecurityCode] = useState<string>('');
  const [tempSessionId, setTempSessionId] = useState<string>('');
  const [requiresCode, setRequiresCode] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  
  const { login, submitSecurityCode, serverAvailable } = useAuth();
  const navigate = useNavigate();
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      const response = await login(username, password);
      
      if (response.requiresSecurityCode) {
        setRequiresCode(true);
        setTempSessionId(response.sessionId);
      } else if (response.success) {
        navigate('/dashboard');
      } else {
        setError(response.message || 'Erreur de connexion');
      }
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Une erreur inconnue est survenue');
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSecurityCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      const response = await submitSecurityCode(securityCode, tempSessionId);
      
      if (response.success) {
        navigate('/dashboard');
      } else {
        setError(response.message || 'Code de sécurité invalide');
      }
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Une erreur inconnue est survenue');
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  // Si le serveur n'est pas disponible
  if (!serverAvailable) {
    return (
      <div className="error-container">
        <div className="error-message">
          Le serveur n'est pas accessible. Veuillez vérifier que le serveur est démarré.
        </div>
      </div>
    );
  }
  
  return (
    <div className="login-container">
      <h2>Configuration de la connexion SEAO</h2>
      
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
      
      {!requiresCode ? (
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label htmlFor="username">Identifiant (username)</label>
            <input
              id="username"
              type="username"
              value={username}
              onChange={(e) => setusername(e.target.value)}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Mot de passe</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          <button 
            type="submit" 
            className="submit-button"
            disabled={isLoading}
          >
            {isLoading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>
      ) : (
        <form onSubmit={handleSecurityCodeSubmit}>
          <div className="security-code-container">
            <p>Un code de sécurité a été envoyé à votre adresse username. Veuillez le saisir ci-dessous:</p>
            
            <div className="form-group">
              <label htmlFor="securityCode">Code de sécurité</label>
              <input
                id="securityCode"
                type="text"
                value={securityCode}
                onChange={(e) => setSecurityCode(e.target.value)}
                placeholder="Exemple: 123456"
                required
              />
            </div>
            
            <button 
              type="submit" 
              className="submit-button"
              disabled={isLoading}
            >
              {isLoading ? 'Vérification...' : 'Valider le code'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default LoginForm;
