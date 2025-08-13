import React, { useState } from 'react';
import { X, Tag, Save } from 'lucide-react';
import { CategoryFormData, ItemCategory } from '../types/inventory';

interface AddCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (categoryData: CategoryFormData) => void;
  categories: ItemCategory[];
}

const AddCategoryModal: React.FC<AddCategoryModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  categories
}) => {
  const [formData, setFormData] = useState<CategoryFormData>({
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

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Category name is required';
    }
    if (!formData.code.trim()) {
      newErrors.code = 'Category code is required';
    }
    if (formData.displayOrder < 1) {
      newErrors.displayOrder = 'Display order must be at least 1';
    }
    if (formData.taxRate < 0 || formData.taxRate > 100) {
      newErrors.taxRate = 'Tax rate must be between 0 and 100';
    }
    if (formData.marginPercentage < 0 || formData.marginPercentage > 100) {
      newErrors.marginPercentage = 'Margin percentage must be between 0 and 100';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    onSubmit(formData);
    handleClose();
  };

  const handleClose = () => {
    setFormData({
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
    setErrors({});
    onClose();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto my-8">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Tag className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">Add New Category</h2>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter category name"
              />
              {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category Code <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="code"
                value={formData.code}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.code ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter category code"
              />
              {errors.code && <p className="mt-1 text-sm text-red-600">{errors.code}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Parent Category</label>
              <select
                name="parentCategoryId"
                value={formData.parentCategoryId}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">No parent category</option>
                {categories.filter(cat => cat.isActive).map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Display Order</label>
              <input
                type="number"
                name="displayOrder"
                value={formData.displayOrder}
                onChange={handleInputChange}
                min="1"
                className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.displayOrder ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.displayOrder && <p className="mt-1 text-sm text-red-600">{errors.displayOrder}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category Color</label>
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <input
                    type="color"
                    name="color"
                    value={formData.color}
                    onChange={handleInputChange}
                    className="w-12 h-10 border-2 border-gray-300 rounded-lg cursor-pointer"
                  />
                  <div className="absolute inset-0 rounded-lg ring-2 ring-offset-1 ring-transparent pointer-events-none" style={{ backgroundColor: formData.color, opacity: 0.2 }}></div>
                </div>
                <input
                  type="text"
                  name="color"
                  value={formData.color}
                  onChange={handleInputChange}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                  placeholder="#3B82F6"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Icon URL</label>
              <input
                type="url"
                name="iconUrl"
                value={formData.iconUrl}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="https://example.com/icon.png"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tax Rate (%)</label>
              <input
                type="number"
                name="taxRate"
                value={formData.taxRate}
                onChange={handleInputChange}
                min="0"
                max="100"
                step="0.01"
                className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.taxRate ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="0.00"
              />
              {errors.taxRate && <p className="mt-1 text-sm text-red-600">{errors.taxRate}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Margin Percentage (%)</label>
              <input
                type="number"
                name="marginPercentage"
                value={formData.marginPercentage}
                onChange={handleInputChange}
                min="0"
                max="100"
                step="0.01"
                className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.marginPercentage ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="0.00"
              />
              {errors.marginPercentage && <p className="mt-1 text-sm text-red-600">{errors.marginPercentage}</p>}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter category description"
              />
            </div>

            <div className="md:col-span-2">
              <label className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                />
                <span className="text-sm font-medium text-gray-700">Mark this category as active</span>
              </label>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 bg-gray-50 -mx-6 px-6 py-4 rounded-b-lg">
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
              <span>Save Category</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCategoryModal;
