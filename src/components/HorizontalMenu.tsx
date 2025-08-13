import React from 'react';
import { Home, TrendingUp, BarChart3, Users, Package, Database, Activity } from 'lucide-react';
import { useLocation, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types/auth';

const HorizontalMenu: React.FC = () => {
  const location = useLocation();
  const { user } = useAuth();

  const allMenuItems = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: Home,
      allowedRoles: ['admin', 'salesman', 'manager', 'supply_chain'] as UserRole[],
    },
    {
      name: 'Sales Budget',
      href: '/sales-budget',
      icon: TrendingUp,
      allowedRoles: ['admin', 'salesman', 'manager'] as UserRole[],
    },
    {
      name: 'Rolling Forecast',
      href: '/rolling-forecast',
      icon: BarChart3,
      allowedRoles: ['admin', 'salesman', 'manager'] as UserRole[],
    },
    {
      name: 'Inventory Management',
      href: '/inventory-management',
      icon: Package,
      allowedRoles: ['admin', 'supply_chain'] as UserRole[],
    },
    {
      name: 'Distribution Management',
      href: '/distribution-management',
      icon: Package,
      allowedRoles: ['admin', 'supply_chain', 'manager'] as UserRole[],
    },
    {
      name: 'BI Dashboard',
      href: '/bi-dashboard',
      icon: Activity,
      allowedRoles: ['admin', 'manager', 'salesman'] as UserRole[],
    },
    {
      name: 'Data Sources',
      href: '/data-sources',
      icon: Database,
      allowedRoles: ['admin', 'manager'] as UserRole[],
    },
    {
      name: 'User Management',
      href: '/user-management',
      icon: Users,
      allowedRoles: ['admin'] as UserRole[],
    },
  ];

  // Filter menu items based on user role
  const menuItems = allMenuItems.filter(item => 
    item.allowedRoles.includes(user?.role as UserRole)
  );

  if (!user) return null;

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            {menuItems.map((item) => {
              const IconComponent = item.icon;
              const isActive = location.pathname === item.href;
              
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`inline-flex items-center px-4 py-2 border-b-2 text-sm font-medium transition-colors ${
                    isActive
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <IconComponent className="w-4 h-4 mr-2" />
                  {item.name}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default HorizontalMenu;
