// src/components/SecurityCodeForm.tsx
import React, { useState, useEffect } from 'react';
import { Mail } from 'lucide-react';

interface SecurityCodeFormProps {
  onSubmit: (code: string) => void;
  onCancel: () => void;
  isLoading?: boolean;
  sessionId?: string;
}

const SecurityCodeForm: React.FC<SecurityCodeFormProps> = ({
  onSubmit,
  onCancel,
  isLoading = false,
  sessionId = ''
}) => {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Format code while typing to include only digits
  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Keep only digits
    const cleanCode = e.target.value.replace(/\D/g, '');
    setCode(cleanCode);

    // Clear any previous errors if user is typing again
    if (error) {
      setError('');
    }
  };

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
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
    
    onSubmit(cleanCode);
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
            <p className="mt-2 text-sm text-red-600">{error}</p>
          )}
          {isLoading && (
            <p className="text-sm text-blue-600 mt-1">Vérification en cours...</p>
          )}
        </div>

        <div className="flex justify-between pt-2">
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
      </form>
    </div>
  );
};

export default SecurityCodeForm;
