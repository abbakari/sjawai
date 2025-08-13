import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import AdminCommunicationCenter from '../components/AdminCommunicationCenter';
import EnhancedAdminStockManagement from '../components/EnhancedAdminStockManagement';
import { 
  Users, 
  MessageSquare, 
  Package, 
  Settings, 
  BarChart3, 
  Bell, 
  AlertTriangle, 
  CheckCircle, 
  TrendingUp, 
  Activity,
  UserCheck,
  MessageCircle,
  Truck,
  DollarSign,
  Eye,
  RefreshCw,
  Search,
  Filter,
  Download,
  Upload,
  Send,
  Clock,
  Target,
  Zap
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface SystemUser {
  id: string;
  name: string;
  email: string;
  role: 'salesman' | 'manager' | 'supply_chain';
  status: 'online' | 'offline' | 'busy';
  lastActive: string;
  totalActions: number;
  pendingTasks: number;
  completedTasks: number;
  location: string;
  department: string;
}

interface SystemAlert {
  id: string;
  type: 'critical' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: string;
  isResolved: boolean;
  affectedUsers: string[];
  category: 'stock' | 'budget' | 'system' | 'user' | 'communication';
}

interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  pendingMessages: number;
  criticalAlerts: number;
  totalStockValue: number;
  stockItems: number;
  pendingApprovals: number;
  systemHealth: 'excellent' | 'good' | 'warning' | 'critical';
  dailyActivity: number;
  weeklyGrowth: number;
}

const AdvancedAdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [isCommunicationCenterOpen, setIsCommunicationCenterOpen] = useState(false);
  const [isStockManagementOpen, setIsStockManagementOpen] = useState(false);
  const [users, setUsers] = useState<SystemUser[]>([]);
  const [alerts, setAlerts] = useState<SystemAlert[]>([]);
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    activeUsers: 0,
    pendingMessages: 0,
    criticalAlerts: 0,
    totalStockValue: 0,
    stockItems: 0,
    pendingApprovals: 0,
    systemHealth: 'good',
    dailyActivity: 0,
    weeklyGrowth: 0
  });
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'alerts' | 'analytics'>('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    loadSystemData();
    const interval = setInterval(loadSystemData, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadSystemData = () => {
    loadUsers();
    loadAlerts();
    calculateStats();
  };

  const loadUsers = () => {
    // Sample users data
    const sampleUsers: SystemUser[] = [
      {
        id: 'john_salesman',
        name: 'John Salesman',
        email: 'john@company.com',
        role: 'salesman',
        status: 'online',
        lastActive: new Date().toISOString(),
        totalActions: 156,
        pendingTasks: 3,
        completedTasks: 24,
        location: 'New York',
        department: 'Sales'
      },
      {
        id: 'sarah_manager',
        name: 'Sarah Manager',
        email: 'sarah@company.com',
        role: 'manager',
        status: 'busy',
        lastActive: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        totalActions: 89,
        pendingTasks: 7,
        completedTasks: 31,
        location: 'Los Angeles',
        department: 'Management'
      },
      {
        id: 'mike_supply',
        name: 'Mike Supply Chain',
        email: 'mike@company.com',
        role: 'supply_chain',
        status: 'offline',
        lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        totalActions: 67,
        pendingTasks: 2,
        completedTasks: 18,
        location: 'Chicago',
        department: 'Supply Chain'
      },
      {
        id: 'jane_salesman',
        name: 'Jane Salesman',
        email: 'jane@company.com',
        role: 'salesman',
        status: 'online',
        lastActive: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        totalActions: 203,
        pendingTasks: 1,
        completedTasks: 42,
        location: 'Boston',
        department: 'Sales'
      },
      {
        id: 'david_manager',
        name: 'David Manager',
        email: 'david@company.com',
        role: 'manager',
        status: 'online',
        lastActive: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
        totalActions: 134,
        pendingTasks: 5,
        completedTasks: 28,
        location: 'Miami',
        department: 'Management'
      }
    ];
    setUsers(sampleUsers);
  };

  const loadAlerts = () => {
    const sampleAlerts: SystemAlert[] = [
      {
        id: '1',
        type: 'critical',
        title: 'Critical Stock Levels',
        message: 'Multiple items are below critical stock levels. Immediate restocking required.',
        timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        isResolved: false,
        affectedUsers: ['john_salesman', 'sarah_manager'],
        category: 'stock'
      },
      {
        id: '2',
        type: 'warning',
        title: 'Pending Budget Approvals',
        message: '15 budget submissions are pending manager approval for over 48 hours.',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        isResolved: false,
        affectedUsers: ['sarah_manager', 'david_manager'],
        category: 'budget'
      },
      {
        id: '3',
        type: 'info',
        title: 'New User Registered',
        message: 'Tom Anderson has been added as a new salesman.',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        isResolved: true,
        affectedUsers: [],
        category: 'user'
      },
      {
        id: '4',
        type: 'warning',
        title: 'Communication Backlog',
        message: '23 user messages are awaiting admin response.',
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        isResolved: false,
        affectedUsers: ['john_salesman', 'jane_salesman', 'mike_supply'],
        category: 'communication'
      }
    ];
    setAlerts(sampleAlerts);
  };

  const calculateStats = () => {
    // Calculate dynamic statistics
    const totalUsers = users.length;
    const activeUsers = users.filter(u => u.status === 'online').length;
    const pendingMessages = 23; // From sample data
    const criticalAlerts = alerts.filter(a => a.type === 'critical' && !a.isResolved).length;
    const totalStockValue = 127580; // Sample value
    const stockItems = 156; // Sample value
    const pendingApprovals = users.reduce((sum, u) => sum + u.pendingTasks, 0);
    const systemHealth: 'excellent' | 'good' | 'warning' | 'critical' = 
      criticalAlerts > 5 ? 'critical' : 
      criticalAlerts > 2 ? 'warning' : 
      activeUsers / totalUsers > 0.8 ? 'excellent' : 'good';

    setStats({
      totalUsers,
      activeUsers,
      pendingMessages,
      criticalAlerts,
      totalStockValue,
      stockItems,
      pendingApprovals,
      systemHealth,
      dailyActivity: users.reduce((sum, u) => sum + u.totalActions, 0),
      weeklyGrowth: 12.5 // Sample percentage
    });
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = searchTerm === '' || 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.department.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    const matchesStatus = filterStatus === 'all' || user.status === filterStatus;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const sendMessageToUser = (userId: string) => {
    const selectedUser = users.find(u => u.id === userId);
    if (selectedUser) {
      // This would open the communication center with pre-filled recipient
      setIsCommunicationCenterOpen(true);
      // You could pass additional props to pre-fill the compose form
    }
  };

  const resolveAlert = (alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, isResolved: true } : alert
    ));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'text-green-700 bg-green-100';
      case 'busy': return 'text-yellow-700 bg-yellow-100';
      case 'offline': return 'text-gray-700 bg-gray-100';
      default: return 'text-gray-700 bg-gray-100';
    }
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'critical': return 'border-red-500 bg-red-50 text-red-700';
      case 'warning': return 'border-yellow-500 bg-yellow-50 text-yellow-700';
      case 'info': return 'border-blue-500 bg-blue-50 text-blue-700';
      default: return 'border-gray-500 bg-gray-50 text-gray-700';
    }
  };

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'excellent': return 'text-green-600';
      case 'good': return 'text-blue-600';
      case 'warning': return 'text-yellow-600';
      case 'critical': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Advanced Admin Dashboard</h1>
            <p className="text-gray-600">Comprehensive system management and user oversight</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsCommunicationCenterOpen(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <MessageSquare className="w-4 h-4" />
              Communication Center
            </button>
            <button
              onClick={() => setIsStockManagementOpen(true)}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
            >
              <Package className="w-4 h-4" />
              Stock Management
            </button>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-green-600 font-medium">{stats.activeUsers} online</span>
              <span className="text-gray-500">•</span>
              <span className="text-gray-600">{stats.totalUsers - stats.activeUsers} offline</span>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <MessageSquare className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Pending Messages</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pendingMessages}</p>
              </div>
            </div>
            <button
              onClick={() => setIsCommunicationCenterOpen(true)}
              className="text-sm text-purple-600 hover:text-purple-700 font-medium"
            >
              View Communication Center →
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Package className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Stock Value</p>
                <p className="text-2xl font-bold text-gray-900">${stats.totalStockValue.toLocaleString()}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-green-600 font-medium">{stats.stockItems} items</span>
              <button
                onClick={() => setIsStockManagementOpen(true)}
                className="text-green-600 hover:text-green-700 ml-auto"
              >
                Manage →
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Critical Alerts</p>
                <p className="text-2xl font-bold text-gray-900">{stats.criticalAlerts}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className={`font-medium ${getHealthColor(stats.systemHealth)}`}>
                System: {stats.systemHealth}
              </span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="border-b border-gray-200">
            <div className="flex space-x-1 p-4">
              {[
                { id: 'overview', label: 'Overview', icon: BarChart3 },
                { id: 'users', label: 'User Management', icon: Users },
                { id: 'alerts', label: 'System Alerts', icon: Bell, count: alerts.filter(a => !a.isResolved).length },
                { id: 'analytics', label: 'Analytics', icon: TrendingUp }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                  {tab.count !== undefined && tab.count > 0 && (
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                      activeTab === tab.id ? 'bg-white text-blue-600' : 'bg-red-500 text-white'
                    }`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Recent Activity */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Activity className="w-5 h-5" />
                      Recent Activity
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                        <div>
                          <div className="font-medium text-gray-900">John Salesman</div>
                          <div className="text-sm text-gray-600">Created new budget for Action Aid</div>
                        </div>
                        <div className="text-xs text-gray-500">2 min ago</div>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                        <div>
                          <div className="font-medium text-gray-900">Sarah Manager</div>
                          <div className="text-sm text-gray-600">Approved 3 budget submissions</div>
                        </div>
                        <div className="text-xs text-gray-500">15 min ago</div>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                        <div>
                          <div className="font-medium text-gray-900">Stock Update</div>
                          <div className="text-sm text-gray-600">BF Goodrich stock replenished</div>
                        </div>
                        <div className="text-xs text-gray-500">1 hour ago</div>
                      </div>
                    </div>
                  </div>

                  {/* System Performance */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Zap className="w-5 h-5" />
                      System Performance
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-gray-700">User Activity</span>
                          <span className="text-sm font-medium text-gray-900">85%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-green-600 h-2 rounded-full" style={{ width: '85%' }}></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-gray-700">Response Time</span>
                          <span className="text-sm font-medium text-gray-900">92%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-blue-600 h-2 rounded-full" style={{ width: '92%' }}></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-gray-700">System Health</span>
                          <span className="text-sm font-medium text-gray-900">78%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-yellow-600 h-2 rounded-full" style={{ width: '78%' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button
                      onClick={() => setIsCommunicationCenterOpen(true)}
                      className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow text-left"
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <MessageSquare className="w-5 h-5 text-blue-600" />
                        <span className="font-medium text-gray-900">Send Broadcast</span>
                      </div>
                      <p className="text-sm text-gray-600">Send message to all users or specific roles</p>
                    </button>
                    <button
                      onClick={() => setIsStockManagementOpen(true)}
                      className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow text-left"
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <Package className="w-5 h-5 text-green-600" />
                        <span className="font-medium text-gray-900">Update Stock</span>
                      </div>
                      <p className="text-sm text-gray-600">Bulk update stock levels across items</p>
                    </button>
                    <button className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow text-left">
                      <div className="flex items-center gap-3 mb-2">
                        <Download className="w-5 h-5 text-purple-600" />
                        <span className="font-medium text-gray-900">Generate Reports</span>
                      </div>
                      <p className="text-sm text-gray-600">Export system and user activity reports</p>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'users' && (
              <div className="space-y-6">
                {/* User Filters */}
                <div className="flex items-center gap-4">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search users..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <select
                    value={filterRole}
                    onChange={(e) => setFilterRole(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">All Roles</option>
                    <option value="salesman">Salesman</option>
                    <option value="manager">Manager</option>
                    <option value="supply_chain">Supply Chain</option>
                  </select>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">All Status</option>
                    <option value="online">Online</option>
                    <option value="busy">Busy</option>
                    <option value="offline">Offline</option>
                  </select>
                </div>

                {/* Users Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredUsers.map((user) => (
                    <div key={user.id} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <UserCheck className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{user.name}</div>
                            <div className="text-sm text-gray-600">{user.role}</div>
                          </div>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}>
                          {user.status}
                        </span>
                      </div>

                      <div className="space-y-2 text-sm mb-4">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Email:</span>
                          <span className="text-gray-900">{user.email}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Location:</span>
                          <span className="text-gray-900">{user.location}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Department:</span>
                          <span className="text-gray-900">{user.department}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Last Active:</span>
                          <span className="text-gray-900">
                            {new Date(user.lastActive).toLocaleString()}
                          </span>
                        </div>
                      </div>

                      <div className="border-t border-gray-200 pt-4">
                        <div className="grid grid-cols-3 gap-4 text-center mb-4">
                          <div>
                            <div className="text-lg font-bold text-blue-600">{user.totalActions}</div>
                            <div className="text-xs text-gray-600">Total Actions</div>
                          </div>
                          <div>
                            <div className="text-lg font-bold text-orange-600">{user.pendingTasks}</div>
                            <div className="text-xs text-gray-600">Pending</div>
                          </div>
                          <div>
                            <div className="text-lg font-bold text-green-600">{user.completedTasks}</div>
                            <div className="text-xs text-gray-600">Completed</div>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() => sendMessageToUser(user.id)}
                            className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm flex items-center justify-center gap-2"
                          >
                            <MessageCircle className="w-4 h-4" />
                            Message
                          </button>
                          <button className="flex-1 bg-gray-100 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-200 transition-colors text-sm flex items-center justify-center gap-2">
                            <Eye className="w-4 h-4" />
                            View Details
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'alerts' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">System Alerts</h3>
                  <button
                    onClick={loadAlerts}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Refresh
                  </button>
                </div>

                <div className="space-y-3">
                  {alerts.map((alert) => (
                    <div
                      key={alert.id}
                      className={`p-4 rounded-lg border-l-4 ${getAlertColor(alert.type)} ${
                        alert.isResolved ? 'opacity-60' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <AlertTriangle className="w-4 h-4" />
                            <span className="font-medium">{alert.title}</span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              alert.type === 'critical' ? 'bg-red-200 text-red-800' :
                              alert.type === 'warning' ? 'bg-yellow-200 text-yellow-800' :
                              'bg-blue-200 text-blue-800'
                            }`}>
                              {alert.type}
                            </span>
                            {alert.isResolved && (
                              <span className="px-2 py-1 bg-green-200 text-green-800 rounded-full text-xs font-medium">
                                Resolved
                              </span>
                            )}
                          </div>
                          <p className="text-sm mb-2">{alert.message}</p>
                          <div className="text-xs text-gray-600">
                            <span>Category: {alert.category}</span>
                            <span className="mx-2">•</span>
                            <span>{new Date(alert.timestamp).toLocaleString()}</span>
                            {alert.affectedUsers.length > 0 && (
                              <>
                                <span className="mx-2">•</span>
                                <span>Affects {alert.affectedUsers.length} user(s)</span>
                              </>
                            )}
                          </div>
                        </div>
                        {!alert.isResolved && (
                          <button
                            onClick={() => resolveAlert(alert.id)}
                            className="ml-4 bg-green-600 text-white px-3 py-1 rounded-lg hover:bg-green-700 transition-colors text-sm flex items-center gap-1"
                          >
                            <CheckCircle className="w-4 h-4" />
                            Resolve
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'analytics' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">System Analytics</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h4 className="text-md font-medium text-gray-900 mb-4">User Activity Breakdown</h4>
                    <div className="space-y-3">
                      {['salesman', 'manager', 'supply_chain'].map(role => {
                        const roleUsers = users.filter(u => u.role === role);
                        const totalActions = roleUsers.reduce((sum, u) => sum + u.totalActions, 0);
                        return (
                          <div key={role} className="flex justify-between items-center">
                            <span className="text-sm text-gray-700 capitalize">{role.replace('_', ' ')}</span>
                            <div className="text-right">
                              <div className="text-sm font-medium text-gray-900">{totalActions} actions</div>
                              <div className="text-xs text-gray-500">{roleUsers.length} users</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h4 className="text-md font-medium text-gray-900 mb-4">Response Times</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-700">Average Response</span>
                        <span className="text-sm font-medium text-gray-900">2.3 hours</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-700">Fastest Response</span>
                        <span className="text-sm font-medium text-green-600">12 minutes</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-700">Slowest Response</span>
                        <span className="text-sm font-medium text-red-600">8.5 hours</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h4 className="text-md font-medium text-gray-900 mb-4">Growth Metrics</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-700">Daily Activity</span>
                        <span className="text-sm font-medium text-blue-600">+{stats.weeklyGrowth}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-700">User Engagement</span>
                        <span className="text-sm font-medium text-green-600">+8.2%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-700">Issue Resolution</span>
                        <span className="text-sm font-medium text-purple-600">+15.7%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modals */}
        <AdminCommunicationCenter
          isOpen={isCommunicationCenterOpen}
          onClose={() => setIsCommunicationCenterOpen(false)}
        />

        <EnhancedAdminStockManagement
          isOpen={isStockManagementOpen}
          onClose={() => setIsStockManagementOpen(false)}
        />
      </div>
    </Layout>
  );
};

export default AdvancedAdminDashboard;
