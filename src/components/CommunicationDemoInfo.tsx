import React, { useState, useEffect } from 'react';
import { MessageSquare, Users, Bell, ArrowRight, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import { getCommunicationStats } from '../utils/communicationDemo';

const CommunicationDemoInfo: React.FC = () => {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    const loadStats = () => {
      const communicationStats = getCommunicationStats();
      setStats(communicationStats);
    };

    loadStats();
    // Update stats every 10 seconds
    const interval = setInterval(loadStats, 10000);
    return () => clearInterval(interval);
  }, []);

  if (!stats) return null;

  return (
    <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6 mb-6">
      <div className="flex items-center gap-3 mb-4">
        <MessageSquare className="w-6 h-6 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-900">Communication System Demo</h3>
        <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
          Live Demo
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Stats Overview */}
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center gap-2 mb-3">
            <Bell className="w-5 h-5 text-blue-600" />
            <span className="font-medium text-gray-900">Message Stats</span>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Total Messages:</span>
              <span className="font-medium text-gray-900">{stats.totalMessages}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Unread:</span>
              <span className="font-medium text-orange-600">{stats.unreadMessages}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Pending:</span>
              <span className="font-medium text-red-600">{stats.pendingMessages}</span>
            </div>
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center gap-2 mb-3">
            <Users className="w-5 h-5 text-green-600" />
            <span className="font-medium text-gray-900">By Category</span>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Stock Requests:</span>
              <span className="font-medium text-gray-900">{stats.byCategory.stock_request}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Budget Approvals:</span>
              <span className="font-medium text-gray-900">{stats.byCategory.budget_approval}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Forecast Inquiries:</span>
              <span className="font-medium text-gray-900">{stats.byCategory.forecast_inquiry}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Supply Chain:</span>
              <span className="font-medium text-gray-900">{stats.byCategory.supply_chain}</span>
            </div>
          </div>
        </div>

        {/* Priority Breakdown */}
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-5 h-5 text-orange-600" />
            <span className="font-medium text-gray-900">By Priority</span>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-red-600">Critical:</span>
              <span className="font-medium text-red-600">{stats.byPriority.critical}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-orange-600">High:</span>
              <span className="font-medium text-orange-600">{stats.byPriority.high}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-blue-600">Medium:</span>
              <span className="font-medium text-blue-600">{stats.byPriority.medium}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Low:</span>
              <span className="font-medium text-gray-600">{stats.byPriority.low}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Communication Flow Demo */}
      <div className="bg-white rounded-lg p-4 border border-gray-200">
        <h4 className="font-medium text-gray-900 mb-4">📧 Live Communication Examples</h4>
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <Users className="w-4 h-4 text-blue-600" />
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium text-blue-900">John Salesman → Admin</div>
              <div className="text-xs text-blue-700">Stock request for BF Goodrich tyres (HIGH priority)</div>
            </div>
            <ArrowRight className="w-4 h-4 text-blue-600" />
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-4 h-4 text-green-600" />
            </div>
            <div className="text-xs text-green-700">Responded</div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
            <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
              <Users className="w-4 h-4 text-orange-600" />
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium text-orange-900">Sarah Manager → Admin</div>
              <div className="text-xs text-orange-700">Budget approval request - $2.5M (MEDIUM priority)</div>
            </div>
            <ArrowRight className="w-4 h-4 text-orange-600" />
            <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
              <Clock className="w-4 h-4 text-yellow-600" />
            </div>
            <div className="text-xs text-yellow-700">Pending</div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
              <Users className="w-4 h-4 text-purple-600" />
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium text-purple-900">Jane Salesman ↔ Sarah Manager</div>
              <div className="text-xs text-purple-700">Forecast clarification discussion (MEDIUM priority)</div>
            </div>
            <ArrowRight className="w-4 h-4 text-purple-600" />
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-4 h-4 text-green-600" />
            </div>
            <div className="text-xs text-green-700">Resolved</div>
          </div>
        </div>
      </div>

      <div className="mt-4 text-sm text-gray-600">
        <strong>Demo Features:</strong> 
        • Bidirectional messaging between all user roles 
        • Priority-based categorization 
        • Real-time message status tracking 
        • Admin oversight of all communications 
        • User-to-user direct messaging
      </div>
    </div>
  );
};

export default CommunicationDemoInfo;
