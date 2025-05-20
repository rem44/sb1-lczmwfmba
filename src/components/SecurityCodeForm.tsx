// src/components/SecurityCodeForm.tsx
import React, { useState, useEffect } from 'react';
import { Mail, RefreshCw } from 'lucide-react';

interface SecurityCodeFormProps {
  onSubmit: (code: string) => void;
  onCancel: () => void;
  isLoading?: boolean;
  sessionId?: string;
  jobId?: string;
}

const SecurityCodeForm: React.FC<SecurityCodeFormProps> = ({
  onSubmit,
  onCancel,
  isLoading = false,
  sessionId = '',
  jobId = ''
}) => {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [showReconnectButton, setShowReconnectButton] = useState(false);
  const [showResendButton, setShowResendButton] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Format code while typing to include only digits
  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Keep only digits
    const cleanCode = e.target.value.replace(/\D/g, '');
    setCode(cleanCode);

    // Clear any previous errors if user is typing again
    if (error) {
      setError('');
      setShowReconnectButton(false);
    }
  };

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }

    // Show resend button after 30 seconds
    const timer = setTimeout(() => {
      setShowResendButton(true);
    }, 30000);

    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate code
    if (!code.trim()) {
      setError('Veuillez entrer le code de sécurité');
      return;
    }

    // Clean code one more time to be sure
    const cleanCode = code.trim().replace(/\D/g, '');
    
    // Validate code length (most SEAO security codes are 6 digits)
    if (cleanCode.length < 4 || cleanCode.length > 8) {
      setError('Le code de sécurité doit comporter entre 4 et 8 chiffres');
      return;
    }

    try {
      // Call the API via parent component's onSubmit handler
      onSubmit(cleanCode);
    } catch (error) {
      if (error instanceof Error) {
        // Check if the error message indicates session expiration
        if (error.message && error.message.includes("Session invalide ou expirée")) {
          setError("Votre session a expiré. Cliquez sur 'Recommencer' pour vous reconnecter.");
          setShowReconnectButton(true);
        } else {
          setError(error.message || "Erreur lors de la vérification du code");
        }
      } else {
        setError("Une erreur inconnue est survenue");
      }
    }
  };

  const handleReconnect = () => {
    // Use the onCancel function to go back to the login screen
    onCancel();
  };

  const handleResendCode = async () => {
    setIsResending(true);
    setError('');

    try {
      // Simulating a request to resend the code
      // In a real implementation, you would call an API
      await new Promise((resolve) => setTimeout(resolve, 2000));
      
      // Show a success message
      setError('Un nouveau code a été envoyé à votre adresse email.');
      
      // Reset the code field
      setCode('');
      
      // Focus on the input
      if (inputRef.current) {
        inputRef.current.focus();
      }
    } catch (error) {
      setError('Impossible de renvoyer le code. Veuillez réessayer.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="bg-white border border-blue-200 rounded-lg p-6 mb-6 max-w-md mx-auto shadow-md">
      <div className="bg-blue-50 p-4 rounded-md mb-6">
        <div className="flex items-center">
          <Mail className="text-blue-600 mr-2 h-5 w-5" />
          <p className="text-blue-700 text-sm">
            Un code de sécurité a été envoyé à votre adresse email. 
            <strong className="block mt-1">Vérifiez votre boîte de réception et vos spams.</strong>
            {sessionId && <span className="block text-xs mt-1">Session ID: {sessionId.substring(0, 8)}...</span>}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="securityCode" className="block text-sm font-medium text-gray-700 mb-2">
            Code de sécurité
          </label>
          <input
            ref={inputRef}
            id="securityCode"
            type="text"
            value={code}
            onChange={handleCodeChange}
            className="block w-full px-4 py-3 text-center bg-blue-50 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-lg tracking-wider"
            placeholder="Entrez le code à 6 chiffres"
            disabled={isLoading}
            autoComplete="one-time-code"
            inputMode="numeric"
            maxLength={8}
          />
          {error && (
            <p className={`mt-2 text-sm ${error.includes('expiré') ? 'text-orange-600' : 'text-red-600'}`}>
              {error}
            </p>
          )}
          {isLoading && (
            <p className="text-sm text-blue-600 mt-1 flex items-center">
              <RefreshCw size={14} className="animate-spin mr-2" />
              Vérification en cours...
            </p>
          )}
        </div>

        <div className="flex flex-col space-y-3">
          {!showReconnectButton ? (
            <div className="flex justify-between">
              <button
                type="button"
                onClick={onCancel}
                className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                disabled={isLoading}
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={isLoading || !code.trim()}
                className="px-6 py-2 border border-transparent rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Vérification...' : 'Valider'}
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleReconnect}
              className="w-full px-6 py-2 border border-transparent rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Recommencer
            </button>
          )}

          {showResendButton && !showReconnectButton && (
            <button
              type="button"
              onClick={handleResendCode}
              disabled={isResending || isLoading}
              className="w-full px-4 py-2 text-sm text-blue-600 hover:text-blue-800 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isResending ? 'Envoi en cours...' : 'Je n\'ai pas reçu de code'}
            </button>
          )}
        </div>
      </form>

      <div className="mt-4 text-xs text-gray-500">
        <p>Si vous ne recevez pas de code après quelques minutes, vérifiez vos dossiers de spam ou essayez de vous reconnecter.</p>
      </div>
    </div>
  );
};

export default SecurityCodeForm;
