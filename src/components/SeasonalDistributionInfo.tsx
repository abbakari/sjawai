import React, { useState } from 'react';
import { Info, TrendingDown, Calendar } from 'lucide-react';
import { SEASONAL_PATTERNS, applySeasonalDistribution } from '../utils/seasonalDistribution';

interface SeasonalDistributionInfoProps {
  isOpen: boolean;
  onClose: () => void;
}

const SeasonalDistributionInfo: React.FC<SeasonalDistributionInfoProps> = ({ isOpen, onClose }) => {
  const [selectedPattern, setSelectedPattern] = useState('Default Seasonal');
  const [exampleQuantity, setExampleQuantity] = useState(120);

  if (!isOpen) return null;

  const currentPattern = SEASONAL_PATTERNS.find(p => p.name === selectedPattern) || SEASONAL_PATTERNS[0];
  const exampleDistribution = applySeasonalDistribution(exampleQuantity, selectedPattern);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-lg">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Calendar className="w-6 h-6" />
                Seasonal Distribution Patterns
              </h2>
              <p className="text-blue-100 mt-1">
                Holiday-aware allocation: Higher quantities in non-holiday months (Jan-Apr), reduced in holiday months (Nov-Dec)
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 text-2xl font-bold"
            >
              ×
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Pattern Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Distribution Pattern:
            </label>
            <select
              value={selectedPattern}
              onChange={(e) => setSelectedPattern(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {SEASONAL_PATTERNS.map(pattern => (
                <option key={pattern.name} value={pattern.name}>
                  {pattern.name} - {pattern.description}
                </option>
              ))}
            </select>
          </div>

          {/* Example Quantity */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Example Total Quantity:
            </label>
            <input
              type="number"
              value={exampleQuantity}
              onChange={(e) => setExampleQuantity(parseInt(e.target.value) || 0)}
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="1"
              max="10000"
            />
          </div>

          {/* Current Pattern Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Info className="w-5 h-5 text-blue-600" />
              <h3 className="font-semibold text-blue-900">{currentPattern.name}</h3>
            </div>
            <p className="text-blue-800 text-sm">{currentPattern.description}</p>
          </div>

          {/* Distribution Visualization */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-green-600" />
              Monthly Distribution Example ({exampleQuantity} units)
            </h3>
            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {exampleDistribution.map((month, index) => {
                const isHighSeason = index < 2; // Jan, Feb
                const isLowSeason = index >= 10; // Nov, Dec
                
                return (
                  <div
                    key={month.month}
                    className={`p-3 rounded-lg border-2 text-center transition-all ${
                      isHighSeason
                        ? 'bg-green-100 border-green-300'
                        : isLowSeason
                        ? 'bg-red-100 border-red-300'
                        : 'bg-gray-100 border-gray-300'
                    }`}
                  >
                    <div className="font-bold text-sm text-gray-700">{month.month}</div>
                    <div className={`text-lg font-bold ${
                      isHighSeason
                        ? 'text-green-700'
                        : isLowSeason
                        ? 'text-red-700'
                        : 'text-gray-700'
                    }`}>
                      {month.value}
                    </div>
                    <div className="text-xs text-gray-500">
                      {(month.percentage * 100).toFixed(1)}%
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Pattern Benefits */}
          <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-4">
            <h3 className="font-semibold text-green-900 mb-2">Benefits of Holiday-Aware Distribution:</h3>
            <ul className="text-sm text-green-800 space-y-1">
              <li>• Higher quantities allocated to non-holiday months (Jan-Apr) when business operates at full capacity</li>
              <li>• Reduced allocation during holiday months (Nov-Dec) when business activity is minimal</li>
              <li>• Accounts for actual working days and business productivity</li>
              <li>• Helps with cash flow management and inventory planning around holidays</li>
              <li>• Aligns with real business cycles and customer availability patterns</li>
              <li>• Reduces inventory surplus during low-activity holiday periods</li>
            </ul>
          </div>

          {/* Usage Information */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 className="font-semibold text-yellow-900 mb-2">How It Works:</h3>
            <div className="text-sm text-yellow-800 space-y-2">
              <p>
                <strong>Automatic Application:</strong> When you enter a quantity in the target year budget column, 
                the system automatically distributes it across months using the seasonal pattern.
              </p>
              <p>
                <strong>Manual Override:</strong> You can still manually edit individual months by clicking 
                the action button to open the monthly distribution editor.
              </p>
              <p>
                <strong>Pattern Selection:</strong> The default pattern is "Default Seasonal" but different 
                patterns can be configured based on your business needs.
              </p>
            </div>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white border border-gray-200 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-green-600">
                {exampleDistribution.slice(0, 3).reduce((sum, m) => sum + m.value, 0)}
              </div>
              <div className="text-xs text-gray-600">Q1 Total</div>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-blue-600">
                {exampleDistribution.slice(3, 6).reduce((sum, m) => sum + m.value, 0)}
              </div>
              <div className="text-xs text-gray-600">Q2 Total</div>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-orange-600">
                {exampleDistribution.slice(6, 9).reduce((sum, m) => sum + m.value, 0)}
              </div>
              <div className="text-xs text-gray-600">Q3 Total</div>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-red-600">
                {exampleDistribution.slice(9, 12).reduce((sum, m) => sum + m.value, 0)}
              </div>
              <div className="text-xs text-gray-600">Q4 Total</div>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 px-6 py-4 rounded-b-lg">
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Got it!
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeasonalDistributionInfo;
