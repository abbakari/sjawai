import React, { useState, useEffect } from 'react';
import { X, Database, Table, Key, Link, Eye, Search, Download, Columns, Info } from 'lucide-react';
import { DataConnection, DataSchema, DataTable, DataColumn } from '../types/dataSource';
import { dataConnector } from '../utils/dataConnector';

interface SchemaExplorerProps {
  isOpen: boolean;
  onClose: () => void;
  connection: DataConnection | null;
}

const SchemaExplorer: React.FC<SchemaExplorerProps> = ({
  isOpen,
  onClose,
  connection
}) => {
  const [schema, setSchema] = useState<DataSchema | null>(null);
  const [selectedTable, setSelectedTable] = useState<DataTable | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'tables' | 'relationships' | 'metadata'>('tables');

  useEffect(() => {
    if (isOpen && connection) {
      loadSchema();
    }
  }, [isOpen, connection]);

  const loadSchema = async () => {
    if (!connection) return;

    setLoading(true);
    setError(null);
    
    try {
      const schemaData = await dataConnector.getSchema(connection.id);
      setSchema(schemaData);
      if (schemaData.tables.length > 0) {
        setSelectedTable(schemaData.tables[0]);
      }
    } catch (err) {
      setError('Failed to load schema information');
      console.error('Schema loading error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getDataTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'string':
      case 'varchar':
      case 'text':
        return '📝';
      case 'integer':
      case 'int':
      case 'number':
        return '🔢';
      case 'decimal':
      case 'float':
        return '💰';
      case 'boolean':
        return '✅';
      case 'date':
      case 'datetime':
      case 'timestamp':
        return '📅';
      case 'json':
        return '📊';
      default:
        return '📄';
    }
  };

  const getTableIcon = (tableName: string) => {
    const name = tableName.toLowerCase();
    if (name.includes('sales') || name.includes('order')) return '💰';
    if (name.includes('customer') || name.includes('user')) return '👥';
    if (name.includes('product') || name.includes('item')) return '📦';
    if (name.includes('log') || name.includes('audit')) return '📋';
    return '📊';
  };

  const filteredTables = schema?.tables.filter(table =>
    table.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    table.description?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gray-50">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <Database className="w-6 h-6 mr-2" />
            Schema Explorer - {connection?.name}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading schema information...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="text-center">
              <div className="text-red-500 text-6xl mb-4">⚠️</div>
              <p className="text-red-600 font-medium">{error}</p>
              <button
                onClick={loadSchema}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {/* Content */}
        {!loading && !error && schema && (
          <div className="flex-1 flex overflow-hidden">
            {/* Sidebar */}
            <div className="w-1/3 border-r border-gray-200 bg-gray-50 flex flex-col">
              {/* Tabs */}
              <div className="flex border-b border-gray-200">
                <button
                  onClick={() => setActiveTab('tables')}
                  className={`flex-1 px-4 py-3 text-sm font-medium ${
                    activeTab === 'tables'
                      ? 'border-b-2 border-blue-500 text-blue-600 bg-white'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Tables ({schema.tables.length})
                </button>
                <button
                  onClick={() => setActiveTab('relationships')}
                  className={`flex-1 px-4 py-3 text-sm font-medium ${
                    activeTab === 'relationships'
                      ? 'border-b-2 border-blue-500 text-blue-600 bg-white'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Relations ({schema.relationships.length})
                </button>
                <button
                  onClick={() => setActiveTab('metadata')}
                  className={`flex-1 px-4 py-3 text-sm font-medium ${
                    activeTab === 'metadata'
                      ? 'border-b-2 border-blue-500 text-blue-600 bg-white'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Info
                </button>
              </div>

              {/* Tables Tab */}
              {activeTab === 'tables' && (
                <div className="flex-1 overflow-hidden flex flex-col">
                  {/* Search */}
                  <div className="p-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="text"
                        placeholder="Search tables..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  {/* Tables List */}
                  <div className="flex-1 overflow-y-auto">
                    {filteredTables.map((table) => (
                      <div
                        key={table.name}
                        onClick={() => setSelectedTable(table)}
                        className={`p-4 cursor-pointer border-b border-gray-200 hover:bg-gray-100 ${
                          selectedTable?.name === table.name ? 'bg-blue-50 border-blue-200' : ''
                        }`}
                      >
                        <div className="flex items-start">
                          <span className="text-lg mr-3">{getTableIcon(table.name)}</span>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium text-gray-900">{table.name}</h4>
                              {table.primaryKey && (
                                <Key className="w-4 h-4 text-yellow-500" title="Has Primary Key" />
                              )}
                            </div>
                            {table.schema && (
                              <p className="text-xs text-gray-500">{table.schema}</p>
                            )}
                            <p className="text-sm text-gray-600 mt-1">
                              {table.columns.length} columns
                              {table.rowCount && ` • ${table.rowCount.toLocaleString()} rows`}
                            </p>
                            {table.description && (
                              <p className="text-xs text-gray-500 mt-1 truncate">
                                {table.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Relationships Tab */}
              {activeTab === 'relationships' && (
                <div className="flex-1 overflow-y-auto p-4">
                  {schema.relationships.length === 0 ? (
                    <div className="text-center text-gray-500 mt-8">
                      <Link className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No relationships found</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {schema.relationships.map((rel, index) => (
                        <div key={index} className="bg-white p-4 rounded-lg border border-gray-200">
                          <h4 className="font-medium text-gray-900 mb-2">{rel.name}</h4>
                          <div className="text-sm text-gray-600 space-y-1">
                            <div className="flex items-center">
                              <span className="font-medium">{rel.fromTable}</span>
                              <span className="mx-2">.</span>
                              <span className="text-blue-600">{rel.fromColumn}</span>
                            </div>
                            <div className="text-center text-gray-400">↓</div>
                            <div className="flex items-center">
                              <span className="font-medium">{rel.toTable}</span>
                              <span className="mx-2">.</span>
                              <span className="text-blue-600">{rel.toColumn}</span>
                            </div>
                            <div className="mt-2">
                              <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                                {rel.type.replace('_', ' ')}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Metadata Tab */}
              {activeTab === 'metadata' && (
                <div className="flex-1 overflow-y-auto p-4">
                  <div className="bg-white p-4 rounded-lg border border-gray-200 space-y-4">
                    <h4 className="font-medium text-gray-900 flex items-center">
                      <Info className="w-4 h-4 mr-2" />
                      Schema Information
                    </h4>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Data Source Type:</span>
                        <span className="font-medium">{schema.metadata.dataSourceType}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Version:</span>
                        <span className="font-medium">{schema.metadata.version}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Tables:</span>
                        <span className="font-medium">{schema.metadata.totalTables}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Columns:</span>
                        <span className="font-medium">{schema.metadata.totalColumns}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Last Refresh:</span>
                        <span className="font-medium">
                          {new Date(schema.metadata.lastRefresh).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
              {selectedTable ? (
                <>
                  {/* Table Header */}
                  <div className="p-6 border-b border-gray-200 bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                          <span className="text-xl mr-2">{getTableIcon(selectedTable.name)}</span>
                          {selectedTable.name}
                        </h3>
                        {selectedTable.description && (
                          <p className="text-sm text-gray-600 mt-1">{selectedTable.description}</p>
                        )}
                        <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                          <span>{selectedTable.columns.length} columns</span>
                          {selectedTable.rowCount && (
                            <span>{selectedTable.rowCount.toLocaleString()} rows</span>
                          )}
                          {selectedTable.lastUpdated && (
                            <span>Updated: {new Date(selectedTable.lastUpdated).toLocaleDateString()}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button className="flex items-center space-x-2 px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50">
                          <Eye className="w-4 h-4" />
                          <span>Preview Data</span>
                        </button>
                        <button className="flex items-center space-x-2 px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50">
                          <Download className="w-4 h-4" />
                          <span>Export</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Columns Table */}
                  <div className="flex-1 overflow-y-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 sticky top-0">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Column
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Type
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Nullable
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Default
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Description
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {selectedTable.columns.map((column, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <span className="mr-2">{getDataTypeIcon(column.type)}</span>
                                <div>
                                  <div className="flex items-center">
                                    <span className="text-sm font-medium text-gray-900">
                                      {column.name}
                                    </span>
                                    {selectedTable.primaryKey?.includes(column.name) && (
                                      <Key className="w-4 h-4 text-yellow-500 ml-2" title="Primary Key" />
                                    )}
                                  </div>
                                  {column.businessName && (
                                    <div className="text-xs text-gray-500">{column.businessName}</div>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="inline-flex px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded">
                                {column.type}
                                {column.precision && column.scale && (
                                  <span>({column.precision},{column.scale})</span>
                                )}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs rounded ${
                                column.nullable
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-green-100 text-green-800'
                              }`}>
                                {column.nullable ? 'Yes' : 'No'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {column.defaultValue !== undefined ? (
                                <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                                  {String(column.defaultValue)}
                                </code>
                              ) : (
                                <span className="text-gray-400">-</span>
                              )}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500">
                              {column.description || (
                                <span className="text-gray-400">-</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <Table className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Select a table to view its structure</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        {!loading && !error && schema && (
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>
                Schema contains {schema.tables.length} tables with {schema.metadata.totalColumns} total columns
              </span>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SchemaExplorer;
