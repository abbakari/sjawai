import React, { useState } from 'react';
import Layout from '../components/Layout';
import { PieChart, Plus, Download, Upload, RefreshCw, BarChart3 } from 'lucide-react';
import DistributionManager from '../components/DistributionManager';
import DistributionModal, { DistributionConfig } from '../components/DistributionModal';
import ExportModal, { ExportConfig } from '../components/ExportModal';

const DistributionManagement: React.FC = () => {
  const [isDistributionModalOpen, setIsDistributionModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null);

  // Sample distribution data - in a real app, this would come from your state management
  const [distributions, setDistributions] = useState([
    {
      id: 'dist_1',
      type: 'regional' as const,
      name: 'Regional Distribution',
      appliedAt: new Date('2025-01-15'),
      segments: 5,
      totalAmount: 1512340,
      totalUnits: 5042,
      isActive: true,
      segments_detail: [
        { name: 'Dar es Salaam', percentage: 40, amount: 604936, units: 2017, color: '#3B82F6' },
        { name: 'Arusha', percentage: 25, amount: 378085, units: 1260, color: '#10B981' },
        { name: 'Mwanza', percentage: 20, amount: 302468, units: 1008, color: '#F59E0B' },
        { name: 'Dodoma', percentage: 10, amount: 151234, units: 504, color: '#EF4444' },
        { name: 'Others', percentage: 5, amount: 75617, units: 252, color: '#8B5CF6' }
      ]
    },
    {
      id: 'dist_2',
      type: 'category' as const,
      name: 'Product Category Distribution',
      appliedAt: new Date('2025-01-10'),
      segments: 4,
      totalAmount: 980000,
      totalUnits: 3200,
      isActive: false,
      segments_detail: [
        { name: 'Tyres', percentage: 60, amount: 588000, units: 1920, color: '#3B82F6' },
        { name: 'Accessories', percentage: 25, amount: 245000, units: 800, color: '#10B981' },
        { name: 'Batteries', percentage: 10, amount: 98000, units: 320, color: '#F59E0B' },
        { name: 'Oils & Lubricants', percentage: 5, amount: 49000, units: 160, color: '#EF4444' }
      ]
    },
    {
      id: 'dist_3',
      type: 'customer' as const,
      name: 'Customer Segment Distribution',
      appliedAt: new Date('2025-01-20'),
      segments: 4,
      totalAmount: 2000000,
      totalUnits: 6500,
      isActive: true,
      segments_detail: [
        { name: 'Government', percentage: 35, amount: 700000, units: 2275, color: '#3B82F6' },
        { name: 'Corporate', percentage: 30, amount: 600000, units: 1950, color: '#10B981' },
        { name: 'NGOs', percentage: 25, amount: 500000, units: 1625, color: '#F59E0B' },
        { name: 'Individual', percentage: 10, amount: 200000, units: 650, color: '#EF4444' }
      ]
    }
  ]);

  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleApplyDistribution = (distribution: DistributionConfig) => {
    const distributionEntries = Object.entries(distribution.distributions);
    const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#84CC16'];
    
    const newDistribution = {
      id: `dist_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: distribution.type,
      name: `${distribution.type.charAt(0).toUpperCase() + distribution.type.slice(1)} Distribution`,
      appliedAt: new Date(),
      segments: distributionEntries.length,
      totalAmount: distribution.totalBudget,
      totalUnits: distribution.totalUnits,
      isActive: true,
      segments_detail: distributionEntries.map(([name, data], index) => ({
        name,
        percentage: data.percentage,
        amount: data.amount,
        units: data.units,
        color: colors[index % colors.length]
      }))
    };
    
    setDistributions(prev => [...prev, newDistribution]);
    showNotification(`New ${distribution.type} distribution created successfully`, 'success');
  };

  const handleEditDistribution = (id: string) => {
    const distribution = distributions.find(d => d.id === id);
    if (distribution) {
      setIsDistributionModalOpen(true);
      showNotification(`Opening ${distribution.name} for editing`, 'success');
    }
  };

  const handleDeleteDistribution = (id: string) => {
    const distribution = distributions.find(d => d.id === id);
    if (distribution) {
      setDistributions(prev => prev.filter(d => d.id !== id));
      showNotification(`${distribution.name} deleted successfully`, 'success');
    }
  };

  const handleDuplicateDistribution = (id: string) => {
    const distribution = distributions.find(d => d.id === id);
    if (distribution) {
      const duplicated = {
        ...distribution,
        id: `dist_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: `${distribution.name} (Copy)`,
        appliedAt: new Date(),
        isActive: false
      };
      
      setDistributions(prev => [...prev, duplicated]);
      showNotification(`${distribution.name} duplicated successfully`, 'success');
    }
  };

  const handleToggleDistribution = (id: string) => {
    setDistributions(prev => prev.map(d => 
      d.id === id ? { ...d, isActive: !d.isActive } : d
    ));
    
    const distribution = distributions.find(d => d.id === id);
    if (distribution) {
      showNotification(
        `${distribution.name} ${distribution.isActive ? 'deactivated' : 'activated'}`, 
        'success'
      );
    }
  };

  const handleExport = (config: ExportConfig) => {
    const fileName = `distribution_report_${config.year}.${config.format === 'excel' ? 'xlsx' : config.format}`;
    showNotification(`Exporting distribution report as ${fileName}...`, 'success');
    
    setTimeout(() => {
      showNotification(`Export completed: ${fileName}`, 'success');
    }, 2000);
  };

  const refreshData = () => {
    showNotification('Distribution data refreshed successfully', 'success');
  };

  return (
    <Layout>
      <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-2xl font-bold text-gray-900 mb-2">
            <span className="text-gray-500 font-light">Budget /</span> Distribution Management
          </h4>
          <p className="text-gray-600 text-sm">
            Create, manage, and monitor budget distributions across different business dimensions
          </p>
        </div>
        <div className="flex space-x-2">
          <button 
            onClick={refreshData}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
          <button 
            onClick={() => setIsExportModalOpen(true)}
            className="flex items-center space-x-2 px-4 py-2 border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
          <button 
            onClick={() => setIsDistributionModalOpen(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Create Distribution</span>
          </button>
        </div>
      </div>

      {/* Distribution Analytics Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100">Total Distributions</p>
              <p className="text-3xl font-bold">{distributions.length}</p>
              <p className="text-blue-100 text-sm">{distributions.filter(d => d.isActive).length} active</p>
            </div>
            <PieChart className="w-8 h-8 text-blue-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100">Total Budget</p>
              <p className="text-3xl font-bold">
                ${(distributions.reduce((sum, d) => sum + (d.isActive ? d.totalAmount : 0), 0) / 1000000).toFixed(1)}M
              </p>
              <p className="text-green-100 text-sm">Active distributions</p>
            </div>
            <BarChart3 className="w-8 h-8 text-green-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100">Total Units</p>
              <p className="text-3xl font-bold">
                {(distributions.reduce((sum, d) => sum + (d.isActive ? d.totalUnits : 0), 0) / 1000).toFixed(1)}K
              </p>
              <p className="text-purple-100 text-sm">Distributed units</p>
            </div>
            <Upload className="w-8 h-8 text-purple-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100">Avg Segments</p>
              <p className="text-3xl font-bold">
                {distributions.length > 0 ? Math.round(distributions.reduce((sum, d) => sum + d.segments, 0) / distributions.length) : 0}
              </p>
              <p className="text-orange-100 text-sm">Per distribution</p>
            </div>
            <PieChart className="w-8 h-8 text-orange-200" />
          </div>
        </div>
      </div>

      {/* Distribution Manager */}
      <DistributionManager
        distributions={distributions}
        onEditDistribution={handleEditDistribution}
        onDeleteDistribution={handleDeleteDistribution}
        onDuplicateDistribution={handleDuplicateDistribution}
        onToggleDistribution={handleToggleDistribution}
        onCreateNew={() => setIsDistributionModalOpen(true)}
      />

      {/* Notification Toast */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-2 rounded-lg shadow-lg transition-all duration-300 ${
          notification.type === 'success' 
            ? 'bg-green-600 text-white' 
            : 'bg-red-600 text-white'
        }`}>
          {notification.message}
        </div>
      )}

      {/* Modals */}
      <DistributionModal 
        isOpen={isDistributionModalOpen}
        onClose={() => setIsDistributionModalOpen(false)}
        onApplyDistribution={handleApplyDistribution}
      />
      
      <ExportModal 
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        onExport={handleExport}
        title="Export Distribution Report"
      />
      </div>
    </Layout>
  );
};

export default DistributionManagement;
