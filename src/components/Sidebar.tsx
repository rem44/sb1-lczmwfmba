import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Search, 
  FileText, 
  FolderOpen, 
  History, 
  Settings 
} from 'lucide-react';

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
}

const NavItem: React.FC<NavItemProps> = ({ to, icon, label }) => {
  return (
    <NavLink
      to={to}
      className={({ isActive }) => 
        `flex items-center px-4 py-3 text-sm rounded-md transition-colors duration-150 ease-in-out
        ${isActive 
          ? 'bg-blue-100 text-blue-800 font-medium' 
          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
        }`
      }
    >
      <span className="mr-3">{icon}</span>
      <span>{label}</span>
    </NavLink>
  );
};

const Sidebar: React.FC = () => {
  return (
    <aside className="w-56 bg-white shadow-sm p-4 hidden md:block">
      <div className="mb-8 px-4">
        <h2 className="text-xs uppercase tracking-wider text-gray-500 font-semibold">
          Navigation
        </h2>
      </div>
      <nav className="space-y-1">
        <NavItem to="/" icon={<LayoutDashboard size={18} />} label="Tableau de bord" />
        <NavItem to="/search" icon={<Search size={18} />} label="Recherche" />
        <NavItem to="/results" icon={<FileText size={18} />} label="Résultats" />
        <NavItem to="/documents" icon={<FolderOpen size={18} />} label="Documents" />
        <NavItem to="/history" icon={<History size={18} />} label="Historique" />
        <NavItem to="/settings" icon={<Settings size={18} />} label="Paramètres" />
      </nav>
    </aside>
  );
};

export default Sidebar;