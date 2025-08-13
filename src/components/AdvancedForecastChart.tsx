import React, { useState } from 'react';
import { BarChart3, LineChart, PieChart, TrendingUp, Calendar, Target, DollarSign } from 'lucide-react';

const AdvancedForecastChart: React.FC = () => {
  const [activeChart, setActiveChart] = useState<'line' | 'bar' | 'pie' | 'trend'>('line');
  const [timeRange, setTimeRange] = useState<'3m' | '6m' | '12m' | '24m'>('12m');

  // Sample data for different chart types
  const monthlyData = [
    { month: 'Jan', forecast: 8500, actual: 8200, budget: 8000, accuracy: 96.5 },
    { month: 'Feb', forecast: 8800, actual: 8900, budget: 8200, accuracy: 98.9 },
    { month: 'Mar', forecast: 9200, actual: 9100, budget: 8800, accuracy: 98.9 },
    { month: 'Apr', forecast: 9500, actual: 9300, budget: 9200, accuracy: 97.9 },
    { month: 'May', forecast: 9800, actual: 9600, budget: 9500, accuracy: 98.0 },
    { month: 'Jun', forecast: 10200, actual: 10100, budget: 9800, accuracy: 99.0 },
    { month: 'Jul', forecast: 10500, actual: 10300, budget: 10200, accuracy: 98.1 },
    { month: 'Aug', forecast: 10800, actual: 10600, budget: 10500, accuracy: 98.1 },
    { month: 'Sep', forecast: 11200, actual: 11000, budget: 10800, accuracy: 98.2 },
    { month: 'Oct', forecast: 11500, actual: 11300, budget: 11200, accuracy: 98.3 },
    { month: 'Nov', forecast: 11800, actual: 11600, budget: 11500, accuracy: 98.3 },
    { month: 'Dec', forecast: 12200, actual: 12000, budget: 11800, accuracy: 98.4 }
  ];

  const productData = [
    { name: 'iPhone 15 Pro', value: 35, color: '#3B82F6' },
    { name: 'Samsung Galaxy S24', value: 28, color: '#10B981' },
    { name: 'MacBook Air M3', value: 20, color: '#F59E0B' },
    { name: 'Dell XPS 13', value: 12, color: '#EF4444' },
    { name: 'Others', value: 5, color: '#8B5CF6' }
  ];

  const maxValue = Math.max(...monthlyData.map(d => Math.max(d?.forecast || 0, d?.actual || 0, d?.budget || 0))) || 1;

  const renderLineChart = () => (
    <div className="relative h-80 bg-white rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Forecast vs Actual Trends</h3>
        <div className="flex space-x-4 text-sm">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
            <span>Forecast</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
            <span>Actual</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-orange-500 rounded-full mr-2"></div>
            <span>Budget</span>
          </div>
        </div>
      </div>
      
      <div className="relative h-64">
        <svg className="w-full h-full" viewBox="0 0 800 200">
          {/* Grid lines */}
          {[0, 50, 100, 150, 200].map(y => (
            <line key={y} x1="60" y1={y} x2="740" y2={y} stroke="#E5E7EB" strokeWidth="1" />
          ))}
          
          {/* Y-axis labels */}
          {[0, 25, 50, 75, 100].map((percent, i) => (
            <text key={percent} x="50" y={200 - i * 50 + 5} fontSize="12" fill="#6B7280" textAnchor="end">
              {Math.round((maxValue * percent) / 100 / 1000)}K
            </text>
          ))}
          
          {/* Lines */}
          <polyline
            points={monthlyData.map((d, i) => `${80 + i * 55},${200 - ((d?.forecast || 0) / maxValue) * 200}`).join(' ')}
            fill="none"
            stroke="#3B82F6"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <polyline
            points={monthlyData.map((d, i) => `${80 + i * 55},${200 - ((d?.actual || 0) / maxValue) * 200}`).join(' ')}
            fill="none"
            stroke="#10B981"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <polyline
            points={monthlyData.map((d, i) => `${80 + i * 55},${200 - ((d?.budget || 0) / maxValue) * 200}`).join(' ')}
            fill="none"
            stroke="#F59E0B"
            strokeWidth="2"
            strokeDasharray="5,5"
          />

          {/* Data points */}
          {monthlyData.map((d, i) => (
            <g key={i}>
              <circle cx={80 + i * 55} cy={200 - ((d?.forecast || 0) / maxValue) * 200} r="4" fill="#3B82F6" />
              <circle cx={80 + i * 55} cy={200 - ((d?.actual || 0) / maxValue) * 200} r="4" fill="#10B981" />
              <circle cx={80 + i * 55} cy={200 - ((d?.budget || 0) / maxValue) * 200} r="3" fill="#F59E0B" />
            </g>
          ))}
          
          {/* X-axis labels */}
          {monthlyData.map((d, i) => (
            <text key={i} x={80 + i * 55} y="220" fontSize="12" fill="#6B7280" textAnchor="middle">
              {d.month}
            </text>
          ))}
        </svg>
      </div>
    </div>
  );

  const renderBarChart = () => (
    <div className="relative h-80 bg-white rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Monthly Performance Analysis</h3>
        <div className="text-sm text-gray-600">Units (thousands)</div>
      </div>
      
      <div className="relative h-64">
        <svg className="w-full h-full" viewBox="0 0 800 200">
          {/* Grid lines */}
          {[0, 50, 100, 150, 200].map(y => (
            <line key={y} x1="60" y1={y} x2="740" y2={y} stroke="#E5E7EB" strokeWidth="1" />
          ))}
          
          {/* Y-axis labels */}
          {[0, 25, 50, 75, 100].map((percent, i) => (
            <text key={percent} x="50" y={200 - i * 50 + 5} fontSize="12" fill="#6B7280" textAnchor="end">
              {Math.round((maxValue * percent) / 100 / 1000)}K
            </text>
          ))}
          
          {/* Bars */}
          {monthlyData.map((d, i) => {
            const barWidth = 15;
            const barSpacing = 55;
            const x = 70 + i * barSpacing;
            
            return (
              <g key={i}>
                <rect
                  x={x - barWidth}
                  y={200 - ((d?.budget || 0) / maxValue) * 200}
                  width={barWidth}
                  height={((d?.budget || 0) / maxValue) * 200}
                  fill="#F59E0B"
                  opacity="0.7"
                />
                <rect
                  x={x}
                  y={200 - ((d?.forecast || 0) / maxValue) * 200}
                  width={barWidth}
                  height={((d?.forecast || 0) / maxValue) * 200}
                  fill="#3B82F6"
                />
                <rect
                  x={x + barWidth}
                  y={200 - ((d?.actual || 0) / maxValue) * 200}
                  width={barWidth}
                  height={((d?.actual || 0) / maxValue) * 200}
                  fill="#10B981"
                />
              </g>
            );
          })}
          
          {/* X-axis labels */}
          {monthlyData.map((d, i) => (
            <text key={i} x={80 + i * 55} y="220" fontSize="12" fill="#6B7280" textAnchor="middle">
              {d.month}
            </text>
          ))}
        </svg>
      </div>
    </div>
  );

  const renderPieChart = () => {
    let cumulativePercentage = 0;
    
    return (
      <div className="relative h-80 bg-white rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Product Distribution</h3>
          <div className="text-sm text-gray-600">Market Share %</div>
        </div>
        
        <div className="flex items-center justify-center">
          <div className="relative">
            <svg width="200" height="200" className="transform -rotate-90">
              {productData.map((item, index) => {
                const percentage = item?.value || 0;
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
                    fill={item.color}
                    stroke="white"
                    strokeWidth="2"
                  />
                );
              })}
            </svg>
            
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">100%</div>
                <div className="text-sm text-gray-600">Total</div>
              </div>
            </div>
          </div>
          
          <div className="ml-8 space-y-2">
            {productData.map((item, index) => (
              <div key={index} className="flex items-center">
                <div className="w-4 h-4 rounded mr-3" style={{ backgroundColor: item.color }}></div>
                <span className="text-sm text-gray-700">{item.name}: {item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderAccuracyTrend = () => (
    <div className="relative h-80 bg-white rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Forecast Accuracy Trend</h3>
        <div className="text-sm text-gray-600">Accuracy %</div>
      </div>
      
      <div className="relative h-64">
        <svg className="w-full h-full" viewBox="0 0 800 200">
          {/* Grid lines */}
          {[0, 40, 80, 120, 160, 200].map(y => (
            <line key={y} x1="60" y1={y} x2="740" y2={y} stroke="#E5E7EB" strokeWidth="1" />
          ))}
          
          {/* Y-axis labels */}
          {[95, 96, 97, 98, 99, 100].map((percent, i) => (
            <text key={percent} x="50" y={200 - i * 40 + 5} fontSize="12" fill="#6B7280" textAnchor="end">
              {percent}%
            </text>
          ))}
          
          {/* Accuracy line */}
          <polyline
            points={monthlyData.map((d, i) => `${80 + i * 55},${200 - (((d?.accuracy || 95) - 95) / 5) * 200}`).join(' ')}
            fill="none"
            stroke="#10B981"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data points */}
          {monthlyData.map((d, i) => (
            <circle
              key={i}
              cx={80 + i * 55}
              cy={200 - (((d?.accuracy || 95) - 95) / 5) * 200}
              r="5"
              fill="#10B981"
              stroke="white"
              strokeWidth="2"
            />
          ))}
          
          {/* X-axis labels */}
          {monthlyData.map((d, i) => (
            <text key={i} x={80 + i * 55} y="220" fontSize="12" fill="#6B7280" textAnchor="middle">
              {d.month}
            </text>
          ))}
        </svg>
      </div>
    </div>
  );

  const renderChart = () => {
    switch (activeChart) {
      case 'line': return renderLineChart();
      case 'bar': return renderBarChart();
      case 'pie': return renderPieChart();
      case 'trend': return renderAccuracyTrend();
      default: return renderLineChart();
    }
  };

  return (
    <div className="space-y-6">
      {/* Chart Controls */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex space-x-2">
            <button
              onClick={() => setActiveChart('line')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors ${
                activeChart === 'line' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <LineChart className="w-4 h-4" />
              <span>Trends</span>
            </button>
            <button
              onClick={() => setActiveChart('bar')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors ${
                activeChart === 'bar' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Comparison</span>
            </button>
            <button
              onClick={() => setActiveChart('pie')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors ${
                activeChart === 'pie' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <PieChart className="w-4 h-4" />
              <span>Distribution</span>
            </button>
            <button
              onClick={() => setActiveChart('trend')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors ${
                activeChart === 'trend' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              <span>Accuracy</span>
            </button>
          </div>
          
          <div className="flex items-center space-x-4">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="3m">Last 3 Months</option>
              <option value="6m">Last 6 Months</option>
              <option value="12m">Last 12 Months</option>
              <option value="24m">Last 24 Months</option>
            </select>
          </div>
        </div>
      </div>

      {/* Chart Display */}
      {renderChart()}

      {/* Analytics Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <Target className="w-8 h-8 text-green-600 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Avg Accuracy</p>
              <p className="text-2xl font-bold text-gray-900">98.1%</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <TrendingUp className="w-8 h-8 text-blue-600 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Growth Rate</p>
              <p className="text-2xl font-bold text-gray-900">+15.2%</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <DollarSign className="w-8 h-8 text-green-600 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Total Value</p>
              <p className="text-2xl font-bold text-gray-900">$3.25M</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <Calendar className="w-8 h-8 text-purple-600 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Forecast Period</p>
              <p className="text-2xl font-bold text-gray-900">12 Mo</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedForecastChart;
