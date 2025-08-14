import React, { useState, useMemo } from 'react';
import { X, PieChart, Search, Calculator, Percent, Filter, ChevronDown, Calendar } from 'lucide-react';
import { applySeasonalDistribution } from '../utils/seasonalDistribution';
import {
  generateAvailableYears,
  getDefaultYearSelection,
  getYearValue,
  getCurrentYear
} from '../utils/dynamicYearUtils';

interface MonthlyBudget {
  month: string;
  budgetValue: number;
  actualValue: number;
  rate: number;
  stock: number;
  git: number;
  discount: number;
}

interface SalesBudgetItem {
  id: number;
  selected: boolean;
  customer: string;
  item: string;
  category: string;
  brand: string;
  yearlyBudgets?: { [year: string]: number };
  monthlyData: MonthlyBudget[];
  // Legacy compatibility
  budget2026?: number;
}

interface SetDistributionModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: SalesBudgetItem[];
  selectedCustomer: string;
  selectedCategory: string;
  selectedBrand: string;
  selectedItem: string;
  selectedTargetYear?: string; // Add year prop
  onApplyDistribution: (distributionData: { [itemId: number]: MonthlyBudget[] }) => void;
}

const SetDistributionModal: React.FC<SetDistributionModalProps> = ({
  isOpen,
  onClose,
  items,
  selectedCustomer,
  selectedCategory,
  selectedBrand,
  selectedItem,
  selectedTargetYear,
  onApplyDistribution
}) => {
  // Dynamic year state
  const availableYears = generateAvailableYears();
  const defaultYears = getDefaultYearSelection();
  const [currentTargetYear, setCurrentTargetYear] = useState(selectedTargetYear || defaultYears.targetYear);

  const [distributionType, setDistributionType] = useState<'equal' | 'percentage' | 'seasonal'>('equal');
  const [filterCustomer, setFilterCustomer] = useState(selectedCustomer || '');
  const [filterCategory, setFilterCategory] = useState(selectedCategory || '');
  const [filterBrand, setFilterBrand] = useState(selectedBrand || '');
  const [filterItem, setFilterItem] = useState(selectedItem || '');
  const [itemQuantity, setItemQuantity] = useState<number>(0);
  const [percentageValue, setPercentageValue] = useState<number>(0);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

  // Get unique values for dropdown filters
  const uniqueValues = useMemo(() => {
    const customers = Array.from(new Set(items.map(item => item.customer))).sort();
    const categories = Array.from(new Set(items.map(item => item.category))).sort();
    const brands = Array.from(new Set(items.map(item => item.brand))).sort();
    const itemNames = Array.from(new Set(items.map(item => item.item))).sort();

    return { customers, categories, brands, itemNames };
  }, [items]);

  // Get customer-specific combinations for the selected customer
  const customerCombinations = useMemo(() => {
    if (!filterCustomer) return [];

    const combinations = items
      .filter(item => item.customer === filterCustomer)
      .map(item => ({
        id: item.id,
        customer: item.customer,
        category: item.category,
        brand: item.brand,
        item: item.item,
        budget2026: getYearValue(item, currentTargetYear, 'budget'),
        combination: `${item.category} - ${item.brand} - ${item.item}`
      }));

    return combinations;
  }, [items, filterCustomer]);

  // Filter items based on all selected criteria
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const matchesCustomer = !filterCustomer || item.customer === filterCustomer;
      const matchesCategory = !filterCategory || item.category === filterCategory;
      const matchesBrand = !filterBrand || item.brand === filterBrand;
      const matchesItem = !filterItem || item.item.toLowerCase().includes(filterItem.toLowerCase());
      
      return matchesCustomer && matchesCategory && matchesBrand && matchesItem;
    });
  }, [items, filterCustomer, filterCategory, filterBrand, filterItem]);

  // Smart distribution logic - Start Jan to Dec, then backward Dec to Jan
  const distributeQuantityEqually = (quantity: number): number[] => {
    const baseAmount = Math.floor(quantity / 12);
    const remainder = quantity % 12;

    // Start with base amount for all months
    const distribution = new Array(12).fill(baseAmount);

    // First fill January to December
    for (let i = 0; i < remainder && i < 12; i++) {
      distribution[i] += 1; // Jan (0) to Dec (11)
    }

    // If still have remainder after filling Jan-Dec, continue backward from Dec
    if (remainder > 12) {
      const extraRemainder = remainder - 12;
      for (let i = 0; i < extraRemainder; i++) {
        const monthIndex = 11 - i; // Start from December (11) and go backwards
        distribution[monthIndex] += 1;
      }
    }

    return distribution;
  };

  const distributeByPercentage = (totalBudget: number, percentage: number): number[] => {
    const amountToDistribute = Math.round((totalBudget * percentage) / 100);
    return distributeQuantityEqually(amountToDistribute);
  };

  const handleApplyDistribution = () => {
    if (!filterCustomer) {
      alert('Please select a customer first');
      return;
    }

    if (distributionType !== 'seasonal' && !itemQuantity && !percentageValue) {
      alert('Please enter a quantity or percentage value');
      return;
    }

    if (filteredItems.length === 0) {
      alert('No items found with the selected criteria');
      return;
    }

    const distributionData: { [itemId: number]: MonthlyBudget[] } = {};

    filteredItems.forEach(item => {
      const newMonthlyData = [...item.monthlyData];
      let distribution: number[];

      if (distributionType === 'equal') {
        distribution = distributeQuantityEqually(itemQuantity);
      } else if (distributionType === 'percentage') {
        const currentBudget = getYearValue(item, currentTargetYear, 'budget');
        distribution = distributeByPercentage(currentBudget, percentageValue);
      } else if (distributionType === 'seasonal') {
        // Use holiday-aware seasonal distribution based on existing target year budget value
        const currentBudget = getYearValue(item, currentTargetYear, 'budget');
        if (currentBudget > 0) {
          const seasonalDistributions = applySeasonalDistribution(currentBudget, 'Default Seasonal');
          distribution = seasonalDistributions.map(dist => dist.value);
        } else {
          // If no target year budget value, use input quantity with seasonal distribution
          const quantityToDistribute = itemQuantity || 0;
          if (quantityToDistribute > 0) {
            const seasonalDistributions = applySeasonalDistribution(quantityToDistribute, 'Default Seasonal');
            distribution = seasonalDistributions.map(dist => dist.value);
          } else {
            distribution = new Array(12).fill(0);
          }
        }
      } else {
        distribution = new Array(12).fill(0);
      }

      // Apply distribution to monthly data
      newMonthlyData.forEach((monthData, index) => {
        monthData.budgetValue = distribution[index];
      });

      distributionData[item.id] = newMonthlyData;
    });

    onApplyDistribution(distributionData);
    onClose();

    // Reset form
    setItemQuantity(0);
    setPercentageValue(0);
  };

  const clearAllFilters = () => {
    setFilterCustomer('');
    setFilterCategory('');
    setFilterBrand('');
    setFilterItem('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <PieChart className="w-6 h-6 text-purple-600" />
              <div>
                <h2 className="text-xl font-bold text-gray-900">Set Distribution</h2>
                <p className="text-sm text-gray-600">
                  {filteredItems.length > 0 
                    ? `${filteredItems.length} item(s) selected for distribution`
                    : 'Select customer and criteria to begin'}
                </p>
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

        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Quick Filter Selection */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-blue-800 flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Filter Criteria
              </h3>
              <button
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1"
              >
                {showAdvancedFilters ? 'Hide' : 'Show'} Advanced
                <ChevronDown className={`w-4 h-4 transition-transform ${showAdvancedFilters ? 'rotate-180' : ''}`} />
              </button>
            </div>

            {/* Customer Selection - Always visible */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Customer *
                </label>
                <select
                  value={filterCustomer}
                  onChange={(e) => {
                    setFilterCustomer(e.target.value);
                    // Reset other filters when customer changes
                    setFilterCategory('');
                    setFilterBrand('');
                    setFilterItem('');
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                >
                  <option value="">Select Customer</option>
                  {uniqueValues.customers.map(customer => (
                    <option key={customer} value={customer}>{customer}</option>
                  ))}
                </select>
              </div>

              {filterCustomer && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Available Combinations ({customerCombinations.length})
                  </label>
                  <div className="text-sm text-gray-600 p-2 bg-gray-50 rounded border max-h-20 overflow-y-auto">
                    {customerCombinations.map((combo, idx) => (
                      <div key={combo.id} className="text-xs">
                        {idx + 1}. {combo.combination} (Budget {currentTargetYear}: {combo.budget2026})
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Advanced Filters */}
            {showAdvancedFilters && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-blue-200">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    disabled={!filterCustomer}
                  >
                    <option value="">All Categories</option>
                    {uniqueValues.categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Brand
                  </label>
                  <select
                    value={filterBrand}
                    onChange={(e) => setFilterBrand(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    disabled={!filterCustomer}
                  >
                    <option value="">All Brands</option>
                    {uniqueValues.brands.map(brand => (
                      <option key={brand} value={brand}>{brand}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Item Search
                  </label>
                  <div className="relative">
                    <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                    <input
                      type="text"
                      value={filterItem}
                      onChange={(e) => setFilterItem(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      placeholder="Search items..."
                      disabled={!filterCustomer}
                    />
                  </div>
                </div>
              </div>
            )}

            {(filterCustomer || filterCategory || filterBrand || filterItem) && (
              <div className="flex justify-end pt-3">
                <button
                  onClick={clearAllFilters}
                  className="text-sm bg-red-100 text-red-700 px-3 py-1 rounded hover:bg-red-200 transition-colors"
                >
                  Clear All Filters
                </button>
              </div>
            )}
          </div>

          {/* Selected Items Preview */}
          {filteredItems.length > 0 && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="text-sm font-medium text-green-800 mb-2">
                Selected Items for Distribution ({filteredItems.length})
              </h3>
              <div className="max-h-32 overflow-y-auto space-y-1">
                {filteredItems.map(item => (
                  <div key={item.id} className="text-sm text-green-700 bg-white p-2 rounded border">
                    <div className="font-medium">{item.customer}</div>
                    <div className="text-xs">{item.category} - {item.brand} - {item.item}</div>
                    <div className="text-xs text-gray-600">Current Budget 2026: {item.budget2026}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Distribution Type */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">Distribution Type</h3>
            <div className="space-y-2">
              <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="distributionType"
                  value="equal"
                  checked={distributionType === 'equal'}
                  onChange={(e) => setDistributionType(e.target.value as any)}
                  className="mr-3"
                />
                <div className="flex items-center gap-2">
                  <Calculator className="w-4 h-4 text-blue-600" />
                  <div>
                    <div className="font-medium">Equal Distribution</div>
                    <div className="text-sm text-gray-600">Enter quantity to distribute equally</div>
                  </div>
                </div>
              </label>

              <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="distributionType"
                  value="percentage"
                  checked={distributionType === 'percentage'}
                  onChange={(e) => setDistributionType(e.target.value as any)}
                  className="mr-3"
                />
                <div className="flex items-center gap-2">
                  <Percent className="w-4 h-4 text-green-600" />
                  <div>
                    <div className="font-medium">Percentage Distribution</div>
                    <div className="text-sm text-gray-600">Enter percentage of BUD {currentTargetYear}</div>
                  </div>
                </div>
              </label>

              <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="distributionType"
                  value="seasonal"
                  checked={distributionType === 'seasonal'}
                  onChange={(e) => setDistributionType(e.target.value as any)}
                  className="mr-3"
                />
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-orange-600" />
                  <div>
                    <div className="font-medium">Seasonal Growth Distribution</div>
                    <div className="text-sm text-gray-600">Holiday-aware: Higher in non-holiday months (Jan-Apr), reduced in holiday months (Nov-Dec)</div>
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Input Fields */}
          {distributionType === 'equal' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Item Quantity
              </label>
              <input
                type="number"
                value={itemQuantity || ''}
                onChange={(e) => setItemQuantity(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                placeholder="Enter quantity (e.g. 13)"
                min="0"
              />
              <p className="text-xs text-gray-500 mt-1">
                System will fill Jan→Dec first, then Dec→Nov→Jan if remainder
              </p>
            </div>
          )}

          {distributionType === 'percentage' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Percentage of BUD 2026
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={percentageValue || ''}
                  onChange={(e) => setPercentageValue(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  placeholder="Enter percentage (e.g. 25)"
                  min="0"
                  max="100"
                  step="0.1"
                />
                <Percent className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 transform -translate-y-1/2" />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                System will calculate amount and distribute equally
              </p>
            </div>
          )}

          {/* Summary */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="text-sm">
              <div className="font-medium text-blue-800 mb-1">
                Distribution Summary
              </div>
              <div className="text-blue-700 space-y-1">
                <div>• Customer: {filterCustomer || 'Not selected'}</div>
                {filterCategory && <div>• Category: {filterCategory}</div>}
                {filterBrand && <div>• Brand: {filterBrand}</div>}
                {filterItem && <div>• Item Filter: "{filterItem}"</div>}
                <div>• Items to update: {filteredItems.length}</div>
                {distributionType === 'equal' && itemQuantity > 0 && (
                  <div>• {itemQuantity} items distributed across 12 months (Jan→Dec priority)</div>
                )}
                {distributionType === 'percentage' && percentageValue > 0 && (
                  <div>• {percentageValue}% of each item's BUD 2026 distributed equally</div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4">
          <div className="flex gap-3 w-full">
            <button
              onClick={onClose}
              className="flex-1 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleApplyDistribution}
              disabled={
                (distributionType !== 'seasonal' && !itemQuantity && !percentageValue) ||
                !filterCustomer ||
                filteredItems.length === 0
              }
              className="flex-1 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              Apply Distribution to {filteredItems.length} Item(s)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SetDistributionModal;
