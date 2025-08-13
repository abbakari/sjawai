import React, { useState, useEffect } from 'react';
import {
  X,
  Package,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Clock,
  Truck,
  MapPin,
  User,
  Plus,
  Minus,
  Save,
  Send,
  Eye,
  Search,
  Filter,
  RefreshCw,
  CheckCircle,
  XCircle,
  Calendar,
  BarChart3,
  Target,
  Bell,
  ShoppingCart,
  ArrowUpRight,
  ArrowDownRight,
  MessageSquare
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import DataPersistenceManager from '../utils/dataPersistence';

interface StockItem {
  id: string;
  name: string;
  category: string;
  brand: string;
  currentStock: number;
  reservedStock: number;
  availableStock: number;
  git: number;
  minimumLevel: number;
  maximumLevel: number;
  unitPrice: number;
  location: string;
  lastUpdated: string;
  monthlyDemand: number;
  projectedDemand: number;
  reorderPoint: number;
  leadTime: number;
  supplierName: string;
  status: 'in_stock' | 'low_stock' | 'out_of_stock' | 'overstocked';
}

interface StockRequest {
  id: string;
  itemId: string;
  itemName: string;
  requestType: 'transfer' | 'reorder' | 'reservation';
  quantity: number;
  reason: string;
  customerName?: string;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  requestedBy: string;
  requestedAt: string;
  expectedDelivery?: string;
}

interface StockManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedItem?: any;
}

const StockManagementModal: React.FC<StockManagementModalProps> = ({
  isOpen,
  onClose,
  selectedItem
}) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'requests' | 'alerts' | 'projections'>('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [showNewRequestModal, setShowNewRequestModal] = useState(false);
  const [newRequest, setNewRequest] = useState<Partial<StockRequest>>({
    requestType: 'transfer',
    quantity: 0,
    reason: '',
    urgency: 'medium'
  });

  // Sample stock data
  const [stockItems, setStockItems] = useState<StockItem[]>([
    {
      id: 'st_001',
      name: 'BF GOODRICH TYRE 235/85R16 120/116S TL AT/TA KO2',
      category: 'Tyres',
      brand: 'BF Goodrich',
      currentStock: 86,
      reservedStock: 15,
      availableStock: 71,
      git: 0,
      minimumLevel: 20,
      maximumLevel: 150,
      unitPrice: 341,
      location: 'Warehouse A-1',
      lastUpdated: new Date().toISOString(),
      monthlyDemand: 45,
      projectedDemand: 52,
      reorderPoint: 30,
      leadTime: 14,
      supplierName: 'BF Goodrich Tanzania',
      status: 'in_stock'
    },
    {
      id: 'st_002',
      name: 'BF GOODRICH TYRE 265/65R17 120/117S TL AT/TA KO2',
      category: 'Tyres',
      brand: 'BF Goodrich',
      currentStock: 7,
      reservedStock: 5,
      availableStock: 2,
      git: 25,
      minimumLevel: 15,
      maximumLevel: 100,
      unitPrice: 412,
      location: 'Warehouse A-2',
      lastUpdated: new Date().toISOString(),
      monthlyDemand: 35,
      projectedDemand: 40,
      reorderPoint: 25,
      leadTime: 14,
      supplierName: 'BF Goodrich Tanzania',
      status: 'low_stock'
    },
    {
      id: 'st_003',
      name: 'MICHELIN TYRE 265/65R17 112T TL LTX TRAIL',
      category: 'Tyres',
      brand: 'Michelin',
      currentStock: 127,
      reservedStock: 8,
      availableStock: 119,
      git: 50,
      minimumLevel: 25,
      maximumLevel: 120,
      unitPrice: 300,
      location: 'Warehouse B-1',
      lastUpdated: new Date().toISOString(),
      monthlyDemand: 38,
      projectedDemand: 42,
      reorderPoint: 35,
      leadTime: 21,
      supplierName: 'Michelin East Africa',
      status: 'overstocked'
    },
    {
      id: 'st_004',
      name: 'VALVE 0214 TR 414J FOR CAR TUBELESS TYRE',
      category: 'Accessories',
      brand: 'Generic',
      currentStock: 2207,
      reservedStock: 150,
      availableStock: 2057,
      git: 0,
      minimumLevel: 500,
      maximumLevel: 3000,
      unitPrice: 0.5,
      location: 'Warehouse C-3',
      lastUpdated: new Date().toISOString(),
      monthlyDemand: 850,
      projectedDemand: 920,
      reorderPoint: 750,
      leadTime: 7,
      supplierName: 'Local Supplier',
      status: 'in_stock'
    }
  ]);

  const [stockRequests, setStockRequests] = useState<StockRequest[]>([
    {
      id: 'req_001',
      itemId: 'st_002',
      itemName: 'BF GOODRICH TYRE 265/65R17',
      requestType: 'reorder',
      quantity: 50,
      reason: 'Stock below minimum level - critical for upcoming customer orders',
      urgency: 'high',
      status: 'pending',
      requestedBy: user?.name || 'John Salesman',
      requestedAt: new Date().toISOString(),
      expectedDelivery: '2025-01-15'
    },
    {
      id: 'req_002',
      itemId: 'st_001',
      itemName: 'BF GOODRICH TYRE 235/85R16',
      requestType: 'reservation',
      quantity: 15,
      reason: 'Reserved for Action Aid International confirmed order',
      customerName: 'Action Aid International (Tz)',
      urgency: 'medium',
      status: 'approved',
      requestedBy: user?.name || 'John Salesman',
      requestedAt: new Date(Date.now() - 86400000).toISOString()
    }
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in_stock': return 'bg-green-100 text-green-800 border-green-200';
      case 'low_stock': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'out_of_stock': return 'bg-red-100 text-red-800 border-red-200';
      case 'overstocked': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRequestStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'approved': return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      case 'completed': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const filteredStockItems = stockItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.brand.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !filterCategory || item.category === filterCategory;
    const matchesStatus = !filterStatus || item.status === filterStatus;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleCreateRequest = () => {
    if (!newRequest.itemId || !newRequest.quantity || !newRequest.reason) {
      alert('Please fill in all required fields');
      return;
    }

    const selectedStockItem = stockItems.find(item => item.id === newRequest.itemId);
    const request: StockRequest = {
      id: `req_${Date.now()}`,
      itemId: newRequest.itemId!,
      itemName: selectedStockItem?.name || 'Unknown Item',
      requestType: newRequest.requestType!,
      quantity: newRequest.quantity!,
      reason: newRequest.reason!,
      customerName: newRequest.customerName,
      urgency: newRequest.urgency!,
      status: 'pending',
      requestedBy: user?.name || 'Unknown User',
      requestedAt: new Date().toISOString()
    };

    setStockRequests(prev => [request, ...prev]);
    setShowNewRequestModal(false);
    setNewRequest({
      requestType: 'transfer',
      quantity: 0,
      reason: '',
      urgency: 'medium'
    });
  };

  const handleReserveStock = (itemId: string, quantity: number, customerName: string) => {
    setStockItems(prev => prev.map(item => {
      if (item.id === itemId) {
        return {
          ...item,
          reservedStock: item.reservedStock + quantity,
          availableStock: item.availableStock - quantity
        };
      }
      return item;
    }));
  };

  const calculateStockMetrics = () => {
    const totalItems = stockItems.length;
    const lowStockItems = stockItems.filter(item => item.status === 'low_stock' || item.status === 'out_of_stock').length;
    const totalValue = stockItems.reduce((sum, item) => sum + (item.currentStock * item.unitPrice), 0);
    const totalReserved = stockItems.reduce((sum, item) => sum + item.reservedStock, 0);
    const pendingRequests = stockRequests.filter(req => req.status === 'pending').length;

    return { totalItems, lowStockItems, totalValue, totalReserved, pendingRequests };
  };

  const metrics = calculateStockMetrics();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[9999] p-2 sm:p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-7xl h-[95vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b bg-gradient-to-r from-blue-50 to-green-50 flex-shrink-0">
          <div className="flex-1">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
              📦 Stock Management System
              <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                {user?.role === 'manager' ? 'Manager Overview' : 'Salesman Dashboard'}
              </span>
            </h2>
            <p className="text-gray-600 text-sm sm:text-base mt-1">
              {user?.role === 'manager'
                ? 'Monitor inventory levels, review stock requests, and oversee stock management'
                : 'Manage inventory, track stock levels, and handle customer reservations'
              }
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            {user?.role === 'salesman' && (
              <button
                onClick={() => setShowNewRequestModal(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                New Request
              </button>
            )}
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>
        </div>

        {/* Metrics Dashboard */}
        <div className="p-4 bg-gray-50 border-b flex-shrink-0">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-white rounded-lg p-3 border">
              <div className="flex items-center gap-2 mb-1">
                <Package className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">Total Items</span>
              </div>
              <p className="text-xl font-bold text-blue-600">{metrics.totalItems}</p>
            </div>
            
            <div className="bg-white rounded-lg p-3 border">
              <div className="flex items-center gap-2 mb-1">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                <span className="text-sm font-medium text-red-900">Low Stock</span>
              </div>
              <p className="text-xl font-bold text-red-600">{metrics.lowStockItems}</p>
            </div>
            
            <div className="bg-white rounded-lg p-3 border">
              <div className="flex items-center gap-2 mb-1">
                <ShoppingCart className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-green-900">Total Value</span>
              </div>
              <p className="text-lg font-bold text-green-600">${metrics.totalValue.toLocaleString()}</p>
            </div>
            
            <div className="bg-white rounded-lg p-3 border">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="w-4 h-4 text-purple-600" />
                <span className="text-sm font-medium text-purple-900">Reserved</span>
              </div>
              <p className="text-xl font-bold text-purple-600">{metrics.totalReserved}</p>
            </div>
            
            <div className="bg-white rounded-lg p-3 border">
              <div className="flex items-center gap-2 mb-1">
                <Bell className="w-4 h-4 text-orange-600" />
                <span className="text-sm font-medium text-orange-900">Pending</span>
              </div>
              <p className="text-xl font-bold text-orange-600">{metrics.pendingRequests}</p>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b bg-white flex-shrink-0">
          {[
            { id: 'overview', label: 'Stock Overview', icon: Package },
            { id: 'requests', label: 'My Requests', icon: Send },
            { id: 'alerts', label: 'Alerts', icon: Bell },
            { id: 'projections', label: 'Projections', icon: BarChart3 }
          ].map((tab) => {
            const IconComponent = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-6 py-3 font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <IconComponent className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-hidden">
          {activeTab === 'overview' && (
            <div className="h-full overflow-y-auto p-6">
              {/* Search and Filters */}
              <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search items..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Categories</option>
                  <option value="Tyres">Tyres</option>
                  <option value="Accessories">Accessories</option>
                  <option value="Batteries">Batteries</option>
                </select>
                
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Status</option>
                  <option value="in_stock">In Stock</option>
                  <option value="low_stock">Low Stock</option>
                  <option value="out_of_stock">Out of Stock</option>
                  <option value="overstocked">Overstocked</option>
                </select>
              </div>

              {/* Stock Items Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {filteredStockItems.map((item) => (
                  <div key={item.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 mb-1 text-sm leading-tight">
                          {item.name}
                        </h3>
                        <p className="text-xs text-gray-600">{item.category} - {item.brand}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(item.status)}`}>
                        {item.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-3">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Current:</span>
                          <span className="font-medium">{item.currentStock}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Available:</span>
                          <span className="font-medium text-green-600">{item.availableStock}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Reserved:</span>
                          <span className="font-medium text-orange-600">{item.reservedStock}</span>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">GIT:</span>
                          <span className="font-medium text-blue-600">{item.git}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Min Level:</span>
                          <span className="font-medium">{item.minimumLevel}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Location:</span>
                          <span className="font-medium text-xs">{item.location}</span>
                        </div>
                      </div>
                    </div>

                    {/* Stock Level Bar */}
                    <div className="mb-3">
                      <div className="flex justify-between text-xs text-gray-600 mb-1">
                        <span>Stock Level</span>
                        <span>{Math.round((item.currentStock / item.maximumLevel) * 100)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-300 ${
                            item.currentStock < item.minimumLevel ? 'bg-red-500' :
                            item.currentStock > item.maximumLevel ? 'bg-blue-500' :
                            'bg-green-500'
                          }`}
                          style={{ 
                            width: `${Math.min((item.currentStock / item.maximumLevel) * 100, 100)}%`
                          }}
                        />
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      {user?.role === 'salesman' ? (
                        <>
                          <button
                            onClick={() => {
                              setNewRequest({
                                ...newRequest,
                                itemId: item.id,
                                requestType: 'reservation'
                              });
                              setShowNewRequestModal(true);
                            }}
                            className="flex-1 bg-blue-100 text-blue-800 px-3 py-2 rounded text-xs hover:bg-blue-200 transition-colors flex items-center justify-center gap-1"
                          >
                            <Clock className="w-3 h-3" />
                            Reserve
                          </button>

                          <button
                            onClick={() => {
                              setNewRequest({
                                ...newRequest,
                                itemId: item.id,
                                requestType: 'reorder'
                              });
                              setShowNewRequestModal(true);
                            }}
                            className="flex-1 bg-green-100 text-green-800 px-3 py-2 rounded text-xs hover:bg-green-200 transition-colors flex items-center justify-center gap-1"
                          >
                            <RefreshCw className="w-3 h-3" />
                            Reorder
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            className="flex-1 bg-blue-100 text-blue-800 px-3 py-2 rounded text-xs hover:bg-blue-200 transition-colors flex items-center justify-center gap-1"
                            onClick={() => {
                              alert(`Stock Details for ${item.name}:\n\nCurrent Stock: ${item.currentStock}\nReserved: ${item.reservedStock}\nAvailable: ${item.availableStock}\nGIT: ${item.git}\nLocation: ${item.location}\nSupplier: ${item.supplierName}\nLast Updated: ${new Date(item.lastUpdated).toLocaleDateString()}`);
                            }}
                          >
                            <Eye className="w-3 h-3" />
                            View Details
                          </button>

                          <button
                            className="flex-1 bg-green-100 text-green-800 px-3 py-2 rounded text-xs hover:bg-green-200 transition-colors flex items-center justify-center gap-1"
                            onClick={() => {
                              const requestingAction = item.currentStock < item.minimumLevel ? 'reorder request' : 'stock inquiry';
                              alert(`Contact initiated for ${item.name}:\n\nAction: ${requestingAction}\nCurrent Status: ${item.status.replace('_', ' ')}\n\nThis would normally send a notification to the assigned salesman or supply chain team.`);
                            }}
                          >
                            <MessageSquare className="w-3 h-3" />
                            Contact Team
                          </button>
                        </>
                      )}

                      <button
                        className="flex-1 bg-gray-100 text-gray-800 px-3 py-2 rounded text-xs hover:bg-gray-200 transition-colors flex items-center justify-center gap-1"
                        onClick={() => {
                          const gitSummary = DataPersistenceManager.getGitSummaryForItem(item.name.split(' ')[0], item.name);
                          alert(`Extended Details for ${item.name}:\n\nStock Analysis:\n- Current: ${item.currentStock} units\n- Monthly Demand: ${item.monthlyDemand} units\n- Days of Supply: ${Math.floor(item.availableStock / (item.monthlyDemand / 30))} days\n- Reorder Point: ${item.reorderPoint} units\n\nGIT Information:\n- GIT Quantity: ${gitSummary.gitQuantity} units\n- Status: ${gitSummary.status}\n- ETA: ${gitSummary.eta ? new Date(gitSummary.eta).toLocaleDateString() : 'N/A'}`);
                        }}
                      >
                        <Eye className="w-3 h-3" />
                        Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'requests' && (
            <div className="h-full overflow-y-auto p-6">
              <div className="space-y-4">
                {stockRequests.map((request) => (
                  <div key={request.id} className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium text-gray-900">{request.itemName}</h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getRequestStatusColor(request.status)}`}>
                            {request.status.toUpperCase()}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getUrgencyColor(request.urgency)}`}>
                            {request.urgency.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">{request.requestType.replace('_', ' ').toUpperCase()} - {request.quantity} units</p>
                      </div>
                      <div className="text-right text-sm text-gray-500">
                        {new Date(request.requestedAt).toLocaleDateString()}
                      </div>
                    </div>
                    
                    <div className="mb-3">
                      <p className="text-sm text-gray-700">{request.reason}</p>
                      {request.customerName && (
                        <p className="text-sm text-blue-600 mt-1">Customer: {request.customerName}</p>
                      )}
                    </div>
                    
                    {request.expectedDelivery && (
                      <div className="text-sm text-green-600">
                        Expected delivery: {new Date(request.expectedDelivery).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'alerts' && (
            <div className="h-full overflow-y-auto p-6">
              <div className="space-y-4">
                {stockItems.filter(item => item.status === 'low_stock' || item.status === 'out_of_stock').map((item) => (
                  <div key={item.id} className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium text-red-900 mb-1">{item.name}</h3>
                        <p className="text-sm text-red-700">
                          Current stock: {item.currentStock} units (Below minimum: {item.minimumLevel})
                        </p>
                        <p className="text-sm text-red-600 mt-1">
                          Projected stockout in {Math.floor(item.currentStock / (item.monthlyDemand / 30))} days
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          setNewRequest({
                            ...newRequest,
                            itemId: item.id,
                            requestType: 'reorder',
                            quantity: item.maximumLevel - item.currentStock,
                            reason: `Emergency reorder - stock below minimum level`,
                            urgency: 'high'
                          });
                          setShowNewRequestModal(true);
                        }}
                        className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                      >
                        <RefreshCw className="w-4 h-4" />
                        Reorder Now
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'projections' && (
            <div className="h-full overflow-y-auto p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {stockItems.map((item) => (
                  <div key={item.id} className="bg-white border border-gray-200 rounded-lg p-4">
                    <h3 className="font-medium text-gray-900 mb-3">{item.name}</h3>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Monthly Demand:</span>
                        <span className="font-medium">{item.monthlyDemand} units</span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Projected Demand:</span>
                        <span className="font-medium text-blue-600">{item.projectedDemand} units</span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Days of Supply:</span>
                        <span className="font-medium">
                          {Math.floor(item.availableStock / (item.monthlyDemand / 30))} days
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Reorder Point:</span>
                        <span className={`font-medium ${
                          item.currentStock <= item.reorderPoint ? 'text-red-600' : 'text-green-600'
                        }`}>
                          {item.reorderPoint} units
                        </span>
                      </div>
                      
                      <div className="pt-3 border-t">
                        <div className="text-sm text-gray-600 mb-2">Trend Analysis:</div>
                        <div className="flex items-center gap-2">
                          {item.projectedDemand > item.monthlyDemand ? (
                            <>
                              <ArrowUpRight className="w-4 h-4 text-red-500" />
                              <span className="text-red-600 text-sm">Increasing demand</span>
                            </>
                          ) : (
                            <>
                              <ArrowDownRight className="w-4 h-4 text-green-500" />
                              <span className="text-green-600 text-sm">Stable/decreasing demand</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* New Request Modal */}
      {showNewRequestModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[10000] p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Create Stock Request</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Item</label>
                  <select
                    value={newRequest.itemId || ''}
                    onChange={(e) => setNewRequest({...newRequest, itemId: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select item</option>
                    {stockItems.map(item => (
                      <option key={item.id} value={item.id}>{item.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Request Type</label>
                  <select
                    value={newRequest.requestType}
                    onChange={(e) => setNewRequest({...newRequest, requestType: e.target.value as any})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="transfer">Transfer</option>
                    <option value="reorder">Reorder</option>
                    <option value="reservation">Reservation</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
                  <input
                    type="number"
                    value={newRequest.quantity}
                    onChange={(e) => setNewRequest({...newRequest, quantity: parseInt(e.target.value) || 0})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    min="1"
                  />
                </div>

                {newRequest.requestType === 'reservation' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Customer Name</label>
                    <input
                      type="text"
                      value={newRequest.customerName || ''}
                      onChange={(e) => setNewRequest({...newRequest, customerName: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                      placeholder="Customer name"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Urgency</label>
                  <select
                    value={newRequest.urgency}
                    onChange={(e) => setNewRequest({...newRequest, urgency: e.target.value as any})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Reason</label>
                  <textarea
                    value={newRequest.reason}
                    onChange={(e) => setNewRequest({...newRequest, reason: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    placeholder="Explain the reason for this request..."
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleCreateRequest}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Create Request
                </button>
                <button
                  onClick={() => setShowNewRequestModal(false)}
                  className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StockManagementModal;
