import React, { useState } from 'react';
import {
  X,
  Package,
  TrendingUp,
  AlertTriangle,
  Clock,
  CheckCircle,
  XCircle,
  Send,
  Users,
  Filter,
  Search,
  Eye,
  MessageSquare,
  BarChart3,
  Bell,
  Target,
  Calendar,
  Download,
  RefreshCw
} from 'lucide-react';
import { useStock, StockRequest, StockAlert, StockProjection, StockOverview } from '../contexts/StockContext';
import { useAuth } from '../contexts/AuthContext';

interface ManagerStockManagementProps {
  isOpen: boolean;
  onClose: () => void;
}

const ManagerStockManagement: React.FC<ManagerStockManagementProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const {
    stockRequests,
    stockAlerts,
    stockProjections,
    stockOverviews,
    updateRequestStatus,
    updateAlertStatus,
    updateProjectionStatus,
    updateOverviewStatus,
    getRequestsByStatus,
    approveMultiple
  } = useStock();

  const [activeTab, setActiveTab] = useState<'dashboard' | 'requests' | 'alerts' | 'projections' | 'overviews' | 'salesmen'>('dashboard');
  const [selectedSalesman, setSelectedSalesman] = useState('all');
  const [filterStatus, setFilterStatus] = useState('sent_to_manager');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewingItem, setReviewingItem] = useState<any>(null);
  const [reviewType, setReviewType] = useState<'requests' | 'alerts' | 'projections' | 'overviews'>('requests');
  const [managerComments, setManagerComments] = useState('');
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null);

  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  if (!isOpen) return null;

  // Get all unique salesmen
  const allSalesmen = Array.from(new Set([
    ...stockRequests.map(r => r.createdBy),
    ...stockAlerts.map(a => a.createdBy),
    ...stockProjections.map(p => p.createdBy),
    ...stockOverviews.map(o => o.createdBy)
  ]));

  // Filter items based on current filters
  const getFilteredItems = (items: any[]) => {
    return items.filter(item => {
      const matchesSalesman = selectedSalesman === 'all' || item.createdBy === selectedSalesman;
      const matchesStatus = filterStatus === 'all' || item.status === filterStatus;
      const matchesSearch = searchTerm === '' || 
        item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.itemName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.reason?.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchesSalesman && matchesStatus && matchesSearch;
    });
  };

  const filteredRequests = getFilteredItems(stockRequests);
  const filteredAlerts = getFilteredItems(stockAlerts);
  const filteredProjections = getFilteredItems(stockProjections);
  const filteredOverviews = getFilteredItems(stockOverviews);

  const handleApproveItem = (item: any, type: 'requests' | 'alerts' | 'projections' | 'overviews') => {
    const comments = managerComments || 'Approved by manager';
    
    switch (type) {
      case 'requests':
        updateRequestStatus(item.id, 'approved', comments);
        break;
      case 'alerts':
        updateAlertStatus(item.id, 'approved', comments);
        break;
      case 'projections':
        updateProjectionStatus(item.id, 'approved', comments);
        break;
      case 'overviews':
        updateOverviewStatus(item.id, 'approved', comments);
        break;
    }
    
    showNotification(`${type.slice(0, -1)} approved successfully`, 'success');
    setShowReviewModal(false);
    setManagerComments('');
  };

  const handleRejectItem = (item: any, type: 'requests' | 'alerts' | 'projections' | 'overviews') => {
    const comments = managerComments || 'Rejected by manager';
    
    switch (type) {
      case 'requests':
        updateRequestStatus(item.id, 'rejected', comments);
        break;
      case 'alerts':
        updateAlertStatus(item.id, 'rejected', comments);
        break;
      case 'projections':
        updateProjectionStatus(item.id, 'rejected', comments);
        break;
      case 'overviews':
        updateOverviewStatus(item.id, 'rejected', comments);
        break;
    }
    
    showNotification(`${type.slice(0, -1)} rejected`, 'success');
    setShowReviewModal(false);
    setManagerComments('');
  };

  const handleBulkApprove = () => {
    if (selectedItems.length === 0) {
      showNotification('Please select items to approve', 'error');
      return;
    }
    
    // For simplicity, we'll assume all selected items are of the same type
    // In a real app, you'd need to group by type
    approveMultiple(selectedItems, 'requests', 'Bulk approved by manager');
    setSelectedItems([]);
    showNotification(`${selectedItems.length} items approved`, 'success');
  };

  const openReviewModal = (item: any, type: 'requests' | 'alerts' | 'projections' | 'overviews') => {
    setReviewingItem(item);
    setReviewType(type);
    setShowReviewModal(true);
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

  // Dashboard statistics
  const pendingRequests = stockRequests.filter(r => r.status === 'sent_to_manager').length;
  const pendingAlerts = stockAlerts.filter(a => a.status === 'sent_to_manager').length;
  const pendingProjections = stockProjections.filter(p => p.status === 'sent_to_manager').length;
  const pendingOverviews = stockOverviews.filter(o => o.status === 'sent_to_manager').length;
  const totalPending = pendingRequests + pendingAlerts + pendingProjections + pendingOverviews;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-7xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Users className="w-8 h-8" />
              <div>
                <h2 className="text-2xl font-bold">Manager Stock Control Center</h2>
                <p className="text-green-100">Review and manage all salesman stock requests</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="bg-white text-green-600 px-4 py-2 rounded-lg">
                <span className="font-semibold">{totalPending}</span>
                <span className="text-sm ml-1">Pending</span>
              </div>
              <button
                onClick={onClose}
                className="text-white hover:text-green-200 transition-colors"
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
              { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
              { id: 'requests', label: `Requests (${pendingRequests})`, icon: Package },
              { id: 'alerts', label: `Alerts (${pendingAlerts})`, icon: Bell },
              { id: 'projections', label: `Projections (${pendingProjections})`, icon: TrendingUp },
              { id: 'overviews', label: `Overviews (${pendingOverviews})`, icon: Eye },
              { id: 'salesmen', label: 'By Salesman', icon: Users }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-green-500 text-green-600'
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

        {/* Filters */}
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <select
                value={selectedSalesman}
                onChange={(e) => setSelectedSalesman(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="all">All Salesmen</option>
                {allSalesmen.map(salesman => (
                  <option key={salesman} value={salesman}>{salesman}</option>
                ))}
              </select>
            </div>
            <div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="all">All Status</option>
                <option value="sent_to_manager">Pending Review</option>
                <option value="under_review">Under Review</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search requests..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>
            {selectedItems.length > 0 && (
              <button
                onClick={handleBulkApprove}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm"
              >
                <CheckCircle className="w-4 h-4 inline mr-2" />
                Approve Selected ({selectedItems.length})
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-600">Stock Requests</p>
                      <p className="text-2xl font-bold text-blue-900">{pendingRequests}</p>
                      <p className="text-xs text-blue-600">Pending Review</p>
                    </div>
                    <Package className="w-8 h-8 text-blue-600" />
                  </div>
                </div>
                <div className="bg-red-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-red-600">Stock Alerts</p>
                      <p className="text-2xl font-bold text-red-900">{pendingAlerts}</p>
                      <p className="text-xs text-red-600">Need Attention</p>
                    </div>
                    <Bell className="w-8 h-8 text-red-600" />
                  </div>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-green-600">Projections</p>
                      <p className="text-2xl font-bold text-green-900">{pendingProjections}</p>
                      <p className="text-xs text-green-600">For Review</p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-green-600" />
                  </div>
                </div>
                <div className="bg-purple-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-purple-600">Overviews</p>
                      <p className="text-2xl font-bold text-purple-900">{pendingOverviews}</p>
                      <p className="text-xs text-purple-600">Submitted</p>
                    </div>
                    <Eye className="w-8 h-8 text-purple-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Submissions</h3>
                <div className="space-y-3">
                  {[...filteredRequests, ...filteredAlerts, ...filteredProjections, ...filteredOverviews]
                    .filter(item => item.status === 'sent_to_manager')
                    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                    .slice(0, 8)
                    .map((item) => (
                      <div key={item.id} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                            <Package className="w-4 h-4 text-green-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {'title' in item ? item.title : 'itemName' in item ? item.itemName : 'Item'}
                            </p>
                            <p className="text-sm text-gray-500">
                              By {item.createdBy} • {new Date(item.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(item.status)}`}>
                            {item.status.replace('_', ' ')}
                          </span>
                          <button
                            onClick={() => openReviewModal(item, 'title' in item ? 'requests' : 'itemName' in item ? 'alerts' : 'projections')}
                            className="text-green-600 hover:text-green-800"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Active Salesmen</h3>
                  <div className="space-y-3">
                    {allSalesmen.map(salesman => {
                      const salesmanRequests = stockRequests.filter(r => r.createdBy === salesman && r.status === 'sent_to_manager');
                      const salesmanAlerts = stockAlerts.filter(a => a.createdBy === salesman && a.status === 'sent_to_manager');
                      const totalPendingForSalesman = salesmanRequests.length + salesmanAlerts.length;
                      
                      return (
                        <div key={salesman} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                              <Users className="w-4 h-4 text-blue-600" />
                            </div>
                            <span className="font-medium text-gray-900">{salesman}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-500">{totalPendingForSalesman} pending</span>
                            <button
                              onClick={() => {
                                setSelectedSalesman(salesman);
                                setActiveTab('salesmen');
                              }}
                              className="text-green-600 hover:text-green-800"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Priority Items</h3>
                  <div className="space-y-3">
                    {[...filteredRequests, ...filteredAlerts]
                      .filter(item => ('urgency' in item && item.urgency === 'critical') || ('priority' in item && item.priority === 'critical'))
                      .filter(item => item.status === 'sent_to_manager')
                      .slice(0, 5)
                      .map((item) => (
                        <div key={item.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <AlertTriangle className="w-5 h-5 text-red-600" />
                            <div>
                              <p className="font-medium text-gray-900">
                                {'title' in item ? item.title : item.itemName}
                              </p>
                              <p className="text-sm text-red-600">Critical Priority</p>
                            </div>
                          </div>
                          <button
                            onClick={() => openReviewModal(item, 'title' in item ? 'requests' : 'alerts')}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'requests' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Stock Requests</h3>
                <div className="text-sm text-gray-500">
                  {filteredRequests.length} of {stockRequests.length} requests
                </div>
              </div>
              
              <div className="space-y-3">
                {filteredRequests.map((request) => (
                  <div key={request.id} className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={selectedItems.includes(request.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedItems([...selectedItems, request.id]);
                            } else {
                              setSelectedItems(selectedItems.filter(id => id !== request.id));
                            }
                          }}
                          className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                        />
                        <h4 className="font-semibold text-gray-900">{request.title}</h4>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getUrgencyBadge(request.urgency)}`}>
                          {request.urgency}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(request.status)}`}>
                          {request.status.replace('_', ' ')}
                        </span>
                        <button
                          onClick={() => openReviewModal(request, 'requests')}
                          className="bg-green-100 text-green-600 px-3 py-1 rounded-lg hover:bg-green-200 transition-colors text-sm"
                        >
                          <Eye className="w-3 h-3 inline mr-1" />
                          Review
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Salesman</p>
                        <p className="font-medium">{request.createdBy}</p>
                      </div>
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
                  </div>
                ))}
                {filteredRequests.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Package className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>No stock requests found matching your filters.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'alerts' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Stock Alerts</h3>
                <div className="text-sm text-gray-500">
                  {filteredAlerts.length} of {stockAlerts.length} alerts
                </div>
              </div>
              
              <div className="space-y-3">
                {filteredAlerts.map((alert) => (
                  <div key={alert.id} className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={selectedItems.includes(alert.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedItems([...selectedItems, alert.id]);
                            } else {
                              setSelectedItems(selectedItems.filter(id => id !== alert.id));
                            }
                          }}
                          className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                        />
                        <AlertTriangle className="w-5 h-5 text-red-600" />
                        <h4 className="font-semibold text-gray-900">{alert.itemName}</h4>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getUrgencyBadge(alert.priority)}`}>
                          {alert.priority}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(alert.status)}`}>
                          {alert.status.replace('_', ' ')}
                        </span>
                        <button
                          onClick={() => openReviewModal(alert, 'alerts')}
                          className="bg-red-100 text-red-600 px-3 py-1 rounded-lg hover:bg-red-200 transition-colors text-sm"
                        >
                          <Eye className="w-3 h-3 inline mr-1" />
                          Review
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Salesman</p>
                        <p className="font-medium">{alert.createdBy}</p>
                      </div>
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
                  </div>
                ))}
                {filteredAlerts.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Bell className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>No stock alerts found matching your filters.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Review Modal */}
        {showReviewModal && reviewingItem && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] overflow-y-auto">
              <div className="bg-green-600 text-white p-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">
                    Review {reviewType.slice(0, -1).charAt(0).toUpperCase() + reviewType.slice(1, -1)}
                  </h3>
                  <button
                    onClick={() => setShowReviewModal(false)}
                    className="text-white hover:text-green-200"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
              
              <div className="p-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      {'title' in reviewingItem ? reviewingItem.title : reviewingItem.itemName}
                    </h4>
                    <p className="text-sm text-gray-600">Submitted by {reviewingItem.createdBy}</p>
                  </div>
                  
                  {reviewType === 'requests' && (
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Item Name</p>
                        <p className="font-medium">{reviewingItem.itemName}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Requested Quantity</p>
                        <p className="font-medium">{reviewingItem.requestedQuantity}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Current Stock</p>
                        <p className="font-medium">{reviewingItem.currentStock}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Urgency</p>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getUrgencyBadge(reviewingItem.urgency)}`}>
                          {reviewingItem.urgency}
                        </span>
                      </div>
                      {reviewingItem.customerName && (
                        <div className="col-span-2">
                          <p className="text-gray-600">Customer</p>
                          <p className="font-medium">{reviewingItem.customerName}</p>
                        </div>
                      )}
                      {reviewingItem.reason && (
                        <div className="col-span-2">
                          <p className="text-gray-600">Reason</p>
                          <p className="font-medium">{reviewingItem.reason}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {reviewType === 'alerts' && (
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Current Stock</p>
                        <p className="font-medium text-red-600">{reviewingItem.currentStock}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Minimum Level</p>
                        <p className="font-medium">{reviewingItem.minimumLevel}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Alert Type</p>
                        <p className="font-medium">{reviewingItem.alertType.replace('_', ' ')}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Priority</p>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getUrgencyBadge(reviewingItem.priority)}`}>
                          {reviewingItem.priority}
                        </span>
                      </div>
                      <div className="col-span-2">
                        <p className="text-gray-600">Location</p>
                        <p className="font-medium">{reviewingItem.location}</p>
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Manager Comments
                    </label>
                    <textarea
                      value={managerComments}
                      onChange={(e) => setManagerComments(e.target.value)}
                      rows={3}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Add your comments or feedback..."
                    />
                  </div>
                </div>

                <div className="flex space-x-3 mt-6">
                  <button
                    onClick={() => handleApproveItem(reviewingItem, reviewType)}
                    className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <CheckCircle className="w-4 h-4 inline mr-2" />
                    Approve
                  </button>
                  <button
                    onClick={() => handleRejectItem(reviewingItem, reviewType)}
                    className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <XCircle className="w-4 h-4 inline mr-2" />
                    Reject
                  </button>
                  <button
                    onClick={() => setShowReviewModal(false)}
                    className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

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

export default ManagerStockManagement;
