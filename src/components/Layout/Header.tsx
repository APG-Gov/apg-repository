import React from 'react';
import { Calendar, Users, Download } from 'lucide-react';

interface HeaderProps {
  title: string;
  showExportButton?: boolean;
  onExport?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ title, showExportButton, onExport }) => {
  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Calendar className="h-8 w-8 text-blue-600 mr-3" />
            <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
          </div>
          
          {showExportButton && (
            <button
              onClick={onExport}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-200"
            >
              <Download className="h-4 w-4 mr-2" />
              Exportar Dados
            </button>
          )}
        </div>
      </div>
    </header>
  );
};