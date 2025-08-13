import React, { useState, useEffect } from 'react';
import { X, Database, TestTube, AlertCircle, CheckCircle, Loader } from 'lucide-react';
import { DataConnection, DataSourceType, DataSourceConfig } from '../types/dataSource';
import { dataConnector } from '../utils/dataConnector';

interface DataSourceModalProps {
  isOpen: boolean;
  onClose: () => void;
  connection?: DataConnection | null;
  onSave: (connection: DataConnection) => void;
}

const DataSourceModal: React.FC<DataSourceModalProps> = ({
  isOpen,
  onClose,
  connection,
  onSave
}) => {
  const [formData, setFormData] = useState<{
    name: string;
    description: string;
    type: DataSourceType;
    config: DataSourceConfig;
    tags: string;
  }>({
    name: '',
    description: '',
    type: DataSourceType.ORACLE,
    config: {},
    tags: ''
  });

  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (connection) {
      setFormData({
        name: connection.name,
        description: connection.description || '',
        type: connection.type,
        config: { ...connection.config },
        tags: connection.tags?.join(', ') || ''
      });
    } else {
      resetForm();
    }
    setTestResult(null);
    setErrors({});
  }, [connection, isOpen]);

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      type: DataSourceType.ORACLE,
      config: {},
      tags: ''
    });
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleConfigChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      config: { ...prev.config, [field]: value }
    }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    // Type-specific validation
    switch (formData.type) {
      case DataSourceType.ORACLE:
        if (!formData.config.host) newErrors.host = 'Host is required';
        if (!formData.config.port) newErrors.port = 'Port is required';
        if (!formData.config.database) newErrors.database = 'Database is required';
        if (!formData.config.username) newErrors.username = 'Username is required';
        break;

      case DataSourceType.OLAP:
        if (!formData.config.host) newErrors.host = 'Host is required';
        if (!formData.config.cube) newErrors.cube = 'Cube name is required';
        break;

      case DataSourceType.SQL_SERVER:
      case DataSourceType.MYSQL:
      case DataSourceType.POSTGRESQL:
        if (!formData.config.host) newErrors.host = 'Host is required';
        if (!formData.config.database) newErrors.database = 'Database is required';
        if (!formData.config.username) newErrors.username = 'Username is required';
        break;

      case DataSourceType.REST_API:
        if (!formData.config.apiUrl) newErrors.apiUrl = 'API URL is required';
        break;

      case DataSourceType.POWER_BI:
        if (!formData.config.workspaceId) newErrors.workspaceId = 'Workspace ID is required';
        if (!formData.config.apiKey) newErrors.apiKey = 'API Key is required';
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleTestConnection = async () => {
    if (!validateForm()) return;

    setTesting(true);
    setTestResult(null);

    try {
      const success = await dataConnector.testConnection(formData.config, formData.type);
      setTestResult({
        success,
        message: success ? 'Connection test successful!' : 'Connection test failed. Please check your configuration.'
      });
    } catch (error) {
      setTestResult({
        success: false,
        message: 'Connection test failed. Please check your configuration.'
      });
    } finally {
      setTesting(false);
    }
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      const tagsArray = formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
      
      if (connection) {
        const updatedConnection = await dataConnector.updateConnection(connection.id, {
          name: formData.name,
          description: formData.description,
          type: formData.type,
          config: formData.config,
          tags: tagsArray
        });
        if (updatedConnection) {
          onSave(updatedConnection);
        }
      } else {
        const newConnection = await dataConnector.createConnection({
          name: formData.name,
          description: formData.description,
          type: formData.type,
          config: formData.config,
          tags: tagsArray,
          status: 'disconnected'
        });
        onSave(newConnection);
      }
    } catch (error) {
      console.error('Error saving connection:', error);
    }
  };

  const renderConfigFields = () => {
    switch (formData.type) {
      case DataSourceType.ORACLE:
        return (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Host *</label>
                <input
                  type="text"
                  value={formData.config.host || ''}
                  onChange={(e) => handleConfigChange('host', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.host ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="oracle.company.com"
                />
                {errors.host && <p className="text-red-500 text-xs mt-1">{errors.host}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Port *</label>
                <input
                  type="number"
                  value={formData.config.port || ''}
                  onChange={(e) => handleConfigChange('port', parseInt(e.target.value))}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.port ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="1521"
                />
                {errors.port && <p className="text-red-500 text-xs mt-1">{errors.port}</p>}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Database *</label>
              <input
                type="text"
                value={formData.config.database || ''}
                onChange={(e) => handleConfigChange('database', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.database ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="PRODDB"
              />
              {errors.database && <p className="text-red-500 text-xs mt-1">{errors.database}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Service Name</label>
                <input
                  type="text"
                  value={formData.config.serviceName || ''}
                  onChange={(e) => handleConfigChange('serviceName', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="PRODDB.company.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">SID</label>
                <input
                  type="text"
                  value={formData.config.sid || ''}
                  onChange={(e) => handleConfigChange('sid', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="PRODDB"
                />
              </div>
            </div>
          </>
        );

      case DataSourceType.OLAP:
        return (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Host *</label>
                <input
                  type="text"
                  value={formData.config.host || ''}
                  onChange={(e) => handleConfigChange('host', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.host ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="olap.company.com"
                />
                {errors.host && <p className="text-red-500 text-xs mt-1">{errors.host}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Port</label>
                <input
                  type="number"
                  value={formData.config.port || ''}
                  onChange={(e) => handleConfigChange('port', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="8080"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cube Name *</label>
              <input
                type="text"
                value={formData.config.cube || ''}
                onChange={(e) => handleConfigChange('cube', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.cube ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="SalesAnalytics"
              />
              {errors.cube && <p className="text-red-500 text-xs mt-1">{errors.cube}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Dimensions (comma-separated)</label>
              <input
                type="text"
                value={formData.config.dimensions?.join(', ') || ''}
                onChange={(e) => handleConfigChange('dimensions', e.target.value.split(',').map(d => d.trim()))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Time, Product, Customer, Geography"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Measures (comma-separated)</label>
              <input
                type="text"
                value={formData.config.measures?.join(', ') || ''}
                onChange={(e) => handleConfigChange('measures', e.target.value.split(',').map(m => m.trim()))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Sales Amount, Quantity, Profit Margin"
              />
            </div>
          </>
        );

      case DataSourceType.POWER_BI:
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">API URL</label>
              <input
                type="text"
                value={formData.config.apiUrl || 'https://api.powerbi.com/v1.0/myorg'}
                onChange={(e) => handleConfigChange('apiUrl', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://api.powerbi.com/v1.0/myorg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Workspace ID *</label>
              <input
                type="text"
                value={formData.config.workspaceId || ''}
                onChange={(e) => handleConfigChange('workspaceId', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.workspaceId ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="f089354e-8366-4e18-aea3-4cb4a3a50b48"
              />
              {errors.workspaceId && <p className="text-red-500 text-xs mt-1">{errors.workspaceId}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">API Key *</label>
              <input
                type="password"
                value={formData.config.apiKey || ''}
                onChange={(e) => handleConfigChange('apiKey', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.apiKey ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter your Power BI API key"
              />
              {errors.apiKey && <p className="text-red-500 text-xs mt-1">{errors.apiKey}</p>}
            </div>
          </>
        );

      case DataSourceType.REST_API:
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">API URL *</label>
              <input
                type="text"
                value={formData.config.apiUrl || ''}
                onChange={(e) => handleConfigChange('apiUrl', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.apiUrl ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="https://api.example.com/v1"
              />
              {errors.apiUrl && <p className="text-red-500 text-xs mt-1">{errors.apiUrl}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">API Key</label>
              <input
                type="password"
                value={formData.config.apiKey || ''}
                onChange={(e) => handleConfigChange('apiKey', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter API key if required"
              />
            </div>
          </>
        );

      default:
        return (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Host *</label>
              <input
                type="text"
                value={formData.config.host || ''}
                onChange={(e) => handleConfigChange('host', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.host ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="database.company.com"
              />
              {errors.host && <p className="text-red-500 text-xs mt-1">{errors.host}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Port</label>
              <input
                type="number"
                value={formData.config.port || ''}
                onChange={(e) => handleConfigChange('port', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="5432"
              />
            </div>
          </div>
        );
    }
  };

  const connectionTypes = dataConnector.getConnectionTypes();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <Database className="w-6 h-6 mr-2" />
            {connection ? 'Edit Data Source' : 'Add Data Source'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Basic Information</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="My Data Source"
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Description of this data source"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
              <select
                value={formData.type}
                onChange={(e) => handleInputChange('type', e.target.value as DataSourceType)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {connectionTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
              <input
                type="text"
                value={formData.tags}
                onChange={(e) => handleInputChange('tags', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="production, sales, critical (comma-separated)"
              />
            </div>
          </div>

          {/* Connection Configuration */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Connection Configuration</h3>
            {renderConfigFields()}
            
            {/* Common fields for database connections */}
            {[DataSourceType.ORACLE, DataSourceType.SQL_SERVER, DataSourceType.MYSQL, DataSourceType.POSTGRESQL].includes(formData.type) && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Username *</label>
                  <input
                    type="text"
                    value={formData.config.username || ''}
                    onChange={(e) => handleConfigChange('username', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.username ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="database_user"
                  />
                  {errors.username && <p className="text-red-500 text-xs mt-1">{errors.username}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                  <input
                    type="password"
                    value={formData.config.password || ''}
                    onChange={(e) => handleConfigChange('password', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter password"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Test Connection */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Test Connection</h3>
              <button
                onClick={handleTestConnection}
                disabled={testing}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                {testing ? (
                  <Loader className="w-4 h-4 animate-spin" />
                ) : (
                  <TestTube className="w-4 h-4" />
                )}
                <span>{testing ? 'Testing...' : 'Test Connection'}</span>
              </button>
            </div>

            {testResult && (
              <div className={`p-4 rounded-lg flex items-center space-x-2 ${
                testResult.success
                  ? 'bg-green-50 text-green-800 border border-green-200'
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}>
                {testResult.success ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  <AlertCircle className="w-5 h-5" />
                )}
                <span className="text-sm">{testResult.message}</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-end space-x-4 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            {connection ? 'Update' : 'Create'} Data Source
          </button>
        </div>
      </div>
    </div>
  );
};

export default DataSourceModal;
