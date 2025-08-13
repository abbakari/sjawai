import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import AdminStockManagement from '../components/AdminStockManagement';
import AdminWorkflowCenter from '../components/AdminWorkflowCenter';
import StockSummaryWidget from '../components/StockSummaryWidget';
import { 
  Package, 
  Users, 
  Bell, 
  MessageSquare, 
  TrendingUp, 
  AlertTriangle, 
  Eye, 
  Settings, 
  Activity,
  Clock,
  CheckCircle,
  RefreshCw,
  BarChart3,
  Truck,
  DollarSign,
  Filter,
  Search
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface UserActivity {
  id: string;
  userId: string;
  userName: string;
  userRole: 'salesman' | 'manager' | 'supply_chain';
  action: string;
  details: string;
  timestamp: string;
  status: 'pending' | 'completed' | 'failed';
  metadata?: any;
}

interface ProcessNotification {
  id: string;
  type: 'stock_request' | 'budget_submission' | 'supply_chain_update' | 'user_action' | 'system_alert';
  title: string;
  message: string;
  fromUser: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  timestamp: string;
  isRead: boolean;
  actionRequired: boolean;
  metadata?: any;
}

interface AdminInventoryStats {
  totalUsers: number;
  activeUsers: number;
  pendingRequests: number;
  criticalAlerts: number;
  totalStockValue: number;
  lowStockItems: number;
  recentActivity: number;
  systemHealth: 'good' | 'warning' | 'critical';
}

const AdminInventoryDashboard: React.FC = () => {
  const { user } = useAuth();
  const [isStockManagementOpen, setIsStockManagementOpen] = useState(false);
  const [isWorkflowCenterOpen, setIsWorkflowCenterOpen] = useState(false);
  const [userActivities, setUserActivities] = useState<UserActivity[]>([]);
  const [notifications, setNotifications] = useState<ProcessNotification[]>([]);
  const [stats, setStats] = useState<AdminInventoryStats>({
    totalUsers: 0,
    activeUsers: 0,
    pendingRequests: 0,
    criticalAlerts: 0,
    totalStockValue: 0,
    lowStockItems: 0,
    recentActivity: 0,
    systemHealth: 'good'
  });
  const [selectedTimeRange, setSelectedTimeRange] = useState('24h');
  const [filterRole, setFilterRole] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Load admin data on component mount
  useEffect(() => {
    loadAdminData();
    // Set up real-time updates
    const interval = setInterval(loadAdminData, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadAdminData = () => {
    loadUserActivities();
    loadNotifications();
    calculateStats();
  };

  const loadUserActivities = () => {
    try {
      // Get user activities from various sources
      const salesBudgetData = JSON.parse(localStorage.getItem('sales_budget_saved_data') || '[]');
      const rollingForecastData = JSON.parse(localStorage.getItem('rolling_forecast_saved_data') || '[]');
      const workflowData = JSON.parse(localStorage.getItem('admin_workflow_center') || '[]');

      // Generate activities based on user data changes
      const activities: UserActivity[] = [
        {
          id: 'act_001',
          userId: 'user_001',
          userName: 'John Salesman',
          userRole: 'salesman',
          action: 'Stock Request Submitted',
          details: 'Requested 50 units of BF GOODRICH TYRE for Action Aid International',
          timestamp: new Date(Date.now() - 1800000).toISOString(),
          status: 'pending',
          metadata: {
            itemName: 'BF GOODRICH TYRE 235/85R16',
            customer: 'Action Aid International (Tz)',
            quantity: 50
          }
        },
        {
          id: 'act_002',
          userId: 'user_002',
          userName: 'Sarah Manager',
          userRole: 'manager',
          action: 'Budget Updated',
          details: 'Modified budget allocation for Q1 2026 - MICHELIN products',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          status: 'completed',
          metadata: {
            budgetAmount: 250000,
            category: 'TYRE SERVICE'
          }
        },
        {
          id: 'act_003',
          userId: 'user_003',
          userName: 'Supply Chain Team',
          userRole: 'supply_chain',
          action: 'Delivery Status Update',
          details: 'MICHELIN shipment delayed - Updated ETA to March 1st',
          timestamp: new Date(Date.now() - 7200000).toISOString(),
          status: 'completed',
          metadata: {
            shipmentId: 'SH_2025_001',
            newETA: '2025-03-01'
          }
        },
        {
          id: 'act_004',
          userId: 'user_004',
          userName: 'Mike Salesman',
          userRole: 'salesman',
          action: 'Customer Follow-back',
          details: 'Customer requesting price adjustment and expedited delivery',
          timestamp: new Date(Date.now() - 5400000).toISOString(),
          status: 'pending',
          metadata: {
            customer: 'Action Aid International (Tz)',
            requestType: 'price_adjustment'
          }
        },
        {
          id: 'act_005',
          userId: 'user_005',
          userName: 'Emma Manager',
          userRole: 'manager',
          action: 'Forecast Review',
          details: 'Reviewed rolling forecast for February - flagged discrepancies',
          timestamp: new Date(Date.now() - 10800000).toISOString(),
          status: 'completed',
          metadata: {
            period: 'February 2025',
            discrepancies: 3
          }
        }
      ];

      setUserActivities(activities);
    } catch (error) {
      console.error('Error loading user activities:', error);
    }
  };

  const loadNotifications = () => {
    try {
      // Load system notifications and create admin-specific ones
      const systemNotifications = JSON.parse(localStorage.getItem('system_notifications') || '[]');
      const workflowNotifications = JSON.parse(localStorage.getItem('admin_workflow_center') || '[]');

      const notifications: ProcessNotification[] = [
        {
          id: 'notif_001',
          type: 'stock_request',
          title: 'Urgent Stock Request',
          message: 'John Salesman requesting 50 units of BF GOODRICH TYRE - Action Aid customer urgent',
          fromUser: 'John Salesman',
          priority: 'critical',
          timestamp: new Date(Date.now() - 1800000).toISOString(),
          isRead: false,
          actionRequired: true,
          metadata: {
            requestId: 'wf_001',
            customer: 'Action Aid International (Tz)'
          }
        },
        {
          id: 'notif_002',
          type: 'supply_chain_update',
          title: 'Delivery Delay Alert',
          message: 'MICHELIN shipment delayed by 2 weeks - Multiple customers affected',
          fromUser: 'Supply Chain Team',
          priority: 'high',
          timestamp: new Date(Date.now() - 10800000).toISOString(),
          isRead: false,
          actionRequired: true,
          metadata: {
            shipmentId: 'SH_2025_001',
            affectedCustomers: 2
          }
        },
        {
          id: 'notif_003',
          type: 'budget_submission',
          title: 'Budget Approval Required',
          message: 'Sarah Manager submitted Q1 2026 budget allocation for review',
          fromUser: 'Sarah Manager',
          priority: 'medium',
          timestamp: new Date(Date.now() - 7200000).toISOString(),
          isRead: true,
          actionRequired: true,
          metadata: {
            budgetAmount: 250000
          }
        },
        {
          id: 'notif_004',
          type: 'system_alert',
          title: 'Low Stock Alert',
          message: '5 items below minimum stock level - Immediate attention required',
          fromUser: 'System',
          priority: 'high',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          isRead: false,
          actionRequired: true,
          metadata: {
            lowStockCount: 5
          }
        },
        {
          id: 'notif_005',
          type: 'user_action',
          title: 'Customer Price Adjustment Request',
          message: 'Mike Salesman reporting customer requesting 10% price reduction',
          fromUser: 'Mike Salesman',
          priority: 'medium',
          timestamp: new Date(Date.now() - 5400000).toISOString(),
          isRead: false,
          actionRequired: true,
          metadata: {
            customer: 'Action Aid International (Tz)',
            discount: 10
          }
        }
      ];

      setNotifications(notifications);
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  const calculateStats = () => {
    try {
      const stockSummary = JSON.parse(localStorage.getItem('global_stock_summary') || '{}');
      const workflowItems = JSON.parse(localStorage.getItem('admin_workflow_center') || '[]');
      
      const newStats: AdminInventoryStats = {
        totalUsers: 12, // Mock data - in real app would come from user management system
        activeUsers: 8,
        pendingRequests: workflowItems.filter((item: any) => item.status === 'pending').length,
        criticalAlerts: notifications.filter(n => n.priority === 'critical' && !n.isRead).length,
        totalStockValue: stockSummary.totalStock * 150 || 450000, // Estimated value
        lowStockItems: stockSummary.lowStockItems || 5,
        recentActivity: userActivities.filter(a => 
          new Date(a.timestamp) > new Date(Date.now() - 24 * 60 * 60 * 1000)
        ).length,
        systemHealth: stockSummary.lowStockItems > 10 ? 'critical' : 
                     stockSummary.lowStockItems > 5 ? 'warning' : 'good'
      };

      setStats(newStats);
    } catch (error) {
      console.error('Error calculating stats:', error);
    }
  };

  const markNotificationAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId ? { ...notif, isRead: true } : notif
      )
    );
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'stock_request': return <Package className="w-5 h-5" />;
      case 'budget_submission': return <DollarSign className="w-5 h-5" />;
      case 'supply_chain_update': return <Truck className="w-5 h-5" />;
      case 'user_action': return <Users className="w-5 h-5" />;
      case 'system_alert': return <AlertTriangle className="w-5 h-5" />;
      default: return <Bell className="w-5 h-5" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'failed': return <AlertTriangle className="w-4 h-4 text-red-600" />;
      default: return <RefreshCw className="w-4 h-4 text-gray-600" />;
    }
  };

  const filteredActivities = userActivities.filter(activity => {
    const matchesRole = filterRole === 'all' || activity.userRole === filterRole;
    const matchesSearch = searchTerm === '' || 
      activity.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.details.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesRole && matchesSearch;
  });

  const unreadNotifications = notifications.filter(n => !n.isRead);
  const criticalNotifications = notifications.filter(n => n.priority === 'critical' && !n.isRead);

  // Restrict access to admin only
  if (user?.role !== 'admin') {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Restricted</h2>
            <p className="text-gray-600">This dashboard is only available to administrators.</p>
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
            <h1 className="text-2xl font-bold text-gray-900">
              <span className="text-gray-500 font-light">Admin /</span> Inventory Control Center
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Monitor user activities, manage stock globally, and coordinate processes across all roles
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-200 rounded-lg">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-green-700">System Active</span>
            </div>
            <button
              onClick={() => setIsWorkflowCenterOpen(true)}
              className="relative flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Workflow Center</span>
              {unreadNotifications.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {unreadNotifications.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setIsStockManagementOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Settings className="w-4 h-4" />
              <span>Manage Stock</span>
            </button>
          </div>
        </div>

        {/* Critical Alerts Banner */}
        {criticalNotifications.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-6 h-6 text-red-600" />
              <div className="flex-1">
                <h3 className="font-medium text-red-900">Critical Alerts Require Immediate Attention</h3>
                <p className="text-sm text-red-700 mt-1">
                  {criticalNotifications.length} critical notification{criticalNotifications.length !== 1 ? 's' : ''} pending your response
                </p>
              </div>
              <button
                onClick={() => setIsWorkflowCenterOpen(true)}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                Review Now
              </button>
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Users</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.activeUsers}/{stats.totalUsers}</p>
                <p className="text-xs text-green-600 mt-1">System operational</p>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Requests</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.pendingRequests}</p>
                <p className="text-xs text-yellow-600 mt-1">Awaiting action</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Stock Value</p>
                <p className="text-2xl font-semibold text-gray-900">${(stats.totalStockValue / 1000).toFixed(0)}K</p>
                <p className="text-xs text-blue-600 mt-1">Total inventory</p>
              </div>
              <DollarSign className="w-8 h-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Critical Alerts</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.criticalAlerts}</p>
                <p className="text-xs text-red-600 mt-1">Need attention</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Real-time Notifications */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Live Notifications</h3>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-xs text-gray-500">Real-time</span>
                  </div>
                </div>
              </div>
              <div className="max-h-96 overflow-y-auto">
                {notifications.slice(0, 8).map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${
                      !notification.isRead ? 'bg-blue-50' : ''
                    }`}
                    onClick={() => markNotificationAsRead(notification.id)}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${getPriorityColor(notification.priority)}`}>
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-sm font-medium text-gray-900 truncate">{notification.title}</h4>
                          {!notification.isRead && <div className="w-2 h-2 bg-blue-500 rounded-full"></div>}
                        </div>
                        <p className="text-xs text-gray-600 line-clamp-2">{notification.message}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs text-gray-500">{notification.fromUser}</span>
                          <span className="text-xs text-gray-400">•</span>
                          <span className="text-xs text-gray-500">
                            {new Date(notification.timestamp).toLocaleTimeString()}
                          </span>
                          {notification.actionRequired && (
                            <span className="text-xs bg-orange-100 text-orange-800 px-2 py-0.5 rounded">
                              Action Required
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="px-6 py-3 border-t border-gray-200">
                <button
                  onClick={() => setIsWorkflowCenterOpen(true)}
                  className="w-full text-center text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  View All Notifications
                </button>
              </div>
            </div>
          </div>

          {/* User Activities */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">User Activities</h3>
                  <div className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-green-500" />
                    <span className="text-sm text-gray-600">{stats.recentActivity} in 24h</span>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Search activities..."
                    />
                  </div>
                  <select
                    value={filterRole}
                    onChange={(e) => setFilterRole(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">All Roles</option>
                    <option value="salesman">Salesmen</option>
                    <option value="manager">Managers</option>
                    <option value="supply_chain">Supply Chain</option>
                  </select>
                </div>
              </div>
              <div className="max-h-96 overflow-y-auto">
                {filteredActivities.map((activity) => (
                  <div key={activity.id} className="p-4 border-b border-gray-100 hover:bg-gray-50">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0">
                        {getStatusIcon(activity.status)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-sm font-medium text-gray-900">{activity.action}</h4>
                          <span className={`px-2 py-0.5 text-xs rounded-full ${
                            activity.userRole === 'salesman' ? 'bg-blue-100 text-blue-800' :
                            activity.userRole === 'manager' ? 'bg-green-100 text-green-800' :
                            'bg-purple-100 text-purple-800'
                          }`}>
                            {activity.userRole}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{activity.details}</p>
                        <div className="flex items-center gap-3 text-xs text-gray-500">
                          <span>{activity.userName}</span>
                          <span>•</span>
                          <span>{new Date(activity.timestamp).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Stock Summary Widget */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Global Stock Summary</h3>
            <p className="text-sm text-gray-600">Real-time inventory status across all users</p>
          </div>
          <div className="p-6">
            <StockSummaryWidget />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
            <div className="flex items-center gap-3 mb-3">
              <Package className="w-8 h-8" />
              <h3 className="text-lg font-semibold">Stock Management</h3>
            </div>
            <p className="text-blue-100 mb-4">Update stock quantities globally across all users</p>
            <button
              onClick={() => setIsStockManagementOpen(true)}
              className="bg-white text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors font-medium"
            >
              Manage Stock
            </button>
          </div>

          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
            <div className="flex items-center gap-3 mb-3">
              <MessageSquare className="w-8 h-8" />
              <h3 className="text-lg font-semibold">Workflow Center</h3>
            </div>
            <p className="text-green-100 mb-4">Coordinate with users and manage all processes</p>
            <button
              onClick={() => setIsWorkflowCenterOpen(true)}
              className="bg-white text-green-600 px-4 py-2 rounded-lg hover:bg-green-50 transition-colors font-medium"
            >
              Open Center
            </button>
          </div>

          <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white">
            <div className="flex items-center gap-3 mb-3">
              <BarChart3 className="w-8 h-8" />
              <h3 className="text-lg font-semibold">System Health</h3>
            </div>
            <p className="text-purple-100 mb-4">Monitor overall system performance and alerts</p>
            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
              stats.systemHealth === 'good' ? 'bg-green-100 text-green-800' :
              stats.systemHealth === 'warning' ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            }`}>
              <div className={`w-2 h-2 rounded-full ${
                stats.systemHealth === 'good' ? 'bg-green-500' :
                stats.systemHealth === 'warning' ? 'bg-yellow-500' :
                'bg-red-500'
              }`}></div>
              {stats.systemHealth}
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <AdminStockManagement
        isOpen={isStockManagementOpen}
        onClose={() => setIsStockManagementOpen(false)}
        items={[]} // Will be loaded from localStorage
      />

      <AdminWorkflowCenter
        isOpen={isWorkflowCenterOpen}
        onClose={() => setIsWorkflowCenterOpen(false)}
      />
    </Layout>
  );
};

export default AdminInventoryDashboard;
