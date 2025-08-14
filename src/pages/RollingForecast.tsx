import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { ChevronRight, Eye, CheckCircle, Plus, ChevronUp, ChevronDown, Minus, X, List, UserPlus, Target, Send, Download as DownloadIcon, Package, Calendar, AlertTriangle } from 'lucide-react';
import { Customer } from '../types/forecast';
import { useBudget } from '../contexts/BudgetContext';
import { useAuth } from '../contexts/AuthContext';
import { useWorkflow } from '../contexts/WorkflowContext';
import { rollingForecastService, RollingForecastItem as APIRollingForecastItem } from '../services/rollingForecastService';
import CustomerForecastModal from '../components/CustomerForecastModal';
import GitDetailsTooltip from '../components/GitDetailsTooltip';
import ViewOnlyMonthlyDistributionModal from '../components/ViewOnlyMonthlyDistributionModal';
import FollowBacksButton from '../components/FollowBacksButton';
import SalesmanStockManagement from '../components/SalesmanStockManagement';
import ManagerStockManagement from '../components/ManagerStockManagement';
import ManagerRollingForecastInterface from '../components/ManagerRollingForecastInterface';
import DataPreservationIndicator from '../components/DataPreservationIndicator';
import RollingForecastReport from '../components/RollingForecastReport';
import DataPersistenceManager, { SavedForecastData } from '../utils/dataPersistence';
import { initializeSampleGitData } from '../utils/sampleGitData';
import { applySeasonalDistribution, convertToMonthlyBudget } from '../utils/seasonalDistribution';
import SeasonalDistributionInfo from '../components/SeasonalDistributionInfo';
import {
  getCurrentMonth,
  getCurrentYear,
  getShortMonthNames,
  isFutureMonth,
  getFutureMonthsForYear,
  formatDateTimeForDisplay,
  getTimeAgo
} from '../utils/timeUtils';
import {
  generateAvailableYears,
  getDefaultYearSelection,
  getYearValue as getYearValueUtil,
  setYearValue,
  createSampleYearlyData,
  transformLegacyToYearly
} from '../utils/dynamicYearUtils';

const RollingForecast: React.FC = () => {
  const { user } = useAuth();
  const { yearlyBudgets, getBudgetsByCustomer, error: budgetError } = useBudget();
  const { submitForApproval } = useWorkflow();

  // Dynamic year handling using centralized utilities
  const availableYears = generateAvailableYears();
  const defaultYears = getDefaultYearSelection();
  const [selectedBaseYear, setSelectedBaseYear] = useState(defaultYears.baseYear);
  const [selectedTargetYear, setSelectedTargetYear] = useState(defaultYears.targetYear);

  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedItem, setSelectedItem] = useState('');
  const [activeView, setActiveView] = useState<'customer-item' | 'item-wise'>('customer-item');
  const [sortField, setSortField] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [selectAll, setSelectAll] = useState(false);
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [monthlyForecastData, setMonthlyForecastData] = useState<{[key: string]: {[month: string]: number}}>({});
  const [isNewAdditionModalOpen, setIsNewAdditionModalOpen] = useState(false);
  const [selectedCustomerOption, setSelectedCustomerOption] = useState<'existing' | 'new'>('existing');
  const [selectedItemOption, setSelectedItemOption] = useState<'existing'>('existing');
  const [newCustomerData, setNewCustomerData] = useState({
    name: '',
    code: '',
    email: '',
    phone: '',
    region: '',
    segment: ''
  });
  const [selectedExistingCustomer, setSelectedExistingCustomer] = useState('');
  const [selectedExistingItem, setSelectedExistingItem] = useState('');
  const [showBudgetData, setShowBudgetData] = useState(true);
  const [isCustomerForecastModalOpen, setIsCustomerForecastModalOpen] = useState(false);
  const [selectedCustomerForBreakdown, setSelectedCustomerForBreakdown] = useState<string>('');
  const [isViewOnlyModalOpen, setIsViewOnlyModalOpen] = useState(false);
  const [selectedRowForViewOnly, setSelectedRowForViewOnly] = useState<any>(null);
  const [isStockManagementModalOpen, setIsStockManagementModalOpen] = useState(false);
  const [showReportView, setShowReportView] = useState(false);
  const [isSeasonalGrowthModalOpen, setIsSeasonalGrowthModalOpen] = useState(false);

  // Use centralized helper function for year value access
  const getYearValue = (item: any, year: string, type: 'budget' | 'actual'): number => {
    return getYearValueUtil(item, year, type);
  };

  // Sample data
  const [customers, setCustomers] = useState<Customer[]>([
    {
      id: '1',
      name: 'Action Aid International (Tz)',
      code: 'AAI001',
      email: 'orders@actionaid.tz',
      phone: '+255-22-123-4567',
      region: 'Africa',
      segment: 'NGO',
      creditLimit: 500000,
      currency: 'USD',
      active: true,
      createdAt: '2024-01-15',
      lastActivity: '2024-12-01',
      channels: ['Direct Sales'],
      seasonality: 'medium',
      tier: 'platinum',
      manager: 'John Smith'
    },
    {
      id: '2',
      name: 'ADVENT CONSTRUCTION LTD.',
      code: 'ADV002',
      email: 'orders@advent.com',
      phone: '+1-555-0101',
      region: 'North America',
      segment: 'Enterprise',
      creditLimit: 750000,
      currency: 'USD',
      active: true,
      createdAt: '2024-02-20',
      lastActivity: '2024-11-28',
      channels: ['Direct Sales'],
      seasonality: 'low',
      tier: 'platinum',
      manager: 'Sarah Johnson'
    }
  ]);

  const [items] = useState([
    {
      id: '1',
      name: 'BF GOODRICH TYRE 235/85R16 120/116S TL ATT/A KO2 LRERWLGO',
      category: 'TYRE SERVICE',
      brand: 'BF GOODRICH'
    },
    {
      id: '2',
      name: 'BF GOODRICH TYRE 265/65R17 120/117S TL ATT/A KO2 LRERWLGO',
      category: 'TYRE SERVICE',
      brand: 'BF GOODRICH'
    },
    {
      id: '3',
      name: 'MICHELIN TYRE 265/65R17 112T TL LTX TRAIL',
      category: 'TYRE SERVICE',
      brand: 'MICHELIN'
    },
    {
      id: '4',
      name: 'WHEEL BALANCE ALLOYD RIMS',
      category: 'TYRE SERVICE',
      brand: 'TYRE SERVICE'
    }
  ]);

  const [tableData, setTableData] = useState<any[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [dataError, setDataError] = useState<string | null>(null);

  // Load data from backend
  const loadForecastData = async () => {
    try {
      setIsLoadingData(true);
      setDataError(null);

      const forecasts = await rollingForecastService.getAllForecasts();
      console.log('Loaded forecasts from backend:', forecasts);

      setTableData(forecasts);

    } catch (error) {
      console.error('Failed to load forecast data:', error);
      setDataError('Failed to load forecast data from server');

      // Fallback to hardcoded data
      const fallbackData = [
        {
          id: '1',
          customer: 'Action Aid International (Tz)',
          item: 'BF GOODRICH TYRE 235/85R16 120/116S TL ATT/A KO2 LRERWLGO',
          bud25: 120,
          ytd25: 45,
          forecast: 0,
          stock: 86,
          git: 0,
          eta: '',
          budgetDistribution: (() => {
            const seasonalDist = applySeasonalDistribution(120, 'Default Seasonal');
            const distribution: {[key: string]: number} = {};
            seasonalDist.forEach(item => {
              distribution[item.month] = item.value;
            });
            return distribution;
          })()
        }
      ];

      setTableData(fallbackData);
    } finally {
      setIsLoadingData(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    loadForecastData();
  }, []);

  // Load saved forecast data for current user
  useEffect(() => {
    if (user) {
      const savedForecastData = DataPersistenceManager.getRollingForecastDataByUser(user.name);
      if (savedForecastData.length > 0) {
        console.log('Loading saved forecast data for', user.name, ':', savedForecastData.length, 'items');

        // Update monthly forecast data from saved data
        const updatedMonthlyData: {[key: string]: {[month: string]: number}} = {};

        savedForecastData.forEach(savedItem => {
          const matchingRow = tableData.find(row =>
            row.customer === savedItem.customer && row.item === savedItem.item
          );

          if (matchingRow && savedItem.forecastData) {
            updatedMonthlyData[matchingRow.id] = savedItem.forecastData;
          }
        });

        setMonthlyForecastData(updatedMonthlyData);

        // Update table data with forecast totals
        setTableData(prevData =>
          prevData.map(row => {
            const rowData = updatedMonthlyData[row.id];
            if (rowData) {
              const forecastTotal = Object.values(rowData).reduce((sum, value) => sum + (value || 0), 0);
              return { ...row, forecast: forecastTotal };
            }
            return row;
          })
        );
      }
    }
  }, [user]);

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

        console.log('Global stock data loaded from admin in Rolling Forecast');
      }
    } catch (error) {
      console.error('Error loading global stock data in Rolling Forecast:', error);
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
      setTableData(prevData =>
        prevData.map(row => {
          const gitSummary = DataPersistenceManager.getGitSummaryForItem(row.customer, row.item);
          return {
            ...row,
            git: gitSummary.gitQuantity,
            eta: gitSummary.eta ? new Date(gitSummary.eta).toLocaleDateString() : ''
          };
        })
      );
    };

    // Update GIT data on component mount
    updateGitDataInTable();

    // Set up interval to check for GIT data and admin stock updates every 30 seconds
    const interval = setInterval(() => {
      updateGitDataInTable();
      loadGlobalStockData();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const categories = ['TYRE SERVICE'];
  const brands = ['TYRE SERVICE'];

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (field: string) => {
    if (sortField !== field) {
      return <ChevronUp className="w-4 h-4 text-gray-400" />;
    }
    return sortDirection === 'asc' 
      ? <ChevronUp className="w-4 h-4 text-gray-600" />
      : <ChevronDown className="w-4 h-4 text-gray-600" />;
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(filteredData.map(item => item.id)));
    }
    setSelectAll(!selectAll);
  };

  const handleRowSelect = (id: string) => {
    const newSelected = new Set(selectedRows);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedRows(newSelected);
    setSelectAll(newSelected.size === filteredData.length);
  };



  const handleSubmit = async () => {
    if (user?.role === 'salesman') {
      // Submit for manager approval while preserving data
      try {
        // Convert current forecast data to workflow format
        const forecastData = Object.entries(monthlyForecastData).map(([rowId, monthlyData]) => {
          const row = tableData.find(r => r.id === rowId);
          const totalForecast = Object.values(monthlyData).reduce((sum, value) => sum + (value || 0), 0);

          return {
            id: `forecast_${rowId}_${Date.now()}`,
            customer: row?.customer || 'Unknown',
            item: row?.item || 'Unknown',
            category: 'Forecast',
            brand: 'Various',
            year: new Date().getFullYear().toString(),
            forecastUnits: totalForecast,
            forecastValue: totalForecast * 100, // Assuming $100 per unit
            createdBy: user.name,
            createdAt: new Date().toISOString()
          };
        }).filter(f => f.forecastUnits > 0);

        if (forecastData.length === 0) {
          alert('Please enter forecast data before submitting');
          return;
        }

        // Save original forecast data for preservation (kept in table for other purposes)
        const savedForecastData: SavedForecastData[] = Object.entries(monthlyForecastData).map(([rowId, monthlyData]) => {
          const row = tableData.find(r => r.id === rowId);
          const totalForecast = Object.values(monthlyData).reduce((sum, value) => sum + (value || 0), 0);

          return {
            id: `rolling_forecast_${rowId}_${Date.now()}`,
            customer: row?.customer || 'Unknown',
            item: row?.item || 'Unknown',
            category: 'TYRE SERVICE',
            brand: 'Various',
            type: 'rolling_forecast',
            createdBy: user.name,
            createdAt: new Date().toISOString(),
            lastModified: new Date().toISOString(),
            budgetData: {
              bud25: row?.bud25 || 0,
              ytd25: row?.ytd25 || 0,
              budget2026: 0,
              rate: 100,
              stock: row?.stock || 0,
              git: row?.git || 0,
              eta: row?.eta,
              budgetValue2026: 0,
              discount: 0,
              monthlyData: []
            },
            forecastData: monthlyData,
            forecastTotal: totalForecast,
            status: 'saved' // Keep as saved for preservation
          };
        }).filter(f => f.forecastTotal > 0);

        // Submit to workflow context
        const workflowId = await submitForApproval([], forecastData);

        // Save original data and create submission copies
        DataPersistenceManager.saveRollingForecastData(savedForecastData);
        DataPersistenceManager.saveSubmissionCopies([], savedForecastData, workflowId);

        // Update status to track submission without removing original data
        savedForecastData.forEach(item => {
          DataPersistenceManager.updateRollingForecastStatus(item.id, 'submitted');
        });

        console.log('Rolling forecast data preserved for other purposes:', savedForecastData);
        console.log('Submission copies created for approval workflow');

        alert(`Forecast submitted successfully! Workflow ID: ${workflowId.slice(-6)}. ` +
              `✅ Original forecast data preserved in table for other purposes.`);

        // IMPORTANT: DO NOT clear monthly forecast data - keep it for other purposes
        // The data remains available for:
        // 1. Further editing and refinement
        // 2. Comparison with actual results
        // 3. Historical analysis and reporting
        // 4. Backup in case resubmission is needed
        console.log('Monthly forecast data maintained in table for continued use');

      } catch (error) {
        console.error('Submission error:', error);
        alert('Failed to submit forecast. Please try again.');
      }
    } else {
      console.log('Submit clicked - Manager view');
    }
  };

  const handleSaveNewAddition = () => {
    // Handle save logic for new customer/item
    if (selectedCustomerOption === 'new' && newCustomerData.name && newCustomerData.code) {
      // Add new customer to customers list
      const newCustomer: Customer = {
        id: (customers.length + 1).toString(),
        name: newCustomerData.name,
        code: newCustomerData.code,
        email: newCustomerData.email,
        phone: newCustomerData.phone,
        region: newCustomerData.region,
        segment: newCustomerData.segment,
        creditLimit: 100000,
        currency: 'USD',
        active: true,
        createdAt: new Date().toISOString().split('T')[0],
        lastActivity: new Date().toISOString().split('T')[0],
        channels: ['Direct Sales'],
        seasonality: 'medium',
        tier: 'bronze',
        manager: 'System'
      };
      
      setCustomers(prev => [...prev, newCustomer]);
      
      // Add new row to table data
      const newTableRow = {
        id: (tableData.length + 1).toString(),
        customer: newCustomerData.name,
        item: selectedExistingItem || 'Default Item',
        bud25: 0,
        ytd25: 0,
        forecast: 0,
        stock: 0,
        git: 0,
        eta: ''
      };
      
      setTableData(prev => [...prev, newTableRow]);
      
      console.log('New customer added:', newCustomer);
      console.log('New table row added:', newTableRow);
    } else if (selectedCustomerOption === 'existing' && selectedExistingCustomer && selectedExistingItem) {
      // Add existing customer with selected item
      const newTableRow = {
        id: (tableData.length + 1).toString(),
        customer: selectedExistingCustomer,
        item: selectedExistingItem,
        bud25: 0,
        ytd25: 0,
        forecast: 0,
        stock: 0,
        git: 0,
        eta: ''
      };
      
      setTableData(prev => [...prev, newTableRow]);
      
      console.log('New table row added with existing customer:', newTableRow);
    }
    
    // Reset form
    setSelectedCustomerOption('existing');
    setSelectedItemOption('existing');
    setNewCustomerData({
      name: '',
      code: '',
      email: '',
      phone: '',
      region: '',
      segment: ''
    });
    setSelectedExistingCustomer('');
    setSelectedExistingItem('');
    
    // Close modal
    setIsNewAdditionModalOpen(false);
  };

  const handleExpandRow = (id: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedRows(newExpanded);
  };

  const handleMonthlyForecastChange = async (rowId: string, month: string, value: number) => {
    // Update monthly forecast data first
    const newMonthlyData = {
      ...monthlyForecastData[rowId],
      [month]: value
    };

    setMonthlyForecastData(prev => ({
      ...prev,
      [rowId]: newMonthlyData
    }));

    // Calculate the new total forecast for this row
    const newForecastTotal = Object.values(newMonthlyData).reduce((sum, val) => sum + (val || 0), 0);

    // Update the main table forecast value for this row
    setTableData(prevData =>
      prevData.map(row => {
        if (row.id === rowId) {
          return { ...row, forecast: newForecastTotal };
        }
        return row;
      })
    );

    // Save to backend service
    try {
      await rollingForecastService.saveMonthlyForecastData(rowId, newMonthlyData);
      console.log('✅ Monthly forecast data saved to database');
    } catch (error) {
      console.error('❌ Failed to save monthly forecast data:', error);
    }

    // Also save to persistence manager for backwards compatibility
    if (user) {
      const row = tableData.find(r => r.id === rowId);
      if (row) {
        const savedData: SavedForecastData = {
          id: `forecast_auto_${rowId}_${Date.now()}`,
          customer: row.customer,
          item: row.item,
          category: 'TYRE SERVICE',
          brand: 'Various',
          type: 'rolling_forecast',
          createdBy: user.name,
          createdAt: new Date().toISOString(),
          lastModified: new Date().toISOString(),
          budgetData: {
            bud25: row.bud25,
            ytd25: row.ytd25,
            budget2026: 0,
            rate: 100,
            stock: row.stock,
            git: row.git,
            eta: row.eta,
            budgetValue2026: 0,
            discount: 0,
            monthlyData: []
          },
          forecastData: newMonthlyData,
          forecastTotal: newForecastTotal,
          status: 'draft'
        };

        DataPersistenceManager.saveRollingForecastData([savedData]);
      }
    }
  };

  const getMonthlyData = (rowId: string) => {
    if (!monthlyForecastData[rowId]) {
      monthlyForecastData[rowId] = {};
    }
    return monthlyForecastData[rowId];
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
    const customerRows = tableData.filter(row => row.customer === customerName);
    if (customerRows.length === 0) return null;

    // Calculate totals based on forecast data
    const totalBudgetUnits = customerRows.reduce((sum, row) => sum + row.bud25, 0);
    const totalActualUnits = customerRows.reduce((sum, row) => sum + row.ytd25, 0);
    const totalForecastUnits = customerRows.reduce((sum, row) => {
      const monthlyData = getMonthlyData(row.id);
      return sum + Object.values(monthlyData).reduce((total, value) => total + (value || 0), 0);
    }, 0);

    const totalBudgetValue = totalBudgetUnits * 100; // Assuming average rate
    const totalActualValue = totalActualUnits * 100;
    const totalForecastValue = totalForecastUnits * 100;

    // Generate monthly data for rolling forecast
    const monthlyData = getShortMonthNames().map(month => {
      const monthlyBudgetUnits = customerRows.reduce((sum, row) => {
        return sum + (row.budgetDistribution?.[month] || 0);
      }, 0);
      const monthlyActualUnits = customerRows.reduce((sum, row) => {
        // For past months, use YTD data; for future, use 0
        const currentMonth = getCurrentMonth();
        const monthIndex = getShortMonthNames().indexOf(month);
        return sum + (monthIndex <= currentMonth ? Math.floor(row.ytd25 / (currentMonth + 1)) : 0);
      }, 0);
      const monthlyForecastUnits = customerRows.reduce((sum, row) => {
        const monthlyData = getMonthlyData(row.id);
        return sum + (monthlyData[month] || 0);
      }, 0);

      const monthlyBudgetValue = monthlyBudgetUnits * 100;
      const monthlyActualValue = monthlyActualUnits * 100;
      const monthlyForecastValue = monthlyForecastUnits * 100;
      const variance = monthlyForecastValue - monthlyBudgetValue;
      const variancePercentage = monthlyBudgetValue > 0 ? (variance / monthlyBudgetValue) * 100 : 0;

      return {
        month,
        budgetUnits: monthlyBudgetUnits,
        actualUnits: monthlyActualUnits,
        forecastUnits: monthlyForecastUnits,
        budgetValue: monthlyBudgetValue,
        actualValue: monthlyActualValue,
        forecastValue: monthlyForecastValue,
        rate: 100,
        variance,
        variancePercentage
      };
    });

    // Generate items data
    const items = customerRows.map(row => {
      const monthlyData = getMonthlyData(row.id);
      const forecastUnits = Object.values(monthlyData).reduce((sum, value) => sum + (value || 0), 0);

      return {
        item: row.item,
        category: 'TYRE SERVICE', // From existing data
        brand: 'Various',
        budgetUnits: row.bud25,
        actualUnits: row.ytd25,
        forecastUnits,
        budgetValue: row.bud25 * 100,
        actualValue: row.ytd25 * 100,
        forecastValue: forecastUnits * 100,
        rate: 100
      };
    });

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

  // Calculate dynamic summary statistics based on forecasts
  const calculateSummaryStats = () => {
    let totalBudget2025 = 0;
    let totalSales2025 = 0;
    let totalForecast2025 = 0;
    let totalUnitsBudget = 0;
    let totalUnitsSales = 0;
    let totalUnitsForecast = 0;
    let totalStock = 0;
    let totalGit = 0;

    // Calculate from table data using dynamic years
    tableData.forEach(row => {
      // Budget for base year (existing budget units)
      const budgetUnits = getYearValue(row, selectedBaseYear, 'budget');
      totalBudget2025 += budgetUnits * 100; // Convert units to currency
      totalUnitsBudget += budgetUnits;

      // Sales for base year (YTD actuals units)
      const salesUnits = getYearValue(row, selectedBaseYear, 'actual');
      totalSales2025 += salesUnits * 100; // Convert units to currency
      totalUnitsSales += salesUnits;

      // Forecast for target year (user input forecasts units) - calculate from monthly data
      const monthlyData = getMonthlyData(row.id);
      const forecastUnits = Object.values(monthlyData).reduce((sum, value) => sum + (value || 0), 0);
      totalForecast2025 += forecastUnits * 100; // Convert units to currency
      totalUnitsForecast += forecastUnits;

      // Stock and GIT totals
      totalStock += row.stock;
      totalGit += row.git;
    });

    return {
      budget: totalBudget2025,
      sales: totalSales2025,
      forecast: totalForecast2025,
      unitsBudget: totalUnitsBudget,
      unitsSales: totalUnitsSales,
      unitsForecast: totalUnitsForecast,
      totalStock,
      totalGit
    };
  };

  // Calculate inventory insights
  const calculateInventoryInsights = () => {
    const totalStock = tableData.reduce((sum, row) => sum + row.stock, 0);
    const totalGit = tableData.reduce((sum, row) => sum + row.git, 0);
    const totalDemand = calculateSummaryStats().forecast;
    
    const stockTurnover = totalDemand > 0 ? (totalStock / totalDemand) * 12 : 0;
    const safetyStock = totalDemand * 0.2; // 20% safety stock
    const reorderPoint = totalDemand / 12 + safetyStock;
    
    return {
      totalStock,
      totalGit,
      stockTurnover,
      safetyStock,
      reorderPoint,
      stockHealth: totalStock > reorderPoint ? 'Good' : 'Low'
    };
  };

  const summaryStats = calculateSummaryStats();
  const inventoryInsights = calculateInventoryInsights();

  const filteredData = tableData.filter((item: any) => {
    return (!selectedCustomer || item.customer.includes(selectedCustomer)) &&
           (!selectedCategory || categories.includes(selectedCategory)) &&
           (!selectedBrand || brands.includes(selectedBrand)) &&
           (!selectedItem || item.item.includes(selectedItem));
  });

  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortField) return 0;
    
    const aValue = a[sortField as keyof typeof a];
    const bValue = b[sortField as keyof typeof b];
    
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortDirection === 'asc' 
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }
    
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
    }
    
    return 0;
  });

  // Manager view - show different interface
  if (user?.role === 'manager') {
    return (
      <Layout>
        <div className="space-y-6">
          {/* Breadcrumb */}
          <div className="flex items-center text-sm text-gray-600">
            <span className="cursor-pointer hover:text-blue-600">Dashboards</span>
            <ChevronRight className="w-4 h-4 mx-2" />
            <span className="text-blue-600 font-medium">Rolling Forecast - Manager</span>
          </div>

          {/* Manager-specific interface */}
          <ManagerRollingForecastInterface />
        </div>
      </Layout>
    );
  }

  // Show loading state
  if (isLoadingData) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading forecast data from database...</p>
          </div>
        </div>
      </Layout>
    );
  }

  // Show report view if requested
  if (showReportView) {
    return (
      <Layout>
        <RollingForecastReport onBack={() => setShowReportView(false)} />
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Breadcrumb */}
        <div className="flex items-center text-sm text-gray-600">
          <span className="cursor-pointer hover:text-blue-600">Dashboards</span>
          <ChevronRight className="w-4 h-4 mx-2" />
          <span className="text-blue-600 font-medium">Rolling Forecast</span>
        </div>

        {/* Data Loading Error Display */}
        {dataError && (
          <div className="bg-orange-50 border border-orange-200 rounded-md p-4 mb-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-5 w-5 text-orange-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-orange-800">Data Loading Warning</h3>
                <div className="mt-2 text-sm text-orange-700">{dataError}</div>
                <div className="mt-2">
                  <button
                    onClick={loadForecastData}
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
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
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

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-gray-900">Rolling Forecast for {selectedBaseYear}-{selectedTargetYear}</h1>

            {/* Year Selectors */}
            <div className="flex items-center gap-2 bg-white p-2 rounded-lg shadow-sm border">
              <label className="text-xs font-medium text-gray-600">Years:</label>
              <select
                className="text-xs p-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={selectedBaseYear}
                onChange={(e) => {
                  setSelectedBaseYear(e.target.value);
                  console.log('Base year changed to:', e.target.value);
                }}
              >
                {availableYears.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
              <span className="text-xs text-gray-500">to</span>
              <select
                className="text-xs p-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={selectedTargetYear}
                onChange={(e) => {
                  setSelectedTargetYear(e.target.value);
                  console.log('Target year changed to:', e.target.value);
                }}
              >
                {availableYears.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex shadow-sm rounded-md overflow-hidden">
              <button
                onClick={() => {
                  console.log('Switching to customer-item view');
                  setActiveView('customer-item');
                }}
                className={`px-6 py-2 font-semibold transition-all duration-200 ${
                  activeView === 'customer-item'
                    ? 'bg-orange-500 text-white shadow-md transform scale-105'
                    : 'bg-white text-gray-600 border border-gray-300 hover:bg-orange-50 hover:text-orange-600'
                }`}
                title="View data organized by customer and their items"
              >
                Customer-Item
              </button>
              <button
                onClick={() => {
                  console.log('Switching to item-wise view - hiding customer column');
                  setActiveView('item-wise');
                }}
                className={`px-6 py-2 font-semibold transition-all duration-200 ${
                  activeView === 'item-wise'
                    ? 'bg-orange-500 text-white shadow-md transform scale-105'
                    : 'bg-white text-gray-600 border border-gray-300 hover:bg-orange-50 hover:text-orange-600'
                }`}
                title="Item-focused view: Hide customer column to focus only on item data for rolling forecast"
              >
                Item Wise
              </button>
            </div>
            {/* Follow-backs button for salesman and manager */}
            {(user?.role === 'salesman' || user?.role === 'manager') && (
              <FollowBacksButton />
            )}
          </div>
        </div>

        {/* Item Wise Mode Info */}
        {activeView === 'item-wise' && (
          <div className="bg-orange-50 border-l-4 border-orange-400 text-orange-800 p-3 rounded-r-lg flex items-center gap-2 mb-4">
            <div className="w-5 h-5 bg-orange-200 rounded-full flex items-center justify-center">
              <span className="text-orange-600 text-xs font-bold">i</span>
            </div>
            <div>
              <p className="font-medium">Item-Wise Mode Active</p>
              <p className="text-xs text-orange-700">Customer column is hidden. Focus on item-only rolling forecast data.</p>
            </div>
          </div>
        )}

        {/* Top Bar Metrics */}
        <div className="flex items-center justify-between bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <div className="text-sm text-gray-600">Stock</div>
              <div className="text-xl font-bold text-green-600">{summaryStats.totalStock.toLocaleString()} units</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <Package className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <div className="text-sm text-gray-600">GIT</div>
              <div className="text-xl font-bold text-blue-600">{summaryStats.totalGit.toLocaleString()} units</div>
            </div>
          </div>

          <button
            onClick={() => setShowReportView(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Eye className="w-4 h-4" />
            View Rolling Forecast Report
          </button>
        </div>

        {/* Budget Data from Sales Budget */}
        {yearlyBudgets.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-blue-600" />
                <h2 className="text-lg font-semibold text-gray-900">Sales Budget Data</h2>
                <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
                  {yearlyBudgets.length} budget{yearlyBudgets.length !== 1 ? 's' : ''} available
                </span>
              </div>
              <button
                onClick={() => setShowBudgetData(!showBudgetData)}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                {showBudgetData ? 'Hide' : 'Show'} Budget Data
              </button>
            </div>

            {showBudgetData && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {yearlyBudgets.map((budget) => (
                    <div key={budget.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-medium text-gray-900 truncate">{budget.item}</h3>
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                          {budget.year}
                        </span>
                      </div>

                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Customer:</span>
                          <span className="font-medium truncate ml-2">{budget.customer}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Category:</span>
                          <span className="font-medium">{budget.category}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Brand:</span>
                          <span className="font-medium">{budget.brand}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Total Budget:</span>
                          <span className="font-bold text-green-600">
                            ${(budget.totalBudget / 1000).toFixed(0)}k
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Created by:</span>
                          <span className="text-xs text-gray-500">{budget.createdBy}</span>
                        </div>
                      </div>

                      {/* Monthly breakdown preview */}
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <div className="text-xs text-gray-600 mb-2">Monthly Budget Summary:</div>
                        <div className="grid grid-cols-3 gap-1 text-xs">
                          {budget.monthlyData.slice(0, 3).map((month, idx) => (
                            <div key={idx} className="text-center">
                              <div className="font-medium">{month.month}</div>
                              <div className="text-gray-600">${(month.budgetValue * month.rate / 1000).toFixed(0)}k</div>
                            </div>
                          ))}
                        </div>
                        {budget.monthlyData.length > 3 && (
                          <div className="text-xs text-gray-500 text-center mt-1">
                            +{budget.monthlyData.length - 3} more months
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-900">Budget Integration</span>
                  </div>
                  <p className="text-sm text-blue-800">
                    These budgets were created by salesman users in the Sales Budget dashboard and are automatically
                    integrated into your rolling forecast calculations. Use this data to align your forecasts with planned sales targets.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Filters and Notes */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-start gap-6">
            {/* Filters */}
            <div className="grid grid-cols-2 gap-4 flex-1">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">CUSTOMER:</label>
                <select
                  value={selectedCustomer}
                  onChange={(e) => setSelectedCustomer(e.target.value)}
                  className="w-full px-3 py-2 border border-yellow-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-yellow-50"
                >
                  <option value="">Select value</option>
                  {customers.map(customer => (
                    <option key={customer.id} value={customer.name}>
                      {customer.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">CATEGORY:</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-yellow-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-yellow-50"
                >
                  <option value="">Select value</option>
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">BRAND:</label>
                <select
                  value={selectedBrand}
                  onChange={(e) => setSelectedBrand(e.target.value)}
                  className="w-full px-3 py-2 border border-yellow-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-yellow-50"
                >
                  <option value="">Select value</option>
                  {brands.map(brand => (
                    <option key={brand} value={brand}>
                      {brand}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">ITEM:</label>
                <select
                  value={selectedItem}
                  onChange={(e) => setSelectedItem(e.target.value)}
                  className="w-full px-3 py-2 border border-yellow-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-yellow-50"
                >
                  <option value="">Select value</option>
                  {items.map(item => (
                    <option key={item.id} value={item.name}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Notes Section */}
            <div className="space-y-4 min-w-[300px]">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h3 className="text-sm font-medium text-yellow-800 mb-2">Note:</h3>
                <p className="text-sm text-yellow-700">ACT 2025 = ACT + Future Forecast</p>
                <p className="text-sm text-yellow-700">(For future months (above August))</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-sm text-gray-600">Sales Without Budget</span>
                  <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">i</span>
                  </div>
                </div>
              </div>
              
              <button
                onClick={() => setIsNewAdditionModalOpen(true)}
                className="w-full bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors text-sm flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                New Addition
              </button>

              <button
                onClick={() => setIsSeasonalGrowthModalOpen(true)}
                className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm flex items-center gap-2 mb-2"
                title="View holiday-aware seasonal growth patterns and distribution logic"
              >
                <Calendar className="w-4 h-4" />
                Seasonal Growth
              </button>

              <button
                onClick={() => setIsStockManagementModalOpen(true)}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm flex items-center gap-2"
                title={user?.role === 'manager' ? "Manage all salesman stock requests" : "Manage stock requests and alerts"}
              >
                <Package className="w-4 h-4" />
                Stock Manager
              </button>
              
              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="rounded" />
                  <span className="text-sm text-gray-700">With 2025 Forecast</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="rounded" />
                  <span className="text-sm text-gray-700">Without 2025 Forecast</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Summary Statistics */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="grid grid-cols-3 gap-4 text-center mb-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-sm text-gray-600 mb-1">Budget {selectedBaseYear}</div>
              <div className="text-2xl font-bold text-gray-900">${summaryStats.budget.toLocaleString()}</div>
              <div className="text-sm text-gray-500">{summaryStats.unitsBudget.toLocaleString()} Units</div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-sm text-gray-600 mb-1">Sales {selectedBaseYear}</div>
              <div className="text-2xl font-bold text-gray-900">${summaryStats.sales.toLocaleString()}</div>
              <div className="text-sm text-gray-500">{summaryStats.unitsSales.toLocaleString()} Units</div>
            </div>

            <div className={`rounded-lg p-4 transition-all duration-300 ${
              summaryStats.unitsForecast > 0
                ? 'bg-gradient-to-br from-green-50 to-green-100 border border-green-200'
                : 'bg-gray-50'
            }`}>
              <div className="text-sm text-gray-600 mb-1">Forecast {selectedTargetYear}</div>
              <div className={`text-2xl font-bold ${
                summaryStats.unitsForecast > 0 ? 'text-green-900' : 'text-gray-900'
              }`}>${summaryStats.forecast.toLocaleString()}</div>
              <div className={`text-sm ${
                summaryStats.unitsForecast > 0 ? 'text-green-600' : 'text-gray-500'
              }`}>{summaryStats.unitsForecast.toLocaleString()} Units</div>
              {summaryStats.unitsForecast > 0 && (
                <div className="mt-1">
                  <span className="inline-block px-2 py-1 bg-green-200 text-green-800 text-xs rounded-full font-medium">
                    ������ Active
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Data Preservation Status */}
        {user && (
          <div className="mb-6">
            <DataPreservationIndicator
              itemsCount={tableData.length}
              submittedCount={DataPersistenceManager.getSubmittedRollingForecastData().filter(item => item.createdBy === user.name).length}
              preservedCount={DataPersistenceManager.getOriginalRollingForecastData().filter(item => item.createdBy === user.name).length}
              dataType="forecast"
              compact={true}
            />
          </div>
        )}

        {/* Customer-Specific Forecast Totals */}
        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
            <span>📊</span>
            Forecast Breakdown by Customer
          </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {(() => {
                // Calculate customer-specific totals
                const customerTotals = tableData.reduce((acc, row) => {
                  const monthlyData = getMonthlyData(row.id);
                  const customerForecast = Object.values(monthlyData).reduce((sum, value) => sum + (value || 0), 0);

                  if (!acc[row.customer]) {
                    acc[row.customer] = {
                      budget: 0,
                      sales: 0,
                      forecast: 0,
                      items: 0
                    };
                  }

                  acc[row.customer].budget += row.bud25;
                  acc[row.customer].sales += row.ytd25;
                  acc[row.customer].forecast += customerForecast; // Use calculated forecast
                  acc[row.customer].items += 1;

                  return acc;
                }, {} as Record<string, {budget: number, sales: number, forecast: number, items: number}>);

                return Object.entries(customerTotals).map(([customer, totals]) => (
                  <div key={customer} className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-blue-900 truncate" title={customer}>
                        {customer.length > 20 ? customer.substring(0, 20) + '...' : customer}
                      </h4>
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                        {totals.items} items
                      </span>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-blue-700">Budget Units:</span>
                        <span className="font-medium text-blue-900">{totals.budget.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-blue-700">Sales Units:</span>
                        <span className="font-medium text-blue-900">{totals.sales.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-blue-700">Forecast Units:</span>
                        <span className="font-bold text-green-600">{totals.forecast.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between pt-2 border-t border-blue-200">
                        <span className="text-blue-700">Forecast vs Budget:</span>
                        <span className={`font-medium ${
                          totals.forecast > totals.budget ? 'text-green-600' :
                          totals.forecast < totals.budget ? 'text-red-600' : 'text-gray-600'
                        }`}>
                          {totals.budget > 0 ?
                            `${((totals.forecast - totals.budget) / totals.budget * 100).toFixed(1)}%` :
                            'N/A'
                          }
                        </span>
                      </div>
                    </div>
                  </div>
                ));
              })()}
            </div>
          </div>
          
          {/* Inventory Management Insights */}
          <div className="mt-6 grid grid-cols-2 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-blue-800 mb-2">Inventory Insights</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Stock Turnover:</span>
                  <span className="font-medium">{inventoryInsights.stockTurnover.toFixed(1)}x/year</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Safety Stock:</span>
                  <span className="font-medium">{inventoryInsights.safetyStock.toFixed(0)} units</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Reorder Point:</span>
                  <span className="font-medium">{inventoryInsights.reorderPoint.toFixed(0)} units</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Stock Health:</span>
                  <span className={`font-medium ${inventoryInsights.stockHealth === 'Good' ? 'text-green-600' : 'text-red-600'}`}>
                    {inventoryInsights.stockHealth}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="bg-green-50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-green-800 mb-2">Growth Opportunities</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Forecast vs Budget:</span>
                  <span className={`font-medium ${summaryStats.forecast > summaryStats.budget ? 'text-green-600' : 'text-red-600'}`}>
                    {summaryStats.budget > 0 ? ((summaryStats.forecast - summaryStats.budget) / summaryStats.budget * 100).toFixed(1) : 0}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Demand Coverage:</span>
                  <span className="font-medium">
                    {inventoryInsights.totalStock + inventoryInsights.totalGit > 0 ? 
                      ((inventoryInsights.totalStock + inventoryInsights.totalGit) / summaryStats.forecast * 100).toFixed(1) : 0}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Pipeline Value:</span>
                  <span className="font-medium">${(inventoryInsights.totalGit * 100).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Growth Potential:</span>
                  <span className="font-medium text-green-600">
                    {summaryStats.forecast > summaryStats.sales ? 'High' : 'Moderate'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden content-container">
          <div className="max-h-[500px] overflow-auto">
            <table className="w-full responsive-table table-responsive">
              <thead className="bg-gray-50 border-b border-gray-200 sticky top-0 z-10">
                <tr>
                  <th className="px-1 sm:px-2 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">
                    <input 
                      type="checkbox" 
                      className="rounded" 
                      checked={selectAll}
                      onChange={handleSelectAll}
                    />
                  </th>
                  {activeView === 'customer-item' ? (
                    <>
                      <th
                        className="px-1 sm:px-2 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 w-48"
                        onClick={() => handleSort('customer')}
                      >
                        <div className="flex items-center gap-1">
                          CUSTOMER
                          {getSortIcon('customer')}
                        </div>
                      </th>
                      <th
                        className="px-1 sm:px-2 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 w-64"
                        onClick={() => handleSort('item')}
                      >
                        <div className="flex items-center gap-1">
                          ITEM
                          {getSortIcon('item')}
                        </div>
                      </th>
                    </>
                  ) : (
                    <>
                      <th
                        className="px-1 sm:px-2 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 w-80"
                        onClick={() => handleSort('item')}
                      >
                        <div className="flex items-center gap-1">
                          ITEM - CUSTOMER
                          {getSortIcon('item')}
                        </div>
                      </th>
                      {/* Customer column hidden in item-wise mode */}
                    </>
                  )}
                  <th
                    className="px-1 sm:px-2 py-2 sm:py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 w-20"
                    onClick={() => handleSort('bud25')}
                  >
                    <div className="flex items-center justify-center gap-1">
                      BUD {selectedBaseYear.slice(-2)}'
                      {getSortIcon('bud25')}
                    </div>
                  </th>
                  <th
                    className="px-1 sm:px-2 py-2 sm:py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 w-20 hide-mobile"
                    onClick={() => handleSort('ytd25')}
                  >
                    <div className="flex items-center justify-center gap-1">
                      YTD {selectedBaseYear.slice(-2)}'
                      {getSortIcon('ytd25')}
                    </div>
                  </th>
                  <th 
                    className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 w-20"
                    onClick={() => handleSort('forecast')}
                  >
                    <div className="flex items-center justify-center gap-1">
                      FORECAST
                      {getSortIcon('forecast')}
                    </div>
                  </th>
                  <th 
                    className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 w-20"
                    onClick={() => handleSort('stock')}
                  >
                    <div className="flex items-center justify-center gap-1">
                      STOCK
                      {getSortIcon('stock')}
                    </div>
                  </th>
                  <th
                    className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 w-20"
                    onClick={() => handleSort('git')}
                  >
                    <div className="flex items-center justify-center gap-1 flex-col">
                      <div className="flex items-center gap-1">
                        GIT
                        {getSortIcon('git')}
                      </div>
                      <span className="text-xs text-blue-500 normal-case">👑 Admin</span>
                    </div>
                  </th>
                  <th
                    className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 w-24"
                    onClick={() => handleSort('eta')}
                  >
                    <div className="flex items-center justify-center gap-1 flex-col">
                      <div className="flex items-center gap-1">
                        ETA
                        {getSortIcon('eta')}
                      </div>
                      <span className="text-xs text-blue-500 normal-case">👑 Admin</span>
                    </div>
                  </th>
                  <th className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-16">
                    ACTION
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedData.map((row) => (
                  <React.Fragment key={row.id}>
                    <tr className="hover:bg-gray-50 transition-colors">
                      <td className="px-2 py-3 whitespace-nowrap">
                        <input 
                          type="checkbox" 
                          className="rounded" 
                          checked={selectedRows.has(row.id)}
                          onChange={() => handleRowSelect(row.id)}
                        />
                      </td>
                      {activeView === 'customer-item' ? (
                        <>
                          <td className="px-2 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                            <div className="flex items-center justify-between">
                              <div
                                className={`${
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
                                    if (user?.role === 'manager') {
                                      // Convert row data to monthly format for view-only modal
                                      const monthlyData = getShortMonthNames().map(month => ({
                                        month,
                                        budgetValue: getMonthlyData(row.id)[month] || 0,
                                        actualValue: 0,
                                        rate: 100,
                                        stock: row.stock,
                                        git: row.git,
                                        discount: 0
                                      }));

                                      setSelectedRowForViewOnly({
                                        ...row,
                                        monthlyData,
                                        category: 'TYRE SERVICE',
                                        brand: 'Various'
                                      });
                                      setIsViewOnlyModalOpen(true);
                                    } else {
                                      handleExpandRow(row.id);
                                    }
                                  }}
                                  className="ml-2 w-5 h-5 bg-green-100 hover:bg-green-200 text-green-600 rounded-full flex items-center justify-center text-xs font-bold transition-colors"
                                  title={user?.role === 'manager' ? "View monthly forecast distribution" : "Edit monthly forecast"}
                                >
                                  +
                                </button>
                              )}
                            </div>
                          </td>
                          <td className="px-2 py-3 whitespace-nowrap text-sm text-gray-900">
                            {row.item}
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="px-2 py-3 whitespace-nowrap text-sm text-gray-900" style={{maxWidth: '320px'}}>
                            <div className="flex items-center justify-between">
                              <div className="truncate">
                                <div className="font-medium text-gray-900 truncate">
                                  {row.item}
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
                                    // Convert row data to monthly format for view-only modal
                                    const monthlyData = getShortMonthNames().map(month => ({
                                      month,
                                      budgetValue: getMonthlyData(row.id)[month] || 0,
                                      actualValue: 0,
                                      rate: 100,
                                      stock: row.stock,
                                      git: row.git,
                                      discount: 0
                                    }));

                                    setSelectedRowForViewOnly({
                                      ...row,
                                      monthlyData,
                                      category: 'TYRE SERVICE',
                                      brand: 'Various'
                                    });
                                    setIsViewOnlyModalOpen(true);
                                  }}
                                  className="ml-2 w-5 h-5 bg-green-100 hover:bg-green-200 text-green-600 rounded-full flex items-center justify-center text-xs font-bold transition-colors flex-shrink-0"
                                  title="View monthly forecast distribution"
                                >
                                  +
                                </button>
                              )}
                            </div>
                          </td>
                          {/* Customer column hidden in item-wise mode */}
                        </>
                      )}
                      <td className="px-2 py-3 whitespace-nowrap text-center text-sm text-gray-900">
                        {getYearValue(row, selectedBaseYear, 'budget')}
                      </td>
                      <td className="px-2 py-3 whitespace-nowrap text-center text-sm text-gray-900">
                        {getYearValue(row, selectedBaseYear, 'actual')}
                      </td>
                      <td className="px-2 py-3 whitespace-nowrap text-center text-sm text-gray-900">
                        {row.forecast}
                      </td>
                      <td className="px-2 py-3 whitespace-nowrap text-center text-sm text-gray-900">
                        {row.stock}
                      </td>
                      <td className="px-2 py-3 whitespace-nowrap text-center text-sm text-gray-900">
                        <GitDetailsTooltip customer={row.customer} item={row.item}>
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
                                  <div className="space-y-1 mt-1">
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
                        </GitDetailsTooltip>
                      </td>
                      <td className="px-2 py-3 whitespace-nowrap text-center text-sm text-gray-900">
                        {(() => {
                          const gitSummary = DataPersistenceManager.getGitSummaryForItem(row.customer, row.item);

                          if (gitSummary.eta) {
                            const etaDate = new Date(gitSummary.eta);
                            const today = new Date();
                            const daysUntilEta = Math.ceil((etaDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

                            return (
                              <div className="text-center">
                                <div className="font-medium text-gray-900">
                                  {etaDate.toLocaleDateString()}
                                </div>
                                <div className={`text-xs ${
                                  daysUntilEta < 0 ? 'text-red-600' :
                                  daysUntilEta <= 7 ? 'text-orange-600' :
                                  'text-green-600'
                                }`}>
                                  {daysUntilEta < 0 ? `${Math.abs(daysUntilEta)} days overdue` :
                                   daysUntilEta === 0 ? 'Today' :
                                   `${daysUntilEta} days`}
                                </div>
                              </div>
                            );
                          }

                          return <span className="text-gray-400">-</span>;
                        })()}
                      </td>
                      <td className="px-2 py-3 whitespace-nowrap text-center">
                        <button
                          onClick={() => handleExpandRow(row.id)}
                          className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                            expandedRows.has(row.id) 
                              ? 'bg-red-500 hover:bg-red-600 text-white' 
                              : 'bg-green-500 hover:bg-green-600 text-white'
                          }`}
                          title={expandedRows.has(row.id) ? "Close Forecast" : "Make Forecast"}
                        >
                          {expandedRows.has(row.id) ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                        </button>
                      </td>
                    </tr>
                    
                    {/* Nested Monthly Forecast Table */}
                    {expandedRows.has(row.id) && (
                      <tr>
                        <td colSpan={10} className="px-0 py-0">
                          <div className="bg-gray-50 border-t border-gray-200">
                            <div className="px-4 py-3">
                              <h4 className="text-sm font-medium text-gray-700 mb-3">Monthly Forecast Breakdown</h4>
                              <div className="overflow-x-auto">
                                <table className="w-full text-xs">
                                  <thead>
                                    <tr className="border-b border-gray-200">
                                      <th className="px-2 py-2 text-left font-medium text-gray-600">Period</th>
                                      <th className="px-2 py-2 text-center font-medium text-gray-600">JAN</th>
                                      <th className="px-2 py-2 text-center font-medium text-gray-600">FEB</th>
                                      <th className="px-2 py-2 text-center font-medium text-gray-600">MAR</th>
                                      <th className="px-2 py-2 text-center font-medium text-gray-600">APR</th>
                                      <th className="px-2 py-2 text-center font-medium text-gray-600">MAY</th>
                                      <th className="px-2 py-2 text-center font-medium text-gray-600">JUN</th>
                                      <th className="px-2 py-2 text-center font-medium text-gray-600">JUL</th>
                                      <th className="px-2 py-2 text-center font-medium text-gray-600">AUG</th>
                                      <th className="px-2 py-2 text-center font-medium text-gray-600">SEP</th>
                                      <th className="px-2 py-2 text-center font-medium text-gray-600">OCT</th>
                                      <th className="px-2 py-2 text-center font-medium text-gray-600">NOV</th>
                                      <th className="px-2 py-2 text-center font-medium text-gray-600">DEC</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    <tr className="border-b border-gray-200">
                                      <td className="px-2 py-2 font-medium text-gray-700">2024</td>
                                      {['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'].map(month => (
                                        <td key={month} className="px-2 py-2 text-center text-gray-600">0</td>
                                      ))}
                                    </tr>
                                    <tr className="border-b border-gray-200 bg-orange-100">
                                      <td className="px-2 py-2 font-medium text-gray-700">BUD 2025'</td>
                                      {['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'].map(month => {
                                        const budgetValue = tableData.find(item => item.id === row.id)?.budgetDistribution?.[month] || 0;
                                        return (
                                          <td key={month} className="px-2 py-2 text-center text-gray-600 font-medium">
                                            {budgetValue}
                                          </td>
                                        );
                                      })}
                                    </tr>
                                    <tr className="bg-purple-100">
                                      <td className="px-2 py-2 font-medium text-gray-700">ACT 2025'</td>
                                      {getShortMonthNames().map(month => {
                                        const currentMonth = getCurrentMonth();
                                        const monthIndex = getShortMonthNames().indexOf(month);
                                        const isEditable = monthIndex > currentMonth; // Only allow editing future months
                                        const currentForecastValue = getMonthlyData(row.id)[month] || 0;
                                        const rowData = tableData.find(item => item.id === row.id);
                                        const isPastOrCurrent = monthIndex <= currentMonth;

                                        return (
                                          <td key={month} className="px-2 py-2 text-center">
                                            {isEditable ? (
                                              <div className="relative">
                                                <input
                                                  type="number"
                                                  className="w-12 px-1 py-1 text-center border border-gray-300 rounded text-xs bg-white focus:bg-yellow-50 focus:border-blue-500"
                                                  value={currentForecastValue}
                                                  onChange={(e) => handleMonthlyForecastChange(row.id, month, parseInt(e.target.value) || 0)}
                                                  min="0"
                                                  placeholder="0"
                                                />
                                                <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full" title="Future month - editable"></div>
                                              </div>
                                            ) : (
                                              <div className="relative">
                                                <span className="text-gray-500 bg-gray-100 px-2 py-1 rounded text-xs">
                                                  {isPastOrCurrent ? (rowData?.ytd25 > 0 ? Math.floor(rowData.ytd25 / (currentMonth + 1)) : 0) : '0'}
                                                </span>
                                                <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" title="Past/current month - read only"></div>
                                              </div>
                                            )}
                                          </td>
                                        );
                                      })}
                                    </tr>
                                  </tbody>
                                </table>
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

          {/* Empty State */}
          {sortedData.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-500 text-sm">No data found matching your filters</div>
            </div>
          )}
        </div>

        {/* Submit Button - Role Based */}
        <div className="flex justify-end">
          {user?.role === 'salesman' ? (
            <button
              onClick={handleSubmit}
              className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg transition-colors font-medium flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              Submit for Approval
            </button>
          ) : user?.role === 'manager' ? (
            <div className="flex gap-3">
              <button
                onClick={() => alert('Forecast data exported for analysis')}
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors font-medium flex items-center gap-2"
              >
                <DownloadIcon className="w-4 h-4" />
                Export Analysis
              </button>
              <button
                onClick={() => alert('Manager view - Use Approval Center for approving forecasts')}
                className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-2 rounded-lg transition-colors font-medium flex items-center gap-2"
              >
                <Eye className="w-4 h-4" />
                Review Mode
              </button>
            </div>
          ) : null}
        </div>
      </div>

      {/* New Addition Modal */}
      {isNewAdditionModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Add Customer/Item</h2>
                <button
                  onClick={() => setIsNewAdditionModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Customer Section */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Customer</h3>
                
                {/* Customer Selection Options */}
                <div className="space-y-3 mb-4">
                  <label className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedCustomerOption === 'existing' ? 'border-orange-500 bg-orange-50' : 'border-gray-300 hover:bg-gray-50'
                  }`}>
                    <input
                      type="radio"
                      name="customerOption"
                      value="existing"
                      checked={selectedCustomerOption === 'existing'}
                      onChange={(e) => setSelectedCustomerOption(e.target.value as 'existing' | 'new')}
                      className="sr-only"
                    />
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      selectedCustomerOption === 'existing' ? 'border-orange-500 bg-orange-500' : 'border-gray-300'
                    }`}>
                      {selectedCustomerOption === 'existing' && <div className="w-2.5 h-2.5 bg-white rounded-full"></div>}
                    </div>
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                        <List className="w-5 h-5 text-orange-600" />
                      </div>
                      <span className="text-sm font-medium text-gray-900">Select from existing customers list</span>
                    </div>
                  </label>

                  <label className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedCustomerOption === 'new' ? 'border-orange-500 bg-orange-50' : 'border-gray-300 hover:bg-gray-50'
                  }`}>
                    <input
                      type="radio"
                      name="customerOption"
                      value="new"
                      checked={selectedCustomerOption === 'new'}
                      onChange={(e) => setSelectedCustomerOption(e.target.value as 'existing' | 'new')}
                      className="sr-only"
                    />
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      selectedCustomerOption === 'new' ? 'border-orange-500 bg-orange-500' : 'border-gray-300'
                    }`}>
                      {selectedCustomerOption === 'new' && <div className="w-2.5 h-2.5 bg-white rounded-full"></div>}
                    </div>
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <UserPlus className="w-5 h-5 text-blue-600" />
                      </div>
                      <span className="text-sm font-medium text-gray-900">Create New Customer</span>
                    </div>
                  </label>
                </div>

                {/* Customer Details */}
                <div className="space-y-4">
                  {selectedCustomerOption === 'existing' ? (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Customer</label>
                      <div className="relative">
                        <select
                          value={selectedExistingCustomer}
                          onChange={(e) => setSelectedExistingCustomer(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                        >
                          <option value="">Search customer</option>
                          {customers.map(customer => (
                            <option key={customer.id} value={customer.name}>
                              {customer.name}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-2.5 w-4 h-4 text-gray-400 pointer-events-none" />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">CUSTOMER NAME</label>
                          <input
                            type="text"
                            placeholder="Enter customer name"
                            value={newCustomerData.name}
                            onChange={(e) => setNewCustomerData({...newCustomerData, name: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">CUSTOMER CODE</label>
                          <input
                            type="text"
                            placeholder="Enter customer code"
                            value={newCustomerData.code}
                            onChange={(e) => setNewCustomerData({...newCustomerData, code: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">EMAIL</label>
                          <input
                            type="email"
                            placeholder="Enter email address"
                            value={newCustomerData.email}
                            onChange={(e) => setNewCustomerData({...newCustomerData, email: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">PHONE</label>
                          <input
                            type="tel"
                            placeholder="Enter phone number"
                            value={newCustomerData.phone}
                            onChange={(e) => setNewCustomerData({...newCustomerData, phone: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">REGION</label>
                          <select
                            value={newCustomerData.region}
                            onChange={(e) => setNewCustomerData({...newCustomerData, region: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="">Select region</option>
                            <option value="Africa">Africa</option>
                            <option value="North America">North America</option>
                            <option value="Europe">Europe</option>
                            <option value="Asia">Asia</option>
                            <option value="Latin America">Latin America</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">SEGMENT</label>
                          <select
                            value={newCustomerData.segment}
                            onChange={(e) => setNewCustomerData({...newCustomerData, segment: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="">Select segment</option>
                            <option value="Enterprise">Enterprise</option>
                            <option value="SMB">SMB</option>
                            <option value="Government">Government</option>
                            <option value="NGO">NGO</option>
                            <option value="Retail">Retail</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Item Section */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Item</h3>
                
                {/* Item Selection Options */}
                <div className="space-y-3 mb-4">
                  <label className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedItemOption === 'existing' ? 'border-orange-500 bg-orange-50' : 'border-gray-300 hover:bg-gray-50'
                  }`}>
                    <input
                      type="radio"
                      name="itemOption"
                      value="existing"
                      checked={selectedItemOption === 'existing'}
                      onChange={(e) => setSelectedItemOption(e.target.value as 'existing')}
                      className="sr-only"
                    />
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      selectedItemOption === 'existing' ? 'border-orange-500 bg-orange-500' : 'border-gray-300'
                    }`}>
                      {selectedItemOption === 'existing' && <div className="w-2.5 h-2.5 bg-white rounded-full"></div>}
                    </div>
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                        <List className="w-5 h-5 text-orange-600" />
                      </div>
                      <span className="text-sm font-medium text-gray-900">Select from existing items list</span>
                    </div>
                  </label>
                </div>

                {/* Item Details */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Item</label>
                  <div className="relative">
                    <select
                      value={selectedExistingItem}
                      onChange={(e) => setSelectedExistingItem(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                    >
                      <option value="">Search item</option>
                      {items.map(item => (
                        <option key={item.id} value={item.name}>
                          {item.name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-2.5 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4">
              <div className="flex gap-3">
                <button
                  onClick={handleSaveNewAddition}
                  className="flex-1 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors font-medium"
                >
                  Save
                </button>
                <button
                  onClick={() => setIsNewAdditionModalOpen(false)}
                  className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Customer Forecast Modal */}
      <CustomerForecastModal
        isOpen={isCustomerForecastModalOpen}
        onClose={() => setIsCustomerForecastModalOpen(false)}
        customerData={selectedCustomerForBreakdown ? generateCustomerForecastData(selectedCustomerForBreakdown) : null}
        viewType="rolling_forecast"
      />

      {/* View Only Monthly Distribution Modal */}
      <ViewOnlyMonthlyDistributionModal
        isOpen={isViewOnlyModalOpen}
        onClose={() => {
          setIsViewOnlyModalOpen(false);
          setSelectedRowForViewOnly(null);
        }}
        data={selectedRowForViewOnly ? {
          customer: selectedRowForViewOnly.customer,
          item: selectedRowForViewOnly.item,
          category: selectedRowForViewOnly.category || 'TYRE SERVICE',
          brand: selectedRowForViewOnly.brand || 'Various',
          monthlyData: selectedRowForViewOnly.monthlyData || [],
          totalBudget: Object.values(getMonthlyData(selectedRowForViewOnly.id) || {}).reduce((sum: number, val: any) => sum + (val || 0), 0),
          totalActual: selectedRowForViewOnly.ytd25 || 0,
          totalUnits: Object.values(getMonthlyData(selectedRowForViewOnly.id) || {}).reduce((sum: number, val: any) => sum + (val || 0), 0),
          createdBy: 'Salesman',
          lastModified: new Date().toISOString()
        } : null}
        type="rolling_forecast"
      />

      {/* Stock Management Modals */}
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

      {/* Seasonal Growth Information Modal */}
      <SeasonalDistributionInfo
        isOpen={isSeasonalGrowthModalOpen}
        onClose={() => setIsSeasonalGrowthModalOpen(false)}
      />
    </Layout>
  );
};

export default RollingForecast;
