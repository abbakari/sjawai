import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import { useBudget, YearlyBudgetData } from '../contexts/BudgetContext';
import { useWorkflow } from '../contexts/WorkflowContext';
import { salesBudgetService, SalesBudgetItem as APISalesBudgetItem } from '../services/salesBudgetService';
import { discountService } from '../services/discountService';
import DiscountManagementModal from '../components/DiscountManagementModal';
import {
  TrendingUp,
  Info as InfoIcon,
  Download as DownloadIcon,
  Plus,
  PieChart,
  Truck,
  Save,
  X,
  Calendar,
  Send,
  Package,
  Users,
  AlertTriangle
} from 'lucide-react';
import ExportModal, { ExportConfig } from '../components/ExportModal';
import NewAdditionModal, { NewItemData } from '../components/NewAdditionModal';
import YearlyBudgetModal from '../components/YearlyBudgetModal';
import SalesmanStockManagement from '../components/SalesmanStockManagement';
import ManagerStockManagement from '../components/ManagerStockManagement';
import ManagerDashboard from '../components/ManagerDashboard';
import CustomerForecastModal from '../components/CustomerForecastModal';
import GitDetailsTooltip from '../components/GitDetailsTooltip';
import ViewOnlyMonthlyDistributionModal from '../components/ViewOnlyMonthlyDistributionModal';
import FollowBacksButton from '../components/FollowBacksButton';
import DataPreservationIndicator from '../components/DataPreservationIndicator';
import SetDistributionModal from '../components/SetDistributionModal';
import AdminStockManagement from '../components/AdminStockManagement';
import StockSummaryWidget from '../components/StockSummaryWidget';
import SeasonalDistributionInfo from '../components/SeasonalDistributionInfo';
import DataPersistenceManager, { SavedBudgetData } from '../utils/dataPersistence';
import { initializeSampleGitData } from '../utils/sampleGitData';
import { applySeasonalDistribution, convertToMonthlyBudget, SEASONAL_PATTERNS } from '../utils/seasonalDistribution';

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
  itemCombined: string;
  budget2025: number;
  actual2025: number;
  budget2026: number;
  rate: number;
  stock: number;
  git: number;
  budgetValue2026: number;
  discount: number;
  monthlyData: MonthlyBudget[];
}

const SalesBudget: React.FC = () => {
  const { user } = useAuth();
  const { addYearlyBudget, yearlyBudgets, error: budgetError } = useBudget();
  const { submitForApproval, getNotificationsForUser } = useWorkflow();
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedItem, setSelectedItem] = useState('');
  const [selectedYear2025, setSelectedYear2025] = useState('2025');
  const [selectedYear2026, setSelectedYear2026] = useState('2026');
  const [activeView, setActiveView] = useState<'customer-item' | 'item-wise'>('customer-item');
  const [editingRowId, setEditingRowId] = useState<number | null>(null);
  const [isSubmittingForApproval, setIsSubmittingForApproval] = useState(false);

  // Modal states
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isNewAdditionModalOpen, setIsNewAdditionModalOpen] = useState(false);
  const [newAdditionType] = useState<'customer' | 'item'>('item');
  const [isYearlyBudgetModalOpen, setIsYearlyBudgetModalOpen] = useState(false);
  const [isStockManagementModalOpen, setIsStockManagementModalOpen] = useState(false);
  const [selectedStockItem, setSelectedStockItem] = useState<any>(null);
  const [isManagerDashboardOpen, setIsManagerDashboardOpen] = useState(false);
  const [isCustomerForecastModalOpen, setIsCustomerForecastModalOpen] = useState(false);
  const [selectedCustomerForBreakdown, setSelectedCustomerForBreakdown] = useState<string>('');
  const [isViewOnlyModalOpen, setIsViewOnlyModalOpen] = useState(false);
  const [selectedRowForViewOnly, setSelectedRowForViewOnly] = useState<SalesBudgetItem | null>(null);
  const [isSetDistributionModalOpen, setIsSetDistributionModalOpen] = useState(false);
  const [isAdminStockModalOpen, setIsAdminStockModalOpen] = useState(false);
  const [isSeasonalGrowthModalOpen, setIsSeasonalGrowthModalOpen] = useState(false);
  const [isDiscountManagementModalOpen, setIsDiscountManagementModalOpen] = useState(false);

  // Notification state
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null);

  // GIT explanation state
  const [showGitExplanation, setShowGitExplanation] = useState(false);

  // Monthly editing state
  const [editingMonthlyData, setEditingMonthlyData] = useState<{[key: number]: MonthlyBudget[]}>({});


  // Generate all months for the year
  const getAllYearMonths = () => {
    const currentDate = new Date();
    const months = [];

    for (let i = 0; i < 12; i++) {
      const date = new Date(currentDate.getFullYear(), i, 1);
      months.push({
        short: date.toLocaleDateString('en-US', { month: 'short' }),
        full: date.toLocaleDateString('en-US', { month: 'long' }),
        index: i
      });
    }
    return months;
  };

  const months = getAllYearMonths();

  // Initial data
  const initialData: SalesBudgetItem[] = [
    {
      id: 1,
      selected: false,
      customer: "Action Aid International (Tz)",
      item: "BF GOODRICH TYRE 235/85R16 120/116S TL AT/TA KO2 LRERWLGO",
      category: "Tyres",
      brand: "BF Goodrich",
      itemCombined: "BF GOODRICH TYRE 235/85R16 (Tyres - BF Goodrich)",
      budget2025: 1200000,
      actual2025: 850000,
      budget2026: 0,
      rate: 341,
      stock: 232,
      git: 0,
      budgetValue2026: 0,
      discount: 0,
      monthlyData: months.map(month => ({
        month: month.short,
        budgetValue: 0,
        actualValue: 0,
        rate: 341,
        stock: Math.floor(Math.random() * 100) + 50,
        git: Math.floor(Math.random() * 20),
        discount: 0
      }))
    },
    {
      id: 2,
      selected: false,
      customer: "Action Aid International (Tz)",
      item: "BF GOODRICH TYRE 265/65R17 120/117S TL AT/TA KO2 LRERWLGO",
      category: "Tyres",
      brand: "BF Goodrich",
      itemCombined: "BF GOODRICH TYRE 265/65R17 (Tyres - BF Goodrich)",
      budget2025: 980000,
      actual2025: 720000,
      budget2026: 0,
      rate: 412,
      stock: 7,
      git: 0,
      budgetValue2026: 0,
      discount: 0,
      monthlyData: months.map(month => ({
        month: month.short,
        budgetValue: 0,
        actualValue: 0,
        rate: 412,
        stock: Math.floor(Math.random() * 50) + 10,
        git: Math.floor(Math.random() * 15),
        discount: 0
      }))
    },
    {
      id: 3,
      selected: false,
      customer: "Action Aid International (Tz)",
      item: "VALVE 0214 TR 414J FOR CAR TUBELESS TYRE",
      category: "Accessories",
      brand: "Generic",
      itemCombined: "VALVE 0214 TR 414J (Accessories - Generic)",
      budget2025: 15000,
      actual2025: 18000,
      budget2026: 0,
      rate: 0.5,
      stock: 2207,
      git: 0,
      budgetValue2026: 0,
      discount: 0,
      monthlyData: months.map(month => ({
        month: month.short,
        budgetValue: 0,
        actualValue: 0,
        rate: 0.5,
        stock: Math.floor(Math.random() * 500) + 1000,
        git: 0,
        discount: 0
      }))
    },
    {
      id: 4,
      selected: false,
      customer: "Action Aid International (Tz)",
      item: "MICHELIN TYRE 265/65R17 112T TL LTX TRAIL",
      category: "Tyres",
      brand: "Michelin",
      itemCombined: "MICHELIN TYRE 265/65R17 (Tyres - Michelin)",
      budget2025: 875000,
      actual2025: 920000,
      budget2026: 0,
      rate: 300,
      stock: 127,
      git: 0,
      budgetValue2026: 0,
      discount: 0,
      monthlyData: months.map(month => ({
        month: month.short,
        budgetValue: 0,
        actualValue: 0,
        rate: 300,
        stock: Math.floor(Math.random() * 80) + 50,
        git: Math.floor(Math.random() * 25),
        discount: 0
      }))
    }
  ];

  const [originalTableData, setOriginalTableData] = useState<SalesBudgetItem[]>([]);
  const [tableData, setTableData] = useState<SalesBudgetItem[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [dataError, setDataError] = useState<string | null>(null);

  // Load data from backend
  const loadBudgetData = async () => {
    try {
      setIsLoadingData(true);
      setDataError(null);

      const budgets = await salesBudgetService.getAllBudgets();
      console.log('Loaded budgets from backend:', budgets);

      // Transform backend data to match component interface
      const transformedData: SalesBudgetItem[] = budgets.map(budget => ({
        id: budget.id,
        selected: false,
        customer: budget.customer,
        item: budget.item,
        category: budget.category,
        brand: budget.brand,
        itemCombined: budget.itemCombined || `${budget.item} (${budget.category} - ${budget.brand})`,
        budget2025: budget.budget_2025,
        actual2025: budget.actual_2025,
        budget2026: budget.budget_2026,
        rate: budget.rate,
        stock: budget.stock,
        git: budget.git,
        budgetValue2026: budget.budgetValue2026 || (budget.budget_2026 * budget.rate),
        discount: budget.discount,
        monthlyData: budget.monthly_data.length > 0 ? budget.monthly_data : months.map(month => ({
          month: month.short,
          budgetValue: 0,
          actualValue: 0,
          rate: budget.rate,
          stock: budget.stock,
          git: budget.git,
          discount: 0
        }))
      }));

      setOriginalTableData(transformedData);
      setTableData(transformedData);

      // Save to localStorage for BI integration
      localStorage.setItem('salesBudgetData', JSON.stringify(transformedData));

    } catch (error) {
      console.error('Failed to load budget data:', error);
      setDataError('Failed to load budget data from server');

      // Fallback to initialData if available
      if (initialData.length > 0) {
        setOriginalTableData(initialData);
        setTableData(initialData);
      }
    } finally {
      setIsLoadingData(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    loadBudgetData();
  }, []);

  // Save budget data to localStorage for BI integration
  useEffect(() => {
    if (tableData.length > 0) {
      localStorage.setItem('salesBudgetData', JSON.stringify(tableData));
    }
  }, [tableData]);

  // Load global stock data set by admin
  const loadGlobalStockData = () => {
    try {
      const adminStockData = localStorage.getItem('admin_global_stock_data');
      if (adminStockData) {
        const stockItems = JSON.parse(adminStockData);

        // Update table data with admin-set stock quantities
        setTableData(prevData =>
          prevData.map(row => {
            const stockItem = stockItems.find((s: any) =>
              s.customer === row.customer && s.item === row.item
            );

            if (stockItem) {
              return { ...row, stock: stockItem.stockQuantity };
            }
            return row;
          })
        );

        console.log('Global stock data loaded from admin');
      }
    } catch (error) {
      console.error('Error loading global stock data:', error);
    }
  };

  // Load GIT data from admin system and update table data
  useEffect(() => {
    // Initialize sample GIT data if none exists
    const initialized = initializeSampleGitData();
    if (initialized) {
      console.log('Sample GIT data initialized for development/testing');
    }

    // Load global stock data from admin
    loadGlobalStockData();

    const updateGitDataInTable = () => {
      setOriginalTableData(prevData =>
        prevData.map(row => {
          const gitSummary = DataPersistenceManager.getGitSummaryForItem(row.customer, row.item);
          return {
            ...row,
            git: gitSummary.gitQuantity,
            // Update monthly data with GIT information if available
            monthlyData: row.monthlyData.map(month => ({
              ...month,
              git: Math.floor(gitSummary.gitQuantity / 12) // Distribute evenly across months
            }))
          };
        })
      );
    };

    // Update GIT data on component mount
    updateGitDataInTable();

    // Set up interval to check for GIT data updates and admin stock updates every 30 seconds
    const interval = setInterval(() => {
      updateGitDataInTable();
      loadGlobalStockData();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // Load saved salesman data for current user
  useEffect(() => {
    if (user) {
      const savedBudgetData = DataPersistenceManager.getSalesBudgetDataByUser(user.name);
      if (savedBudgetData.length > 0) {
        console.log('Loading saved budget data for', user.name, ':', savedBudgetData.length, 'items');

        // Merge saved data with original table data
        const mergedData = [...originalTableData];

        savedBudgetData.forEach(savedItem => {
          const existingIndex = mergedData.findIndex(item =>
            item.customer === savedItem.customer && item.item === savedItem.item
          );

          if (existingIndex >= 0) {
            // Update existing item with saved data
            mergedData[existingIndex] = {
              ...mergedData[existingIndex],
              budget2026: savedItem.budget2026,
              budgetValue2026: savedItem.budgetValue2026,
              discount: savedItem.discount,
              monthlyData: savedItem.monthlyData
            };
          } else {
            // Add new item from saved data
            const newItem = {
              id: Math.max(...mergedData.map(item => item.id)) + 1,
              selected: false,
              customer: savedItem.customer,
              item: savedItem.item,
              category: savedItem.category,
              brand: savedItem.brand,
              itemCombined: `${savedItem.item} (${savedItem.category} - ${savedItem.brand})`,
              budget2025: savedItem.budget2025,
              actual2025: savedItem.actual2025,
              budget2026: savedItem.budget2026,
              rate: savedItem.rate,
              stock: savedItem.stock,
              git: savedItem.git,
              budgetValue2026: savedItem.budgetValue2026,
              discount: savedItem.discount,
              monthlyData: savedItem.monthlyData
            };
            mergedData.push(newItem);
          }
        });

        setOriginalTableData(mergedData);
      }
    }
  }, [user]);

  // Add event listeners for filter changes
  useEffect(() => {
    // Apply filters whenever any filter changes
    const filteredData = originalTableData.filter(item => {
      const matchesCustomer = !selectedCustomer || item.customer.toLowerCase().includes(selectedCustomer.toLowerCase());
      const matchesCategory = !selectedCategory || item.category.toLowerCase().includes(selectedCategory.toLowerCase());
      const matchesBrand = !selectedBrand || item.brand.toLowerCase().includes(selectedBrand.toLowerCase());
      const matchesItem = !selectedItem || item.item.toLowerCase().includes(selectedItem.toLowerCase());
      return matchesCustomer && matchesCategory && matchesBrand && matchesItem;
    });
    setTableData(filteredData);
  }, [selectedCustomer, selectedCategory, selectedBrand, selectedItem, originalTableData]);

  const handleSelectRow = (id: number) => {
    console.log('Row selection toggled for ID:', id);
    setTableData(prev => prev.map(item => {
      if (item.id === id) {
        const newSelected = !item.selected;
        if (newSelected) {
          showNotification(`Selected: ${item.customer} - ${item.item}`, 'success');
        }
        return { ...item, selected: newSelected };
      }
      return item;
    }));
  };

  const handleSelectAll = () => {
    const allSelected = tableData.every(item => item.selected);
    const newState = !allSelected;
    console.log('Select all toggled:', newState);
    setTableData(prev => prev.map(item => ({ ...item, selected: newState })));
    showNotification(newState ? `Selected all ${tableData.length} items` : 'Deselected all items', 'success');
  };

  const handleEditMonthlyData = (rowId: number) => {
    const row = tableData.find(item => item.id === rowId);
    if (row) {
      // If user has manually entered a BUD 2025 value, auto-distribute it first
      if (row.budget2025 > 0 && (!row.monthlyData || row.monthlyData.every(m => m.budgetValue === 0))) {
        // Calculate units from budget2025 and rate
        const totalUnits = Math.floor(row.budget2025 / (row.rate || 1));
        if (totalUnits > 0) {
          const seasonalDistributions = applySeasonalDistribution(totalUnits, 'Default Seasonal');
          const distributedMonthlyData = convertToMonthlyBudget(
            seasonalDistributions,
            row.rate,
            row.stock,
            row.git
          );

          // Update the row with distributed data before editing
          setTableData(prev => prev.map(item =>
            item.id === rowId ? {
              ...item,
              monthlyData: distributedMonthlyData
            } : item
          ));

          setEditingMonthlyData({
            [rowId]: distributedMonthlyData
          });

          // Show notification about auto-distribution
          showNotification(
            `Auto-distributed ${totalUnits} units using holiday-aware pattern: higher quantities in non-holiday months (Jan-Apr), reduced in holiday months (Nov-Dec)`,
            'success'
          );
        } else {
          setEditingMonthlyData({
            [rowId]: [...row.monthlyData]
          });
        }
      } else {
        setEditingMonthlyData({
          [rowId]: [...row.monthlyData]
        });
      }
      setEditingRowId(rowId);
    }
  };

  const handleMonthlyDataChange = (rowId: number, monthIndex: number, field: keyof MonthlyBudget, value: number) => {
    setEditingMonthlyData(prev => ({
      ...prev,
      [rowId]: prev[rowId]?.map((month, index) => 
        index === monthIndex ? { ...month, [field]: value } : month
      ) || []
    }));
  };

  const handleSaveMonthlyData = async (rowId: number) => {
    const monthlyData = editingMonthlyData[rowId];
    if (monthlyData) {
      try {
        const row = tableData.find(item => item.id === rowId);

        // Use simplified mode calculation
        const budgetValue2026 = monthlyData.reduce((sum, month) => sum + month.budgetValue, 0);
        const defaultRate = row?.rate || 1;
        const totalBudget2026 = monthlyData.reduce((sum, month) => sum + (month.budgetValue * defaultRate), 0);
        const totalDiscount = monthlyData.reduce((sum, month) => sum + month.discount, 0);
        const netBudgetValue = totalBudget2026 - totalDiscount;

        // Update monthly data with calculated values
        const updatedMonthlyData = monthlyData.map(month => ({
          ...month,
          rate: month.rate || defaultRate,
          stock: month.stock || row?.stock || 0,
          git: month.git || row?.git || 0
        }));

        // Save to backend
        const updatedBudget = await salesBudgetService.saveMonthlyData(rowId, updatedMonthlyData);

        // Update local state
        setTableData(prev => prev.map(item =>
          item.id === rowId ? {
            ...item,
            monthlyData: updatedMonthlyData,
            budget2026: budgetValue2026,
            budgetValue2026: netBudgetValue,
            discount: totalDiscount
          } : item
        ));

        setEditingRowId(null);
        setEditingMonthlyData(prev => {
          const newData = { ...prev };
          delete newData[rowId];
          return newData;
        });

        // Also save to local persistence for backwards compatibility
        if (user) {
          const savedData: SavedBudgetData = {
            id: `sales_budget_${rowId}_${Date.now()}`,
            customer: row?.customer || 'Unknown',
            item: row?.item || 'Unknown',
            category: row?.category || 'Unknown',
            brand: row?.brand || 'Unknown',
            type: 'sales_budget',
            createdBy: user.name,
            createdAt: new Date().toISOString(),
            lastModified: new Date().toISOString(),
            budget2025: row?.budget2025 || 0,
            actual2025: row?.actual2025 || 0,
            budget2026: budgetValue2026,
            rate: defaultRate,
            stock: row?.stock || 0,
            git: row?.git || 0,
            budgetValue2026: netBudgetValue,
            discount: totalDiscount,
            monthlyData: updatedMonthlyData,
            status: 'saved'
          };

          DataPersistenceManager.saveSalesBudgetData([savedData]);
        }

        showNotification(`✅ Monthly budget data saved to database. Net value: $${netBudgetValue.toLocaleString()} (after $${totalDiscount.toLocaleString()} discount).`, 'success');

      } catch (error) {
        console.error('Failed to save monthly data:', error);
        showNotification('❌ Failed to save monthly data to database. Please try again.', 'error');
      }
    }
  };

  const handleCancelMonthlyEdit = (rowId: number) => {
    setEditingRowId(null);
    setEditingMonthlyData(prev => {
      const newData = { ...prev };
      delete newData[rowId];
      return newData;
    });
  };

  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // Handle customer click for forecast breakdown (Manager only)
  const handleCustomerClick = (customerName: string) => {
    if (user?.role === 'manager') {
      setSelectedCustomerForBreakdown(customerName);
      setIsCustomerForecastModalOpen(true);
    }
  };

  // Generate customer forecast data for the modal
  const generateCustomerForecastData = (customerName: string) => {
    const customerRows = originalTableData.filter(row => row.customer === customerName);
    if (customerRows.length === 0) return null;

    // Calculate totals
    const totalBudgetValue = customerRows.reduce((sum, row) => sum + row.budget2025, 0);
    const totalActualValue = customerRows.reduce((sum, row) => sum + row.actual2025, 0);
    const totalForecastValue = customerRows.reduce((sum, row) => sum + row.budgetValue2026, 0);
    const totalBudgetUnits = customerRows.reduce((sum, row) => sum + Math.floor(row.budget2025 / (row.rate || 1)), 0);
    const totalActualUnits = customerRows.reduce((sum, row) => sum + Math.floor(row.actual2025 / (row.rate || 1)), 0);
    const totalForecastUnits = customerRows.reduce((sum, row) => sum + row.budget2026, 0);

    // Generate monthly data
    const monthlyData = months.map(month => {
      const monthlyBudgetValue = customerRows.reduce((sum, row) => {
        const monthData = row.monthlyData.find(m => m.month === month.short);
        return sum + (monthData?.budgetValue || 0);
      }, 0);
      const monthlyActualValue = customerRows.reduce((sum, row) => {
        const monthData = row.monthlyData.find(m => m.month === month.short);
        return sum + (monthData?.actualValue || 0);
      }, 0);
      const monthlyForecastValue = monthlyBudgetValue; // Same as budget for now
      const monthlyBudgetUnits = Math.floor(monthlyBudgetValue / 100); // Assuming average rate
      const monthlyActualUnits = Math.floor(monthlyActualValue / 100);
      const monthlyForecastUnits = monthlyBudgetUnits;
      const variance = monthlyForecastValue - monthlyBudgetValue;
      const variancePercentage = monthlyBudgetValue > 0 ? (variance / monthlyBudgetValue) * 100 : 0;

      return {
        month: month.short,
        budgetUnits: monthlyBudgetUnits,
        actualUnits: monthlyActualUnits,
        forecastUnits: monthlyForecastUnits,
        budgetValue: monthlyBudgetValue,
        actualValue: monthlyActualValue,
        forecastValue: monthlyForecastValue,
        rate: 100, // Average rate
        variance,
        variancePercentage
      };
    });

    // Generate items data
    const items = customerRows.map(row => ({
      item: row.item,
      category: row.category,
      brand: row.brand,
      budgetUnits: Math.floor(row.budget2025 / (row.rate || 1)),
      actualUnits: Math.floor(row.actual2025 / (row.rate || 1)),
      forecastUnits: row.budget2026,
      budgetValue: row.budget2025,
      actualValue: row.actual2025,
      forecastValue: row.budgetValue2026,
      rate: row.rate
    }));

    return {
      customer: customerName,
      totalBudgetUnits,
      totalActualUnits,
      totalForecastUnits,
      totalBudgetValue,
      totalActualValue,
      totalForecastValue,
      monthlyData,
      items,
      salesmanName: 'John Salesman', // This would come from the data
      lastUpdated: new Date().toLocaleDateString()
    };
  };

  const handleDownloadBudget = () => {
    setIsExportModalOpen(true);
  };

  const handleApplyDistribution = (distributionData: { [itemId: number]: MonthlyBudget[] }) => {
    // Apply the distribution to the table data
    setTableData(prevData =>
      prevData.map(item => {
        if (distributionData[item.id]) {
          const newMonthlyData = distributionData[item.id];
          const newBudget2026 = newMonthlyData.reduce((sum, month) => sum + month.budgetValue, 0);
          const newBudgetValue2026 = newBudget2026 * (item.rate || 1); // Apply rate to get value

          return {
            ...item,
            monthlyData: newMonthlyData,
            budget2026: newBudget2026, // Update BUD 2026 column
            budgetValue2026: newBudgetValue2026
          };
        }
        return item;
      })
    );

    // Update the editing monthly data state
    Object.entries(distributionData).forEach(([itemId, monthlyData]) => {
      setEditingMonthlyData(prev => ({
        ...prev,
        [parseInt(itemId)]: monthlyData
      }));
    });

    showNotification(`Distribution applied to ${Object.keys(distributionData).length} items successfully!`, 'success');
  };

  // Auto-distribute when user enters quantity in BUD 2026 column using seasonal distribution
  const handleBudget2026Change = (itemId: number, value: number) => {
    const distributeQuantitySeasonally = (quantity: number): MonthlyBudget[] => {
        // Use seasonal distribution for automatic allocation
      const seasonalDistributions = applySeasonalDistribution(quantity, 'Default Seasonal');

      return seasonalDistributions.map(dist => ({
        month: dist.month,
        budgetValue: dist.value,
        actualValue: 0,
        rate: 100,
        stock: 0,
        git: 0,
        discount: 0
      }));
    };

    setTableData(prevData =>
      prevData.map(item => {
        if (item.id === itemId) {
          const newMonthlyData = distributeQuantitySeasonally(value);
          const newBudgetValue2026 = value * (item.rate || 1);

          return {
            ...item,
            budget2026: value,
            budgetValue2026: newBudgetValue2026,
            monthlyData: newMonthlyData
          };
        }
        return item;
      })
    );

    // Also update editing monthly data and show notification
    const newMonthlyData = distributeQuantitySeasonally(value);

    if (value > 0) {
      showNotification(
        `Applied holiday-aware distribution: ${value} units allocated with higher quantities in non-holiday months (Jan-Apr), reduced in holiday months (Nov-Dec)`,
        'success'
      );
    }
    setEditingMonthlyData(prev => ({
      ...prev,
      [itemId]: newMonthlyData
    }));
  };

  const handleExport = (config: ExportConfig) => {
    const fileName = `budget_${config.year}.${config.format === 'excel' ? 'xlsx' : config.format}`;
    showNotification(`Preparing download for ${config.year}...`, 'success');

    // Prepare export data based on current filtered table data
    const exportData = {
      metadata: {
        exportDate: new Date().toISOString(),
        year: config.year,
        totalRecords: tableData.length,
        filters: {
          customer: selectedCustomer,
          category: selectedCategory,
          brand: selectedBrand,
          item: selectedItem
        }
      },
      budget: tableData.map(item => ({
        customer: item.customer,
        item: item.item,
        category: item.category,
        brand: item.brand,
        [`budget_${selectedYear2025}`]: item.budget2025,
        [`actual_${selectedYear2025}`]: item.actual2025,
        [`budget_${selectedYear2026}`]: item.budget2026,
        rate: item.rate,
        stock: item.stock,
        git: item.git,
        budgetValue2026: item.budgetValue2026,
        discount: item.discount,
        ...(config.includeMetadata && {
          monthlyData: item.monthlyData
        })
      })),
      summary: {
        totalBudget2025: totalBudget2025,
        totalActual2025: totalActual2025,
        totalBudget2026: totalBudget2026,
        budgetGrowth: budgetGrowth
      }
    };

    // Convert to different formats
    let downloadContent = '';
    let mimeType = '';

    switch (config.format) {
      case 'csv':
        // Convert to CSV
        const csvHeaders = Object.keys(exportData.budget[0] || {}).join(',');
        const csvRows = exportData.budget.map(row =>
          Object.values(row).map(value =>
            typeof value === 'string' ? `"${value}"` : value
          ).join(',')
        );
        downloadContent = [csvHeaders, ...csvRows].join('\n');
        mimeType = 'text/csv';
        break;

      case 'json':
        downloadContent = JSON.stringify(exportData, null, 2);
        mimeType = 'application/json';
        break;

      case 'excel':
        // For Excel, we'll create a CSV that can be opened in Excel
        const excelHeaders = Object.keys(exportData.budget[0] || {}).join(',');
        const excelRows = exportData.budget.map(row =>
          Object.values(row).map(value =>
            typeof value === 'string' ? `"${value}"` : value
          ).join(',')
        );
        downloadContent = [excelHeaders, ...excelRows].join('\n');
        mimeType = 'text/csv';
        break;

      default:
        downloadContent = JSON.stringify(exportData, null, 2);
        mimeType = 'application/json';
    }

    // Create and trigger download
    const blob = new Blob([downloadContent], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showNotification(`Download completed: ${fileName}`, 'success');
  };



  const handleAddNewItem = async (itemData: NewItemData) => {
    if (newAdditionType === 'customer') {
      showNotification(`Customer "${itemData.customerName}" added successfully`, 'success');
    } else {
      try {
        // Create new item in backend
        const newBudgetData = {
          customer: selectedCustomer || "New Customer",
          item: itemData.itemName || "New Item",
          category: "New Category",
          brand: "New Brand",
          budget_2025: 0,
          actual_2025: 0,
          budget_2026: 0,
          rate: itemData.unitPrice || 0,
          stock: itemData.stockLevel || 0,
          git: itemData.gitLevel || 0,
          discount: 0,
          monthly_data: months.map(month => ({
            month: month.short,
            budgetValue: 0,
            actualValue: 0,
            rate: itemData.unitPrice || 0,
            stock: itemData.stockLevel || 0,
            git: itemData.gitLevel || 0,
            discount: 0
          }))
        };

        const createdBudget = await salesBudgetService.createBudget(newBudgetData);

        // Transform to component format
        const newRow: SalesBudgetItem = {
          id: createdBudget.id,
          selected: false,
          customer: createdBudget.customer,
          item: createdBudget.item,
          category: createdBudget.category,
          brand: createdBudget.brand,
          itemCombined: `${createdBudget.item} (${createdBudget.category} - ${createdBudget.brand})`,
          budget2025: createdBudget.budget_2025,
          actual2025: createdBudget.actual_2025,
          budget2026: createdBudget.budget_2026,
          rate: createdBudget.rate,
          stock: createdBudget.stock,
          git: createdBudget.git,
          budgetValue2026: createdBudget.budgetValue2026 || 0,
          discount: createdBudget.discount,
          monthlyData: createdBudget.monthly_data
        };

        setOriginalTableData(prev => [...prev, newRow]);
        showNotification(`✅ Item "${itemData.itemName}" added successfully to database`, 'success');

      } catch (error) {
        console.error('Failed to add new item:', error);
        showNotification('❌ Failed to add item to database. Please try again.', 'error');
      }
    }
  };



  const handleYearlyBudgetSave = (budgetData: any) => {
    // Save to BudgetContext for sharing with RollingForecast
    addYearlyBudget({
      customer: budgetData.customer,
      item: budgetData.item,
      category: budgetData.category,
      brand: budgetData.brand,
      year: budgetData.year,
      totalBudget: budgetData.totalBudget,
      monthlyData: budgetData.monthlyData,
      createdBy: user?.name || 'Unknown'
    });

    // Add new yearly budget item to table
    const newId = Math.max(...originalTableData.map(item => item.id)) + 1;
    const newRow: SalesBudgetItem = {
      id: newId,
      selected: false,
      customer: budgetData.customer,
      item: budgetData.item,
      category: budgetData.category,
      brand: budgetData.brand,
      itemCombined: `${budgetData.item} (${budgetData.category} - ${budgetData.brand})`,
      budget2025: 0,
      actual2025: 0,
      budget2026: budgetData.totalBudget,
      rate: budgetData.monthlyData[0]?.rate || 0,
      stock: budgetData.monthlyData.reduce((sum: number, month: any) => sum + month.stock, 0),
      git: budgetData.monthlyData.reduce((sum: number, month: any) => sum + month.git, 0),
      budgetValue2026: budgetData.totalBudget,
      discount: budgetData.monthlyData.reduce((sum: number, month: any) => sum + month.discount, 0),
      monthlyData: budgetData.monthlyData
    };

    setOriginalTableData(prev => [...prev, newRow]);

    // Save to persistence manager for cross-user visibility
    if (user) {
      const savedData: SavedBudgetData = {
        id: `yearly_budget_${newId}_${Date.now()}`,
        customer: budgetData.customer,
        item: budgetData.item,
        category: budgetData.category,
        brand: budgetData.brand,
        type: 'sales_budget',
        createdBy: user.name,
        createdAt: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        budget2025: 0,
        actual2025: 0,
        budget2026: budgetData.totalBudget,
        rate: budgetData.monthlyData[0]?.rate || 0,
        stock: budgetData.monthlyData.reduce((sum: number, month: any) => sum + month.stock, 0),
        git: budgetData.monthlyData.reduce((sum: number, month: any) => sum + month.git, 0),
        budgetValue2026: budgetData.totalBudget,
        discount: budgetData.monthlyData.reduce((sum: number, month: any) => sum + month.discount, 0),
        monthlyData: budgetData.monthlyData,
        status: 'saved'
      };

      DataPersistenceManager.saveSalesBudgetData([savedData]);
      console.log('Yearly budget data saved for manager visibility:', savedData);
    }

    showNotification(`Yearly budget for "${budgetData.item}" created successfully and shared with Rolling Forecast. Data preserved in table and visible to managers.`, 'success');
  };

  // Submit budgets for manager approval while preserving data in table
  const handleSubmitForApproval = () => {
    setIsSubmittingForApproval(true);

    try {
      // Get budgets from both sources: yearlyBudgets and table data with budget2026 > 0
      const userBudgets = yearlyBudgets.filter(budget => budget.createdBy === user?.name);

      // Convert table data entries with budget2026 > 0 to budget format
      const tableBudgets = tableData
        .filter(row => row.budget2026 > 0)
        .map(row => ({
          id: `table_budget_${row.id}`,
          customer: row.customer,
          item: row.item,
          category: row.category,
          brand: row.brand,
          year: selectedYear2026,
          totalBudget: row.budgetValue2026,
          monthlyData: row.monthlyData,
          createdBy: user?.name || 'Unknown',
          createdAt: new Date().toISOString()
        }));

      const allBudgets = [...userBudgets, ...tableBudgets];

      if (allBudgets.length === 0) {
        showNotification('No budgets created to submit. Please create yearly budgets or set budget values in the table first.', 'error');
        setIsSubmittingForApproval(false);
        return;
      }

      // Prepare saved budget data for submission copies
      const savedBudgetData: SavedBudgetData[] = tableData
        .filter(row => row.budget2026 > 0)
        .map(row => ({
          id: `saved_budget_${row.id}_${Date.now()}`,
          customer: row.customer,
          item: row.item,
          category: row.category,
          brand: row.brand,
          type: 'sales_budget' as const,
          createdBy: user?.name || 'Unknown',
          createdAt: new Date().toISOString(),
          lastModified: new Date().toISOString(),
          budget2025: row.budget2025,
          actual2025: row.actual2025,
          budget2026: row.budget2026,
          rate: row.rate,
          stock: row.stock,
          git: row.git,
          budgetValue2026: row.budgetValue2026,
          discount: row.discount,
          monthlyData: row.monthlyData,
          status: 'saved'
        }));

      // Submit to workflow
      const workflowId = submitForApproval(allBudgets);

      // Create submission copies while preserving original data
      DataPersistenceManager.saveSubmissionCopies(savedBudgetData, [], workflowId);

      // Update status of original saved data to track submission without removing them
      savedBudgetData.forEach(item => {
        DataPersistenceManager.updateSalesBudgetStatus(item.id, 'submitted');
      });

      showNotification(
        `Successfully submitted ${allBudgets.length} budget(s) for manager approval. ` +
        `Workflow ID: ${workflowId.slice(-6)}. ✅ Original data preserved in table for other purposes.`,
        'success'
      );

      // IMPORTANT: DO NOT clear budget data from table - keep it for other purposes
      // The data remains available for:
      // 1. Further editing before final approval
      // 2. Reference and reporting purposes
      // 3. Backup in case submission needs to be reprocessed
      // 4. Historical tracking and analysis
      console.log('Budget data preserved in table after submission for approval');
      console.log('Saved budget entries:', savedBudgetData.length);
      console.log('Original table data maintained for other purposes');

    } catch (error) {
      console.error('Submission error:', error);
      showNotification('Failed to submit budgets for approval. Please try again.', 'error');
    } finally {
      setIsSubmittingForApproval(false);
    }
  };

  // Calculate totals based on filtered data and year selection
  const totalBudget2025 = selectedYear2025 === '2025'
    ? tableData.reduce((sum, item) => sum + item.budget2025, 0)
    : tableData.reduce((sum, item) => sum + item.budgetValue2026, 0);
  const totalActual2025 = selectedYear2025 === '2025'
    ? tableData.reduce((sum, item) => sum + item.actual2025, 0)
    : 0; // No actual data for future years
  const totalBudget2026 = selectedYear2026 === '2026'
    ? tableData.reduce((sum, item) => sum + item.budgetValue2026, 0)
    : tableData.reduce((sum, item) => sum + item.budget2025, 0);

  // Calculate units from monthly data for 2026, otherwise use standard calculation
  const totalUnits2025 = selectedYear2025 === '2025'
    ? tableData.reduce((sum, item) => sum + Math.floor(item.budget2025 / (item.rate || 1)), 0)
    : tableData.reduce((sum, item) => sum + item.budget2026, 0);
  const totalUnits2026 = selectedYear2026 === '2026'
    ? tableData.reduce((sum, item) => sum + item.budget2026, 0) // budget2026 stores total units from monthly data
    : tableData.reduce((sum, item) => sum + Math.floor(item.budget2025 / (item.rate || 1)), 0);
  const totalActualUnits2025 = selectedYear2025 === '2025'
    ? tableData.reduce((sum, item) => sum + Math.floor(item.actual2025 / (item.rate || 1)), 0)
    : 0;

  const budgetGrowth = totalBudget2025 > 0 ? ((totalBudget2026 - totalBudget2025) / totalBudget2025) * 100 : 0;

  // Show loading state
  if (isLoadingData) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-100 font-sans flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading budget data from database...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-100 font-sans">
        {/* Data Loading Error Display */}
        {dataError && (
          <div className="bg-orange-50 border border-orange-200 rounded-md p-4 m-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-5 w-5 text-orange-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-orange-800">Data Loading Warning</h3>
                <div className="mt-2 text-sm text-orange-700">{dataError}</div>
                <div className="mt-2">
                  <button
                    onClick={loadBudgetData}
                    className="bg-orange-100 hover:bg-orange-200 text-orange-800 text-xs px-3 py-1 rounded"
                  >
                    Retry Loading
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Budget Context Error Display */}
        {budgetError && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 m-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-5 w-5 text-red-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Budget Data Error</h3>
                <div className="mt-2 text-sm text-red-700">{budgetError}</div>
              </div>
            </div>
          </div>
        )}
        {/* Main Content Container */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 m-4 overflow-hidden">
          {/* Stats Cards Row */}
          <div className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              {/* Stock Card */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
                <div className="bg-green-200 p-3 rounded-full">
                  <TrendingUp className="w-7 h-7 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Stock</p>
                  <p className="text-xl font-bold text-green-600">
                    {tableData.reduce((sum, item) => sum + item.stock, 0).toLocaleString()} units
                  </p>
                </div>
              </div>

              {/* Enhanced Stock Management Card */}
              <div className="bg-gradient-to-br from-green-50 to-blue-50 border border-green-200 rounded-lg p-4 flex items-center gap-3 relative">
                <div className="bg-green-200 p-3 rounded-full">
                  <TrendingUp className="w-7 h-7 text-green-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-gray-600 font-medium">Total Stock</p>
                    <button
                      onClick={() => setIsStockManagementModalOpen(true)}
                      className="text-blue-600 hover:text-blue-800 transition-colors"
                      title="Open Stock Management Dashboard"
                    >
                      <InfoIcon className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-xl font-bold text-green-600">
                    {tableData.reduce((sum, item) => sum + item.stock, 0).toLocaleString()} units
                  </p>
                  <div className="flex items-center gap-4 mt-1">
                    <div className="text-xs text-gray-600">
                      <span className="font-medium">GIT:</span> {tableData.reduce((sum, item) => sum + item.git, 0).toLocaleString()}
                    </div>
                    <button
                      onClick={() => setIsStockManagementModalOpen(true)}
                      className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded hover:bg-blue-200 transition-colors"
                    >
                      📦 Manage Stock
                    </button>
                  </div>
                </div>
              </div>

              {/* Download, Set Distribution, Seasonal Growth, and Admin Stock Buttons */}
              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={() => setIsSeasonalGrowthModalOpen(true)}
                  className="bg-green-600 text-white font-semibold px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-700 transition-colors transform hover:scale-105 active:scale-95"
                  title="View holiday-aware seasonal growth patterns and distribution logic"
                >
                  <Calendar className="w-5 h-5" />
                  <span>Seasonal Growth</span>
                </button>
                <button
                  onClick={() => setIsSetDistributionModalOpen(true)}
                  className="bg-purple-600 text-white font-semibold px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-purple-700 transition-colors transform hover:scale-105 active:scale-95"
                  title="Set automatic distribution for filtered items"
                >
                  <PieChart className="w-5 h-5" />
                  <span>Set Distribution</span>
                </button>
                {user?.role === 'admin' && (
                  <button
                    onClick={() => setIsAdminStockModalOpen(true)}
                    className="bg-red-600 text-white font-semibold px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-red-700 transition-colors transform hover:scale-105 active:scale-95"
                    title="Manage global stock quantities for all users"
                  >
                    <Package className="w-5 h-5" />
                    <span>Admin Stock</span>
                  </button>
                )}
                <button
                  onClick={handleDownloadBudget}
                  className="bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors transform hover:scale-105 active:scale-95"
                  title="Download budget data for current year"
                >
                  <DownloadIcon className="w-5 h-5" />
                  <span>Download Budget ({selectedYear2026})</span>
                </button>
              </div>
            </div>

            {/* Global Stock Summary Widget */}
            <div className="mb-4">
              <StockSummaryWidget compact={false} />
            </div>

            {/* Info Alert and View Toggle */}
            <div className="flex justify-between items-center mb-4">
              {activeView === 'item-wise' && (
                <div className="bg-orange-50 border-l-4 border-orange-400 text-orange-800 p-3 rounded-r-lg flex items-center gap-2 mb-4">
                  <InfoIcon className="w-5 h-5" />
                  <div>
                    <p className="font-medium">Item-Wise Mode Active</p>
                    <p className="text-xs text-orange-700">Customer column is hidden. Focus on item-only sales budget and forecast data.</p>
                  </div>
                </div>
              )}
              {user?.role === 'salesman' ? (
                <div className="bg-blue-50 border-l-4 border-blue-600 text-blue-800 p-4 rounded-r-lg flex items-center gap-2">
                  <InfoIcon className="w-5 h-5" />
                  <div>
                    <p className="font-bold">Instructions: Select a customer row to open monthly budget forms</p>
                    <p className="text-xs text-blue-700 mt-1">💡 Simplified 2-row layout shows months and budget values for easy entry and budget growth tracking</p>
                  </div>
                </div>
              ) : (
                <div className="bg-purple-50 border-l-4 border-purple-600 text-purple-800 p-4 rounded-r-lg flex items-center gap-2">
                  <InfoIcon className="w-5 h-5" />
                  <div>
                    <p className="font-bold">Manager View: Sales Budget Overview (View-Only)</p>
                    <p className="text-xs text-purple-700 mt-1">👑 View salesman-created budgets and send to supply chain when ready. Stock management available for oversight.</p>
                  </div>
                </div>
              )}
              <div className="flex shadow-sm rounded-md overflow-hidden">
                <button
                  onClick={() => {
                    console.log('Switching to customer-item view');
                    setActiveView('customer-item');
                    showNotification('Switched to Customer-Item view', 'success');
                  }}
                  className={`px-6 py-2 font-semibold transition-all duration-200 ${
                    activeView === 'customer-item'
                      ? 'bg-orange-500 text-white shadow-md transform scale-105'
                      : 'bg-white text-gray-600 border border-gray-300 hover:bg-orange-50 hover:text-orange-600'
                  }`}
                  title="View data organized by customer and their items"
                >
                  Customer - Item
                </button>
                <button
                  onClick={() => {
                    console.log('Switching to item-wise view - hiding customer column');
                    setActiveView('item-wise');
                    showNotification('Switched to Item-Wise view: Customer column hidden to focus on items only', 'success');
                  }}
                  className={`px-6 py-2 font-semibold transition-all duration-200 ${
                    activeView === 'item-wise'
                      ? 'bg-orange-500 text-white shadow-md transform scale-105'
                      : 'bg-white text-gray-600 border border-gray-300 hover:bg-orange-50 hover:text-orange-600'
                  }`}
                  title="Item-focused view: Hide customer column to focus only on item data for sales budget and forecast"
                >
                  Item Wise
                </button>
              </div>
            </div>

            {/* Quick Filter Actions */}
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-gray-600">
                <span className="font-medium">Active Filters:</span>
                {!selectedCustomer && !selectedCategory && !selectedBrand && !selectedItem && (
                  <span className="text-gray-400 ml-1">None</span>
                )}
                {selectedCustomer && <span className="ml-1 px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">Customer: {selectedCustomer}</span>}
                {selectedCategory && <span className="ml-1 px-2 py-1 bg-green-100 text-green-800 rounded text-xs">Category: {selectedCategory}</span>}
                {selectedBrand && <span className="ml-1 px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs">Brand: {selectedBrand}</span>}
                {selectedItem && <span className="ml-1 px-2 py-1 bg-orange-100 text-orange-800 rounded text-xs">Item: {selectedItem}</span>}
              </div>
              {(selectedCustomer || selectedCategory || selectedBrand || selectedItem) && (
                <button
                  onClick={() => {
                    console.log('Quick clearing all filters');
                    setSelectedCustomer('');
                    setSelectedCategory('');
                    setSelectedBrand('');
                    setSelectedItem('');
                    showNotification('All filters cleared', 'success');
                  }}
                  className="text-xs bg-red-100 text-red-700 px-3 py-1 rounded hover:bg-red-200 transition-colors flex items-center gap-1"
                  title="Clear all active filters"
                >
                  <X className="w-3 h-3" />
                  Clear Filters
                </button>
              )}
            </div>

            {/* Filters and Action Buttons Row */}
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-4">
              {/* Customer Filter */}
              <div className={`bg-white p-3 rounded-lg shadow-sm border-2 transition-all duration-200 ${
                selectedCustomer ? 'border-blue-400 bg-blue-50' : 'border-yellow-400'
              }`}>
                <label className="block text-xs font-medium text-gray-700 mb-1 flex items-center gap-1">
                  👤 CUSTOMER:
                  {selectedCustomer && <span className="text-blue-600">✓</span>}
                </label>
                <select
                  className="w-full text-xs p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                  value={selectedCustomer}
                  onChange={(e) => {
                    console.log('Customer filter changed:', e.target.value);
                    setSelectedCustomer(e.target.value);
                    if (e.target.value) showNotification(`Filtered by customer: ${e.target.value}`, 'success');
                  }}
                >
                  <option value="">Select customer</option>
                  <option value="Action Aid International (Tz)">Action Aid International (Tz)</option>
                  <option value="other">Other Customer</option>
                </select>
              </div>

              {/* Category Filter */}
              <div className={`bg-white p-3 rounded-lg shadow-sm border-2 transition-all duration-200 ${
                selectedCategory ? 'border-green-400 bg-green-50' : 'border-yellow-400'
              }`}>
                <label className="block text-xs font-medium text-gray-700 mb-1 flex items-center gap-1">
                  📦 CATEGORY:
                  {selectedCategory && <span className="text-green-600">✓</span>}
                </label>
                <select
                  className="w-full text-xs p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors"
                  value={selectedCategory}
                  onChange={(e) => {
                    console.log('Category filter changed:', e.target.value);
                    setSelectedCategory(e.target.value);
                    if (e.target.value) showNotification(`Filtered by category: ${e.target.value}`, 'success');
                  }}
                >
                  <option value="">Select category</option>
                  <option value="Tyres">Tyres</option>
                  <option value="Accessories">Accessories</option>
                </select>
              </div>

              {/* Brand Filter */}
              <div className={`bg-white p-3 rounded-lg shadow-sm border-2 transition-all duration-200 ${
                selectedBrand ? 'border-purple-400 bg-purple-50' : 'border-yellow-400'
              }`}>
                <label className="block text-xs font-medium text-gray-700 mb-1 flex items-center gap-1">
                  🏷️ BRAND:
                  {selectedBrand && <span className="text-purple-600">✓</span>}
                </label>
                <select
                  className="w-full text-xs p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors"
                  value={selectedBrand}
                  onChange={(e) => {
                    console.log('Brand filter changed:', e.target.value);
                    setSelectedBrand(e.target.value);
                    if (e.target.value) showNotification(`Filtered by brand: ${e.target.value}`, 'success');
                  }}
                >
                  <option value="">Select brand</option>
                  <option value="BF Goodrich">BF Goodrich</option>
                  <option value="Michelin">Michelin</option>
                  <option value="Generic">Generic</option>
                </select>
              </div>

              {/* Item Filter */}
              <div className={`bg-white p-3 rounded-lg shadow-sm border-2 transition-all duration-200 ${
                selectedItem ? 'border-orange-400 bg-orange-50' : 'border-yellow-400'
              }`}>
                <label className="block text-xs font-medium text-gray-700 mb-1 flex items-center gap-1">
                  🔧 ITEM:
                  {selectedItem && <span className="text-orange-600">✓</span>}
                </label>
                <select
                  className="w-full text-xs p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors"
                  value={selectedItem}
                  onChange={(e) => {
                    console.log('Item filter changed:', e.target.value);
                    setSelectedItem(e.target.value);
                    if (e.target.value) showNotification(`Filtered by item: ${e.target.value}`, 'success');
                  }}
                >
                  <option value="">Select item</option>
                  <option value="BF GOODRICH TYRE 235/85R16">BF GOODRICH TYRE 235/85R16</option>
                  <option value="BF GOODRICH TYRE 265/65R17">BF GOODRICH TYRE 265/65R17</option>
                  <option value="VALVE 0214 TR 414J">VALVE 0214 TR 414J</option>
                  <option value="MICHELIN TYRE 265/65R17">MICHELIN TYRE 265/65R17</option>
                </select>
              </div>

              {/* Year Selectors */}
              <div className="bg-white p-3 rounded-lg shadow-sm border-2 border-indigo-400">
                <label className="block text-xs font-medium text-gray-700 mb-1 flex items-center gap-1">
                  📅 YEARS:
                </label>
                <div className="flex gap-1">
                  <select
                    className="w-full text-xs p-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                    value={selectedYear2025}
                    onChange={(e) => {
                      console.log('Year 2025 changed:', e.target.value);
                      setSelectedYear2025(e.target.value);
                      showNotification(`Changed base year to ${e.target.value}`, 'success');
                    }}
                  >
                    <option value="2024">2024</option>
                    <option value="2025">2025</option>
                  </select>
                  <select
                    className="w-full text-xs p-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                    value={selectedYear2026}
                    onChange={(e) => {
                      console.log('Year 2026 changed:', e.target.value);
                      setSelectedYear2026(e.target.value);
                      showNotification(`Changed target year to ${e.target.value}`, 'success');
                    }}
                  >
                    <option value="2025">2025</option>
                    <option value="2026">2026</option>
                  </select>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="bg-white p-3 rounded-lg shadow-sm border-2 border-yellow-400">
                <div className="flex flex-col gap-1">
                  {user?.role === 'salesman' && (
                    <>
                      <button
                        onClick={() => {
                          console.log('New Addition button clicked');
                          setIsNewAdditionModalOpen(true);
                        }}
                        className="bg-gray-500 text-white font-semibold px-2 py-1 rounded-md text-xs flex items-center gap-1 hover:bg-gray-600 transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-sm hover:shadow-md"
                        title="Add new customer or item to the budget (Salesman only)"
                      >
                        <Plus className="w-4 h-4" />
                        <span>New Addition</span>
                      </button>

                      <button
                        onClick={() => {
                          console.log('Yearly Budget button clicked');
                          setIsYearlyBudgetModalOpen(true);
                        }}
                        className="bg-green-600 text-white font-semibold px-2 py-1 rounded-md text-xs flex items-center gap-1 hover:bg-green-700 transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-sm hover:shadow-md"
                        title="Create new yearly budget plan with monthly breakdown (Salesman only)"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Yearly Budget</span>
                      </button>

                      <button
                        onClick={handleSubmitForApproval}
                        disabled={isSubmittingForApproval || yearlyBudgets.length === 0}
                        className="bg-blue-600 text-white font-semibold px-2 py-1 rounded-md text-xs flex items-center gap-1 hover:bg-blue-700 transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Submit all your budgets to manager for approval"
                      >
                        <Send className="w-4 h-4" />
                        <span>{isSubmittingForApproval ? 'Submitting...' : 'Submit for Approval'}</span>
                      </button>
                    </>
                  )}

                  <button
                    onClick={() => {
                      console.log('Stock Management button clicked');
                      setIsStockManagementModalOpen(true);
                    }}
                    className="bg-green-100 text-green-800 font-semibold px-2 py-1 rounded-md text-xs flex items-center gap-1 hover:bg-green-200 transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-sm hover:shadow-md"
                    title={user?.role === 'manager' ? "View stock overview dashboard" : "Open comprehensive stock management dashboard"}
                  >
                    <Package className="w-4 h-4" />
                    <span>Stock {user?.role === 'manager' ? 'Overview' : 'Manager'}</span>
                  </button>

                  {user?.role === 'manager' && (
                    <>
                      <button
                        onClick={() => {
                          console.log('Manager Dashboard button clicked');
                          setIsManagerDashboardOpen(true);
                        }}
                        className="bg-purple-100 text-purple-800 font-semibold px-2 py-1 rounded-md text-xs flex items-center gap-1 hover:bg-purple-200 transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-sm hover:shadow-md"
                        title="Open customer-salesman management dashboard (Managers only)"
                      >
                        <Users className="w-4 h-4" />
                        <span>Customer Dashboard</span>
                      </button>
                      <button
                        onClick={() => {
                          const selectedBudgets = tableData.filter(row => row.selected && row.budgetValue2026 > 0);
                          if (selectedBudgets.length === 0) {
                            showNotification('Please select budget items with values to send to supply chain', 'error');
                            return;
                          }

                          // Create supply chain submission
                          const submissionData = {
                            id: `manager_budget_${Date.now()}`,
                            type: 'sales_budget_approval',
                            customers: selectedBudgets.map(b => b.customer),
                            submittedBy: user?.name || 'Manager',
                            submittedAt: new Date().toISOString(),
                            items: selectedBudgets.length,
                            totalValue: selectedBudgets.reduce((sum, b) => sum + b.budgetValue2026, 0),
                            totalUnits: selectedBudgets.reduce((sum, b) => sum + b.budget2026, 0),
                            details: selectedBudgets
                          };

                          console.log('Sending budget to supply chain:', submissionData);
                          showNotification(`${selectedBudgets.length} budget items sent to supply chain for processing`, 'success');

                          // Deselect items
                          setTableData(prev => prev.map(item => ({ ...item, selected: false })));
                        }}
                        className="bg-blue-100 text-blue-800 font-semibold px-2 py-1 rounded-md text-xs flex items-center gap-1 hover:bg-blue-200 transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-sm hover:shadow-md"
                        title="Send selected budgets to supply chain (Managers only)"
                      >
                        <Truck className="w-4 h-4" />
                        <span>Send to Supply Chain</span>
                      </button>
                    </>
                  )}

                  {/* Follow-backs button for salesman and manager */}
                  {(user?.role === 'salesman' || user?.role === 'manager') && (
                    <FollowBacksButton />
                  )}
                </div>
              </div>
            </div>


            {/* Real-time Update Indicator */}
            {totalBudget2026 > 0 && (
              <div className="mb-2 p-2 bg-blue-50 border-l-4 border-blue-400 rounded-r-lg">
                <p className="text-sm text-blue-800 flex items-center gap-2">
                  <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                  <span className="font-medium">Budget statistics updated in real-time</span>
                  <span className="text-xs text-blue-600">• Enter monthly data to see growth calculations</span>
                </p>
              </div>
            )}

            {/* Data Preservation Status */}
            {user && (
              <DataPreservationIndicator
                itemsCount={tableData.length}
                submittedCount={DataPersistenceManager.getSubmittedSalesBudgetData().filter(item => item.createdBy === user.name).length}
                preservedCount={DataPersistenceManager.getOriginalSalesBudgetData().filter(item => item.createdBy === user.name).length}
                dataType="budget"
                compact={true}
              />
            )}

            {/* Stats Grid - Real-time Budget Statistics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">{/* Animated when data changes */}
              <div className="bg-white p-2 rounded shadow-sm border border-gray-200 transition-all duration-300 hover:shadow-md">
                <div className="flex flex-col gap-1">
                  <p className="text-xs text-gray-600 font-medium">Budget {selectedYear2025}</p>
                  <p className="text-lg font-bold text-blue-900 transition-colors duration-300">${totalBudget2025.toLocaleString()}</p>
                  <p className="text-xs text-blue-600 font-medium">
                    {totalUnits2025.toLocaleString()} Units
                  </p>
                </div>
              </div>
              <div className="bg-white p-2 rounded shadow-sm border border-gray-200 transition-all duration-300 hover:shadow-md">
                <div className="flex flex-col gap-1">
                  <p className="text-xs text-gray-600 font-medium">Actual {selectedYear2025}</p>
                  <p className="text-lg font-bold text-green-900 transition-colors duration-300">${totalActual2025.toLocaleString()}</p>
                  <p className="text-xs text-green-600 font-medium">
                    {totalActualUnits2025.toLocaleString()} Units
                  </p>
                </div>
              </div>
              <div className={`p-2 rounded shadow-sm border-2 transition-all duration-500 hover:shadow-lg ${
                totalBudget2026 > 0
                  ? 'bg-gradient-to-br from-purple-50 to-purple-100 border-purple-300 shadow-purple-100'
                  : 'bg-white border-gray-200'
              }`}>
                <div className="flex flex-col gap-1">
                  <p className="text-xs text-gray-600 font-medium">Budget {selectedYear2026}</p>
                  <p className={`text-lg font-bold transition-all duration-500 ${
                    totalBudget2026 > 0 ? 'text-purple-900 scale-105' : 'text-gray-500'
                  }`}>${totalBudget2026.toLocaleString()}</p>
                  <p className={`text-xs font-medium transition-colors duration-500 ${
                    totalBudget2026 > 0 ? 'text-purple-600' : 'text-gray-400'
                  }`}>
                    {totalUnits2026.toLocaleString()} Units
                  </p>
                  {totalBudget2026 > 0 && (
                    <div className="mt-1">
                      <span className="inline-block px-1.5 py-0.5 bg-purple-200 text-purple-800 text-xs rounded-full font-medium animate-pulse">
                        📈 Updated
                      </span>
                    </div>
                  )}
                </div>
              </div>
              <div className={`p-2 rounded shadow-sm border-2 transition-all duration-500 hover:shadow-lg ${
                budgetGrowth > 0
                  ? 'bg-gradient-to-br from-green-50 to-green-100 border-green-300'
                  : budgetGrowth < 0
                    ? 'bg-gradient-to-br from-red-50 to-red-100 border-red-300'
                    : 'bg-white border-gray-200'
              }`}>
                <div className="flex flex-col gap-1">
                  <p className="text-xs text-gray-600 font-medium">Budget Growth (%)</p>
                  <p className={`text-lg font-bold transition-all duration-500 flex items-center gap-1 ${
                    budgetGrowth > 0
                      ? 'text-green-900'
                      : budgetGrowth < 0
                        ? 'text-red-900'
                        : 'text-gray-500'
                  }`}>
                    {budgetGrowth > 0 && '📈'}
                    {budgetGrowth < 0 && '📉'}
                    {budgetGrowth === 0 && '���️'}
                    {budgetGrowth.toFixed(1)}%
                  </p>
                  <p className="text-xs text-gray-600">From {selectedYear2025} to {selectedYear2026}</p>
                  {budgetGrowth !== -100 && totalBudget2026 > 0 && (
                    <div className="mt-1">
                      <span className={`inline-block px-1.5 py-0.5 text-xs rounded-full font-medium ${
                        budgetGrowth > 0
                          ? 'bg-green-200 text-green-800'
                          : 'bg-orange-200 text-orange-800'
                      }`}>
                        {budgetGrowth > 0 ? '🚀 Growing!' : '⚠️ Declining'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Enhanced Data Table with Sticky Headers */}
            <div className="relative">
              {tableData.length === 0 ? (
                <div className="text-center py-8 text-gray-500 border border-gray-300 rounded-lg bg-white">
                  <p className="text-lg">No data available with current filters</p>
                  <p className="text-sm">Try adjusting your filter criteria or clear the filters</p>
                  <button
                    onClick={() => {
                      console.log('Clearing all filters');
                      setSelectedCustomer('');
                      setSelectedCategory('');
                      setSelectedBrand('');
                      setSelectedItem('');
                      showNotification('All filters cleared', 'success');
                    }}
                    className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
                  >
                    Clear All Filters
                  </button>
                </div>
              ) : (
                <div className="border border-gray-300 rounded-lg overflow-auto" style={{maxHeight: '600px'}}>
                  <table className="sales-budget-table bg-white" style={{minWidth: '1200px'}}>
                    {/* Sticky Header */}
                    <thead className="bg-gray-50">
                      <tr className="table-header-row">
                        <th className="p-2 text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-r border-gray-200" style={{width: '50px'}}>
                          <input
                            type="checkbox"
                            className="w-4 h-4 accent-blue-600"
                            checked={tableData.every(item => item.selected)}
                            onChange={handleSelectAll}
                          />
                        </th>
                        {activeView === 'customer-item' ? (
                          <>
                            <th className="p-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-r border-gray-200" style={{width: '150px'}}>
                              Customer
                            </th>
                            <th className="p-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-r border-gray-200" style={{width: '200px'}}>
                              Item (Category - Brand)
                            </th>
                          </>
                        ) : (
                          <>
                            <th className="p-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-r border-gray-200" style={{width: '200px'}}>
                              Item (Category - Brand)
                            </th>
                            <th className="p-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-r border-gray-200" style={{width: '150px'}}>
                              Customer
                            </th>
                          </>
                        )}
                        <th className="p-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200" style={{width: '100px'}}>
                          BUD {selectedYear2025}
                        </th>
                        <th className="p-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200" style={{width: '100px'}}>
                          ACT {selectedYear2025}
                        </th>
                        <th className="p-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200 bg-blue-50" style={{width: '100px'}}>
                          BUD {selectedYear2026}
                        </th>
                        <th className="p-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200" style={{width: '80px'}}>
                          RATE
                        </th>
                        <th className="p-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200" style={{width: '70px'}}>
                          STK
                        </th>
                        <th className="p-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200" style={{width: '70px'}}>
                          <div className="flex flex-col items-center">
                            <span>GIT</span>
                            <span className="text-xs text-blue-500 normal-case">👑 Admin</span>
                          </div>
                        </th>
                        <th className="p-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200" style={{width: '120px'}}>
                          BUD {selectedYear2026} Value
                        </th>
                        <th className="p-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200" style={{width: '100px'}}>
                          DISCOUNT
                        </th>
                        <th className="p-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200" style={{width: '100px'}}>
                          Actions
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {tableData.map(row => (
                        <React.Fragment key={row.id}>
                          <tr className={`hover:bg-gray-50 ${row.selected ? 'bg-blue-50' : ''}`}>
                            <td className="p-2 border-b border-r border-gray-200 text-center">
                              <input
                                type="checkbox"
                                className="w-4 h-4 accent-blue-600"
                                checked={row.selected}
                                onChange={() => handleSelectRow(row.id)}
                              />
                            </td>
                            {activeView === 'customer-item' ? (
                              <>
                                <td className="p-2 border-b border-r border-gray-200 text-xs">
                                  <div className="flex items-center justify-between">
                                    <div
                                      className={`truncate ${
                                        user?.role === 'manager'
                                          ? 'cursor-pointer hover:text-blue-600 hover:underline'
                                          : ''
                                      }`}
                                      title={user?.role === 'manager' ? `${row.customer} (Click to view forecast breakdown)` : row.customer}
                                      onClick={() => handleCustomerClick(row.customer)}
                                    >
                                      {row.customer}
                                      {user?.role === 'manager' && (
                                        <span className="ml-1 text-blue-500">👑</span>
                                      )}
                                    </div>
                                    {user?.role === 'manager' && (
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setSelectedRowForViewOnly(row);
                                          setIsViewOnlyModalOpen(true);
                                        }}
                                        className="ml-2 w-5 h-5 bg-green-100 hover:bg-green-200 text-green-600 rounded-full flex items-center justify-center text-xs font-bold transition-colors"
                                        title="View monthly distribution"
                                      >
                                        +
                                      </button>
                                    )}
                                  </div>
                                </td>
                                <td className="p-2 border-b border-r border-gray-200 text-xs">
                                  <div className="truncate" title={row.item}>
                                    <div className="font-medium text-gray-900 truncate">
                                      {row.item}
                                    </div>
                                    <div className="text-xs text-gray-500 truncate">
                                      {row.category} - {row.brand}
                                    </div>
                                  </div>
                                </td>
                              </>
                            ) : (
                              <>
                                <td className="p-2 border-b border-r border-gray-200 text-xs" style={{maxWidth: '350px'}}>
                                  <div className="flex items-center justify-between">
                                    <div className="truncate" title={row.item}>
                                      <div className="font-medium text-gray-900 truncate">
                                        {row.item}
                                      </div>
                                      <div className="text-xs text-gray-500 truncate">
                                        {row.category} - {row.brand}
                                      </div>
                                      <div
                                        className={`text-xs truncate mt-1 ${
                                          user?.role === 'manager'
                                            ? 'cursor-pointer hover:text-blue-600 hover:underline text-blue-600'
                                            : 'text-blue-600'
                                        }`}
                                        title={user?.role === 'manager' ? `${row.customer} (Click to view forecast breakdown)` : row.customer}
                                        onClick={() => handleCustomerClick(row.customer)}
                                      >
                                        Customer: {row.customer}
                                        {user?.role === 'manager' && (
                                          <span className="ml-1 text-blue-500">👑</span>
                                        )}
                                      </div>
                                    </div>
                                    {user?.role === 'manager' && (
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setSelectedRowForViewOnly(row);
                                          setIsViewOnlyModalOpen(true);
                                        }}
                                        className="ml-2 w-5 h-5 bg-green-100 hover:bg-green-200 text-green-600 rounded-full flex items-center justify-center text-xs font-bold transition-colors flex-shrink-0"
                                        title="View monthly distribution"
                                      >
                                        +
                                      </button>
                                    )}
                                  </div>
                                </td>
                                {/* Customer column hidden in item-wise mode */}
                              </>
                            )}
                            <td className="p-2 border-b border-gray-200 text-xs text-center">
                              ${selectedYear2025 === '2025' ? (row.budget2025/1000).toFixed(0) : (row.budget2026/1000).toFixed(0)}k
                            </td>
                            <td className="p-2 border-b border-gray-200 text-xs text-center">
                              ${selectedYear2025 === '2025' ? (row.actual2025/1000).toFixed(0) : '0'}k
                            </td>
                            <td className="p-2 border-b border-gray-200 bg-blue-50 text-xs">
                              {user?.role === 'manager' ? (
                                <div className="text-center p-1 bg-gray-100 rounded text-gray-600">
                                  {row.budget2026}
                                </div>
                              ) : (
                                <input
                                  type="number"
                                  className="w-full p-1 text-center border border-gray-300 rounded text-xs"
                                  value={row.budget2026}
                                  onChange={(e) => {
                                    const value = parseInt(e.target.value) || 0;
                                    handleBudget2026Change(row.id, value);
                                  }}
                                  placeholder="Enter quantity"
                                />
                              )}
                            </td>
                            <td className="p-2 border-b border-gray-200 text-xs text-center">
                              {row.rate}
                            </td>
                            <td className="p-2 border-b border-gray-200 text-xs">
                              <div className="flex flex-col items-center gap-1">
                                <span className={`font-medium ${
                                  row.stock < 20 ? 'text-red-600' : row.stock < 50 ? 'text-yellow-600' : 'text-green-600'
                                }`}>
                                  {row.stock}
                                </span>
                                <button
                                  onClick={() => {
                                    setSelectedStockItem(row);
                                    setIsStockManagementModalOpen(true);
                                  }}
                                  className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded hover:bg-blue-200 transition-colors"
                                  title={user?.role === 'manager' ? "View stock details" : "Manage stock for this item"}
                                >
                                  📦 {user?.role === 'manager' ? 'View' : 'Manage'}
                                </button>
                              </div>
                            </td>
                            <td className="p-2 border-b border-gray-200 text-xs">
                              <GitDetailsTooltip customer={row.customer} item={row.item}>
                                <div className="flex flex-col items-center gap-1">
                                  {(() => {
                                    const gitSummary = DataPersistenceManager.getGitSummaryForItem(row.customer, row.item);
                                    const hasGitData = gitSummary.gitQuantity > 0;

                                    return (
                                      <div className="text-center">
                                        <span className={`font-medium ${
                                          hasGitData ? 'text-blue-600' : 'text-gray-500'
                                        }`}>
                                          {hasGitData ? gitSummary.gitQuantity.toLocaleString() : '0'}
                                        </span>
                                        {hasGitData && (
                                          <div className="space-y-1">
                                            <div className={`text-xs px-1 py-0.5 rounded ${
                                              gitSummary.status === 'delayed' ? 'bg-red-100 text-red-600' :
                                              gitSummary.status === 'in_transit' ? 'bg-purple-100 text-purple-600' :
                                              gitSummary.status === 'shipped' ? 'bg-yellow-100 text-yellow-600' :
                                              gitSummary.status === 'ordered' ? 'bg-blue-100 text-blue-600' :
                                              gitSummary.status === 'arrived' ? 'bg-green-100 text-green-600' :
                                              'bg-gray-100 text-gray-600'
                                            }`}>
                                              {gitSummary.status.replace('_', ' ').toUpperCase()}
                                            </div>
                                            {gitSummary.eta && (
                                              <div className="text-xs text-gray-600">
                                                ETA: {new Date(gitSummary.eta).toLocaleDateString()}
                                              </div>
                                            )}
                                            {gitSummary.itemCount > 1 && (
                                              <div className="text-xs text-gray-500">
                                                {gitSummary.itemCount} shipments
                                              </div>
                                            )}
                                          </div>
                                        )}
                                      </div>
                                    );
                                  })()}
                                </div>
                              </GitDetailsTooltip>
                            </td>
                            <td className="p-2 border-b border-gray-200 text-xs text-center">
                              ${(row.budgetValue2026/1000).toFixed(0)}k
                            </td>
                            <td className="p-2 border-b border-gray-200 text-xs">
                              <div className="flex flex-col gap-1">
                                {user?.role === 'manager' ? (
                                  <div className="text-center p-1 bg-gray-100 rounded text-gray-600">
                                    {Math.round(row.discount)}
                                  </div>
                                ) : (
                                  <input
                                    type="number"
                                    className="w-full p-1 text-center border border-gray-300 rounded text-xs"
                                    value={Math.round(row.discount)}
                                    onChange={(e) => {
                                      const value = parseInt(e.target.value) || 0;
                                      setTableData(prev => prev.map(item =>
                                        item.id === row.id ? {
                                          ...item,
                                          discount: value,
                                          budgetValue2026: (item.budget2026 * item.rate) - value
                                        } : item
                                      ));
                                    }}
                                    placeholder="0"
                                  />
                                )}
                                <div className="text-xs text-gray-500">
                                  {((row.discount / (row.budget2026 * row.rate || 1)) * 100).toFixed(1)}%
                                </div>
                              </div>
                            </td>
                            <td className="p-2 border-b border-gray-200 text-xs text-center">
                              <div className="flex gap-1">
                                {user?.role === 'manager' ? (
                                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                    View Only
                                  </span>
                                ) : (
                                  editingRowId === row.id ? (
                                    <>
                                      <button
                                        onClick={() => handleSaveMonthlyData(row.id)}
                                        className="bg-green-600 text-white px-2 py-1 rounded text-xs hover:bg-green-700 transition-colors"
                                        title="Save monthly data"
                                      >
                                        <Save className="w-3 h-3" />
                                      </button>
                                      <button
                                        onClick={() => handleCancelMonthlyEdit(row.id)}
                                        className="bg-red-600 text-white px-2 py-1 rounded text-xs hover:bg-red-700 transition-colors"
                                        title="Cancel edit"
                                      >
                                        <X className="w-3 h-3" />
                                      </button>
                                    </>
                                  ) : (
                                    <button
                                      onClick={() => handleEditMonthlyData(row.id)}
                                      className="bg-blue-600 text-white px-2 py-1 rounded text-xs hover:bg-blue-700 transition-colors"
                                      title="Edit monthly budget"
                                    >
                                      <Calendar className="w-3 h-3" />
                                    </button>
                                  )
                                )}
                              </div>
                            </td>
                          </tr>

                          {/* Monthly Data Entry Row */}
                          {editingRowId === row.id && (
                            <tr className="bg-gray-50">
                              <td colSpan={12} className="p-4 border-b border-gray-200">
                                <div className="bg-white rounded-lg p-4 border">
                                  <div className="mb-4">
                                    <h4 className="text-lg font-semibold flex items-center gap-2">
                                      <Calendar className="w-5 h-5" />
                                      Monthly Budget Data for {selectedYear2026}
                                    </h4>
                                    <p className="text-sm text-gray-600 mt-1">Enter budget values for each month using the simplified 2-row layout</p>
                                  </div>

                                  {/* Simplified 2-row horizontal layout - Month and Budget Value only */}
                                  <div className="space-y-4">
                                    {/* Quick Distribution Tools */}
                                    <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                                      <h5 className="text-sm font-medium text-yellow-800 mb-2">Quick Budget Distribution</h5>
                                      <div className="flex flex-wrap gap-2">
                                        <button
                                          onClick={() => {
                                            const totalBudget = editingMonthlyData[row.id]?.reduce((sum, month) => sum + month.budgetValue, 0) || 0;
                                            const monthlyAverage = Math.round(totalBudget / 12);
                                            setEditingMonthlyData(prev => ({
                                              ...prev,
                                              [row.id]: prev[row.id]?.map(month => ({ ...month, budgetValue: monthlyAverage })) || []
                                            }));
                                          }}
                                          className="bg-blue-100 text-blue-800 px-3 py-1 rounded text-xs hover:bg-blue-200 transition-colors"
                                        >
                                          📊 Equal Distribution
                                        </button>
                                        <button
                                          onClick={() => {
                                            const totalBudget = editingMonthlyData[row.id]?.reduce((sum, month) => sum + month.budgetValue, 0) || 0;
                                            if (totalBudget > 0) {
                                              // Use holiday-aware seasonal distribution
                                              const seasonalDistributions = applySeasonalDistribution(totalBudget, 'Default Seasonal');
                                              setEditingMonthlyData(prev => ({
                                                ...prev,
                                                [row.id]: prev[row.id]?.map((month, index) => ({
                                                  ...month,
                                                  budgetValue: seasonalDistributions[index]?.value || 0
                                                })) || []
                                              }));
                                              // Show notification about holiday-aware distribution
                                              showNotification(
                                                `Applied holiday-aware seasonal growth: Higher quantities in non-holiday months (Jan-Apr), reduced in holiday months (Nov-Dec)`,
                                                'success'
                                              );
                                            }
                                          }}
                                          className="bg-green-100 text-green-800 px-3 py-1 rounded text-xs hover:bg-green-200 transition-colors"
                                        >
                                          📈 Seasonal Growth
                                        </button>
                                        <button
                                          onClick={() => {
                                            setEditingMonthlyData(prev => ({
                                              ...prev,
                                              [row.id]: prev[row.id]?.map(month => ({ ...month, budgetValue: 0 })) || []
                                            }));
                                          }}
                                          className="bg-red-100 text-red-800 px-3 py-1 rounded text-xs hover:bg-red-200 transition-colors"
                                        >
                                          🗑️ Clear All
                                        </button>
                                      </div>
                                    </div>

                                    {/* 2-Row Horizontal Table */}
                                    <div className="overflow-x-auto">
                                      <table className="w-full min-w-[800px] border border-gray-300 rounded-lg">
                                        <thead>
                                          <tr className="bg-gray-100">
                                            <th className="p-3 text-left text-sm font-semibold text-gray-700 border-r border-gray-300 min-w-[80px]">Month</th>
                                            {editingMonthlyData[row.id]?.map((month, monthIndex) => (
                                              <th key={monthIndex} className="p-3 text-center text-sm font-semibold text-gray-700 border-r border-gray-300 min-w-[80px]">
                                                {month.month}
                                              </th>
                                            )) || []}
                                          </tr>
                                        </thead>
                                        <tbody>
                                          <tr className="bg-white">
                                            <td className="p-3 font-medium text-gray-800 border-r border-gray-300 bg-gray-50">Budget Units</td>
                                            {editingMonthlyData[row.id]?.map((month, monthIndex) => (
                                              <td key={monthIndex} className="p-2 border-r border-gray-300">
                                                <input
                                                  type="number"
                                                  className="w-full p-2 text-center border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                  value={month.budgetValue}
                                                  onChange={(e) => handleMonthlyDataChange(
                                                    row.id,
                                                    monthIndex,
                                                    'budgetValue',
                                                    parseInt(e.target.value) || 0
                                                  )}
                                                  placeholder="0"
                                                />
                                              </td>
                                            )) || []}
                                          </tr>
                                        </tbody>
                                      </table>
                                    </div>

                                    {/* Summary Stats */}
                                    <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                                        <div>
                                          <div className="text-sm text-blue-600 font-medium">Total Units</div>
                                          <div className="text-lg font-bold text-blue-800">
                                            {editingMonthlyData[row.id]?.reduce((sum, month) => sum + month.budgetValue, 0).toLocaleString() || 0}
                                          </div>
                                        </div>
                                        <div>
                                          <div className="text-sm text-green-600 font-medium">Total Value</div>
                                          <div className="text-lg font-bold text-green-800">
                                            ${editingMonthlyData[row.id]?.reduce((sum, month) => sum + (month.budgetValue * (row.rate || 1)), 0).toLocaleString() || 0}
                                          </div>
                                        </div>
                                        <div>
                                          <div className="text-sm text-purple-600 font-medium">Avg/Month</div>
                                          <div className="text-lg font-bold text-purple-800">
                                            {Math.round((editingMonthlyData[row.id]?.reduce((sum, month) => sum + month.budgetValue, 0) || 0) / 12).toLocaleString()}
                                          </div>
                                        </div>
                                        <div>
                                          <div className="text-sm text-orange-600 font-medium">Budget Growth</div>
                                          <div className="text-lg font-bold text-orange-800">
                                            {(() => {
                                              const monthlyData = editingMonthlyData[row.id] || [];
                                              if (monthlyData.length < 12) return '0%';
                                              const firstHalf = monthlyData.slice(0, 6).reduce((sum, m) => sum + m.budgetValue, 0);
                                              const secondHalf = monthlyData.slice(6, 12).reduce((sum, m) => sum + m.budgetValue, 0);
                                              const growth = firstHalf > 0 ? ((secondHalf - firstHalf) / firstHalf * 100) : 0;
                                              return `${growth > 0 ? '+' : ''}${growth.toFixed(1)}%`;
                                            })()
                                          }
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="mt-4 flex justify-between items-center">
                                    <div className="text-sm text-gray-600">
                                      <strong>Total Budget Value:</strong> ${editingMonthlyData[row.id]?.reduce((sum, month) => sum + (month.budgetValue * (row.rate || 1)), 0).toLocaleString() || 0}
                                    </div>
                                    <div className="flex gap-2">
                                      <button
                                        onClick={() => handleSaveMonthlyData(row.id)}
                                        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors flex items-center gap-2"
                                      >
                                        <Save className="w-4 h-4" />
                                        Save & Apply
                                      </button>
                                      <button
                                        onClick={() => handleCancelMonthlyEdit(row.id)}
                                        className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition-colors flex items-center gap-2"
                                      >
                                        <X className="w-4 h-4" />
                                        Cancel
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Notification Toast */}
        {notification && (
          <div className={`fixed top-4 right-4 z-50 px-4 py-2 rounded-lg shadow-lg transition-all duration-300 ${
            notification.type === 'success'
              ? 'bg-green-600 text-white'
              : 'bg-red-600 text-white'
          }`}>
            {notification.message}
          </div>
        )}

        {/* Modals */}
        <ExportModal
          isOpen={isExportModalOpen}
          onClose={() => setIsExportModalOpen(false)}
          onExport={handleExport}
          title="Download Budget"
        />

        <NewAdditionModal
          isOpen={isNewAdditionModalOpen}
          onClose={() => setIsNewAdditionModalOpen(false)}
          onAdd={handleAddNewItem}
          type={newAdditionType}
        />


        <YearlyBudgetModal
          isOpen={isYearlyBudgetModalOpen}
          onClose={() => setIsYearlyBudgetModalOpen(false)}
          onSave={handleYearlyBudgetSave}
          selectedCustomer={selectedCustomer}
          year={selectedYear2026}
        />

        {user?.role === 'manager' || user?.role === 'admin' ? (
          <ManagerStockManagement
            isOpen={isStockManagementModalOpen}
            onClose={() => setIsStockManagementModalOpen(false)}
          />
        ) : (
          <SalesmanStockManagement
            isOpen={isStockManagementModalOpen}
            onClose={() => setIsStockManagementModalOpen(false)}
          />
        )}

        <ManagerDashboard
          isOpen={isManagerDashboardOpen}
          onClose={() => setIsManagerDashboardOpen(false)}
        />

        <CustomerForecastModal
          isOpen={isCustomerForecastModalOpen}
          onClose={() => setIsCustomerForecastModalOpen(false)}
          customerData={selectedCustomerForBreakdown ? generateCustomerForecastData(selectedCustomerForBreakdown) : null}
          viewType="sales_budget"
        />

        <ViewOnlyMonthlyDistributionModal
          isOpen={isViewOnlyModalOpen}
          onClose={() => {
            setIsViewOnlyModalOpen(false);
            setSelectedRowForViewOnly(null);
          }}
          data={selectedRowForViewOnly ? {
            customer: selectedRowForViewOnly.customer,
            item: selectedRowForViewOnly.item,
            category: selectedRowForViewOnly.category,
            brand: selectedRowForViewOnly.brand,
            monthlyData: selectedRowForViewOnly.monthlyData,
            totalBudget: selectedRowForViewOnly.budgetValue2026,
            totalActual: selectedRowForViewOnly.actual2025,
            totalUnits: selectedRowForViewOnly.budget2026,
            createdBy: 'Salesman', // This would come from saved data
            lastModified: new Date().toISOString()
          } : null}
          type="sales_budget"
        />

        <SetDistributionModal
          isOpen={isSetDistributionModalOpen}
          onClose={() => setIsSetDistributionModalOpen(false)}
          items={tableData}
          selectedCustomer={selectedCustomer}
          selectedCategory={selectedCategory}
          selectedBrand={selectedBrand}
          selectedItem={selectedItem}
          onApplyDistribution={handleApplyDistribution}
        />

        {/* Admin Stock Management Modal */}
        {user?.role === 'admin' && (
          <AdminStockManagement
            isOpen={isAdminStockModalOpen}
            onClose={() => setIsAdminStockModalOpen(false)}
            items={tableData}
          />
        )}

        {/* Seasonal Growth Information Modal */}
        <SeasonalDistributionInfo
          isOpen={isSeasonalGrowthModalOpen}
          onClose={() => setIsSeasonalGrowthModalOpen(false)}
        />
      </div>
    </Layout>
  );
};

export default SalesBudget;
