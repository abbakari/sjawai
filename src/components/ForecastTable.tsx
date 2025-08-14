import React, { useState, useMemo } from 'react';
import { Edit, Trash2, Eye, MoreVertical, TrendingUp, TrendingDown, Activity, AlertTriangle } from 'lucide-react';

interface ForecastTableProps {
  type: 'overview' | 'products' | 'customers' | 'scenarios';
  searchTerm: string;
  period: string;
  horizon: string;
}

const ForecastTable: React.FC<ForecastTableProps> = ({ type, searchTerm, period, horizon }) => {
  const [sortField, setSortField] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Sample data for different table types
  const getTableData = () => {
    switch (type) {
      case 'overview':
        return [
          { id: 1, category: 'Electronics', current: 450000, forecast: 520000, variance: 70000, accuracy: 94.2, confidence: 'High', trend: 'up' },
          { id: 2, category: 'Clothing', current: 320000, forecast: 385000, variance: 65000, accuracy: 91.8, confidence: 'High', trend: 'up' },
          { id: 3, category: 'Home & Garden', current: 280000, forecast: 295000, variance: 15000, accuracy: 96.1, confidence: 'High', trend: 'up' },
          { id: 4, category: 'Sports', current: 180000, forecast: 165000, variance: -15000, accuracy: 88.5, confidence: 'Medium', trend: 'down' },
          { id: 5, category: 'Books', current: 120000, forecast: 110000, variance: -10000, accuracy: 92.3, confidence: 'Medium', trend: 'down' },
        ];
      case 'products':
        return [
          { id: 1, product: 'iPhone 15 Pro', sku: 'IPH15P-256', current: 85000, forecast: 95000, variance: 10000, accuracy: 95.1, model: 'ARIMA', lastUpdated: `${new Date().getFullYear()}-01-15` },
          { id: 2, product: 'Samsung Galaxy S24', sku: 'SGS24-128', current: 65000, forecast: 72000, variance: 7000, accuracy: 93.4, model: 'Linear', lastUpdated: `${new Date().getFullYear()}-01-15` },
          { id: 3, product: 'MacBook Air M3', sku: 'MBA-M3-512', current: 95000, forecast: 88000, variance: -7000, accuracy: 91.2, model: 'Neural', lastUpdated: `${new Date().getFullYear()}-01-14` },
          { id: 4, product: 'Dell XPS 13', sku: 'DXP13-1TB', current: 45000, forecast: 52000, variance: 7000, accuracy: 89.8, model: 'Exponential', lastUpdated: `${new Date().getFullYear()}-01-14` },
          { id: 5, product: 'Sony WH-1000XM5', sku: 'SWH1000X5', current: 25000, forecast: 23000, variance: -2000, accuracy: 94.7, model: 'ARIMA', lastUpdated: `${new Date().getFullYear()}-01-13` },
        ];
      case 'customers':
        return [
          { id: 1, customer: 'TechCorp Inc.', segment: 'Enterprise', current: 450000, forecast: 520000, variance: 70000, probability: 85, risk: 'Low' },
          { id: 2, customer: 'RetailMax Ltd.', segment: 'Retail', current: 320000, forecast: 385000, variance: 65000, probability: 78, risk: 'Medium' },
          { id: 3, customer: 'Global Solutions', segment: 'Enterprise', current: 280000, forecast: 295000, variance: 15000, probability: 92, risk: 'Low' },
          { id: 4, customer: 'StartupXYZ', segment: 'SMB', current: 180000, forecast: 165000, variance: -15000, probability: 65, risk: 'High' },
          { id: 5, customer: 'MegaCorp', segment: 'Enterprise', current: 520000, forecast: 580000, variance: 60000, probability: 88, risk: 'Low' },
        ];
      case 'scenarios':
        return [
          { id: 1, scenario: 'Base Case', probability: 60, forecast: 2450000, variance: 0, impact: 'Neutral', confidence: 'High' },
          { id: 2, scenario: 'Optimistic', probability: 25, forecast: 2940000, variance: 490000, impact: 'Positive', confidence: 'Medium' },
          { id: 3, scenario: 'Pessimistic', probability: 15, forecast: 1960000, variance: -490000, impact: 'Negative', confidence: 'Medium' },
          { id: 4, scenario: 'Economic Downturn', probability: 10, forecast: 1715000, variance: -735000, impact: 'Negative', confidence: 'Low' },
          { id: 5, scenario: 'Market Expansion', probability: 20, forecast: 3185000, variance: 735000, impact: 'Positive', confidence: 'Medium' },
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getConfidenceBadge = (confidence: string) => {
    const confidenceClasses = {
      'High': 'bg-green-100 text-green-800',
      'Medium': 'bg-yellow-100 text-yellow-800',
      'Low': 'bg-red-100 text-red-800',
    };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${confidenceClasses[confidence as keyof typeof confidenceClasses]}`}>
        {confidence}
      </span>
    );
  };

  const getRiskBadge = (risk: string) => {
    const riskClasses = {
      'Low': 'bg-green-100 text-green-800',
      'Medium': 'bg-yellow-100 text-yellow-800',
      'High': 'bg-red-100 text-red-800',
    };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${riskClasses[risk as keyof typeof riskClasses]}`}>
        {risk}
      </span>
    );
  };

  const getVarianceIndicator = (variance: number) => {
    if (variance > 0) {
      return <TrendingUp className="w-4 h-4 text-green-600" />;
    } else if (variance < 0) {
      return <TrendingDown className="w-4 h-4 text-red-600" />;
    }
    return <Activity className="w-4 h-4 text-gray-400" />;
  };

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 95) return 'text-green-600';
    if (accuracy >= 90) return 'text-blue-600';
    if (accuracy >= 85) return 'text-yellow-600';
    return 'text-red-600';
  };

  const renderTableHeaders = () => {
    switch (type) {
      case 'overview':
        return (
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Forecast</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Variance</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Accuracy</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Confidence</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        );
      case 'products':
        return (
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Forecast</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Variance</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Accuracy</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Model</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        );
      case 'customers':
        return (
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Segment</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Forecast</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Variance</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Probability</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Risk</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        );
      case 'scenarios':
        return (
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Scenario</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Probability</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Forecast</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Variance</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Impact</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Confidence</th>
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
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(item.current)}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(item.forecast)}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm">
              <div className="flex items-center space-x-1">
                {getVarianceIndicator(item.variance)}
                <span className={item.variance >= 0 ? 'text-green-600' : 'text-red-600'}>
                  {formatCurrency(Math.abs(item.variance))}
                </span>
              </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm">
              <span className={getAccuracyColor(item.accuracy)}>{item.accuracy}%</span>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">{getConfidenceBadge(item.confidence)}</td>
          </>
        )}
        
        {type === 'products' && (
          <>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.product}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.sku}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(item.current)}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(item.forecast)}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm">
              <div className="flex items-center space-x-1">
                {getVarianceIndicator(item.variance)}
                <span className={item.variance >= 0 ? 'text-green-600' : 'text-red-600'}>
                  {formatCurrency(Math.abs(item.variance))}
                </span>
              </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm">
              <span className={getAccuracyColor(item.accuracy)}>{item.accuracy}%</span>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.model}</td>
          </>
        )}
        
        {type === 'customers' && (
          <>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.customer}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.segment}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(item.current)}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(item.forecast)}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm">
              <div className="flex items-center space-x-1">
                {getVarianceIndicator(item.variance)}
                <span className={item.variance >= 0 ? 'text-green-600' : 'text-red-600'}>
                  {formatCurrency(Math.abs(item.variance))}
                </span>
              </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.probability}%</td>
            <td className="px-6 py-4 whitespace-nowrap">{getRiskBadge(item.risk)}</td>
          </>
        )}
        
        {type === 'scenarios' && (
          <>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.scenario}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.probability}%</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(item.forecast)}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm">
              <div className="flex items-center space-x-1">
                {getVarianceIndicator(item.variance)}
                <span className={item.variance >= 0 ? 'text-green-600' : 'text-red-600'}>
                  {item.variance !== 0 ? formatCurrency(Math.abs(item.variance)) : '-'}
                </span>
              </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.impact}</td>
            <td className="px-6 py-4 whitespace-nowrap">{getConfidenceBadge(item.confidence)}</td>
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
            <button className="text-orange-600 hover:text-orange-900 transition-colors">
              <AlertTriangle className="w-4 h-4" />
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
          <div className="text-gray-500 text-lg mb-2">No forecast data found</div>
          <div className="text-gray-400 text-sm">Try adjusting your search criteria or forecast parameters</div>
        </div>
      )}
    </div>
  );
};

export default ForecastTable;
