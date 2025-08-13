// Seasonal distribution utilities for budget allocation
// Higher quantities in January, decreasing towards November-December

export interface SeasonalDistribution {
  month: string;
  percentage: number;
  value: number;
}

export interface DistributionPattern {
  name: string;
  description: string;
  distribution: { [month: string]: number };
}

// Predefined seasonal distribution patterns
export const SEASONAL_PATTERNS: DistributionPattern[] = [
  {
    name: 'Default Seasonal',
    description: 'Higher quantities in non-holiday months (Jan-Apr), reduced in holiday months (Nov-Dec)',
    distribution: {
      'JAN': 0.135, // 13.5% - Highest (New Year recovery, no major holidays)
      'FEB': 0.125, // 12.5% - High (No major holidays)
      'MAR': 0.115, // 11.5% - High (No major holidays)
      'APR': 0.110, // 11% - High (Easter varies, generally business-focused)
      'MAY': 0.095, // 9.5% - Good business month
      'JUN': 0.085, // 8.5% - Some vacation season starts
      'JUL': 0.080, // 8% - Summer vacation period
      'AUG': 0.075, // 7.5% - Late summer, back-to-business
      'SEP': 0.080, // 8% - Back to business after summer
      'OCT': 0.070, // 7% - Pre-holiday preparation
      'NOV': 0.045, // 4.5% - Many holidays (Thanksgiving, etc.)
      'DEC': 0.035  // 3.5% - Lowest (Christmas, New Year holidays)
    }
  },
  {
    name: 'Strong Seasonal',
    description: 'Very pronounced holiday-aware distribution',
    distribution: {
      'JAN': 0.16, // 16% - Much higher (Post-holiday business surge)
      'FEB': 0.14, // 14% - High (No holidays, full business)
      'MAR': 0.13, // 13% - High (Spring business season)
      'APR': 0.12, // 12% - High (Pre-summer business)
      'MAY': 0.10, // 10% - Good business month
      'JUN': 0.08, // 8% - Early vacation season
      'JUL': 0.07, // 7% - Summer slowdown
      'AUG': 0.06, // 6% - Late summer
      'SEP': 0.07, // 7% - Back to business
      'OCT': 0.06, // 6% - Pre-holiday preparation
      'NOV': 0.03, // 3% - Heavy holiday period
      'DEC': 0.02  // 2% - Christmas/New Year shutdown
    }
  },
  {
    name: 'Moderate Seasonal',
    description: 'Gentle holiday-aware distribution',
    distribution: {
      'JAN': 0.115, // 11.5% - Higher (New Year business)
      'FEB': 0.105, // 10.5% - Higher (No holidays)
      'MAR': 0.100, // 10% - Good business month
      'APR': 0.095, // 9.5% - Spring business
      'MAY': 0.090, // 9% - Good month
      'JUN': 0.085, // 8.5% - Early summer
      'JUL': 0.080, // 8% - Summer period
      'AUG': 0.075, // 7.5% - Late summer
      'SEP': 0.080, // 8% - Back to business
      'OCT': 0.075, // 7.5% - Pre-holidays
      'NOV': 0.060, // 6% - Holiday period
      'DEC': 0.055   // 5.5% - Christmas period
    }
  },
  {
    name: 'Q1 Heavy',
    description: 'Front-loaded for Q1 non-holiday months, minimal holiday allocation',
    distribution: {
      'JAN': 0.18, // 18% - Very high (Post-holiday surge)
      'FEB': 0.16, // 16% - Very high (No holidays)
      'MAR': 0.14, // 14% - High (Spring preparation)
      'APR': 0.08, // 8% - Moderate
      'MAY': 0.08, // 8% - Moderate
      'JUN': 0.07, // 7% - Early summer
      'JUL': 0.06, // 6% - Summer slowdown
      'AUG': 0.06, // 6% - Late summer
      'SEP': 0.07, // 7% - Back to business
      'OCT': 0.06, // 6% - Pre-holidays
      'NOV': 0.03, // 3% - Holiday period
      'DEC': 0.02  // 2% - Christmas shutdown
    }
  },
  {
    name: 'Holiday Aware',
    description: 'Maximum business focus during non-holiday periods',
    distribution: {
      'JAN': 0.145, // 14.5% - Peak business (Post-holiday recovery)
      'FEB': 0.135, // 13.5% - Peak business (No holidays)
      'MAR': 0.125, // 12.5% - High business (Spring season)
      'APR': 0.115, // 11.5% - High business (Pre-summer)
      'MAY': 0.105, // 10.5% - Good business month
      'JUN': 0.090, // 9% - Early vacation impact
      'JUL': 0.075, // 7.5% - Summer vacation period
      'AUG': 0.070, // 7% - Late summer
      'SEP': 0.085, // 8.5% - Back-to-business month
      'OCT': 0.065, // 6.5% - Pre-holiday preparation
      'NOV': 0.040, // 4% - Thanksgiving & holidays
      'DEC': 0.030  // 3% - Christmas & New Year period
    }
  }
];

/**
 * Apply seasonal distribution to a total quantity
 * @param totalQuantity - Total quantity to distribute
 * @param pattern - Distribution pattern to use (defaults to 'Default Seasonal')
 * @returns Array of monthly distributions
 */
export const applySeasonalDistribution = (
  totalQuantity: number,
  pattern: string = 'Default Seasonal'
): SeasonalDistribution[] => {
  const selectedPattern = SEASONAL_PATTERNS.find(p => p.name === pattern) || SEASONAL_PATTERNS[0];
  const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
  
  let distributedTotal = 0;
  const distributions: SeasonalDistribution[] = [];
  
  // Calculate base values for each month
  months.forEach((month, index) => {
    const percentage = selectedPattern.distribution[month];
    let value = Math.round(totalQuantity * percentage);
    
    // Track the distributed total
    distributedTotal += value;
    
    distributions.push({
      month,
      percentage,
      value
    });
  });
  
  // Adjust for rounding errors - add/subtract difference to January (highest month)
  const difference = totalQuantity - distributedTotal;
  if (difference !== 0) {
    distributions[0].value += difference; // Adjust January
  }
  
  return distributions;
};

/**
 * Convert seasonal distribution to monthly budget format
 * @param distributions - Seasonal distributions
 * @param rate - Unit rate for value calculation
 * @param stock - Stock quantity for each month
 * @param git - GIT quantity for each month
 * @returns Monthly budget data array
 */
export const convertToMonthlyBudget = (
  distributions: SeasonalDistribution[],
  rate: number = 100,
  stock: number = 0,
  git: number = 0
) => {
  return distributions.map(dist => ({
    month: dist.month,
    budgetValue: dist.value,
    actualValue: 0,
    rate,
    stock: Math.floor(stock / 12), // Distribute stock evenly
    git: Math.floor(git / 12), // Distribute GIT evenly
    discount: 0
  }));
};

/**
 * Get pattern by name
 * @param patternName - Name of the pattern
 * @returns Distribution pattern or default pattern
 */
export const getPatternByName = (patternName: string): DistributionPattern => {
  return SEASONAL_PATTERNS.find(p => p.name === patternName) || SEASONAL_PATTERNS[0];
};

/**
 * Validate if distribution percentages add up to 100%
 * @param pattern - Distribution pattern to validate
 * @returns Validation result
 */
export const validateDistribution = (pattern: DistributionPattern): { valid: boolean; total: number } => {
  const total = Object.values(pattern.distribution).reduce((sum, value) => sum + value, 0);
  return {
    valid: Math.abs(total - 1.0) < 0.001, // Allow for small floating point differences
    total: Math.round(total * 100) / 100
  };
};

/**
 * Create custom distribution pattern
 * @param name - Pattern name
 * @param description - Pattern description  
 * @param monthlyPercentages - Object with month percentages
 * @returns Custom distribution pattern
 */
export const createCustomPattern = (
  name: string,
  description: string,
  monthlyPercentages: { [month: string]: number }
): DistributionPattern => {
  return {
    name,
    description,
    distribution: monthlyPercentages
  };
};

/**
 * Get seasonal factor for a specific month (for display)
 * @param month - Month to get factor for
 * @param pattern - Pattern to use
 * @returns Seasonal factor (1.0 = average, >1.0 = above average, <1.0 = below average)
 */
export const getSeasonalFactor = (month: string, pattern: string = 'Default Seasonal'): number => {
  const selectedPattern = getPatternByName(pattern);
  const monthlyPercentage = selectedPattern.distribution[month.toUpperCase()] || 0;
  return monthlyPercentage * 12; // Convert to factor (average would be 1.0)
};
