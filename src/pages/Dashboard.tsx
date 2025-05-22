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
  const [downloadProgress, setDownloadProgress] = useState<{
    current: number;
    total: number;
    completed: number;
  }>({
    current: 0,
    total: 0,
    completed: 0
  });

  // Handle polling for download status with enhanced API
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (taskId && isLoading) {
      interval = setInterval(async () => {
        try {
          // Utiliser la nouvelle API de statut
          const status = await api.checkDownloadStatusEnhanced(taskId);
          
          console.log("Download status check:", status);
          
          if (status.success) {
            if (status.status === 'ready') {
              // Le téléchargement est terminé ou la session est prête
              setIsLoading(false);
              setProgress(100);
              updateStatus('4', 'success');
              
              // Essayer de récupérer l'historique pour les statistiques
              try {
                const history = await api.getDownloadHistory();
                if (history.success && history.historique.length > 0) {
                  const latestDownload = history.historique[0];
                  setDocumentStats({
                    totalTenders: latestDownload.appels_offres || 0,
                    totalDocuments: latestDownload.total_files || 0,
                    totalSize: `${(latestDownload.total_files * 2.5).toFixed(2)} Mo`, // Estimation
                    downloadPath: latestDownload.path || '/telecharges/'
                  });
                }
              } catch (historyError) {
                console.log("Could not fetch download history:", historyError);
              }
            } else if (status.status === 'error' || status.status === 'disconnected') {
              setIsLoading(false);
              setError(status.message || 'Erreur de téléchargement');
              updateStatus('4', 'error');
            }
          } else {
            setIsLoading(false);
            setError(status.message || 'Erreur de statut du téléchargement');
            updateStatus('4', 'error');
          }
          
        } catch (err) {
          console.error("Status polling error:", err);
          setIsLoading(false);
          const errorMessage = err instanceof Error ? err.message : 'Erreur de suivi du téléchargement';
          setError(errorMessage);
          updateStatus('4', 'error');
        }
      }, 3000); // Vérifier toutes les 3 secondes
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
      
      // Important: Vérifier clairement si un code de sécurité est requis
      console.log("Response requires security code check:", {
        requiresSecurityCode: response.requiresSecurityCode,
        requires_security_code: response.requires_security_code,
        auth_result: response.auth_result
      });
      
      // *** PARTIE IMPORTANTE - VÉRIFIER SI UN CODE DE SÉCURITÉ EST REQUIS ***
      if (
        response.requiresSecurityCode === true || 
        response.requires_security_code === true ||
        (response.auth_result && response.auth_result.requires_security_code === true)
      ) {
        // Un code de sécurité est nécessaire
        // Rechercher le session ID dans tous les formats possibles de réponse
        const sessionId = response.sessionId || response.session_id || 
                         (response.auth_result && response.auth_result.session_id) || null;
        const jobId = response.jobId || response.job_id || 
                     (response.auth_result && response.auth_result.job_id) || null;
        
        if (!sessionId) {
          throw new Error("Session ID manquant dans la réponse d'authentification");
        }
        
        console.log("Security code required, session ID:", sessionId, "Job ID:", jobId);
        setRequiresSecurityCode(true);
        setTempSessionId(sessionId);
        setTempJobId(jobId);
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
      
      // Mettre à jour le statut des étapes en erreur
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
      console.log("Submitting security code for session:", tempSessionId, "Job ID:", tempJobId);
      
      // Nettoyer le code (supprimer espaces et caractères non-numériques)
      const cleanCode = code.replace(/\D/g, '');
      console.log(`Using cleaned security code: ${cleanCode.substring(0, 1)}${'*'.repeat(cleanCode.length - 1)}`);
      
      const response = await submitSecurityCode(cleanCode, tempSessionId, tempJobId || undefined);
      console.log("Security code response:", response);
      
      if (response.success) {
        setRequiresSecurityCode(false);
        setTempSessionId(null);
        setTempJobId(null);
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

  const handleStartScraping = async () => {
    setIsLoading(true);
    updateStatus('4', 'loading');
    setProgress(60);
    setError(null);

    try {
      // Récupérer l'ID de session depuis l'authentification
      const currentSessionId = localStorage.getItem('auth_session_id');
      
      if (!currentSessionId) {
        throw new Error("Aucune session active trouvée. Veuillez vous reconnecter.");
      }
      
      console.log("Starting enhanced download with session:", currentSessionId);
      
      // Utiliser la nouvelle API de téléchargement optimisée
      const result = await api.startDownloadEnhanced(currentSessionId, {
        statut: 'actifs',  // ou 'tous', 'clos'
        limit: 10          // nombre d'appels d'offres à traiter
      });
      
      console.log("Enhanced download started:", result);
      
      if (result.success) {
        // Démarrer le polling du statut
        setTaskId(currentSessionId); // Utiliser le session_id pour le polling
        
        // Mettre à jour les statistiques si disponibles
        if (result.stats) {
          setDocumentStats({
            totalTenders: result.stats.total_processed || 0,
            totalDocuments: result.stats.total_documents || 0,
            totalSize: result.stats.total_size 
              ? `${(result.stats.total_size / (1024 * 1024)).toFixed(2)} Mo` 
              : '0 Mo',
            downloadPath: result.stats.download_dir || '/telecharges/'
          });
          
          // Créer des documents factices pour l'affichage si des documents ont été téléchargés
          if (result.stats.total_documents > 0) {
            const mockDocuments: Document[] = [];
            for (let i = 0; i < Math.min(result.stats.total_documents, 10); i++) {
              mockDocuments.push({
                id: `doc-${i}`,
                tenderName: `Appel d'offre ${i + 1}`,
                fileName: `Document_${i + 1}.pdf`,
                date: new Date().toLocaleDateString('fr-FR'),
                size: `${(Math.random() * 5 + 1).toFixed(2)} Mo`
              });
            }
            setDocuments(mockDocuments);
          }
        }
        
        // Finaliser le statut si le téléchargement est déjà terminé
        if (result.stats && result.stats.total_documents > 0) {
          setIsLoading(false);
          updateStatus('4', 'success');
          setProgress(100);
        }
      } else {
        throw new Error(result.message || 'Échec du démarrage du téléchargement');
      }
      
    } catch (err) {
      console.error("Enhanced download error:", err);
      setIsLoading(false);
      const errorMessage = err instanceof Error ? err.message : 'Une erreur inattendue s\'est produite';
      setError(errorMessage);
      updateStatus('4', 'error');
    }
  };

  const handleStopDownload = async () => {
    const currentSessionId = localStorage.getItem('auth_session_id');
    
    if (!currentSessionId) {
      setError("Aucune session active trouvée");
      return;
    }
    
    try {
      console.log("Stopping download for session:", currentSessionId);
      const result = await api.stopDownload(currentSessionId);
      if (result.success) {
        setIsLoading(false);
        setTaskId(null);
        setError("Téléchargement arrêté par l'utilisateur");
        updateStatus('4', 'error');
        setProgress(0);
      } else {
        setError(result.message || "Impossible d'arrêter le téléchargement");
      }
    } catch (err) {
      console.error("Stop download error:", err);
      setError("Erreur lors de l'arrêt du téléchargement");
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

  const testDownloadHistory = async () => {
    try {
      setError(null);
      console.log("Testing download history...");
      
      const result = await api.getDownloadHistory();
      console.log("Download history result:", result);
      
      if (result.success) {
        alert(`History retrieved! Found ${result.historique.length} download sessions.`);
      } else {
        alert(`History failed: ${result.message}`);
      }
    } catch (error) {
      console.error('Download history test failed:', error);
      setError(error instanceof Error ? error.message : 'History test failed');
    }
  };

  const handleViewDocument = (doc: Document) => {
    console.log('Viewing document:', doc);
    alert(`Viewing document: ${doc.fileName}`);
    // Implementation would depend on how documents are stored/accessed
  };

  const handleDownloadDocument = (doc: Document) => {
    console.log('Downloading document:', doc);
    alert(`Downloading document: ${doc.fileName}`);
    // Implementation would depend on how documents are stored/accessed
  };

  const handleDeleteDocument = (doc: Document) => {
    console.log('Deleting document:', doc);
    // Request confirmation
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer le document "${doc.fileName}" ?`)) {
      // Remove from the local state
      setDocuments(prevDocuments => prevDocuments.filter(d => d.id !== doc.id));
      
      // Update stats
      setDocumentStats(prev => ({
        ...prev,
        totalDocuments: Math.max(0, prev.totalDocuments - 1)
      }));
    }
  };

  const handleDownloadAll = () => {
    if (downloadId) {
      window.location.href = api.getDownloadUrl(downloadId);
    } else {
      alert("Aucun téléchargement disponible pour le moment");
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
              sessionId={tempSessionId || ''}
            />
          ) : (
            <div className="bg-white rounded-lg shadow p-6 mb-6 slide-in-up">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Configuration de la connexion SEAO</h2>
              <ConnectionForm 
                onLogin={handleLogin}
                onStartScraping={handleStartScraping}
                isLoading={isLoading}
                isConnected={isConnected}
              />
              
              {/* Bouton d'arrêt du téléchargement */}
              {isLoading && taskId && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <button
                    onClick={handleStopDownload}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    ⏹️ Arrêter le téléchargement
                  </button>
                  <p className="mt-2 text-sm text-gray-500">
                    Le téléchargement est en cours... Cliquez pour l'arrêter.
                  </p>
                </div>
              )}
            </div>
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
                {documents.length > 0 && (
                  <button
                    onClick={handleDownloadAll}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    📥 Télécharger tous les documents
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
            <div className="space-y-3">
              <div className="flex flex-wrap gap-3">
                <button 
                  onClick={testBackendConnection}
                  className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                >
                  Test Backend Connection
                </button>
                
                <button 
                  onClick={testDownloadHistory}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Test Download History
                </button>
                
                {/* Test button for security code form - visible in development mode */}
                <button 
                  onClick={testSecurityCodeForm}
                  className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
                >
                  Test Security Code Form
                </button>
              </div>
              
              <div className="text-xs text-gray-500 space-y-1">
                <p>Backend Connection: Vérifie la connexion au serveur via /api/health</p>
                <p>Download History: Teste la récupération de l'historique des téléchargements</p>
                <p>URL utilisée: {import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}</p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {activeTab === 'analyzer' && <PDFAnalyzer />}
    </div>
  );
};

export default Dashboard;
