import React, { useEffect, useState } from 'react';
import TabNavigation from '../components/TabNavigation';
import ConnectionForm from '../components/ConnectionForm';
import SecurityCodeForm from '../components/SecurityCodeForm';
import OperationStatus, { StatusStep } from '../components/OperationStatus';
import DocumentStats from '../components/DocumentStats';
import DocumentsTable, { Document } from '../components/DocumentsTable';
import DownloadManager from '../components/DownloadManager';
import { useAuthStore } from '../store/authStore';
import { api } from '../services/api';

const Dashboard: React.FC = () => {
  const { 
    isAuthenticated, 
    isLoading, 
    error, 
    requiresSecurityCode,
    login,
    submitSecurityCode,
    checkSession
  } = useAuthStore();

  const [activeTab, setActiveTab] = useState<'downloader' | 'analyzer'>('downloader');
  const [progress, setProgress] = useState(0);
  const [statusSteps, setStatusSteps] = useState<StatusStep[]>([
    {
      id: '1',
      text: 'Vérification du serveur...',
      status: 'loading',
    }
  ]);

  useEffect(() => {
    const checkServerAndSession = async () => {
      try {
        await api.checkSession();
        updateStatus('1', 'success', 'Connexion au serveur établie');
      } catch {
        updateStatus('1', 'error', 'Le serveur n\'est pas accessible');
      }
    };

    checkServerAndSession();
    checkSession();
  }, []);

  const updateStatus = (id: string, status: StatusStep['status'], details?: string) => {
    setStatusSteps(prevSteps => 
      prevSteps.map(step => 
        step.id === id 
          ? { ...step, status, ...(details ? { details } : {}) } 
          : step
      )
    );
  };

  const handleLogin = async (credentials: { email: string; password: string }) => {
    updateStatus('2', 'loading', 'Tentative de connexion...');
    await login(credentials.email, credentials.password);
  };

  const handleSecurityCode = async (code: string) => {
    updateStatus('3', 'loading', 'Vérification du code...');
    await submitSecurityCode(code);
  };

  const handleDownloadComplete = (downloadId: string) => {
    console.log('Téléchargement terminé:', downloadId);
    setProgress(100);
  };

  return (
    <div>
      <TabNavigation 
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
      
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}
      
      {activeTab === 'downloader' && (
        <div>
          {!isAuthenticated ? (
            requiresSecurityCode ? (
              <SecurityCodeForm
                onSubmit={handleSecurityCode}
                onCancel={() => useAuthStore.getState().logout()}
                isLoading={isLoading}
              />
            ) : (
              <ConnectionForm 
                onLogin={handleLogin}
                isLoading={isLoading}
              />
            )
          ) : (
            <>
              <DownloadManager onDownloadComplete={handleDownloadComplete} />
              <DocumentStats 
                totalTenders={0}
                totalDocuments={0}
                totalSize="0 Mo"
                downloadPath="/telecharges/"
              />
            </>
          )}
          
          <OperationStatus 
            steps={statusSteps}
            progress={progress}
          />
        </div>
      )}
      
      {activeTab === 'analyzer' && (
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600">
            Cette fonctionnalité sera disponible prochainement. Elle permettra d'analyser les
            documents téléchargés à l'aide de l'API OpenAI pour extraire des informations
            stratégiques.
          </p>
        </div>
      )}
    </div>
  );
};

export default Dashboard;