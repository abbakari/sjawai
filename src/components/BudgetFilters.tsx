import React, { useState } from 'react';
import { Filter, X, Calendar, DollarSign, MapPin, Package } from 'lucide-react';

const BudgetFilters: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState({
    dateRange: '',
    budgetRange: '',
    region: '',
    category: '',
    status: '',
    manager: ''
  });

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      dateRange: '',
      budgetRange: '',
      region: '',
      category: '',
      status: '',
      manager: ''
    });
  };

  const activeFiltersCount = Object.values(filters).filter(value => value !== '').length;

  if (!isOpen) {
    return (
      <div className="card bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="card-body p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">Advanced Filters</span>
              {activeFiltersCount > 0 && (
                <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
                  {activeFiltersCount} active
                </span>
              )}
            </div>
            <button
              onClick={() => setIsOpen(true)}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
            >
              Show Filters
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="card-header border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-gray-600" />
            <h5 className="text-lg font-semibold text-gray-900">Advanced Filters</h5>
            {activeFiltersCount > 0 && (
              <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
                {activeFiltersCount} active
              </span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={clearFilters}
              className="text-gray-600 hover:text-gray-800 text-sm font-medium transition-colors"
            >
              Clear All
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
      
      <div className="card-body p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Date Range Filter */}
          <div className="space-y-2">
            <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
              <Calendar className="w-4 h-4" />
              <span>Date Range</span>
            </label>
            <select
              className="form-select w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={filters.dateRange}
              onChange={(e) => handleFilterChange('dateRange', e.target.value)}
            >
              <option value="">All Periods</option>
              <option value="current-month">Current Month</option>
              <option value="current-quarter">Current Quarter</option>
              <option value="current-year">Current Year</option>
              <option value="last-month">Last Month</option>
              <option value="last-quarter">Last Quarter</option>
              <option value="last-year">Last Year</option>
            </select>
          </div>

          {/* Budget Range Filter */}
          <div className="space-y-2">
            <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
              <DollarSign className="w-4 h-4" />
              <span>Budget Range</span>
            </label>
            <select
              className="form-select w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={filters.budgetRange}
              onChange={(e) => handleFilterChange('budgetRange', e.target.value)}
            >
              <option value="">All Ranges</option>
              <option value="0-50000">$0 - $50,000</option>
              <option value="50000-100000">$50,000 - $100,000</option>
              <option value="100000-500000">$100,000 - $500,000</option>
              <option value="500000-1000000">$500,000 - $1,000,000</option>
              <option value="1000000+">$1,000,000+</option>
            </select>
          </div>

          {/* Region Filter */}
          <div className="space-y-2">
            <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
              <MapPin className="w-4 h-4" />
              <span>Region</span>
            </label>
            <select
              className="form-select w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={filters.region}
              onChange={(e) => handleFilterChange('region', e.target.value)}
            >
              <option value="">All Regions</option>
              <option value="north-america">North America</option>
              <option value="europe">Europe</option>
              <option value="asia-pacific">Asia Pacific</option>
              <option value="latin-america">Latin America</option>
              <option value="middle-east-africa">Middle East & Africa</option>
            </select>
          </div>

          {/* Category Filter */}
          <div className="space-y-2">
            <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
              <Package className="w-4 h-4" />
              <span>Category</span>
            </label>
            <select
              className="form-select w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
            >
              <option value="">All Categories</option>
              <option value="electronics">Electronics</option>
              <option value="clothing">Clothing</option>
              <option value="home-garden">Home & Garden</option>
              <option value="sports">Sports</option>
              <option value="books">Books</option>
              <option value="automotive">Automotive</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Status</label>
            <select
              className="form-select w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          {/* Manager Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Manager</label>
            <select
              className="form-select w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={filters.manager}
              onChange={(e) => handleFilterChange('manager', e.target.value)}
            >
              <option value="">All Managers</option>
              <option value="john-smith">John Smith</option>
              <option value="marie-dubois">Marie Dubois</option>
              <option value="hiroshi-tanaka">Hiroshi Tanaka</option>
              <option value="carlos-rodriguez">Carlos Rodriguez</option>
              <option value="ahmed-hassan">Ahmed Hassan</option>
            </select>
          </div>
        </div>

        {/* Filter Actions */}
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
          <div className="text-sm text-gray-600">
            {activeFiltersCount > 0 ? `${activeFiltersCount} filter(s) applied` : 'No filters applied'}
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={clearFilters}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
            >
              Clear All
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium transition-colors"
            >
              Apply Filters
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BudgetFilters;