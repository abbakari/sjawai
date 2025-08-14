import React, { useState } from 'react';
import { X, BarChart3, TrendingUp, PieChart, Calendar, Target, DollarSign, Users, Package } from 'lucide-react';
import { getCurrentYear } from '../utils/dynamicYearUtils';

interface AnalyticsPlanningModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AnalyticsPlanningModal: React.FC<AnalyticsPlanningModalProps> = ({ isOpen, onClose }) => {
  const [activeAnalytic, setActiveAnalytic] = useState<'sales' | 'forecast' | 'customer' | 'product'>('sales');
  const [timeframe, setTimeframe] = useState<'monthly' | 'quarterly' | 'yearly'>('monthly');

  // Sample analytics data
  const salesAnalytics = {
    totalRevenue: '$2.4M',
    growth: '+15.2%',
    topProducts: [
      { name: 'iPhone 15 Pro', revenue: '$850K', growth: '+22%' },
      { name: 'Samsung Galaxy S24', revenue: '$620K', growth: '+18%' },
      { name: 'MacBook Air M3', revenue: '$480K', growth: '+12%' }
    ],
    trends: [
      { month: 'Jan', value: 85 },
      { month: 'Feb', value: 92 },
      { month: 'Mar', value: 78 },
      { month: 'Apr', value: 95 },
      { month: 'May', value: 88 },
      { month: 'Jun', value: 102 }
    ]
  };

  const currentYear = getCurrentYear();
  const forecastAnalytics = {
    accuracy: '94.2%',
    confidence: 'High',
    predictions: [
      { period: `Q1 ${currentYear}`, forecast: '$2.8M', confidence: '92%' },
      { period: `Q2 ${currentYear}`, forecast: '$3.1M', confidence: '88%' },
      { period: `Q3 ${currentYear}`, forecast: '$3.4M', confidence: '85%' },
      { period: `Q4 ${currentYear}`, forecast: '$3.7M', confidence: '82%' }
    ]
  };

  const customerAnalytics = {
    totalCustomers: '1,245',
    newCustomers: '+85',
    retention: '87.3%',
    segments: [
      { name: 'Government', count: 342, percentage: 27.5 },
      { name: 'Corporate', count: 298, percentage: 23.9 },
      { name: 'NGO', count: 356, percentage: 28.6 },
      { name: 'Individual', count: 249, percentage: 20.0 }
    ]
  };

  const productAnalytics = {
    totalProducts: '156',
    topPerformers: 12,
    lowStock: 23,
    categories: [
      { name: 'Tyres', count: 89, revenue: '$1.2M' },
      { name: 'Accessories', count: 45, revenue: '$650K' },
      { name: 'Batteries', count: 22, revenue: '$380K' }
    ]
  };

  const renderAnalyticsDashboard = () => {
    switch (activeAnalytic) {
      case 'sales':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100">Total Revenue</p>
                    <p className="text-3xl font-bold">{salesAnalytics.totalRevenue}</p>
                    <p className="text-blue-100 text-sm">{salesAnalytics.growth} vs last period</p>
                  </div>
                  <DollarSign className="w-8 h-8 text-blue-200" />
                </div>
              </div>

              <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100">Growth Rate</p>
                    <p className="text-3xl font-bold">+15.2%</p>
                    <p className="text-green-100 text-sm">Month over month</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-green-200" />
                </div>
              </div>

              <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100">Top Products</p>
                    <p className="text-3xl font-bold">{salesAnalytics.topProducts.length}</p>
                    <p className="text-purple-100 text-sm">Contributing 80% revenue</p>
                  </div>
                  <Package className="w-8 h-8 text-purple-200" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6">
              <h4 className="text-lg font-semibold mb-4">Sales Trend</h4>
              <div className="relative h-40">
                <svg className="w-full h-full" viewBox="0 0 600 120">
                  <polyline
                    points={salesAnalytics.trends.map((d, i) => `${50 + i * 90},${120 - (d?.value || 0) * 0.8}`).join(' ')}
                    fill="none"
                    stroke="#3B82F6"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                  {salesAnalytics.trends.map((d, i) => (
                    <circle key={i} cx={50 + i * 90} cy={120 - (d?.value || 0) * 0.8} r="4" fill="#3B82F6" />
                  ))}
                  {salesAnalytics.trends.map((d, i) => (
                    <text key={i} x={50 + i * 90} y={135} fontSize="12" fill="#6B7280" textAnchor="middle">
                      {d.month || ''}
                    </text>
                  ))}
                </svg>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6">
              <h4 className="text-lg font-semibold mb-4">Top Performing Products</h4>
              <div className="space-y-3">
                {salesAnalytics.topProducts.map((product, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">{product.name}</p>
                      <p className="text-sm text-gray-600">Revenue: {product.revenue}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-green-600 font-semibold">{product.growth}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'forecast':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-lg p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-indigo-100">Forecast Accuracy</p>
                    <p className="text-3xl font-bold">{forecastAnalytics.accuracy}</p>
                    <p className="text-indigo-100 text-sm">Last 12 months average</p>
                  </div>
                  <Target className="w-8 h-8 text-indigo-200" />
                </div>
              </div>

              <div className="bg-gradient-to-r from-teal-500 to-teal-600 rounded-lg p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-teal-100">Confidence Level</p>
                    <p className="text-3xl font-bold">{forecastAnalytics.confidence}</p>
                    <p className="text-teal-100 text-sm">Model reliability</p>
                  </div>
                  <BarChart3 className="w-8 h-8 text-teal-200" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6">
              <h4 className="text-lg font-semibold mb-4">Quarterly Forecast Predictions</h4>
              <div className="space-y-4">
                {forecastAnalytics.predictions.map((prediction, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <p className="font-medium">{prediction.period}</p>
                      <p className="text-2xl font-bold text-blue-600">{prediction.forecast}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Confidence</p>
                      <p className="text-lg font-semibold text-green-600">{prediction.confidence}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'customer':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gradient-to-r from-pink-500 to-pink-600 rounded-lg p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-pink-100">Total Customers</p>
                    <p className="text-3xl font-bold">{customerAnalytics.totalCustomers}</p>
                    <p className="text-pink-100 text-sm">Active accounts</p>
                  </div>
                  <Users className="w-8 h-8 text-pink-200" />
                </div>
              </div>

              <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-100">New Customers</p>
                    <p className="text-3xl font-bold">{customerAnalytics.newCustomers}</p>
                    <p className="text-orange-100 text-sm">This month</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-orange-200" />
                </div>
              </div>

              <div className="bg-gradient-to-r from-cyan-500 to-cyan-600 rounded-lg p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-cyan-100">Retention Rate</p>
                    <p className="text-3xl font-bold">{customerAnalytics.retention}</p>
                    <p className="text-cyan-100 text-sm">12-month average</p>
                  </div>
                  <Target className="w-8 h-8 text-cyan-200" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6">
              <h4 className="text-lg font-semibold mb-4">Customer Segments</h4>
              <div className="space-y-3">
                {customerAnalytics.segments.map((segment, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <div className={`w-4 h-4 rounded mr-3`} style={{
                        backgroundColor: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'][index]
                      }}></div>
                      <div>
                        <p className="font-medium">{segment.name}</p>
                        <p className="text-sm text-gray-600">{segment.count} customers</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold">{segment.percentage}%</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'product':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gradient-to-r from-violet-500 to-violet-600 rounded-lg p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-violet-100">Total Products</p>
                    <p className="text-3xl font-bold">{productAnalytics.totalProducts}</p>
                    <p className="text-violet-100 text-sm">Active catalog</p>
                  </div>
                  <Package className="w-8 h-8 text-violet-200" />
                </div>
              </div>

              <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-lg p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-emerald-100">Top Performers</p>
                    <p className="text-3xl font-bold">{productAnalytics.topPerformers}</p>
                    <p className="text-emerald-100 text-sm">High sales volume</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-emerald-200" />
                </div>
              </div>

              <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-lg p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-red-100">Low Stock</p>
                    <p className="text-3xl font-bold">{productAnalytics.lowStock}</p>
                    <p className="text-red-100 text-sm">Need reordering</p>
                  </div>
                  <Package className="w-8 h-8 text-red-200" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6">
              <h4 className="text-lg font-semibold mb-4">Product Categories</h4>
              <div className="space-y-3">
                {productAnalytics.categories.map((category, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">{category.name}</p>
                      <p className="text-sm text-gray-600">{category.count} products</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold text-blue-600">{category.revenue}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            <h2 className="text-xl font-bold text-gray-900">Analytics Planning Dashboard</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex">
          {/* Sidebar */}
          <div className="w-64 border-r border-gray-200 p-4">
            <div className="space-y-2">
              <button
                onClick={() => setActiveAnalytic('sales')}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                  activeAnalytic === 'sales' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <DollarSign className="w-5 h-5" />
                <span>Sales Analytics</span>
              </button>
              <button
                onClick={() => setActiveAnalytic('forecast')}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                  activeAnalytic === 'forecast' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <TrendingUp className="w-5 h-5" />
                <span>Forecast Analytics</span>
              </button>
              <button
                onClick={() => setActiveAnalytic('customer')}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                  activeAnalytic === 'customer' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Users className="w-5 h-5" />
                <span>Customer Analytics</span>
              </button>
              <button
                onClick={() => setActiveAnalytic('product')}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                  activeAnalytic === 'product' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Package className="w-5 h-5" />
                <span>Product Analytics</span>
              </button>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <label className="block text-sm font-medium text-gray-700 mb-2">Time Period</label>
              <select
                value={timeframe}
                onChange={(e) => setTimeframe(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 p-6 max-h-[calc(90vh-120px)] overflow-y-auto">
            {renderAnalyticsDashboard()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPlanningModal;
