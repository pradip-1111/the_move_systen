import React from 'react';
import { useSelector } from 'react-redux';

const LoadingSpinner = ({ size = 'md', className = '' }) => {
  const { mode } = useSelector((state) => state.theme);

  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24'
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className="relative">
        {/* Outer spinning ring */}
        <div className={`${sizeClasses[size]} rounded-full border-4 ${
          mode === 'dark'
            ? 'border-gray-700 border-t-blue-400'
            : 'border-gray-200 border-t-blue-600'
        } animate-spin`}></div>
        
        {/* Inner pulsing dot */}
        <div className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 ${
          size === 'sm' ? 'w-2 h-2' :
          size === 'md' ? 'w-3 h-3' :
          size === 'lg' ? 'w-4 h-4' : 'w-6 h-6'
        } rounded-full ${
          mode === 'dark'
            ? 'bg-blue-400'
            : 'bg-blue-600'
        } animate-pulse`}></div>
      </div>
    </div>
  );
};

export default LoadingSpinner;