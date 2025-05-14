import React from 'react';
import { CheckCircle, XCircle, Clock, Loader } from 'lucide-react';

export interface StatusStep {
  id: string;
  text: string;
  status: 'waiting' | 'loading' | 'success' | 'error';
  details?: string;
}

interface OperationStatusProps {
  steps: StatusStep[];
  progress: number;
}

const OperationStatus: React.FC<OperationStatusProps> = ({ steps, progress }) => {
  const getStatusIcon = (status: StatusStep['status']) => {
    switch (status) {
      case 'waiting':
        return <Clock size={16} className="text-gray-400" />;
      case 'loading':
        return <Loader size={16} className="text-blue-500 animate-spin" />;
      case 'success':
        return <CheckCircle size={16} className="text-green-600" />;
      case 'error':
        return <XCircle size={16} className="text-red-600" />;
    }
  };

  const getStatusClass = (status: StatusStep['status']) => {
    switch (status) {
      case 'waiting':
        return 'text-gray-600';
      case 'loading':
        return 'text-blue-800 font-medium';
      case 'success':
        return 'text-green-700';
      case 'error':
        return 'text-red-700';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6 slide-in-up">
      <h2 className="text-lg font-medium text-gray-900 mb-4">Opérations en cours</h2>
      
      <div className="terminal mb-4">
        {steps.map((step) => (
          <div key={step.id} className={`terminal-line ${getStatusClass(step.status)}`}>
            <span className="mr-2 inline-block">{getStatusIcon(step.status)}</span>
            <span>{step.text}</span>
            {step.details && <div className="pl-6 text-xs opacity-80">{step.details}</div>}
          </div>
        ))}
      </div>
      
      <div className="mt-4">
        <div className="flex justify-between text-sm mb-1">
          <span>Progression</span>
          <span>{progress}%</span>
        </div>
        <div className="progress-bar">
          <div 
            className="progress-bar-fill" 
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default OperationStatus;