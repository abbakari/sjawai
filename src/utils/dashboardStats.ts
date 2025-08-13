import { PieChartIcon, TrendingUp, Clock, BarChart3, Target, AlertTriangle, Users, Package, MapPin, Building } from 'lucide-react';
import { UserRole, User } from '../types/auth';

export interface DashboardStats {
  totalBudget: number;
  totalSales: number;
  totalForecast: number;
  totalUnits: number;
  budgetUtilization: number;
  salesGrowth: number;
  forecastAccuracy: number;
  activeUsers: number;
}

export const getDashboardStats = (user: User | null): DashboardStats => {
  if (!user) {
    return {
      totalBudget: 0,
      totalSales: 0,
      totalForecast: 0,
      totalUnits: 0,
      budgetUtilization: 0,
      salesGrowth: 0,
      forecastAccuracy: 0,
      activeUsers: 0
    };
  }

  switch (user.role) {
    case 'admin':
      return {
        totalBudget: 2500000,
        totalSales: 2400000,
        totalForecast: 2600000,
        totalUnits: 15000,
        budgetUtilization: 87,
        salesGrowth: 18.2,
        forecastAccuracy: 94.5,
        activeUsers: 24
      };

    case 'salesman':
      return {
        totalBudget: 156000,
        totalSales: 145000,
        totalForecast: 165000,
        totalUnits: 850,
        budgetUtilization: 92.9,
        salesGrowth: 12.5,
        forecastAccuracy: 94.0,
        activeUsers: 1
      };

    case 'manager':
      return {
        totalBudget: 850000,
        totalSales: 780000,
        totalForecast: 900000,
        totalUnits: 4200,
        budgetUtilization: 91.8,
        salesGrowth: 15.0,
        forecastAccuracy: 96.2,
        activeUsers: 8
      };

    case 'supply_chain':
      return {
        totalBudget: 1200000,
        totalSales: 1100000,
        totalForecast: 1250000,
        totalUnits: 6800,
        budgetUtilization: 91.7,
        salesGrowth: 8.5,
        forecastAccuracy: 97.8,
        activeUsers: 6
      };

    default:
      return {
        totalBudget: 0,
        totalSales: 0,
        totalForecast: 0,
        totalUnits: 0,
        budgetUtilization: 0,
        salesGrowth: 0,
        forecastAccuracy: 0,
        activeUsers: 0
      };
  }
};

export const getRoleSpecificStats = (user: User | null) => {
  if (!user) return {};

  switch (user.role) {
    case 'admin':
      return {
        systemUsers: 24,
        totalDepartments: 8,
        systemUptime: 99.2,
        globalTargets: 15
      };

    case 'salesman':
      return {
        personalTarget: 87,
        remainingBudget: 45000,
        customerCount: 12,
        forecastAccuracy: 94
      };

    case 'manager':
      return {
        teamSize: 8,
        departmentBudget: 245000,
        activeForecasts: 18,
        teamPerformance: 91
      };

    case 'supply_chain':
      return {
        inventoryValue: 1200000,
        stockAccuracy: 98.5,
        ordersProcessed: 1247,
        lowStockItems: 23
      };

    default:
      return {};
  }
};
