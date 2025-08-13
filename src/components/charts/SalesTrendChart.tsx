import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface SalesTrendChartProps {
  data: Array<{
    month: string;
    sales: number;
    budget: number;
    forecast: number;
  }>;
}

const SalesTrendChart: React.FC<SalesTrendChartProps> = ({ data }) => {
  const formatCurrency = (value: number) => {
    return `$${(value / 1000).toFixed(0)}k`;
  };

  return (
    <div className="w-full h-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey="month" 
            stroke="#6b7280"
            fontSize={12}
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
          <Line 
            type="monotone" 
            dataKey="sales" 
            stroke="#3b82f6" 
            strokeWidth={3}
            dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
            name="Actual Sales"
          />
          <Line 
            type="monotone" 
            dataKey="budget" 
            stroke="#10b981" 
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
            name="Budget"
          />
          <Line 
            type="monotone" 
            dataKey="forecast" 
            stroke="#f59e0b" 
            strokeWidth={2}
            dot={{ fill: '#f59e0b', strokeWidth: 2, r: 4 }}
            name="Forecast"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SalesTrendChart;
