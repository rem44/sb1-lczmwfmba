// src/pages/Dashboard.tsx
import React, { useState } from 'react';
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
  // Authentication related state
  const { login, submitSecurityCode } = useAuth();
  const [activeTab, setActiveTab] = useState<'downloader' | 'analyzer'>('downloader');
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [progress, setProgress] = useState(10);
  const [error, setError] = useState<string | null>(null);
  const [credentials, setCredentials] = useState<{ email: string; password: string } | null>(null);
  const [requiresSecurityCode, setRequiresSecurityCode] = useState(false);
  const [tempSessionId, setTempSessionId] = useState<string | null>(null);
  const [tempJobId, setTempJobId] = useState<string | null>(null);
  
  // Operation status steps
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
      details: 'shawn.daley@venturecarpets.com',
    },
    {
      id: '4',
      text: 'Téléchargement des documents',
      status: 'waiting',
    }
  ]);

  // Documents state
  const [documents, setDocuments] = useState<Document[]>([]);

  // Update status helper function
  const updateStatus = (id: string, status: StatusStep['status'], details?: string) => {
    setStatusSteps(prevSteps => 
      prevSteps.map(step => 
        step.id === id 
          ? { ...step, status, ...(details ? { details } : {}) } 
          : step
      )
    );
  };

  // Handle initial login attempt
  const handleLogin = async (creds: { email: string; password: string }) => {
    setError(null);
    setIsLoading(true);
    updateStatus('2', 'loading');
    
    // Save credentials for later use with scraping
    setCredentials(creds);
    
    try {
      console.log("Attempting to log in with:", creds.email);
      // Use the auth context login function
      const response = await login(creds.email, creds.password);
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
        console.log("Authentication successful");
        updateStatus('2', 'success');
        updateStatus('3', 'success', `Connexion avec l'identifiant: ${creds.email}`);
        setIsConnected(true);
        setProgress(50);
      } else {
        // Authentication failed
        console.error("Authentication failed:", response.message);
        throw new Error(response.message || 'Échec de la connexion');
      }
    } catch (err) {
      console.error("Login error:", err);
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
  
  // Handle security code submission
  const handleSecurityCodeSubmit = async (code: string) => {
    if (!tempSessionId) {
      setError("Session invalide");
      return;
    }
    
    setIsLoading(true);
    updateStatus('3', 'loading', 'Vérification du code de sécurité...');
    
    try {
      console.log("Submitting security code for session:", tempSessionId);
      const response = await submitSecurityCode(code, tempSessionId);
      console.log("Security code response:", response);
      
      if (response.success) {
        console.log("Security code verified successfully");
        setRequiresSecurityCode(false);
        setTempSessionId(null);
        setIsConnected(true);
        updateStatus('3', 'success', `Connexion avec l'identifiant: ${credentials?.email}`);
        setProgress(50);
      } else {
        console.error("Security code verification failed:", response.message);
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
  
  // Handle security code cancellation
  const handleCancelSecurityCode = () => {
    console.log("Security code verification cancelled");
    setRequiresSecurityCode(false);
    setTempSessionId(null);
    setTempJobId(null);
    updateStatus('3', 'waiting');
    updateStatus('2', 'waiting');
  };

  // Handle starting the download process
  const handleStartScraping = async (creds: { email: string; password: string }) => {
    setIsLoading(true);
    updateStatus('4', 'loading');
    setProgress(60);

    try {
      // Use the stored credentials or the ones passed from the form
      const credsToUse = credentials || creds;
      console.log("Starting download with credentials:", credsToUse.email);
      
      // Make the API call to start the download with credentials
      const result = await api.startDownload(credsToUse);
      console.log("Download started:", result);
      
      updateStatus('4', 'success');
      setProgress(100);
    } catch (err) {
      console.error("Download error:", err);
      const errorMessage = err instanceof Error ? err.message : 'Une erreur inattendue s\'est produite';
      setError(errorMessage);
      updateStatus('4', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Test backend connection
  const testBackendConnection = async () => {
    try {
      console.log("Testing backend connection");
      const testUrl = `https://trainwreckontherail-production.up.railway.app/api/health`;
      const response = await fetch(testUrl);
      
      const data = await response.json();
      console.log('Backend connection test:', data);
      alert('Test connection successful. Check console for details.');
    } catch (error) {
      console.error('Backend connection failed:', error);
      alert('Test connection failed. Check console for details.');
    }
  };

  // Document handlers
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

          <div className="mt-4 p-4 bg-gray-100 rounded-lg">
            <h3 className="text-md font-medium text-gray-800 mb-2">Diagnostics</h3>
            <button 
              onClick={testBackendConnection}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
            >
              Test Backend Connection
            </button>
          </div>
        </div>
      )}
      
      {activeTab === 'analyzer' && <PDFAnalyzer />}
    </div>
  );
};

export default Dashboard;
