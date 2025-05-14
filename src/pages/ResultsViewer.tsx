import React, { useState } from 'react';
import { ArrowUpDown, Filter, Download, Eye } from 'lucide-react';

interface Tender {
  id: string;
  title: string;
  organization: string;
  publicationDate: string;
  closingDate: string;
  category: string;
  status: 'active' | 'closed' | 'awarded';
  hasDocuments: boolean;
}

const ResultsViewer: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'closed' | 'awarded'>('all');
  
  // Sample data
  const tenders: Tender[] = [
    // Empty for now - will be populated from API/script
  ];
  
  const filteredTenders = tenders
    .filter(tender => 
      (searchTerm === '' || 
       tender.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
       tender.organization.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .filter(tender => 
      filterStatus === 'all' || tender.status === filterStatus
    );
  
  const handleViewTender = (tender: Tender) => {
    console.log('Viewing tender:', tender);
    // Implement tender viewing logic
  };
  
  const handleDownloadDocuments = (tender: Tender) => {
    console.log('Downloading documents for tender:', tender);
    // Implement document downloading logic
  };

  return (
    <div className="space-y-6 slide-in-up">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col sm:flex-row justify-between space-y-4 sm:space-y-0 sm:space-x-4 mb-6">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Eye size={16} className="text-gray-400" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Rechercher par titre ou organisation..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Filter size={16} className="text-gray-500" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Tous les statuts</option>
              <option value="active">Actifs</option>
              <option value="closed">Fermés</option>
              <option value="awarded">Attribués</option>
            </select>
          </div>
        </div>
        
        {filteredTenders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center">
                      Titre
                      <ArrowUpDown size={14} className="ml-1 cursor-pointer hover:text-gray-700" />
                    </div>
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center">
                      Organisation
                      <ArrowUpDown size={14} className="ml-1 cursor-pointer hover:text-gray-700" />
                    </div>
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center">
                      Date de publication
                      <ArrowUpDown size={14} className="ml-1 cursor-pointer hover:text-gray-700" />
                    </div>
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center">
                      Statut
                      <ArrowUpDown size={14} className="ml-1 cursor-pointer hover:text-gray-700" />
                    </div>
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTenders.map((tender) => (
                  <tr key={tender.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-700 hover:text-blue-900 cursor-pointer" onClick={() => handleViewTender(tender)}>
                      {tender.title}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {tender.organization}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {tender.publicationDate}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                        ${tender.status === 'active' ? 'bg-green-100 text-green-800' : 
                          tender.status === 'closed' ? 'bg-gray-100 text-gray-800' : 
                          'bg-blue-100 text-blue-800'}`}>
                        {tender.status === 'active' ? 'Actif' : 
                          tender.status === 'closed' ? 'Fermé' : 'Attribué'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button 
                          onClick={() => handleViewTender(tender)}
                          className="text-blue-600 hover:text-blue-900 p-1"
                          title="Voir les détails"
                        >
                          <Eye size={16} />
                        </button>
                        {tender.hasDocuments && (
                          <button 
                            onClick={() => handleDownloadDocuments(tender)}
                            className="text-green-600 hover:text-green-900 p-1"
                            title="Télécharger les documents"
                          >
                            <Download size={16} />
                          </button>
                        )}
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
              Aucun résultat trouvé
            </p>
            <p className="text-gray-400 text-sm mt-2">
              Essayez de modifier vos filtres ou d'effectuer une nouvelle recherche.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResultsViewer;