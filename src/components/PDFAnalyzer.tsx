import React, { useState, useRef, useCallback } from 'react';
import { Search, RefreshCw, Eye, AlertCircle } from 'lucide-react';
import { cn } from '../utils/cn';

interface Document {
  id: string;
  name: string;
  reference: string;
  size: string;
  isSelected: boolean;
}

interface AnalysisResult {
  document: string;
  project: string;
  relevance: 'High' | 'Medium' | 'Low';
  flooringDetails: string;
}

const PDFAnalyzer: React.FC = () => {
  const [documents, setDocuments] = useState<Document[]>([
    { id: '1', name: 'RERC-3025_Formulaire1.pdf', reference: 'RERC-3025', size: '8.66 Mo', isSelected: false },
    { id: '2', name: 'RERC-3025_Addenda2.pdf', reference: 'RERC-3025', size: '4.07 Mo', isSelected: false },
    { id: '3', name: 'RERC-3025_Addenda4.pdf', reference: 'RERC-3025', size: '1.61 Mo', isSelected: false },
    { id: '4', name: 'TERR24-01021_Formulaire1.pdf', reference: 'TERR24-01021', size: '7.46 Mo', isSelected: false },
    { id: '5', name: 'TERR24-01021_Devis8.pdf', reference: 'TERR24-01021', size: '2.44 Mo', isSelected: false },
    { id: '6', name: '44542603_Spécifications3.pdf', reference: '44542603', size: '6.93 Mo', isSelected: false },
  ]);

  const [analysisResults, setAnalysisResults] = useState<AnalysisResult[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [relevanceFilter, setRelevanceFilter] = useState('all');
  const [analysisStatus, setAnalysisStatus] = useState<'idle' | 'analyzing' | 'completed'>('idle');
  const [currentDocumentIndex, setCurrentDocumentIndex] = useState(0);
  const [leftPanelWidth, setLeftPanelWidth] = useState(50); // Percentage of total width

  const isDragging = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = useCallback(() => {
    isDragging.current = true;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  }, []);

  const handleMouseUp = useCallback(() => {
    isDragging.current = false;
    document.body.style.cursor = 'default';
    document.body.style.userSelect = 'auto';
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging.current || !containerRef.current) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    const containerWidth = containerRect.width;
    const mouseX = e.clientX - containerRect.left;
    
    // Calculate percentage (constrain between 30% and 70%)
    const newLeftPanelWidth = Math.min(Math.max((mouseX / containerWidth) * 100, 30), 70);
    setLeftPanelWidth(newLeftPanelWidth);
  }, []);

  React.useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  const toggleSelectAll = (checked: boolean) => {
    setDocuments(documents.map(doc => ({ ...doc, isSelected: checked })));
  };

  const toggleDocument = (id: string) => {
    setDocuments(documents.map(doc => 
      doc.id === id ? { ...doc, isSelected: !doc.isSelected } : doc
    ));
  };

  const startAnalysis = async () => {
    const selectedDocs = documents.filter(doc => doc.isSelected);
    if (selectedDocs.length === 0) return;

    setIsAnalyzing(true);
    setAnalysisStatus('analyzing');
    setAnalysisResults([]);
    setCurrentDocumentIndex(0);

    // Simuler l'analyse des documents
    for (let i = 0; i < selectedDocs.length; i++) {
      setCurrentDocumentIndex(i);
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    // Simuler les résultats
    const mockResults: AnalysisResult[] = [
      {
        document: 'RERC-3025_Formulaire1.pdf',
        project: 'Projet de rénovation d\'un espace comm...',
        relevance: 'High',
        flooringDetails: 'Revêtements de sol spécifiés incluent: -...',
      },
      {
        document: 'TERR24-01021_Devis8.pdf',
        project: 'Construction d\'un nouveau complexe ré...',
        relevance: 'High',
        flooringDetails: 'Spécifications détaillées pour les revête...',
      },
      {
        document: '44542603_Spécifications3.pdf',
        project: 'Construction d\'un hôtel boutique de 6 é...',
        relevance: 'High',
        flooringDetails: 'Besoins en revêtements de sol haut de ...',
      },
    ];

    setAnalysisResults(mockResults);
    setAnalysisStatus('completed');
    setIsAnalyzing(false);
  };

  const filteredResults = analysisResults.filter(result => {
    if (searchTerm) {
      return result.project.toLowerCase().includes(searchTerm.toLowerCase()) ||
             result.flooringDetails.toLowerCase().includes(searchTerm.toLowerCase());
    }
    return true;
  });

  return (
    <div ref={containerRef} className="flex h-[calc(100vh-12rem)] overflow-hidden">
      {/* Left Panel */}
      <div 
        className="bg-white rounded-l-lg shadow"
        style={{ width: `${leftPanelWidth}%` }}
      >
        <div className="p-6 h-full overflow-y-auto">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Sélection des documents</h2>
          
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                onChange={(e) => toggleSelectAll(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">Tout sélectionner</span>
            </div>
            <button
              className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
              onClick={() => setDocuments([...documents])}
            >
              <RefreshCw size={14} className="mr-1" />
              Rafraîchir
            </button>
          </div>

          <div className="space-y-2">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className={cn(
                  "flex items-center p-3 rounded-md transition-colors duration-150",
                  doc.isSelected ? "bg-blue-50" : "hover:bg-gray-50"
                )}
              >
                <input
                  type="checkbox"
                  checked={doc.isSelected}
                  onChange={() => toggleDocument(doc.id)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <div className="ml-3 flex-1">
                  <p className="text-sm font-medium text-gray-900">{doc.name}</p>
                  <p className="text-xs text-gray-500">
                    {doc.reference} · {doc.size}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={startAnalysis}
            disabled={isAnalyzing || !documents.some(doc => doc.isSelected)}
            className="mt-6 w-full flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300"
          >
            {isAnalyzing ? (
              <>
                <RefreshCw size={16} className="animate-spin mr-2" />
                Analyse en cours...
              </>
            ) : (
              <>
                <Search size={16} className="mr-2" />
                Analyser les documents sélectionnés
              </>
            )}
          </button>
        </div>
      </div>

      {/* Resizer */}
      <div
        className="w-1 bg-gray-200 hover:bg-blue-400 cursor-col-resize transition-colors duration-150"
        onMouseDown={handleMouseDown}
      />

      {/* Right Panel */}
      <div 
        className="bg-white rounded-r-lg shadow flex-1"
        style={{ width: `${100 - leftPanelWidth}%` }}
      >
        <div className="p-6 h-full overflow-y-auto">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Résultats de l'analyse</h2>

          {analysisStatus === 'analyzing' && (
            <div className="text-center py-8">
              <RefreshCw size={32} className="animate-spin mx-auto text-blue-500 mb-4" />
              <p className="text-sm text-gray-600">
                Analyse en cours: {documents[currentDocumentIndex]?.name} ({currentDocumentIndex + 1}/{documents.filter(d => d.isSelected).length})
              </p>
            </div>
          )}

          {analysisStatus === 'completed' && (
            <>
              <div className="flex space-x-4 mb-6">
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Rechercher..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <select
                  value={relevanceFilter}
                  onChange={(e) => setRelevanceFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">Toutes les pertinences</option>
                  <option value="high">Élevée uniquement</option>
                  <option value="medium">Moyenne uniquement</option>
                  <option value="low">Faible uniquement</option>
                </select>
              </div>

              <div className="space-y-4">
                {filteredResults.map((result, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className={cn(
                        "px-2 py-1 rounded-full text-xs font-medium",
                        result.relevance === 'High' ? "bg-green-100 text-green-800" :
                        result.relevance === 'Medium' ? "bg-yellow-100 text-yellow-800" :
                        "bg-red-100 text-red-800"
                      )}>
                        {result.relevance === 'High' ? 'Élevée' :
                         result.relevance === 'Medium' ? 'Moyenne' : 'Faible'}
                      </span>
                      <button className="text-blue-600 hover:text-blue-800">
                        <Eye size={16} />
                      </button>
                    </div>
                    <h3 className="font-medium text-gray-900">{result.project}</h3>
                    <p className="text-sm text-gray-600 mt-1">{result.flooringDetails}</p>
                  </div>
                ))}
              </div>
            </>
          )}

          {analysisStatus === 'idle' && (
            <div className="text-center py-12">
              <AlertCircle size={32} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500">
                Sélectionnez des documents et lancez l'analyse pour voir les résultats
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PDFAnalyzer;