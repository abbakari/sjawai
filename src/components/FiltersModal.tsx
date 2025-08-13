import React, { useState } from 'react';
import { X, Calendar, Tag, User, Package, Filter } from 'lucide-react';

interface FiltersModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (filters: FilterState) => void;
}

export interface FilterState {
  dateRange: string;
  customer: string;
  product: string;
  category: string;
  status: string;
  region: string;
  priceRange: {
    min: number;
    max: number;
  };
}

const FiltersModal: React.FC<FiltersModalProps> = ({ isOpen, onClose, onApply }) => {
  const [filters, setFilters] = useState<FilterState>({
    dateRange: 'current-year',
    customer: '',
    product: '',
    category: '',
    status: 'all',
    region: '',
    priceRange: {
      min: 0,
      max: 10000
    }
  });

  const handleApply = () => {
    onApply(filters);
    onClose();
  };

  const handleReset = () => {
    setFilters({
      dateRange: 'current-year',
      customer: '',
      product: '',
      category: '',
      status: 'all',
      region: '',
      priceRange: {
        min: 0,
        max: 10000
      }
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-blue-600" />
            <h2 className="text-xl font-bold text-gray-900">Advanced Filters</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Date Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                Date Range
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={filters.dateRange}
                onChange={(e) => setFilters({...filters, dateRange: e.target.value})}
              >
                <option value="current-year">Current Year</option>
                <option value="last-year">Last Year</option>
                <option value="last-6-months">Last 6 Months</option>
                <option value="last-3-months">Last 3 Months</option>
                <option value="custom">Custom Range</option>
              </select>
            </div>

            {/* Customer */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <User className="w-4 h-4 inline mr-1" />
                Customer
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={filters.customer}
                onChange={(e) => setFilters({...filters, customer: e.target.value})}
              >
                <option value="">All Customers</option>
                <option value="action-aid">Action Aid International (Tz)</option>
                <option value="unicef">UNICEF Tanzania</option>
                <option value="who">WHO Tanzania</option>
                <option value="government">Government of Tanzania</option>
              </select>
            </div>

            {/* Product */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Package className="w-4 h-4 inline mr-1" />
                Product
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Search products..."
                value={filters.product}
                onChange={(e) => setFilters({...filters, product: e.target.value})}
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Tag className="w-4 h-4 inline mr-1" />
                Category
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={filters.category}
                onChange={(e) => setFilters({...filters, category: e.target.value})}
              >
                <option value="">All Categories</option>
                <option value="tyres">Tyres</option>
                <option value="accessories">Accessories</option>
                <option value="batteries">Batteries</option>
                <option value="oils">Oils & Lubricants</option>
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={filters.status}
                onChange={(e) => setFilters({...filters, status: e.target.value})}
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="pending">Pending</option>
              </select>
            </div>

            {/* Region */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Region</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={filters.region}
                onChange={(e) => setFilters({...filters, region: e.target.value})}
              >
                <option value="">All Regions</option>
                <option value="dar-es-salaam">Dar es Salaam</option>
                <option value="arusha">Arusha</option>
                <option value="mwanza">Mwanza</option>
                <option value="dodoma">Dodoma</option>
              </select>
            </div>
          </div>

          {/* Price Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Price Range ($)</label>
            <div className="flex items-center space-x-4">
              <input
                type="number"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Min"
                value={filters.priceRange.min}
                onChange={(e) => setFilters({
                  ...filters,
                  priceRange: {...filters.priceRange, min: parseInt(e.target.value) || 0}
                })}
              />
              <span className="text-gray-500">to</span>
              <input
                type="number"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Max"
                value={filters.priceRange.max}
                onChange={(e) => setFilters({
                  ...filters,
                  priceRange: {...filters.priceRange, max: parseInt(e.target.value) || 10000}
                })}
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between p-6 border-t border-gray-200">
          <button
            onClick={handleReset}
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
              onClick={handleApply}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Apply Filters
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FiltersModal;
