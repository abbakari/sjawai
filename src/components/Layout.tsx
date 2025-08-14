import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Home,
  BarChart3,
  TrendingUp,
  Users,
  Settings,
  Database,
  Package,
  Truck,
  LogOut,
  Menu,
  X,
  User,
  CheckCircle,
  Clock,
  AlertCircle,
  Monitor
} from 'lucide-react';
import { useAuth, hasPermission, canAccessDashboard, getUserRoleName } from '../contexts/AuthContext';
import { UserRole } from '../types/auth';
import Navbar from './Navbar';
import PasswordModal from './PasswordModal';
import ApiStatus from './ApiStatus';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  if (!user) {
    return <div>Please log in to access the application.</div>;
  }

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Role-based navigation items
  const getNavigationItems = () => {
    const baseItems = [
      {
        name: 'Dashboard',
        href: '/dashboard',
        icon: Home,
        roles: ['admin', 'salesman', 'manager', 'supply_chain']
      }
    ];

    const roleSpecificItems = {
      salesman: [
        {
          name: 'Sales Budget',
          href: '/sales-budget',
          icon: BarChart3,
          roles: ['salesman']
        },
        {
          name: 'Rolling Forecast',
          href: '/rolling-forecast',
          icon: TrendingUp,
          roles: ['salesman']
        }
      ],
      manager: [
        {
          name: 'Sales Budget',
          href: '/sales-budget',
          icon: BarChart3,
          roles: ['manager']
        },
        {
          name: 'Rolling Forecast',
          href: '/rolling-forecast',
          icon: TrendingUp,
          roles: ['manager']
        },
        {
          name: 'Approval Center',
          href: '/approval-center',
          icon: CheckCircle,
          roles: ['manager']
        }
      ],
      supply_chain: [
        {
          name: 'Inventory Management',
          href: '/inventory-management',
          icon: Package,
          roles: ['supply_chain']
        },
        {
          name: 'Distribution Management',
          href: '/distribution-management',
          icon: Truck,
          roles: ['supply_chain']
        }
      ],
      admin: [
        {
          name: 'Sales Budget',
          href: '/sales-budget',
          icon: BarChart3,
          roles: ['admin']
        },
        {
          name: 'Rolling Forecast',
          href: '/rolling-forecast',
          icon: TrendingUp,
          roles: ['admin']
        },
        {
          name: 'User Management',
          href: '/user-management',
          icon: Users,
          roles: ['admin']
        },
        {
          name: 'Data Sources',
          href: '/data-sources',
          icon: Database,
          roles: ['admin']
        },
        {
          name: 'Advanced Admin Control',
          href: '/advanced-admin',
          icon: Settings,
          roles: ['admin']
        },
        {
          name: 'Admin Inventory Control',
          href: '/admin-inventory',
          icon: Monitor,
          roles: ['admin']
        },
        {
          name: 'Inventory Management',
          href: '/inventory-management',
          icon: Package,
          roles: ['admin']
        },
        {
          name: 'Distribution Management',
          href: '/distribution-management',
          icon: Truck,
          roles: ['admin']
        },
        {
          name: 'BI Dashboard',
          href: '/bi-dashboard',
          icon: BarChart3,
          roles: ['admin']
        }
      ]
    };

    return [
      ...baseItems,
      ...(roleSpecificItems[user.role] || [])
    ];
  };

  const navigationItems = getNavigationItems();
  const isSalesman = user.role === 'salesman';

  // Horizontal Navigation Component for Salesmen
  const HorizontalNavigation = () => (
    <div className="bg-white shadow-sm border-b border-gray-200">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-8 overflow-x-auto">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center space-x-2 py-4 px-2 border-b-2 font-medium text-sm whitespace-nowrap ${
                  isActive
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );

  if (isSalesman) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Navigation Header with Moving Words */}
        <Navbar onPasswordModalOpen={() => setShowPasswordModal(true)} />
        
        {/* Spacer for fixed navbar */}
        <div className="h-28"></div>
        
        {/* Horizontal Navigation */}
        <HorizontalNavigation />
        
        {/* Main content */}
        <main className="py-6">
          <div className="page-container">
            <div className="content-container">
              {children}
            </div>
          </div>
        </main>

        {/* Password Modal */}
        <PasswordModal
          isOpen={showPasswordModal}
          onClose={() => setShowPasswordModal(false)}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Header with Moving Words */}
      <Navbar onPasswordModalOpen={() => setShowPasswordModal(true)} />
      
      {/* Spacer for fixed navbar */}
      <div className="h-28"></div>

      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 flex w-64 flex-col bg-white">
          <div className="flex h-16 items-center justify-between px-4">
            <h1 className="text-lg font-semibold text-gray-900">STMBudget</h1>
            <button onClick={() => setSidebarOpen(false)}>
              <X className="h-6 w-6 text-gray-400" />
            </button>
          </div>
          <nav className="flex-1 space-y-1 px-2 py-4">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                    isActive
                      ? 'bg-blue-100 text-blue-900'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* API Status Indicator */}
          <div className="px-4 py-2 border-t border-gray-200">
            <ApiStatus />
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col lg:top-24">
        <div className="flex flex-col flex-grow bg-white border-r border-gray-200">
          <div className="flex h-16 items-center px-4">
            <h1 className="text-lg font-semibold text-gray-900">STMBudget</h1>
          </div>
          <nav className="flex-1 space-y-1 px-2 py-4">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                    isActive
                      ? 'bg-blue-100 text-blue-900'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* API Status Indicator */}
          <div className="px-4 py-2 border-t border-gray-200">
            <ApiStatus />
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar for mobile */}
        <div className="sticky top-24 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8 lg:hidden">
          <button
            type="button"
            className="-m-2.5 p-2.5 text-gray-700"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>
          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            <div className="flex flex-1"></div>
            <div className="flex items-center gap-x-4 lg:gap-x-6">
              <div className="flex items-center gap-x-2">
                <User className="h-5 w-5 text-gray-400" />
                <span className="text-sm font-medium text-gray-700">{user.name}</span>
                <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">
                  {getUserRoleName(user.role)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="py-6">
          <div className="page-container">
            <div className="content-container">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
