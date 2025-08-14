import React, { useState } from 'react';
import { apiService } from '../lib/api';

interface ApiTestResult {
  endpoint: string;
  status: 'success' | 'error' | 'loading';
  data?: any;
  error?: string;
}

const ApiTestComponent: React.FC = () => {
  const [results, setResults] = useState<ApiTestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const testEndpoints = [
    { name: 'Health Check', endpoint: '/health/', method: 'GET' },
    { name: 'Auth Login', endpoint: '/auth/login/', method: 'POST', data: { email: 'admin@example.com', password: 'password' } },
    { name: 'Budget List', endpoint: '/budgets/', method: 'GET' },
    { name: 'Forecast List', endpoint: '/forecasts/', method: 'GET' },
  ];

  const runTests = async () => {
    setIsRunning(true);
    setResults([]);
    
    for (const test of testEndpoints) {
      const result: ApiTestResult = {
        endpoint: test.name,
        status: 'loading'
      };
      
      setResults(prev => [...prev, result]);
      
      try {
        let response;
        
        if (test.method === 'POST' && test.data) {
          response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}${test.endpoint}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(test.data)
          });
        } else {
          response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}${test.endpoint}`);
        }
        
        const data = await response.json();
        
        setResults(prev => prev.map(r => 
          r.endpoint === test.name 
            ? { ...r, status: response.ok ? 'success' : 'error', data: response.ok ? data : undefined, error: response.ok ? undefined : data.message || 'Request failed' }
            : r
        ));
      } catch (error) {
        setResults(prev => prev.map(r => 
          r.endpoint === test.name 
            ? { ...r, status: 'error', error: error instanceof Error ? error.message : 'Unknown error' }
            : r
        ));
      }
    }
    
    setIsRunning(false);
  };

  const getStatusColor = (status: ApiTestResult['status']) => {
    switch (status) {
      case 'success': return 'text-green-600';
      case 'error': return 'text-red-600';
      case 'loading': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: ApiTestResult['status']) => {
    switch (status) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'loading': return '⏳';
      default: return '⚪';
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-xl font-bold mb-4">Backend-Frontend API Integration Test</h2>
      
      <button
        onClick={runTests}
        disabled={isRunning}
        className="mb-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
      >
        {isRunning ? 'Running Tests...' : 'Run API Tests'}
      </button>
      
      <div className="space-y-3">
        {results.map((result, index) => (
          <div key={index} className="border rounded p-3">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">{getStatusIcon(result.status)}</span>
              <span className="font-medium">{result.endpoint}</span>
              <span className={`text-sm ${getStatusColor(result.status)}`}>
                ({result.status})
              </span>
            </div>
            
            {result.error && (
              <div className="text-red-600 text-sm bg-red-50 p-2 rounded">
                Error: {result.error}
              </div>
            )}
            
            {result.data && (
              <details className="text-sm">
                <summary className="cursor-pointer text-blue-600">View Response Data</summary>
                <pre className="mt-2 bg-gray-100 p-2 rounded text-xs overflow-auto">
                  {JSON.stringify(result.data, null, 2)}
                </pre>
              </details>
            )}
          </div>
        ))}
      </div>
      
      {results.length === 0 && !isRunning && (
        <p className="text-gray-500 text-center">Click "Run API Tests" to test backend connectivity</p>
      )}
    </div>
  );
};

export default ApiTestComponent;
