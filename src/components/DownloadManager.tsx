import React, { useState, useEffect } from 'react';
import { Download, RefreshCw, CheckCircle, XCircle } from 'lucide-react';
import { api } from '../services/api';

interface DownloadManagerProps {
  onDownloadComplete?: (downloadId: string) => void;
}

const DownloadManager: React.FC<DownloadManagerProps> = ({ onDownloadComplete }) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [taskId, setTaskId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [downloadId, setDownloadId] = useState<string | null>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (taskId && isDownloading) {
      interval = setInterval(async () => {
        try {
          const status = await api.checkDownloadStatus(taskId);
          setProgress(status.progress);

          if (status.status === 'completed') {
            setIsDownloading(false);
            setDownloadId(status.download_id);
            onDownloadComplete?.(status.download_id);
          } else if (status.status === 'failed') {
            throw new Error(status.message || 'Échec du téléchargement');
          }
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Erreur de téléchargement');
          setIsDownloading(false);
        }
      }, 2000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [taskId, isDownloading]);

  const startDownload = async () => {
    setError(null);
    setProgress(0);
    setDownloadId(null);
    setIsDownloading(true);

    try {
      const { task_id } = await api.startDownload();
      setTaskId(task_id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de démarrage');
      setIsDownloading(false);
    }
  };

  const downloadFiles = () => {
    if (downloadId) {
      window.location.href = api.getDownloadUrl(downloadId);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-medium text-gray-900">
          Téléchargement des documents
        </h2>
        {!isDownloading && !downloadId && (
          <button
            onClick={startDownload}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Download className="w-4 h-4 mr-2" />
            Démarrer
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
          <div className="flex">
            <XCircle className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {(isDownloading || progress > 0) && (
        <div className="space-y-4">
          <div className="flex items-center">
            {isDownloading ? (
              <RefreshCw className="w-5 h-5 text-blue-500 animate-spin mr-2" />
            ) : (
              <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
            )}
            <span className="text-sm font-medium text-gray-700">
              {isDownloading ? 'Téléchargement en cours...' : 'Téléchargement terminé'}
            </span>
          </div>

          <div className="relative pt-1">
            <div className="flex mb-2 items-center justify-between">
              <div>
                <span className="text-xs font-semibold inline-block text-blue-600">
                  {progress}%
                </span>
              </div>
            </div>
            <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-blue-100">
              <div
                style={{ width: `${progress}%` }}
                className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500 transition-all duration-500"
              ></div>
            </div>
          </div>
        </div>
      )}

      {downloadId && (
        <div className="mt-4">
          <button
            onClick={downloadFiles}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            <Download className="w-4 h-4 mr-2" />
            Télécharger les fichiers
          </button>
        </div>
      )}
    </div>
  );
};

export default DownloadManager;