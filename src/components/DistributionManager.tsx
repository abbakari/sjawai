import React, { useState } from 'react';
import { 
  PieChart, 
  Edit, 
  Trash2, 
  Copy, 
  Eye, 
  Settings, 
  Plus, 
  MoreHorizontal,
  MapPin,
  Package,
  Users,
  Calendar,
  TrendingUp,
  AlertTriangle,
  Check,
  X
} from 'lucide-react';

interface DistributionManagerProps {
  distributions: Array<{
    id: string;
    type: 'regional' | 'category' | 'customer' | 'seasonal' | 'channel';
    name: string;
    appliedAt: Date;
    segments: number;
    totalAmount: number;
    totalUnits: number;
    isActive: boolean;
    segments_detail: Array<{
      name: string;
      percentage: number;
      amount: number;
      units: number;
      color: string;
    }>;
  }>;
  onEditDistribution: (id: string) => void;
  onDeleteDistribution: (id: string) => void;
  onDuplicateDistribution: (id: string) => void;
  onToggleDistribution: (id: string) => void;
  onCreateNew: () => void;
}

const DistributionManager: React.FC<DistributionManagerProps> = ({
  distributions,
  onEditDistribution,
  onDeleteDistribution,
  onDuplicateDistribution,
  onToggleDistribution,
  onCreateNew
}) => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedDistribution, setSelectedDistribution] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

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

  const getTypeColor = (type: string, isActive: boolean) => {
    const baseColors = {
      regional: isActive ? 'bg-blue-100 text-blue-700 border-blue-200' : 'bg-gray-100 text-gray-500 border-gray-200',
      category: isActive ? 'bg-green-100 text-green-700 border-green-200' : 'bg-gray-100 text-gray-500 border-gray-200',
      customer: isActive ? 'bg-purple-100 text-purple-700 border-purple-200' : 'bg-gray-100 text-gray-500 border-gray-200',
      seasonal: isActive ? 'bg-orange-100 text-orange-700 border-orange-200' : 'bg-gray-100 text-gray-500 border-gray-200',
      channel: isActive ? 'bg-indigo-100 text-indigo-700 border-indigo-200' : 'bg-gray-100 text-gray-500 border-gray-200'
    };
    return baseColors[type as keyof typeof baseColors] || baseColors.regional;
  };

  const handleDelete = (id: string) => {
    onDeleteDistribution(id);
    setShowDeleteConfirm(null);
  };

  const renderMiniPieChart = (segments: Array<{name: string, percentage: number, color: string}>) => {
    let cumulativePercentage = 0;
    
    return (
      <svg width="60" height="60" className="transform -rotate-90">
        {segments.map((segment, index) => {
          const percentage = segment.percentage || 0;
          const angle = (percentage / 100) * 360;
          const startAngle = (cumulativePercentage / 100) * 360;
          
          const x1 = 30 + 25 * Math.cos((startAngle * Math.PI) / 180);
          const y1 = 30 + 25 * Math.sin((startAngle * Math.PI) / 180);
          const x2 = 30 + 25 * Math.cos(((startAngle + angle) * Math.PI) / 180);
          const y2 = 30 + 25 * Math.sin(((startAngle + angle) * Math.PI) / 180);
          
          const largeArcFlag = angle > 180 ? 1 : 0;
          
          const pathData = [
            `M 30 30`,
            `L ${x1} ${y1}`,
            `A 25 25 0 ${largeArcFlag} 1 ${x2} ${y2}`,
            'Z'
          ].join(' ');
          
          cumulativePercentage += percentage;
          
          return (
            <path
              key={index}
              d={pathData}
              fill={segment.color}
              stroke="white"
              strokeWidth="1"
            />
          );
        })}
      </svg>
    );
  };

  const renderGridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {distributions.map((dist) => {
        const IconComponent = getTypeIcon(dist.type);
        return (
          <div 
            key={dist.id}
            className={`rounded-lg border-2 p-6 transition-all hover:shadow-lg ${
              selectedDistribution === dist.id ? 'ring-2 ring-blue-500' : ''
            } ${getTypeColor(dist.type, dist.isActive)}`}
            onClick={() => setSelectedDistribution(dist.id)}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <IconComponent className="w-6 h-6" />
                <div>
                  <h3 className="font-semibold capitalize">{dist.type} Distribution</h3>
                  <p className="text-xs opacity-75">{dist.segments} segments</p>
                </div>
              </div>
              <div className="flex items-center space-x-1">
                <div className={`w-3 h-3 rounded-full ${dist.isActive ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                <div className="relative">
                  <button 
                    className="p-1 hover:bg-white hover:bg-opacity-20 rounded transition-colors"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between mb-4">
              <div className="text-center">
                {renderMiniPieChart(dist.segments_detail)}
              </div>
              <div className="text-right">
                <p className="text-lg font-bold">${(dist.totalAmount / 1000).toFixed(0)}K</p>
                <p className="text-sm opacity-75">{dist.totalUnits.toLocaleString()} units</p>
              </div>
            </div>

            <div className="space-y-2 mb-4">
              {dist.segments_detail.slice(0, 3).map((segment, index) => (
                <div key={index} className="flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 rounded" style={{ backgroundColor: segment.color }}></div>
                    <span>{segment.name}</span>
                  </div>
                  <span className="font-medium">{segment.percentage.toFixed(1)}%</span>
                </div>
              ))}
              {dist.segments_detail.length > 3 && (
                <p className="text-xs opacity-75">+{dist.segments_detail.length - 3} more...</p>
              )}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-current border-opacity-20">
              <span className="text-xs opacity-75">
                {dist.appliedAt.toLocaleDateString()}
              </span>
              <div className="flex space-x-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditDistribution(dist.id);
                  }}
                  className="p-1 hover:bg-white hover:bg-opacity-20 rounded transition-colors"
                >
                  <Edit className="w-3 h-3" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDuplicateDistribution(dist.id);
                  }}
                  className="p-1 hover:bg-white hover:bg-opacity-20 rounded transition-colors"
                >
                  <Copy className="w-3 h-3" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowDeleteConfirm(dist.id);
                  }}
                  className="p-1 hover:bg-red-200 hover:text-red-800 rounded transition-colors"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );

  const renderListView = () => (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Distribution
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Type
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Segments
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Amount
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Applied
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {distributions.map((dist) => {
            const IconComponent = getTypeIcon(dist.type);
            return (
              <tr key={dist.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <IconComponent className="w-5 h-5 text-gray-400 mr-3" />
                    <div>
                      <div className="text-sm font-medium text-gray-900 capitalize">
                        {dist.type} Distribution
                      </div>
                      <div className="text-sm text-gray-500">{dist.name}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(dist.type, true)}`}>
                    {dist.type}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {dist.segments}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">${dist.totalAmount.toLocaleString()}</div>
                  <div className="text-sm text-gray-500">{dist.totalUnits.toLocaleString()} units</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    dist.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {dist.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {dist.appliedAt.toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => onEditDistribution(dist.id)}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDuplicateDistribution(dist.id)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onToggleDistribution(dist.id)}
                      className="text-yellow-600 hover:text-yellow-900"
                    >
                      {dist.isActive ? <Eye className="w-4 h-4" /> : <Settings className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm(dist.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );

  if (distributions.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <div className="text-center">
          <PieChart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-900 mb-2">No Distributions Created</h3>
          <p className="text-gray-600 mb-6">
            Create your first budget distribution to allocate resources across regions, categories, customers, or time periods.
          </p>
          <button
            onClick={onCreateNew}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Distribution
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Distribution Management</h2>
          <p className="text-gray-600">Manage and monitor your budget distributions</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'grid' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-600'
              }`}
            >
              <PieChart className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'list' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-600'
              }`}
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
          <button
            onClick={onCreateNew}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Distribution
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <PieChart className="w-8 h-8 text-blue-600 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Total Distributions</p>
              <p className="text-2xl font-bold text-gray-900">{distributions.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <Check className="w-8 h-8 text-green-600 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Active</p>
              <p className="text-2xl font-bold text-gray-900">
                {distributions.filter(d => d.isActive).length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <TrendingUp className="w-8 h-8 text-purple-600 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Total Amount</p>
              <p className="text-2xl font-bold text-gray-900">
                ${(distributions.reduce((sum, d) => sum + d.totalAmount, 0) / 1000).toFixed(0)}K
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <Package className="w-8 h-8 text-orange-600 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Total Units</p>
              <p className="text-2xl font-bold text-gray-900">
                {distributions.reduce((sum, d) => sum + d.totalUnits, 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Distributions Display */}
      {viewMode === 'grid' ? renderGridView() : renderListView()}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center mb-4">
              <AlertTriangle className="w-6 h-6 text-red-600 mr-3" />
              <h3 className="text-lg font-semibold text-gray-900">Delete Distribution</h3>
            </div>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this distribution? This action cannot be undone and will affect any budget allocations based on this distribution.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(showDeleteConfirm)}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DistributionManager;
