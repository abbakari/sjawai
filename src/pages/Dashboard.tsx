import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import StatsCard from '../components/StatsCard';
import { PieChartIcon, TrendingUp, Clock, Download, RefreshCw, BarChart3, Target, AlertTriangle, Users, Package, Building, Truck, Eye, MessageSquare } from 'lucide-react';
import ExportModal, { ExportConfig } from '../components/ExportModal';
import GitEtaManagement from '../components/GitEtaManagement';
import ManagerDataView from '../components/ManagerDataView';
import GitSummaryWidget from '../components/GitSummaryWidget';
import AdminStockManagement from '../components/AdminStockManagement';
import UserCommunicationCenter from '../components/UserCommunicationCenter';
import CommunicationDemoInfo from '../components/CommunicationDemoInfo';
import { useAuth, getUserRoleName } from '../contexts/AuthContext';
import { useStock } from '../contexts/StockContext';
import { useBudget } from '../contexts/BudgetContext';
import { initializeCommunicationDemo } from '../utils/communicationDemo';


const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { stockRequests, stockAlerts, stockProjections, stockOverviews, getRequestsBySalesman, error: stockError, isLoading: stockLoading } = useStock();
  const { error: budgetError, isLoading: budgetLoading } = useBudget();
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  const [isGitEtaModalOpen, setIsGitEtaModalOpen] = useState(false);
  const [isManagerDataViewOpen, setIsManagerDataViewOpen] = useState(false);
  const [isAdminStockModalOpen, setIsAdminStockModalOpen] = useState(false);
  const [isCommunicationCenterOpen, setIsCommunicationCenterOpen] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  // Initialize demo communication data
  React.useEffect(() => {
    const initialized = initializeCommunicationDemo();
    if (initialized) {
      console.log('Communication demo data initialized');
    }
  }, []);

  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleExport = (config: ExportConfig) => {
    const fileName = `dashboard_report_${config.year}.${config.format === 'excel' ? 'xlsx' : config.format}`;
    showNotification(`Exporting dashboard report as ${fileName}...`, 'success');

    setTimeout(() => {
      showNotification(`Export completed: ${fileName}`, 'success');
    }, 2000);
  };

  const refreshData = () => {
    setLastRefresh(new Date());
    showNotification('Dashboard data refreshed successfully', 'success');
  };

  // Role-specific stats data
  const getStatsData = () => {
    if (!user) return [];

    switch (user.role) {
      case 'admin':
        return [
          {
            title: 'Total System Users',
            value: '24',
            subtitle: 'Active users',
            icon: Users,
            color: 'primary' as const,
            trend: { value: '+3 new', isPositive: true }
          },
          {
            title: 'Total Sales',
            value: '$2.4M',
            subtitle: 'All regions',
            icon: TrendingUp,
            color: 'success' as const,
            trend: { value: '+18.2%', isPositive: true }
          },
          {
            title: 'System Performance',
            value: '99.2%',
            subtitle: 'Uptime',
            icon: Target,
            color: 'info' as const,
            trend: { value: '+0.1%', isPositive: true }
          },
          {
            title: 'Budget Utilization',
            value: '87%',
            subtitle: 'Organization wide',
            icon: BarChart3,
            color: 'warning' as const,
            trend: { value: '+5%', isPositive: true }
          }
        ];

      case 'salesman':
        const salesmanData = getRequestsBySalesman(user?.name || '');
        const pendingStockItems = salesmanData.requests.filter(r => r.status === 'sent_to_manager').length +
                                 salesmanData.alerts.filter(a => a.status === 'sent_to_manager').length;
        const approvedStockItems = salesmanData.requests.filter(r => r.status === 'approved').length +
                                  salesmanData.alerts.filter(a => a.status === 'approved').length;

        return [
          {
            title: 'My Sales',
            value: '$156K',
            subtitle: 'This month',
            icon: TrendingUp,
            color: 'primary' as const,
            trend: { value: '+12.5%', isPositive: true }
          },
          {
            title: 'Stock Requests',
            value: `${salesmanData.requests.length}`,
            subtitle: `${pendingStockItems} pending review`,
            icon: Package,
            color: 'success' as const,
            trend: { value: `+${approvedStockItems} approved`, isPositive: true }
          },
          {
            title: 'My Budget',
            value: '$45K',
            subtitle: 'Remaining',
            icon: PieChartIcon,
            color: 'info' as const,
            trend: { value: '-$12K', isPositive: false }
          },
          {
            title: 'Stock Alerts',
            value: `${salesmanData.alerts.length}`,
            subtitle: 'Active alerts',
            icon: AlertTriangle,
            color: 'warning' as const,
            trend: { value: `${salesmanData.alerts.filter(a => a.priority === 'critical').length} critical`, isPositive: false }
          }
        ];

      case 'manager':
        const pendingForReview = stockRequests.filter(r => r.status === 'sent_to_manager').length +
                                stockAlerts.filter(a => a.status === 'sent_to_manager').length +
                                stockProjections.filter(p => p.status === 'sent_to_manager').length +
                                stockOverviews.filter(o => o.status === 'sent_to_manager').length;

        const criticalAlerts = stockAlerts.filter(a => a.priority === 'critical' && a.status === 'sent_to_manager').length;

        return [
          {
            title: 'Department Sales',
            value: '$850K',
            subtitle: user.department || 'Department',
            icon: Building,
            color: 'primary' as const,
            trend: { value: '+15%', isPositive: true }
          },
          {
            title: 'Stock Reviews',
            value: `${pendingForReview}`,
            subtitle: 'Pending review',
            icon: Package,
            color: 'success' as const,
            trend: { value: `${criticalAlerts} critical`, isPositive: criticalAlerts === 0 }
          },
          {
            title: 'Department Budget',
            value: '$245K',
            subtitle: 'Utilized',
            icon: PieChartIcon,
            color: 'info' as const,
            trend: { value: '73%', isPositive: true }
          },
          {
            title: 'Team Stock Requests',
            value: `${stockRequests.length}`,
            subtitle: 'Total requests',
            icon: AlertTriangle,
            color: 'warning' as const,
            trend: { value: `${stockRequests.filter(r => r.status === 'approved').length} approved`, isPositive: true }
          }
        ];

      case 'supply_chain':
        return [
          {
            title: 'Inventory Value',
            value: '$1.2M',
            subtitle: 'Current stock',
            icon: Package,
            color: 'primary' as const,
            trend: { value: '+5%', isPositive: true }
          },
          {
            title: 'Stock Accuracy',
            value: '98.5%',
            subtitle: 'System vs actual',
            icon: Target,
            color: 'success' as const,
            trend: { value: '+1.2%', isPositive: true }
          },
          {
            title: 'Orders Processed',
            value: '1,247',
            subtitle: 'This month',
            icon: TrendingUp,
            color: 'info' as const,
            trend: { value: '+156', isPositive: true }
          },
          {
            title: 'Low Stock Items',
            value: '23',
            subtitle: 'Need attention',
            icon: AlertTriangle,
            color: 'warning' as const,
            trend: { value: '-5', isPositive: true }
          }
        ];

      default:
        return [
          {
            title: 'Total Budget Units',
            value: '5,042',
            subtitle: 'As of current year',
            icon: PieChartIcon,
            color: 'primary' as const,
            trend: { value: '+12.5%', isPositive: true }
          },
          {
            title: 'Total Sales',
            value: '$2.4M',
            subtitle: 'Current performance',
            icon: TrendingUp,
            color: 'success' as const,
            trend: { value: '+18.2%', isPositive: true }
          },
          {
            title: 'Target Achievement',
            value: '87%',
            subtitle: 'Monthly progress',
            icon: Target,
            color: 'warning' as const,
            trend: { value: '+5.3%', isPositive: true }
          },
          {
            title: 'Active Users',
            value: '45',
            subtitle: 'System users',
            icon: Clock,
            color: 'info' as const,
            trend: { value: '+2', isPositive: true }
          }
        ];
    }
  };

  // Role-specific quick actions
  const getQuickActions = () => {
    if (!user) return [];

    switch (user.role) {
      case 'admin':
        return [
          {
            icon: Users,
            title: 'User Management',
            description: 'Manage system users',
            color: 'blue-600',
            onClick: () => navigate('/user-management')
          },
          {
            icon: BarChart3,
            title: 'System Reports',
            description: 'View system analytics',
            color: 'green-600',
            onClick: () => showNotification('System reports opened', 'success')
          },
          {
            icon: Target,
            title: 'Global Targets',
            description: 'Set organization goals',
            color: 'purple-600',
            onClick: () => showNotification('Global targets opened', 'success')
          },
          {
            icon: AlertTriangle,
            title: 'System Alerts',
            description: 'Monitor system health',
            color: 'orange-600',
            onClick: () => showNotification('System alerts checked', 'success')
          },
          {
            icon: Truck,
            title: 'GIT & ETA Management',
            description: 'Manage Goods in Transit',
            color: 'indigo-600',
            onClick: () => setIsGitEtaModalOpen(true)
          },
          {
            icon: Package,
            title: 'Global Stock Management',
            description: 'Set stock quantities for all users',
            color: 'red-600',
            onClick: () => setIsAdminStockModalOpen(true)
          },
          {
            icon: MessageSquare,
            title: 'Advanced Admin Control',
            description: 'Comprehensive system management',
            color: 'gray-600',
            onClick: () => navigate('/advanced-admin')
          }
        ];

      case 'salesman':
        return [
          {
            icon: PieChartIcon,
            title: 'My Budget',
            description: 'Manage personal budget',
            color: 'blue-600',
            onClick: () => navigate('/sales-budget')
          },
          {
            icon: TrendingUp,
            title: 'Sales Tracking',
            description: 'Track my sales progress',
            color: 'green-600',
            onClick: () => showNotification('Sales tracking opened', 'success')
          },
          {
            icon: BarChart3,
            title: 'My Forecast',
            description: 'Create sales forecast',
            color: 'purple-600',
            onClick: () => navigate('/rolling-forecast')
          },
          {
            icon: Target,
            title: 'My Targets',
            description: 'View personal targets',
            color: 'orange-600',
            onClick: () => showNotification('Personal targets opened', 'success')
          },
          {
            icon: MessageSquare,
            title: 'Communication Center',
            description: 'Messages and notifications',
            color: 'cyan-600',
            onClick: () => setIsCommunicationCenterOpen(true)
          }
        ];

      case 'manager':
        return [
          {
            icon: Building,
            title: 'Department Budget',
            description: 'Manage department finances',
            color: 'blue-600',
            onClick: () => navigate('/sales-budget')
          },
          {
            icon: Users,
            title: 'Team Performance',
            description: 'Monitor team progress',
            color: 'green-600',
            onClick: () => showNotification('Team performance opened', 'success')
          },
          {
            icon: BarChart3,
            title: 'Approval Center',
            description: 'Review submissions',
            color: 'purple-600',
            onClick: () => navigate('/approval-center')
          },
          {
            icon: Target,
            title: 'Team Targets',
            description: 'Set team objectives',
            color: 'orange-600',
            onClick: () => showNotification('Team targets opened', 'success')
          },
          {
            icon: Eye,
            title: 'Salesman Data View',
            description: 'View saved salesman data',
            color: 'indigo-600',
            onClick: () => setIsManagerDataViewOpen(true)
          },
          {
            icon: Package,
            title: 'Stock Control Center',
            description: 'Manage all salesman stock requests',
            color: 'emerald-600',
            onClick: () => navigate('/sales-budget') // Will open stock management modal
          },
          {
            icon: MessageSquare,
            title: 'Communication Center',
            description: 'Messages and notifications',
            color: 'cyan-600',
            onClick: () => setIsCommunicationCenterOpen(true)
          }
        ];

      case 'supply_chain':
        return [
          {
            icon: Package,
            title: 'Inventory Management',
            description: 'Manage stock levels',
            color: 'blue-600',
            onClick: () => navigate('/inventory-management')
          },
          {
            icon: TrendingUp,
            title: 'Stock Analytics',
            description: 'Analyze inventory trends',
            color: 'green-600',
            onClick: () => showNotification('Stock analytics opened', 'success')
          },
          {
            icon: BarChart3,
            title: 'Distribution',
            description: 'Manage distribution',
            color: 'purple-600',
            onClick: () => navigate('/distribution-management')
          },
          {
            icon: AlertTriangle,
            title: 'Stock Alerts',
            description: 'Monitor low stock items',
            color: 'orange-600',
            onClick: () => showNotification('Stock alerts checked', 'success')
          },
          {
            icon: MessageSquare,
            title: 'Communication Center',
            description: 'Messages and notifications',
            color: 'cyan-600',
            onClick: () => setIsCommunicationCenterOpen(true)
          }
        ];

      default:
        return [];
    }
  };

  const statsData = getStatsData();
  const quickActions = getQuickActions();

  if (!user) {
    return <div>Please log in to access the dashboard.</div>;
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-2xl font-bold text-gray-900 mb-2">
              <span className="text-gray-500 font-light">Dashboard /</span> {getUserRoleName(user.role)}
            </h4>
            <p className="text-sm text-gray-600">
              Welcome back, {user.name}! Last updated: {lastRefresh.toLocaleTimeString()}
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
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Export Report</span>
            </button>
          </div>
        </div>

        {/* User Role Badge */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-full ${
                user.role === 'admin' ? 'bg-red-100' :
                user.role === 'salesman' ? 'bg-green-100' :
                user.role === 'manager' ? 'bg-blue-100' :
                user.role === 'supply_chain' ? 'bg-purple-100' :
                'bg-orange-100'
              }`}>
                <Users className={`w-5 h-5 ${
                  user.role === 'admin' ? 'text-red-600' :
                  user.role === 'salesman' ? 'text-green-600' :
                  user.role === 'manager' ? 'text-blue-600' :
                  user.role === 'supply_chain' ? 'text-purple-600' :
                  'text-orange-600'
                }`} />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="font-semibold text-gray-900">{getUserRoleName(user.role)} Dashboard</h3>
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full mr-1 animate-pulse"></span>
                    Online
                  </span>
                </div>
                <p className="text-sm text-gray-600">
                  {user.department && `Department: ${user.department}`}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Access Level</p>
              <p className="font-semibold text-gray-900">
                {user.role === 'admin' ? 'Full System' :
                 user.role === 'manager' ? 'Department' :
                 user.role === 'supply_chain' ? 'Supply Chain' : 'Personal'}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {user.role === 'admin' ? 'All modules & user management' :
                 user.role === 'manager' ? 'Team oversight & approvals' :
                 user.role === 'supply_chain' ? 'Inventory & distribution' : 'Budget & forecast creation'}
              </p>
            </div>
          </div>
        </div>

        {/* Communication Demo Info - Show for all users */}
        <CommunicationDemoInfo />

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {statsData.map((stat, index) => (
            <div key={index} className="col-span-1">
              <StatsCard {...stat} />
            </div>
          ))}
        </div>

        {/* GIT Overview - Available to all users */}
        <GitSummaryWidget userRole={user.role} compact={true} />

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => {
              const IconComponent = action.icon;
              return (
                <button
                  key={index}
                  onClick={() => {
                    try {
                      action.onClick();
                    } catch (error) {
                      showNotification('An error occurred. Please try again.', 'error');
                    }
                  }}
                  className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 text-left group"
                  title={`Click to access ${action.title}`}
                >
                  <IconComponent className={`w-6 h-6 text-${action.color} group-hover:scale-110 transition-transform duration-200`} />
                  <div>
                    <p className="font-medium text-gray-900 group-hover:text-gray-700">{action.title}</p>
                    <p className="text-sm text-gray-600">{action.description}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

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

        {/* Error Display */}
        {(stockError || budgetError) && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mx-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-5 w-5 text-red-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">System Errors</h3>
                <div className="mt-2 text-sm text-red-700">
                  {stockError && <div>• {stockError}</div>}
                  {budgetError && <div>• {budgetError}</div>}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Export Modal */}
        <ExportModal
          isOpen={isExportModalOpen}
          onClose={() => setIsExportModalOpen(false)}
          onExport={handleExport}
          title="Export Dashboard Report"
        />

        {/* GIT ETA Management Modal */}
        <GitEtaManagement
          isOpen={isGitEtaModalOpen}
          onClose={() => setIsGitEtaModalOpen(false)}
        />

        {/* Manager Data View Modal */}
        <ManagerDataView
          isOpen={isManagerDataViewOpen}
          onClose={() => setIsManagerDataViewOpen(false)}
        />

        {/* Admin Stock Management Modal */}
        {user?.role === 'admin' && (
          <AdminStockManagement
            isOpen={isAdminStockModalOpen}
            onClose={() => setIsAdminStockModalOpen(false)}
            items={[]} // We'll get this from global data
          />
        )}

        {/* User Communication Center */}
        {user?.role !== 'admin' && (
          <UserCommunicationCenter
            isOpen={isCommunicationCenterOpen}
            onClose={() => setIsCommunicationCenterOpen(false)}
          />
        )}
      </div>
    </Layout>
  );
};

export default Dashboard;
