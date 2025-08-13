import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import {
  Database,
  Plus,
  Settings,
  RefreshCw,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Download,
  Upload,
  Search,
  Filter,
  MoreVertical,
  Activity,
  Server,
  Link,
  BarChart3
} from 'lucide-react';
import { DataConnection, DataSourceType } from '../types/dataSource';
import { dataConnector } from '../utils/dataConnector';
import { budgetDataIntegration } from '../utils/budgetDataIntegration';
import DataSourceModal from '../components/DataSourceModal';
import SchemaExplorer from '../components/SchemaExplorer';

const DataSources: React.FC = () => {
  const [connections, setConnections] = useState<DataConnection[]>([]);
  const [filteredConnections, setFilteredConnections] = useState<DataConnection[]>([]);
  const [selectedConnection, setSelectedConnection] = useState<DataConnection | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSchemaExplorerOpen, setIsSchemaExplorerOpen] = useState(false);
  const [editingConnection, setEditingConnection] = useState<DataConnection | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<DataSourceType | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'connected' | 'disconnected' | 'error'>('all');
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null);

  useEffect(() => {
    loadConnections();
  }, []);

  useEffect(() => {
    filterConnections();
  }, [connections, searchTerm, typeFilter, statusFilter]);

  const loadConnections = async () => {
    setLoading(true);
    try {
      const allConnections = dataConnector.getAllConnections();
      setConnections(allConnections);
    } catch (error) {
      showNotification('Failed to load data sources', 'error');
    } finally {
      setLoading(false);
    }
  };

  const filterConnections = () => {
    let filtered = connections;

    if (searchTerm) {
      filtered = filtered.filter(conn =>
        conn.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        conn.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        conn.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(conn => conn.type === typeFilter);
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(conn => conn.status === statusFilter);
    }

    setFilteredConnections(filtered);
  };

  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleCreateConnection = () => {
    setEditingConnection(null);
    setIsModalOpen(true);
  };

  const handleEditConnection = (connection: DataConnection) => {
    setEditingConnection(connection);
    setIsModalOpen(true);
  };

  const handleDeleteConnection = async (connectionId: string) => {
    if (!confirm('Are you sure you want to delete this data source?')) return;

    try {
      await dataConnector.deleteConnection(connectionId);
      setConnections(prev => prev.filter(conn => conn.id !== connectionId));
      showNotification('Data source deleted successfully', 'success');
    } catch (error) {
      showNotification('Failed to delete data source', 'error');
    }
  };

  const handleTestConnection = async (connectionId: string) => {
    const connection = connections.find(c => c.id === connectionId);
    if (!connection) return;

    setLoading(true);
    try {
      const isValid = await dataConnector.testConnection(connection.config, connection.type);
      const status = isValid ? 'connected' : 'error';
      
      await dataConnector.updateConnection(connectionId, { status });
      setConnections(prev => prev.map(conn => 
        conn.id === connectionId ? { ...conn, status } : conn
      ));
      
      showNotification(
        isValid ? 'Connection test successful' : 'Connection test failed',
        isValid ? 'success' : 'error'
      );
    } catch (error) {
      showNotification('Connection test failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSyncData = async (connectionId: string) => {
    setLoading(true);
    try {
      const success = await dataConnector.syncData(connectionId);
      if (success) {
        setConnections(prev => prev.map(conn => 
          conn.id === connectionId ? { ...conn, lastSync: new Date().toISOString() } : conn
        ));
        showNotification('Data sync completed successfully', 'success');
      } else {
        showNotification('Data sync failed', 'error');
      }
    } catch (error) {
      showNotification('Data sync failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleViewSchema = (connection: DataConnection) => {
    setSelectedConnection(connection);
    setIsSchemaExplorerOpen(true);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'disconnected':
        return <XCircle className="w-5 h-5 text-gray-400" />;
      case 'error':
        return <AlertTriangle className="w-5 h-5 text-red-600" />;
      case 'connecting':
        return <RefreshCw className="w-5 h-5 text-blue-600 animate-spin" />;
      default:
        return <XCircle className="w-5 h-5 text-gray-400" />;
    }
  };

  const getTypeIcon = (type: DataSourceType) => {
    switch (type) {
      case DataSourceType.ORACLE:
      case DataSourceType.SQL_SERVER:
      case DataSourceType.MYSQL:
      case DataSourceType.POSTGRESQL:
        return <Database className="w-5 h-5" />;
      case DataSourceType.OLAP:
        return <BarChart3 className="w-5 h-5" />;
      case DataSourceType.REST_API:
        return <Link className="w-5 h-5" />;
      default:
        return <Server className="w-5 h-5" />;
    }
  };

  const getTypeLabel = (type: DataSourceType) => {
    return dataConnector.getConnectionTypes().find(t => t.value === type)?.label || type;
  };

  const connectionTypes = dataConnector.getConnectionTypes();

  return (
    <Layout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-2xl font-bold text-gray-900 mb-2">
              <span className="text-gray-500 font-light">BI Tools /</span> Data Sources
            </h4>
            <p className="text-gray-600 text-sm">
              Manage connections to external data sources including OLAP, Oracle, and other BI tools
            </p>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => {
                const budgetData = budgetDataIntegration.exportBudgetData();
                const blob = new Blob([JSON.stringify(budgetData, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `budget-export-${new Date().toISOString().split('T')[0]}.json`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                showNotification('Budget data exported successfully', 'success');
              }}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Export Budget</span>
            </button>
            <button
              onClick={loadConnections}
              disabled={loading}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
            <button
              onClick={handleCreateConnection}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add Data Source</span>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 p-3 rounded-lg bg-blue-100">
                <Database className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-gray-600">Total Sources</p>
                <p className="text-2xl font-semibold text-gray-900">{connections.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 p-3 rounded-lg bg-green-100">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-gray-600">Connected</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {connections.filter(c => c.status === 'connected').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 p-3 rounded-lg bg-yellow-100">
                <Activity className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-gray-600">Active Syncs</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {connections.filter(c => c.status === 'connected').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 p-3 rounded-lg bg-red-100">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-gray-600">Errors</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {connections.filter(c => c.status === 'error').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Search data sources..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as DataSourceType | 'all')}
              >
                <option value="all">All Types</option>
                {connectionTypes.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
              >
                <option value="all">All Status</option>
                <option value="connected">Connected</option>
                <option value="disconnected">Disconnected</option>
                <option value="error">Error</option>
              </select>
            </div>
          </div>
        </div>

        {/* Data Sources Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data Source
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Sync
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredConnections.map((connection) => (
                  <tr key={connection.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 p-2 bg-gray-100 rounded-lg mr-3">
                          {getTypeIcon(connection.type)}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{connection.name}</div>
                          <div className="text-sm text-gray-500 max-w-xs truncate">
                            {connection.description}
                          </div>
                          {connection.tags && connection.tags.length > 0 && (
                            <div className="flex space-x-1 mt-1">
                              {connection.tags.slice(0, 3).map(tag => (
                                <span key={tag} className="inline-flex px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                                  {tag}
                                </span>
                              ))}
                              {connection.tags.length > 3 && (
                                <span className="text-xs text-gray-500">+{connection.tags.length - 3} more</span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-3 py-1 text-sm bg-gray-100 text-gray-800 rounded-full">
                        {getTypeLabel(connection.type)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getStatusIcon(connection.status)}
                        <span className={`ml-2 text-sm font-medium ${
                          connection.status === 'connected' ? 'text-green-600' :
                          connection.status === 'error' ? 'text-red-600' :
                          connection.status === 'connecting' ? 'text-blue-600' :
                          'text-gray-500'
                        }`}>
                          {connection.status.charAt(0).toUpperCase() + connection.status.slice(1)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(connection.lastSync).toLocaleDateString()} {new Date(connection.lastSync).toLocaleTimeString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleTestConnection(connection.id)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Test Connection"
                        >
                          <RefreshCw className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleViewSchema(connection)}
                          className="text-green-600 hover:text-green-900"
                          title="View Schema"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleSyncData(connection.id)}
                          className="text-purple-600 hover:text-purple-900"
                          title="Sync Data"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEditConnection(connection)}
                          className="text-gray-600 hover:text-gray-900"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteConnection(connection.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {filteredConnections.length === 0 && (
              <div className="text-center py-12">
                <Database className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No data sources found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {searchTerm || typeFilter !== 'all' || statusFilter !== 'all'
                    ? 'Try adjusting your filters'
                    : 'Get started by adding your first data source.'
                  }
                </p>
                {!searchTerm && typeFilter === 'all' && statusFilter === 'all' && (
                  <div className="mt-6">
                    <button
                      onClick={handleCreateConnection}
                      className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Data Source
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Notification Toast */}
        {notification && (
          <div className={`fixed top-4 right-4 z-50 px-4 py-2 rounded-lg shadow-lg transition-all duration-300 ${
            notification.type === 'success'
              ? 'bg-green-600 text-white'
              : 'bg-red-600 text-white'
          }`}>
            {notification.message}
          </div>
        )}

        {/* Data Source Modal */}
        <DataSourceModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingConnection(null);
          }}
          connection={editingConnection}
          onSave={(connection) => {
            if (editingConnection) {
              setConnections(prev => prev.map(conn => 
                conn.id === editingConnection.id ? connection : conn
              ));
              showNotification('Data source updated successfully', 'success');
            } else {
              setConnections(prev => [...prev, connection]);
              showNotification('Data source created successfully', 'success');
            }
            setIsModalOpen(false);
            setEditingConnection(null);
          }}
        />

        {/* Schema Explorer Modal */}
        <SchemaExplorer
          isOpen={isSchemaExplorerOpen}
          onClose={() => {
            setIsSchemaExplorerOpen(false);
            setSelectedConnection(null);
          }}
          connection={selectedConnection}
        />
      </div>
    </Layout>
  );
};

export default DataSources;
