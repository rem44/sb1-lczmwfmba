import React from 'react';
import { Calendar } from 'lucide-react';

const Header: React.FC = () => {
  const currentDate = new Date().toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-blue-900">
              Tapis Venture - SEAO Analyzer
            </h1>
            <p className="ml-4 text-sm text-gray-500">
              Analyse automatisée des opportunités de revêtement de sol dans les appels d'offres
            </p>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <Calendar size={16} className="mr-1" />
            <span>Date: {currentDate}</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;