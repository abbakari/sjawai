import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface BudgetComparisonChartProps {
  data: Array<{
    category: string;
    budget: number;
    actual: number;
    variance: number;
  }>;
}

const BudgetComparisonChart: React.FC<BudgetComparisonChartProps> = ({ data }) => {
  const formatCurrency = (value: number) => {
    return `$${(value / 1000).toFixed(0)}k`;
  };

  return (
    <div className="w-full h-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey="category" 
            stroke="#6b7280"
            fontSize={11}
            angle={-45}
            textAnchor="end"
            height={80}
          />
          <YAxis 
            stroke="#6b7280"
            fontSize={12}
            tickFormatter={formatCurrency}
          />
          <Tooltip 
            formatter={(value: number, name: string) => [formatCurrency(value), name]}
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}
          />
          <Legend />
          <Bar 
            dataKey="budget" 
            fill="#10b981" 
            name="Budget"
            radius={[2, 2, 0, 0]}
          />
          <Bar 
            dataKey="actual" 
            fill="#3b82f6" 
            name="Actual"
            radius={[2, 2, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default BudgetComparisonChart;
