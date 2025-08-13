import React, { useState } from 'react';
import { X, Plus, User, Package, DollarSign, Truck, Save } from 'lucide-react';

interface NewAdditionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (item: NewItemData) => void;
  type: 'customer' | 'item';
}

export interface NewItemData {
  // Customer fields
  customerName?: string;
  customerCode?: string;
  customerType?: string;
  contactEmail?: string;
  contactPhone?: string;
  address?: string;
  region?: string;
  
  // Item fields
  itemName?: string;
  itemCode?: string;
  sku?: string;
  category?: string;
  brand?: string;
  description?: string;
  unitPrice?: number;
  unitCost?: number;
  stockLevel?: number;
  gitLevel?: number;
  minStockLevel?: number;
  supplier?: string;
  
  // Common fields
  isActive?: boolean;
}

const NewAdditionModal: React.FC<NewAdditionModalProps> = ({ isOpen, onClose, onAdd, type }) => {
  const [formData, setFormData] = useState<NewItemData>({
    isActive: true,
    stockLevel: 0,
    gitLevel: 0,
    minStockLevel: 0,
    unitPrice: 0,
    unitCost: 0
  });

  const [errors, setErrors] = useState<{[key: string]: string}>({});

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    if (type === 'customer') {
      if (!formData.customerName?.trim()) newErrors.customerName = 'Customer name is required';
      if (!formData.customerCode?.trim()) newErrors.customerCode = 'Customer code is required';
      if (formData.contactEmail && !/\S+@\S+\.\S+/.test(formData.contactEmail)) {
        newErrors.contactEmail = 'Invalid email format';
      }
    } else {
      if (!formData.itemName?.trim()) newErrors.itemName = 'Item name is required';
      if (!formData.itemCode?.trim()) newErrors.itemCode = 'Item code is required';
      if (!formData.sku?.trim()) newErrors.sku = 'SKU is required';
      if (!formData.category) newErrors.category = 'Category is required';
      if (!formData.unitPrice || formData.unitPrice <= 0) newErrors.unitPrice = 'Unit price must be greater than 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onAdd(formData);
      onClose();
      setFormData({
        isActive: true,
        stockLevel: 0,
        gitLevel: 0,
        minStockLevel: 0,
        unitPrice: 0,
        unitCost: 0
      });
      setErrors({});
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({...prev, [field]: value}));
    if (errors[field]) {
      setErrors(prev => ({...prev, [field]: ''}));
    }
  };

  const resetForm = () => {
    setFormData({
      isActive: true,
      stockLevel: 0,
      gitLevel: 0,
      minStockLevel: 0,
      unitPrice: 0,
      unitCost: 0
    });
    setErrors({});
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <Plus className="w-5 h-5 text-green-600" />
            <h2 className="text-xl font-bold text-gray-900">
              Add New {type === 'customer' ? 'Customer' : 'Item'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {type === 'customer' ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <User className="w-4 h-4 inline mr-1" />
                    Customer Name *
                  </label>
                  <input
                    type="text"
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.customerName ? 'border-red-500' : 'border-gray-300'
                    }`}
                    value={formData.customerName || ''}
                    onChange={(e) => handleChange('customerName', e.target.value)}
                    placeholder="Enter customer name"
                  />
                  {errors.customerName && <p className="text-red-500 text-xs mt-1">{errors.customerName}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Customer Code *</label>
                  <input
                    type="text"
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.customerCode ? 'border-red-500' : 'border-gray-300'
                    }`}
                    value={formData.customerCode || ''}
                    onChange={(e) => handleChange('customerCode', e.target.value)}
                    placeholder="e.g., CUST001"
                  />
                  {errors.customerCode && <p className="text-red-500 text-xs mt-1">{errors.customerCode}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Customer Type</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.customerType || ''}
                    onChange={(e) => handleChange('customerType', e.target.value)}
                  >
                    <option value="">Select type</option>
                    <option value="corporate">Corporate</option>
                    <option value="government">Government</option>
                    <option value="ngo">NGO</option>
                    <option value="individual">Individual</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Region</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.region || ''}
                    onChange={(e) => handleChange('region', e.target.value)}
                  >
                    <option value="">Select region</option>
                    <option value="dar-es-salaam">Dar es Salaam</option>
                    <option value="arusha">Arusha</option>
                    <option value="mwanza">Mwanza</option>
                    <option value="dodoma">Dodoma</option>
                    <option value="mbeya">Mbeya</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Contact Email</label>
                  <input
                    type="email"
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.contactEmail ? 'border-red-500' : 'border-gray-300'
                    }`}
                    value={formData.contactEmail || ''}
                    onChange={(e) => handleChange('contactEmail', e.target.value)}
                    placeholder="customer@example.com"
                  />
                  {errors.contactEmail && <p className="text-red-500 text-xs mt-1">{errors.contactEmail}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Contact Phone</label>
                  <input
                    type="tel"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.contactPhone || ''}
                    onChange={(e) => handleChange('contactPhone', e.target.value)}
                    placeholder="+255 xxx xxx xxx"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  value={formData.address || ''}
                  onChange={(e) => handleChange('address', e.target.value)}
                  placeholder="Enter full address"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Package className="w-4 h-4 inline mr-1" />
                    Item Name *
                  </label>
                  <input
                    type="text"
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.itemName ? 'border-red-500' : 'border-gray-300'
                    }`}
                    value={formData.itemName || ''}
                    onChange={(e) => handleChange('itemName', e.target.value)}
                    placeholder="Enter item name"
                  />
                  {errors.itemName && <p className="text-red-500 text-xs mt-1">{errors.itemName}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Item Code *</label>
                  <input
                    type="text"
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.itemCode ? 'border-red-500' : 'border-gray-300'
                    }`}
                    value={formData.itemCode || ''}
                    onChange={(e) => handleChange('itemCode', e.target.value)}
                    placeholder="e.g., ITEM001"
                  />
                  {errors.itemCode && <p className="text-red-500 text-xs mt-1">{errors.itemCode}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">SKU *</label>
                  <input
                    type="text"
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.sku ? 'border-red-500' : 'border-gray-300'
                    }`}
                    value={formData.sku || ''}
                    onChange={(e) => handleChange('sku', e.target.value)}
                    placeholder="e.g., SKU-12345"
                  />
                  {errors.sku && <p className="text-red-500 text-xs mt-1">{errors.sku}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                  <select
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.category ? 'border-red-500' : 'border-gray-300'
                    }`}
                    value={formData.category || ''}
                    onChange={(e) => handleChange('category', e.target.value)}
                  >
                    <option value="">Select category</option>
                    <option value="tyres">Tyres</option>
                    <option value="accessories">Accessories</option>
                    <option value="batteries">Batteries</option>
                    <option value="oils">Oils & Lubricants</option>
                  </select>
                  {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Brand</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.brand || ''}
                    onChange={(e) => handleChange('brand', e.target.value)}
                  >
                    <option value="">Select brand</option>
                    <option value="michelin">Michelin</option>
                    <option value="bf-goodrich">BF Goodrich</option>
                    <option value="continental">Continental</option>
                    <option value="bridgestone">Bridgestone</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Supplier</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.supplier || ''}
                    onChange={(e) => handleChange('supplier', e.target.value)}
                    placeholder="Enter supplier name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <DollarSign className="w-4 h-4 inline mr-1" />
                    Unit Price * ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.unitPrice ? 'border-red-500' : 'border-gray-300'
                    }`}
                    value={formData.unitPrice || ''}
                    onChange={(e) => handleChange('unitPrice', parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                  />
                  {errors.unitPrice && <p className="text-red-500 text-xs mt-1">{errors.unitPrice}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Unit Cost ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.unitCost || ''}
                    onChange={(e) => handleChange('unitCost', parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Stock Level</label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.stockLevel || ''}
                    onChange={(e) => handleChange('stockLevel', parseInt(e.target.value) || 0)}
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Truck className="w-4 h-4 inline mr-1" />
                    GIT Level
                  </label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.gitLevel || ''}
                    onChange={(e) => handleChange('gitLevel', parseInt(e.target.value) || 0)}
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Min Stock Level</label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.minStockLevel || ''}
                    onChange={(e) => handleChange('minStockLevel', parseInt(e.target.value) || 0)}
                    placeholder="0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  value={formData.description || ''}
                  onChange={(e) => handleChange('description', e.target.value)}
                  placeholder="Enter item description"
                />
              </div>
            </div>
          )}

          <div className="mt-6">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                checked={formData.isActive}
                onChange={(e) => handleChange('isActive', e.target.checked)}
              />
              <span className="text-sm font-medium text-gray-900">
                Active {type === 'customer' ? 'Customer' : 'Item'}
              </span>
            </label>
          </div>
        </div>

        <div className="flex items-center justify-between p-6 border-t border-gray-200">
          <button
            onClick={resetForm}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            Reset
          </button>
          <div className="flex space-x-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>Add {type === 'customer' ? 'Customer' : 'Item'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewAdditionModal;
