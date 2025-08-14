// Dynamic Year Management Utilities
// Provides consistent year handling across all components

/**
 * Generate available years from 2021 to current year + 5
 */
export const generateAvailableYears = (): string[] => {
  const currentYear = new Date().getFullYear();
  const years = [];
  for (let year = 2021; year <= currentYear + 5; year++) {
    years.push(year.toString());
  }
  return years;
};

/**
 * Get current year as string
 */
export const getCurrentYear = (): string => {
  return new Date().getFullYear().toString();
};

/**
 * Get next year as string
 */
export const getNextYear = (): string => {
  return (new Date().getFullYear() + 1).toString();
};

/**
 * Helper function to get year value from dynamic data structure
 */
export const getYearValue = (
  item: any, 
  year: string, 
  type: 'budget' | 'actual' | 'value'
): number => {
  if (!item) return 0;
  
  switch (type) {
    case 'budget':
      return item.yearlyBudgets?.[year] || 
             item.yearly_budgets?.[year] || 
             (year === '2025' ? item.budget2025 || item.budget_2025 || item.bud25 || 0 : 
              year === '2026' ? item.budget2026 || item.budget_2026 || 0 : 0);
              
    case 'actual':
      return item.yearlyActuals?.[year] || 
             item.yearly_actuals?.[year] || 
             (year === '2025' ? item.actual2025 || item.actual_2025 || item.ytd25 || 0 : 0);
             
    case 'value':
      return item.yearlyValues?.[year] || 
             item.yearly_values?.[year] || 
             (year === '2026' ? item.budgetValue2026 || item.budgetValue_2026 || 0 : 
              item.yearlyBudgets?.[year] || item.yearly_budgets?.[year] || 0);
              
    default:
      return 0;
  }
};

/**
 * Set year value in dynamic data structure
 */
export const setYearValue = (
  item: any,
  year: string,
  type: 'budget' | 'actual' | 'value',
  value: number
): any => {
  const updatedItem = { ...item };
  
  // Initialize dynamic structures if they don't exist
  if (!updatedItem.yearlyBudgets) updatedItem.yearlyBudgets = {};
  if (!updatedItem.yearlyActuals) updatedItem.yearlyActuals = {};
  if (!updatedItem.yearlyValues) updatedItem.yearlyValues = {};
  
  switch (type) {
    case 'budget':
      updatedItem.yearlyBudgets[year] = value;
      // Legacy compatibility
      if (year === '2025') {
        updatedItem.budget2025 = value;
        updatedItem.budget_2025 = value;
        updatedItem.bud25 = value;
      } else if (year === '2026') {
        updatedItem.budget2026 = value;
        updatedItem.budget_2026 = value;
      }
      break;
      
    case 'actual':
      updatedItem.yearlyActuals[year] = value;
      // Legacy compatibility
      if (year === '2025') {
        updatedItem.actual2025 = value;
        updatedItem.actual_2025 = value;
        updatedItem.ytd25 = value;
      }
      break;
      
    case 'value':
      updatedItem.yearlyValues[year] = value;
      // Legacy compatibility
      if (year === '2026') {
        updatedItem.budgetValue2026 = value;
        updatedItem.budgetValue_2026 = value;
      }
      break;
  }
  
  return updatedItem;
};

/**
 * Create sample yearly data for testing/initialization
 */
export const createSampleYearlyData = (
  baseBudget: number, 
  baseActual: number,
  baseYear: string = '2025'
): {
  yearlyBudgets: { [year: string]: number };
  yearlyActuals: { [year: string]: number };
  yearlyValues: { [year: string]: number };
} => {
  const yearlyBudgets: { [year: string]: number } = {};
  const yearlyActuals: { [year: string]: number } = {};
  const yearlyValues: { [year: string]: number } = {};
  
  const baseYearNum = parseInt(baseYear);
  const currentYear = new Date().getFullYear();
  const availableYears = generateAvailableYears();
  
  availableYears.forEach(year => {
    const yearNum = parseInt(year);
    const yearDiff = yearNum - baseYearNum;
    
    if (yearNum <= currentYear) {
      // Historical and current year data
      yearlyBudgets[year] = Math.round(baseBudget * Math.pow(1.1, yearDiff)); // 10% growth per year
      yearlyActuals[year] = Math.round(baseActual * Math.pow(1.08, yearDiff)); // 8% actual growth
      yearlyValues[year] = yearlyBudgets[year];
    } else {
      // Future year data (budgets only)
      yearlyBudgets[year] = Math.round(baseBudget * Math.pow(1.12, yearDiff)); // 12% projected growth
      yearlyActuals[year] = 0;
      yearlyValues[year] = yearlyBudgets[year];
    }
  });
  
  return { yearlyBudgets, yearlyActuals, yearlyValues };
};

/**
 * Transform legacy data structure to dynamic year structure
 */
export const transformLegacyToYearly = (item: any): any => {
  const yearlyBudgets: { [year: string]: number } = {};
  const yearlyActuals: { [year: string]: number } = {};
  const yearlyValues: { [year: string]: number } = {};
  
  // Populate from legacy fields if available
  if (item.budget2025 !== undefined || item.budget_2025 !== undefined || item.bud25 !== undefined) {
    yearlyBudgets['2025'] = item.budget2025 || item.budget_2025 || item.bud25 || 0;
  }
  if (item.actual2025 !== undefined || item.actual_2025 !== undefined || item.ytd25 !== undefined) {
    yearlyActuals['2025'] = item.actual2025 || item.actual_2025 || item.ytd25 || 0;
  }
  if (item.budget2026 !== undefined || item.budget_2026 !== undefined) {
    yearlyBudgets['2026'] = item.budget2026 || item.budget_2026 || 0;
  }
  if (item.budgetValue2026 !== undefined || item.budgetValue_2026 !== undefined) {
    yearlyValues['2026'] = item.budgetValue2026 || item.budgetValue_2026 || 0;
  }
  
  // Merge with existing yearly data if any
  if (item.yearlyBudgets) Object.assign(yearlyBudgets, item.yearlyBudgets);
  if (item.yearlyActuals) Object.assign(yearlyActuals, item.yearlyActuals);
  if (item.yearlyValues) Object.assign(yearlyValues, item.yearlyValues);
  if (item.yearly_budgets) Object.assign(yearlyBudgets, item.yearly_budgets);
  if (item.yearly_actuals) Object.assign(yearlyActuals, item.yearly_actuals);
  if (item.yearly_values) Object.assign(yearlyValues, item.yearly_values);
  
  return {
    ...item,
    yearlyBudgets,
    yearlyActuals,
    yearlyValues
  };
};

/**
 * Get default year selections for components
 */
export const getDefaultYearSelection = (): {
  baseYear: string;
  targetYear: string;
} => {
  const currentYear = getCurrentYear();
  const nextYear = getNextYear();
  
  return {
    baseYear: currentYear,
    targetYear: nextYear
  };
};
