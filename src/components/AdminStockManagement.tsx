import React, { useState, useEffect } from 'react';
import { X, Package, Save, Search, Plus, Edit3, Trash2, Check, AlertTriangle } from 'lucide-react';

interface StockItem {
  id: string;
  customer: string;
  item: string;
  category: string;
  brand: string;
  stockQuantity: number;
  lastUpdated: string;
  updatedBy: string;
}

interface AdminStockManagementProps {
  isOpen: boolean;
  onClose: () => void;
  items: any[]; // All items from sales budget
}

const AdminStockManagement: React.FC<AdminStockManagementProps> = ({
  isOpen,
  onClose,
  items
}) => {
  const [stockItems, setStockItems] = useState<StockItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newStock, setNewStock] = useState<number>(0);
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null);

  const ADMIN_STOCK_STORAGE_KEY = 'admin_global_stock_data';

  // Load stock data on component mount
  useEffect(() => {
    if (isOpen) {
      loadStockData();
    }
  }, [isOpen]);

  const loadStockData = () => {
    try {
      const savedData = localStorage.getItem(ADMIN_STOCK_STORAGE_KEY);
      if (savedData) {
        setStockItems(JSON.parse(savedData));
      } else {
        // Initialize stock data from items
        initializeStockFromItems();
      }
    } catch (error) {
      console.error('Error loading stock data:', error);
      initializeStockFromItems();
    }
  };

  const initializeStockFromItems = () => {
    const initialStock = items.map(item => ({
      id: `stock_${item.customer}_${item.item}`.replace(/[^a-zA-Z0-9]/g, '_'),
      customer: item.customer,
      item: item.item,
      category: item.category || 'TYRE SERVICE',
      brand: item.brand || 'Various',
      stockQuantity: item.stock || 0,
      lastUpdated: new Date().toISOString(),
      updatedBy: 'admin'
    }));
    setStockItems(initialStock);
    saveStockData(initialStock);
  };

  const saveStockData = (data: StockItem[]) => {
    try {
      localStorage.setItem(ADMIN_STOCK_STORAGE_KEY, JSON.stringify(data));
      console.log('Admin stock data saved:', data.length, 'items');
    } catch (error) {
      console.error('Error saving stock data:', error);
    }
  };

  const updateStockQuantity = (id: string, quantity: number) => {
    const stockItem = stockItems.find(s => s.id === id);
    const oldQuantity = stockItem?.stockQuantity || 0;

    const updatedItems = stockItems.map(item =>
      item.id === id
        ? {
            ...item,
            stockQuantity: quantity,
            lastUpdated: new Date().toISOString(),
            updatedBy: 'admin'
          }
        : item
    );

    setStockItems(updatedItems);
    saveStockData(updatedItems);

    // Apply stock changes globally to all users
    applyStockChangesGlobally(id, quantity);

    // Update stock totals across the system
    updateGlobalStockTotals(updatedItems);

    // Create workflow notification for significant stock changes
    if (Math.abs(quantity - oldQuantity) > 10) {
      createStockChangeNotification(stockItem, oldQuantity, quantity);
    }

    showNotification(`Stock updated for ${stockItems.find(s => s.id === id)?.item}`, 'success');
    setEditingId(null);
    setNewStock(0);
  };

  const updateGlobalStockTotals = (items: StockItem[]) => {
    try {
      // Calculate total stock by category, brand, etc.
      const stockSummary = {
        totalItems: items.length,
        totalStock: items.reduce((sum, item) => sum + item.stockQuantity, 0),
        stockByCategory: items.reduce((acc, item) => {
          acc[item.category] = (acc[item.category] || 0) + item.stockQuantity;
          return acc;
        }, {} as Record<string, number>),
        stockByBrand: items.reduce((acc, item) => {
          acc[item.brand] = (acc[item.brand] || 0) + item.stockQuantity;
          return acc;
        }, {} as Record<string, number>),
        lowStockItems: items.filter(item => item.stockQuantity < 10).length,
        outOfStockItems: items.filter(item => item.stockQuantity === 0).length,
        lastUpdated: new Date().toISOString()
      };

      // Save global stock summary
      localStorage.setItem('global_stock_summary', JSON.stringify(stockSummary));

      console.log('Global stock totals updated:', stockSummary);
    } catch (error) {
      console.error('Error updating global stock totals:', error);
    }
  };

  const createStockChangeNotification = (stockItem: StockItem | undefined, oldQuantity: number, newQuantity: number) => {
    if (!stockItem) return;

    try {
      const notification = {
        id: `stock_change_${Date.now()}`,
        type: 'stock_update',
        title: `Stock Updated: ${stockItem.item}`,
        message: `Admin updated stock from ${oldQuantity} to ${newQuantity} units for ${stockItem.customer}`,
        timestamp: new Date().toISOString(),
        metadata: {
          itemId: stockItem.id,
          customer: stockItem.customer,
          item: stockItem.item,
          oldQuantity,
          newQuantity,
          change: newQuantity - oldQuantity
        }
      };

      // Save to notifications for other users
      const existingNotifications = JSON.parse(localStorage.getItem('system_notifications') || '[]');
      existingNotifications.push(notification);
      localStorage.setItem('system_notifications', JSON.stringify(existingNotifications));

      console.log('Stock change notification created:', notification);
    } catch (error) {
      console.error('Error creating stock change notification:', error);
    }
  };

  const applyStockChangesGlobally = (stockId: string, quantity: number) => {
    const stockItem = stockItems.find(s => s.id === stockId);
    if (!stockItem) return;

    // Update all user data sources that might contain this item
    try {
      // Update sales budget data
      const salesBudgetData = localStorage.getItem('sales_budget_saved_data');
      if (salesBudgetData) {
        const budgetData = JSON.parse(salesBudgetData);
        const updatedBudgetData = budgetData.map((item: any) => {
          if (item.customer === stockItem.customer && item.item === stockItem.item) {
            return { ...item, stock: quantity };
          }
          return item;
        });
        localStorage.setItem('sales_budget_saved_data', JSON.stringify(updatedBudgetData));
      }

      // Update rolling forecast data
      const forecastData = localStorage.getItem('rolling_forecast_saved_data');
      if (forecastData) {
        const rollingData = JSON.parse(forecastData);
        const updatedForecastData = rollingData.map((item: any) => {
          if (item.customer === stockItem.customer && item.item === stockItem.item) {
            if (item.budgetData) {
              item.budgetData.stock = quantity;
            }
            return item;
          }
          return item;
        });
        localStorage.setItem('rolling_forecast_saved_data', JSON.stringify(updatedForecastData));
      }

      console.log(`Global stock update applied: ${stockItem.customer} - ${stockItem.item} = ${quantity}`);
    } catch (error) {
      console.error('Error applying global stock changes:', error);
    }
  };

  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const filteredItems = stockItems.filter(item =>
    item.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.item.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.brand.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (id: string, currentStock: number) => {
    setEditingId(id);
    setNewStock(currentStock);
  };

  const handleSave = (id: string) => {
    updateStockQuantity(id, newStock);
  };

  const handleCancel = () => {
    setEditingId(null);
    setNewStock(0);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Package className="w-6 h-6 text-blue-600" />
              <div>
                <h2 className="text-xl font-bold text-gray-900">Admin Stock Management</h2>
                <p className="text-sm text-gray-600">Manage global stock quantities for all users</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Notification */}
        {notification && (
          <div className={`mx-6 mt-4 p-3 rounded-lg ${
            notification.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
            <div className="flex items-center gap-2">
              {notification.type === 'success' ? <Check className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
              {notification.message}
            </div>
          </div>
        )}

        <div className="p-6">
          {/* Search */}
          <div className="mb-6">
            <div className="relative">
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Search by customer, item, category, or brand..."
              />
            </div>
          </div>

          {/* Stock Table */}
          <div className="overflow-hidden rounded-lg border border-gray-200">
            <div className="max-h-[50vh] overflow-y-auto">
              <table className="w-full">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Item
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Brand
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Stock Quantity
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Last Updated
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredItems.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900 max-w-[200px] truncate" title={item.customer}>
                        {item.customer}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 max-w-[300px] truncate" title={item.item}>
                        {item.item}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {item.category}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {item.brand}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {editingId === item.id ? (
                          <input
                            type="number"
                            value={newStock}
                            onChange={(e) => setNewStock(parseInt(e.target.value) || 0)}
                            className="w-20 px-2 py-1 text-center border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            min="0"
                            autoFocus
                          />
                        ) : (
                          <span className={`text-sm font-medium ${
                            item.stockQuantity > 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {item.stockQuantity}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center text-xs text-gray-500">
                        {new Date(item.lastUpdated).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {editingId === item.id ? (
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleSave(item.id)}
                              className="text-green-600 hover:text-green-800 transition-colors"
                              title="Save"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={handleCancel}
                              className="text-gray-600 hover:text-gray-800 transition-colors"
                              title="Cancel"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleEdit(item.id, item.stockQuantity)}
                            className="text-blue-600 hover:text-blue-800 transition-colors"
                            title="Edit Stock"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Summary */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="text-sm text-blue-700 mb-1">Total Items</div>
              <div className="text-2xl font-bold text-blue-900">{filteredItems.length}</div>
            </div>
            
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="text-sm text-green-700 mb-1">Items in Stock</div>
              <div className="text-2xl font-bold text-green-900">
                {filteredItems.filter(item => item.stockQuantity > 0).length}
              </div>
            </div>
            
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="text-sm text-red-700 mb-1">Out of Stock</div>
              <div className="text-2xl font-bold text-red-900">
                {filteredItems.filter(item => item.stockQuantity === 0).length}
              </div>
            </div>
          </div>

          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div className="text-sm text-yellow-800">
                <div className="font-medium mb-1">Admin Stock Management</div>
                <div>
                  Stock quantities set here will be applied globally to all users across the entire system. 
                  This includes Sales Budget, Rolling Forecast, and all user dashboards.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              Changes are automatically saved and applied globally
            </div>
            <button
              onClick={onClose}
              className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminStockManagement;
