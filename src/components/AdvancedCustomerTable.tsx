import React, { useState, useEffect } from 'react';
import { Edit, Save, X, Plus, Eye, TrendingUp, BarChart3 } from 'lucide-react';
import { Customer, Item, CustomerItemForecast } from '../types/forecast';
import { formatCurrency, getConfidenceColor } from '../utils/budgetCalculations';

interface AdvancedCustomerTableProps {
  customers: Customer[];
  items: Item[];
  customerForecasts: CustomerItemForecast[];
  onUpdateCustomer: (customer: Customer) => void;
  onCreateForecast: (customer: Customer) => void;
  onViewCustomerDetails: (customer: Customer) => void;
  selectedYear: number;
}

const AdvancedCustomerTable: React.FC<AdvancedCustomerTableProps> = ({
  customers,
  items,
  customerForecasts,
  onUpdateCustomer,
  onCreateForecast,
  onViewCustomerDetails,
  selectedYear
}) => {
  const [editingCustomerId, setEditingCustomerId] = useState<string | null>(null);
  const [editedCustomer, setEditedCustomer] = useState<Customer | null>(null);
  const [sortField, setSortField] = useState<keyof Customer>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const handleSort = (field: keyof Customer) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedCustomers = [...customers].sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];
    
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortDirection === 'asc' 
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }
    
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
    }
    
    return 0;
  });

  const getCustomerForecastSummary = (customerId: string) => {
    const forecasts = customerForecasts.filter(f => f.customerId === customerId);
    const totalValue = forecasts.reduce((sum, f) => sum + f.yearlyTotal, 0);
    const avgConfidence = forecasts.length > 0 ? 
      forecasts.reduce((sum, f) => {
        const confidenceValue = f.confidence === 'high' ? 3 : f.confidence === 'medium' ? 2 : 1;
        return sum + confidenceValue;
      }, 0) / forecasts.length : 0;
    
    return {
      totalValue,
      forecastCount: forecasts.length,
      avgConfidence: avgConfidence * 33.33
    };
  };

  const handleEdit = (customer: Customer) => {
    setEditingCustomerId(customer.id);
    setEditedCustomer({ ...customer });
  };

  const handleSave = () => {
    if (editedCustomer) {
      onUpdateCustomer(editedCustomer);
      setEditingCustomerId(null);
      setEditedCustomer(null);
    }
  };

  const handleCancel = () => {
    setEditingCustomerId(null);
    setEditedCustomer(null);
  };

  const handleFieldChange = (field: keyof Customer, value: any) => {
    if (editedCustomer) {
      setEditedCustomer({ ...editedCustomer, [field]: value });
    }
  };

  const SortableHeader = ({ field, children }: { field: keyof Customer; children: React.ReactNode }) => (
    <th 
      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center space-x-1">
        <span>{children}</span>
        {sortField === field && (
          <span className="text-blue-600">
            {sortDirection === 'asc' ? '↑' : '↓'}
          </span>
        )}
      </div>
    </th>
  );

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Customer Management Table</h3>
        <p className="text-sm text-gray-600 mt-1">
          Manage customer data and create forecasts. Click on any cell to edit customer information.
        </p>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <SortableHeader field="name">Customer</SortableHeader>
              <SortableHeader field="code">Code</SortableHeader>
              <SortableHeader field="region">Region</SortableHeader>
              <SortableHeader field="segment">Segment</SortableHeader>
              <SortableHeader field="tier">Tier</SortableHeader>
              <SortableHeader field="seasonality">Seasonality</SortableHeader>
              <SortableHeader field="manager">Manager</SortableHeader>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Channels</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Forecast Summary</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedCustomers.map((customer) => {
              const isEditing = editingCustomerId === customer.id;
              const summary = getCustomerForecastSummary(customer.id);
              const currentCustomer = isEditing ? editedCustomer! : customer;
              
              return (
                <tr key={customer.id} className="hover:bg-gray-50 transition-colors">
                  {/* Customer Name */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    {isEditing ? (
                      <input
                        type="text"
                        value={currentCustomer.name}
                        onChange={(e) => handleFieldChange('name', e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      <div>
                        <div className="text-sm font-medium text-gray-900">{customer.name}</div>
                        <div className="text-sm text-gray-500">{customer.email}</div>
                      </div>
                    )}
                  </td>
                  
                  {/* Customer Code */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    {isEditing ? (
                      <input
                        type="text"
                        value={currentCustomer.code}
                        onChange={(e) => handleFieldChange('code', e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      <span className="text-sm text-gray-900">{customer.code}</span>
                    )}
                  </td>
                  
                  {/* Region */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    {isEditing ? (
                      <select
                        value={currentCustomer.region}
                        onChange={(e) => handleFieldChange('region', e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="North America">North America</option>
                        <option value="Europe">Europe</option>
                        <option value="Asia Pacific">Asia Pacific</option>
                        <option value="Latin America">Latin America</option>
                        <option value="Middle East & Africa">Middle East & Africa</option>
                      </select>
                    ) : (
                      <span className="text-sm text-gray-900">{customer.region}</span>
                    )}
                  </td>
                  
                  {/* Segment */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    {isEditing ? (
                      <select
                        value={currentCustomer.segment}
                        onChange={(e) => handleFieldChange('segment', e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="Enterprise">Enterprise</option>
                        <option value="SMB">SMB</option>
                        <option value="Government">Government</option>
                        <option value="Education">Education</option>
                      </select>
                    ) : (
                      <span className="text-sm text-gray-900">{customer.segment}</span>
                    )}
                  </td>
                  
                  {/* Tier */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    {isEditing ? (
                      <select
                        value={currentCustomer.tier}
                        onChange={(e) => handleFieldChange('tier', e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="platinum">Platinum</option>
                        <option value="gold">Gold</option>
                        <option value="silver">Silver</option>
                        <option value="bronze">Bronze</option>
                      </select>
                    ) : (
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        customer.tier === 'platinum' ? 'bg-purple-100 text-purple-800' :
                        customer.tier === 'gold' ? 'bg-yellow-100 text-yellow-800' :
                        customer.tier === 'silver' ? 'bg-gray-100 text-gray-800' :
                        'bg-orange-100 text-orange-800'
                      }`}>
                        {customer.tier}
                      </span>
                    )}
                  </td>
                  
                  {/* Seasonality */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    {isEditing ? (
                      <select
                        value={currentCustomer.seasonality}
                        onChange={(e) => handleFieldChange('seasonality', e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="high">High</option>
                        <option value="medium">Medium</option>
                        <option value="low">Low</option>
                      </select>
                    ) : (
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        customer.seasonality === 'high' ? 'bg-red-100 text-red-800' :
                        customer.seasonality === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {customer.seasonality}
                      </span>
                    )}
                  </td>
                  
                  {/* Manager */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    {isEditing ? (
                      <input
                        type="text"
                        value={currentCustomer.manager}
                        onChange={(e) => handleFieldChange('manager', e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      <span className="text-sm text-gray-900">{customer.manager}</span>
                    )}
                  </td>
                  
                  {/* Channels */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-wrap gap-1">
                      {customer.channels.slice(0, 2).map((channel, index) => (
                        <span key={index} className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {channel}
                        </span>
                      ))}
                      {customer.channels.length > 2 && (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          +{customer.channels.length - 2}
                        </span>
                      )}
                    </div>
                  </td>
                  
                  {/* Forecast Summary */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm">
                      <div className="font-medium text-gray-900">{formatCurrency(summary.totalValue)}</div>
                      <div className="text-gray-500">{summary.forecastCount} forecasts</div>
                      <div className="flex items-center mt-1">
                        <div className="w-full bg-gray-200 rounded-full h-2 mr-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${Math.min(100, summary.avgConfidence)}%` }}
                          ></div>
                        </div>
                        <span className="text-xs text-gray-600">{Math.round(summary.avgConfidence)}%</span>
                      </div>
                    </div>
                  </td>
                  
                  {/* Actions */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      {isEditing ? (
                        <>
                          <button
                            onClick={handleSave}
                            className="text-green-600 hover:text-green-900"
                            title="Save changes"
                          >
                            <Save className="w-4 h-4" />
                          </button>
                          <button
                            onClick={handleCancel}
                            className="text-gray-600 hover:text-gray-900"
                            title="Cancel editing"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => handleEdit(customer)}
                            className="text-blue-600 hover:text-blue-900"
                            title="Edit customer"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onCreateForecast(customer)}
                            className="text-green-600 hover:text-green-900"
                            title="Create forecast"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onViewCustomerDetails(customer)}
                            className="text-purple-600 hover:text-purple-900"
                            title="View details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      
      {/* Table Footer */}
      <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>Showing {customers.length} customers</span>
          <span>Total forecast value: {formatCurrency(customers.reduce((sum, customer) => {
            const summary = getCustomerForecastSummary(customer.id);
            return sum + summary.totalValue;
          }, 0))}</span>
        </div>
      </div>
    </div>
  );
};

export default AdvancedCustomerTable;
