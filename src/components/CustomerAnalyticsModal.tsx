import React, { useState, useEffect } from 'react';
import { X, TrendingUp, DollarSign, BarChart3, PieChart, Calendar, Target, AlertTriangle } from 'lucide-react';
import { Customer, CustomerItemForecast, CustomerAnalytics } from '../types/forecast';
import { formatCurrency, formatPercentage, generateCustomerAnalytics } from '../utils/budgetCalculations';

interface CustomerAnalyticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer: Customer | null;
  customerForecasts: CustomerItemForecast[];
}

const CustomerAnalyticsModal: React.FC<CustomerAnalyticsModalProps> = ({
  isOpen,
  onClose,
  customer,
  customerForecasts
}) => {
  const [analytics, setAnalytics] = useState<CustomerAnalytics | null>(null);
  const [activeChart, setActiveChart] = useState<'monthly' | 'category' | 'channel' | 'seasonal'>('monthly');

  useEffect(() => {
    if (customer) {
      if (customerForecasts.length > 0) {
        const customerAnalytics = generateCustomerAnalytics(customer.id, customerForecasts);
        setAnalytics(customerAnalytics);
      } else {
        // Create empty analytics for customers with no forecasts
        setAnalytics({
          customerId: customer.id,
          totalForecast: 0,
          monthlyBreakdown: {},
          categoryBreakdown: {},
          channelBreakdown: {},
          growthRate: 0,
          seasonalTrends: [],
          riskScore: 0,
          confidenceScore: 0
        });
      }
    }
  }, [customer, customerForecasts]);

  if (!isOpen || !customer) return null;

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  // Prepare data for charts
  const monthlyData = monthNames.map(month => ({
    month,
    value: analytics?.monthlyBreakdown?.[month] || 0
  }));

  const categoryData = Object.entries(analytics?.categoryBreakdown || {}).map(([category, value]) => ({
    category,
    value,
    percentage: analytics?.totalForecast ? (value / analytics.totalForecast) * 100 : 0
  }));

  const channelData = Object.entries(analytics?.channelBreakdown || {}).map(([channel, value]) => ({
    channel,
    value,
    percentage: analytics?.totalForecast ? (value / analytics.totalForecast) * 100 : 0
  }));

  const maxMonthlyValue = Math.max(...monthlyData.map(d => d.value), 1) || 1;

  // Simple bar chart component
  const BarChart = ({ data, color = '#3B82F6' }: { data: any[]; color?: string }) => {
    // Handle undefined or empty data
    if (!data || data.length === 0) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="text-gray-400 mb-2">No data available</div>
            <div className="text-sm text-gray-500">Create forecasts to see chart data</div>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-2">
        {data.map((item, index) => (
          <div key={index} className="flex items-center">
            <div className="w-16 text-sm text-gray-600 flex-shrink-0">
              {item.month || item.category || item.channel}
            </div>
            <div className="flex-1 mx-3">
              <div className="bg-gray-200 rounded-full h-4">
                <div
                  className="h-4 rounded-full transition-all duration-500"
                  style={{
                    width: `${(item.value / (maxMonthlyValue || analytics?.totalForecast || 1)) * 100}%`,
                    backgroundColor: color
                  }}
                ></div>
              </div>
            </div>
            <div className="w-20 text-sm font-medium text-gray-900 text-right">
              {formatCurrency(item.value)}
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Simple pie chart component
  const PieChart = ({ data, colors }: { data: any[]; colors: string[] }) => {
    let cumulativePercentage = 0;

    // Handle undefined or empty data
    if (!data || data.length === 0) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="text-gray-400 mb-2">No data available</div>
            <div className="text-sm text-gray-500">Create forecasts to see chart data</div>
          </div>
        </div>
      );
    }

    return (
      <div className="flex items-center justify-center">
        <div className="relative">
          <svg width="200" height="200" className="transform -rotate-90">
            {data.map((item, index) => {
              const percentage = item.percentage || 0;
              const angle = (percentage / 100) * 360;
              const startAngle = (cumulativePercentage / 100) * 360;

              const x1 = 100 + 80 * Math.cos((startAngle * Math.PI) / 180);
              const y1 = 100 + 80 * Math.sin((startAngle * Math.PI) / 180);
              const x2 = 100 + 80 * Math.cos(((startAngle + angle) * Math.PI) / 180);
              const y2 = 100 + 80 * Math.sin(((startAngle + angle) * Math.PI) / 180);

              const largeArcFlag = angle > 180 ? 1 : 0;
              
              const pathData = [
                `M 100 100`,
                `L ${x1} ${y1}`,
                `A 80 80 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                'Z'
              ].join(' ');
              
              cumulativePercentage += percentage;
              
              return (
                <path
                  key={index}
                  d={pathData}
                  fill={colors[index % colors.length]}
                  stroke="white"
                  strokeWidth="2"
                />
              );
            })}
          </svg>
          
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{formatCurrency(analytics?.totalForecast || 0)}</div>
              <div className="text-sm text-gray-600">Total</div>
            </div>
          </div>
        </div>
        
        <div className="ml-8 space-y-2">
          {(data || []).map((item, index) => (
            <div key={index} className="flex items-center">
              <div 
                className="w-4 h-4 rounded mr-3" 
                style={{ backgroundColor: colors[index % colors.length] }}
              ></div>
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-900">
                  {item.category || item.channel}
                </div>
                <div className="text-xs text-gray-600">
                  {formatCurrency(item.value)} ({(item.percentage || 0).toFixed(1)}%)
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Analytics for {customer.name}
            </h2>
            <p className="text-sm text-gray-600">
              Comprehensive forecast analytics and performance insights
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-900">Total Forecast</p>
                  <p className="text-xl font-semibold text-blue-800">{formatCurrency(analytics?.totalForecast || 0)}</p>
                </div>
                <DollarSign className="w-8 h-8 text-blue-600" />
              </div>
            </div>

            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-900">Growth Rate</p>
                  <p className="text-xl font-semibold text-green-800">{formatPercentage(analytics?.growthRate || 0)}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-600" />
              </div>
            </div>

            <div className="bg-purple-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-900">Confidence Score</p>
                  <p className="text-xl font-semibold text-purple-800">{analytics?.confidenceScore || 0}%</p>
                </div>
                <Target className="w-8 h-8 text-purple-600" />
              </div>
            </div>

            <div className="bg-orange-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-900">Risk Score</p>
                  <p className="text-xl font-semibold text-orange-800">{analytics?.riskScore || 0}%</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-orange-600" />
              </div>
            </div>
          </div>

          {/* Customer Information */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-3">Customer Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="font-medium text-gray-600">Code</p>
                <p className="text-gray-900">{customer.code}</p>
              </div>
              <div>
                <p className="font-medium text-gray-600">Region</p>
                <p className="text-gray-900">{customer.region}</p>
              </div>
              <div>
                <p className="font-medium text-gray-600">Segment</p>
                <p className="text-gray-900">{customer.segment}</p>
              </div>
              <div>
                <p className="font-medium text-gray-600">Tier</p>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  customer.tier === 'platinum' ? 'bg-purple-100 text-purple-800' :
                  customer.tier === 'gold' ? 'bg-yellow-100 text-yellow-800' :
                  customer.tier === 'silver' ? 'bg-gray-100 text-gray-800' :
                  'bg-orange-100 text-orange-800'
                }`}>
                  {customer.tier}
                </span>
              </div>
            </div>
          </div>

          {/* Chart Controls */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Analytics Charts</h3>
              <div className="flex space-x-2">
                <button
                  onClick={() => setActiveChart('monthly')}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors ${
                    activeChart === 'monthly' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Calendar className="w-4 h-4" />
                  <span>Monthly</span>
                </button>
                <button
                  onClick={() => setActiveChart('category')}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors ${
                    activeChart === 'category' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <PieChart className="w-4 h-4" />
                  <span>Categories</span>
                </button>
                <button
                  onClick={() => setActiveChart('channel')}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors ${
                    activeChart === 'channel' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <BarChart3 className="w-4 h-4" />
                  <span>Channels</span>
                </button>
                <button
                  onClick={() => setActiveChart('seasonal')}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors ${
                    activeChart === 'seasonal' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <TrendingUp className="w-4 h-4" />
                  <span>Trends</span>
                </button>
              </div>
            </div>

            {/* Chart Display */}
            <div className="h-80">
              {activeChart === 'monthly' && (
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-4">Monthly Forecast Breakdown</h4>
                  <BarChart data={monthlyData} color="#3B82F6" />
                </div>
              )}
              
              {activeChart === 'category' && (
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-4">Category Distribution</h4>
                  <PieChart 
                    data={categoryData} 
                    colors={['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6']} 
                  />
                </div>
              )}
              
              {activeChart === 'channel' && (
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-4">Channel Performance</h4>
                  <BarChart data={channelData} color="#10B981" />
                </div>
              )}
              
              {activeChart === 'seasonal' && (
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-4">Seasonal Trends</h4>
                  <div className="space-y-3">
                    {Array.isArray(analytics?.seasonalTrends) ? analytics.seasonalTrends.map((trend, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <span className="font-medium text-gray-900">{trend?.month || 'Unknown'}</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            trend?.trend === 'up' ? 'bg-green-100 text-green-800' :
                            trend?.trend === 'down' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {trend?.trend === 'up' ? '↑ Growing' : trend?.trend === 'down' ? '↓ Declining' : '→ Stable'}
                          </span>
                        </div>
                        <span className="font-medium text-gray-900">
                          {formatCurrency(trend?.averageValue || 0)}
                        </span>
                      </div>
                    )) : (
                      <div className="text-center py-8 text-gray-500">
                        <p>No seasonal trend data available</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <div className="text-sm text-gray-600">
            Analytics generated based on {customerForecasts.filter(f => f.customerId === customer.id).length} active forecasts
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomerAnalyticsModal;
