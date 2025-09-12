import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';

const DatabaseStatus = () => {
  const [status, setStatus] = useState({ database: 'checking' });
  const [showMessage, setShowMessage] = useState(false);

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const response = await api.get('/health');
        setStatus(response.data);
        setShowMessage(response.data.database === 'Disconnected');
      } catch (error) {
        console.log('Health check failed:', error.message);
        setStatus({ database: 'unavailable' });
        setShowMessage(true);
      }
    };

    checkHealth();
    const interval = setInterval(checkHealth, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, []);

  if (!showMessage) return null;

  return (
    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
      <div className="flex">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-yellow-800">Database Connection Required</h3>
          <div className="mt-2 text-sm text-yellow-700">
            <p>
              MongoDB is not connected. Some features like user authentication, reviews, and watchlists may be unavailable.
            </p>
            <p className="mt-1">
              To enable full functionality, please install MongoDB:
              <a 
                href="https://www.mongodb.com/try/download/community" 
                target="_blank" 
                rel="noopener noreferrer"
                className="ml-1 underline hover:text-yellow-900"
              >
                Download MongoDB Community
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DatabaseStatus;