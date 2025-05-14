import React, { useState } from 'react';
import { Save } from 'lucide-react';

interface Settings {
  credentials: {
    email: string;
    password: string;
  };
  apiKeys: {
    openAIKey: string;
  };
  downloadPath: string;
  maxConcurrentDownloads: number;
  automaticAnalysis: boolean;
  defaultSearchTerms: string[];
}

const Settings: React.FC = () => {
  const [settings, setSettings] = useState<Settings>({
    credentials: {
      email: 'shawn.daley@venturecarpets.com',
      password: '********',
    },
    apiKeys: {
      openAIKey: '',
    },
    downloadPath: '/telecharges',
    maxConcurrentDownloads: 3,
    automaticAnalysis: true,
    defaultSearchTerms: ['tapis', 'revêtement de sol', 'moquette'],
  });
  
  const [newSearchTerm, setNewSearchTerm] = useState('');
  
  const handleCredentialChange = (field: keyof typeof settings.credentials, value: string) => {
    setSettings({
      ...settings,
      credentials: {
        ...settings.credentials,
        [field]: value,
      },
    });
  };
  
  const handleApiKeyChange = (field: keyof typeof settings.apiKeys, value: string) => {
    setSettings({
      ...settings,
      apiKeys: {
        ...settings.apiKeys,
        [field]: value,
      },
    });
  };
  
  const handleSettingChange = <K extends keyof Settings>(field: K, value: Settings[K]) => {
    setSettings({
      ...settings,
      [field]: value,
    });
  };
  
  const handleAddSearchTerm = () => {
    if (newSearchTerm.trim() && !settings.defaultSearchTerms.includes(newSearchTerm.trim())) {
      handleSettingChange('defaultSearchTerms', [...settings.defaultSearchTerms, newSearchTerm.trim()]);
      setNewSearchTerm('');
    }
  };
  
  const handleRemoveSearchTerm = (term: string) => {
    handleSettingChange(
      'defaultSearchTerms', 
      settings.defaultSearchTerms.filter(t => t !== term)
    );
  };
  
  const handleSaveSettings = () => {
    console.log('Saving settings:', settings);
    // Logic to save settings
    alert('Paramètres enregistrés avec succès!');
  };

  return (
    <div className="space-y-6 slide-in-up">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-6">Paramètres de l'application</h2>
        
        <div className="space-y-8">
          <div>
            <h3 className="text-md font-medium text-gray-800 mb-4">Identifiants SEAO</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Adresse email
                </label>
                <input
                  id="email"
                  type="email"
                  value={settings.credentials.email}
                  onChange={(e) => handleCredentialChange('email', e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Mot de passe
                </label>
                <input
                  id="password"
                  type="password"
                  value={settings.credentials.password}
                  onChange={(e) => handleCredentialChange('password', e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-md font-medium text-gray-800 mb-4">Clés API</h3>
            <div>
              <label htmlFor="openai-key" className="block text-sm font-medium text-gray-700 mb-1">
                Clé API OpenAI
              </label>
              <input
                id="openai-key"
                type="password"
                value={settings.apiKeys.openAIKey}
                onChange={(e) => handleApiKeyChange('openAIKey', e.target.value)}
                placeholder="sk-..."
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="mt-1 text-sm text-gray-500">
                Nécessaire pour l'analyse des documents via l'API GPT.
              </p>
            </div>
          </div>
          
          <div>
            <h3 className="text-md font-medium text-gray-800 mb-4">Configuration du téléchargement</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="download-path" className="block text-sm font-medium text-gray-700 mb-1">
                  Chemin de téléchargement
                </label>
                <input
                  id="download-path"
                  type="text"
                  value={settings.downloadPath}
                  onChange={(e) => handleSettingChange('downloadPath', e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label htmlFor="max-downloads" className="block text-sm font-medium text-gray-700 mb-1">
                  Téléchargements simultanés max.
                </label>
                <input
                  id="max-downloads"
                  type="number"
                  min="1"
                  max="10"
                  value={settings.maxConcurrentDownloads}
                  onChange={(e) => handleSettingChange('maxConcurrentDownloads', parseInt(e.target.value))}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-md font-medium text-gray-800 mb-4">Termes de recherche par défaut</h3>
            <div className="flex items-center space-x-2 mb-4">
              <input
                type="text"
                value={newSearchTerm}
                onChange={(e) => setNewSearchTerm(e.target.value)}
                placeholder="Nouveau terme de recherche"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
              <button
                onClick={handleAddSearchTerm}
                disabled={!newSearchTerm.trim()}
                className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300"
              >
                Ajouter
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {settings.defaultSearchTerms.map((term) => (
                <div 
                  key={term}
                  className="flex items-center bg-blue-100 text-blue-800 px-3 py-1 rounded-full"
                >
                  <span>{term}</span>
                  <button 
                    onClick={() => handleRemoveSearchTerm(term)}
                    className="ml-2 text-blue-600 hover:text-blue-800 focus:outline-none"
                  >
                    &times;
                  </button>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <h3 className="text-md font-medium text-gray-800 mb-4">Options d'analyse</h3>
            <div className="flex items-center">
              <input
                id="auto-analysis"
                type="checkbox"
                checked={settings.automaticAnalysis}
                onChange={(e) => handleSettingChange('automaticAnalysis', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="auto-analysis" className="ml-2 text-sm text-gray-700">
                Analyser automatiquement les documents après téléchargement
              </label>
            </div>
          </div>
          
          <div className="pt-4 border-t border-gray-200">
            <button
              onClick={handleSaveSettings}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Save size={16} className="mr-2" />
              Enregistrer les paramètres
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;