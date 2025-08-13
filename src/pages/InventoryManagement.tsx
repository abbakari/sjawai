import React, { useState } from 'react';
import Layout from '../components/Layout';
import UnifiedAddModal from '../components/UnifiedAddModal';
import AddCategoryModal from '../components/AddCategoryModal';
import AddBrandModal from '../components/AddBrandModal';
import EditItemModal from '../components/EditItemModal';
import SupplyChainIntegration from '../components/SupplyChainIntegration';
import { Package, Search, Filter, Plus, Edit, Trash2, AlertTriangle, TrendingUp, BarChart3, Tag, Award, Download, RefreshCw, CheckCircle, Clock, Bell, Target } from 'lucide-react';
import { InventoryItem, ItemCategory, ItemBrand, InventoryFormData, CategoryFormData, BrandFormData } from '../types/inventory';
import { useWorkflow } from '../contexts/WorkflowContext';
import { useAuth } from '../contexts/AuthContext';

const InventoryManagement: React.FC = () => {
  const { user } = useAuth();
  const { getItemsByState, getNotificationsForUser, markNotificationAsRead } = useWorkflow();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'low' | 'normal' | 'high' | 'out_of_stock'>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterBrand, setFilterBrand] = useState<string>('all');
  const [showApprovedItems, setShowApprovedItems] = useState(true);
  
  // Modal states
  const [isUnifiedAddModalOpen, setIsUnifiedAddModalOpen] = useState(false);
  const [isAddCategoryModalOpen, setIsAddCategoryModalOpen] = useState(false);
  const [isAddBrandModalOpen, setIsAddBrandModalOpen] = useState(false);
  const [isEditItemModalOpen, setIsEditItemModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);

  // Sample categories data
  const [categories, setCategories] = useState<ItemCategory[]>([
    {
      id: '1',
      name: 'Smartphones',
      code: 'SMART',
      description: 'Mobile phones and smartphones',
      isActive: true,
      displayOrder: 1,
      color: '#3B82F6',
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    },
    {
      id: '2',
      name: 'Laptops',
      code: 'LAPTOP',
      description: 'Laptops and notebooks',
      isActive: true,
      displayOrder: 2,
      color: '#10B981',
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    },
    {
      id: '3',
      name: 'Audio',
      code: 'AUDIO',
      description: 'Headphones, speakers, and audio equipment',
      isActive: true,
      displayOrder: 3,
      color: '#F59E0B',
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    },
    {
      id: '4',
      name: 'Accessories',
      code: 'ACC',
      description: 'Phone cases, chargers, and other accessories',
      isActive: true,
      displayOrder: 4,
      color: '#8B5CF6',
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    }
  ]);

  // Sample brands data
  const [brands, setBrands] = useState<ItemBrand[]>([
    {
      id: '1',
      name: 'Apple',
      code: 'APPLE',
      description: 'Apple Inc. products',
      isActive: true,
      country: 'US',
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    },
    {
      id: '2',
      name: 'Samsung',
      code: 'SAMSUNG',
      description: 'Samsung Electronics products',
      isActive: true,
      country: 'KR',
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    },
    {
      id: '3',
      name: 'Dell',
      code: 'DELL',
      description: 'Dell Technologies products',
      isActive: true,
      country: 'US',
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    },
    {
      id: '4',
      name: 'Sony',
      code: 'SONY',
      description: 'Sony Corporation products',
      isActive: true,
      country: 'JP',
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    }
  ]);

  // Sample inventory data with proper structure
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([
    {
      id: '1',
      sku: 'IPH15P-256',
      name: 'iPhone 15 Pro 256GB',
      description: 'Latest iPhone 15 Pro with 256GB storage',
      categoryId: '1',
      category: categories[0],
      brandId: '1',
      brand: brands[0],
      unitCost: 750,
      sellingPrice: 999,
      currentStock: 45,
      minStock: 20,
      maxStock: 100,
      reorderPoint: 25,
      reorderQuantity: 50,
      unit: 'pcs',
      supplier: 'Apple Inc.',
      supplierCode: 'APL001',
      barcode: '012345678901',
      location: 'A1-B2',
      shelf: 'Top',
      weight: 0.187,
      dimensions: { length: 14.67, width: 7.09, height: 0.83 },
      isActive: true,
      isSerialTracked: true,
      isBatchTracked: false,
      createdAt: '2024-01-01',
      updatedAt: '2024-12-03',
      createdBy: 'admin',
      lastStockUpdate: '2024-12-03',
      stockStatus: 'normal',
      totalValue: 33750,
      averageCost: 750,
      tags: ['premium', 'smartphone', 'ios'],
      notes: 'Latest model with high demand'
    },
    {
      id: '2',
      sku: 'SGS24-128',
      name: 'Samsung Galaxy S24 128GB',
      description: 'Samsung Galaxy S24 with 128GB storage',
      categoryId: '1',
      category: categories[0],
      brandId: '2',
      brand: brands[1],
      unitCost: 650,
      sellingPrice: 849,
      currentStock: 12,
      minStock: 15,
      maxStock: 80,
      reorderPoint: 18,
      reorderQuantity: 40,
      unit: 'pcs',
      supplier: 'Samsung Electronics',
      supplierCode: 'SAM001',
      barcode: '012345678902',
      location: 'A2-B1',
      shelf: 'Middle',
      weight: 0.168,
      isActive: true,
      isSerialTracked: true,
      isBatchTracked: false,
      createdAt: '2024-01-01',
      updatedAt: '2024-12-02',
      createdBy: 'admin',
      lastStockUpdate: '2024-12-02',
      stockStatus: 'low',
      totalValue: 7800,
      averageCost: 650,
      tags: ['android', 'smartphone'],
      notes: 'Low stock - reorder soon'
    },
    {
      id: '3',
      sku: 'MBA-M3-512',
      name: 'MacBook Air M3 512GB',
      description: 'MacBook Air with M3 chip and 512GB SSD',
      categoryId: '2',
      category: categories[1],
      brandId: '1',
      brand: brands[0],
      unitCost: 950,
      sellingPrice: 1299,
      currentStock: 89,
      minStock: 10,
      maxStock: 50,
      reorderPoint: 15,
      reorderQuantity: 25,
      unit: 'pcs',
      supplier: 'Apple Inc.',
      supplierCode: 'APL002',
      barcode: '012345678903',
      location: 'B1-C2',
      shelf: 'Bottom',
      weight: 1.24,
      isActive: true,
      isSerialTracked: true,
      isBatchTracked: false,
      createdAt: '2024-01-01',
      updatedAt: '2024-12-03',
      createdBy: 'admin',
      lastStockUpdate: '2024-12-03',
      stockStatus: 'high',
      totalValue: 84550,
      averageCost: 950,
      tags: ['laptop', 'macbook', 'portable'],
      notes: 'Overstocked - consider promotion'
    },
    {
      id: '4',
      sku: 'DXP13-1TB',
      name: 'Dell XPS 13 1TB',
      description: 'Dell XPS 13 with 1TB SSD',
      categoryId: '2',
      category: categories[1],
      brandId: '3',
      brand: brands[2],
      unitCost: 900,
      sellingPrice: 1199,
      currentStock: 25,
      minStock: 8,
      maxStock: 40,
      reorderPoint: 12,
      reorderQuantity: 20,
      unit: 'pcs',
      supplier: 'Dell Technologies',
      supplierCode: 'DELL001',
      barcode: '012345678904',
      location: 'B2-C1',
      shelf: 'Middle',
      weight: 1.17,
      isActive: true,
      isSerialTracked: true,
      isBatchTracked: false,
      createdAt: '2024-01-01',
      updatedAt: '2024-12-01',
      createdBy: 'admin',
      lastStockUpdate: '2024-12-01',
      stockStatus: 'normal',
      totalValue: 22500,
      averageCost: 900,
      tags: ['laptop', 'ultrabook', 'windows'],
      notes: 'Good performance model'
    },
    {
      id: '5',
      sku: 'SWH1000X5',
      name: 'Sony WH-1000XM5 Headphones',
      description: 'Premium noise-cancelling headphones',
      categoryId: '3',
      category: categories[2],
      brandId: '4',
      brand: brands[3],
      unitCost: 250,
      sellingPrice: 349,
      currentStock: 8,
      minStock: 15,
      maxStock: 60,
      reorderPoint: 18,
      reorderQuantity: 30,
      unit: 'pcs',
      supplier: 'Sony Corporation',
      supplierCode: 'SONY001',
      barcode: '012345678905',
      location: 'C1-D1',
      shelf: 'Top',
      weight: 0.249,
      isActive: true,
      isSerialTracked: false,
      isBatchTracked: true,
      createdAt: '2024-01-01',
      updatedAt: '2024-11-30',
      createdBy: 'admin',
      lastStockUpdate: '2024-11-30',
      stockStatus: 'low',
      totalValue: 2000,
      averageCost: 250,
      tags: ['headphones', 'noise-cancelling', 'premium'],
      notes: 'Popular item - low stock alert'
    }
  ]);

  const filteredItems = inventoryItems.filter(item => {
    const matchesSearch = 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.brand.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || item.stockStatus === filterStatus;
    const matchesCategory = filterCategory === 'all' || item.categoryId === filterCategory;
    const matchesBrand = filterBrand === 'all' || item.brandId === filterBrand;
    
    return matchesSearch && matchesStatus && matchesCategory && matchesBrand;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'low': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-yellow-100 text-yellow-800';
      case 'normal': return 'bg-green-100 text-green-800';
      case 'out_of_stock': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'low': return <AlertTriangle className="w-4 h-4" />;
      case 'high': return <TrendingUp className="w-4 h-4" />;
      case 'normal': return <BarChart3 className="w-4 h-4" />;
      case 'out_of_stock': return <Package className="w-4 h-4" />;
      default: return <Package className="w-4 h-4" />;
    }
  };

  const handleUnifiedSubmit = (data: {
    item: InventoryFormData;
    category?: CategoryFormData;
    brand?: BrandFormData;
  }) => {
    let categoryToUse: ItemCategory;
    let brandToUse: ItemBrand;

    // Handle new category creation
    if (data.category) {
      const newCategory: ItemCategory = {
        id: Date.now().toString() + '_cat',
        ...data.category,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      setCategories(prev => [...prev, newCategory]);
      categoryToUse = newCategory;
    } else {
      const existingCategory = categories.find(c => c.id === data.item.categoryId);
      if (!existingCategory) return;
      categoryToUse = existingCategory;
    }

    // Handle new brand creation
    if (data.brand) {
      const newBrand: ItemBrand = {
        id: Date.now().toString() + '_brand',
        ...data.brand,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      setBrands(prev => [...prev, newBrand]);
      brandToUse = newBrand;
    } else {
      const existingBrand = brands.find(b => b.id === data.item.brandId);
      if (!existingBrand) return;
      brandToUse = existingBrand;
    }

    // Create the item
    const newItem: InventoryItem = {
      id: Date.now().toString(),
      ...data.item,
      categoryId: categoryToUse.id,
      category: categoryToUse,
      brandId: brandToUse.id,
      brand: brandToUse,
      totalValue: data.item.currentStock * data.item.unitCost,
      averageCost: data.item.unitCost,
      stockStatus: data.item.currentStock <= data.item.minStock ? 'low' :
                   data.item.currentStock >= data.item.maxStock ? 'high' : 'normal',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'admin',
      lastStockUpdate: new Date().toISOString()
    };

    setInventoryItems(prev => [...prev, newItem]);
  };

  const handleEditItem = (itemData: InventoryFormData & { id: string }) => {
    const category = categories.find(c => c.id === itemData.categoryId);
    const brand = brands.find(b => b.id === itemData.brandId);
    
    if (!category || !brand) return;

    setInventoryItems(prev => prev.map(item => 
      item.id === itemData.id ? {
        ...item,
        ...itemData,
        category,
        brand,
        totalValue: itemData.currentStock * itemData.unitCost,
        stockStatus: itemData.currentStock <= itemData.minStock ? 'low' : 
                     itemData.currentStock >= itemData.maxStock ? 'high' : 'normal',
        updatedAt: new Date().toISOString(),
        lastStockUpdate: new Date().toISOString()
      } : item
    ));
  };

  const handleDeleteItem = (id: string) => {
    if (confirm('Are you sure you want to delete this item?')) {
      setInventoryItems(prev => prev.filter(item => item.id !== id));
    }
  };

  const handleAddCategory = (categoryData: CategoryFormData) => {
    const newCategory: ItemCategory = {
      id: Date.now().toString(),
      ...categoryData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setCategories(prev => [...prev, newCategory]);
  };

  const handleAddBrand = (brandData: BrandFormData) => {
    const newBrand: ItemBrand = {
      id: Date.now().toString(),
      ...brandData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setBrands(prev => [...prev, newBrand]);
  };

  const handleEditClick = (item: InventoryItem) => {
    setEditingItem(item);
    setIsEditItemModalOpen(true);
  };

  const handleExport = () => {
    const csvContent = [
      ['SKU', 'Name', 'Category', 'Brand', 'Current Stock', 'Unit Cost', 'Selling Price', 'Total Value', 'Status'],
      ...filteredItems.map(item => [
        item.sku,
        item.name,
        item.category.name,
        item.brand.name,
        item.currentStock,
        item.unitCost,
        item.sellingPrice,
        item.totalValue,
        item.stockStatus
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `inventory-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  const totalValue = inventoryItems.reduce((sum, item) => sum + item.totalValue, 0);
  const lowStockItems = inventoryItems.filter(item => item.stockStatus === 'low').length;
  const totalItems = inventoryItems.length;
  const outOfStockItems = inventoryItems.filter(item => item.stockStatus === 'out_of_stock').length;

  return (
    <Layout>
      <div className="space-y-6">
        {/* Supply Chain Integration Section (for supply_chain users) */}
        {user?.role === 'supply_chain' && (
          <SupplyChainIntegration />
        )}

        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-2xl font-bold text-gray-900 mb-2">
              <span className="text-gray-500 font-light">Inventory Management /</span> Stock Overview
            </h4>
            <p className="text-sm text-gray-600">
              Manage inventory levels, track stock movements, and monitor supply chain
            </p>
          </div>
          <div className="flex space-x-2">
            <button 
              onClick={handleExport}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
            <button 
              onClick={() => setIsAddCategoryModalOpen(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
            >
              <Tag className="w-4 h-4" />
              <span>Add Category</span>
            </button>
            <button 
              onClick={() => setIsAddBrandModalOpen(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors"
            >
              <Award className="w-4 h-4" />
              <span>Add Brand</span>
            </button>
            <button
              onClick={() => setIsUnifiedAddModalOpen(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Inventory</span>
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Inventory Value</p>
                <p className="text-2xl font-semibold text-gray-900">${totalValue.toLocaleString()}</p>
              </div>
              <Package className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Items</p>
                <p className="text-2xl font-semibold text-gray-900">{totalItems}</p>
              </div>
              <BarChart3 className="w-8 h-8 text-green-600" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Low Stock Alerts</p>
                <p className="text-2xl font-semibold text-gray-900">{lowStockItems}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Out of Stock</p>
                <p className="text-2xl font-semibold text-gray-900">{outOfStockItems}</p>
              </div>
              <RefreshCw className="w-8 h-8 text-gray-600" />
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search inventory..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="w-full pl-10 pr-8 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
              >
                <option value="all">All Status</option>
                <option value="low">Low Stock</option>
                <option value="normal">Normal</option>
                <option value="high">High Stock</option>
                <option value="out_of_stock">Out of Stock</option>
              </select>
            </div>

            <div className="relative">
              <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full pl-10 pr-8 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
              >
                <option value="all">All Categories</option>
                {categories.filter(cat => cat.isActive).map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="relative">
              <Award className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <select
                value={filterBrand}
                onChange={(e) => setFilterBrand(e.target.value)}
                className="w-full pl-10 pr-8 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
              >
                <option value="all">All Brands</option>
                {brands.filter(brand => brand.isActive).map(brand => (
                  <option key={brand.id} value={brand.id}>
                    {brand.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Inventory Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category & Brand</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock Levels</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pricing</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Supplier</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{item.name}</div>
                        <div className="text-sm text-gray-500">{item.sku}</div>
                        {item.location && <div className="text-xs text-gray-400">Location: {item.location}</div>}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm text-gray-900">{item.category.name}</div>
                        <div className="text-sm text-gray-500">{item.brand.name}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        <div>Current: <span className="font-medium">{item.currentStock} {item.unit}</span></div>
                        <div className="text-xs text-gray-500">
                          Min: {item.minStock} | Max: {item.maxStock}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        <div className="font-medium">${item.totalValue.toLocaleString()}</div>
                        <div className="text-xs text-gray-500">
                          Cost: ${item.unitCost} | Sell: ${item.sellingPrice}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        <div>{item.supplier}</div>
                        {item.supplierCode && (
                          <div className="text-xs text-gray-500">{item.supplierCode}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.stockStatus)}`}>
                        {getStatusIcon(item.stockStatus)}
                        <span className="ml-1 capitalize">{item.stockStatus.replace('_', ' ')}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button 
                          onClick={() => handleEditClick(item)}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded transition-colors"
                          title="Edit item"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteItem(item.id)}
                          className="text-red-600 hover:text-red-900 p-1 rounded transition-colors"
                          title="Delete item"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredItems.length === 0 && (
            <div className="text-center py-12">
              <Package className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No inventory items found</h3>
              <p className="mt-1 text-sm text-gray-500">
                Try adjusting your search criteria or add a new item.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <UnifiedAddModal
        isOpen={isUnifiedAddModalOpen}
        onClose={() => setIsUnifiedAddModalOpen(false)}
        onSubmit={handleUnifiedSubmit}
        existingCategories={categories}
        existingBrands={brands}
      />

      <EditItemModal
        isOpen={isEditItemModalOpen}
        onClose={() => {
          setIsEditItemModalOpen(false);
          setEditingItem(null);
        }}
        onSubmit={handleEditItem}
        categories={categories}
        brands={brands}
        onAddCategory={() => setIsAddCategoryModalOpen(true)}
        onAddBrand={() => setIsAddBrandModalOpen(true)}
        item={editingItem}
      />

      <AddCategoryModal
        isOpen={isAddCategoryModalOpen}
        onClose={() => setIsAddCategoryModalOpen(false)}
        onSubmit={handleAddCategory}
        categories={categories}
      />

      <AddBrandModal
        isOpen={isAddBrandModalOpen}
        onClose={() => setIsAddBrandModalOpen(false)}
        onSubmit={handleAddBrand}
      />
    </Layout>
  );
};

export default InventoryManagement;
