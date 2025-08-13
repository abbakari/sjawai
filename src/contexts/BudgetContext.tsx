import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase, isSupabaseConfigured, handleSupabaseError, TABLES } from '../lib/supabase';
import { useAuth } from './AuthContext';

export interface MonthlyBudget {
  month: string;
  budgetValue: number;
  actualValue: number;
  rate: number;
  stock: number;
  git: number;
  discount: number;
}

export interface YearlyBudgetData {
  id: string;
  customer: string;
  item: string;
  category: string;
  brand: string;
  year: string;
  totalBudget: number;
  monthlyData: MonthlyBudget[];
  createdBy: string;
  createdAt: string;
}

export interface BudgetContextType {
  yearlyBudgets: YearlyBudgetData[];
  isLoading: boolean;
  error: string | null;
  addYearlyBudget: (budget: Omit<YearlyBudgetData, 'id' | 'createdAt'>) => Promise<string>;
  updateYearlyBudget: (id: string, budget: Partial<YearlyBudgetData>) => Promise<void>;
  deleteYearlyBudget: (id: string) => Promise<void>;
  getBudgetsByCustomer: (customer: string) => YearlyBudgetData[];
  getBudgetsByYear: (year: string) => YearlyBudgetData[];
  refreshBudgets: () => Promise<void>;
}

const BudgetContext = createContext<BudgetContextType | undefined>(undefined);

export const useBudget = () => {
  const context = useContext(BudgetContext);
  if (context === undefined) {
    throw new Error('useBudget must be used within a BudgetProvider');
  }
  return context;
};

interface BudgetProviderProps {
  children: ReactNode;
}

export const BudgetProvider: React.FC<BudgetProviderProps> = ({ children }) => {
  const [yearlyBudgets, setYearlyBudgets] = useState<YearlyBudgetData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // Convert database row to YearlyBudgetData
  const convertDatabaseToBudget = (budgetRow: any, monthlyRows: any[]): YearlyBudgetData => {
    const monthlyData = monthlyRows.map(row => ({
      month: row.month,
      budgetValue: parseFloat(row.budget_value) || 0,
      actualValue: parseFloat(row.actual_value) || 0,
      rate: parseFloat(row.rate) || 0,
      stock: row.stock || 0,
      git: row.git || 0,
      discount: parseFloat(row.discount) || 0
    }));

    return {
      id: budgetRow.id,
      customer: budgetRow.customer,
      item: budgetRow.item,
      category: budgetRow.category,
      brand: budgetRow.brand,
      year: budgetRow.year,
      totalBudget: parseFloat(budgetRow.total_budget) || 0,
      monthlyData,
      createdBy: budgetRow.created_by,
      createdAt: budgetRow.created_at
    };
  };

  // Load budgets from Supabase
  const loadBudgets = async () => {
    if (!user) {
      setYearlyBudgets([]);
      return;
    }

    if (!isSupabaseConfigured()) {
      // Fallback mode - provide empty data but no error
      setYearlyBudgets([]);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Get yearly budgets with monthly data
      const { data: budgetData, error: budgetError } = await supabase
        .from(TABLES.YEARLY_BUDGETS)
        .select(`
          *,
          monthly_budgets (*)
        `)
        .order('created_at', { ascending: false });

      if (budgetError) {
        throw budgetError;
      }

      const budgets = budgetData?.map(budget => 
        convertDatabaseToBudget(budget, budget.monthly_budgets || [])
      ) || [];

      setYearlyBudgets(budgets);
    } catch (err: any) {
      let errorMessage = 'Failed to load budgets: ';
      if (err?.message) {
        errorMessage += err.message;
      } else if (typeof err === 'string') {
        errorMessage += err;
      } else if (err?.code) {
        errorMessage += `Database error (${err.code}): ${err.details || err.hint || 'Unknown database error'}`;
      } else {
        errorMessage += 'Unknown error occurred';
      }
      setError(errorMessage);
      console.error('Error loading budgets:', err);
      console.error('Error details:', JSON.stringify(err, null, 2));
    } finally {
      setIsLoading(false);
    }
  };

  // Load budgets when user changes
  useEffect(() => {
    if (user) {
      loadBudgets();
    } else {
      setYearlyBudgets([]);
    }
  }, [user]);

  const addYearlyBudget = async (budget: Omit<YearlyBudgetData, 'id' | 'createdAt'>): Promise<string> => {
    if (!user) {
      throw new Error('User must be logged in to create budgets');
    }

    if (!isSupabaseConfigured()) {
      // Fallback for development
      const newBudget: YearlyBudgetData = {
        ...budget,
        id: `budget_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date().toISOString()
      };
      setYearlyBudgets(prev => [...prev, newBudget]);
      return newBudget.id;
    }

    try {
      setError(null);

      // Insert yearly budget
      const { data: budgetData, error: budgetError } = await supabase
        .from(TABLES.YEARLY_BUDGETS)
        .insert({
          customer: budget.customer,
          item: budget.item,
          category: budget.category,
          brand: budget.brand,
          year: budget.year,
          total_budget: budget.totalBudget,
          created_by: user.id
        })
        .select()
        .single();

      if (budgetError) {
        throw budgetError;
      }

      // Insert monthly data
      if (budget.monthlyData && budget.monthlyData.length > 0) {
        const monthlyInserts = budget.monthlyData.map(monthly => ({
          yearly_budget_id: budgetData.id,
          month: monthly.month,
          budget_value: monthly.budgetValue,
          actual_value: monthly.actualValue,
          rate: monthly.rate,
          stock: monthly.stock,
          git: monthly.git,
          discount: monthly.discount
        }));

        const { error: monthlyError } = await supabase
          .from(TABLES.MONTHLY_BUDGETS)
          .insert(monthlyInserts);

        if (monthlyError) {
          throw monthlyError;
        }
      }

      // Refresh the list
      await loadBudgets();
      return budgetData.id;

    } catch (err: any) {
      const errorMessage = `Failed to create budget: ${err?.message || err || 'Unknown error'}`;
      setError(errorMessage);
      handleSupabaseError(err, 'create budget');
      throw new Error(errorMessage);
    }
  };

  const updateYearlyBudget = async (id: string, budgetUpdate: Partial<YearlyBudgetData>): Promise<void> => {
    if (!user) {
      throw new Error('User must be logged in to update budgets');
    }

    if (!isSupabaseConfigured()) {
      // Fallback for development
      setYearlyBudgets(prev => 
        prev.map(b => b.id === id ? { ...b, ...budgetUpdate } : b)
      );
      return;
    }

    try {
      setError(null);

      // Update yearly budget
      const updateData: any = {};
      if (budgetUpdate.customer !== undefined) updateData.customer = budgetUpdate.customer;
      if (budgetUpdate.item !== undefined) updateData.item = budgetUpdate.item;
      if (budgetUpdate.category !== undefined) updateData.category = budgetUpdate.category;
      if (budgetUpdate.brand !== undefined) updateData.brand = budgetUpdate.brand;
      if (budgetUpdate.year !== undefined) updateData.year = budgetUpdate.year;
      if (budgetUpdate.totalBudget !== undefined) updateData.total_budget = budgetUpdate.totalBudget;

      if (Object.keys(updateData).length > 0) {
        const { error: budgetError } = await supabase
          .from(TABLES.YEARLY_BUDGETS)
          .update(updateData)
          .eq('id', id);

        if (budgetError) {
          throw budgetError;
        }
      }

      // Update monthly data if provided
      if (budgetUpdate.monthlyData) {
        // Delete existing monthly data
        await supabase
          .from(TABLES.MONTHLY_BUDGETS)
          .delete()
          .eq('yearly_budget_id', id);

        // Insert new monthly data
        if (budgetUpdate.monthlyData.length > 0) {
          const monthlyInserts = budgetUpdate.monthlyData.map(monthly => ({
            yearly_budget_id: id,
            month: monthly.month,
            budget_value: monthly.budgetValue,
            actual_value: monthly.actualValue,
            rate: monthly.rate,
            stock: monthly.stock,
            git: monthly.git,
            discount: monthly.discount
          }));

          const { error: monthlyError } = await supabase
            .from(TABLES.MONTHLY_BUDGETS)
            .insert(monthlyInserts);

          if (monthlyError) {
            throw monthlyError;
          }
        }
      }

      // Refresh the list
      await loadBudgets();

    } catch (err: any) {
      const errorMessage = `Failed to update budget: ${err?.message || err || 'Unknown error'}`;
      setError(errorMessage);
      handleSupabaseError(err, 'update budget');
      throw new Error(errorMessage);
    }
  };

  const deleteYearlyBudget = async (id: string): Promise<void> => {
    if (!user) {
      throw new Error('User must be logged in to delete budgets');
    }

    if (!isSupabaseConfigured()) {
      // Fallback for development
      setYearlyBudgets(prev => prev.filter(b => b.id !== id));
      return;
    }

    try {
      setError(null);

      // Delete yearly budget (monthly data will be deleted via CASCADE)
      const { error } = await supabase
        .from(TABLES.YEARLY_BUDGETS)
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }

      // Update local state
      setYearlyBudgets(prev => prev.filter(b => b.id !== id));

    } catch (err: any) {
      const errorMessage = `Failed to delete budget: ${err?.message || err || 'Unknown error'}`;
      setError(errorMessage);
      handleSupabaseError(err, 'delete budget');
      throw new Error(errorMessage);
    }
  };

  const getBudgetsByCustomer = (customer: string): YearlyBudgetData[] => {
    return yearlyBudgets.filter(b => 
      b.customer.toLowerCase().includes(customer.toLowerCase())
    );
  };

  const getBudgetsByYear = (year: string): YearlyBudgetData[] => {
    return yearlyBudgets.filter(b => b.year === year);
  };

  const refreshBudgets = async (): Promise<void> => {
    await loadBudgets();
  };

  const value: BudgetContextType = {
    yearlyBudgets,
    isLoading,
    error,
    addYearlyBudget,
    updateYearlyBudget,
    deleteYearlyBudget,
    getBudgetsByCustomer,
    getBudgetsByYear,
    refreshBudgets
  };

  return (
    <BudgetContext.Provider value={value}>
      {children}
    </BudgetContext.Provider>
  );
};
