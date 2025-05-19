// src/pages/Dashboard.tsx
import React, { useState, useEffect } from 'react';
import TabNavigation from '../components/TabNavigation';
import ConnectionForm from '../components/ConnectionForm';
import SecurityCodeForm from '../components/SecurityCodeForm';
import OperationStatus, { StatusStep } from '../components/OperationStatus';
import DocumentStats from '../components/DocumentStats';
import DocumentsTable, { Document } from '../components/DocumentsTable';
import PDFAnalyzer from '../components/PDFAnalyzer';
import { api } from '../services/api';
import { useAuth } from '../utils/AuthContext';

const Dashboard: React.FC = () => {
  const { login, submitSecurityCode } = useAuth();
  const [activeTab, setActiveTab] = useState<'downloader' | 'analyzer'>('downloader');
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [progress, setProgress] = useState(10);
  const [error, setError] = useState<string | null>(null);
  const [credentials, setCredentials] = useState<{ username: string; password: string } | null>(null);
  const [requiresSecurityCode, setRequiresSecurityCode] = useState(false);
  const [tempSessionId, setTempSessionId] = useState<string | null>(null);
  const [tempJobId, setTempJobId] = useState<string | null>(null);
  const [statusSteps, setStatusSteps] = useState<StatusStep[]>([
    {
      id: '1',
      text: 'Système prêt. En attente de connexion...',
      status: 'success',
    },
    {
      id: '2',
      text: 'Connexion au SEAO...',
      status: 'waiting',
    },
    {
      id: '3',
      text: 'Authentification avec l\'identifiant:',
      status: 'waiting',
      details: '',
    },
    {
      id: '4',
      text: 'Téléchargement des documents',
      status: 'waiting',
    }
  ]);
  const [taskId, setTaskId] = useState<string | null>(null);
  const [downloadId, setDownloadId] = useState<string | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [documentStats, setDocumentStats] = useState({
    totalTenders: 0,
    totalDocuments: 0,
    totalSize: '0 Mo',
    downloadPath: '/telecharges/'
  });

  // Handle polling for download status
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (taskId && isLoading) {
      interval = setInterval(async () => {
        try {
          const status = await api.checkDownloadStatus(taskId);
          
          // Update progress based on status
          if (typeof status.progress === 'number') {
            setProgress(status.progress);
          }
          
          if (status.status === 'completed') {
            setIsLoading(false);
            
            // Update document stats if available
            if (status.download_info) {
              setDocumentStats({
                totalTenders: status.download_info.appels_count || 0,
                totalDocuments: status.download_info.file_count || 0,
                totalSize: status.download_info.total_size 
                  ? `${(status.download_info.total_size / (1024 * 1024)).toFixed(2)} Mo` 
                  : '0 Mo',
                downloadPath: status.download_info.execution_dir || '/telecharges/'
              });
            }
            
            // Set the download ID for retrieval
            if (status.download_id) {
              setDownloadId(status.download_id);
              
              // Try to fetch document list
              try {
                if (status.download_info?.documents) {
                  const docs = status.download_info.documents.map((doc: any, index: number) => ({
                    id: `doc-${index}`,
                    tenderName: doc.appel || 'Appel d\'offre',
                    fileName: doc.fichier || `Document ${index+1}`,
                    date: doc.date || new Date().toLocaleDateString('fr-FR'),
                    size: '---'
                  }));
                  setDocuments(docs);
                }
              } catch (docError) {
                console.error('Error parsing document list:', docError);
              }
            }
            
            updateStatus('4', 'success');
          } else if (status.status === 'failed') {
            setIsLoading(false);
            setError(status.message || 'Échec du téléchargement');
            updateStatus('4', 'error');
          }
        } catch (err) {
          console.error("Status polling error:", err);
          setIsLoading(false);
          const errorMessage = err instanceof Error ? err.message : 'Erreur de suivi du téléchargement';
          setError(errorMessage);
          updateStatus('4', 'error');
        }
      }, 2000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [taskId, isLoading]);

  const handleLogin = async (creds: { username: string; password: string }) => {
    setError(null);
    setIsLoading(true);
    updateStatus('2', 'loading');
    updateStatus('3', 'waiting', `Authentification avec l'identifiant: ${creds.username}`);
    
    // Save credentials for later use with scraping
    setCredentials(creds);
    
    try {
      console.log("Attempting login with:", creds.username);
      // Use the auth context login function
      const response = await login(creds.username, creds.password);
      console.log("Login response:", response);
      
      if (response.requiresSecurityCode) {
        // Security code is required
        console.log("Security code required, session ID:", response.sessionId);
        setRequiresSecurityCode(true);
        setTempSessionId(response.sessionId);
        setTempJobId(response.jobId);
        updateStatus('2', 'success');
        updateStatus('3', 'waiting', 'Attente du code de sécurité...');
      } else if (response.success) {
        // Authentication successful
        console.log("Login successful");
        updateStatus('2', 'success');
        updateStatus('3', 'success', `Connexion avec l'identifiant: ${creds.username}`);
        setIsConnected(true);
        setProgress(50);
      } else {
        // Authentication failed
        console.log("Login failed:", response.message);
        throw new Error(response.message || 'Échec de la connexion');
      }
    } catch (err) {
      console.error("Login error:", err);
      setIsLoading(false);
      const errorMessage = err instanceof Error ? err.message : 'Une erreur inattendue s\'est produite';
      setError(errorMessage);
      
      statusSteps.forEach((step) => {
        if (step.status === 'loading') {
          updateStatus(step.id, 'error');
        }
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSecurityCodeSubmit = async (code: string) => {
    if (!tempSessionId) {
      setError("Session invalide");
      return;
    }
    
    setIsLoading(true);
    updateStatus('3', 'loading', 'Vérification du code de sécurité...');
    
    try {
      console.log("Submitting security code for session:", tempSessionId);
      const response = await submitSecurityCode(code, tempSessionId, tempJobId || undefined);
      console.log("Security code response:", response);
      
      if (response.success) {
        setRequiresSecurityCode(false);
        setTempSessionId(null);
        setIsConnected(true);
        updateStatus('3', 'success', `Connexion avec l'identifiant: ${credentials?.username}`);
        setProgress(50);
      } else {
        throw new Error(response.message || 'Code de sécurité invalide');
      }
    } catch (err) {
      console.error("Security code error:", err);
      const errorMessage = err instanceof Error ? err.message : 'Erreur de vérification du code';
      setError(errorMessage);
      updateStatus('3', 'error', 'Échec de la vérification du code');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleCancelSecurityCode = () => {
    setRequiresSecurityCode(false);
    setTempSessionId(null);
    setTempJobId(null);
    updateStatus('3', 'waiting');
    updateStatus('2', 'waiting');
  };

  const handleStartScraping = async (creds: { username: string; password: string }) => {
    setIsLoading(true);
    updateStatus('4', 'loading');
    setProgress(60);
    setError(null);

    try {
      // Use the stored credentials or the ones passed from the form
      const credsToUse = credentials || creds;
      
      // Make the API call to start the download with credentials
      console.log("Starting download with credentials:", credsToUse.username);
      const result = await api.startDownload(credsToUse);
      
      console.log("Download started:", result);
      
      // Store the task ID for status polling
      if (result.task_id) {
        setTaskId(result.task_id);
      } else {
        throw new Error('No task ID returned from server');
      }
      
    } catch (err) {
      console.error("Download error:", err);
      setIsLoading(false);
      const errorMessage = err instanceof Error ? err.message : 'Une erreur inattendue s\'est produite';
      setError(errorMessage);
      updateStatus('4', 'error');
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

  const testBackendConnection = async () => {
    try {
      setError(null);
      console.log("Testing backend connection...");
      
      // Extract the base URL from the environment variable
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
      // Remove any trailing /api to avoid duplication
      const baseUrl = apiBaseUrl.replace(/\/api$/, '');
      
      // Test the health endpoint
      const testUrl = `${baseUrl}/api/health`;
      console.log("Testing connection to:", testUrl);
      
      const response = await fetch(testUrl);
      
      if (!response.ok) {
        throw new Error(`Server returned status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Backend connection test:', data);
      
      alert(`Connection successful! Server status: ${data.status || 'OK'}`);
    } catch (error) {
      console.error('Backend connection failed:', error);
      setError(error instanceof Error ? error.message : 'Connection test failed');
      alert('Connection test failed. Check console for details.');
    }
  };

  const handleViewDocument = (doc: Document) => {
    console.log('Viewing document:', doc);
    // Implementation would depend on how documents are stored/accessed
  };

  const handleDownloadDocument = (doc: Document) => {
    console.log('Downloading document:', doc);
    // Implementation would depend on how documents are stored/accessed
  };

  const handleDeleteDocument = (doc: Document) => {
    console.log('Deleting document:', doc);
    // Request confirmation
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer le document "${doc.fileName}" ?`)) {
      // Remove from the local state
      setDocuments(prevDocuments => prevDocuments.filter(d => d.id !== doc.id));
      // In a real app, you'd also call an API to delete the document
    }
  };

  const handleDownloadAll = () => {
    if (downloadId) {
      window.location.href = api.getDownloadUrl(downloadId);
    }
  };

  // For development testing only
  const testSecurityCodeForm = () => {
    setRequiresSecurityCode(true);
    setTempSessionId("test-session-id");
    setTempJobId("test-job-id");
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
          
          {/* Main Form Area - Show either security code form or connection form */}
          {requiresSecurityCode ? (
            <SecurityCodeForm 
              onSubmit={handleSecurityCodeSubmit}
              onCancel={handleCancelSecurityCode}
              isLoading={isLoading}
            />
          ) : (
            <ConnectionForm 
              onLogin={handleLogin}
              onStartScraping={handleStartScraping}
              isLoading={isLoading}
              isConnected={isConnected}
            />
          )}
          
          <OperationStatus 
            steps={statusSteps}
            progress={progress}
          />
          
          <DocumentStats 
            totalTenders={documentStats.totalTenders}
            totalDocuments={documentStats.totalDocuments}
            totalSize={documentStats.totalSize}
            downloadPath={documentStats.downloadPath}
          />
          
          {documents.length > 0 && (
            <div className="mb-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-md font-medium text-gray-900">Documents disponibles</h3>
                {downloadId && (
                  <button
                    onClick={handleDownloadAll}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    Télécharger tous les documents
                  </button>
                )}
              </div>
              <DocumentsTable 
                documents={documents}
                onViewDocument={handleViewDocument}
                onDownloadDocument={handleDownloadDocument}
                onDeleteDocument={handleDeleteDocument}
              />
            </div>
          )}

          <div className="mt-8 p-4 bg-gray-100 rounded-lg">
            <h3 className="text-md font-medium text-gray-800 mb-2">Diagnostics</h3>
            <button 
              onClick={testBackendConnection}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
            >
              Test Backend Connection
            </button>
            
            {/* Test button for security code form - visible in development mode */}
            <button 
              onClick={testSecurityCodeForm}
              className="ml-3 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
            >
              Test Security Code Form
            </button>
            
            <p className="mt-2 text-xs text-gray-500">
              Cette fonction vérifie la connexion au backend en envoyant une requête au point de terminaison /api/health.
            </p>
            <p className="mt-2 text-xs text-gray-600">
              Utilisant l'URL: {import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}
            </p>
          </div>
        </div>
      )}
      
      {activeTab === 'analyzer' && <PDFAnalyzer />}
    </div>
  );
};

export default Dashboard;
