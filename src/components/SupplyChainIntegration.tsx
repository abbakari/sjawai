import React, { useState } from 'react';
import { 
  Package, 
  TrendingUp, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  Target, 
  Building, 
  Calendar,
  DollarSign,
  Truck,
  Warehouse,
  BarChart3
} from 'lucide-react';
import { useWorkflow } from '../contexts/WorkflowContext';
import { useAuth } from '../contexts/AuthContext';

const SupplyChainIntegration: React.FC = () => {
  const { user } = useAuth();
  const { getItemsByState, getNotificationsForUser } = useWorkflow();
  const [selectedTimeframe, setSelectedTimeframe] = useState<string>('current_year');
  const [processingStatus, setProcessingStatus] = useState<{[key: string]: 'pending' | 'processing' | 'completed'}>({});

  // Get approved items sent to supply chain
  const approvedItems = getItemsByState('sent_to_supply_chain');
  const pendingItems = getItemsByState('approved');

  // Get notifications for supply chain
  const notifications = user ? getNotificationsForUser('Supply Chain Team', 'supply_chain') : [];
  const unreadNotifications = notifications.filter(n => !n.read);

  // Process an approved item
  const handleProcessItem = (itemId: string) => {
    setProcessingStatus(prev => ({ ...prev, [itemId]: 'processing' }));
    
    // Simulate processing time
    setTimeout(() => {
      setProcessingStatus(prev => ({ ...prev, [itemId]: 'completed' }));
    }, 2000);
  };

  // Calculate statistics
  const stats = {
    totalItems: approvedItems.length,
    totalValue: approvedItems.reduce((sum, item) => sum + item.totalValue, 0),
    pendingProcessing: Object.values(processingStatus).filter(status => status === 'pending').length,
    inProgress: Object.values(processingStatus).filter(status => status === 'processing').length,
    completed: Object.values(processingStatus).filter(status => status === 'completed').length,
    uniqueCustomers: [...new Set(approvedItems.flatMap(item => item.customers))].length
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'processing': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              🏭 Supply Chain Integration
              {unreadNotifications.length > 0 && (
                <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-sm">
                  {unreadNotifications.length} new requests
                </span>
              )}
            </h2>
            <p className="text-gray-600">Approved items from managers ready for supply chain processing</p>
          </div>
          
          <select
            value={selectedTimeframe}
            onChange={(e) => setSelectedTimeframe(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="current_year">Current Year</option>
            <option value="q4_2024">Q4 2024</option>
            <option value="q1_2025">Q1 2025</option>
            <option value="all_time">All Time</option>
          </select>
        </div>

        {/* Statistics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-1">
              <Package className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">Total Items</span>
            </div>
            <p className="text-2xl font-bold text-blue-600">{stats.totalItems}</p>
          </div>
          
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-1">
              <DollarSign className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-green-900">Total Value</span>
            </div>
            <p className="text-2xl font-bold text-green-600">${(stats.totalValue / 1000).toFixed(0)}K</p>
          </div>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="w-4 h-4 text-yellow-600" />
              <span className="text-sm font-medium text-yellow-900">Pending</span>
            </div>
            <p className="text-2xl font-bold text-yellow-600">{approvedItems.length - stats.inProgress - stats.completed}</p>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-1">
              <Truck className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">Processing</span>
            </div>
            <p className="text-2xl font-bold text-blue-600">{stats.inProgress}</p>
          </div>
          
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-green-900">Completed</span>
            </div>
            <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
          </div>
          
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-1">
              <Building className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-medium text-purple-900">Customers</span>
            </div>
            <p className="text-2xl font-bold text-purple-600">{stats.uniqueCustomers}</p>
          </div>
        </div>
      </div>

      {/* Approved Items for Processing */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Warehouse className="w-5 h-5 text-blue-600" />
          Items Ready for Supply Chain Processing
        </h3>

        {approvedItems.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="text-lg">No approved items waiting for processing</p>
            <p className="text-sm">Items will appear here after manager approval</p>
          </div>
        ) : (
          <div className="space-y-4">
            {approvedItems.map((item) => {
              const status = processingStatus[item.id] || 'pending';
              
              return (
                <div key={item.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      {/* Header */}
                      <div className="flex items-center gap-3 mb-3">
                        <h4 className="text-lg font-semibold text-gray-900">{item.title}</h4>
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(status)}`}>
                          {status === 'pending' && <Clock className="w-3 h-3" />}
                          {status === 'processing' && <Truck className="w-3 h-3" />}
                          {status === 'completed' && <CheckCircle className="w-3 h-3" />}
                          {status.toUpperCase()}
                        </span>
                        {item.type === 'sales_budget' && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                            <Target className="w-3 h-3" />
                            Budget
                          </span>
                        )}
                        {item.type === 'rolling_forecast' && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                            <TrendingUp className="w-3 h-3" />
                            Forecast
                          </span>
                        )}
                      </div>

                      {/* Details Grid */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div>
                          <span className="text-xs text-gray-500 uppercase tracking-wide">Created By</span>
                          <p className="text-sm font-medium text-gray-900">{item.createdBy}</p>
                        </div>
                        <div>
                          <span className="text-xs text-gray-500 uppercase tracking-wide">Year</span>
                          <p className="text-sm font-medium text-gray-900">{item.year}</p>
                        </div>
                        <div>
                          <span className="text-xs text-gray-500 uppercase tracking-wide">Total Value</span>
                          <p className="text-sm font-medium text-green-600">${item.totalValue.toLocaleString()}</p>
                        </div>
                        <div>
                          <span className="text-xs text-gray-500 uppercase tracking-wide">Customers</span>
                          <p className="text-sm font-medium text-gray-900">{item.customers.length}</p>
                        </div>
                      </div>

                      {/* Customer List */}
                      <div className="mb-4">
                        <span className="text-xs text-gray-500 uppercase tracking-wide mb-2 block">Customers</span>
                        <div className="flex flex-wrap gap-2">
                          {item.customers.map((customer, index) => (
                            <span key={index} className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs">
                              <Building className="w-3 h-3" />
                              {customer}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Budget/Forecast Summary */}
                      {item.budgetData && item.budgetData.length > 0 && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                          <h5 className="text-sm font-medium text-blue-900 mb-2">Budget Items Summary</h5>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                            <div>
                              <span className="text-blue-700">Total Items:</span>
                              <span className="font-semibold ml-1">{item.budgetData.length}</span>
                            </div>
                            <div>
                              <span className="text-blue-700">Categories:</span>
                              <span className="font-semibold ml-1">
                                {[...new Set(item.budgetData.map(b => b.category))].length}
                              </span>
                            </div>
                            <div>
                              <span className="text-blue-700">Brands:</span>
                              <span className="font-semibold ml-1">
                                {[...new Set(item.budgetData.map(b => b.brand))].length}
                              </span>
                            </div>
                            <div>
                              <span className="text-blue-700">Monthly Items:</span>
                              <span className="font-semibold ml-1">
                                {item.budgetData.reduce((sum, b) => sum + b.monthlyData.filter(m => m.budgetValue > 0).length, 0)}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Approval Timeline */}
                      <div className="text-xs text-gray-600">
                        <div className="flex items-center gap-2">
                          <span>Approved: {new Date(item.approvedAt!).toLocaleString()}</span>
                          <span>•</span>
                          <span>By: {item.approvedBy}</span>
                          <span>•</span>
                          <span>Sent to Supply Chain: {new Date(item.sentToSupplyChainAt!).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col gap-2 ml-4">
                      {status === 'pending' && (
                        <button
                          onClick={() => handleProcessItem(item.id)}
                          className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
                        >
                          <Truck className="w-4 h-4" />
                          Start Processing
                        </button>
                      )}
                      
                      {status === 'processing' && (
                        <div className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-blue-600 bg-blue-100 rounded-md">
                          <div className="animate-spin w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                          Processing...
                        </div>
                      )}
                      
                      {status === 'completed' && (
                        <div className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-green-600 bg-green-100 rounded-md">
                          <CheckCircle className="w-4 h-4" />
                          Completed
                        </div>
                      )}
                      
                      <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors">
                        <BarChart3 className="w-4 h-4" />
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Processing Instructions */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-yellow-900 mb-2 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" />
          Supply Chain Processing Instructions
        </h4>
        <ul className="text-sm text-yellow-800 space-y-1">
          <li>• Review approved budgets and forecasts for inventory planning</li>
          <li>• Coordinate with suppliers based on approved quantities and timelines</li>
          <li>• Update stock levels and procurement schedules accordingly</li>
          <li>• Monitor customer delivery timelines and adjust distribution plans</li>
          <li>• Report completion status back to managers for tracking</li>
        </ul>
      </div>
    </div>
  );
};

export default SupplyChainIntegration;
