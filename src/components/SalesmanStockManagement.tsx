import React, { useState } from 'react';
import {
  X,
  Package,
  TrendingUp,
  AlertTriangle,
  Clock,
  Send,
  Plus,
  Edit,
  Trash2,
  Eye,
  CheckCircle,
  XCircle,
  RefreshCw,
  BarChart3,
  Bell,
  Target,
  Calendar,
  MessageSquare
} from 'lucide-react';
import { useStock, StockRequest, StockAlert, StockProjection, StockOverview } from '../contexts/StockContext';
import { useAuth } from '../contexts/AuthContext';

interface SalesmanStockManagementProps {
  isOpen: boolean;
  onClose: () => void;
}

const SalesmanStockManagement: React.FC<SalesmanStockManagementProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const {
    stockRequests,
    stockAlerts,
    stockProjections,
    stockOverviews,
    createStockRequest,
    sendRequestToManager,
    createStockAlert,
    sendAlertToManager,
    createStockProjection,
    sendProjectionToManager,
    createStockOverview,
    sendOverviewToManager,
    sendAllToManager,
    getRequestsBySalesman
  } = useStock();

  const [activeTab, setActiveTab] = useState<'overview' | 'requests' | 'alerts' | 'projections' | 'new'>('overview');
  const [newRequestType, setNewRequestType] = useState<'request' | 'alert' | 'projection' | 'overview'>('request');
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null);

  // New request form states
  const [newRequest, setNewRequest] = useState({
    title: '',
    itemName: '',
    category: 'Tyres',
    brand: '',
    requestedQuantity: 0,
    currentStock: 0,
    reason: '',
    customerName: '',
    urgency: 'medium' as const,
    estimatedCost: 0,
    supplierInfo: ''
  });

  const [newAlert, setNewAlert] = useState({
    itemName: '',
    currentStock: 0,
    minimumLevel: 0,
    alertType: 'low_stock' as const,
    category: 'Tyres',
    brand: '',
    location: '',
    priority: 'medium' as const
  });

  const [newProjection, setNewProjection] = useState({
    itemName: '',
    category: 'Tyres',
    brand: '',
    currentStock: 0,
    projectedDemand: 0,
    projectionPeriod: '3_months' as const,
    seasonalFactor: 1.0,
    notes: ''
  });

  const [newOverview, setNewOverview] = useState({
    title: '',
    description: '',
    items: [] as Array<{
      itemName: string;
      category: string;
      currentStock: number;
      status: 'good' | 'warning' | 'critical';
      notes: string;
    }>
  });

  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  if (!isOpen) return null;

  const salesmanData = getRequestsBySalesman(user?.name || '');
  const myRequests = salesmanData.requests;
  const myAlerts = salesmanData.alerts;
  const myProjections = salesmanData.projections;
  const myOverviews = salesmanData.overviews;

  const handleCreateRequest = () => {
    if (!newRequest.title || !newRequest.itemName) {
      showNotification('Please fill in all required fields', 'error');
      return;
    }

    const requestId = createStockRequest({
      type: 'new_request',
      title: newRequest.title,
      itemName: newRequest.itemName,
      category: newRequest.category,
      brand: newRequest.brand,
      requestedQuantity: newRequest.requestedQuantity,
      currentStock: newRequest.currentStock,
      reason: newRequest.reason,
      customerName: newRequest.customerName,
      urgency: newRequest.urgency,
      createdBy: user?.name || '',
      createdByRole: 'salesman',
      estimatedCost: newRequest.estimatedCost,
      supplierInfo: newRequest.supplierInfo
    });

    showNotification('Stock request created successfully!', 'success');
    setNewRequest({
      title: '',
      itemName: '',
      category: 'Tyres',
      brand: '',
      requestedQuantity: 0,
      currentStock: 0,
      reason: '',
      customerName: '',
      urgency: 'medium',
      estimatedCost: 0,
      supplierInfo: ''
    });
  };

  const handleCreateAlert = () => {
    if (!newAlert.itemName) {
      showNotification('Please fill in all required fields', 'error');
      return;
    }

    const alertId = createStockAlert({
      itemName: newAlert.itemName,
      currentStock: newAlert.currentStock,
      minimumLevel: newAlert.minimumLevel,
      alertType: newAlert.alertType,
      category: newAlert.category,
      brand: newAlert.brand,
      location: newAlert.location,
      createdBy: user?.name || '',
      priority: newAlert.priority
    });

    showNotification('Stock alert created successfully!', 'success');
    setNewAlert({
      itemName: '',
      currentStock: 0,
      minimumLevel: 0,
      alertType: 'low_stock',
      category: 'Tyres',
      brand: '',
      location: '',
      priority: 'medium'
    });
  };

  const handleSendAllToManager = () => {
    sendAllToManager(user?.name || '');
    showNotification('All draft items sent to manager for review!', 'success');
  };

  const getStatusBadge = (status: string) => {
    const statusColors = {
      draft: 'bg-gray-100 text-gray-800',
      sent_to_manager: 'bg-blue-100 text-blue-800',
      under_review: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      completed: 'bg-purple-100 text-purple-800'
    };
    return statusColors[status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800';
  };

  const getUrgencyBadge = (urgency: string) => {
    const urgencyColors = {
      low: 'bg-blue-100 text-blue-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-orange-100 text-orange-800',
      critical: 'bg-red-100 text-red-800'
    };
    return urgencyColors[urgency as keyof typeof urgencyColors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Package className="w-8 h-8" />
              <div>
                <h2 className="text-2xl font-bold">Stock Management Center</h2>
                <p className="text-blue-100">Manage stock requests, alerts, and projections</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleSendAllToManager}
                className="bg-white text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors font-medium"
              >
                <Send className="w-4 h-4 inline mr-2" />
                Send All to Manager
              </button>
              <button
                onClick={onClose}
                className="text-white hover:text-blue-200 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'requests', label: 'My Requests', icon: Package },
              { id: 'alerts', label: 'Stock Alerts', icon: Bell },
              { id: 'projections', label: 'Projections', icon: TrendingUp },
              { id: 'new', label: 'Create New', icon: Plus }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4 inline mr-2" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-600">Total Requests</p>
                      <p className="text-2xl font-bold text-blue-900">{myRequests.length}</p>
                    </div>
                    <Package className="w-8 h-8 text-blue-600" />
                  </div>
                </div>
                <div className="bg-red-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-red-600">Active Alerts</p>
                      <p className="text-2xl font-bold text-red-900">{myAlerts.length}</p>
                    </div>
                    <Bell className="w-8 h-8 text-red-600" />
                  </div>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-green-600">Projections</p>
                      <p className="text-2xl font-bold text-green-900">{myProjections.length}</p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-green-600" />
                  </div>
                </div>
                <div className="bg-purple-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-purple-600">Overviews</p>
                      <p className="text-2xl font-bold text-purple-900">{myOverviews.length}</p>
                    </div>
                    <BarChart3 className="w-8 h-8 text-purple-600" />
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
                <div className="space-y-3">
                  {[...myRequests, ...myAlerts, ...myProjections, ...myOverviews]
                    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                    .slice(0, 5)
                    .map((item) => (
                      <div key={item.id} className="flex items-center justify-between bg-white rounded-lg p-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <Package className="w-4 h-4 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {'title' in item ? item.title : 'itemName' in item ? item.itemName : 'Item'}
                            </p>
                            <p className="text-sm text-gray-500">
                              {new Date(item.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(item.status)}`}>
                          {item.status.replace('_', ' ')}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'requests' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">My Stock Requests</h3>
                <button
                  onClick={() => setActiveTab('new')}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4 inline mr-2" />
                  New Request
                </button>
              </div>
              
              <div className="space-y-3">
                {myRequests.map((request) => (
                  <div key={request.id} className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-gray-900">{request.title}</h4>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getUrgencyBadge(request.urgency)}`}>
                          {request.urgency}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(request.status)}`}>
                          {request.status.replace('_', ' ')}
                        </span>
                        {request.status === 'draft' && (
                          <button
                            onClick={() => sendRequestToManager(request.id)}
                            className="bg-blue-100 text-blue-600 px-3 py-1 rounded-lg hover:bg-blue-200 transition-colors text-sm"
                          >
                            <Send className="w-3 h-3 inline mr-1" />
                            Send
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Item</p>
                        <p className="font-medium">{request.itemName}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Quantity</p>
                        <p className="font-medium">{request.requestedQuantity}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Current Stock</p>
                        <p className="font-medium">{request.currentStock}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Customer</p>
                        <p className="font-medium">{request.customerName || 'N/A'}</p>
                      </div>
                    </div>
                    {request.reason && (
                      <div className="mt-3">
                        <p className="text-gray-600 text-sm">Reason</p>
                        <p className="text-gray-900">{request.reason}</p>
                      </div>
                    )}
                    {request.managerComments && (
                      <div className="mt-3 bg-blue-50 rounded-lg p-3">
                        <p className="text-blue-800 text-sm font-medium">Manager Comments</p>
                        <p className="text-blue-700">{request.managerComments}</p>
                      </div>
                    )}
                  </div>
                ))}
                {myRequests.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Package className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>No stock requests yet. Create your first request to get started.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'alerts' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Stock Alerts</h3>
                <button
                  onClick={() => {
                    setActiveTab('new');
                    setNewRequestType('alert');
                  }}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                >
                  <Plus className="w-4 h-4 inline mr-2" />
                  New Alert
                </button>
              </div>
              
              <div className="space-y-3">
                {myAlerts.map((alert) => (
                  <div key={alert.id} className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-gray-900">{alert.itemName}</h4>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getUrgencyBadge(alert.priority)}`}>
                          {alert.priority}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(alert.status)}`}>
                          {alert.status.replace('_', ' ')}
                        </span>
                        {alert.status === 'draft' && (
                          <button
                            onClick={() => sendAlertToManager(alert.id)}
                            className="bg-red-100 text-red-600 px-3 py-1 rounded-lg hover:bg-red-200 transition-colors text-sm"
                          >
                            <Send className="w-3 h-3 inline mr-1" />
                            Send
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Current Stock</p>
                        <p className="font-medium text-red-600">{alert.currentStock}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Minimum Level</p>
                        <p className="font-medium">{alert.minimumLevel}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Alert Type</p>
                        <p className="font-medium">{alert.alertType.replace('_', ' ')}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Location</p>
                        <p className="font-medium">{alert.location}</p>
                      </div>
                    </div>
                    {alert.managerNotes && (
                      <div className="mt-3 bg-red-50 rounded-lg p-3">
                        <p className="text-red-800 text-sm font-medium">Manager Notes</p>
                        <p className="text-red-700">{alert.managerNotes}</p>
                      </div>
                    )}
                  </div>
                ))}
                {myAlerts.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Bell className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>No stock alerts yet. Create alerts to notify about stock issues.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'new' && (
            <div className="space-y-6">
              <div className="flex items-center space-x-4 mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Create New</h3>
                <select
                  value={newRequestType}
                  onChange={(e) => setNewRequestType(e.target.value as any)}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="request">Stock Request</option>
                  <option value="alert">Stock Alert</option>
                  <option value="projection">Stock Projection</option>
                  <option value="overview">Stock Overview</option>
                </select>
              </div>

              {newRequestType === 'request' && (
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">New Stock Request</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Request Title *</label>
                      <input
                        type="text"
                        value={newRequest.title}
                        onChange={(e) => setNewRequest({...newRequest, title: e.target.value})}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., Emergency Tyre Restock"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Item Name *</label>
                      <input
                        type="text"
                        value={newRequest.itemName}
                        onChange={(e) => setNewRequest({...newRequest, itemName: e.target.value})}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., BF GOODRICH TYRE 235/85R16"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                      <select
                        value={newRequest.category}
                        onChange={(e) => setNewRequest({...newRequest, category: e.target.value})}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="Tyres">Tyres</option>
                        <option value="Accessories">Accessories</option>
                        <option value="Batteries">Batteries</option>
                        <option value="Oils & Lubricants">Oils & Lubricants</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Brand</label>
                      <input
                        type="text"
                        value={newRequest.brand}
                        onChange={(e) => setNewRequest({...newRequest, brand: e.target.value})}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., BF Goodrich"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Requested Quantity</label>
                      <input
                        type="number"
                        value={newRequest.requestedQuantity}
                        onChange={(e) => setNewRequest({...newRequest, requestedQuantity: parseInt(e.target.value) || 0})}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Current Stock</label>
                      <input
                        type="number"
                        value={newRequest.currentStock}
                        onChange={(e) => setNewRequest({...newRequest, currentStock: parseInt(e.target.value) || 0})}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Customer Name</label>
                      <input
                        type="text"
                        value={newRequest.customerName}
                        onChange={(e) => setNewRequest({...newRequest, customerName: e.target.value})}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., Action Aid International"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Urgency</label>
                      <select
                        value={newRequest.urgency}
                        onChange={(e) => setNewRequest({...newRequest, urgency: e.target.value as any})}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="critical">Critical</option>
                      </select>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Reason for Request</label>
                      <textarea
                        value={newRequest.reason}
                        onChange={(e) => setNewRequest({...newRequest, reason: e.target.value})}
                        rows={3}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Explain why this stock request is needed..."
                      />
                    </div>
                  </div>
                  <div className="mt-6 flex space-x-3">
                    <button
                      onClick={handleCreateRequest}
                      className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Create Request
                    </button>
                    <button
                      onClick={() => setActiveTab('requests')}
                      className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {newRequestType === 'alert' && (
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">New Stock Alert</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Item Name *</label>
                      <input
                        type="text"
                        value={newAlert.itemName}
                        onChange={(e) => setNewAlert({...newAlert, itemName: e.target.value})}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                        placeholder="e.g., BF GOODRICH TYRE 265/65R17"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Alert Type</label>
                      <select
                        value={newAlert.alertType}
                        onChange={(e) => setNewAlert({...newAlert, alertType: e.target.value as any})}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                      >
                        <option value="low_stock">Low Stock</option>
                        <option value="out_of_stock">Out of Stock</option>
                        <option value="overstocked">Overstocked</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Current Stock</label>
                      <input
                        type="number"
                        value={newAlert.currentStock}
                        onChange={(e) => setNewAlert({...newAlert, currentStock: parseInt(e.target.value) || 0})}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Minimum Level</label>
                      <input
                        type="number"
                        value={newAlert.minimumLevel}
                        onChange={(e) => setNewAlert({...newAlert, minimumLevel: parseInt(e.target.value) || 0})}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                      <input
                        type="text"
                        value={newAlert.location}
                        onChange={(e) => setNewAlert({...newAlert, location: e.target.value})}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                        placeholder="e.g., Warehouse A-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                      <select
                        value={newAlert.priority}
                        onChange={(e) => setNewAlert({...newAlert, priority: e.target.value as any})}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="critical">Critical</option>
                      </select>
                    </div>
                  </div>
                  <div className="mt-6 flex space-x-3">
                    <button
                      onClick={handleCreateAlert}
                      className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Create Alert
                    </button>
                    <button
                      onClick={() => setActiveTab('alerts')}
                      className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
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
      </div>
    </div>
  );
};

export default SalesmanStockManagement;
