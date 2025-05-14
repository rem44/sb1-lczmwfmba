import React from 'react';
import { Download, FileSearch } from 'lucide-react';
import { cn } from '../utils/cn';

interface TabNavigationProps {
  activeTab: 'downloader' | 'analyzer';
  onTabChange: (tab: 'downloader' | 'analyzer') => void;
}

const TabNavigation: React.FC<TabNavigationProps> = ({ activeTab, onTabChange }) => {
  return (
    <div className="border-b border-gray-200 mb-6">
      <div className="flex space-x-8">
        <button
          className={cn(
            "py-4 px-1 border-b-2 font-medium text-sm flex items-center",
            activeTab === 'downloader'
              ? "border-blue-700 text-blue-700"
              : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
          )}
          onClick={() => onTabChange('downloader')}
        >
          <Download size={18} className="mr-2" />
          SEAO Downloader
        </button>
        <button
          className={cn(
            "py-4 px-1 border-b-2 font-medium text-sm flex items-center",
            activeTab === 'analyzer'
              ? "border-blue-700 text-blue-700"
              : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
          )}
          onClick={() => onTabChange('analyzer')}
        >
          <FileSearch size={18} className="mr-2" />
          PDF Analyzer
        </button>
      </div>
    </div>
  );
};

export default TabNavigation;