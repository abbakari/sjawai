import React, { useState } from 'react';
import { BarChart3, LineChart, TrendingUp, Calendar } from 'lucide-react';

const ForecastChart: React.FC = () => {
  const [chartType, setChartType] = useState('line');
  const [timeRange, setTimeRange] = useState('12');

  // Sample data for the chart visualization
  const chartData = [
    { month: 'Jan', actual: 420000, forecast: 450000, confidence: { low: 400000, high: 500000 } },
    { month: 'Feb', actual: 380000, forecast: 420000, confidence: { low: 380000, high: 460000 } },
    { month: 'Mar', actual: 450000, forecast: 480000, confidence: { low: 440000, high: 520000 } },
    { month: 'Apr', actual: 520000, forecast: 540000, confidence: { low: 500000, high: 580000 } },
    { month: 'May', actual: null, forecast: 580000, confidence: { low: 540000, high: 620000 } },
    { month: 'Jun', actual: null, forecast: 620000, confidence: { low: 580000, high: 660000 } },
    { month: 'Jul', actual: null, forecast: 650000, confidence: { low: 610000, high: 690000 } },
    { month: 'Aug', actual: null, forecast: 680000, confidence: { low: 640000, high: 720000 } },
  ];

  return (
    <div className="card bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="card-header border-b border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h5 className="text-lg font-semibold text-gray-900 mb-1">Forecast Visualization</h5>
            <p className="text-sm text-gray-600">Historical data vs forecast predictions with confidence intervals</p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">Time Range:</label>
              <select
                className="form-select px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
              >
                <option value="6">6 Months</option>
                <option value="12">12 Months</option>
                <option value="18">18 Months</option>
              </select>
            </div>
            <div className="flex items-center space-x-1 bg-gray-100 rounded-md p-1">
              <button
                onClick={() => setChartType('line')}
                className={`p-2 rounded transition-colors ${
                  chartType === 'line' 
                    ? 'bg-white text-blue-600 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <LineChart className="w-4 h-4" />
              </button>
              <button
                onClick={() => setChartType('bar')}
                className={`p-2 rounded transition-colors ${
                  chartType === 'bar' 
                    ? 'bg-white text-blue-600 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <BarChart3 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="card-body p-6">
        {/* Chart Legend */}
        <div className="flex items-center justify-center space-x-6 mb-6">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
            <span className="text-sm text-gray-600">Actual Sales</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-600 rounded-full"></div>
            <span className="text-sm text-gray-600">Forecast</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
            <span className="text-sm text-gray-600">Confidence Interval</span>
          </div>
        </div>

        {/* Simplified Chart Representation */}
        <div className="relative h-80 bg-gray-50 rounded-lg p-4">
          <div className="absolute inset-4">
            {/* Y-axis labels */}
            <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-xs text-gray-500">
              <span>$700K</span>
              <span>$600K</span>
              <span>$500K</span>
              <span>$400K</span>
              <span>$300K</span>
            </div>
            
            {/* Chart area */}
            <div className="ml-12 mr-4 h-full relative">
              {/* Grid lines */}
              <div className="absolute inset-0">
                {[0, 1, 2, 3, 4].map((i) => (
                  <div key={i} className="absolute w-full border-t border-gray-200" style={{ top: `${i * 25}%` }}></div>
                ))}
              </div>
              
              {/* Data visualization */}
              <div className="absolute inset-0 flex items-end justify-between">
                {chartData.map((data, index) => (
                  <div key={data.month} className="flex flex-col items-center space-y-2 flex-1">
                    {/* Confidence interval (background) */}
                    <div 
                      className="w-8 bg-gray-200 rounded-t opacity-50"
                      style={{ 
                        height: `${(data.confidence.high / 700000) * 100}%`,
                        minHeight: '2px'
                      }}
                    ></div>
                    
                    {/* Forecast bar */}
                    <div 
                      className="w-6 bg-green-500 rounded-t absolute bottom-0"
                      style={{ 
                        height: `${(data.forecast / 700000) * 100}%`,
                        minHeight: '2px'
                      }}
                    ></div>
                    
                    {/* Actual bar (if exists) */}
                    {data.actual && (
                      <div 
                        className="w-4 bg-blue-600 rounded-t absolute bottom-0"
                        style={{ 
                          height: `${(data.actual / 700000) * 100}%`,
                          minHeight: '2px'
                        }}
                      ></div>
                    )}
                    
                    {/* Month label */}
                    <span className="text-xs text-gray-600 mt-2">{data.month}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Chart Insights */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">Growth Trend</span>
            </div>
            <p className="text-sm text-blue-700">Forecast shows 18.5% growth over the next 12 months</p>
          </div>
          
          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <BarChart3 className="w-5 h-5 text-green-600" />
              <span className="text-sm font-medium text-green-900">Accuracy</span>
            </div>
            <p className="text-sm text-green-700">Model accuracy is 94.2% based on historical performance</p>
          </div>
          
          <div className="bg-orange-50 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Calendar className="w-5 h-5 text-orange-600" />
              <span className="text-sm font-medium text-orange-900">Next Update</span>
            </div>
            <p className="text-sm text-orange-700">Forecast will be updated on January 20, 2025</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForecastChart;