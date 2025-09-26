import React from 'react';

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ 
  message, 
  onRetry, 
  className = '' 
}) => {
  // 根据错误消息类型确定错误类型
  const getErrorType = () => {
    if (message.includes('网络连接失败') || message.includes('Network Error')) {
      return 'network-error';
    } else if (message.includes('请求超时') || message.includes('timeout')) {
      return 'timeout-error';
    } else if (message.includes('服务器连接失败')) {
      return 'server-error';
    }
    return '';
  };

  const errorType = getErrorType();

  return (
    <div 
      className={`error-message ${errorType} flex flex-col items-center justify-center p-6 text-center rounded-lg ${className}`}
      role="alert"
    >
      <svg 
        className="w-12 h-12 text-red-500 mb-3" 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2} 
          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
        />
      </svg>
      <p className="mb-4">{message}</p>
      {onRetry && (
        <button 
          onClick={onRetry}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
        >
          重试
        </button>
      )}
    </div>
  );
};