import React from 'react';
import { DivideIcon as LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string;
  subtitle: string;
  icon: LucideIcon;
  color: 'primary' | 'success' | 'info' | 'warning' | 'danger';
  trend?: {
    value: string;
    isPositive: boolean;
  } | null;
}

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  subtitle,
  icon: IconComponent,
  color,
  trend
}) => {
  const getBadgeClasses = (color: string) => {
    switch (color) {
      case 'primary':
        return 'bg-blue-50 text-blue-600';
      case 'success':
        return 'bg-green-50 text-green-600';
      case 'info':
        return 'bg-cyan-50 text-cyan-600';
      case 'warning':
        return 'bg-orange-50 text-orange-600';
      case 'danger':
        return 'bg-red-50 text-red-600';
      default:
        return 'bg-blue-50 text-blue-600';
    }
  };

  return (
    <div className="card bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200">
      <div className="card-body p-6">
        <div className="d-flex justify-content-between flex items-start justify-between">
          <div className="card-info flex-1">
            <p className="card-text text-sm font-medium text-gray-600 mb-2">{title}</p>
            <div className="d-flex align-items-end mb-2 flex items-end space-x-2 mb-2">
              <h4 className="card-title mb-0 me-2 text-2xl font-bold text-gray-900">{value}</h4>
              {trend && (
                <span className={`text-sm font-medium ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                  {trend.value}
                </span>
              )}
            </div>
            <small className="text-xs text-gray-500">{subtitle}</small>
          </div>
          <div className="card-icon">
            <span className={`badge rounded p-3 ${getBadgeClasses(color)}`}>
              <IconComponent className="w-6 h-6" />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsCard;