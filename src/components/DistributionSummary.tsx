import React from 'react';
import { PieChart, TrendingUp, Users, MapPin, Package, Calendar } from 'lucide-react';

interface DistributionSummaryProps {
  distributions: Array<{
    type: 'regional' | 'category' | 'customer' | 'seasonal' | 'channel';
    name: string;
    appliedAt: Date;
    segments: number;
    totalAmount: number;
    totalUnits: number;
  }>;
}

const DistributionSummary: React.FC<DistributionSummaryProps> = ({ distributions }) => {
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'regional': return MapPin;
      case 'category': return Package;
      case 'customer': return Users;
      case 'seasonal': return Calendar;
      case 'channel': return TrendingUp;
      default: return PieChart;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'regional': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'category': return 'bg-green-100 text-green-700 border-green-200';
      case 'customer': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'seasonal': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'channel': return 'bg-indigo-100 text-indigo-700 border-indigo-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  if (distributions.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="text-center py-8">
          <PieChart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Distributions Applied</h3>
          <p className="text-gray-600">Use the "Set Distribution" button to create budget distributions</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Active Distributions</h3>
        <span className="text-sm text-gray-600">{distributions.length} distribution(s) applied</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {distributions.map((dist, index) => {
          const IconComponent = getTypeIcon(dist.type);
          return (
            <div 
              key={index}
              className={`rounded-lg border-2 p-4 ${getTypeColor(dist.type)}`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <IconComponent className="w-5 h-5" />
                  <span className="font-medium capitalize">{dist.type}</span>
                </div>
                <span className="text-xs opacity-75">
                  {dist.segments} segments
                </span>
              </div>
              
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Amount:</span>
                  <span className="font-semibold">${dist.totalAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Units:</span>
                  <span className="font-semibold">{dist.totalUnits.toLocaleString()}</span>
                </div>
                <div className="text-xs opacity-75 mt-2">
                  Applied: {dist.appliedAt.toLocaleDateString()}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="text-center">
            <p className="text-gray-600">Total Distributed Amount</p>
            <p className="text-xl font-bold text-gray-900">
              ${distributions.reduce((sum, d) => sum + d.totalAmount, 0).toLocaleString()}
            </p>
          </div>
          <div className="text-center">
            <p className="text-gray-600">Total Distributed Units</p>
            <p className="text-xl font-bold text-gray-900">
              {distributions.reduce((sum, d) => sum + d.totalUnits, 0).toLocaleString()}
            </p>
          </div>
          <div className="text-center">
            <p className="text-gray-600">Distribution Coverage</p>
            <p className="text-xl font-bold text-green-600">
              {distributions.length > 0 ? Math.round((distributions.length / 5) * 100) : 0}%
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DistributionSummary;
