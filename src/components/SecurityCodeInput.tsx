import React, { useState } from 'react';
import { KeyRound, ArrowRight } from 'lucide-react';

interface SecurityCodeInputProps {
  onSubmit: (code: string) => void;
  onCancel?: () => void;
  isLoading?: boolean;
  demoMode?: boolean;
}

const SecurityCodeInput: React.FC<SecurityCodeInputProps> = ({
  onSubmit,
  onCancel,
  isLoading = false,
  demoMode = false
}) => {
  const [code, setCode] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(code);
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
            {demoMode 
              ? "Mode démo: Entrez n'importe quel code à 4 chiffres ou plus"
              : "Veuillez entrer le code reçu par courriel"}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Entrez le code à 6 chiffres"
            className="block w-full px-4 py-3 border border-blue-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            maxLength={6}
            pattern="[0-9]*"
            inputMode="numeric"
            autoComplete="one-time-code"
            required
          />
          {demoMode && (
            <p className="mt-2 text-xs text-amber-600">
              En mode démo, tout code avec au moins 4 chiffres sera accepté.
            </p>
          )}
        </div>

        <div className="flex space-x-3">
          <button
            type="submit"
            disabled={isLoading || code.length < 4}
            className="flex-1 inline-flex items-center justify-center bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Vérification...
              </span>
            ) : (
              <>
                Valider <ArrowRight size={16} className="ml-1" />
              </>
            )}
          </button>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Annuler
            </button>
          )}
        </div>
      </form>

      {demoMode && (
        <div className="mt-4 text-sm text-gray-500">
          <p>
            En mode démo, aucun email contenant un code de vérification n'est envoyé.
            Cette interface simule ce que vous verriez dans un environnement réel.
          </p>
        </div>
      )}
    </div>
  );
};

export default SecurityCodeInput;
