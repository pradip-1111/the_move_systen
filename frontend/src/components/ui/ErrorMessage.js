import React from 'react';
import { FiAlertCircle, FiRefreshCw } from 'react-icons/fi';
import clsx from 'clsx';

const ErrorMessage = ({ 
  message = 'Something went wrong', 
  onRetry,
  className,
  size = 'md'
}) => {
  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };

  return (
    <div className={clsx(
      'flex flex-col items-center justify-center p-8 text-center',
      className
    )}>
      <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mb-4">
        <FiAlertCircle className="h-6 w-6 text-red-600" />
      </div>
      
      <h3 className={clsx(
        'font-medium text-gray-900 mb-2',
        sizeClasses[size]
      )}>
        Oops! Something went wrong
      </h3>
      
      <p className="text-gray-600 mb-4 max-w-md">
        {typeof message === 'string' ? message : message?.message || message?.error || 'An unexpected error occurred'}
      </p>
      
      {onRetry && (
        <button
          onClick={onRetry}
          className="btn btn-outline btn-sm group"
        >
          <FiRefreshCw className="h-4 w-4 mr-2 group-hover:animate-spin" />
          Try Again
        </button>
      )}
    </div>
  );
};

export default ErrorMessage;