import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
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

  // Load budgets from local storage
  const loadBudgets = async () => {
    if (!user) {
      setYearlyBudgets([]);
      return;
    }

    try {
      const savedBudgets = localStorage.getItem('yearly_budgets');
      if (savedBudgets) {
        const budgets = JSON.parse(savedBudgets);
        setYearlyBudgets(budgets);
      } else {
        setYearlyBudgets([]);
      }
      setError(null);
    } catch (err: any) {
      console.error('Error loading budgets from localStorage:', err);
      setYearlyBudgets([]);
      setError('Failed to load budgets from local storage');
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

    try {
      setError(null);

      const newBudget: YearlyBudgetData = {
        ...budget,
        id: `budget_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date().toISOString()
      };

      const updatedBudgets = [...yearlyBudgets, newBudget];
      setYearlyBudgets(updatedBudgets);
      localStorage.setItem('yearly_budgets', JSON.stringify(updatedBudgets));

      return newBudget.id;
    } catch (err: any) {
      const errorMessage = `Failed to create budget: ${err?.message || err || 'Unknown error'}`;
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const updateYearlyBudget = async (id: string, budgetUpdate: Partial<YearlyBudgetData>): Promise<void> => {
    if (!user) {
      throw new Error('User must be logged in to update budgets');
    }

    try {
      setError(null);

      const updatedBudgets = yearlyBudgets.map(b =>
        b.id === id ? { ...b, ...budgetUpdate } : b
      );

      setYearlyBudgets(updatedBudgets);
      localStorage.setItem('yearly_budgets', JSON.stringify(updatedBudgets));
    } catch (err: any) {
      const errorMessage = `Failed to update budget: ${err?.message || err || 'Unknown error'}`;
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const deleteYearlyBudget = async (id: string): Promise<void> => {
    if (!user) {
      throw new Error('User must be logged in to delete budgets');
    }

    try {
      setError(null);

      const updatedBudgets = yearlyBudgets.filter(b => b.id !== id);
      setYearlyBudgets(updatedBudgets);
      localStorage.setItem('yearly_budgets', JSON.stringify(updatedBudgets));
    } catch (err: any) {
      const errorMessage = `Failed to delete budget: ${err?.message || err || 'Unknown error'}`;
      setError(errorMessage);
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
