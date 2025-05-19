// src/components/SecurityCodeForm.tsx
import React, { useState, useEffect } from 'react';
import { KeyRound } from 'lucide-react';

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
  // Add focus management to improve user experience
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Auto-focus the input field when the component mounts
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

  // Format the code input to improve readability
  const formatCodeDisplay = (code: string) => {
    if (code.length <= 3) return code;
    return `${code.substring(0, 3)} ${code.substring(3)}`;
  };

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 my-4 animate-fadeIn">
      <div className="flex items-center mb-4">
        <div className="bg-blue-100 rounded-full p-2 mr-3">
          <KeyRound className="h-6 w-6 text-blue-600" />
        </div>
        <div>
          <h3 className="text-lg font-medium text-blue-900">Code de sécurité requis</h3>
          <p className="text-sm text-blue-600">
            Veuillez entrer le code reçu par courriel
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="securityCode" className="block text-sm font-medium text-blue-700 mb-2">
            Code de sécurité à 6 chiffres
          </label>
          
          <input
            ref={inputRef}
            id="securityCode"
            type="text"
            value={formatCodeDisplay(code)}
            onChange={(e) => {
              // Allow only digits and limit to 6 characters
              const cleanValue = e.target.value.replace(/\D/g, '').slice(0, 6);
              setCode(cleanValue);
            }}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className={`block w-full px-4 py-3 text-center tracking-wider text-lg border ${
              isFocused ? 'border-blue-500 ring-2 ring-blue-200' : 'border-blue-300'
            } rounded-md focus:outline-none transition-all`}
            maxLength={7} // Allow for space in the formatted display
            pattern="[0-9]*"
            inputMode="numeric"
            autoComplete="one-time-code"
            required
            placeholder="123456"
          />
        </div>

        <div className="flex space-x-3">
          <button
            type="submit"
            disabled={isLoading || code.length !== 6}
            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Vérification...
              </span>
            ) : (
              'Valider'
            )}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            Annuler
          </button>
        </div>
      </form>

      <div className="mt-4 text-sm text-gray-500">
        <p>
          Si vous n'avez pas reçu le code, vérifiez votre dossier de courrier indésirable ou
          contactez le support SEAO.
        </p>
      </div>
    </div>
  );
};

export default SecurityCodeForm;
