import React from 'react';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  message?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'medium', 
  message = '加载中...' 
}) => {
  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-8 h-8',
    large: 'w-12 h-12',
  };

  return (
    <div className="flex flex-col items-center justify-center p-4 animate-fadeIn">
      <div className="relative">
        <div 
          className={`animate-spin rounded-full border-2 border-gray-300 border-t-blue-600 ${sizeClasses[size]}`}
          role="status"
          aria-label="加载中"
        >
          <span className="sr-only">{message}</span>
        </div>
        <div 
          className={`absolute inset-0 rounded-full border-2 border-blue-600 animate-ping ${sizeClasses[size]}`}
          style={{ animationDuration: '1.5s' }}
        />
      </div>
      {message && (
        <p className="mt-3 text-sm text-gray-600 animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
          {message}
        </p>
      )}
    </div>
  );
};