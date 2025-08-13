export interface Customer {
  id: string;
  name: string;
  code: string;
  email: string;
  phone: string;
  region: string;
  segment: string;
  creditLimit: number;
  currency: string;
  active: boolean;
  createdAt: string;
  lastActivity: string;
  channels: string[];
  seasonality: 'high' | 'medium' | 'low';
  tier: 'platinum' | 'gold' | 'silver' | 'bronze';
  manager: string;
}

export interface Item {
  id: string;
  sku: string;
  name: string;
  category: string;
  brand: string;
  unitPrice: number;
  costPrice: number;
  currency: string;
  unit: string;
  active: boolean;
  description?: string;
  seasonal: boolean;
  seasonalMonths?: string[];
  minOrderQuantity: number;
  leadTime: number;
  supplier: string;
}

export interface MonthlyForecast {
  month: string;
  year: number;
  monthIndex: number; // 0-11 for Jan-Dec
  quantity: number;
  unitPrice: number;
  totalValue: number;
  notes?: string;
}

export interface CustomerItemForecast {
  id: string;
  customerId: string;
  itemId: string;
  customer: Customer;
  item: Item;
  monthlyForecasts: MonthlyForecast[];
  yearlyTotal: number;
  yearlyBudgetImpact: number;
  monthlyBudgetImpact: { [month: string]: number };
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  status: 'draft' | 'submitted' | 'approved' | 'revised';
  confidence: 'low' | 'medium' | 'high';
  notes?: string;
}

export interface ForecastSummary {
  customerId: string;
  customerName: string;
  totalItems: number;
  totalYearlyValue: number;
  totalMonthlyValues: { [month: string]: number };
  lastUpdated: string;
  status: 'draft' | 'submitted' | 'approved' | 'revised';
}

export interface BudgetImpact {
  month: string;
  year: number;
  originalBudget: number;
  forecastImpact: number;
  newProjectedBudget: number;
  variance: number;
  variancePercentage: number;
}

export interface FilterOptions {
  customers: string[];
  regions: string[];
  segments: string[];
  categories: string[];
  brands: string[];
  channels: string[];
  years: number[];
  confidence: ('low' | 'medium' | 'high')[];
  status: ('draft' | 'submitted' | 'approved' | 'revised')[];
}

export interface ForecastFormData {
  customerId: string;
  itemId: string;
  forecasts: {
    [month: string]: {
      quantity: number;
      unitPrice: number;
      notes?: string;
    };
  };
  confidence: 'low' | 'medium' | 'high';
  notes?: string;
}

export interface BudgetHistory {
  year: number;
  totalBudget: number;
  actualSpent: number;
  forecastAccuracy: number;
  monthlyData: {
    [month: string]: {
      budget: number;
      actual: number;
      forecast: number;
    };
  };
  variance: number;
  variancePercentage: number;
  status: 'completed' | 'in-progress' | 'planned';
}

export interface YearlyForecastSummary {
  year: number;
  totalForecast: number;
  totalBudget: number;
  customerCount: number;
  itemCount: number;
  forecastCount: number;
  avgConfidence: number;
  topCustomers: {
    customerId: string;
    customerName: string;
    forecastValue: number;
  }[];
  topCategories: {
    category: string;
    forecastValue: number;
    itemCount: number;
  }[];
}

export interface CustomerAnalytics {
  customerId: string;
  totalForecast: number;
  monthlyBreakdown: { [month: string]: number };
  categoryBreakdown: { [category: string]: number };
  channelBreakdown: { [channel: string]: number };
  growthRate: number;
  seasonalTrends: {
    month: string;
    averageValue: number;
    trend: 'up' | 'down' | 'stable';
  }[];
  riskScore: number;
  confidenceScore: number;
}
