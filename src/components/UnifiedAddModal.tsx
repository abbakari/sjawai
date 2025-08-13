import React, { useState } from 'react';
import { X, Package, Save, Tag, Award, Plus } from 'lucide-react';
import { InventoryFormData, ItemCategory, ItemBrand, CategoryFormData, BrandFormData } from '../types/inventory';

interface UnifiedAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    item: InventoryFormData;
    category?: CategoryFormData;
    brand?: BrandFormData;
  }) => void;
  existingCategories: ItemCategory[];
  existingBrands: ItemBrand[];
}

const UnifiedAddModal: React.FC<UnifiedAddModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  existingCategories,
  existingBrands
}) => {
  const [activeTab, setActiveTab] = useState<'item' | 'category' | 'brand'>('item');
  const [createNewCategory, setCreateNewCategory] = useState(false);
  const [createNewBrand, setCreateNewBrand] = useState(false);

  // Item form data
  const [itemData, setItemData] = useState<InventoryFormData>({
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

  // Category form data
  const [categoryData, setCategoryData] = useState<CategoryFormData>({
    name: '',
    code: '',
    description: '',
    parentCategoryId: '',
    isActive: true,
    displayOrder: 1,
    iconUrl: '',
    color: '#3B82F6',
    taxRate: 0,
    marginPercentage: 0
  });

  // Brand form data
  const [brandData, setBrandData] = useState<BrandFormData>({
    name: '',
    code: '',
    description: '',
    logoUrl: '',
    website: '',
    contactInfo: {
      email: '',
      phone: '',
      address: ''
    },
    isActive: true,
    country: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [tags, setTags] = useState<string>('');

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Validate item data
    if (!itemData.sku.trim()) {
      newErrors.sku = 'SKU is required';
    }
    if (!itemData.name.trim()) {
      newErrors.name = 'Item name is required';
    }
    if (!createNewCategory && !itemData.categoryId) {
      newErrors.categoryId = 'Category is required';
    }
    if (!createNewBrand && !itemData.brandId) {
      newErrors.brandId = 'Brand is required';
    }
    if (itemData.unitCost <= 0) {
      newErrors.unitCost = 'Unit cost must be greater than 0';
    }
    if (itemData.sellingPrice <= 0) {
      newErrors.sellingPrice = 'Selling price must be greater than 0';
    }

    // Validate new category if creating one
    if (createNewCategory) {
      if (!categoryData.name.trim()) {
        newErrors.categoryName = 'Category name is required';
      }
      if (!categoryData.code.trim()) {
        newErrors.categoryCode = 'Category code is required';
      }
    }

    // Validate new brand if creating one
    if (createNewBrand) {
      if (!brandData.name.trim()) {
        newErrors.brandName = 'Brand name is required';
      }
      if (!brandData.code.trim()) {
        newErrors.brandCode = 'Brand code is required';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const submitData = {
      item: {
        ...itemData,
        tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
      },
      category: createNewCategory ? categoryData : undefined,
      brand: createNewBrand ? brandData : undefined
    };

    onSubmit(submitData);
    handleClose();
  };

  const handleClose = () => {
    setItemData({
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
    setCategoryData({
      name: '',
      code: '',
      description: '',
      parentCategoryId: '',
      isActive: true,
      displayOrder: 1,
      iconUrl: '',
      color: '#3B82F6',
      taxRate: 0,
      marginPercentage: 0
    });
    setBrandData({
      name: '',
      code: '',
      description: '',
      logoUrl: '',
      website: '',
      contactInfo: {
        email: '',
        phone: '',
        address: ''
      },
      isActive: true,
      country: ''
    });
    setCreateNewCategory(false);
    setCreateNewBrand(false);
    setActiveTab('item');
    setErrors({});
    setTags('');
    onClose();
  };

  const handleItemInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setItemData(prev => ({ ...prev, [name]: checked }));
    } else if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setItemData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof InventoryFormData],
          [child]: type === 'number' ? parseFloat(value) || 0 : value
        }
      }));
    } else {
      setItemData(prev => ({
        ...prev,
        [name]: type === 'number' ? parseFloat(value) || 0 : value
      }));
    }

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleCategoryInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setCategoryData(prev => ({ ...prev, [name]: checked }));
    } else {
      setCategoryData(prev => ({
        ...prev,
        [name]: type === 'number' ? parseFloat(value) || 0 : value
      }));
    }

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleBrandInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setBrandData(prev => ({ ...prev, [name]: checked }));
    } else if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setBrandData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof BrandFormData],
          [child]: value
        }
      }));
    } else {
      setBrandData(prev => ({ ...prev, [name]: value }));
    }

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Package className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">Add New Inventory Item</h2>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('item')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'item'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Package className="w-4 h-4" />
                <span>Item Details</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('category')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'category'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Tag className="w-4 h-4" />
                <span>Category {createNewCategory && '(New)'}</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('brand')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'brand'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Award className="w-4 h-4" />
                <span>Brand {createNewBrand && '(New)'}</span>
              </div>
            </button>
          </nav>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {/* Item Tab */}
          {activeTab === 'item' && (
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    value={itemData.sku}
                    onChange={handleItemInputChange}
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
                    value={itemData.name}
                    onChange={handleItemInputChange}
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
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center">
                      <input
                        type="radio"
                        id="existing-category"
                        name="categoryOption"
                        checked={!createNewCategory}
                        onChange={() => setCreateNewCategory(false)}
                        className="mr-2"
                      />
                      <label htmlFor="existing-category" className="text-sm text-gray-700">Use Existing</label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="radio"
                        id="new-category"
                        name="categoryOption"
                        checked={createNewCategory}
                        onChange={() => setCreateNewCategory(true)}
                        className="mr-2"
                      />
                      <label htmlFor="new-category" className="text-sm text-gray-700">Create New</label>
                    </div>
                  </div>
                  {!createNewCategory && (
                    <select
                      name="categoryId"
                      value={itemData.categoryId}
                      onChange={handleItemInputChange}
                      className={`w-full mt-2 px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.categoryId ? 'border-red-500' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Select category</option>
                      {existingCategories.filter(cat => cat.isActive).map(category => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  )}
                  {createNewCategory && (
                    <div className="mt-2 p-3 bg-blue-50 rounded-md">
                      <p className="text-sm text-blue-700">New category will be created. Configure details in the Category tab.</p>
                      <button
                        type="button"
                        onClick={() => setActiveTab('category')}
                        className="mt-2 text-sm text-blue-600 hover:text-blue-800 underline"
                      >
                        Configure Category →
                      </button>
                    </div>
                  )}
                  {errors.categoryId && <p className="mt-1 text-sm text-red-600">{errors.categoryId}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Brand <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center">
                      <input
                        type="radio"
                        id="existing-brand"
                        name="brandOption"
                        checked={!createNewBrand}
                        onChange={() => setCreateNewBrand(false)}
                        className="mr-2"
                      />
                      <label htmlFor="existing-brand" className="text-sm text-gray-700">Use Existing</label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="radio"
                        id="new-brand"
                        name="brandOption"
                        checked={createNewBrand}
                        onChange={() => setCreateNewBrand(true)}
                        className="mr-2"
                      />
                      <label htmlFor="new-brand" className="text-sm text-gray-700">Create New</label>
                    </div>
                  </div>
                  {!createNewBrand && (
                    <select
                      name="brandId"
                      value={itemData.brandId}
                      onChange={handleItemInputChange}
                      className={`w-full mt-2 px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.brandId ? 'border-red-500' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Select brand</option>
                      {existingBrands.filter(brand => brand.isActive).map(brand => (
                        <option key={brand.id} value={brand.id}>
                          {brand.name}
                        </option>
                      ))}
                    </select>
                  )}
                  {createNewBrand && (
                    <div className="mt-2 p-3 bg-orange-50 rounded-md">
                      <p className="text-sm text-orange-700">New brand will be created. Configure details in the Brand tab.</p>
                      <button
                        type="button"
                        onClick={() => setActiveTab('brand')}
                        className="mt-2 text-sm text-orange-600 hover:text-orange-800 underline"
                      >
                        Configure Brand →
                      </button>
                    </div>
                  )}
                  {errors.brandId && <p className="mt-1 text-sm text-red-600">{errors.brandId}</p>}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    name="description"
                    value={itemData.description}
                    onChange={handleItemInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter item description"
                  />
                </div>
              </div>

              {/* Pricing Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    value={itemData.unitCost}
                    onChange={handleItemInputChange}
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
                    value={itemData.sellingPrice}
                    onChange={handleItemInputChange}
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-3">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Stock Information</h3>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Current Stock</label>
                  <input
                    type="number"
                    name="currentStock"
                    value={itemData.currentStock}
                    onChange={handleItemInputChange}
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Min Stock</label>
                  <input
                    type="number"
                    name="minStock"
                    value={itemData.minStock}
                    onChange={handleItemInputChange}
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Max Stock</label>
                  <input
                    type="number"
                    name="maxStock"
                    value={itemData.maxStock}
                    onChange={handleItemInputChange}
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Additional Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Additional Information</h3>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Supplier</label>
                  <input
                    type="text"
                    name="supplier"
                    value={itemData.supplier}
                    onChange={handleItemInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter supplier name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Unit</label>
                  <select
                    name="unit"
                    value={itemData.unit}
                    onChange={handleItemInputChange}
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                  <input
                    type="text"
                    name="location"
                    value={itemData.location}
                    onChange={handleItemInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter storage location"
                  />
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

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tracking Options</label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <label className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <input
                        type="checkbox"
                        name="isSerialTracked"
                        checked={itemData.isSerialTracked}
                        onChange={handleItemInputChange}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                      />
                      <span className="text-sm font-medium text-gray-700">Serial Tracking</span>
                    </label>
                    <label className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <input
                        type="checkbox"
                        name="isBatchTracked"
                        checked={itemData.isBatchTracked}
                        onChange={handleItemInputChange}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                      />
                      <span className="text-sm font-medium text-gray-700">Batch Tracking</span>
                    </label>
                    <label className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <input
                        type="checkbox"
                        name="isActive"
                        checked={itemData.isActive}
                        onChange={handleItemInputChange}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                      />
                      <span className="text-sm font-medium text-gray-700">Active Item</span>
                    </label>
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                  <textarea
                    name="notes"
                    value={itemData.notes}
                    onChange={handleItemInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Additional notes"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Category Tab */}
          {activeTab === 'category' && (
            <div className="space-y-6">
              <div className="bg-blue-50 p-4 rounded-md">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Category Information</h3>
                <p className="text-sm text-gray-600">
                  {createNewCategory ? 'Configure the new category details below:' : 'Select whether to create a new category or use an existing one.'}
                </p>
              </div>

              {createNewCategory && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={categoryData.name}
                      onChange={handleCategoryInputChange}
                      className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.categoryName ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter category name"
                    />
                    {errors.categoryName && <p className="mt-1 text-sm text-red-600">{errors.categoryName}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category Code <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="code"
                      value={categoryData.code}
                      onChange={handleCategoryInputChange}
                      className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.categoryCode ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter category code"
                    />
                    {errors.categoryCode && <p className="mt-1 text-sm text-red-600">{errors.categoryCode}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Parent Category</label>
                    <select
                      name="parentCategoryId"
                      value={categoryData.parentCategoryId}
                      onChange={handleCategoryInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">No parent category</option>
                      {existingCategories.filter(cat => cat.isActive).map(category => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="color"
                        name="color"
                        value={categoryData.color}
                        onChange={handleCategoryInputChange}
                        className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                      />
                      <input
                        type="text"
                        name="color"
                        value={categoryData.color}
                        onChange={handleCategoryInputChange}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="#3B82F6"
                      />
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    <textarea
                      name="description"
                      value={categoryData.description}
                      onChange={handleCategoryInputChange}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter category description"
                    />
                  </div>
                </div>
              )}

              {!createNewCategory && (
                <div className="text-center py-8">
                  <Tag className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">Using Existing Category</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Go back to Item Details tab to select a category from the existing options.
                  </p>
                  <button
                    type="button"
                    onClick={() => setActiveTab('item')}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Back to Item Details
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Brand Tab */}
          {activeTab === 'brand' && (
            <div className="space-y-6">
              <div className="bg-orange-50 p-4 rounded-md">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Brand Information</h3>
                <p className="text-sm text-gray-600">
                  {createNewBrand ? 'Configure the new brand details below:' : 'Select whether to create a new brand or use an existing one.'}
                </p>
              </div>

              {createNewBrand && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Brand Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={brandData.name}
                      onChange={handleBrandInputChange}
                      className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.brandName ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter brand name"
                    />
                    {errors.brandName && <p className="mt-1 text-sm text-red-600">{errors.brandName}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Brand Code <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="code"
                      value={brandData.code}
                      onChange={handleBrandInputChange}
                      className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.brandCode ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter brand code"
                    />
                    {errors.brandCode && <p className="mt-1 text-sm text-red-600">{errors.brandCode}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Website</label>
                    <input
                      type="url"
                      name="website"
                      value={brandData.website}
                      onChange={handleBrandInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="https://example.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                    <select
                      name="country"
                      value={brandData.country}
                      onChange={handleBrandInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select country</option>
                      <option value="US">United States</option>
                      <option value="CA">Canada</option>
                      <option value="UK">United Kingdom</option>
                      <option value="DE">Germany</option>
                      <option value="FR">France</option>
                      <option value="JP">Japan</option>
                      <option value="KR">South Korea</option>
                      <option value="CN">China</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <input
                      type="email"
                      name="contactInfo.email"
                      value={brandData.contactInfo?.email || ''}
                      onChange={handleBrandInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="contact@brand.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                    <input
                      type="tel"
                      name="contactInfo.phone"
                      value={brandData.contactInfo?.phone || ''}
                      onChange={handleBrandInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    <textarea
                      name="description"
                      value={brandData.description}
                      onChange={handleBrandInputChange}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter brand description"
                    />
                  </div>
                </div>
              )}

              {!createNewBrand && (
                <div className="text-center py-8">
                  <Award className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">Using Existing Brand</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Go back to Item Details tab to select a brand from the existing options.
                  </p>
                  <button
                    type="button"
                    onClick={() => setActiveTab('item')}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Back to Item Details
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 bg-gray-50 -mx-6 px-6 py-4 mt-6">
            <button
              type="button"
              onClick={handleClose}
              className="px-6 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 hover:border-gray-400 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>Save All</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UnifiedAddModal;
