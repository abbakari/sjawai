import React, { useState, useEffect } from 'react';
import { apiService } from '../lib/api';
import { CheckCircle, XCircle, Clock } from 'lucide-react';

const ApiStatus: React.FC = () => {
  const [status, setStatus] = useState<'loading' | 'connected' | 'disconnected'>('loading');
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  const [apiResponse, setApiResponse] = useState<any>(null);

  const checkApiStatus = async () => {
    setStatus('loading');
    try {
      // Add timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Timeout')), 2000)
      );

      const response = await Promise.race([
        apiService.healthCheck(),
        timeoutPromise
      ]);

      if (response.data) {
        setStatus('connected');
        setApiResponse(response.data);
      } else {
        setStatus('disconnected');
        setApiResponse(response.error || 'No response');
      }
    } catch (error) {
      setStatus('disconnected');
      setApiResponse('Backend unavailable (using demo mode)');
      console.warn('API health check failed:', error);
    }
    setLastChecked(new Date());
  };

  useEffect(() => {
    checkApiStatus();
    // Check every 30 seconds
    const interval = setInterval(checkApiStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = () => {
    switch (status) {
      case 'connected': return 'text-green-600 bg-green-50 border-green-200';
      case 'disconnected': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'connected': return <CheckCircle className="w-4 h-4" />;
      case 'disconnected': return <XCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor()}`}>
      {getStatusIcon()}
      <span>
        Backend: {status === 'loading' ? 'Checking...' : 
                status === 'connected' ? 'Connected' : 'Disconnected'}
      </span>
      {lastChecked && (
        <span className="opacity-75">
          ({lastChecked.toLocaleTimeString()})
        </span>
      )}
      
      {status === 'connected' && apiResponse && (
        <div className="text-xs opacity-75">
          ✓ API Running
        </div>
      )}
    </div>
  );
};

export default ApiStatus;
