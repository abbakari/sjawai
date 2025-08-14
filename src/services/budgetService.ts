import { apiService } from '../lib/api';

export interface BudgetItem {
  id: number;
  customer: string;
  item: string;
  category: string;
  brand: string;
  budget_2025: number;
  actual_2025: number;
  budget_2026: number;
  rate: number;
  stock: number;
  git: number;
  created_at: string;
  updated_at?: string;
}

export interface CreateBudgetData {
  customer: string;
  item: string;
  category: string;
  brand: string;
  budget_2025: number;
  actual_2025: number;
  budget_2026: number;
  rate: number;
  stock: number;
  git: number;
}

export class BudgetService {
  async getAllBudgets(filters?: Record<string, any>) {
    try {
      const response = await apiService.getBudgets(filters);
      if (response.error) {
        console.warn('API error, using fallback data:', response.error);
        return this.getMockBudgets(filters);
      }
      return response.data;
    } catch (error) {
      console.warn('Budget API call failed, using mock data:', error);
      return this.getMockBudgets(filters);
    }
  }

  async createBudget(budgetData: CreateBudgetData) {
    try {
      const response = await apiService.createBudget(budgetData);
      if (response.error) {
        throw new Error(response.error);
      }
      return response.data;
    } catch (error) {
      console.error('Failed to create budget:', error);
      throw error;
    }
  }

  async updateBudget(id: number, budgetData: Partial<CreateBudgetData>) {
    try {
      const response = await apiService.updateBudget(id, budgetData);
      if (response.error) {
        throw new Error(response.error);
      }
      return response.data;
    } catch (error) {
      console.error('Failed to update budget:', error);
      throw error;
    }
  }

  async deleteBudget(id: number) {
    try {
      const response = await apiService.deleteBudget(id);
      if (response.error) {
        throw new Error(response.error);
      }
      return true;
    } catch (error) {
      console.error('Failed to delete budget:', error);
      throw error;
    }
  }

  private getMockBudgets(filters?: Record<string, any>): any {
    // Fallback mock data when API is not available
    return {
      count: 4,
      results: [
        {
          id: 1,
          customer: 'Action Aid International (Tz)',
          item: 'BF GOODRICH TYRE 235/85R16 120/116S TL AT/TA KO2 LRERWLGO',
          category: 'Tyres',
          brand: 'BF Goodrich',
          budget_2025: 1200000,
          actual_2025: 850000,
          budget_2026: 0,
          rate: 341,
          stock: 232,
          git: 0,
          created_at: new Date().toISOString()
        },
        {
          id: 2,
          customer: 'Action Aid International (Tz)',
          item: 'BF GOODRICH TYRE 265/65R17 120/117S TL AT/TA KO2 LRERWLGO',
          category: 'Tyres',
          brand: 'BF Goodrich',
          budget_2025: 980000,
          actual_2025: 720000,
          budget_2026: 0,
          rate: 412,
          stock: 7,
          git: 0,
          created_at: new Date().toISOString()
        },
        {
          id: 3,
          customer: 'Action Aid International (Tz)',
          item: 'VALVE 0214 TR 414J FOR CAR TUBELESS TYRE',
          category: 'Accessories',
          brand: 'Generic',
          budget_2025: 15000,
          actual_2025: 18000,
          budget_2026: 0,
          rate: 0.5,
          stock: 2207,
          git: 0,
          created_at: new Date().toISOString()
        },
        {
          id: 4,
          customer: 'Action Aid International (Tz)',
          item: 'MICHELIN TYRE 265/65R17 112T TL LTX TRAIL',
          category: 'Tyres',
          brand: 'Michelin',
          budget_2025: 875000,
          actual_2025: 920000,
          budget_2026: 0,
          rate: 300,
          stock: 127,
          git: 0,
          created_at: new Date().toISOString()
        }
      ]
    };
  }
}

export const budgetService = new BudgetService();
