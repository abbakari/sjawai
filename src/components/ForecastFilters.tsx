import React, { useState } from 'react';
import { Filter, X, Calendar, TrendingUp, Users, Target, Brain, BarChart3 } from 'lucide-react';

const ForecastFilters: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState({
    forecastModel: '',
    accuracy: '',
    confidence: '',
    timeHorizon: '',
    customer: '',
    product: '',
    scenario: '',
    riskLevel: ''
  });

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      forecastModel: '',
      accuracy: '',
      confidence: '',
      timeHorizon: '',
      customer: '',
      product: '',
      scenario: '',
      riskLevel: ''
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
              <span className="text-sm font-medium text-gray-700">Advanced Forecast Filters</span>
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
            <h5 className="text-lg font-semibold text-gray-900">Advanced Forecast Filters</h5>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Forecast Model Filter */}
          <div className="space-y-2">
            <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
              <Brain className="w-4 h-4" />
              <span>Forecast Model</span>
            </label>
            <select
              className="form-select w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={filters.forecastModel}
              onChange={(e) => handleFilterChange('forecastModel', e.target.value)}
            >
              <option value="">All Models</option>
              <option value="linear">Linear Regression</option>
              <option value="arima">ARIMA</option>
              <option value="exponential">Exponential Smoothing</option>
              <option value="neural">Neural Network</option>
              <option value="ensemble">Ensemble</option>
            </select>
          </div>

          {/* Accuracy Filter */}
          <div className="space-y-2">
            <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
              <Target className="w-4 h-4" />
              <span>Accuracy Range</span>
            </label>
            <select
              className="form-select w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={filters.accuracy}
              onChange={(e) => handleFilterChange('accuracy', e.target.value)}
            >
              <option value="">All Accuracy</option>
              <option value="95+">95%+</option>
              <option value="90-95">90% - 95%</option>
              <option value="85-90">85% - 90%</option>
              <option value="80-85">80% - 85%</option>
              <option value="below-80">Below 80%</option>
            </select>
          </div>

          {/* Confidence Filter */}
          <div className="space-y-2">
            <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
              <BarChart3 className="w-4 h-4" />
              <span>Confidence Level</span>
            </label>
            <select
              className="form-select w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={filters.confidence}
              onChange={(e) => handleFilterChange('confidence', e.target.value)}
            >
              <option value="">All Confidence</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          {/* Time Horizon Filter */}
          <div className="space-y-2">
            <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
              <Calendar className="w-4 h-4" />
              <span>Time Horizon</span>
            </label>
            <select
              className="form-select w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={filters.timeHorizon}
              onChange={(e) => handleFilterChange('timeHorizon', e.target.value)}
            >
              <option value="">All Horizons</option>
              <option value="3">3 Months</option>
              <option value="6">6 Months</option>
              <option value="12">12 Months</option>
              <option value="18">18 Months</option>
              <option value="24">24 Months</option>
            </select>
          </div>

          {/* Customer Segment Filter */}
          <div className="space-y-2">
            <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
              <Users className="w-4 h-4" />
              <span>Customer Segment</span>
            </label>
            <select
              className="form-select w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={filters.customer}
              onChange={(e) => handleFilterChange('customer', e.target.value)}
            >
              <option value="">All Segments</option>
              <option value="enterprise">Enterprise</option>
              <option value="smb">SMB</option>
              <option value="retail">Retail</option>
              <option value="government">Government</option>
            </select>
          </div>

          {/* Product Category Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Product Category</label>
            <select
              className="form-select w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={filters.product}
              onChange={(e) => handleFilterChange('product', e.target.value)}
            >
              <option value="">All Products</option>
              <option value="electronics">Electronics</option>
              <option value="clothing">Clothing</option>
              <option value="home-garden">Home & Garden</option>
              <option value="sports">Sports</option>
              <option value="books">Books</option>
            </select>
          </div>

          {/* Scenario Filter */}
          <div className="space-y-2">
            <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
              <TrendingUp className="w-4 h-4" />
              <span>Scenario Type</span>
            </label>
            <select
              className="form-select w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={filters.scenario}
              onChange={(e) => handleFilterChange('scenario', e.target.value)}
            >
              <option value="">All Scenarios</option>
              <option value="base">Base Case</option>
              <option value="optimistic">Optimistic</option>
              <option value="pessimistic">Pessimistic</option>
              <option value="stress">Stress Test</option>
            </select>
          </div>

          {/* Risk Level Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Risk Level</label>
            <select
              className="form-select w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={filters.riskLevel}
              onChange={(e) => handleFilterChange('riskLevel', e.target.value)}
            >
              <option value="">All Risk Levels</option>
              <option value="low">Low Risk</option>
              <option value="medium">Medium Risk</option>
              <option value="high">High Risk</option>
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

export default ForecastFilters;