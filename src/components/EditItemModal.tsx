import React, { useState, useEffect } from 'react';
import { X, Package, Save, Plus } from 'lucide-react';
import { InventoryFormData, ItemCategory, ItemBrand, InventoryItem } from '../types/inventory';

interface EditItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (itemData: InventoryFormData & { id: string }) => void;
  categories: ItemCategory[];
  brands: ItemBrand[];
  onAddCategory: () => void;
  onAddBrand: () => void;
  item: InventoryItem | null;
}

const EditItemModal: React.FC<EditItemModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  categories,
  brands,
  onAddCategory,
  onAddBrand,
  item
}) => {
  const [formData, setFormData] = useState<InventoryFormData>({
    sku: '',
    name: '',
    description: '',
    categoryId: '',
    brandId: '',
    unitCost: 0,
    sellingPrice: 0,
    currentStock: 0,
    minStock: 0,
    maxStock: 0,
    reorderPoint: 0,
    reorderQuantity: 0,
    unit: 'pcs',
    supplier: '',
    supplierCode: '',
    barcode: '',
    location: '',
    shelf: '',
    weight: 0,
    dimensions: {
      length: 0,
      width: 0,
      height: 0
    },
    isActive: true,
    isSerialTracked: false,
    isBatchTracked: false,
    expiryDate: '',
    tags: [],
    notes: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [tags, setTags] = useState<string>('');

  useEffect(() => {
    if (item && isOpen) {
      setFormData({
        sku: item.sku,
        name: item.name,
        description: item.description || '',
        categoryId: item.categoryId,
        brandId: item.brandId,
        unitCost: item.unitCost,
        sellingPrice: item.sellingPrice,
        currentStock: item.currentStock,
        minStock: item.minStock,
        maxStock: item.maxStock,
        reorderPoint: item.reorderPoint,
        reorderQuantity: item.reorderQuantity,
        unit: item.unit,
        supplier: item.supplier,
        supplierCode: item.supplierCode || '',
        barcode: item.barcode || '',
        location: item.location || '',
        shelf: item.shelf || '',
        weight: item.weight || 0,
        dimensions: item.dimensions || { length: 0, width: 0, height: 0 },
        isActive: item.isActive,
        isSerialTracked: item.isSerialTracked,
        isBatchTracked: item.isBatchTracked,
        expiryDate: item.expiryDate || '',
        tags: item.tags || [],
        notes: item.notes || ''
      });
      setTags((item.tags || []).join(', '));
    }
  }, [item, isOpen]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.sku.trim()) {
      newErrors.sku = 'SKU is required';
    }
    if (!formData.name.trim()) {
      newErrors.name = 'Item name is required';
    }
    if (!formData.categoryId) {
      newErrors.categoryId = 'Category is required';
    }
    if (!formData.brandId) {
      newErrors.brandId = 'Brand is required';
    }
    if (formData.unitCost <= 0) {
      newErrors.unitCost = 'Unit cost must be greater than 0';
    }
    if (formData.sellingPrice <= 0) {
      newErrors.sellingPrice = 'Selling price must be greater than 0';
    }
    if (formData.currentStock < 0) {
      newErrors.currentStock = 'Current stock cannot be negative';
    }
    if (formData.minStock < 0) {
      newErrors.minStock = 'Min stock cannot be negative';
    }
    if (formData.maxStock < 0) {
      newErrors.maxStock = 'Max stock cannot be negative';
    }
    if (formData.maxStock > 0 && formData.minStock >= formData.maxStock) {
      newErrors.maxStock = 'Max stock must be greater than min stock';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !item) {
      return;
    }

    const finalFormData = {
      ...formData,
      id: item.id,
      tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
    };

    onSubmit(finalFormData);
    handleClose();
  };

  const handleClose = () => {
    setFormData({
      sku: '',
      name: '',
      description: '',
      categoryId: '',
      brandId: '',
      unitCost: 0,
      sellingPrice: 0,
      currentStock: 0,
      minStock: 0,
      maxStock: 0,
      reorderPoint: 0,
      reorderQuantity: 0,
      unit: 'pcs',
      supplier: '',
      supplierCode: '',
      barcode: '',
      location: '',
      shelf: '',
      weight: 0,
      dimensions: {
        length: 0,
        width: 0,
        height: 0
      },
      isActive: true,
      isSerialTracked: false,
      isBatchTracked: false,
      expiryDate: '',
      tags: [],
      notes: ''
    });
    setErrors({});
    setTags('');
    onClose();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof InventoryFormData],
          [child]: type === 'number' ? parseFloat(value) || 0 : value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'number' ? parseFloat(value) || 0 : value
      }));
    }

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  if (!isOpen || !item) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Package className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">Edit Item</h2>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                SKU <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="sku"
                value={formData.sku}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.sku ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter SKU"
              />
              {errors.sku && <p className="mt-1 text-sm text-red-600">{errors.sku}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Item Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter item name"
              />
              {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category <span className="text-red-500">*</span>
              </label>
              <div className="flex space-x-2">
                <select
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={handleInputChange}
                  className={`flex-1 px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.categoryId ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select category</option>
                  {categories.filter(cat => cat.isActive).map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={onAddCategory}
                  className="px-3 py-2 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 transition-colors"
                  title="Add new category"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              {errors.categoryId && <p className="mt-1 text-sm text-red-600">{errors.categoryId}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Brand <span className="text-red-500">*</span>
              </label>
              <div className="flex space-x-2">
                <select
                  name="brandId"
                  value={formData.brandId}
                  onChange={handleInputChange}
                  className={`flex-1 px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.brandId ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select brand</option>
                  {brands.filter(brand => brand.isActive).map(brand => (
                    <option key={brand.id} value={brand.id}>
                      {brand.name}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={onAddBrand}
                  className="px-3 py-2 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 transition-colors"
                  title="Add new brand"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              {errors.brandId && <p className="mt-1 text-sm text-red-600">{errors.brandId}</p>}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter item description"
              />
            </div>
          </div>

          {/* Pricing Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Pricing Information</h3>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Unit Cost <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="unitCost"
                value={formData.unitCost}
                onChange={handleInputChange}
                min="0"
                step="0.01"
                className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.unitCost ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="0.00"
              />
              {errors.unitCost && <p className="mt-1 text-sm text-red-600">{errors.unitCost}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Selling Price <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="sellingPrice"
                value={formData.sellingPrice}
                onChange={handleInputChange}
                min="0"
                step="0.01"
                className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.sellingPrice ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="0.00"
              />
              {errors.sellingPrice && <p className="mt-1 text-sm text-red-600">{errors.sellingPrice}</p>}
            </div>
          </div>

          {/* Stock Information */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Stock Information</h3>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Current Stock</label>
              <input
                type="number"
                name="currentStock"
                value={formData.currentStock}
                onChange={handleInputChange}
                min="0"
                className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.currentStock ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.currentStock && <p className="mt-1 text-sm text-red-600">{errors.currentStock}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Min Stock</label>
              <input
                type="number"
                name="minStock"
                value={formData.minStock}
                onChange={handleInputChange}
                min="0"
                className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.minStock ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.minStock && <p className="mt-1 text-sm text-red-600">{errors.minStock}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Max Stock</label>
              <input
                type="number"
                name="maxStock"
                value={formData.maxStock}
                onChange={handleInputChange}
                min="0"
                className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.maxStock ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.maxStock && <p className="mt-1 text-sm text-red-600">{errors.maxStock}</p>}
            </div>
          </div>

          {/* Additional Information - similar to AddItemModal */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Additional Information</h3>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Supplier</label>
              <input
                type="text"
                name="supplier"
                value={formData.supplier}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter supplier name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Unit</label>
              <select
                name="unit"
                value={formData.unit}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="pcs">Pieces</option>
                <option value="kg">Kilograms</option>
                <option value="g">Grams</option>
                <option value="lbs">Pounds</option>
                <option value="l">Liters</option>
                <option value="ml">Milliliters</option>
                <option value="m">Meters</option>
                <option value="cm">Centimeters</option>
                <option value="ft">Feet</option>
                <option value="in">Inches</option>
                <option value="box">Box</option>
                <option value="carton">Carton</option>
                <option value="pack">Pack</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter tags separated by commas"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter storage location"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Tracking Options</label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="isSerialTracked"
                    checked={formData.isSerialTracked}
                    onChange={handleInputChange}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">Serial Number Tracking</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="isBatchTracked"
                    checked={formData.isBatchTracked}
                    onChange={handleInputChange}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">Batch/Lot Tracking</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleInputChange}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">Active Item</span>
                </label>
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Additional notes"
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>Update Item</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditItemModal;
