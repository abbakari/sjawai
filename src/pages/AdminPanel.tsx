import React, { useState } from 'react';
import Layout from '../components/Layout';
import { Package, Settings, Users, MessageCircle, Monitor, Activity } from 'lucide-react';
import AdminStockManagement from '../components/AdminStockManagement';
import AdminWorkflowCenter from '../components/AdminWorkflowCenter';
import { useAuth } from '../contexts/AuthContext';

const AdminPanel: React.FC = () => {
  const { user } = useAuth();
  const [isAdminStockModalOpen, setIsAdminStockModalOpen] = useState(false);
  const [isWorkflowCenterOpen, setIsWorkflowCenterOpen] = useState(false);

  // Sample items for admin stock management
  const sampleItems = [
    {
      id: 1,
      customer: 'Action Aid International (Tz)',
      item: 'BF GOODRICH TYRE 235/85R16 120/116S TL ATT/A KO2 LRERWLGO',
      category: 'TYRE SERVICE',
      brand: 'BF GOODRICH',
      stock: 86
    },
    {
      id: 2,
      customer: 'Action Aid International (Tz)',
      item: 'BF GOODRICH TYRE 265/65R17 120/117S TL ATT/A KO2 LRERWLGO',
      category: 'TYRE SERVICE',
      brand: 'BF GOODRICH',
      stock: 7
    },
    {
      id: 3,
      customer: 'Action Aid International (Tz)',
      item: 'MICHELIN TYRE 265/65R17 112T TL LTX TRAIL',
      category: 'TYRE SERVICE',
      brand: 'MICHELIN',
      stock: 22
    },
    {
      id: 4,
      customer: 'ADVENT CONSTRUCTION LTD.',
      item: 'WHEEL BALANCE ALLOYD RIMS',
      category: 'TYRE SERVICE',
      brand: 'TYRE SERVICE',
      stock: 0
    },
    {
      id: 5,
      customer: 'ADVENT CONSTRUCTION LTD.',
      item: 'BF GOODRICH TYRE 235/85R16 120/116S TL ATT/A KO2 LRERWLGO',
      category: 'TYRE SERVICE',
      brand: 'BF GOODRICH',
      stock: 15
    }
  ];

  if (user?.role !== 'admin') {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
            <p className="text-gray-600">Only administrators can access this page.</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
            <p className="text-gray-600">System administration and management tools</p>
          </div>
        </div>

        {/* Admin Actions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

          {/* Admin Inventory Control Center */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Monitor className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Inventory Control Center</h3>
                <p className="text-sm text-gray-600">Advanced admin inventory dashboard</p>
              </div>
            </div>
            <p className="text-gray-700 mb-4">
              Comprehensive admin-only inventory dashboard with real-time user monitoring,
              process notifications, and advanced stock management capabilities.
            </p>
            <button
              onClick={() => window.location.href = '/admin-inventory'}
              className="w-full bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
            >
              Open Control Center
            </button>
          </div>

          {/* Workflow Center */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <MessageCircle className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Workflow Center</h3>
                <p className="text-sm text-gray-600">Coordinate with all teams</p>
              </div>
            </div>
            <p className="text-gray-700 mb-4">
              Manage follow-backs, requests, and communications from salesmen, managers,
              and supply chain teams. Track progress and respond to issues.
            </p>
            <button
              onClick={() => setIsWorkflowCenterOpen(true)}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Open Workflow Center
            </button>
          </div>

          {/* Global Stock Management */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <Package className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Global Stock Management</h3>
                <p className="text-sm text-gray-600">Set stock quantities for all users</p>
              </div>
            </div>
            <p className="text-gray-700 mb-4">
              Manage stock quantities that will be applied globally across all user dashboards,
              sales budgets, and rolling forecasts.
            </p>
            <button
              onClick={() => setIsAdminStockModalOpen(true)}
              className="w-full bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              Open Stock Manager
            </button>
          </div>

          {/* User Management */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">User Management</h3>
                <p className="text-sm text-gray-600">Manage system users</p>
              </div>
            </div>
            <p className="text-gray-700 mb-4">
              Create, edit, and manage user accounts, roles, and permissions across the system.
            </p>
            <button
              onClick={() => window.location.href = '/user-management'}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Manage Users
            </button>
          </div>

          {/* System Settings */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Settings className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">System Settings</h3>
                <p className="text-sm text-gray-600">Configure system preferences</p>
              </div>
            </div>
            <p className="text-gray-700 mb-4">
              Configure global system settings, defaults, and administrative preferences.
            </p>
            <button
              onClick={() => alert('System settings coming soon')}
              className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              Open Settings
            </button>
          </div>

          {/* System Activity Monitor */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Activity className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">BI Dashboard</h3>
                <p className="text-sm text-gray-600">Business intelligence analytics</p>
              </div>
            </div>
            <p className="text-gray-700 mb-4">
              Access advanced analytics, reports, and business intelligence tools for system-wide insights.
            </p>
            <button
              onClick={() => window.location.href = '/bi-dashboard'}
              className="w-full bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors"
            >
              Open BI Dashboard
            </button>
          </div>
        </div>

        {/* Important Notes */}
        {/* Important Notes */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-yellow-800 mb-2">Admin Dashboard Features</h3>
          <ul className="list-disc list-inside text-yellow-700 space-y-1">
            <li><strong>Inventory Control Center:</strong> Real-time user monitoring, process notifications, and comprehensive stock management</li>
            <li><strong>Workflow Center:</strong> Direct communication and coordination with all user types and roles</li>
            <li><strong>Global Stock Management:</strong> Override and set stock quantities that apply across all users</li>
            <li><strong>User Activity Monitoring:</strong> Track all user actions, requests, and system interactions in real-time</li>
          </ul>
        </div>

        {/* Quick Access to Control Center */}
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white">
          <div className="flex items-center gap-3 mb-4">
            <Monitor className="w-8 h-8" />
            <div>
              <h3 className="text-xl font-semibold">Admin Inventory Control Center</h3>
              <p className="text-purple-100">The specialized admin-only inventory dashboard</p>
            </div>
          </div>
          <p className="text-purple-100 mb-4">
            Unlike the regular inventory management page, this dashboard is designed specifically for administrators
            to monitor user activities, handle notifications, coordinate processes, and manage global stock settings.
          </p>
          <button
            onClick={() => window.location.href = '/admin-inventory'}
            className="bg-white text-purple-600 px-6 py-2 rounded-lg hover:bg-purple-50 transition-colors font-medium"
          >
            Access Control Center
          </button>
        </div>

        {/* Admin Stock Management Modal */}
        <AdminStockManagement
          isOpen={isAdminStockModalOpen}
          onClose={() => setIsAdminStockModalOpen(false)}
          items={sampleItems}
        />

        {/* Admin Workflow Center Modal */}
        <AdminWorkflowCenter
          isOpen={isWorkflowCenterOpen}
          onClose={() => setIsWorkflowCenterOpen(false)}
        />
      </div>
    </Layout>
  );
};

export default AdminPanel;
