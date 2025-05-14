// src/components/Dashboard.tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../utils/AuthContext';
import API from '../services/api';

const Dashboard: React.FC = () => {
  const { isAuthenticated, sessionId } = useAuth();
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [downloadTask, setDownloadTask] = useState<string | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [downloadId, setDownloadId] = useState<string | null>(null);
  const [error, setError] = useState<string>('');
  
  // Vérifier l'état du téléchargement en cours
  useEffect(() => {
    let intervalId: number;
    
    if (downloadTask && isDownloading) {
      intervalId = window.setInterval(async () => {
        try {
          const response = await API.checkDownloadStatus(downloadTask);
          
          if (response.success && response.task) {
            const task = response.task;
            
            setProgress(task.progress || 0);
            setStatusMessage(task.message || '');
            
            // Si terminé
            if (task.status === 'completed' && task.result?.download_id) {
              setIsDownloading(false);
              setDownloadId(task.result.download_id);
            }
            
            // Si échec
            if (task.status === 'failed') {
              setIsDownloading(false);
              setError(task.message || 'Échec du téléchargement');
            }
          }
        } catch (error) {
          if (error instanceof Error) {
            setError(error.message);
          } else {
            setError('Une erreur inconnue est survenue');
          }
          setIsDownloading(false);
        }
      }, 2000); // Vérifier toutes les 2 secondes
    }
    
    return () => {
      if (intervalId) window.clearInterval(intervalId);
    };
  }, [downloadTask, isDownloading]);
  
  const startDownload = async () => {
    if (!sessionId) return;
    
    try {
      setIsDownloading(true);
      setProgress(0);
      setStatusMessage('Préparation du téléchargement...');
      setError('');
      setDownloadId(null);
      
      const response = await API.startDownload(sessionId);
      
      if (response.success && response.task_id) {
        setDownloadTask(response.task_id);
      } else {
        setError(response.message || 'Erreur lors du démarrage du téléchargement');
        setIsDownloading(false);
      }
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Une erreur inconnue est survenue');
      }
      setIsDownloading(false);
    }
  };
  
  const downloadFiles = () => {
    if (downloadId) {
      window.location.href = API.getDownloadUrl(downloadId);
    }
  };
  
  return (
    <div className="dashboard-container">
      <h1>Tableau de bord</h1>
      
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
      
      <div className="dashboard-actions">
        <button 
          className="action-button seao-downloader"
          onClick={startDownload}
          disabled={isDownloading || !isAuthenticated}
        >
          SEAO Downloader
        </button>
        
        {/* Autres boutons d'action ici */}
      </div>
      
      {isDownloading && (
        <div className="download-progress">
          <h3>Téléchargement en cours</h3>
          <div className="progress-bar-container">
            <div className="progress-bar" style={{ width: `${progress}%` }}></div>
          </div>
          <p className="progress-text">{progress}% - {statusMessage}</p>
        </div>
      )}
      
      {downloadId && (
        <div className="download-complete">
          <h3>Téléchargement terminé</h3>
          <button 
            className="download-button"
            onClick={downloadFiles}
          >
            Télécharger les fichiers (ZIP)
          </button>
        </div>
      )}
      
      <div className="operations-section">
        <h2>Opérations en cours</h2>
        {/* Liste des opérations en cours ici */}
      </div>
    </div>
  );
};

export default Dashboard;
