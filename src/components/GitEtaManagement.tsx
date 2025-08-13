import React, { useState, useEffect } from 'react';
import { 
  X, 
  Upload, 
  Download, 
  Calendar, 
  Package, 
  Truck,
  AlertCircle,
  CheckCircle,
  Edit,
  Trash2,
  Search,
  Filter,
  Plus
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface GitEtaItem {
  id: string;
  customer: string;
  item: string;
  category: string;
  brand: string;
  gitQuantity: number;
  eta: string;
  supplier: string;
  poNumber: string;
  status: 'ordered' | 'shipped' | 'in_transit' | 'arrived' | 'delayed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  createdBy: string;
  createdAt: string;
  lastUpdated: string;
  notes?: string;
  trackingNumber?: string;
  estimatedValue: number;
}

interface GitEtaManagementProps {
  isOpen: boolean;
  onClose: () => void;
}

const GitEtaManagement: React.FC<GitEtaManagementProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [gitItems, setGitItems] = useState<GitEtaItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<GitEtaItem[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<GitEtaItem | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [existingData, setExistingData] = useState<{
    customers: string[];
    items: string[];
    categories: string[];
    brands: string[];
    suppliers: string[];
  }>({
    customers: [],
    items: [],
    categories: [],
    brands: [],
    suppliers: []
  });
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<keyof GitEtaItem>('eta');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Form state for adding/editing
  const [formData, setFormData] = useState<Partial<GitEtaItem>>({
    customer: '',
    item: '',
    category: '',
    brand: '',
    gitQuantity: 0,
    eta: '',
    supplier: '',
    poNumber: '',
    status: 'ordered',
    priority: 'medium',
    notes: '',
    trackingNumber: '',
    estimatedValue: 0
  });

  // Load existing data from sales budget and forecast tables
  const loadExistingData = () => {
    const customers = new Set<string>();
    const items = new Set<string>();
    const categories = new Set<string>();
    const brands = new Set<string>();
    const suppliers = new Set<string>();

    // Load from sales budget data
    const salesBudgetData = localStorage.getItem('salesBudgetData');
    if (salesBudgetData) {
      try {
        const budgetData = JSON.parse(salesBudgetData);
        budgetData.forEach((item: any) => {
          if (item.customer) customers.add(item.customer);
          if (item.item) items.add(item.item);
          if (item.category) categories.add(item.category);
          if (item.brand) brands.add(item.brand);
        });
      } catch (error) {
        console.error('Error loading sales budget data:', error);
      }
    }

    // Load from rolling forecast data
    const forecastData = localStorage.getItem('rolling_forecast_saved_data');
    if (forecastData) {
      try {
        const forecast = JSON.parse(forecastData);
        forecast.forEach((item: any) => {
          if (item.customer) customers.add(item.customer);
          if (item.item) items.add(item.item);
          if (item.category) categories.add(item.category);
          if (item.brand) brands.add(item.brand);
        });
      } catch (error) {
        console.error('Error loading forecast data:', error);
      }
    }

    // Load from existing GIT data for suppliers
    gitItems.forEach(item => {
      if (item.supplier) suppliers.add(item.supplier);
    });

    // Add some default suppliers
    suppliers.add('BF Goodrich');
    suppliers.add('Michelin');
    suppliers.add('Bridgestone');
    suppliers.add('Continental');
    suppliers.add('Pirelli');

    setExistingData({
      customers: Array.from(customers).sort(),
      items: Array.from(items).sort(),
      categories: Array.from(categories).sort(),
      brands: Array.from(brands).sort(),
      suppliers: Array.from(suppliers).sort()
    });
  };

  // Load GIT/ETA data from localStorage
  useEffect(() => {
    const savedData = localStorage.getItem('git_eta_data');
    if (savedData) {
      const data = JSON.parse(savedData);
      setGitItems(data);
      setFilteredItems(data);
    }
    loadExistingData();
  }, []);

  // Reload existing data when git items change
  useEffect(() => {
    loadExistingData();
  }, [gitItems]);

  // Filter and search items
  useEffect(() => {
    let filtered = [...gitItems];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.item.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.supplier.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.poNumber.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(item => item.status === statusFilter);
    }

    // Apply priority filter
    if (priorityFilter !== 'all') {
      filtered = filtered.filter(item => item.priority === priorityFilter);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortDirection === 'asc' 
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }
      
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
      }
      
      return 0;
    });

    setFilteredItems(filtered);
  }, [gitItems, searchTerm, statusFilter, priorityFilter, sortField, sortDirection]);

  const saveData = (data: GitEtaItem[]) => {
    localStorage.setItem('git_eta_data', JSON.stringify(data));
    setGitItems(data);
  };

  const handleAddItem = () => {
    if (!formData.customer || !formData.item || !formData.gitQuantity || !formData.eta) {
      alert('Please fill in all required fields');
      return;
    }

    const newItem: GitEtaItem = {
      id: `git_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      customer: formData.customer!,
      item: formData.item!,
      category: formData.category || 'Unknown',
      brand: formData.brand || 'Unknown',
      gitQuantity: formData.gitQuantity!,
      eta: formData.eta!,
      supplier: formData.supplier || 'Unknown',
      poNumber: formData.poNumber || '',
      status: formData.status || 'ordered',
      priority: formData.priority || 'medium',
      createdBy: user?.name || 'Admin',
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
      notes: formData.notes || '',
      trackingNumber: formData.trackingNumber || '',
      estimatedValue: formData.estimatedValue || 0
    };

    const updatedItems = [...gitItems, newItem];
    saveData(updatedItems);
    setIsAddModalOpen(false);
    resetForm();

    // Show success notification
    alert(`GIT item added successfully!\n\nThis information is now visible to all users in their Sales Budget and Rolling Forecast tables:\n• Customer: ${newItem.customer}\n• Item: ${newItem.item}\n• Quantity: ${newItem.gitQuantity.toLocaleString()} units\n• ETA: ${new Date(newItem.eta).toLocaleDateString()}\n• Status: ${newItem.status.toUpperCase()}`);
  };

  const handleEditItem = (item: GitEtaItem) => {
    setEditingItem(item);
    setFormData(item);
    setIsAddModalOpen(true);
  };

  const handleUpdateItem = () => {
    if (!editingItem || !formData.customer || !formData.item || !formData.gitQuantity || !formData.eta) {
      alert('Please fill in all required fields');
      return;
    }

    const updatedItem: GitEtaItem = {
      ...editingItem,
      ...formData,
      lastUpdated: new Date().toISOString()
    } as GitEtaItem;

    const updatedItems = gitItems.map(item => 
      item.id === editingItem.id ? updatedItem : item
    );
    
    saveData(updatedItems);
    setIsAddModalOpen(false);
    setEditingItem(null);
    resetForm();

    // Show success notification
    alert(`GIT item updated successfully!\n\nThe updated information is now visible to all users in their Sales Budget and Rolling Forecast tables:\n• Customer: ${updatedItem.customer}\n• Item: ${updatedItem.item}\n• Quantity: ${updatedItem.gitQuantity.toLocaleString()} units\n• ETA: ${new Date(updatedItem.eta).toLocaleDateString()}\n• Status: ${updatedItem.status.toUpperCase()}`);
  };

  const handleDeleteItem = (id: string) => {
    if (confirm('Are you sure you want to delete this GIT item?')) {
      const updatedItems = gitItems.filter(item => item.id !== id);
      saveData(updatedItems);
    }
  };

  const resetForm = () => {
    setFormData({
      customer: '',
      item: '',
      category: '',
      brand: '',
      gitQuantity: 0,
      eta: '',
      supplier: '',
      poNumber: '',
      status: 'ordered',
      priority: 'medium',
      notes: '',
      trackingNumber: '',
      estimatedValue: 0
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ordered': return 'bg-blue-100 text-blue-800';
      case 'shipped': return 'bg-yellow-100 text-yellow-800';
      case 'in_transit': return 'bg-purple-100 text-purple-800';
      case 'arrived': return 'bg-green-100 text-green-800';
      case 'delayed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'bg-gray-100 text-gray-800';
      case 'medium': return 'bg-blue-100 text-blue-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'urgent': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const exportData = () => {
    const dataStr = JSON.stringify(gitItems, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `git-eta-data-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target?.result as string);
          if (Array.isArray(data)) {
            saveData(data);
            alert('Data imported successfully!');
          } else {
            alert('Invalid file format');
          }
        } catch (error) {
          alert('Error reading file');
        }
      };
      reader.readAsText(file);
    }
  };

  if (!isOpen) return null;

  // Only allow admins to access this component
  if (user?.role !== 'admin') {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md mx-4">
          <div className="flex items-center gap-3 text-red-600 mb-4">
            <AlertCircle className="w-6 h-6" />
            <h2 className="text-lg font-semibold">Access Denied</h2>
          </div>
          <p className="text-gray-600 mb-4">
            GIT/ETA Management is only available to administrators.
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
              <Truck className="w-6 h-6 text-blue-600" />
              <div>
                <h2 className="text-xl font-bold text-gray-900">GIT & ETA Management</h2>
                <p className="text-sm text-gray-600">Manage Goods in Transit with Expected Time of Arrival</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Action Bar */}
          <div className="flex items-center justify-between mt-4 gap-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add GIT Item
              </button>
              <button
                onClick={exportData}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Export
              </button>
              <label className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 cursor-pointer">
                <Upload className="w-4 h-4" />
                Import
                <input
                  type="file"
                  accept=".json"
                  onChange={importData}
                  className="hidden"
                />
              </label>
            </div>

            <div className="text-sm text-gray-600">
              Total Items: <span className="font-semibold">{filteredItems.length}</span>
            </div>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-4 mt-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by customer, item, supplier, or PO number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="ordered">Ordered</option>
              <option value="shipped">Shipped</option>
              <option value="in_transit">In Transit</option>
              <option value="arrived">Arrived</option>
              <option value="delayed">Delayed</option>
            </select>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Priority</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(95vh - 200px)' }}>
          <div className="overflow-x-auto">
            <table className="w-full border border-gray-200 rounded-lg">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Qty</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">ETA</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Supplier</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">PO Number</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Priority</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Value</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900">{item.customer}</td>
                    <td className="px-4 py-3 text-sm text-gray-900 max-w-xs truncate" title={item.item}>
                      <div>
                        <div className="font-medium">{item.item}</div>
                        <div className="text-xs text-gray-500">{item.category} - {item.brand}</div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-center">{item.gitQuantity.toLocaleString()}</td>
                    <td className="px-4 py-3 text-sm text-center">
                      <div className="flex flex-col">
                        <span>{new Date(item.eta).toLocaleDateString()}</span>
                        <span className="text-xs text-gray-500">
                          {Math.ceil((new Date(item.eta).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">{item.supplier}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{item.poNumber}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                        {item.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(item.priority)}`}>
                        {item.priority.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-center">${item.estimatedValue.toLocaleString()}</td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleEditItem(item)}
                          className="text-blue-600 hover:text-blue-800"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteItem(item.id)}
                          className="text-red-600 hover:text-red-800"
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

            {filteredItems.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Package className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No GIT items found</p>
                <p className="text-sm">Add new items or adjust your filters</p>
              </div>
            )}
          </div>
        </div>

        {/* Add/Edit Modal */}
        {isAddModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto m-4">
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
                <h3 className="text-lg font-semibold">
                  {editingItem ? 'Edit GIT Item' : 'Add New GIT Item'}
                </h3>
              </div>

              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Customer *</label>
                    <div className="relative">
                      <select
                        value={formData.customer || ''}
                        onChange={(e) => setFormData({...formData, customer: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                      >
                        <option value="">Select or type customer...</option>
                        {existingData.customers.map(customer => (
                          <option key={customer} value={customer}>{customer}</option>
                        ))}
                        <option value="__custom__">⚡ Add New Customer</option>
                      </select>
                      {formData.customer === '__custom__' && (
                        <input
                          type="text"
                          value=""
                          onChange={(e) => setFormData({...formData, customer: e.target.value})}
                          className="w-full mt-2 px-3 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter new customer name"
                          autoFocus
                        />
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Item *</label>
                    <div className="relative">
                      <select
                        value={formData.item || ''}
                        onChange={(e) => setFormData({...formData, item: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                      >
                        <option value="">Select or type item...</option>
                        {existingData.items.map(item => (
                          <option key={item} value={item}>{item}</option>
                        ))}
                        <option value="__custom__">⚡ Add New Item</option>
                      </select>
                      {formData.item === '__custom__' && (
                        <input
                          type="text"
                          value=""
                          onChange={(e) => setFormData({...formData, item: e.target.value})}
                          className="w-full mt-2 px-3 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter new item name"
                          autoFocus
                        />
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                    <div className="relative">
                      <select
                        value={formData.category || ''}
                        onChange={(e) => setFormData({...formData, category: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                      >
                        <option value="">Select category...</option>
                        {existingData.categories.map(category => (
                          <option key={category} value={category}>{category}</option>
                        ))}
                        <option value="__custom__">⚡ Add New Category</option>
                      </select>
                      {formData.category === '__custom__' && (
                        <input
                          type="text"
                          value=""
                          onChange={(e) => setFormData({...formData, category: e.target.value})}
                          className="w-full mt-2 px-3 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter new category"
                          autoFocus
                        />
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Brand</label>
                    <div className="relative">
                      <select
                        value={formData.brand || ''}
                        onChange={(e) => setFormData({...formData, brand: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                      >
                        <option value="">Select brand...</option>
                        {existingData.brands.map(brand => (
                          <option key={brand} value={brand}>{brand}</option>
                        ))}
                        <option value="__custom__">⚡ Add New Brand</option>
                      </select>
                      {formData.brand === '__custom__' && (
                        <input
                          type="text"
                          value=""
                          onChange={(e) => setFormData({...formData, brand: e.target.value})}
                          className="w-full mt-2 px-3 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter new brand"
                          autoFocus
                        />
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">GIT Quantity *</label>
                    <input
                      type="number"
                      value={formData.gitQuantity || ''}
                      onChange={(e) => setFormData({...formData, gitQuantity: parseInt(e.target.value) || 0})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">ETA *</label>
                    <input
                      type="date"
                      value={formData.eta || ''}
                      onChange={(e) => setFormData({...formData, eta: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Supplier</label>
                    <div className="relative">
                      <select
                        value={formData.supplier || ''}
                        onChange={(e) => setFormData({...formData, supplier: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                      >
                        <option value="">Select supplier...</option>
                        {existingData.suppliers.map(supplier => (
                          <option key={supplier} value={supplier}>{supplier}</option>
                        ))}
                        <option value="__custom__">⚡ Add New Supplier</option>
                      </select>
                      {formData.supplier === '__custom__' && (
                        <input
                          type="text"
                          value=""
                          onChange={(e) => setFormData({...formData, supplier: e.target.value})}
                          className="w-full mt-2 px-3 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter new supplier name"
                          autoFocus
                        />
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">PO Number</label>
                    <input
                      type="text"
                      value={formData.poNumber || ''}
                      onChange={(e) => setFormData({...formData, poNumber: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Purchase order number"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                    <select
                      value={formData.status || 'ordered'}
                      onChange={(e) => setFormData({...formData, status: e.target.value as any})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="ordered">Ordered</option>
                      <option value="shipped">Shipped</option>
                      <option value="in_transit">In Transit</option>
                      <option value="arrived">Arrived</option>
                      <option value="delayed">Delayed</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                    <select
                      value={formData.priority || 'medium'}
                      onChange={(e) => setFormData({...formData, priority: e.target.value as any})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Estimated Value ($)</label>
                    <input
                      type="number"
                      value={formData.estimatedValue || ''}
                      onChange={(e) => setFormData({...formData, estimatedValue: parseFloat(e.target.value) || 0})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="0"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tracking Number</label>
                  <input
                    type="text"
                    value={formData.trackingNumber || ''}
                    onChange={(e) => setFormData({...formData, trackingNumber: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Tracking number (optional)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                  <textarea
                    value={formData.notes || ''}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    placeholder="Additional notes (optional)"
                  />
                </div>

                {/* User Visibility Notice */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 text-sm">ℹ️</span>
                    </div>
                    <h4 className="text-sm font-medium text-blue-800">Visibility Notice</h4>
                  </div>
                  <p className="text-sm text-blue-700">
                    Once saved, this GIT information will be automatically visible to all users in their Sales Budget and Rolling Forecast tables.
                    Users can hover over GIT values to see detailed information including supplier, tracking, and notes.
                  </p>
                </div>
              </div>

              <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4">
                <div className="flex gap-3">
                  <button
                    onClick={editingItem ? handleUpdateItem : handleAddItem}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                  >
                    {editingItem ? 'Update' : 'Add'} Item
                  </button>
                  <button
                    onClick={() => {
                      setIsAddModalOpen(false);
                      setEditingItem(null);
                      resetForm();
                    }}
                    className="flex-1 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GitEtaManagement;
