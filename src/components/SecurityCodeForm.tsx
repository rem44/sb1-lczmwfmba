import React, { useState, useEffect } from 'react';
import { KeyRound, Mail, AlertCircle, X } from 'lucide-react';

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
  const [isFocused, setIsFocused] = useState(false);
  const [showEmailInfo, setShowEmailInfo] = useState(true);
  const inputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }

    const timer = setTimeout(() => {
      setShowEmailInfo(false);
    }, 10000);

    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length === 6) {
      onSubmit(code);
    }
  };

  const formatCodeDisplay = (code: string) => {
    if (code.length <= 3) return code;
    return `${code.substring(0, 3)} ${code.substring(3)}`;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />

        <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
          <div className="absolute top-0 right-0 pt-4 pr-4">
            <button
              type="button"
              onClick={onCancel}
              className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <span className="sr-only">Fermer</span>
              <X className="h-6 w-6" />
            </button>
          </div>

          {showEmailInfo && (
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
              <div className="flex">
                <Mail className="h-6 w-6 text-blue-600" />
                <div className="ml-3">
                  <p className="text-sm text-blue-700">
                    Un code de sécurité a été envoyé à votre adresse email.
                  </p>
                  <p className="text-xs text-blue-600 mt-1">
                    Veuillez vérifier votre boîte de réception et vos spams.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center mb-6">
            <div className="bg-blue-100 rounded-full p-2 mr-3">
              <KeyRound className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900">Code de sécurité requis</h3>
              <p className="text-sm text-gray-600">
                Saisissez le code à 6 chiffres reçu par email
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <div className="relative">
                <input
                  ref={inputRef}
                  type="text"
                  value={formatCodeDisplay(code)}
                  onChange={(e) => {
                    const cleanValue = e.target.value.replace(/\D/g, '').slice(0, 6);
                    setCode(cleanValue);
                  }}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  className={`block w-full px-4 py-3 text-center tracking-wider text-2xl border ${
                    isFocused ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-300'
                  } rounded-md focus:outline-none transition-all bg-gray-50`}
                  maxLength={7}
                  pattern="[0-9]*"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  required
                  placeholder="• • • • • •"
                />
                {code.length > 0 && code.length < 6 && (
                  <div className="absolute -bottom-6 left-0 flex items-center text-amber-600 text-xs">
                    <AlertCircle size={12} className="mr-1" />
                    Veuillez saisir les {6 - code.length} chiffres restants
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end mt-8 space-x-3">
                <button
                  type="button"
                  onClick={onCancel}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isLoading || code.length !== 6}
                  className={`inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${
                    code.length === 6 ? 'animate-pulse' : ''
                  }`}
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Vérification...
                    </>
                  ) : (
                    'Valider'
                  )}
                </button>
              </div>
            </div>
          </form>

          <div className="mt-6 border-t border-gray-200 pt-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <div className="ml-3 text-sm text-gray-500">
                <p>
                  Si vous n'avez pas reçu le code, vérifiez votre dossier de courrier indésirable ou
                  contactez le support SEAO.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecurityCodeForm;