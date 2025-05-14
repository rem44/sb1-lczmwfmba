import React, { useState } from 'react';
import TabNavigation from '../components/TabNavigation';
import ConnectionForm from '../components/ConnectionForm';
import OperationStatus, { StatusStep } from '../components/OperationStatus';
import DocumentStats from '../components/DocumentStats';
import DocumentsTable, { Document } from '../components/DocumentsTable';
import { runPythonScript } from '../utils/pythonIntegration';

const Dashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'downloader' | 'analyzer'>('downloader');
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(10);
  const [error, setError] = useState<string | null>(null);
  const [statusSteps, setStatusSteps] = useState<StatusStep[]>([
    {
      id: '1',
      text: 'Système prêt. En attente de démarrage...',
      status: 'success',
    },
    {
      id: '2',
      text: 'Démarrage du processus de téléchargement SEAO...',
      status: 'waiting',
    },
    {
      id: '3',
      text: 'Connexion avec l\'identifiant:',
      status: 'waiting',
      details: 'shawn.daley@venturecarpets.com',
    },
    {
      id: '4',
      text: 'Connexion réussie au SEAO',
      status: 'waiting',
    }
  ]);

  const [documents, setDocuments] = useState<Document[]>([]);

  const handleStartScraping = async (credentials: { email: string; password: string }) => {
    setError(null);
    setIsLoading(true);
    updateStatus('2', 'loading');
    
    try {
      await runPythonScript(credentials);
      
      updateStatus('2', 'success');
      updateStatus('3', 'loading');
      setProgress(25);
      
      setTimeout(() => {
        updateStatus('3', 'success', `Connexion avec l'identifiant: ${credentials.email}`);
        updateStatus('4', 'success');
        setProgress(50);
        
        setTimeout(() => {
          setIsLoading(false);
          setProgress(100);
        }, 2000);
      }, 1500);
    } catch (err) {
      setIsLoading(false);
      const errorMessage = err instanceof Error ? err.message : 'Une erreur inattendue s\'est produite';
      setError(errorMessage);
      
      statusSteps.forEach((step) => {
        if (step.status === 'loading') {
          updateStatus(step.id, 'error');
        }
      });
    }
  };
  
  const updateStatus = (id: string, status: StatusStep['status'], details?: string) => {
    setStatusSteps(prevSteps => 
      prevSteps.map(step => 
        step.id === id 
          ? { ...step, status, ...(details ? { details } : {}) } 
          : step
      )
    );
  };

  const handleViewDocument = (doc: Document) => {
    console.log('Viewing document:', doc);
  };

  const handleDownloadDocument = (doc: Document) => {
    console.log('Downloading document:', doc);
  };

  const handleDeleteDocument = (doc: Document) => {
    console.log('Deleting document:', doc);
  };

  return (
    <div>
      <TabNavigation 
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
      
      {activeTab === 'downloader' && (
        <div>
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
          
          <ConnectionForm 
            onStartScraping={handleStartScraping}
            isLoading={isLoading}
          />
          
          <OperationStatus 
            steps={statusSteps}
            progress={progress}
          />
          
          <DocumentStats 
            totalTenders={0}
            totalDocuments={0}
            totalSize="0 Mo"
            downloadPath="/telecharges/"
          />
          
          <DocumentsTable 
            documents={documents}
            onViewDocument={handleViewDocument}
            onDownloadDocument={handleDownloadDocument}
            onDeleteDocument={handleDeleteDocument}
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