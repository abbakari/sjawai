import React, { useState } from 'react';
import { X, AlertCircle, TrendingUp, TrendingDown, Minus, Play, Copy, Save } from 'lucide-react';

interface ScenariosModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyScenario: (scenario: ScenarioConfig) => void;
}

export interface ScenarioConfig {
  name: string;
  description: string;
  type: 'optimistic' | 'pessimistic' | 'realistic' | 'custom';
  adjustments: {
    salesGrowth: number;
    marketShare: number;
    priceChange: number;
    volumeChange: number;
  };
}

const ScenariosModal: React.FC<ScenariosModalProps> = ({ isOpen, onClose, onApplyScenario }) => {
  const [selectedScenario, setSelectedScenario] = useState<string>('');
  const [customScenario, setCustomScenario] = useState<ScenarioConfig>({
    name: 'Custom Scenario',
    description: 'User-defined scenario',
    type: 'custom',
    adjustments: {
      salesGrowth: 0,
      marketShare: 0,
      priceChange: 0,
      volumeChange: 0
    }
  });

  const predefinedScenarios: ScenarioConfig[] = [
    {
      name: 'Optimistic Growth',
      description: 'Best case scenario with strong market performance',
      type: 'optimistic',
      adjustments: {
        salesGrowth: 25,
        marketShare: 15,
        priceChange: 10,
        volumeChange: 20
      }
    },
    {
      name: 'Conservative Growth',
      description: 'Realistic growth expectations based on current trends',
      type: 'realistic',
      adjustments: {
        salesGrowth: 10,
        marketShare: 5,
        priceChange: 3,
        volumeChange: 8
      }
    },
    {
      name: 'Market Downturn',
      description: 'Challenging market conditions with reduced demand',
      type: 'pessimistic',
      adjustments: {
        salesGrowth: -15,
        marketShare: -10,
        priceChange: -5,
        volumeChange: -20
      }
    }
  ];

  const handleApplyScenario = (scenario: ScenarioConfig) => {
    onApplyScenario(scenario);
    onClose();
  };

  const getScenarioIcon = (type: string) => {
    switch (type) {
      case 'optimistic':
        return <TrendingUp className="w-5 h-5 text-green-600" />;
      case 'pessimistic':
        return <TrendingDown className="w-5 h-5 text-red-600" />;
      case 'realistic':
        return <Minus className="w-5 h-5 text-blue-600" />;
      default:
        return <AlertCircle className="w-5 h-5 text-orange-600" />;
    }
  };

  const getScenarioColor = (type: string) => {
    switch (type) {
      case 'optimistic':
        return 'border-green-200 bg-green-50';
      case 'pessimistic':
        return 'border-red-200 bg-red-50';
      case 'realistic':
        return 'border-blue-200 bg-blue-50';
      default:
        return 'border-orange-200 bg-orange-50';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-orange-600" />
            <h2 className="text-xl font-bold text-gray-900">Scenario Analysis</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Predefined Scenarios</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {predefinedScenarios.map((scenario, index) => (
                <div
                  key={index}
                  className={`border-2 rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${
                    selectedScenario === scenario.name
                      ? 'border-blue-500 bg-blue-50'
                      : getScenarioColor(scenario.type)
                  }`}
                  onClick={() => setSelectedScenario(scenario.name)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      {getScenarioIcon(scenario.type)}
                      <h4 className="font-semibold text-gray-900">{scenario.name}</h4>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleApplyScenario(scenario);
                      }}
                      className="p-1 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                    >
                      <Play className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{scenario.description}</p>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span>Sales Growth:</span>
                      <span className={scenario.adjustments.salesGrowth >= 0 ? 'text-green-600' : 'text-red-600'}>
                        {scenario.adjustments.salesGrowth >= 0 ? '+' : ''}{scenario.adjustments.salesGrowth}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Market Share:</span>
                      <span className={scenario.adjustments.marketShare >= 0 ? 'text-green-600' : 'text-red-600'}>
                        {scenario.adjustments.marketShare >= 0 ? '+' : ''}{scenario.adjustments.marketShare}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Price Change:</span>
                      <span className={scenario.adjustments.priceChange >= 0 ? 'text-green-600' : 'text-red-600'}>
                        {scenario.adjustments.priceChange >= 0 ? '+' : ''}{scenario.adjustments.priceChange}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Volume Change:</span>
                      <span className={scenario.adjustments.volumeChange >= 0 ? 'text-green-600' : 'text-red-600'}>
                        {scenario.adjustments.volumeChange >= 0 ? '+' : ''}{scenario.adjustments.volumeChange}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Custom Scenario Builder</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Scenario Name</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={customScenario.name}
                    onChange={(e) => setCustomScenario({...customScenario, name: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={customScenario.description}
                    onChange={(e) => setCustomScenario({...customScenario, description: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Sales Growth (%)</label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={customScenario.adjustments.salesGrowth}
                    onChange={(e) => setCustomScenario({
                      ...customScenario,
                      adjustments: {...customScenario.adjustments, salesGrowth: parseFloat(e.target.value) || 0}
                    })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Market Share (%)</label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={customScenario.adjustments.marketShare}
                    onChange={(e) => setCustomScenario({
                      ...customScenario,
                      adjustments: {...customScenario.adjustments, marketShare: parseFloat(e.target.value) || 0}
                    })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Price Change (%)</label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={customScenario.adjustments.priceChange}
                    onChange={(e) => setCustomScenario({
                      ...customScenario,
                      adjustments: {...customScenario.adjustments, priceChange: parseFloat(e.target.value) || 0}
                    })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Volume Change (%)</label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={customScenario.adjustments.volumeChange}
                    onChange={(e) => setCustomScenario({
                      ...customScenario,
                      adjustments: {...customScenario.adjustments, volumeChange: parseFloat(e.target.value) || 0}
                    })}
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 mt-4">
                <button className="flex items-center space-x-1 px-3 py-1 text-gray-600 border border-gray-300 rounded hover:bg-gray-50 transition-colors">
                  <Save className="w-4 h-4" />
                  <span>Save</span>
                </button>
                <button
                  onClick={() => handleApplyScenario(customScenario)}
                  className="flex items-center space-x-1 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                >
                  <Play className="w-4 h-4" />
                  <span>Apply</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ScenariosModal;
