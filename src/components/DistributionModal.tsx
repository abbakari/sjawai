import React, { useState, useEffect } from 'react';
import { X, PieChart, Percent, DollarSign, Users, MapPin, Calendar, Package, TrendingUp, RotateCcw, Save } from 'lucide-react';

interface DistributionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyDistribution: (distribution: DistributionConfig) => void;
}

export interface DistributionConfig {
  type: 'regional' | 'category' | 'customer' | 'seasonal' | 'channel';
  distributions: {
    [key: string]: {
      percentage: number;
      amount: number;
      units: number;
    };
  };
  totalBudget: number;
  totalUnits: number;
}

const DistributionModal: React.FC<DistributionModalProps> = ({ isOpen, onClose, onApplyDistribution }) => {
  const [activeTab, setActiveTab] = useState<'regional' | 'category' | 'customer' | 'seasonal' | 'channel'>('regional');
  const [totalBudget, setTotalBudget] = useState(1512340);
  const [totalUnits, setTotalUnits] = useState(5042);
  const [autoBalance, setAutoBalance] = useState(true);

  // Distribution states for different tabs
  const [regionalDistribution, setRegionalDistribution] = useState([
    { name: 'Dar es Salaam', percentage: 40, amount: 0, units: 0, color: '#3B82F6' },
    { name: 'Arusha', percentage: 25, amount: 0, units: 0, color: '#10B981' },
    { name: 'Mwanza', percentage: 20, amount: 0, units: 0, color: '#F59E0B' },
    { name: 'Dodoma', percentage: 10, amount: 0, units: 0, color: '#EF4444' },
    { name: 'Others', percentage: 5, amount: 0, units: 0, color: '#8B5CF6' }
  ]);

  const [categoryDistribution, setCategoryDistribution] = useState([
    { name: 'Tyres', percentage: 60, amount: 0, units: 0, color: '#3B82F6' },
    { name: 'Accessories', percentage: 25, amount: 0, units: 0, color: '#10B981' },
    { name: 'Batteries', percentage: 10, amount: 0, units: 0, color: '#F59E0B' },
    { name: 'Oils & Lubricants', percentage: 5, amount: 0, units: 0, color: '#EF4444' }
  ]);

  const [customerDistribution, setCustomerDistribution] = useState([
    { name: 'Government', percentage: 35, amount: 0, units: 0, color: '#3B82F6' },
    { name: 'Corporate', percentage: 30, amount: 0, units: 0, color: '#10B981' },
    { name: 'NGOs', percentage: 25, amount: 0, units: 0, color: '#F59E0B' },
    { name: 'Individual', percentage: 10, amount: 0, units: 0, color: '#EF4444' }
  ]);

  const [seasonalDistribution, setSeasonalDistribution] = useState([
    { name: 'Q1 (Jan-Mar)', percentage: 20, amount: 0, units: 0, color: '#3B82F6' },
    { name: 'Q2 (Apr-Jun)', percentage: 25, amount: 0, units: 0, color: '#10B981' },
    { name: 'Q3 (Jul-Sep)', percentage: 35, amount: 0, units: 0, color: '#F59E0B' },
    { name: 'Q4 (Oct-Dec)', percentage: 20, amount: 0, units: 0, color: '#EF4444' }
  ]);

  const [channelDistribution, setChannelDistribution] = useState([
    { name: 'Direct Sales', percentage: 45, amount: 0, units: 0, color: '#3B82F6' },
    { name: 'Distributors', percentage: 35, amount: 0, units: 0, color: '#10B981' },
    { name: 'Online Sales', percentage: 15, amount: 0, units: 0, color: '#F59E0B' },
    { name: 'Retail Partners', percentage: 5, amount: 0, units: 0, color: '#EF4444' }
  ]);

  // Calculate amounts and units based on percentages
  const calculateDistribution = (distributions: any[], setDistributions: any) => {
    const updated = distributions.map(item => ({
      ...item,
      amount: Math.round((item.percentage / 100) * totalBudget),
      units: Math.round((item.percentage / 100) * totalUnits)
    }));
    setDistributions(updated);
  };

  // Auto-balance percentages to total 100%
  const autoBalancePercentages = (distributions: any[], setDistributions: any) => {
    const total = distributions.reduce((sum, item) => sum + item.percentage, 0);
    if (total !== 100 && autoBalance) {
      const factor = 100 / total;
      const balanced = distributions.map((item, index) => {
        const newPercentage = index === distributions.length - 1 
          ? 100 - distributions.slice(0, -1).reduce((sum, itm) => sum + Math.round(itm.percentage * factor * 100) / 100, 0)
          : Math.round(item.percentage * factor * 100) / 100;
        return {
          ...item,
          percentage: Math.max(0, newPercentage),
          amount: Math.round((newPercentage / 100) * totalBudget),
          units: Math.round((newPercentage / 100) * totalUnits)
        };
      });
      setDistributions(balanced);
    }
  };

  // Update calculations when budget or percentages change
  useEffect(() => {
    calculateDistribution(regionalDistribution, setRegionalDistribution);
  }, [totalBudget, totalUnits]);

  useEffect(() => {
    calculateDistribution(categoryDistribution, setCategoryDistribution);
  }, [totalBudget, totalUnits]);

  useEffect(() => {
    calculateDistribution(customerDistribution, setCustomerDistribution);
  }, [totalBudget, totalUnits]);

  useEffect(() => {
    calculateDistribution(seasonalDistribution, setSeasonalDistribution);
  }, [totalBudget, totalUnits]);

  useEffect(() => {
    calculateDistribution(channelDistribution, setChannelDistribution);
  }, [totalBudget, totalUnits]);

  const getCurrentDistribution = () => {
    switch (activeTab) {
      case 'regional': return regionalDistribution;
      case 'category': return categoryDistribution;
      case 'customer': return customerDistribution;
      case 'seasonal': return seasonalDistribution;
      case 'channel': return channelDistribution;
      default: return regionalDistribution;
    }
  };

  const getCurrentSetter = () => {
    switch (activeTab) {
      case 'regional': return setRegionalDistribution;
      case 'category': return setCategoryDistribution;
      case 'customer': return setCustomerDistribution;
      case 'seasonal': return setSeasonalDistribution;
      case 'channel': return setChannelDistribution;
      default: return setRegionalDistribution;
    }
  };

  const handlePercentageChange = (index: number, newPercentage: number) => {
    const currentDist = getCurrentDistribution();
    const setter = getCurrentSetter();
    
    const updated = currentDist.map((item, i) => {
      if (i === index) {
        const percentage = Math.max(0, Math.min(100, newPercentage));
        return {
          ...item,
          percentage,
          amount: Math.round((percentage / 100) * totalBudget),
          units: Math.round((percentage / 100) * totalUnits)
        };
      }
      return item;
    });
    
    setter(updated);
    
    if (autoBalance) {
      setTimeout(() => autoBalancePercentages(updated, setter), 100);
    }
  };

  const resetToEqual = () => {
    const currentDist = getCurrentDistribution();
    const setter = getCurrentSetter();
    const equalPercentage = 100 / currentDist.length;
    
    const reset = currentDist.map(item => ({
      ...item,
      percentage: equalPercentage,
      amount: Math.round((equalPercentage / 100) * totalBudget),
      units: Math.round((equalPercentage / 100) * totalUnits)
    }));
    
    setter(reset);
  };

  const handleApply = () => {
    const config: DistributionConfig = {
      type: activeTab,
      distributions: {},
      totalBudget,
      totalUnits
    };

    getCurrentDistribution().forEach(item => {
      config.distributions[item.name] = {
        percentage: item.percentage,
        amount: item.amount,
        units: item.units
      };
    });

    onApplyDistribution(config);
    onClose();
  };

  const renderPieChart = (data: any[]) => {
    let cumulativePercentage = 0;
    
    return (
      <div className="flex items-center justify-center mb-6">
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
                  fill={item.color}
                  stroke="white"
                  strokeWidth="2"
                />
              );
            })}
          </svg>
          
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-lg font-bold text-gray-900">
                ${(totalBudget / 1000000).toFixed(1)}M
              </div>
              <div className="text-xs text-gray-600">Total Budget</div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const tabs = [
    { id: 'regional', label: 'Regional', icon: MapPin },
    { id: 'category', label: 'Category', icon: Package },
    { id: 'customer', label: 'Customer', icon: Users },
    { id: 'seasonal', label: 'Seasonal', icon: Calendar },
    { id: 'channel', label: 'Channel', icon: TrendingUp }
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[85vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <PieChart className="w-5 h-5 text-blue-600" />
            <h2 className="text-xl font-bold text-gray-900">Budget Distribution Planning</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <div className="w-64 border-r border-gray-200 p-4 overflow-y-auto">
            <div className="space-y-2 mb-6">
              {tabs.map((tab) => {
                const IconComponent = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                      activeTab === tab.id ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <IconComponent className="w-5 h-5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="space-y-4 pt-4 border-t border-gray-200">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Total Budget ($)</label>
                <input
                  type="number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={totalBudget}
                  onChange={(e) => setTotalBudget(parseInt(e.target.value) || 0)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Total Units</label>
                <input
                  type="number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={totalUnits}
                  onChange={(e) => setTotalUnits(parseInt(e.target.value) || 0)}
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="autoBalance"
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  checked={autoBalance}
                  onChange={(e) => setAutoBalance(e.target.checked)}
                />
                <label htmlFor="autoBalance" className="text-sm text-gray-700">
                  Auto-balance to 100%
                </label>
              </div>

              <button
                onClick={resetToEqual}
                className="w-full flex items-center justify-center space-x-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Reset to Equal</span>
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 p-6 overflow-y-auto">
            {renderPieChart(getCurrentDistribution())}

            <div className="space-y-3">
              {getCurrentDistribution().map((item, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-4 h-4 rounded"
                        style={{ backgroundColor: item.color }}
                      ></div>
                      <span className="font-medium text-gray-900">{item.name}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        className="w-20 px-2 py-1 border border-gray-300 rounded text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={item.percentage}
                        onChange={(e) => handlePercentageChange(index, parseFloat(e.target.value) || 0)}
                        min="0"
                        max="100"
                        step="0.1"
                      />
                      <Percent className="w-4 h-4 text-gray-500" />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Amount:</span>
                      <span className="font-semibold">${item.amount.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Units:</span>
                      <span className="font-semibold">{item.units.toLocaleString()}</span>
                    </div>
                  </div>
                  
                  <div className="mt-2">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="h-2 rounded-full transition-all duration-300"
                        style={{ 
                          width: `${item.percentage}%`,
                          backgroundColor: item.color 
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-blue-900">Total Percentage:</span>
                  <span className="font-bold text-blue-900">
                    {getCurrentDistribution().reduce((sum, item) => sum + item.percentage, 0).toFixed(1)}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium text-blue-900">Total Amount:</span>
                  <span className="font-bold text-blue-900">
                    ${getCurrentDistribution().reduce((sum, item) => sum + item.amount, 0).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between p-6 border-t border-gray-200">
          <div className="text-sm text-gray-600">
            Distribution across {getCurrentDistribution().length} segments
          </div>
          <div className="flex space-x-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleApply}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>Apply Distribution</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DistributionModal;
