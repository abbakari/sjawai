import React, { useState, useEffect } from 'react';
import { X, Eye, Filter, Download, Users, Calendar, TrendingUp, Package } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import DataPersistenceManager, { SavedBudgetData, SavedForecastData } from '../utils/dataPersistence';
import CustomerForecastModal from './CustomerForecastModal';
import {
  generateAvailableYears,
  getDefaultYearSelection,
  getYearValue,
  getCurrentYear
} from '../utils/dynamicYearUtils';

interface ManagerDataViewProps {
  isOpen: boolean;
  onClose: () => void;
}

const ManagerDataView: React.FC<ManagerDataViewProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();

  // Dynamic year state
  const availableYears = generateAvailableYears();
  const defaultYears = getDefaultYearSelection();
  const [selectedBaseYear, setSelectedBaseYear] = useState(defaultYears.baseYear);
  const [selectedTargetYear, setSelectedTargetYear] = useState(defaultYears.targetYear);

  const [budgetData, setBudgetData] = useState<SavedBudgetData[]>([]);
  const [forecastData, setForecastData] = useState<SavedForecastData[]>([]);
  const [activeTab, setActiveTab] = useState<'budget' | 'forecast' | 'summary'>('summary');
  const [selectedSalesman, setSelectedSalesman] = useState<string>('all');
  const [selectedCustomer, setSelectedCustomer] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Customer forecast modal state
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [selectedCustomerForModal, setSelectedCustomerForModal] = useState<string>('');
  const [modalViewType, setModalViewType] = useState<'sales_budget' | 'rolling_forecast'>('sales_budget');

  useEffect(() => {
    if (isOpen) {
      loadData();
      const interval = setInterval(loadData, 10000); // Refresh every 10 seconds
      return () => clearInterval(interval);
    }
  }, [isOpen]);

  const loadData = () => {
    const budget = DataPersistenceManager.getSalesBudgetData();
    const forecast = DataPersistenceManager.getRollingForecastData();
    setBudgetData(budget);
    setForecastData(forecast);
  };

  // Filter data based on selected filters
  const filteredBudgetData = budgetData.filter(item => {
    return (
      (selectedSalesman === 'all' || item.createdBy === selectedSalesman) &&
      (selectedCustomer === 'all' || item.customer.toLowerCase().includes(selectedCustomer.toLowerCase())) &&
      (selectedStatus === 'all' || item.status === selectedStatus) &&
      (searchTerm === '' || 
        item.item.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.customer.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  });

  const filteredForecastData = forecastData.filter(item => {
    return (
      (selectedSalesman === 'all' || item.createdBy === selectedSalesman) &&
      (selectedCustomer === 'all' || item.customer.toLowerCase().includes(selectedCustomer.toLowerCase())) &&
      (selectedStatus === 'all' || item.status === selectedStatus) &&
      (searchTerm === '' || 
        item.item.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.customer.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  });

  // Get unique values for filters
  const allSalesmen = [...new Set([...budgetData.map(d => d.createdBy), ...forecastData.map(d => d.createdBy)])];
  const allCustomers = [...new Set([...budgetData.map(d => d.customer), ...forecastData.map(d => d.customer)])];

  // Calculate summary statistics
  const summaryStats = {
    totalBudgetItems: budgetData.length,
    totalForecastItems: forecastData.length,
    totalBudgetValue: budgetData.reduce((sum, item) => sum + item.budgetValue2026, 0),
    totalForecastValue: forecastData.reduce((sum, item) => sum + (item.forecastTotal * 100), 0),
    activeSalesmen: allSalesmen.length,
    activeCustomers: allCustomers.length,
    recentActivity: [...budgetData, ...forecastData].sort((a, b) => 
      new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime()
    ).slice(0, 5)
  };

  const handleViewCustomerBreakdown = (customer: string, type: 'sales_budget' | 'rolling_forecast') => {
    setSelectedCustomerForModal(customer);
    setModalViewType(type);
    setIsCustomerModalOpen(true);
  };

  // Generate customer forecast data for modal
  const generateCustomerForecastData = (customerName: string, type: 'sales_budget' | 'rolling_forecast') => {
    const customerData = type === 'sales_budget' 
      ? filteredBudgetData.filter(item => item.customer === customerName)
      : filteredForecastData.filter(item => item.customer === customerName);

    if (customerData.length === 0) return null;

    let totalBudgetValue = 0;
    let totalActualValue = 0;
    let totalForecastValue = 0;
    let totalBudgetUnits = 0;
    let totalActualUnits = 0;
    let totalForecastUnits = 0;

    if (type === 'sales_budget') {
      const budgetItems = customerData as SavedBudgetData[];
      totalBudgetValue = budgetItems.reduce((sum, item) => sum + item.budget2025, 0);
      totalActualValue = budgetItems.reduce((sum, item) => sum + item.actual2025, 0);
      totalForecastValue = budgetItems.reduce((sum, item) => sum + item.budgetValue2026, 0);
      totalBudgetUnits = budgetItems.reduce((sum, item) => sum + Math.floor(item.budget2025 / (item.rate || 1)), 0);
      totalActualUnits = budgetItems.reduce((sum, item) => sum + Math.floor(item.actual2025 / (item.rate || 1)), 0);
      totalForecastUnits = budgetItems.reduce((sum, item) => sum + item.budget2026, 0);
    } else {
      const forecastItems = customerData as SavedForecastData[];
      totalForecastValue = forecastItems.reduce((sum, item) => sum + item.forecastTotal * 100, 0);
      totalForecastUnits = forecastItems.reduce((sum, item) => sum + item.forecastTotal, 0);
      if (forecastItems[0]?.budgetData) {
        totalBudgetValue = forecastItems.reduce((sum, item) => sum + (item.budgetData?.bud25 || 0) * 100, 0);
        totalActualValue = forecastItems.reduce((sum, item) => sum + (item.budgetData?.ytd25 || 0) * 100, 0);
        totalBudgetUnits = forecastItems.reduce((sum, item) => sum + (item.budgetData?.bud25 || 0), 0);
        totalActualUnits = forecastItems.reduce((sum, item) => sum + (item.budgetData?.ytd25 || 0), 0);
      }
    }

    // Generate mock monthly data
    const monthlyData = Array.from({ length: 12 }, (_, i) => {
      const month = new Date(2025, i).toLocaleDateString('en', { month: 'short' });
      return {
        month,
        budgetUnits: Math.floor(totalBudgetUnits / 12),
        actualUnits: Math.floor(totalActualUnits / 12),
        forecastUnits: Math.floor(totalForecastUnits / 12),
        budgetValue: Math.floor(totalBudgetValue / 12),
        actualValue: Math.floor(totalActualValue / 12),
        forecastValue: Math.floor(totalForecastValue / 12),
        rate: 100,
        variance: Math.floor((totalForecastValue - totalBudgetValue) / 12),
        variancePercentage: totalBudgetValue > 0 ? ((totalForecastValue - totalBudgetValue) / totalBudgetValue) * 100 / 12 : 0
      };
    });

    // Generate items data
    const items = customerData.map(item => ({
      item: item.item,
      category: item.category,
      brand: item.brand,
      budgetUnits: type === 'sales_budget' ? Math.floor((item as SavedBudgetData).budget2025 / ((item as SavedBudgetData).rate || 1)) : (item as SavedForecastData).budgetData?.bud25 || 0,
      actualUnits: type === 'sales_budget' ? Math.floor((item as SavedBudgetData).actual2025 / ((item as SavedBudgetData).rate || 1)) : (item as SavedForecastData).budgetData?.ytd25 || 0,
      forecastUnits: type === 'sales_budget' ? (item as SavedBudgetData).budget2026 : (item as SavedForecastData).forecastTotal,
      budgetValue: type === 'sales_budget' ? (item as SavedBudgetData).budget2025 : ((item as SavedForecastData).budgetData?.bud25 || 0) * 100,
      actualValue: type === 'sales_budget' ? (item as SavedBudgetData).actual2025 : ((item as SavedForecastData).budgetData?.ytd25 || 0) * 100,
      forecastValue: type === 'sales_budget' ? (item as SavedBudgetData).budgetValue2026 : (item as SavedForecastData).forecastTotal * 100,
      rate: type === 'sales_budget' ? (item as SavedBudgetData).rate : 100
    }));

    return {
      customer: customerName,
      totalBudgetUnits,
      totalActualUnits,
      totalForecastUnits,
      totalBudgetValue,
      totalActualValue,
      totalForecastValue,
      monthlyData,
      items,
      salesmanName: customerData[0]?.createdBy || 'Unknown',
      lastUpdated: customerData[0]?.lastModified ? new Date(customerData[0].lastModified).toLocaleDateString() : 'Unknown'
    };
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const exportData = () => {
    const exportObj = {
      exportDate: new Date().toISOString(),
      summary: summaryStats,
      budgetData: filteredBudgetData,
      forecastData: filteredForecastData
    };
    
    const dataStr = JSON.stringify(exportObj, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `manager-data-export-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

  if (!isOpen) return null;

  // Only allow managers and admins to access this component
  if (user?.role !== 'manager' && user?.role !== 'admin') {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md mx-4">
          <div className="flex items-center gap-3 text-red-600 mb-4">
            <Eye className="w-6 h-6" />
            <h2 className="text-lg font-semibold">Access Denied</h2>
          </div>
          <p className="text-gray-600 mb-4">
            This view is only available to managers and administrators.
          </p>
          <button
            onClick={onClose}
            className="w-full bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-7xl max-h-[95vh] overflow-hidden">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Eye className="w-6 h-6 text-blue-600" />
              <div>
                <h2 className="text-xl font-bold text-gray-900">Manager Data View</h2>
                <p className="text-sm text-gray-600">View and analyze salesman-saved data</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Tab Navigation */}
          <div className="flex items-center justify-between mt-4">
            <div className="flex gap-4">
              <button
                onClick={() => setActiveTab('summary')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === 'summary'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Summary
              </button>
              <button
                onClick={() => setActiveTab('budget')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === 'budget'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Budget Data ({budgetData.length})
              </button>
              <button
                onClick={() => setActiveTab('forecast')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === 'forecast'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Forecast Data ({forecastData.length})
              </button>
            </div>
            <button
              onClick={exportData}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>

          {/* Filters */}
          {activeTab !== 'summary' && (
            <div className="flex items-center gap-4 mt-4">
              <input
                type="text"
                placeholder="Search items or customers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <select
                value={selectedSalesman}
                onChange={(e) => setSelectedSalesman(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Salesmen</option>
                {allSalesmen.map(salesman => (
                  <option key={salesman} value={salesman}>{salesman}</option>
                ))}
              </select>
              <select
                value={selectedCustomer}
                onChange={(e) => setSelectedCustomer(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Customers</option>
                {allCustomers.map(customer => (
                  <option key={customer} value={customer}>{customer}</option>
                ))}
              </select>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="draft">Draft</option>
                <option value="saved">Saved</option>
                <option value="submitted">Submitted</option>
                <option value="approved">Approved</option>
              </select>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(95vh - 200px)' }}>
          {activeTab === 'summary' && (
            <div className="space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-800">Total Budget Items</p>
                      <p className="text-2xl font-bold text-blue-900">{summaryStats.totalBudgetItems}</p>
                      <p className="text-sm text-blue-700">{formatCurrency(summaryStats.totalBudgetValue)}</p>
                    </div>
                    <Package className="w-8 h-8 text-blue-600" />
                  </div>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-green-800">Total Forecast Items</p>
                      <p className="text-2xl font-bold text-green-900">{summaryStats.totalForecastItems}</p>
                      <p className="text-sm text-green-700">{formatCurrency(summaryStats.totalForecastValue)}</p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-green-600" />
                  </div>
                </div>

                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-purple-800">Active Salesmen</p>
                      <p className="text-2xl font-bold text-purple-900">{summaryStats.activeSalesmen}</p>
                      <p className="text-sm text-purple-700">{summaryStats.activeCustomers} customers</p>
                    </div>
                    <Users className="w-8 h-8 text-purple-600" />
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
                <div className="space-y-3">
                  {summaryStats.recentActivity.map((item, index) => (
                    <div key={index} className="flex items-center justify-between bg-white p-3 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{item.item}</p>
                        <p className="text-sm text-gray-600">{item.customer} • {item.createdBy}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">{item.type.replace('_', ' ').toUpperCase()}</p>
                        <p className="text-xs text-gray-500">{new Date(item.lastModified).toLocaleDateString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Customer Summary with breakdown links */}
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Summary</h3>
                <div className="space-y-2">
                  {allCustomers.map(customer => {
                    const customerBudgets = budgetData.filter(item => item.customer === customer);
                    const customerForecasts = forecastData.filter(item => item.customer === customer);
                    
                    return (
                      <div key={customer} className="flex items-center justify-between py-2 border-b border-gray-100">
                        <span className="font-medium text-gray-900">{customer}</span>
                        <div className="flex items-center gap-4">
                          {customerBudgets.length > 0 && (
                            <button
                              onClick={() => handleViewCustomerBreakdown(customer, 'sales_budget')}
                              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                            >
                              {customerBudgets.length} Budget items
                            </button>
                          )}
                          {customerForecasts.length > 0 && (
                            <button
                              onClick={() => handleViewCustomerBreakdown(customer, 'rolling_forecast')}
                              className="text-green-600 hover:text-green-800 text-sm font-medium"
                            >
                              {customerForecasts.length} Forecast items
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'budget' && (
            <div className="overflow-x-auto">
              <table className="w-full border border-gray-200 rounded-lg">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Budget 2026</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Value</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created By</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Last Modified</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredBudgetData.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900">
                        <button
                          onClick={() => handleViewCustomerBreakdown(item.customer, 'sales_budget')}
                          className="text-blue-600 hover:text-blue-800 hover:underline"
                        >
                          {item.customer}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 max-w-xs truncate" title={item.item}>
                        {item.item}
                      </td>
                      <td className="px-4 py-3 text-sm text-center">{item.budget2026.toLocaleString()}</td>
                      <td className="px-4 py-3 text-sm text-center">{formatCurrency(item.budgetValue2026)}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{item.createdBy}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                          item.status === 'approved' ? 'bg-green-100 text-green-800' :
                          item.status === 'submitted' ? 'bg-blue-100 text-blue-800' :
                          item.status === 'saved' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {item.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-center text-gray-600">
                        {new Date(item.lastModified).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredBudgetData.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Package className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No budget data found</p>
                  <p className="text-sm">Adjust your filters or wait for salesmen to save data</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'forecast' && (
            <div className="overflow-x-auto">
              <table className="w-full border border-gray-200 rounded-lg">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Forecast Units</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Est. Value</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created By</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Last Modified</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredForecastData.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900">
                        <button
                          onClick={() => handleViewCustomerBreakdown(item.customer, 'rolling_forecast')}
                          className="text-blue-600 hover:text-blue-800 hover:underline"
                        >
                          {item.customer}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 max-w-xs truncate" title={item.item}>
                        {item.item}
                      </td>
                      <td className="px-4 py-3 text-sm text-center">{item.forecastTotal.toLocaleString()}</td>
                      <td className="px-4 py-3 text-sm text-center">{formatCurrency(item.forecastTotal * 100)}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{item.createdBy}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                          item.status === 'approved' ? 'bg-green-100 text-green-800' :
                          item.status === 'submitted' ? 'bg-blue-100 text-blue-800' :
                          item.status === 'saved' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {item.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-center text-gray-600">
                        {new Date(item.lastModified).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredForecastData.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <TrendingUp className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No forecast data found</p>
                  <p className="text-sm">Adjust your filters or wait for salesmen to save data</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Customer Forecast Modal */}
      <CustomerForecastModal
        isOpen={isCustomerModalOpen}
        onClose={() => setIsCustomerModalOpen(false)}
        customerData={selectedCustomerForModal ? generateCustomerForecastData(selectedCustomerForModal, modalViewType) : null}
        viewType={modalViewType}
      />
    </div>
  );
};

export default ManagerDataView;
