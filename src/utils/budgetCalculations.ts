import { MonthlyForecast, BudgetImpact, CustomerItemForecast, BudgetHistory, YearlyForecastSummary, CustomerAnalytics } from '../types/forecast';

// Budget targets by year (example data - would come from database)
const BUDGET_TARGETS_BY_YEAR: { [year: number]: { [month: string]: number } } = {
  2021: {
    'Jan': 120000, 'Feb': 125000, 'Mar': 130000, 'Apr': 128000, 'May': 135000, 'Jun': 140000,
    'Jul': 145000, 'Aug': 148000, 'Sep': 142000, 'Oct': 145000, 'Nov': 155000, 'Dec': 170000
  },
  2022: {
    'Jan': 130000, 'Feb': 135000, 'Mar': 140000, 'Apr': 138000, 'May': 145000, 'Jun': 150000,
    'Jul': 155000, 'Aug': 158000, 'Sep': 152000, 'Oct': 155000, 'Nov': 165000, 'Dec': 180000
  },
  2023: {
    'Jan': 140000, 'Feb': 145000, 'Mar': 150000, 'Apr': 148000, 'May': 155000, 'Jun': 160000,
    'Jul': 165000, 'Aug': 168000, 'Sep': 162000, 'Oct': 165000, 'Nov': 175000, 'Dec': 190000
  },
  2024: {
    'Jan': 150000, 'Feb': 160000, 'Mar': 170000, 'Apr': 165000, 'May': 175000, 'Jun': 180000,
    'Jul': 185000, 'Aug': 190000, 'Sep': 175000, 'Oct': 180000, 'Nov': 200000, 'Dec': 220000
  },
  2025: {
    'Jan': 160000, 'Feb': 170000, 'Mar': 180000, 'Apr': 175000, 'May': 185000, 'Jun': 190000,
    'Jul': 195000, 'Aug': 200000, 'Sep': 185000, 'Oct': 190000, 'Nov': 210000, 'Dec': 230000
  }
};

const getYearlyBudgetTarget = (year: number): number => {
  const monthlyTargets = BUDGET_TARGETS_BY_YEAR[year];
  return monthlyTargets ? Object.values(monthlyTargets).reduce((sum, budget) => sum + budget, 0) : 0;
};

const getMonthlyBudgetTarget = (month: string, year: number): number => {
  return BUDGET_TARGETS_BY_YEAR[year]?.[month] || 0;
};

export const calculateMonthlyBudgetImpact = (
  monthlyForecasts: MonthlyForecast[]
): { [month: string]: number } => {
  const monthlyImpacts: { [month: string]: number } = {};
  
  monthlyForecasts.forEach(forecast => {
    const month = forecast.month;
    if (!monthlyImpacts[month]) {
      monthlyImpacts[month] = 0;
    }
    monthlyImpacts[month] += forecast.totalValue;
  });
  
  return monthlyImpacts;
};

export const calculateYearlyBudgetImpact = (
  customerForecasts: CustomerItemForecast[]
): number => {
  return customerForecasts.reduce((total, forecast) => {
    return total + forecast.yearlyTotal;
  }, 0);
};

export const calculateBudgetVariance = (
  forecastValue: number,
  budgetTarget: number
): { variance: number; variancePercentage: number } => {
  const variance = forecastValue - budgetTarget;
  const variancePercentage = budgetTarget !== 0 ? (variance / budgetTarget) * 100 : 0;
  
  return { variance, variancePercentage };
};

export const getBudgetImpactAnalysis = (
  customerForecasts: CustomerItemForecast[],
  year: number = new Date().getFullYear()
): {
  monthly: BudgetImpact[];
  yearly: BudgetImpact;
  summary: {
    totalForecast: number;
    totalBudget: number;
    overallVariance: number;
    overallVariancePercentage: number;
    monthsOverBudget: number;
    monthsUnderBudget: number;
  };
} => {
  // Calculate monthly impacts
  const monthlyTotals: { [month: string]: number } = {};
  
  customerForecasts.forEach(forecast => {
    forecast.monthlyForecasts.forEach(monthlyForecast => {
      const month = monthlyForecast.month;
      if (!monthlyTotals[month]) {
        monthlyTotals[month] = 0;
      }
      monthlyTotals[month] += monthlyForecast.totalValue;
    });
  });
  
  // Create monthly budget impact analysis
  const monthlyTargets = BUDGET_TARGETS_BY_YEAR[year] || {};
  const monthlyImpacts: BudgetImpact[] = Object.keys(monthlyTargets).map(month => {
    const forecastValue = monthlyTotals[month] || 0;
    const budgetTarget = getMonthlyBudgetTarget(month, year);
    const { variance, variancePercentage } = calculateBudgetVariance(forecastValue, budgetTarget);

    return {
      month,
      year,
      originalBudget: budgetTarget,
      forecastImpact: forecastValue,
      newProjectedBudget: budgetTarget + variance,
      variance,
      variancePercentage
    };
  });
  
  // Calculate yearly impact
  const totalForecast = calculateYearlyBudgetImpact(customerForecasts);
  const yearlyBudgetTarget = getYearlyBudgetTarget(year);
  const { variance: yearlyVariance, variancePercentage: yearlyVariancePercentage } =
    calculateBudgetVariance(totalForecast, yearlyBudgetTarget);

  const yearlyImpact: BudgetImpact = {
    month: 'YEARLY',
    year,
    originalBudget: yearlyBudgetTarget,
    forecastImpact: totalForecast,
    newProjectedBudget: yearlyBudgetTarget + yearlyVariance,
    variance: yearlyVariance,
    variancePercentage: yearlyVariancePercentage
  };
  
  // Calculate summary statistics
  const monthsOverBudget = monthlyImpacts.filter(impact => impact.variance > 0).length;
  const monthsUnderBudget = monthlyImpacts.filter(impact => impact.variance < 0).length;
  
  return {
    monthly: monthlyImpacts,
    yearly: yearlyImpact,
    summary: {
      totalForecast,
      totalBudget: yearlyBudgetTarget,
      overallVariance: yearlyVariance,
      overallVariancePercentage: yearlyVariancePercentage,
      monthsOverBudget,
      monthsUnderBudget
    }
  };
};

export const formatCurrency = (amount: number, currency: string = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

export const formatPercentage = (percentage: number): string => {
  return `${percentage >= 0 ? '+' : ''}${percentage.toFixed(1)}%`;
};

export const getVarianceColor = (variance: number): string => {
  if (variance > 0) return 'text-red-600 bg-red-50';
  if (variance < 0) return 'text-green-600 bg-green-50';
  return 'text-gray-600 bg-gray-50';
};

export const getConfidenceColor = (confidence: string): string => {
  switch (confidence) {
    case 'high': return 'bg-green-100 text-green-800';
    case 'medium': return 'bg-yellow-100 text-yellow-800';
    case 'low': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

// Get current year remaining months for forecast
export const getRemainingMonths = (): string[] => {
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return months.slice(currentMonth);
};

// Convert month name to number (0-11)
export const getMonthNumber = (monthName: string): number => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return months.indexOf(monthName);
};

// Check if a month is in the future
export const isMonthInFuture = (monthName: string, year: number = new Date().getFullYear()): boolean => {
  const currentDate = new Date();
  const monthIndex = getMonthNumber(monthName);
  const monthDate = new Date(year, monthIndex, 1);
  return monthDate >= new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
};

// Generate budget history data
export const generateBudgetHistory = (): BudgetHistory[] => {
  const years = [2021, 2022, 2023, 2024];

  return years.map(year => {
    const monthlyTargets = BUDGET_TARGETS_BY_YEAR[year] || {};
    const totalBudget = Object.values(monthlyTargets).reduce((sum, budget) => sum + budget, 0);

    // Simulate actual spending (would come from real data)
    const actualSpent = totalBudget * (0.85 + Math.random() * 0.3); // 85-115% of budget
    const forecastAccuracy = 80 + Math.random() * 20; // 80-100% accuracy

    const monthlyData: { [month: string]: { budget: number; actual: number; forecast: number } } = {};
    Object.keys(monthlyTargets).forEach(month => {
      const budget = monthlyTargets[month];
      const actual = budget * (0.85 + Math.random() * 0.3);
      const forecast = budget * (0.9 + Math.random() * 0.2);

      monthlyData[month] = { budget, actual, forecast };
    });

    const variance = actualSpent - totalBudget;
    const variancePercentage = totalBudget !== 0 ? (variance / totalBudget) * 100 : 0;

    return {
      year,
      totalBudget,
      actualSpent,
      forecastAccuracy,
      monthlyData,
      variance,
      variancePercentage,
      status: year < new Date().getFullYear() ? 'completed' : 'in-progress'
    };
  });
};

// Generate yearly forecast summary
export const generateYearlyForecastSummary = (
  customerForecasts: CustomerItemForecast[],
  customers: any[],
  year: number = new Date().getFullYear()
): YearlyForecastSummary => {
  const yearForecasts = customerForecasts.filter(f =>
    f.monthlyForecasts.some(mf => mf.year === year)
  );

  const totalForecast = yearForecasts.reduce((sum, f) => sum + f.yearlyTotal, 0);
  const totalBudget = getYearlyBudgetTarget(year);

  // Calculate top customers
  const customerTotals: { [customerId: string]: number } = {};
  yearForecasts.forEach(forecast => {
    if (!customerTotals[forecast.customerId]) {
      customerTotals[forecast.customerId] = 0;
    }
    customerTotals[forecast.customerId] += forecast.yearlyTotal;
  });

  const topCustomers = Object.entries(customerTotals)
    .map(([customerId, value]) => {
      const customer = customers.find(c => c.id === customerId);
      return {
        customerId,
        customerName: customer?.name || 'Unknown',
        forecastValue: value
      };
    })
    .sort((a, b) => b.forecastValue - a.forecastValue)
    .slice(0, 5);

  // Calculate top categories
  const categoryTotals: { [category: string]: { value: number; count: number } } = {};
  yearForecasts.forEach(forecast => {
    const category = forecast.item.category;
    if (!categoryTotals[category]) {
      categoryTotals[category] = { value: 0, count: 0 };
    }
    categoryTotals[category].value += forecast.yearlyTotal;
    categoryTotals[category].count += 1;
  });

  const topCategories = Object.entries(categoryTotals)
    .map(([category, data]) => ({
      category,
      forecastValue: data.value,
      itemCount: data.count
    }))
    .sort((a, b) => b.forecastValue - a.forecastValue)
    .slice(0, 5);

  // Calculate average confidence
  const avgConfidence = yearForecasts.length > 0 ?
    yearForecasts.reduce((sum, f) => {
      const confidenceValue = f.confidence === 'high' ? 3 : f.confidence === 'medium' ? 2 : 1;
      return sum + confidenceValue;
    }, 0) / yearForecasts.length * 33.33 : 0;

  return {
    year,
    totalForecast,
    totalBudget,
    customerCount: new Set(yearForecasts.map(f => f.customerId)).size,
    itemCount: new Set(yearForecasts.map(f => f.itemId)).size,
    forecastCount: yearForecasts.length,
    avgConfidence: Math.round(avgConfidence),
    topCustomers,
    topCategories
  };
};

// Generate customer analytics
export const generateCustomerAnalytics = (
  customerId: string,
  customerForecasts: CustomerItemForecast[]
): CustomerAnalytics => {
  const customerData = customerForecasts.filter(f => f.customerId === customerId);
  const totalForecast = customerData.reduce((sum, f) => sum + f.yearlyTotal, 0);

  // Monthly breakdown
  const monthlyBreakdown: { [month: string]: number } = {};
  customerData.forEach(forecast => {
    forecast.monthlyForecasts.forEach(mf => {
      if (!monthlyBreakdown[mf.month]) {
        monthlyBreakdown[mf.month] = 0;
      }
      monthlyBreakdown[mf.month] += mf.totalValue;
    });
  });

  // Category breakdown
  const categoryBreakdown: { [category: string]: number } = {};
  customerData.forEach(forecast => {
    const category = forecast.item.category;
    if (!categoryBreakdown[category]) {
      categoryBreakdown[category] = 0;
    }
    categoryBreakdown[category] += forecast.yearlyTotal;
  });

  // Channel breakdown (simulated)
  const channelBreakdown = {
    'Direct Sales': totalForecast * 0.4,
    'Online': totalForecast * 0.3,
    'Retail Partners': totalForecast * 0.2,
    'Distributors': totalForecast * 0.1
  };

  // Calculate seasonal trends
  const seasonalTrends = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    .map(month => {
      const averageValue = monthlyBreakdown[month] || 0;
      const prevMonthIndex = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].indexOf(month);
      const prevMonth = ['Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov'][prevMonthIndex];
      const prevValue = monthlyBreakdown[prevMonth] || 0;

      let trend: 'up' | 'down' | 'stable' = 'stable';
      if (averageValue > prevValue * 1.05) trend = 'up';
      else if (averageValue < prevValue * 0.95) trend = 'down';

      return { month, averageValue, trend };
    });

  // Calculate growth rate (simulated)
  const growthRate = 5 + Math.random() * 15; // 5-20% growth

  // Calculate risk and confidence scores
  const confidenceScore = customerData.length > 0 ?
    customerData.reduce((sum, f) => {
      const confidenceValue = f.confidence === 'high' ? 3 : f.confidence === 'medium' ? 2 : 1;
      return sum + confidenceValue;
    }, 0) / customerData.length * 33.33 : 0;

  const riskScore = Math.max(0, 100 - confidenceScore - (growthRate * 2));

  return {
    customerId,
    totalForecast,
    monthlyBreakdown,
    categoryBreakdown,
    channelBreakdown,
    growthRate,
    seasonalTrends,
    riskScore: Math.round(riskScore),
    confidenceScore: Math.round(confidenceScore)
  };
};

// Get available years for selection
export const getAvailableYears = (): number[] => {
  return Object.keys(BUDGET_TARGETS_BY_YEAR).map(year => parseInt(year)).sort();
};
