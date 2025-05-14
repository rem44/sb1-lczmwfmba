import React, { useState, useEffect } from 'react';
import ConnectionForm from '../components/ConnectionForm';
import DownloadManager from '../components/DownloadManager';
import { api } from '../services/api';

const Dashboard: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    checkAuthentication();
  }, []);

  const checkAuthentication = async () => {
    const isValid = await api.checkSession();
    setIsAuthenticated(isValid);
    setIsCheckingAuth(false);
  };

  const handleLoginSuccess = (token: string) => {
    localStorage.setItem('seao_token', token);
    setIsAuthenticated(true);
  };

  if (isCheckingAuth) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {!isAuthenticated ? (
        <ConnectionForm onLoginSuccess={handleLoginSuccess} />
      ) : (
        <div className="space-y-6">
          <div className="bg-green-50 border-l-4 border-green-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-green-700">
                  Connecté au SEAO
                </p>
              </div>
            </div>
          </div>

          <DownloadManager />
        </div>
      )}
    </div>
  );
};

export default Dashboard;