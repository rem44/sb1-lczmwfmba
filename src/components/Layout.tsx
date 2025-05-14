import React from 'react';
import { useLocation } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const pageTitle = getPageTitle(location.pathname);

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <Header />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-6 overflow-y-auto main-content">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-800">{pageTitle}</h1>
          </div>
          <div className="fade-in">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

function getPageTitle(pathname: string): string {
  switch (pathname) {
    case '/':
      return 'Tableau de bord';
    case '/search':
      return 'Configuration de recherche';
    case '/results':
      return 'Visualisation des résultats';
    case '/documents':
      return 'Documents téléchargés';
    case '/history':
      return 'Historique';
    case '/settings':
      return 'Paramètres';
    default:
      return 'SEAO Analyzer';
  }
}

export default Layout;