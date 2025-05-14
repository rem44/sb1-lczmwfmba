import React, { useState } from 'react';
import { Search, Filter, FileType, Calendar } from 'lucide-react';
import DocumentsTable, { Document } from '../components/DocumentsTable';

const Documents: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [dateRange, setDateRange] = useState({ from: '', to: '' });
  
  // Sample data
  const [documents, setDocuments] = useState<Document[]>([
    // Empty for demo - would be populated from your backend/storage
  ]);
  
  const filteredDocuments = documents.filter(doc => 
    (searchTerm === '' || 
     doc.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
     doc.tenderName.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  
  const handleViewDocument = (doc: Document) => {
    console.log('Viewing document:', doc);
    // Implement document viewing logic
  };
  
  const handleDownloadDocument = (doc: Document) => {
    console.log('Downloading document:', doc);
    // Implement document downloading logic
  };
  
  const handleDeleteDocument = (doc: Document) => {
    console.log('Deleting document:', doc);
    // Ask for confirmation before deleting
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer le document "${doc.fileName}" ?`)) {
      setDocuments(documents.filter(d => d.id !== doc.id));
    }
  };

  return (
    <div className="space-y-6 slide-in-up">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-6">Gestion des documents</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={16} className="text-gray-400" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Rechercher un document..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <FileType size={16} className="text-gray-500" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Tous les types</option>
              <option value="pdf">PDF</option>
              <option value="word">Word</option>
              <option value="excel">Excel</option>
              <option value="other">Autres</option>
            </select>
          </div>
          
          <div className="flex items-center space-x-2">
            <Calendar size={16} className="text-gray-500 flex-shrink-0" />
            <div className="flex space-x-2 items-center w-full">
              <input
                type="date"
                value={dateRange.from}
                onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
                className="block w-full pl-3 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="Du"
              />
              <span className="text-gray-500">-</span>
              <input
                type="date"
                value={dateRange.to}
                onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
                className="block w-full pl-3 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="Au"
              />
            </div>
          </div>
        </div>
        
        <DocumentsTable 
          documents={filteredDocuments}
          onViewDocument={handleViewDocument}
          onDownloadDocument={handleDownloadDocument}
          onDeleteDocument={handleDeleteDocument}
        />
      </div>
    </div>
  );
};

export default Documents;