import React, { useState } from 'react';
import { Download } from 'lucide-react';

interface ConnectionFormProps {
  onStartScraping: (credentials: { email: string; password: string }) => void;
  isLoading?: boolean;
}

const ConnectionForm: React.FC<ConnectionFormProps> = ({ 
  onStartScraping,
  isLoading = false
}) => {
  const [email, setEmail] = useState('shawn.daley@venturecarpets.com');
  const [password, setPassword] = useState('********');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onStartScraping({ email, password });
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6 slide-in-up">
      <h2 className="text-lg font-medium text-gray-900 mb-4">Configuration de la connexion SEAO</h2>
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Identifiant (Email)
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Mot de passe
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
        </div>
        <div>
          <button
            type="submit"
            disabled={isLoading}
            className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-700 hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
              isLoading ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            <Download size={16} className="mr-2" />
            Démarrer le téléchargement
            {isLoading && (
              <span className="ml-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ConnectionForm;