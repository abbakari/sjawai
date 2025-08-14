import React, { useState, useEffect } from 'react';
import { apiService } from '../lib/api';
import BackendStatus from '../components/BackendStatus';

const ApiTest: React.FC = () => {
  const [status, setStatus] = useState<string>('Testing...');
  const [response, setResponse] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const testApiConnection = async () => {
    try {
      setStatus('Testing API connection...');
      setError(null);
      
      const healthResponse = await apiService.healthCheck();
      
      if (healthResponse.data) {
        setStatus('✅ API Connected Successfully!');
        setResponse(healthResponse.data);
      } else {
        setStatus('❌ API Connection Failed');
        setError(healthResponse.error || 'Unknown error');
      }
    } catch (err) {
      setStatus('❌ Connection Error');
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  const testBudgetsEndpoint = async () => {
    try {
      setStatus('Testing Budgets endpoint...');
      const budgetsResponse = await apiService.getBudgets();
      
      if (budgetsResponse.data) {
        setStatus('✅ Budgets API Working!');
        setResponse(budgetsResponse.data);
      } else {
        setStatus('❌ Budgets API Failed');
        setError(budgetsResponse.error || 'Unknown error');
      }
    } catch (err) {
      setStatus('❌ Budgets Error');
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  useEffect(() => {
    testApiConnection();
  }, []);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">API Connection Test</h1>
      
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Connection Status</h2>
        <p className="text-lg mb-4">{status}</p>
        
        <div className="flex gap-4 mb-4">
          <button
            onClick={testApiConnection}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Test Health Endpoint
          </button>
          
          <button
            onClick={testBudgetsEndpoint}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Test Budgets Endpoint
          </button>
        </div>
        
        {error && (
          <div className="bg-red-50 border border-red-200 p-4 rounded mb-4">
            <h3 className="text-red-800 font-medium">Error:</h3>
            <p className="text-red-700">{error}</p>
          </div>
        )}
        
        {response && (
          <div className="bg-gray-50 p-4 rounded">
            <h3 className="font-medium mb-2">API Response:</h3>
            <pre className="text-sm overflow-auto">
              {JSON.stringify(response, null, 2)}
            </pre>
          </div>
        )}
      </div>
      
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Configuration</h2>
        <div className="space-y-2 text-sm">
          <p><strong>API Base URL:</strong> {import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}</p>
          <p><strong>Environment:</strong> {import.meta.env.VITE_ENV || 'development'}</p>
          <p><strong>Debug Mode:</strong> {import.meta.env.VITE_DEBUG || 'false'}</p>
        </div>
      </div>
    </div>
  );
};

export default ApiTest;
