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
    description: 'Higher quantities in Jan-Feb, decreasing to Nov-Dec',
    distribution: {
      'JAN': 0.12, // 12% - Highest
      'FEB': 0.11, // 11% - Second highest
      'MAR': 0.10, // 10%
      'APR': 0.095, // 9.5%
      'MAY': 0.09, // 9%
      'JUN': 0.085, // 8.5%
      'JUL': 0.08, // 8%
      'AUG': 0.075, // 7.5%
      'SEP': 0.07, // 7%
      'OCT': 0.065, // 6.5%
      'NOV': 0.06, // 6% - Second lowest
      'DEC': 0.055  // 5.5% - Lowest
    }
  },
  {
    name: 'Strong Seasonal',
    description: 'More pronounced seasonal effect',
    distribution: {
      'JAN': 0.15, // 15% - Much higher
      'FEB': 0.13, // 13%
      'MAR': 0.11, // 11%
      'APR': 0.10, // 10%
      'MAY': 0.09, // 9%
      'JUN': 0.08, // 8%
      'JUL': 0.07, // 7%
      'AUG': 0.06, // 6%
      'SEP': 0.055, // 5.5%
      'OCT': 0.05, // 5%
      'NOV': 0.04, // 4%
      'DEC': 0.035  // 3.5% - Much lower
    }
  },
  {
    name: 'Moderate Seasonal',
    description: 'Gentle seasonal decline',
    distribution: {
      'JAN': 0.105, // 10.5%
      'FEB': 0.10, // 10%
      'MAR': 0.095, // 9.5%
      'APR': 0.09, // 9%
      'MAY': 0.085, // 8.5%
      'JUN': 0.08, // 8%
      'JUL': 0.075, // 7.5%
      'AUG': 0.07, // 7%
      'SEP': 0.075, // 7.5%
      'OCT': 0.08, // 8%
      'NOV': 0.075, // 7.5%
      'DEC': 0.07   // 7%
    }
  },
  {
    name: 'Q1 Heavy',
    description: 'Front-loaded for Q1, then even distribution',
    distribution: {
      'JAN': 0.15, // 15%
      'FEB': 0.13, // 13%
      'MAR': 0.12, // 12%
      'APR': 0.067, // 6.7% (even for remaining 9 months)
      'MAY': 0.067,
      'JUN': 0.067,
      'JUL': 0.067,
      'AUG': 0.067,
      'SEP': 0.067,
      'OCT': 0.067,
      'NOV': 0.067,
      'DEC': 0.067
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
