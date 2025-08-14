import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Clock, Database, RefreshCw } from 'lucide-react';
import { apiService } from '../lib/api';
import { salesBudgetService } from '../services/salesBudgetService';
import { rollingForecastService } from '../services/rollingForecastService';

const BackendStatus: React.FC = () => {
  const [status, setStatus] = useState<'loading' | 'connected' | 'disconnected'>('loading');
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  const [apiResponse, setApiResponse] = useState<any>(null);
  const [dbStatus, setDbStatus] = useState<any>(null);

  const checkBackendStatus = async () => {
    setStatus('loading');
    try {
      // Check API health
      console.log('🔍 Checking backend health...');
      const response = await apiService.healthCheck();
      
      if (response.data) {
        console.log('✅ Backend health check passed:', response.data);
        setStatus('connected');
        setApiResponse(response.data);
        
        // Test database operations
        try {
          const budgets = await salesBudgetService.getAllBudgets();
          const forecasts = await rollingForecastService.getAllForecasts();
          
          setDbStatus({
            budgets: budgets.length,
            forecasts: forecasts.length,
            lastSync: new Date().toISOString()
          });
          
          console.log('✅ Database operations successful:', {
            budgets: budgets.length,
            forecasts: forecasts.length
          });
          
        } catch (dbError) {
          console.warn('⚠️ Database operations failed:', dbError);
          setDbStatus({ error: 'Database operations failed' });
        }
        
      } else {
        console.error('❌ Backend health check failed:', response.error);
        setStatus('disconnected');
        setApiResponse(response.error);
      }
    } catch (error) {
      console.error('❌ Backend connection failed:', error);
      setStatus('disconnected');
      setApiResponse(error);
    }
    setLastChecked(new Date());
  };

  useEffect(() => {
    checkBackendStatus();
    // Check every 60 seconds
    const interval = setInterval(checkBackendStatus, 60000);
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
      default: return <Clock className="w-4 h-4 animate-pulse" />;
    }
  };

  return (
    <div className={`border rounded-lg p-4 ${getStatusColor()}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {getStatusIcon()}
          <span className="font-medium">
            Backend: {status === 'loading' ? 'Checking...' : 
                    status === 'connected' ? 'Connected' : 'Disconnected'}
          </span>
        </div>
        <button
          onClick={checkBackendStatus}
          disabled={status === 'loading'}
          className="p-1 hover:bg-white/50 rounded transition-colors"
          title="Refresh status"
        >
          <RefreshCw className={`w-4 h-4 ${status === 'loading' ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {lastChecked && (
        <div className="text-xs opacity-75 mb-2">
          Last checked: {lastChecked.toLocaleTimeString()}
        </div>
      )}

      {status === 'connected' && apiResponse && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <Database className="w-4 h-4" />
            <span>Database: {apiResponse.database || 'Connected'}</span>
          </div>
          
          {dbStatus && !dbStatus.error && (
            <div className="text-xs space-y-1">
              <div>• Budget items: {dbStatus.budgets}</div>
              <div>• Forecast items: {dbStatus.forecasts}</div>
              <div>• Last sync: {new Date(dbStatus.lastSync).toLocaleTimeString()}</div>
            </div>
          )}
          
          {dbStatus?.error && (
            <div className="text-xs text-red-600">
              ⚠️ {dbStatus.error}
            </div>
          )}
        </div>
      )}

      {status === 'disconnected' && (
        <div className="text-xs">
          Using fallback data. Check server status.
        </div>
      )}
    </div>
  );
};

export default BackendStatus;
