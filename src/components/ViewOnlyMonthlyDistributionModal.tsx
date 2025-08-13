import React from 'react';
import { X, Calendar, TrendingUp, Package, DollarSign } from 'lucide-react';

interface MonthlyDistribution {
  month: string;
  budgetValue: number;
  actualValue: number;
  rate: number;
  stock: number;
  git: number;
  discount: number;
}

interface ViewOnlyMonthlyDistributionModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: {
    customer: string;
    item: string;
    category: string;
    brand: string;
    monthlyData: MonthlyDistribution[];
    totalBudget: number;
    totalActual: number;
    totalUnits: number;
    createdBy: string;
    lastModified: string;
  } | null;
  type: 'sales_budget' | 'rolling_forecast';
}

const ViewOnlyMonthlyDistributionModal: React.FC<ViewOnlyMonthlyDistributionModalProps> = ({
  isOpen,
  onClose,
  data,
  type
}) => {
  if (!isOpen || !data) return null;

  const calculateSummaryStats = () => {
    if (!data.monthlyData) return { totalValue: 0, avgMonthly: 0, maxMonth: 0, minMonth: 0 };
    
    const totalValue = data.monthlyData.reduce((sum, month) => sum + (month.budgetValue * month.rate), 0);
    const avgMonthly = totalValue / 12;
    const monthlyValues = data.monthlyData.map(month => month.budgetValue * month.rate);
    const maxMonth = Math.max(...monthlyValues);
    const minMonth = Math.min(...monthlyValues);
    
    return { totalValue, avgMonthly, maxMonth, minMonth };
  };

  const stats = calculateSummaryStats();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[95vh] overflow-hidden">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Calendar className="w-6 h-6 text-blue-600" />
                Monthly Distribution - {type === 'sales_budget' ? 'Sales Budget' : 'Rolling Forecast'} (View Only)
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Customer: <span className="font-medium">{data.customer}</span> | 
                Item: <span className="font-medium">{data.item}</span>
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(95vh-140px)]">
          {/* Item Information */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-3">Item Information</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-blue-700 font-medium">Category:</span>
                <p className="text-blue-900">{data.category}</p>
              </div>
              <div>
                <span className="text-blue-700 font-medium">Brand:</span>
                <p className="text-blue-900">{data.brand}</p>
              </div>
              <div>
                <span className="text-blue-700 font-medium">Created By:</span>
                <p className="text-blue-900">{data.createdBy}</p>
              </div>
              <div>
                <span className="text-blue-700 font-medium">Last Modified:</span>
                <p className="text-blue-900">{new Date(data.lastModified).toLocaleDateString()}</p>
              </div>
            </div>
          </div>

          {/* Summary Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium text-green-800">Total Value</span>
              </div>
              <p className="text-xl font-bold text-green-900">${stats.totalValue.toLocaleString()}</p>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">Avg Monthly</span>
              </div>
              <p className="text-xl font-bold text-blue-900">${stats.avgMonthly.toLocaleString()}</p>
            </div>
            
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Package className="w-5 h-5 text-purple-600" />
                <span className="text-sm font-medium text-purple-800">Total Units</span>
              </div>
              <p className="text-xl font-bold text-purple-900">{data.totalUnits.toLocaleString()}</p>
            </div>
            
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-5 h-5 text-orange-600" />
                <span className="text-sm font-medium text-orange-800">Peak Month</span>
              </div>
              <p className="text-xl font-bold text-orange-900">${stats.maxMonth.toLocaleString()}</p>
            </div>
          </div>

          {/* Monthly Data Table */}
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Monthly Distribution Details</h3>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Month</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Units</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Rate</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Value</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Stock</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">GIT</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Discount</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Net Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {data.monthlyData.map((month, index) => {
                    const monthValue = month.budgetValue * month.rate;
                    const netValue = monthValue - month.discount;
                    
                    return (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium text-gray-900">{month.month}</td>
                        <td className="px-4 py-3 text-center text-gray-900">{month.budgetValue.toLocaleString()}</td>
                        <td className="px-4 py-3 text-center text-gray-900">${month.rate}</td>
                        <td className="px-4 py-3 text-center font-medium text-green-600">${monthValue.toLocaleString()}</td>
                        <td className="px-4 py-3 text-center text-gray-900">{month.stock}</td>
                        <td className="px-4 py-3 text-center text-blue-600">{month.git}</td>
                        <td className="px-4 py-3 text-center text-red-600">${month.discount.toLocaleString()}</td>
                        <td className="px-4 py-3 text-center font-bold text-green-700">${netValue.toLocaleString()}</td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot className="bg-gray-50">
                  <tr className="font-bold">
                    <td className="px-4 py-3 text-gray-900">TOTAL</td>
                    <td className="px-4 py-3 text-center text-gray-900">
                      {data.monthlyData.reduce((sum, month) => sum + month.budgetValue, 0).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-center text-gray-900">-</td>
                    <td className="px-4 py-3 text-center text-green-600">
                      ${data.monthlyData.reduce((sum, month) => sum + (month.budgetValue * month.rate), 0).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-center text-gray-900">
                      {data.monthlyData.reduce((sum, month) => sum + month.stock, 0).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-center text-blue-600">
                      {data.monthlyData.reduce((sum, month) => sum + month.git, 0).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-center text-red-600">
                      ${data.monthlyData.reduce((sum, month) => sum + month.discount, 0).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-center text-green-700">
                      ${data.monthlyData.reduce((sum, month) => sum + ((month.budgetValue * month.rate) - month.discount), 0).toLocaleString()}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Manager Notice */}
          <div className="mt-6 bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-purple-600 text-lg">👑</span>
              <span className="text-sm font-medium text-purple-800">Manager View</span>
            </div>
            <p className="text-sm text-purple-700">
              This is a view-only display of monthly distribution data created by the salesman. 
              To make changes, please contact the salesman who created this data or use the Approval Center.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4">
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewOnlyMonthlyDistributionModal;
