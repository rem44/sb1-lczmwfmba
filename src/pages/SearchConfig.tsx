import React, { useState } from 'react';
import { Search, Plus, Trash2 } from 'lucide-react';

interface SearchTerm {
  id: string;
  term: string;
  isExact: boolean;
}

const SearchConfig: React.FC = () => {
  const [searchTerms, setSearchTerms] = useState<SearchTerm[]>([
    { id: '1', term: 'tapis', isExact: false },
    { id: '2', term: 'revêtement de sol', isExact: false },
    { id: '3', term: 'moquette', isExact: false },
  ]);
  const [dateRange, setDateRange] = useState({ from: '', to: '' });
  const [onlyNewTenders, setOnlyNewTenders] = useState(true);
  const [includeDocuments, setIncludeDocuments] = useState(true);
  const [newTerm, setNewTerm] = useState('');
  const [isExact, setIsExact] = useState(false);

  const handleAddTerm = () => {
    if (newTerm.trim()) {
      setSearchTerms([
        ...searchTerms,
        { 
          id: Date.now().toString(), 
          term: newTerm.trim(), 
          isExact 
        }
      ]);
      setNewTerm('');
      setIsExact(false);
    }
  };

  const handleRemoveTerm = (id: string) => {
    setSearchTerms(searchTerms.filter(term => term.id !== id));
  };

  const handleSaveConfig = () => {
    const config = {
      searchTerms,
      dateRange,
      onlyNewTenders,
      includeDocuments
    };
    console.log('Saving search configuration:', config);
    // Here you would typically save this to local storage or send to backend
    alert('Configuration de recherche enregistrée!');
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 slide-in-up">
      <h2 className="text-lg font-medium text-gray-900 mb-6">Configuration de la recherche</h2>
      
      <div className="space-y-6">
        <div>
          <h3 className="text-md font-medium text-gray-800 mb-2">Termes de recherche</h3>
          <p className="text-sm text-gray-500 mb-4">
            Ajoutez des mots-clés pour cibler les appels d'offres pertinents.
          </p>
          
          <div className="flex items-center space-x-2 mb-4">
            <input
              type="text"
              value={newTerm}
              onChange={(e) => setNewTerm(e.target.value)}
              placeholder="Nouveau terme de recherche"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
            <div className="flex items-center">
              <input
                id="exact-match"
                type="checkbox"
                checked={isExact}
                onChange={(e) => setIsExact(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="exact-match" className="ml-2 text-sm text-gray-600">
                Correspondance exacte
              </label>
            </div>
            <button
              onClick={handleAddTerm}
              disabled={!newTerm.trim()}
              className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Plus size={16} className="mr-1" />
              Ajouter
            </button>
          </div>
          
          <div className="space-y-2">
            {searchTerms.map(term => (
              <div 
                key={term.id}
                className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-md border border-gray-200"
              >
                <div className="flex items-center">
                  <Search size={16} className="text-gray-500 mr-2" />
                  <span className="text-gray-800">{term.term}</span>
                  {term.isExact && (
                    <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                      Exact
                    </span>
                  )}
                </div>
                <button
                  onClick={() => handleRemoveTerm(term.id)}
                  className="text-gray-400 hover:text-red-600 focus:outline-none"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-md font-medium text-gray-800 mb-2">Période de publication</h3>
            <div className="space-y-4">
              <div>
                <label htmlFor="date-from" className="block text-sm font-medium text-gray-700">
                  Du
                </label>
                <input
                  id="date-from"
                  type="date"
                  value={dateRange.from}
                  onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label htmlFor="date-to" className="block text-sm font-medium text-gray-700">
                  Au
                </label>
                <input
                  id="date-to"
                  type="date"
                  value={dateRange.to}
                  onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-md font-medium text-gray-800 mb-2">Options</h3>
            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  id="only-new"
                  type="checkbox"
                  checked={onlyNewTenders}
                  onChange={(e) => setOnlyNewTenders(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="only-new" className="ml-2 text-sm text-gray-700">
                  Seulement les nouveaux appels d'offres
                </label>
              </div>
              <div className="flex items-center">
                <input
                  id="include-docs"
                  type="checkbox"
                  checked={includeDocuments}
                  onChange={(e) => setIncludeDocuments(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="include-docs" className="ml-2 text-sm text-gray-700">
                  Inclure les documents associés
                </label>
              </div>
            </div>
          </div>
        </div>
        
        <div className="pt-4 border-t border-gray-200">
          <button
            onClick={handleSaveConfig}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Enregistrer la configuration
          </button>
        </div>
      </div>
    </div>
  );
};

export default SearchConfig;