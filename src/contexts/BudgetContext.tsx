import React, { createContext, useContext, useState, ReactNode } from 'react';

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
  addYearlyBudget: (budget: Omit<YearlyBudgetData, 'id' | 'createdAt'>) => void;
  updateYearlyBudget: (id: string, budget: Partial<YearlyBudgetData>) => void;
  deleteYearlyBudget: (id: string) => void;
  getBudgetsByCustomer: (customer: string) => YearlyBudgetData[];
  getBudgetsByYear: (year: string) => YearlyBudgetData[];
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

  const addYearlyBudget = (budget: Omit<YearlyBudgetData, 'id' | 'createdAt'>) => {
    const newBudget: YearlyBudgetData = {
      ...budget,
      id: `budget_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString()
    };
    setYearlyBudgets(prev => [...prev, newBudget]);
  };

  const updateYearlyBudget = (id: string, budget: Partial<YearlyBudgetData>) => {
    setYearlyBudgets(prev => 
      prev.map(b => b.id === id ? { ...b, ...budget } : b)
    );
  };

  const deleteYearlyBudget = (id: string) => {
    setYearlyBudgets(prev => prev.filter(b => b.id !== id));
  };

  const getBudgetsByCustomer = (customer: string) => {
    return yearlyBudgets.filter(b => 
      b.customer.toLowerCase().includes(customer.toLowerCase())
    );
  };

  const getBudgetsByYear = (year: string) => {
    return yearlyBudgets.filter(b => b.year === year);
  };

  const value: BudgetContextType = {
    yearlyBudgets,
    addYearlyBudget,
    updateYearlyBudget,
    deleteYearlyBudget,
    getBudgetsByCustomer,
    getBudgetsByYear
  };

  return (
    <BudgetContext.Provider value={value}>
      {children}
    </BudgetContext.Provider>
  );
};
