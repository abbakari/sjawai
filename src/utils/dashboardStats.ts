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

  // Return minimal stats since data is now empty
  switch (user.role) {
    case 'admin':
      return {
        totalBudget: 0,
        totalSales: 0,
        totalForecast: 0,
        totalUnits: 0,
        budgetUtilization: 0,
        salesGrowth: 0,
        forecastAccuracy: 0,
        activeUsers: 4
      };

    case 'salesman':
      return {
        totalBudget: 0,
        totalSales: 0,
        totalForecast: 0,
        totalUnits: 0,
        budgetUtilization: 0,
        salesGrowth: 0,
        forecastAccuracy: 0,
        activeUsers: 1
      };

    case 'manager':
      return {
        totalBudget: 0,
        totalSales: 0,
        totalForecast: 0,
        totalUnits: 0,
        budgetUtilization: 0,
        salesGrowth: 0,
        forecastAccuracy: 0,
        activeUsers: 1
      };

    case 'supply_chain':
      return {
        totalBudget: 0,
        totalSales: 0,
        totalForecast: 0,
        totalUnits: 0,
        budgetUtilization: 0,
        salesGrowth: 0,
        forecastAccuracy: 0,
        activeUsers: 1
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
