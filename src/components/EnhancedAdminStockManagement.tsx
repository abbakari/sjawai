import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  Package,
  Search,
  Filter,
  Save,
  Upload,
  Download,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Plus,
  Edit3,
  Trash2,
  Eye,
  BarChart3,
  TrendingUp,
  Target,
  Users,
  DollarSign
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface StockItem {
  id: string;
  customer: string;
  item: string;
  category: string;
  brand: string;
  currentStock: number;
  minStockLevel: number;
  maxStockLevel: number;
  unitCost: number;
  unitPrice: number;
  supplier: string;
  lastUpdated: string;
  updatedBy: string;
  stockValue: number;
  stockStatus: 'critical' | 'low' | 'normal' | 'high';
  demandForecast: number;
  leadTime: number; // in days
  reorderPoint: number;
  location: string;
}

interface StockOperation {
  id: string;
  itemId: string;
  operation: 'increase' | 'decrease' | 'set';
  quantity: number;
  reason: string;
  performedBy: string;
  timestamp: string;
  previousStock: number;
  newStock: number;
}

interface EnhancedAdminStockManagementProps {
  isOpen: boolean;
  onClose: () => void;
}

const EnhancedAdminStockManagement: React.FC<EnhancedAdminStockManagementProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [stockItems, setStockItems] = useState<StockItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<StockItem[]>([]);
  const [operations, setOperations] = useState<StockOperation[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'manage' | 'history' | 'analytics'>('overview');
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCustomer, setFilterCustomer] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterBrand, setFilterBrand] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  
  // Bulk operations
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [bulkOperation, setBulkOperation] = useState<'increase' | 'decrease' | 'set'>('set');
  const [bulkQuantity, setBulkQuantity] = useState(0);
  const [bulkReason, setBulkReason] = useState('');
  
  // Edit mode
  const [editingItem, setEditingItem] = useState<StockItem | null>(null);
  const [editForm, setEditForm] = useState<Partial<StockItem>>({});

  useEffect(() => {
    if (isOpen) {
      loadStockData();
      loadOperationHistory();
    }
  }, [isOpen]);

  useEffect(() => {
    applyFilters();
  }, [stockItems, searchTerm, filterCustomer, filterCategory, filterBrand, filterStatus]);

  const loadStockData = () => {
    try {
      const savedStock = localStorage.getItem('admin_enhanced_stock_data');
      if (savedStock) {
        setStockItems(JSON.parse(savedStock));
      } else {
        // Initialize with sample data
        const sampleStock: StockItem[] = [
          {
            id: '1',
            customer: 'Action Aid International (Tz)',
            item: 'BF GOODRICH TYRE 235/85R16 120/116S TL AT/TA KO2 LRERWLGO',
            category: 'Tyres',
            brand: 'BF Goodrich',
            currentStock: 45,
            minStockLevel: 20,
            maxStockLevel: 200,
            unitCost: 280,
            unitPrice: 341,
            supplier: 'BF Goodrich Direct',
            lastUpdated: new Date().toISOString(),
            updatedBy: 'admin',
            stockValue: 45 * 280,
            stockStatus: 'low',
            demandForecast: 85,
            leadTime: 14,
            reorderPoint: 35,
            location: 'Warehouse A'
          },
          {
            id: '2',
            customer: 'Action Aid International (Tz)',
            item: 'BF GOODRICH TYRE 265/65R17 120/117S TL AT/TA KO2 LRERWLGO',
            category: 'Tyres',
            brand: 'BF Goodrich',
            currentStock: 7,
            minStockLevel: 15,
            maxStockLevel: 150,
            unitCost: 340,
            unitPrice: 412,
            supplier: 'BF Goodrich Direct',
            lastUpdated: new Date().toISOString(),
            updatedBy: 'admin',
            stockValue: 7 * 340,
            stockStatus: 'critical',
            demandForecast: 60,
            leadTime: 14,
            reorderPoint: 25,
            location: 'Warehouse A'
          },
          {
            id: '3',
            customer: 'Action Aid International (Tz)',
            item: 'MICHELIN TYRE 265/65R17 112T TL LTX TRAIL',
            category: 'Tyres',
            brand: 'Michelin',
            currentStock: 127,
            minStockLevel: 30,
            maxStockLevel: 180,
            unitCost: 250,
            unitPrice: 300,
            supplier: 'Michelin Official',
            lastUpdated: new Date().toISOString(),
            updatedBy: 'admin',
            stockValue: 127 * 250,
            stockStatus: 'normal',
            demandForecast: 95,
            leadTime: 10,
            reorderPoint: 40,
            location: 'Warehouse B'
          },
          {
            id: '4',
            customer: 'Action Aid International (Tz)',
            item: 'VALVE 0214 TR 414J FOR CAR TUBELESS TYRE',
            category: 'Accessories',
            brand: 'Generic',
            currentStock: 2207,
            minStockLevel: 500,
            maxStockLevel: 3000,
            unitCost: 0.3,
            unitPrice: 0.5,
            supplier: 'Local Supplier',
            lastUpdated: new Date().toISOString(),
            updatedBy: 'admin',
            stockValue: 2207 * 0.3,
            stockStatus: 'normal',
            demandForecast: 1200,
            leadTime: 7,
            reorderPoint: 600,
            location: 'Warehouse C'
          }
        ];
        setStockItems(sampleStock);
        localStorage.setItem('admin_enhanced_stock_data', JSON.stringify(sampleStock));
      }
    } catch (error) {
      console.error('Error loading stock data:', error);
    }
  };

  const loadOperationHistory = () => {
    try {
      const savedOperations = localStorage.getItem('admin_stock_operations');
      if (savedOperations) {
        setOperations(JSON.parse(savedOperations));
      }
    } catch (error) {
      console.error('Error loading operation history:', error);
    }
  };

  const applyFilters = () => {
    let filtered = stockItems;

    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.item.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterCustomer) {
      filtered = filtered.filter(item => item.customer === filterCustomer);
    }

    if (filterCategory) {
      filtered = filtered.filter(item => item.category === filterCategory);
    }

    if (filterBrand) {
      filtered = filtered.filter(item => item.brand === filterBrand);
    }

    if (filterStatus) {
      filtered = filtered.filter(item => item.stockStatus === filterStatus);
    }

    setFilteredItems(filtered);
  };

  const updateStock = (itemId: string, operation: 'increase' | 'decrease' | 'set', quantity: number, reason: string) => {
    const item = stockItems.find(i => i.id === itemId);
    if (!item) return;

    let newStock: number;
    switch (operation) {
      case 'increase':
        newStock = item.currentStock + quantity;
        break;
      case 'decrease':
        newStock = Math.max(0, item.currentStock - quantity);
        break;
      case 'set':
        newStock = quantity;
        break;
      default:
        return;
    }

    // Determine stock status
    let stockStatus: 'critical' | 'low' | 'normal' | 'high';
    if (newStock <= item.minStockLevel * 0.5) {
      stockStatus = 'critical';
    } else if (newStock <= item.minStockLevel) {
      stockStatus = 'low';
    } else if (newStock >= item.maxStockLevel) {
      stockStatus = 'high';
    } else {
      stockStatus = 'normal';
    }

    const updatedItem = {
      ...item,
      currentStock: newStock,
      stockValue: newStock * item.unitCost,
      stockStatus,
      lastUpdated: new Date().toISOString(),
      updatedBy: user?.name || 'admin'
    };

    const updatedItems = stockItems.map(i => i.id === itemId ? updatedItem : i);
    setStockItems(updatedItems);
    localStorage.setItem('admin_enhanced_stock_data', JSON.stringify(updatedItems));

    // Also update the legacy global stock data for other dashboards
    updateGlobalStockData(updatedItems);

    // Record operation
    const operation_record: StockOperation = {
      id: Date.now().toString(),
      itemId,
      operation,
      quantity,
      reason,
      performedBy: user?.name || 'admin',
      timestamp: new Date().toISOString(),
      previousStock: item.currentStock,
      newStock
    };

    const updatedOperations = [operation_record, ...operations];
    setOperations(updatedOperations);
    localStorage.setItem('admin_stock_operations', JSON.stringify(updatedOperations));
  };

  const updateGlobalStockData = (items: StockItem[]) => {
    // Update the legacy format for compatibility with other components
    const legacyFormat = items.map(item => ({
      customer: item.customer,
      item: item.item,
      stockQuantity: item.currentStock
    }));
    localStorage.setItem('admin_global_stock_data', JSON.stringify(legacyFormat));
  };

  const handleBulkUpdate = () => {
    if (selectedItems.size === 0 || !bulkQuantity || !bulkReason) {
      alert('Please select items, enter quantity and reason');
      return;
    }

    selectedItems.forEach(itemId => {
      updateStock(itemId, bulkOperation, bulkQuantity, bulkReason);
    });

    setSelectedItems(new Set());
    setBulkQuantity(0);
    setBulkReason('');
    alert(`Bulk ${bulkOperation} operation completed for ${selectedItems.size} items`);
  };

  const handleSaveEdit = () => {
    if (!editingItem || !editForm) return;

    const updatedItem = { ...editingItem, ...editForm, lastUpdated: new Date().toISOString(), updatedBy: user?.name || 'admin' };
    const updatedItems = stockItems.map(item => item.id === editingItem.id ? updatedItem : item);
    
    setStockItems(updatedItems);
    localStorage.setItem('admin_enhanced_stock_data', JSON.stringify(updatedItems));
    updateGlobalStockData(updatedItems);
    
    setEditingItem(null);
    setEditForm({});
    alert('Item updated successfully');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'critical': return 'text-red-700 bg-red-100 border-red-200';
      case 'low': return 'text-orange-700 bg-orange-100 border-orange-200';
      case 'normal': return 'text-green-700 bg-green-100 border-green-200';
      case 'high': return 'text-blue-700 bg-blue-100 border-blue-200';
      default: return 'text-gray-700 bg-gray-100 border-gray-200';
    }
  };

  const uniqueValues = useMemo(() => {
    return {
      customers: Array.from(new Set(stockItems.map(item => item.customer))).sort(),
      categories: Array.from(new Set(stockItems.map(item => item.category))).sort(),
      brands: Array.from(new Set(stockItems.map(item => item.brand))).sort()
    };
  }, [stockItems]);

  const stockStats = useMemo(() => {
    const totalValue = stockItems.reduce((sum, item) => sum + item.stockValue, 0);
    const criticalCount = stockItems.filter(item => item.stockStatus === 'critical').length;
    const lowCount = stockItems.filter(item => item.stockStatus === 'low').length;
    const totalItems = stockItems.reduce((sum, item) => sum + item.currentStock, 0);
    const averageValue = stockItems.length > 0 ? totalValue / stockItems.length : 0;

    return { totalValue, criticalCount, lowCount, totalItems, averageValue };
  }, [stockItems]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-7xl h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Package className="w-6 h-6 text-blue-600" />
              <div>
                <h2 className="text-xl font-bold text-gray-900">Enhanced Admin Stock Management</h2>
                <p className="text-sm text-gray-600">
                  Manage stock levels across all customers, categories, and items
                </p>
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
          <div className="flex space-x-1 mt-4">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'manage', label: 'Manage Stock', icon: Package },
              { id: 'history', label: 'History', icon: RefreshCw },
              { id: 'analytics', label: 'Analytics', icon: TrendingUp }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {activeTab === 'overview' && (
            <div className="p-6 space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <DollarSign className="w-5 h-5 text-blue-600" />
                    <span className="text-sm font-medium text-blue-800">Total Stock Value</span>
                  </div>
                  <div className="text-2xl font-bold text-blue-900">
                    ${stockStats.totalValue.toLocaleString()}
                  </div>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <Package className="w-5 h-5 text-green-600" />
                    <span className="text-sm font-medium text-green-800">Total Items</span>
                  </div>
                  <div className="text-2xl font-bold text-green-900">
                    {stockStats.totalItems.toLocaleString()}
                  </div>
                </div>
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <AlertTriangle className="w-5 h-5 text-orange-600" />
                    <span className="text-sm font-medium text-orange-800">Low Stock</span>
                  </div>
                  <div className="text-2xl font-bold text-orange-900">
                    {stockStats.lowCount}
                  </div>
                </div>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <Target className="w-5 h-5 text-red-600" />
                    <span className="text-sm font-medium text-red-800">Critical Stock</span>
                  </div>
                  <div className="text-2xl font-bold text-red-900">
                    {stockStats.criticalCount}
                  </div>
                </div>
              </div>

              {/* Critical Items Alert */}
              {stockStats.criticalCount > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                    <span className="text-sm font-medium text-red-800">Critical Stock Alert</span>
                  </div>
                  <div className="space-y-2">
                    {stockItems.filter(item => item.stockStatus === 'critical').map(item => (
                      <div key={item.id} className="bg-white border border-red-200 rounded p-3">
                        <div className="font-medium text-red-900">{item.item}</div>
                        <div className="text-sm text-red-700">
                          Current Stock: {item.currentStock} | Min Level: {item.minStockLevel} | Customer: {item.customer}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recent Operations */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Stock Operations</h3>
                <div className="space-y-3">
                  {operations.slice(0, 5).map(op => {
                    const item = stockItems.find(i => i.id === op.itemId);
                    return (
                      <div key={op.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <div className="font-medium text-gray-900">{item?.item || 'Unknown Item'}</div>
                          <div className="text-sm text-gray-600">
                            {op.operation}: {op.previousStock} → {op.newStock} ({op.reason})
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-500">{op.performedBy}</div>
                          <div className="text-xs text-gray-400">{new Date(op.timestamp).toLocaleString()}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'manage' && (
            <div className="p-6 space-y-6">
              {/* Filters */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
                  <div className="relative">
                    <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search items..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <select
                    value={filterCustomer}
                    onChange={(e) => setFilterCustomer(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">All Customers</option>
                    {uniqueValues.customers.map(customer => (
                      <option key={customer} value={customer}>{customer}</option>
                    ))}
                  </select>
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">All Categories</option>
                    {uniqueValues.categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                  <select
                    value={filterBrand}
                    onChange={(e) => setFilterBrand(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">All Brands</option>
                    {uniqueValues.brands.map(brand => (
                      <option key={brand} value={brand}>{brand}</option>
                    ))}
                  </select>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">All Status</option>
                    <option value="critical">Critical</option>
                    <option value="low">Low</option>
                    <option value="normal">Normal</option>
                    <option value="high">High</option>
                  </select>
                </div>

                {/* Bulk Operations */}
                {selectedItems.size > 0 && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center gap-4 mb-3">
                      <span className="text-sm font-medium text-blue-800">
                        Bulk Operation ({selectedItems.size} items selected)
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                      <select
                        value={bulkOperation}
                        onChange={(e) => setBulkOperation(e.target.value as any)}
                        className="px-3 py-2 border border-gray-300 rounded-lg"
                      >
                        <option value="set">Set Stock</option>
                        <option value="increase">Increase Stock</option>
                        <option value="decrease">Decrease Stock</option>
                      </select>
                      <input
                        type="number"
                        placeholder="Quantity"
                        value={bulkQuantity || ''}
                        onChange={(e) => setBulkQuantity(parseInt(e.target.value) || 0)}
                        className="px-3 py-2 border border-gray-300 rounded-lg"
                      />
                      <input
                        type="text"
                        placeholder="Reason"
                        value={bulkReason}
                        onChange={(e) => setBulkReason(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg"
                      />
                      <button
                        onClick={handleBulkUpdate}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Apply Bulk Operation
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Stock Items Table */}
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div className="max-h-[60vh] overflow-y-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          <input
                            type="checkbox"
                            checked={selectedItems.size === filteredItems.length && filteredItems.length > 0}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedItems(new Set(filteredItems.map(item => item.id)));
                              } else {
                                setSelectedItems(new Set());
                              }
                            }}
                            className="rounded"
                          />
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Brand</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Current Stock</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Value</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filteredItems.map((item) => (
                        <tr key={item.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <input
                              type="checkbox"
                              checked={selectedItems.has(item.id)}
                              onChange={(e) => {
                                const newSelected = new Set(selectedItems);
                                if (e.target.checked) {
                                  newSelected.add(item.id);
                                } else {
                                  newSelected.delete(item.id);
                                }
                                setSelectedItems(newSelected);
                              }}
                              className="rounded"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <div className="text-sm font-medium text-gray-900 max-w-xs truncate" title={item.item}>
                              {item.item}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">{item.customer}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{item.category}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{item.brand}</td>
                          <td className="px-4 py-3">
                            <div className="text-sm font-medium text-gray-900">{item.currentStock}</div>
                            <div className="text-xs text-gray-500">Min: {item.minStockLevel} | Max: {item.maxStockLevel}</div>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(item.stockStatus)}`}>
                              {item.stockStatus}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">${item.stockValue.toLocaleString()}</td>
                          <td className="px-4 py-3">
                            <div className="flex gap-1">
                              <button
                                onClick={() => {
                                  setEditingItem(item);
                                  setEditForm(item);
                                }}
                                className="p-1 bg-blue-100 text-blue-600 rounded hover:bg-blue-200 transition-colors"
                                title="Edit"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => {
                                  const quantity = prompt('Enter new stock quantity:');
                                  const reason = prompt('Enter reason:');
                                  if (quantity && reason) {
                                    updateStock(item.id, 'set', parseInt(quantity), reason);
                                  }
                                }}
                                className="p-1 bg-green-100 text-green-600 rounded hover:bg-green-200 transition-colors"
                                title="Quick Update"
                              >
                                <Package className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="p-6 space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Stock Operation History</h3>
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div className="max-h-[60vh] overflow-y-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Timestamp</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Operation</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Change</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reason</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Performed By</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {operations.map((op) => {
                        const item = stockItems.find(i => i.id === op.itemId);
                        return (
                          <tr key={op.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm text-gray-600">
                              {new Date(op.timestamp).toLocaleString()}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900 max-w-xs truncate">
                              {item?.item || 'Unknown Item'}
                            </td>
                            <td className="px-4 py-3">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                op.operation === 'increase' ? 'bg-green-100 text-green-800' :
                                op.operation === 'decrease' ? 'bg-red-100 text-red-800' :
                                'bg-blue-100 text-blue-800'
                              }`}>
                                {op.operation}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900">
                              {op.previousStock} → {op.newStock}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600">{op.reason}</td>
                            <td className="px-4 py-3 text-sm text-gray-600">{op.performedBy}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="p-6 space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Stock Analytics</h3>
              
              {/* Analytics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h4 className="text-md font-medium text-gray-900 mb-4">Stock by Category</h4>
                  <div className="space-y-3">
                    {uniqueValues.categories.map(category => {
                      const categoryItems = stockItems.filter(item => item.category === category);
                      const totalStock = categoryItems.reduce((sum, item) => sum + item.currentStock, 0);
                      const totalValue = categoryItems.reduce((sum, item) => sum + item.stockValue, 0);
                      return (
                        <div key={category} className="flex justify-between items-center">
                          <span className="text-sm text-gray-700">{category}</span>
                          <div className="text-right">
                            <div className="text-sm font-medium text-gray-900">{totalStock} units</div>
                            <div className="text-xs text-gray-500">${totalValue.toLocaleString()}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h4 className="text-md font-medium text-gray-900 mb-4">Stock by Brand</h4>
                  <div className="space-y-3">
                    {uniqueValues.brands.map(brand => {
                      const brandItems = stockItems.filter(item => item.brand === brand);
                      const totalStock = brandItems.reduce((sum, item) => sum + item.currentStock, 0);
                      const totalValue = brandItems.reduce((sum, item) => sum + item.stockValue, 0);
                      return (
                        <div key={brand} className="flex justify-between items-center">
                          <span className="text-sm text-gray-700">{brand}</span>
                          <div className="text-right">
                            <div className="text-sm font-medium text-gray-900">{totalStock} units</div>
                            <div className="text-xs text-gray-500">${totalValue.toLocaleString()}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h4 className="text-md font-medium text-gray-900 mb-4">Stock Status Distribution</h4>
                  <div className="space-y-3">
                    {['critical', 'low', 'normal', 'high'].map(status => {
                      const count = stockItems.filter(item => item.stockStatus === status).length;
                      const percentage = stockItems.length > 0 ? (count / stockItems.length) * 100 : 0;
                      return (
                        <div key={status} className="flex justify-between items-center">
                          <span className={`text-sm px-2 py-1 rounded-full ${getStatusColor(status)}`}>
                            {status}
                          </span>
                          <div className="text-right">
                            <div className="text-sm font-medium text-gray-900">{count} items</div>
                            <div className="text-xs text-gray-500">{percentage.toFixed(1)}%</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Edit Modal */}
        {editingItem && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
              <div className="border-b border-gray-200 px-6 py-4">
                <h3 className="text-lg font-semibold text-gray-900">Edit Stock Item</h3>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Current Stock</label>
                    <input
                      type="number"
                      value={editForm.currentStock || ''}
                      onChange={(e) => setEditForm(prev => ({ ...prev, currentStock: parseInt(e.target.value) || 0 }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Min Stock Level</label>
                    <input
                      type="number"
                      value={editForm.minStockLevel || ''}
                      onChange={(e) => setEditForm(prev => ({ ...prev, minStockLevel: parseInt(e.target.value) || 0 }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Max Stock Level</label>
                    <input
                      type="number"
                      value={editForm.maxStockLevel || ''}
                      onChange={(e) => setEditForm(prev => ({ ...prev, maxStockLevel: parseInt(e.target.value) || 0 }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Unit Cost</label>
                    <input
                      type="number"
                      step="0.01"
                      value={editForm.unitCost || ''}
                      onChange={(e) => setEditForm(prev => ({ ...prev, unitCost: parseFloat(e.target.value) || 0 }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>
              <div className="border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
                <button
                  onClick={() => {
                    setEditingItem(null);
                    setEditForm({});
                  }}
                  className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EnhancedAdminStockManagement;
