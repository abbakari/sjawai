import { Customer, Item, CustomerItemForecast } from '../types/forecast';

export interface SalesBudgetItem {
  id: number;
  selected: boolean;
  customer: string;
  item: string;
  category: string;
  brand: string;
  itemCombined: string;
  budget2025: number;
  actual2025: number;
  budget2026: number;
  rate: number;
  stock: number;
  git: number;
  budgetValue2026: number;
  discount: number;
  monthlyData: MonthlyBudget[];
}

export interface MonthlyBudget {
  month: string;
  budgetValue: number;
  actualValue: number;
  rate: number;
  stock: number;
  git: number;
  discount: number;
}

export interface BudgetAnalyticsData {
  totalBudget2025: number;
  totalActual2025: number;
  totalBudget2026: number;
  totalStock: number;
  totalGIT: number;
  budgetUtilization: number;
  forecastAccuracy: number;
  variance: number;
  growthRate: number;
  topCustomers: Array<{
    name: string;
    budget: number;
    actual: number;
    variance: number;
  }>;
  topCategories: Array<{
    name: string;
    budget: number;
    actual: number;
    itemCount: number;
  }>;
  monthlyTrends: Array<{
    month: string;
    budget: number;
    actual: number;
    forecast: number;
  }>;
  regionPerformance: Array<{
    region: string;
    budget: number;
    actual: number;
    performance: number;
  }>;
}

export interface ForecastInsight {
  id: string;
  type: 'opportunity' | 'risk' | 'trend' | 'anomaly';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  confidence: number;
  value: number;
  recommendation: string;
  affectedItems: string[];
  timeframe: string;
}

export class BudgetDataIntegration {
  private budgetData: SalesBudgetItem[] = [];
  private forecastData: CustomerItemForecast[] = [];

  setBudgetData(data: SalesBudgetItem[]) {
    this.budgetData = data;
  }

  setForecastData(data: CustomerItemForecast[]) {
    this.forecastData = data;
  }

  getBudgetAnalytics(): BudgetAnalyticsData {
    const totalBudget2025 = this.budgetData.reduce((sum, item) => sum + item.budget2025, 0);
    const totalActual2025 = this.budgetData.reduce((sum, item) => sum + item.actual2025, 0);
    const totalBudget2026 = this.budgetData.reduce((sum, item) => sum + item.budgetValue2026, 0);
    const totalStock = this.budgetData.reduce((sum, item) => sum + item.stock, 0);
    const totalGIT = this.budgetData.reduce((sum, item) => sum + item.git, 0);

    const budgetUtilization = totalBudget2025 > 0 ? (totalActual2025 / totalBudget2025) : 0;
    const variance = totalActual2025 - totalBudget2025;
    const growthRate = totalBudget2025 > 0 ? ((totalBudget2026 - totalBudget2025) / totalBudget2025) * 100 : 0;
    const forecastAccuracy = this.calculateForecastAccuracy();

    // Group by customer
    const customerGroups = this.budgetData.reduce((acc, item) => {
      if (!acc[item.customer]) {
        acc[item.customer] = { budget: 0, actual: 0, items: [] };
      }
      acc[item.customer].budget += item.budget2025;
      acc[item.customer].actual += item.actual2025;
      acc[item.customer].items.push(item);
      return acc;
    }, {} as Record<string, { budget: number; actual: number; items: SalesBudgetItem[] }>);

    const topCustomers = Object.entries(customerGroups)
      .map(([name, data]) => ({
        name,
        budget: data.budget,
        actual: data.actual,
        variance: ((data.actual - data.budget) / data.budget) * 100
      }))
      .sort((a, b) => b.budget - a.budget)
      .slice(0, 10);

    // Group by category
    const categoryGroups = this.budgetData.reduce((acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = { budget: 0, actual: 0, itemCount: 0 };
      }
      acc[item.category].budget += item.budget2025;
      acc[item.category].actual += item.actual2025;
      acc[item.category].itemCount += 1;
      return acc;
    }, {} as Record<string, { budget: number; actual: number; itemCount: number }>);

    const topCategories = Object.entries(categoryGroups)
      .map(([name, data]) => ({
        name,
        budget: data.budget,
        actual: data.actual,
        itemCount: data.itemCount
      }))
      .sort((a, b) => b.budget - a.budget);

    // Monthly trends from budget data
    const monthlyTrends = this.generateMonthlyTrends();

    // Regional performance (simulated from customer data)
    const regionPerformance = this.generateRegionalPerformance();

    return {
      totalBudget2025,
      totalActual2025,
      totalBudget2026,
      totalStock,
      totalGIT,
      budgetUtilization,
      forecastAccuracy,
      variance,
      growthRate,
      topCustomers,
      topCategories,
      monthlyTrends,
      regionPerformance
    };
  }

  generateInsights(): ForecastInsight[] {
    const analytics = this.getBudgetAnalytics();
    const insights: ForecastInsight[] = [];

    // Budget variance insight
    if (Math.abs(analytics.variance) > analytics.totalBudget2025 * 0.1) {
      insights.push({
        id: 'budget_variance',
        type: analytics.variance > 0 ? 'opportunity' : 'risk',
        title: analytics.variance > 0 ? 'Budget Overperformance' : 'Budget Underperformance',
        description: `Actual sales are ${Math.abs(analytics.variance / analytics.totalBudget2025 * 100).toFixed(1)}% ${analytics.variance > 0 ? 'above' : 'below'} budget target`,
        impact: Math.abs(analytics.variance) > analytics.totalBudget2025 * 0.2 ? 'high' : 'medium',
        confidence: 0.95,
        value: Math.abs(analytics.variance),
        recommendation: analytics.variance > 0 
          ? 'Consider increasing budget allocation for high-performing categories'
          : 'Review underperforming items and adjust strategies',
        affectedItems: analytics.topCustomers.slice(0, 3).map(c => c.name),
        timeframe: 'Current Period'
      });
    }

    // Growth opportunity insight
    if (analytics.growthRate > 15) {
      insights.push({
        id: 'growth_opportunity',
        type: 'opportunity',
        title: 'Strong Growth Forecast',
        description: `Budget growth of ${analytics.growthRate.toFixed(1)}% projected for next year`,
        impact: 'high',
        confidence: 0.88,
        value: analytics.totalBudget2026 - analytics.totalBudget2025,
        recommendation: 'Prepare for increased inventory and resource allocation',
        affectedItems: analytics.topCategories.slice(0, 2).map(c => c.name),
        timeframe: '2026 Planning'
      });
    }

    // Stock risk insight
    const lowStockItems = this.budgetData.filter(item => item.stock < 50);
    if (lowStockItems.length > 0) {
      insights.push({
        id: 'stock_risk',
        type: 'risk',
        title: 'Low Stock Alert',
        description: `${lowStockItems.length} items have stock levels below 50 units`,
        impact: 'medium',
        confidence: 0.92,
        value: lowStockItems.reduce((sum, item) => sum + item.budget2025, 0),
        recommendation: 'Prioritize replenishment for critical items',
        affectedItems: lowStockItems.slice(0, 5).map(item => item.item),
        timeframe: 'Immediate'
      });
    }

    // Category performance insight
    const bestCategory = analytics.topCategories[0];
    if (bestCategory && bestCategory.actual > bestCategory.budget * 1.1) {
      insights.push({
        id: 'category_performance',
        type: 'opportunity',
        title: `${bestCategory.name} Category Outperforming`,
        description: `${bestCategory.name} exceeded budget by ${((bestCategory.actual - bestCategory.budget) / bestCategory.budget * 100).toFixed(1)}%`,
        impact: 'high',
        confidence: 0.90,
        value: bestCategory.actual - bestCategory.budget,
        recommendation: `Increase investment in ${bestCategory.name} category`,
        affectedItems: [bestCategory.name],
        timeframe: 'Next Quarter'
      });
    }

    // Forecast accuracy insight
    if (analytics.forecastAccuracy < 0.85) {
      insights.push({
        id: 'forecast_accuracy',
        type: 'risk',
        title: 'Forecast Accuracy Below Target',
        description: `Current forecast accuracy is ${(analytics.forecastAccuracy * 100).toFixed(1)}%, below the 85% target`,
        impact: 'medium',
        confidence: 0.87,
        value: 0.85 - analytics.forecastAccuracy,
        recommendation: 'Review forecasting methodology and add more data points',
        affectedItems: ['Forecasting Model'],
        timeframe: 'Next Review Cycle'
      });
    }

    return insights;
  }

  private calculateForecastAccuracy(): number {
    if (this.budgetData.length === 0) return 0.94;
    
    let totalAccuracy = 0;
    let count = 0;

    this.budgetData.forEach(item => {
      if (item.budget2025 > 0 && item.actual2025 > 0) {
        const accuracy = 1 - Math.abs(item.actual2025 - item.budget2025) / item.budget2025;
        totalAccuracy += Math.max(0, accuracy);
        count++;
      }
    });

    return count > 0 ? totalAccuracy / count : 0.94;
  }

  private generateMonthlyTrends() {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    return months.map((month, index) => {
      const monthlyBudget = this.budgetData.reduce((sum, item) => {
        const monthData = item.monthlyData.find(m => m.month === month);
        return sum + (monthData?.budgetValue || 0);
      }, 0);

      const monthlyActual = this.budgetData.reduce((sum, item) => {
        const monthData = item.monthlyData.find(m => m.month === month);
        return sum + (monthData?.actualValue || 0);
      }, 0);

      // Generate forecast based on trend
      const seasonalMultiplier = [0.9, 0.85, 0.95, 1.0, 1.05, 1.1, 1.15, 1.2, 1.1, 1.05, 1.25, 1.4][index];
      const baseForecast = monthlyBudget || (this.getBudgetAnalytics().totalBudget2025 / 12);
      const forecast = baseForecast * seasonalMultiplier;

      return {
        month,
        budget: monthlyBudget || baseForecast,
        actual: monthlyActual || baseForecast * (0.85 + Math.random() * 0.3),
        forecast
      };
    });
  }

  private generateRegionalPerformance() {
    const regions = ['North America', 'Europe', 'Asia Pacific', 'Latin America'];
    const analytics = this.getBudgetAnalytics();
    
    return regions.map((region, index) => {
      const multiplier = [0.4, 0.3, 0.2, 0.1][index];
      const budget = analytics.totalBudget2025 * multiplier;
      const actual = budget * (0.8 + Math.random() * 0.4);
      
      return {
        region,
        budget,
        actual,
        performance: (actual / budget) * 100
      };
    });
  }

  exportBudgetData() {
    return {
      budgetItems: this.budgetData,
      analytics: this.getBudgetAnalytics(),
      insights: this.generateInsights(),
      exportDate: new Date().toISOString()
    };
  }

  importBudgetData(data: any) {
    if (data.budgetItems && Array.isArray(data.budgetItems)) {
      this.setBudgetData(data.budgetItems);
      return true;
    }
    return false;
  }

  // Convert budget data to forecast format
  convertToForecastData(): CustomerItemForecast[] {
    return this.budgetData.map(item => ({
      id: `forecast_${item.id}`,
      customerId: item.customer,
      itemId: item.item,
      customer: {
        id: item.customer,
        name: item.customer,
        code: `CUST_${item.id}`,
        email: `${item.customer.toLowerCase().replace(/\s+/g, '')}@company.com`,
        phone: '+1-555-0100',
        region: this.getRegionFromCustomer(item.customer),
        segment: 'Enterprise',
        creditLimit: item.budget2025 * 2,
        currency: 'USD',
        active: true,
        createdAt: new Date().toISOString(),
        lastActivity: new Date().toISOString(),
        channels: ['Direct Sales'],
        seasonality: 'medium',
        tier: 'gold',
        manager: 'Sales Manager'
      } as Customer,
      item: {
        id: item.item,
        sku: item.item.substring(0, 10),
        name: item.item,
        category: item.category,
        brand: item.brand,
        unitPrice: item.rate,
        costPrice: item.rate * 0.7,
        currency: 'USD',
        unit: 'piece',
        active: true,
        description: item.item,
        seasonal: false,
        minOrderQuantity: 1,
        leadTime: 7,
        supplier: item.brand
      } as Item,
      monthlyForecasts: item.monthlyData.map((month, index) => ({
        month: month.month,
        year: 2026,
        monthIndex: index,
        quantity: month.budgetValue,
        unitPrice: month.rate,
        totalValue: month.budgetValue * month.rate,
        notes: ''
      })),
      yearlyTotal: item.budgetValue2026,
      yearlyBudgetImpact: item.budgetValue2026,
      monthlyBudgetImpact: item.monthlyData.reduce((acc, month) => {
        acc[month.month] = month.budgetValue * month.rate;
        return acc;
      }, {} as { [month: string]: number }),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'budget_system',
      status: 'approved',
      confidence: 'high',
      notes: `Converted from budget item: ${item.item}`
    }));
  }

  private getRegionFromCustomer(customer: string): string {
    if (customer.toLowerCase().includes('tz') || customer.toLowerCase().includes('africa')) return 'Africa';
    if (customer.toLowerCase().includes('usa') || customer.toLowerCase().includes('america')) return 'North America';
    if (customer.toLowerCase().includes('eu') || customer.toLowerCase().includes('europe')) return 'Europe';
    if (customer.toLowerCase().includes('asia') || customer.toLowerCase().includes('pacific')) return 'Asia Pacific';
    return 'Global';
  }
}

export const budgetDataIntegration = new BudgetDataIntegration();
