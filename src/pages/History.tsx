import React, { useState } from 'react';
import { Calendar, ArrowUpDown, RefreshCw, Info } from 'lucide-react';

interface HistoryEntry {
  id: string;
  date: string;
  operation: string;
  status: 'success' | 'error' | 'partial';
  details: string;
  documentsCount: number;
}

const History: React.FC = () => {
  const [searchDate, setSearchDate] = useState('');
  
  // Sample history data
  const historyEntries: HistoryEntry[] = [
    // Would be populated from your storage/backend
  ];
  
  const filteredEntries = searchDate
    ? historyEntries.filter(entry => entry.date.includes(searchDate))
    : historyEntries;

  const handleRerunOperation = (entry: HistoryEntry) => {
    console.log('Re-running operation:', entry);
    // Logic to re-run the operation
  };
  
  const handleViewDetails = (entry: HistoryEntry) => {
    console.log('Viewing details:', entry);
    // Logic to display operation details
  };

  return (
    <div className="space-y-6 slide-in-up">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-6">Historique des opérations</h2>
        
        <div className="flex justify-between items-center mb-6">
          <div className="relative max-w-xs">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Calendar size={16} className="text-gray-400" />
            </div>
            <input
              type="date"
              value={searchDate}
              onChange={(e) => setSearchDate(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
        
        {filteredEntries.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center">
                      Date
                      <ArrowUpDown size={14} className="ml-1 cursor-pointer hover:text-gray-700" />
                    </div>
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center">
                      Opération
                      <ArrowUpDown size={14} className="ml-1 cursor-pointer hover:text-gray-700" />
                    </div>
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center">
                      Statut
                      <ArrowUpDown size={14} className="ml-1 cursor-pointer hover:text-gray-700" />
                    </div>
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center">
                      Documents
                      <ArrowUpDown size={14} className="ml-1 cursor-pointer hover:text-gray-700" />
                    </div>
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredEntries.map((entry) => (
                  <tr key={entry.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {entry.date}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {entry.operation}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                        ${entry.status === 'success' ? 'bg-green-100 text-green-800' : 
                          entry.status === 'error' ? 'bg-red-100 text-red-800' : 
                          'bg-yellow-100 text-yellow-800'}`}>
                        {entry.status === 'success' ? 'Succès' : 
                          entry.status === 'error' ? 'Erreur' : 'Partiel'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {entry.documentsCount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button 
                          onClick={() => handleViewDetails(entry)}
                          className="text-blue-600 hover:text-blue-900 p-1"
                          title="Voir les détails"
                        >
                          <Info size={16} />
                        </button>
                        <button 
                          onClick={() => handleRerunOperation(entry)}
                          className="text-green-600 hover:text-green-900 p-1"
                          title="Relancer l'opération"
                        >
                          <RefreshCw size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500 text-lg">
              Aucune opération dans l'historique
            </p>
            <p className="text-gray-400 text-sm mt-2">
              L'historique s'affichera ici après avoir effectué des opérations de téléchargement.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default History;