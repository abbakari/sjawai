import React, { useEffect, useState } from 'react';
import { Package, Truck, Clock, AlertTriangle, CheckCircle, TrendingUp } from 'lucide-react';
import DataPersistenceManager from '../utils/dataPersistence';
import { initializeSampleGitData } from '../utils/sampleGitData';

interface GitSummaryWidgetProps {
  userRole?: string;
  compact?: boolean;
}

const GitSummaryWidget: React.FC<GitSummaryWidgetProps> = ({ userRole, compact = false }) => {
  const [allGitData, setAllGitData] = useState<any[]>([]);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // Initialize and load GIT data
  useEffect(() => {
    const loadGitData = () => {
      // Initialize sample GIT data if none exists
      const initialized = initializeSampleGitData();
      if (initialized) {
        console.log('Sample GIT data initialized for GitSummaryWidget');
      }

      // Load GIT data
      const gitData = DataPersistenceManager.getGitData();
      console.log('Loaded GIT data in GitSummaryWidget:', gitData.length, 'items');
      setAllGitData(gitData);
      setLastUpdate(new Date());
    };

    // Load data initially
    loadGitData();

    // Set up interval to refresh GIT data every 30 seconds
    const interval = setInterval(loadGitData, 30000);

    return () => clearInterval(interval);
  }, []);
  
  // Calculate summary metrics
  const totalGitItems = allGitData.length;
  const totalGitQuantity = allGitData.reduce((sum, item) => sum + item.gitQuantity, 0);
  const totalGitValue = allGitData.reduce((sum, item) => sum + item.estimatedValue, 0);
  
  // Status breakdown
  const statusCounts = allGitData.reduce((acc, item) => {
    acc[item.status] = (acc[item.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Overdue items
  const overdueItems = allGitData.filter(item => 
    item.eta && new Date(item.eta) < new Date()
  ).length;

  // Items arriving soon (within 7 days)
  const upcomingItems = allGitData.filter(item => {
    if (!item.eta) return false;
    const eta = new Date(item.eta);
    const now = new Date();
    const daysDiff = Math.ceil((eta.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return daysDiff >= 0 && daysDiff <= 7;
  }).length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ordered': return 'bg-blue-100 text-blue-800';
      case 'shipped': return 'bg-yellow-100 text-yellow-800';
      case 'in_transit': return 'bg-purple-100 text-purple-800';
      case 'arrived': return 'bg-green-100 text-green-800';
      case 'delayed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ordered': return <Package className="w-4 h-4" />;
      case 'shipped': return <Truck className="w-4 h-4" />;
      case 'in_transit': return <TrendingUp className="w-4 h-4" />;
      case 'arrived': return <CheckCircle className="w-4 h-4" />;
      case 'delayed': return <AlertTriangle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  if (compact) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Truck className="w-5 h-5 text-blue-600" />
            GIT Overview
          </h3>
          <span className="text-sm text-gray-500">{totalGitItems} shipments</span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-blue-50 rounded-lg p-3 text-center">
            <div className="text-sm text-blue-600 mb-1">Total Units</div>
            <div className="text-lg font-bold text-blue-700">{totalGitQuantity.toLocaleString()}</div>
          </div>
          <div className="bg-green-50 rounded-lg p-3 text-center">
            <div className="text-sm text-green-600 mb-1">Total Value</div>
            <div className="text-lg font-bold text-green-700">${(totalGitValue / 1000).toFixed(0)}K</div>
          </div>
        </div>

        {(overdueItems > 0 || upcomingItems > 0) && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <div className="flex justify-between text-sm">
              {overdueItems > 0 && (
                <div className="flex items-center gap-1 text-red-600">
                  <AlertTriangle className="w-3 h-3" />
                  <span>{overdueItems} overdue</span>
                </div>
              )}
              {upcomingItems > 0 && (
                <div className="flex items-center gap-1 text-orange-600">
                  <Clock className="w-3 h-3" />
                  <span>{upcomingItems} arriving soon</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
          <Truck className="w-6 h-6 text-blue-600" />
          Goods in Transit (GIT) Summary
        </h3>
        <div className="text-sm text-gray-500">
          Last updated: {new Date().toLocaleTimeString()}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 rounded-lg p-4 text-center">
          <Package className="w-6 h-6 text-blue-600 mx-auto mb-2" />
          <div className="text-sm text-blue-600 mb-1">Total Shipments</div>
          <div className="text-2xl font-bold text-blue-700">{totalGitItems}</div>
        </div>

        <div className="bg-green-50 rounded-lg p-4 text-center">
          <TrendingUp className="w-6 h-6 text-green-600 mx-auto mb-2" />
          <div className="text-sm text-green-600 mb-1">Total Units</div>
          <div className="text-2xl font-bold text-green-700">{totalGitQuantity.toLocaleString()}</div>
        </div>

        <div className="bg-purple-50 rounded-lg p-4 text-center">
          <Truck className="w-6 h-6 text-purple-600 mx-auto mb-2" />
          <div className="text-sm text-purple-600 mb-1">Total Value</div>
          <div className="text-2xl font-bold text-purple-700">${(totalGitValue / 1000).toFixed(0)}K</div>
        </div>

        <div className="bg-orange-50 rounded-lg p-4 text-center">
          <Clock className="w-6 h-6 text-orange-600 mx-auto mb-2" />
          <div className="text-sm text-orange-600 mb-1">Avg Lead Time</div>
          <div className="text-2xl font-bold text-orange-700">
            {allGitData.length > 0 ? Math.round(allGitData.reduce((sum, item) => sum + (item.leadTimeDays || 14), 0) / allGitData.length) : 0} days
          </div>
        </div>
      </div>

      {/* Status Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h4 className="text-lg font-medium text-gray-900 mb-3">Status Breakdown</h4>
          <div className="space-y-2">
            {Object.entries(statusCounts).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <span className={`p-1.5 rounded-full ${getStatusColor(status)}`}>
                    {getStatusIcon(status)}
                  </span>
                  <span className="font-medium text-gray-900 capitalize">
                    {status.replace('_', ' ')}
                  </span>
                </div>
                <span className="font-bold text-gray-700">{count}</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-lg font-medium text-gray-900 mb-3">Delivery Alerts</h4>
          <div className="space-y-3">
            {overdueItems > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                  <span className="font-medium text-red-900">Overdue Deliveries</span>
                </div>
                <p className="text-sm text-red-700">
                  {overdueItems} shipment{overdueItems > 1 ? 's' : ''} past due date
                </p>
              </div>
            )}

            {upcomingItems > 0 && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="w-4 h-4 text-orange-600" />
                  <span className="font-medium text-orange-900">Arriving Soon</span>
                </div>
                <p className="text-sm text-orange-700">
                  {upcomingItems} shipment{upcomingItems > 1 ? 's' : ''} arriving within 7 days
                </p>
              </div>
            )}

            {overdueItems === 0 && upcomingItems === 0 && totalGitItems > 0 && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="font-medium text-green-900">All On Schedule</span>
                </div>
                <p className="text-sm text-green-700">
                  All shipments are on track for delivery
                </p>
              </div>
            )}

            {totalGitItems === 0 && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Package className="w-4 h-4 text-gray-600" />
                  <span className="font-medium text-gray-900">No Active Shipments</span>
                </div>
                <p className="text-sm text-gray-700">
                  No goods currently in transit
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Role-specific insights */}
      {userRole && (
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h5 className="font-medium text-blue-900 mb-2">
            {userRole === 'admin' ? 'Admin Insights' :
             userRole === 'manager' ? 'Manager Insights' :
             userRole === 'salesman' ? 'Sales Insights' :
             userRole === 'supply_chain' ? 'Supply Chain Insights' : 'Insights'}
          </h5>
          <p className="text-sm text-blue-800">
            {userRole === 'admin' && 'Monitor all GIT data and delivery performance across the organization.'}
            {userRole === 'manager' && 'Track GIT items affecting your team\'s customers and budget planning.'}
            {userRole === 'salesman' && 'Monitor GIT for your customers to provide accurate delivery estimates.'}
            {userRole === 'supply_chain' && 'Coordinate with suppliers and optimize delivery schedules.'}
          </p>
        </div>
      )}
    </div>
  );
};

export default GitSummaryWidget;
