// src/components/SecurityCodeForm.tsx
import React, { useState, useEffect } from 'react';
import { Mail } from 'lucide-react';

interface SecurityCodeFormProps {
  onSubmit: (code: string) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const SecurityCodeForm: React.FC<SecurityCodeFormProps> = ({
  onSubmit,
  onCancel,
  isLoading = false
}) => {
  const [code, setCode] = useState('');
  const inputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length === 6) {
      onSubmit(code);
    }
  };

  return (
    <div className="bg-white border border-blue-200 rounded-lg p-6 mb-6 max-w-md mx-auto shadow-md">
      <div className="bg-blue-50 p-4 rounded-md mb-6">
        <div className="flex items-center">
          <Mail className="text-blue-600 mr-2 h-5 w-5" />
          <p className="text-blue-700 text-sm">
            Un code de sécurité a été envoyé à votre adresse email. Vérifiez votre boîte de réception.
          </p>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex items-center mb-2">
          <div className="bg-blue-100 rounded-full p-2 mr-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-medium text-blue-900">Code de sécurité requis</h3>
            <p className="text-sm text-gray-600">
              Saisissez le code à 6 chiffres reçu par email
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="securityCode" className="block text-sm font-medium text-gray-700 mb-2">
            Code de sécurité à 6 chiffres
          </label>
          <input
            ref={inputRef}
            id="securityCode"
            type="text"
            value={code}
            onChange={(e) => {
              // Allow only digits and limit to 6 characters
              const cleanValue = e.target.value.replace(/\D/g, '').slice(0, 6);
              setCode(cleanValue);
            }}
            className="block w-full px-4 py-3 text-center bg-blue-50 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition-all text-lg tracking-wider"
            maxLength={6}
            pattern="[0-9]*"
            inputMode="numeric"
            autoComplete="one-time-code"
            placeholder="Entrez le code à 6 chiffres"
          />
          {code.length > 0 && code.length < 6 && (
            <p className="text-sm text-amber-600 mt-1">Veuillez saisir tous les 6 chiffres</p>
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
            disabled={isLoading || code.length !== 6}
            className="px-6 py-2 border border-transparent rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Vérification...' : 'Valider'}
          </button>
        </div>
      </form>

      <div className="mt-6 pt-4 border-t border-gray-200 text-sm text-gray-600">
        <p>
          Si vous n'avez pas reçu le code, vérifiez votre dossier de courrier indésirable ou contactez le support SEAO.
        </p>
        <p className="mt-2 text-xs text-gray-500">
          Pour le mode test, utilisez le code: 123456
        </p>
      </div>
    </div>
  );
};

export default SecurityCodeForm;
