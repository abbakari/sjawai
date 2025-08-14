import React, { useState, useMemo } from 'react';
import { Edit, Trash2, Eye, MoreVertical, TrendingUp, TrendingDown } from 'lucide-react';

interface BudgetTableProps {
  type: 'overview' | 'products' | 'regions' | 'monthly';
  searchTerm: string;
  period: string;
}

const BudgetTable: React.FC<BudgetTableProps> = ({ type, searchTerm, period }) => {
  const [sortField, setSortField] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Sample data for different table types
  const getTableData = () => {
    switch (type) {
      case 'overview':
        return [
          { id: 1, category: 'Electronics', budget: 450000, actual: 425000, variance: -25000, status: 'Active', progress: 94 },
          { id: 2, category: 'Clothing', budget: 320000, actual: 340000, variance: 20000, status: 'Active', progress: 106 },
          { id: 3, category: 'Home & Garden', budget: 280000, actual: 265000, variance: -15000, status: 'Active', progress: 95 },
          { id: 4, category: 'Sports', budget: 180000, actual: 195000, variance: 15000, status: 'Active', progress: 108 },
          { id: 5, category: 'Books', budget: 120000, actual: 110000, variance: -10000, status: 'Pending', progress: 92 },
        ];
      case 'products':
        return [
          { id: 1, product: 'iPhone 15 Pro', sku: 'IPH15P-256', budget: 85000, actual: 82000, variance: -3000, status: 'Active', region: 'North America' },
          { id: 2, product: 'Samsung Galaxy S24', sku: 'SGS24-128', budget: 65000, actual: 68000, variance: 3000, status: 'Active', region: 'Europe' },
          { id: 3, product: 'MacBook Air M3', sku: 'MBA-M3-512', budget: 95000, actual: 91000, variance: -4000, status: 'Active', region: 'Asia Pacific' },
          { id: 4, product: 'Dell XPS 13', sku: 'DXP13-1TB', budget: 45000, actual: 47000, variance: 2000, status: 'Active', region: 'North America' },
          { id: 5, product: 'Sony WH-1000XM5', sku: 'SWH1000X5', budget: 25000, actual: 23000, variance: -2000, status: 'Pending', region: 'Global' },
        ];
      case 'regions':
        return [
          { id: 1, region: 'North America', budget: 850000, actual: 820000, variance: -30000, status: 'Active', manager: 'John Smith', products: 245 },
          { id: 2, region: 'Europe', budget: 720000, actual: 750000, variance: 30000, status: 'Active', manager: 'Marie Dubois', products: 198 },
          { id: 3, region: 'Asia Pacific', budget: 650000, actual: 635000, variance: -15000, status: 'Active', manager: 'Hiroshi Tanaka', products: 167 },
          { id: 4, region: 'Latin America', budget: 280000, actual: 295000, variance: 15000, status: 'Active', manager: 'Carlos Rodriguez', products: 89 },
          { id: 5, region: 'Middle East & Africa', budget: 180000, actual: 175000, variance: -5000, status: 'Pending', manager: 'Ahmed Hassan', products: 56 },
        ];
      case 'monthly':
        const currentYear = new Date().getFullYear();
        return [
          { id: 1, month: `January ${currentYear}`, budget: 200000, actual: 195000, variance: -5000, status: 'Completed', forecast: 205000 },
          { id: 2, month: `February ${currentYear}`, budget: 220000, actual: 225000, variance: 5000, status: 'Completed', forecast: 230000 },
          { id: 3, month: `March ${currentYear}`, budget: 240000, actual: 235000, variance: -5000, status: 'Completed', forecast: 245000 },
          { id: 4, month: `April ${currentYear}`, budget: 260000, actual: 0, variance: 0, status: 'Pending', forecast: 265000 },
          { id: 5, month: `May ${currentYear}`, budget: 280000, actual: 0, variance: 0, status: 'Pending', forecast: 285000 },
        ];
      default:
        return [];
    }
  };

  const data = getTableData();

  const filteredData = useMemo(() => {
    return data.filter(item => {
      const searchableFields = Object.values(item).join(' ').toLowerCase();
      return searchableFields.includes(searchTerm.toLowerCase());
    });
  }, [data, searchTerm]);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    const statusClasses = {
      'Active': 'bg-green-100 text-green-800',
      'Pending': 'bg-yellow-100 text-yellow-800',
      'Completed': 'bg-blue-100 text-blue-800',
      'Inactive': 'bg-gray-100 text-gray-800',
    };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusClasses[status as keyof typeof statusClasses] || statusClasses.Inactive}`}>
        {status}
      </span>
    );
  };

  const getVarianceIndicator = (variance: number) => {
    if (variance > 0) {
      return <TrendingUp className="w-4 h-4 text-green-600" />;
    } else if (variance < 0) {
      return <TrendingDown className="w-4 h-4 text-red-600" />;
    }
    return null;
  };

  const renderTableHeaders = () => {
    switch (type) {
      case 'overview':
        return (
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Budget</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actual</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Variance</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Progress</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        );
      case 'products':
        return (
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Budget</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actual</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Variance</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Region</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        );
      case 'regions':
        return (
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Region</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Budget</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actual</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Variance</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Manager</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Products</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        );
      case 'monthly':
        return (
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Month</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Budget</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actual</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Variance</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Forecast</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        );
      default:
        return null;
    }
  };

  const renderTableRows = () => {
    return filteredData.map((item: any) => (
      <tr key={item.id} className="hover:bg-gray-50 transition-colors">
        {type === 'overview' && (
          <>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.category}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(item.budget)}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(item.actual)}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm">
              <div className="flex items-center space-x-1">
                {getVarianceIndicator(item.variance)}
                <span className={item.variance >= 0 ? 'text-green-600' : 'text-red-600'}>
                  {formatCurrency(Math.abs(item.variance))}
                </span>
              </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              <div className="flex items-center space-x-2">
                <div className="w-16 bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${item.progress >= 100 ? 'bg-green-600' : 'bg-blue-600'}`}
                    style={{ width: `${Math.min(item.progress, 100)}%` }}
                  ></div>
                </div>
                <span className="text-xs">{item.progress}%</span>
              </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(item.status)}</td>
          </>
        )}
        
        {type === 'products' && (
          <>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.product}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.sku}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(item.budget)}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(item.actual)}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm">
              <div className="flex items-center space-x-1">
                {getVarianceIndicator(item.variance)}
                <span className={item.variance >= 0 ? 'text-green-600' : 'text-red-600'}>
                  {formatCurrency(Math.abs(item.variance))}
                </span>
              </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.region}</td>
            <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(item.status)}</td>
          </>
        )}
        
        {type === 'regions' && (
          <>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.region}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(item.budget)}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(item.actual)}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm">
              <div className="flex items-center space-x-1">
                {getVarianceIndicator(item.variance)}
                <span className={item.variance >= 0 ? 'text-green-600' : 'text-red-600'}>
                  {formatCurrency(Math.abs(item.variance))}
                </span>
              </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.manager}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.products}</td>
            <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(item.status)}</td>
          </>
        )}
        
        {type === 'monthly' && (
          <>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.month}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(item.budget)}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              {item.actual > 0 ? formatCurrency(item.actual) : '-'}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm">
              {item.variance !== 0 ? (
                <div className="flex items-center space-x-1">
                  {getVarianceIndicator(item.variance)}
                  <span className={item.variance >= 0 ? 'text-green-600' : 'text-red-600'}>
                    {formatCurrency(Math.abs(item.variance))}
                  </span>
                </div>
              ) : (
                <span className="text-gray-400">-</span>
              )}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(item.forecast)}</td>
            <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(item.status)}</td>
          </>
        )}
        
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
          <div className="flex items-center space-x-2">
            <button className="text-blue-600 hover:text-blue-900 transition-colors">
              <Eye className="w-4 h-4" />
            </button>
            <button className="text-green-600 hover:text-green-900 transition-colors">
              <Edit className="w-4 h-4" />
            </button>
            <button className="text-red-600 hover:text-red-900 transition-colors">
              <Trash2 className="w-4 h-4" />
            </button>
            <button className="text-gray-600 hover:text-gray-900 transition-colors">
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>
        </td>
      </tr>
    ));
  };

  return (
    <div className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            {renderTableHeaders()}
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {renderTableRows()}
          </tbody>
        </table>
      </div>
      
      {filteredData.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg mb-2">No data found</div>
          <div className="text-gray-400 text-sm">Try adjusting your search criteria</div>
        </div>
      )}
    </div>
  );
};

export default BudgetTable;
