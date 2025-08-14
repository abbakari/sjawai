import { apiService } from '../lib/api';

export interface SalesBudgetItem {
  id: number;
  selected?: boolean;
  customer: string;
  item: string;
  category: string;
  brand: string;
  itemCombined?: string;
  // Dynamic year data structure
  yearly_budgets?: { [year: string]: number };
  yearly_actuals?: { [year: string]: number };
  yearly_values?: { [year: string]: number };
  rate: number;
  stock: number;
  git: number;
  discount: number;
  monthly_data: MonthlyBudget[];
  created_by?: number;
  created_at?: string;
  updated_at?: string;

  // Legacy compatibility fields
  budget_2025?: number;
  actual_2025?: number;
  budget_2026?: number;
  budgetValue2026?: number;
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

export class SalesBudgetService {
  async getAllBudgets(): Promise<SalesBudgetItem[]> {
    try {
      const response = await apiService.getBudgets();
      if (response.data && response.data.results) {
        return response.data.results.map(this.transformBackendToFrontend);
      }
      throw new Error('No budget data received');
    } catch (error) {
      console.error('Failed to fetch budgets from API:', error);
      throw error;
    }
  }

  async createBudget(budgetData: Partial<SalesBudgetItem>): Promise<SalesBudgetItem> {
    try {
      const backendData = this.transformFrontendToBackend(budgetData);
      const response = await apiService.createBudget(backendData);
      if (response.data) {
        return this.transformBackendToFrontend(response.data);
      }
      throw new Error('Failed to create budget');
    } catch (error) {
      console.error('Failed to create budget:', error);
      throw error;
    }
  }

  async updateBudget(id: number, budgetData: Partial<SalesBudgetItem>): Promise<SalesBudgetItem> {
    try {
      const backendData = this.transformFrontendToBackend(budgetData);
      const response = await apiService.updateBudget(id, backendData);
      if (response.data) {
        return this.transformBackendToFrontend(response.data);
      }
      throw new Error('Failed to update budget');
    } catch (error) {
      console.error('Failed to update budget:', error);
      throw error;
    }
  }

  async deleteBudget(id: number): Promise<boolean> {
    try {
      const response = await apiService.deleteBudget(id);
      return !response.error;
    } catch (error) {
      console.error('Failed to delete budget:', error);
      throw error;
    }
  }

  async saveMonthlyData(budgetId: number, monthlyData: MonthlyBudget[]): Promise<SalesBudgetItem> {
    try {
      // Calculate derived values
      const budget2026 = monthlyData.reduce((sum, month) => sum + month.budgetValue, 0);
      const totalDiscount = monthlyData.reduce((sum, month) => sum + month.discount, 0);
      
      const updateData = {
        monthly_data: monthlyData,
        budget_2026: budget2026,
        discount: totalDiscount
      };

      return await this.updateBudget(budgetId, updateData);
    } catch (error) {
      console.error('Failed to save monthly data:', error);
      throw error;
    }
  }

  private transformBackendToFrontend(backendItem: any): SalesBudgetItem {
    // Create dynamic year data structure
    const yearly_budgets: { [year: string]: number } = {};
    const yearly_actuals: { [year: string]: number } = {};
    const yearly_values: { [year: string]: number } = {};

    // Populate from backend dynamic fields if available
    if (backendItem.yearly_budgets) {
      Object.assign(yearly_budgets, backendItem.yearly_budgets);
    }
    if (backendItem.yearly_actuals) {
      Object.assign(yearly_actuals, backendItem.yearly_actuals);
    }
    if (backendItem.yearly_values) {
      Object.assign(yearly_values, backendItem.yearly_values);
    }

    // Legacy compatibility - populate from specific fields
    if (backendItem.budget_2025 !== undefined) yearly_budgets['2025'] = backendItem.budget_2025;
    if (backendItem.actual_2025 !== undefined) yearly_actuals['2025'] = backendItem.actual_2025;
    if (backendItem.budget_2026 !== undefined) yearly_budgets['2026'] = backendItem.budget_2026;

    return {
      id: backendItem.id,
      selected: false,
      customer: backendItem.customer,
      item: backendItem.item,
      category: backendItem.category,
      brand: backendItem.brand,
      itemCombined: backendItem.itemCombined || `${backendItem.item} (${backendItem.category} - ${backendItem.brand})`,
      yearly_budgets,
      yearly_actuals,
      yearly_values,
      rate: backendItem.rate || 0,
      stock: backendItem.stock || 0,
      git: backendItem.git || 0,
      budgetValue2026: backendItem.budgetValue2026 || ((backendItem.budget_2026 || 0) * (backendItem.rate || 1)),
      discount: backendItem.discount || 0,
      monthly_data: Array.isArray(backendItem.monthly_data) ? backendItem.monthly_data : [],
      created_by: backendItem.created_by,
      created_at: backendItem.created_at,
      updated_at: backendItem.updated_at,
      // Legacy compatibility fields
      budget_2025: backendItem.budget_2025 || 0,
      actual_2025: backendItem.actual_2025 || 0,
      budget_2026: backendItem.budget_2026 || 0
    };
  }

  private transformFrontendToBackend(frontendItem: Partial<SalesBudgetItem>): any {
    return {
      customer: frontendItem.customer || '',
      item: frontendItem.item || '',
      category: frontendItem.category || '',
      brand: frontendItem.brand || '',
      year: new Date().getFullYear().toString(), // Default to current year
      // Dynamic year data
      yearly_budgets: frontendItem.yearly_budgets || {},
      yearly_actuals: frontendItem.yearly_actuals || {},
      yearly_values: frontendItem.yearly_values || {},
      // Legacy compatibility fields
      budget_2025: frontendItem.budget_2025 || frontendItem.yearly_budgets?.['2025'] || 0,
      actual_2025: frontendItem.actual_2025 || frontendItem.yearly_actuals?.['2025'] || 0,
      budget_2026: frontendItem.budget_2026 || frontendItem.yearly_budgets?.['2026'] || 0,
      rate: frontendItem.rate || 0,
      stock: frontendItem.stock || 0,
      git: frontendItem.git || 0,
      discount: frontendItem.discount || 0,
      monthly_data: frontendItem.monthly_data || []
    };
  }
}

export const salesBudgetService = new SalesBudgetService();
