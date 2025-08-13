import React, { useState, useEffect } from 'react';
import { Package, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';

interface StockSummary {
  totalItems: number;
  totalStock: number;
  stockByCategory: Record<string, number>;
  stockByBrand: Record<string, number>;
  lowStockItems: number;
  outOfStockItems: number;
  lastUpdated: string;
}

interface StockSummaryWidgetProps {
  className?: string;
  compact?: boolean;
}

const StockSummaryWidget: React.FC<StockSummaryWidgetProps> = ({
  className = '',
  compact = false
}) => {
  const [stockSummary, setStockSummary] = useState<StockSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStockSummary();
    
    // Set up interval to refresh stock summary every 30 seconds
    const interval = setInterval(loadStockSummary, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const loadStockSummary = async () => {
    try {
      const savedSummary = localStorage.getItem('global_stock_summary');
      if (savedSummary) {
        setStockSummary(JSON.parse(savedSummary));
      } else {
        // Generate initial summary from admin stock data
        generateInitialSummary();
      }
    } catch (error) {
      console.error('Error loading stock summary:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateInitialSummary = () => {
    try {
      const adminStockData = localStorage.getItem('admin_global_stock_data');
      if (adminStockData) {
        const stockItems = JSON.parse(adminStockData);
        
        const summary: StockSummary = {
          totalItems: stockItems.length,
          totalStock: stockItems.reduce((sum: number, item: any) => sum + item.stockQuantity, 0),
          stockByCategory: stockItems.reduce((acc: Record<string, number>, item: any) => {
            acc[item.category] = (acc[item.category] || 0) + item.stockQuantity;
            return acc;
          }, {}),
          stockByBrand: stockItems.reduce((acc: Record<string, number>, item: any) => {
            acc[item.brand] = (acc[item.brand] || 0) + item.stockQuantity;
            return acc;
          }, {}),
          lowStockItems: stockItems.filter((item: any) => item.stockQuantity < 10 && item.stockQuantity > 0).length,
          outOfStockItems: stockItems.filter((item: any) => item.stockQuantity === 0).length,
          lastUpdated: new Date().toISOString()
        };
        
        setStockSummary(summary);
        localStorage.setItem('global_stock_summary', JSON.stringify(summary));
      }
    } catch (error) {
      console.error('Error generating initial stock summary:', error);
    }
  };

  const getStockHealth = () => {
    if (!stockSummary) return 'unknown';
    
    const healthyItems = stockSummary.totalItems - stockSummary.lowStockItems - stockSummary.outOfStockItems;
    const healthPercentage = (healthyItems / stockSummary.totalItems) * 100;
    
    if (healthPercentage >= 80) return 'excellent';
    if (healthPercentage >= 60) return 'good';
    if (healthPercentage >= 40) return 'warning';
    return 'critical';
  };

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'excellent': return 'text-green-600 bg-green-100';
      case 'good': return 'text-blue-600 bg-blue-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'critical': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getHealthIcon = (health: string) => {
    switch (health) {
      case 'excellent': return <CheckCircle className="w-5 h-5" />;
      case 'good': return <TrendingUp className="w-5 h-5" />;
      case 'warning': return <AlertTriangle className="w-5 h-5" />;
      case 'critical': return <AlertTriangle className="w-5 h-5" />;
      default: return <Package className="w-5 h-5" />;
    }
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-4 ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-8 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (!stockSummary) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-4 ${className}`}>
        <div className="text-center text-gray-500">
          <Package className="w-8 h-8 mx-auto mb-2 text-gray-300" />
          <p className="text-sm">No stock data available</p>
        </div>
      </div>
    );
  }

  const stockHealth = getStockHealth();

  if (compact) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-3 ${className}`}>
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${getHealthColor(stockHealth)}`}>
            {getHealthIcon(stockHealth)}
          </div>
          <div className="flex-1">
            <div className="text-sm text-gray-600">Total Stock</div>
            <div className="text-lg font-bold text-gray-900">{stockSummary.totalStock.toLocaleString()}</div>
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-500">Health</div>
            <div className={`text-sm font-medium ${getHealthColor(stockHealth).split(' ')[0]}`}>
              {stockHealth}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}>
      <div className="flex items-center gap-3 mb-4">
        <div className={`p-3 rounded-lg ${getHealthColor(stockHealth)}`}>
          {getHealthIcon(stockHealth)}
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Stock Overview</h3>
          <p className="text-sm text-gray-600">Real-time stock summary across all items</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">{stockSummary.totalStock.toLocaleString()}</div>
          <div className="text-sm text-gray-600">Total Units</div>
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">{stockSummary.totalItems}</div>
          <div className="text-sm text-gray-600">Items</div>
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold text-yellow-600">{stockSummary.lowStockItems}</div>
          <div className="text-sm text-gray-600">Low Stock</div>
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold text-red-600">{stockSummary.outOfStockItems}</div>
          <div className="text-sm text-gray-600">Out of Stock</div>
        </div>
      </div>

      {/* Stock by Category */}
      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Stock by Category</h4>
        <div className="space-y-2">
          {Object.entries(stockSummary.stockByCategory).map(([category, quantity]) => (
            <div key={category} className="flex items-center justify-between">
              <span className="text-sm text-gray-600">{category}</span>
              <span className="text-sm font-medium text-gray-900">{quantity.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Stock by Brand */}
      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Stock by Brand</h4>
        <div className="space-y-2">
          {Object.entries(stockSummary.stockByBrand).slice(0, 3).map(([brand, quantity]) => (
            <div key={brand} className="flex items-center justify-between">
              <span className="text-sm text-gray-600">{brand}</span>
              <span className="text-sm font-medium text-gray-900">{quantity.toLocaleString()}</span>
            </div>
          ))}
          {Object.keys(stockSummary.stockByBrand).length > 3 && (
            <div className="text-xs text-gray-500 text-center">
              +{Object.keys(stockSummary.stockByBrand).length - 3} more brands
            </div>
          )}
        </div>
      </div>

      <div className="pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Last updated</span>
          <span>{new Date(stockSummary.lastUpdated).toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
};

export default StockSummaryWidget;
