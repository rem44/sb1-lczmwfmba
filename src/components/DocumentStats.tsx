import React from 'react';
import { FileText, FilePlus2, HardDrive, FolderOpen } from 'lucide-react';

interface DocumentStatsProps {
  totalTenders: number;
  totalDocuments: number;
  totalSize: string;
  downloadPath: string;
}

const DocumentStats: React.FC<DocumentStatsProps> = ({
  totalTenders,
  totalDocuments,
  totalSize,
  downloadPath
}) => {
  return (
    <div className="mb-6">
      <h2 className="text-lg font-medium text-gray-900 mb-4">Documents téléchargés</h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="stats-card bg-blue-50 rounded-lg p-4 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-800">Total des appels d'offre</p>
              <p className="text-2xl font-bold text-blue-900">{totalTenders}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <FileText size={20} className="text-blue-700" />
            </div>
          </div>
        </div>
        
        <div className="stats-card bg-green-50 rounded-lg p-4 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-800">Documents téléchargés</p>
              <p className="text-2xl font-bold text-green-900">{totalDocuments}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <FilePlus2 size={20} className="text-green-700" />
            </div>
          </div>
        </div>
        
        <div className="stats-card bg-purple-50 rounded-lg p-4 border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-800">Taille totale</p>
              <p className="text-2xl font-bold text-purple-900">{totalSize}</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <HardDrive size={20} className="text-purple-700" />
            </div>
          </div>
        </div>
        
        <div className="stats-card bg-orange-50 rounded-lg p-4 border border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-800">Dossier</p>
              <p className="text-sm font-medium text-orange-900 truncate max-w-[120px]">
                {downloadPath}
              </p>
            </div>
            <div className="bg-orange-100 p-3 rounded-full">
              <FolderOpen size={20} className="text-orange-700" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentStats;