import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import {
  BarChart3,
  PieChart,
  TrendingUp,
  TrendingDown,
  Activity,
  Users,
  DollarSign,
  Package,
  Calendar,
  Download,
  RefreshCw,
  Settings,
  Filter,
  Maximize2,
  Eye,
  EyeOff,
  AlertCircle,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { formatCurrency, formatPercentage } from '../utils/budgetCalculations';
import { budgetDataIntegration, BudgetAnalyticsData, ForecastInsight } from '../utils/budgetDataIntegration';
import SalesTrendChart from '../components/charts/SalesTrendChart';
import BudgetComparisonChart from '../components/charts/BudgetComparisonChart';
import BudgetAllocationChart from '../components/charts/BudgetAllocationChart';
import GaugeChart from '../components/charts/GaugeChart';
import GitSummaryWidget from '../components/GitSummaryWidget';

interface DashboardWidget {
  id: string;
  title: string;
  type: 'kpi' | 'chart' | 'table' | 'gauge';
  value?: number | string;
  change?: number;
  changeType?: 'positive' | 'negative' | 'neutral';
  data?: any[];
  config?: any;
  size: 'small' | 'medium' | 'large';
  category: string;
}

interface BiMetric {
  id: string;
  name: string;
  value: number;
  previousValue: number;
  format: 'currency' | 'percentage' | 'number';
  target?: number;
  category: 'sales' | 'budget' | 'forecast' | 'operations';
  trend: 'up' | 'down' | 'stable';
  confidence: number;
}

const BiDashboard: React.FC = () => {
  const { user } = useAuth();
  const [selectedPeriod, setSelectedPeriod] = useState('current_month');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [widgets, setWidgets] = useState<DashboardWidget[]>([]);
  const [metrics, setMetrics] = useState<BiMetric[]>([]);
  const [insights, setInsights] = useState<ForecastInsight[]>([]);
  const [budgetAnalytics, setBudgetAnalytics] = useState<BudgetAnalyticsData | null>(null);
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null);

  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  useEffect(() => {
    loadDashboardData();
  }, [selectedPeriod, selectedCategory]);

  const loadDashboardData = async () => {
    setRefreshing(true);

    // Simulate loading delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Load real budget data from localStorage or use sample data
    const savedBudgetData = localStorage.getItem('salesBudgetData');
    if (savedBudgetData) {
      try {
        const budgetData = JSON.parse(savedBudgetData);
        budgetDataIntegration.setBudgetData(budgetData);
      } catch (error) {
        console.warn('Failed to load budget data:', error);
      }
    }

    // Get real analytics from budget data
    const analytics = budgetDataIntegration.getBudgetAnalytics();
    setBudgetAnalytics(analytics);

    // Generate metrics from real data
    const realMetrics: BiMetric[] = [
      {
        id: 'total_sales',
        name: 'Total Sales (Actual)',
        value: analytics.totalActual2025,
        previousValue: analytics.totalBudget2025 * 0.9, // Simulate previous period
        format: 'currency',
        target: analytics.totalBudget2025,
        category: 'sales',
        trend: analytics.totalActual2025 > analytics.totalBudget2025 * 0.9 ? 'up' : 'down',
        confidence: analytics.forecastAccuracy
      },
      {
        id: 'budget_utilization',
        name: 'Budget Utilization',
        value: analytics.budgetUtilization,
        previousValue: analytics.budgetUtilization * 0.95, // Simulate previous period
        format: 'percentage',
        target: 0.90,
        category: 'budget',
        trend: analytics.budgetUtilization > 0.85 ? 'up' : 'down',
        confidence: 0.92
      },
      {
        id: 'forecast_accuracy',
        name: 'Forecast Accuracy',
        value: analytics.forecastAccuracy,
        previousValue: analytics.forecastAccuracy * 0.98, // Simulate previous period
        format: 'percentage',
        category: 'forecast',
        trend: analytics.forecastAccuracy > 0.85 ? 'up' : 'down',
        confidence: 0.88
      },
      {
        id: 'budget_growth',
        name: 'Budget Growth Rate',
        value: analytics.growthRate / 100,
        previousValue: (analytics.growthRate * 0.8) / 100, // Simulate previous period
        format: 'percentage',
        category: 'operations',
        trend: analytics.growthRate > 10 ? 'up' : analytics.growthRate < -5 ? 'down' : 'stable',
        confidence: 0.85
      }
    ];

    // Generate sample widgets
    const sampleWidgets: DashboardWidget[] = [
      {
        id: 'sales_trend',
        title: 'Sales Trend',
        type: 'chart',
        size: 'large',
        category: 'sales',
        data: generateTrendData()
      },
      {
        id: 'budget_vs_actual',
        title: 'Budget vs Actual',
        type: 'chart',
        size: 'medium',
        category: 'budget',
        data: generateBudgetComparisonData()
      },
      {
        id: 'top_customers',
        title: 'Top Customers',
        type: 'table',
        size: 'medium',
        category: 'sales',
        data: generateCustomerData()
      },
      {
        id: 'forecast_accuracy_gauge',
        title: 'Forecast Accuracy',
        type: 'gauge',
        size: 'small',
        category: 'forecast',
        value: '94%',
        config: { value: 94, max: 100, color: 'green' }
      },
      {
        id: 'budget_allocation',
        title: 'Budget Allocation',
        type: 'chart',
        size: 'medium',
        category: 'budget',
        data: generateBudgetAllocationData()
      },
      {
        id: 'regional_performance',
        title: 'Regional Performance',
        type: 'chart',
        size: 'large',
        category: 'sales',
        data: generateRegionalData()
      }
    ];

    // Generate real insights from budget data
    const realInsights = budgetDataIntegration.generateInsights();

    setMetrics(realMetrics);
    setWidgets(sampleWidgets);
    setInsights(realInsights);
    setLastRefresh(new Date());
    setRefreshing(false);
  };

  const generateTrendData = () => {
    if (!budgetAnalytics) {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return months.map(month => ({
        month,
        sales: Math.floor(Math.random() * 500000) + 1500000,
        budget: Math.floor(Math.random() * 400000) + 1600000,
        forecast: Math.floor(Math.random() * 450000) + 1550000
      }));
    }
    return budgetAnalytics.monthlyTrends;
  };

  const generateBudgetComparisonData = () => {
    if (!budgetAnalytics || budgetAnalytics.topCategories.length === 0) {
      return [
        { category: 'Sales & Marketing', budget: 500000, actual: 485000, variance: -3 },
        { category: 'Operations', budget: 750000, actual: 820000, variance: 9.3 }
      ];
    }

    return budgetAnalytics.topCategories.map(category => ({
      category: category.name,
      budget: category.budget,
      actual: category.actual,
      variance: category.budget > 0 ? ((category.actual - category.budget) / category.budget) * 100 : 0
    }));
  };

  const generateCustomerData = () => {
    if (!budgetAnalytics) {
      return [
        { name: 'Acme Corporation', revenue: 245000, growth: 15.2, region: 'North America' },
        { name: 'Global Tech Solutions', revenue: 198000, growth: 8.7, region: 'Europe' }
      ];
    }

    return budgetAnalytics.topCustomers.slice(0, 5).map(customer => ({
      name: customer.name,
      revenue: customer.actual,
      growth: customer.variance,
      region: budgetDataIntegration.getRegionFromCustomer ? budgetDataIntegration.getRegionFromCustomer(customer.name) : 'Global'
    }));
  };

  const generateBudgetAllocationData = () => {
    if (!budgetAnalytics || budgetAnalytics.topCategories.length === 0) {
      return [
        { name: 'Product Development', value: 35, amount: 1750000 },
        { name: 'Sales & Marketing', value: 25, amount: 1250000 }
      ];
    }

    const totalBudget = budgetAnalytics.topCategories.reduce((sum, cat) => sum + cat.budget, 0);
    return budgetAnalytics.topCategories.map(category => ({
      name: category.name,
      value: totalBudget > 0 ? Math.round((category.budget / totalBudget) * 100) : 0,
      amount: category.budget
    }));
  };

  const generateRegionalData = () => {
    if (!budgetAnalytics) {
      return [
        { region: 'North America', q1: 850000, q2: 920000, q3: 1100000, q4: 1200000 },
        { region: 'Europe', q1: 650000, q2: 720000, q3: 850000, q4: 950000 }
      ];
    }

    return budgetAnalytics.regionPerformance.map(region => ({
      region: region.region,
      q1: region.budget * 0.23,
      q2: region.budget * 0.25,
      q3: region.budget * 0.26,
      q4: region.budget * 0.26
    }));
  };

  const formatMetricValue = (metric: BiMetric) => {
    switch (metric.format) {
      case 'currency':
        return formatCurrency(metric.value);
      case 'percentage':
        return formatPercentage(metric.value * 100);
      case 'number':
        return metric.value.toLocaleString();
      default:
        return metric.value.toString();
    }
  };

  const calculateChange = (current: number, previous: number) => {
    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  };

  const getChangeIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return <ArrowUpRight className="w-4 h-4 text-green-600" />;
      case 'down':
        return <ArrowDownRight className="w-4 h-4 text-red-600" />;
      default:
        return <div className="w-4 h-4" />;
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'opportunity':
        return <Target className="w-5 h-5 text-green-600" />;
      case 'risk':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      case 'trend':
        return <TrendingUp className="w-5 h-5 text-blue-600" />;
      default:
        return <Activity className="w-5 h-5 text-gray-600" />;
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-2xl font-bold text-gray-900 mb-2">
              <span className="text-gray-500 font-light">BI Tools /</span> Analytics Dashboard
            </h4>
            <p className="text-gray-600 text-sm">
              Advanced business intelligence and analytics for sales budgeting and forecasting
            </p>
          </div>
          <div className="flex space-x-2">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="current_month">Current Month</option>
              <option value="last_month">Last Month</option>
              <option value="current_quarter">Current Quarter</option>
              <option value="last_quarter">Last Quarter</option>
              <option value="current_year">Current Year</option>
              <option value="last_year">Last Year</option>
            </select>
            <button
              onClick={loadDashboardData}
              disabled={refreshing}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
            <button
              onClick={() => {
                const exportData = {
                  metrics: metrics,
                  insights: insights,
                  budgetAnalytics: budgetAnalytics,
                  trendData: generateTrendData(),
                  comparisonData: generateBudgetComparisonData(),
                  customerData: generateCustomerData(),
                  exportDate: new Date().toISOString()
                };
                const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `bi-dashboard-export-${new Date().toISOString().split('T')[0]}.json`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                showNotification('Dashboard data exported successfully', 'success');
              }}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Export Dashboard</span>
            </button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {metrics.map((metric) => {
            const change = calculateChange(metric.value, metric.previousValue);
            const isPositive = change > 0;
            
            return (
              <div key={metric.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-gray-600">{metric.name}</h3>
                  {getChangeIcon(metric.trend)}
                </div>
                <div className="space-y-2">
                  <p className="text-3xl font-bold text-gray-900">
                    {formatMetricValue(metric)}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className={`text-sm font-medium flex items-center ${
                      isPositive ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {isPositive ? '+' : ''}{change.toFixed(1)}%
                    </span>
                    <span className="text-xs text-gray-500">vs previous period</span>
                  </div>
                  {metric.target && (
                    <div className="mt-2">
                      <div className="flex justify-between text-xs text-gray-600 mb-1">
                        <span>Target</span>
                        <span>{formatMetricValue({...metric, value: metric.target})}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            metric.value >= metric.target ? 'bg-green-500' : 'bg-blue-500'
                          }`}
                          style={{ width: `${Math.min((metric.value / metric.target) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Insights Panel */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">AI-Powered Insights</h3>
            <span className="text-sm text-gray-500">
              Last updated: {lastRefresh.toLocaleTimeString()}
            </span>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {insights.map((insight) => (
              <div key={insight.id} className={`p-4 rounded-lg border-l-4 ${
                insight.type === 'opportunity' ? 'border-green-500 bg-green-50' :
                insight.type === 'risk' ? 'border-red-500 bg-red-50' :
                'border-blue-500 bg-blue-50'
              }`}>
                <div className="flex items-start">
                  <div className="flex-shrink-0 mr-3 mt-1">
                    {getInsightIcon(insight.type)}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-gray-900 mb-1">
                      {insight.title}
                    </h4>
                    <p className="text-sm text-gray-700 mb-2">
                      {insight.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        insight.impact === 'high' ? 'bg-red-100 text-red-800' :
                        insight.impact === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {insight.impact.toUpperCase()} IMPACT
                      </span>
                      <span className="text-xs text-gray-500">
                        {Math.round(insight.confidence * 100)}% confidence
                      </span>
                    </div>
                    {insight.recommendation && (
                      <div className="mt-2 pt-2 border-t border-gray-200">
                        <p className="text-xs text-gray-600">
                          <strong>Recommended Action:</strong> {insight.recommendation}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Widget Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Sales Trend Chart - Large */}
          <div className="lg:col-span-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Sales Performance Trend</h3>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    const chartElement = document.querySelector('[data-chart="sales-trend"]');
                    if (chartElement) {
                      const printWindow = window.open('', '_blank');
                      printWindow?.document.write(`
                        <html><head><title>Sales Performance Trend Chart</title></head>
                        <body style="margin:20px;"><h2>Sales Performance Trend</h2>${chartElement.outerHTML}</body></html>
                      `);
                      printWindow?.print();
                    }
                    showNotification('Chart settings and print options opened', 'success');
                  }}
                  className="p-2 text-gray-400 hover:text-gray-600"
                >
                  <Settings className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    const chartContainer = document.querySelector('[data-chart="sales-trend"]')?.parentElement;
                    if (chartContainer) {
                      if (chartContainer.requestFullscreen) {
                        chartContainer.requestFullscreen();
                      } else {
                        // Fallback: expand the chart container
                        chartContainer.style.position = 'fixed';
                        chartContainer.style.top = '0';
                        chartContainer.style.left = '0';
                        chartContainer.style.width = '100vw';
                        chartContainer.style.height = '100vh';
                        chartContainer.style.zIndex = '9999';
                        chartContainer.style.backgroundColor = 'white';

                        // Add close button
                        const closeBtn = document.createElement('button');
                        closeBtn.innerHTML = '✕ Close Fullscreen';
                        closeBtn.style.position = 'absolute';
                        closeBtn.style.top = '10px';
                        closeBtn.style.right = '10px';
                        closeBtn.style.padding = '8px 16px';
                        closeBtn.style.backgroundColor = '#374151';
                        closeBtn.style.color = 'white';
                        closeBtn.style.border = 'none';
                        closeBtn.style.borderRadius = '4px';
                        closeBtn.style.cursor = 'pointer';
                        closeBtn.onclick = () => {
                          chartContainer.style.position = '';
                          chartContainer.style.top = '';
                          chartContainer.style.left = '';
                          chartContainer.style.width = '';
                          chartContainer.style.height = '';
                          chartContainer.style.zIndex = '';
                          chartContainer.style.backgroundColor = '';
                          closeBtn.remove();
                        };
                        chartContainer.appendChild(closeBtn);
                      }
                    }
                    showNotification('Chart expanded to fullscreen', 'success');
                  }}
                  className="p-2 text-gray-400 hover:text-gray-600"
                >
                  <Maximize2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="h-80" data-chart="sales-trend">
              <SalesTrendChart data={generateTrendData()} />
            </div>
          </div>

          {/* Forecast Accuracy Gauge - Small */}
          <div className="lg:col-span-4 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Forecast Accuracy</h3>
              <button
                onClick={() => {
                  const detailsModal = document.createElement('div');
                  detailsModal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
                  detailsModal.innerHTML = `
                    <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                      <h3 class="text-lg font-semibold mb-4">Forecast Accuracy Details</h3>
                      <div class="space-y-3">
                        <div class="flex justify-between">
                          <span>Current Period:</span>
                          <span class="font-medium">${Math.round((budgetAnalytics?.forecastAccuracy || 0.94) * 100)}%</span>
                        </div>
                        <div class="flex justify-between">
                          <span>Previous Period:</span>
                          <span class="font-medium">${Math.round((budgetAnalytics?.forecastAccuracy || 0.94) * 0.95 * 100)}%</span>
                        </div>
                        <div class="flex justify-between">
                          <span>Average (6 months):</span>
                          <span class="font-medium">${Math.round((budgetAnalytics?.forecastAccuracy || 0.94) * 0.98 * 100)}%</span>
                        </div>
                        <div class="flex justify-between">
                          <span>Best Achievement:</span>
                          <span class="font-medium text-green-600">${Math.round((budgetAnalytics?.forecastAccuracy || 0.94) * 1.05 * 100)}%</span>
                        </div>
                        <div class="pt-3 border-t">
                          <p class="text-sm text-gray-600">Prediction confidence is based on historical variance analysis and rolling forecast accuracy.</p>
                        </div>
                      </div>
                      <button onclick="this.parentElement.parentElement.remove()"
                        class="mt-4 w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                        Close
                      </button>
                    </div>
                  `;
                  document.body.appendChild(detailsModal);
                  detailsModal.onclick = (e) => {
                    if (e.target === detailsModal) detailsModal.remove();
                  };
                  showNotification('Detailed accuracy metrics displayed', 'success');
                }}
                className="p-2 text-gray-400 hover:text-gray-600"
              >
                <Eye className="w-4 h-4" />
              </button>
            </div>
            <div className="h-48">
              <GaugeChart
                value={budgetAnalytics?.forecastAccuracy ? budgetAnalytics.forecastAccuracy * 100 : 94}
                max={100}
                title="Current Period"
                color="#10b981"
              />
            </div>
          </div>

          {/* Budget vs Actual - Medium */}
          <div className="lg:col-span-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Budget vs Actual by Category</h3>
              <button
                onClick={() => {
                  const filterModal = document.createElement('div');
                  filterModal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
                  filterModal.innerHTML = `
                    <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                      <h3 class="text-lg font-semibold mb-4">Category Filters</h3>
                      <div class="space-y-3">
                        <div>
                          <label class="block text-sm font-medium text-gray-700 mb-2">Select Categories:</label>
                          <div class="space-y-2">
                            ${budgetAnalytics?.topCategories.map(cat => `
                              <label class="flex items-center">
                                <input type="checkbox" checked class="mr-2">
                                <span>${cat.name}</span>
                              </label>
                            `).join('') || `
                              <label class="flex items-center"><input type="checkbox" checked class="mr-2"><span>Sales & Marketing</span></label>
                              <label class="flex items-center"><input type="checkbox" checked class="mr-2"><span>Operations</span></label>
                              <label class="flex items-center"><input type="checkbox" checked class="mr-2"><span>Product Development</span></label>
                            `}
                          </div>
                        </div>
                        <div>
                          <label class="block text-sm font-medium text-gray-700 mb-2">Variance Threshold:</label>
                          <select class="w-full border rounded px-3 py-2">
                            <option>All Variances</option>
                            <option>±5% or higher</option>
                            <option>±10% or higher</option>
                            <option>±20% or higher</option>
                          </select>
                        </div>
                      </div>
                      <div class="flex space-x-2 mt-4">
                        <button onclick="this.parentElement.parentElement.parentElement.remove()"
                          class="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400">
                          Cancel
                        </button>
                        <button onclick="this.parentElement.parentElement.parentElement.remove()"
                          class="flex-1 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                          Apply Filters
                        </button>
                      </div>
                    </div>
                  `;
                  document.body.appendChild(filterModal);
                  filterModal.onclick = (e) => {
                    if (e.target === filterModal) filterModal.remove();
                  };
                  showNotification('Category filter options opened', 'success');
                }}
                className="p-2 text-gray-400 hover:text-gray-600"
              >
                <Filter className="w-4 h-4" />
              </button>
            </div>
            <div className="h-64">
              <BudgetComparisonChart data={generateBudgetComparisonData()} />
            </div>
          </div>

          {/* Top Customers Table - Medium */}
          <div className="lg:col-span-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Top Customers</h3>
              <button
                onClick={() => {
                  const allCustomersModal = document.createElement('div');
                  allCustomersModal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
                  const allCustomers = generateCustomerData();
                  allCustomersModal.innerHTML = `
                    <div class="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[80vh] overflow-y-auto">
                      <div class="flex justify-between items-center mb-4">
                        <h3 class="text-lg font-semibold">All Customers Performance</h3>
                        <button onclick="this.parentElement.parentElement.parentElement.remove()" class="text-gray-500 hover:text-gray-700 text-xl font-bold">×</button>
                      </div>
                      <div class="overflow-x-auto">
                        <table class="w-full border-collapse">
                          <thead>
                            <tr class="bg-gray-50">
                              <th class="border p-3 text-left">Customer</th>
                              <th class="border p-3 text-left">Region</th>
                              <th class="border p-3 text-left">Revenue</th>
                              <th class="border p-3 text-left">Growth</th>
                              <th class="border p-3 text-left">Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            ${allCustomers.map((customer, index) => `
                              <tr class="${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}">
                                <td class="border p-3 font-medium">${customer.name}</td>
                                <td class="border p-3">${customer.region}</td>
                                <td class="border p-3">${formatCurrency(customer.revenue)}</td>
                                <td class="border p-3 ${customer.growth > 0 ? 'text-green-600' : 'text-red-600'}">
                                  ${customer.growth > 0 ? '+' : ''}${customer.growth.toFixed(1)}%
                                </td>
                                <td class="border p-3">
                                  <span class="px-2 py-1 rounded text-xs ${
                                    customer.growth > 10 ? 'bg-green-100 text-green-800' :
                                    customer.growth > 0 ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-red-100 text-red-800'
                                  }">
                                    ${customer.growth > 10 ? 'Excellent' : customer.growth > 0 ? 'Good' : 'Needs Attention'}
                                  </span>
                                </td>
                              </tr>
                            `).join('')}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  `;
                  document.body.appendChild(allCustomersModal);
                  allCustomersModal.onclick = (e) => {
                    if (e.target === allCustomersModal) allCustomersModal.remove();
                  };
                  showNotification('All customers data displayed', 'success');
                }}
                className="text-blue-600 text-sm hover:text-blue-800">View All</button>
            </div>
            <div className="overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <th className="pb-3">Customer</th>
                    <th className="pb-3">Budget vs Actual</th>
                    <th className="pb-3">Variance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {generateCustomerData().slice(0, 5).map((customer, index) => (
                    <tr key={index}>
                      <td className="py-3">
                        <div>
                          <div className="text-sm font-medium text-gray-900 truncate" title={customer.name}>
                            {customer.name}
                          </div>
                          <div className="text-sm text-gray-500">{customer.region}</div>
                        </div>
                      </td>
                      <td className="py-3 text-sm">
                        <div className="text-gray-900 font-medium">
                          {formatCurrency(customer.revenue)}
                        </div>
                        <div className="text-xs text-gray-500">
                          Actual Revenue
                        </div>
                      </td>
                      <td className="py-3">
                        <span className={`text-sm font-medium flex items-center ${
                          customer.growth > 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {customer.growth > 0 ? (
                            <ArrowUpRight className="w-3 h-3 mr-1" />
                          ) : (
                            <ArrowDownRight className="w-3 h-3 mr-1" />
                          )}
                          {customer.growth > 0 ? '+' : ''}{customer.growth.toFixed(1)}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Budget Allocation Pie Chart - Medium */}
          <div className="lg:col-span-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Budget Allocation</h3>
              <button
                onClick={() => {
                  const allocationData = generateBudgetAllocationData();
                  const detailsModal = document.createElement('div');
                  detailsModal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
                  detailsModal.innerHTML = `
                    <div class="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
                      <div class="flex justify-between items-center mb-4">
                        <h3 class="text-lg font-semibold">Budget Allocation Details</h3>
                        <button onclick="this.parentElement.parentElement.parentElement.remove()" class="text-gray-500 hover:text-gray-700 text-xl font-bold">×</button>
                      </div>
                      <div class="space-y-4">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                          ${allocationData.map(item => `
                            <div class="border rounded-lg p-4">
                              <div class="flex items-center justify-between mb-2">
                                <h4 class="font-medium">${item.name}</h4>
                                <span class="text-lg font-bold text-blue-600">${item.value}%</span>
                              </div>
                              <div class="text-sm text-gray-600 mb-2">
                                Budget: ${formatCurrency(item.amount)}
                              </div>
                              <div class="w-full bg-gray-200 rounded-full h-2">
                                <div class="bg-blue-500 h-2 rounded-full" style="width: ${item.value}%"></div>
                              </div>
                              <div class="mt-2 text-xs text-gray-500">
                                Priority: ${item.value > 30 ? 'High' : item.value > 15 ? 'Medium' : 'Low'}
                              </div>
                            </div>
                          `).join('')}
                        </div>
                        <div class="border-t pt-4">
                          <h4 class="font-medium mb-2">Summary</h4>
                          <div class="text-sm text-gray-600 space-y-1">
                            <div>Total Allocated: ${formatCurrency(allocationData.reduce((sum, item) => sum + item.amount, 0))}</div>
                            <div>Number of Categories: ${allocationData.length}</div>
                            <div>Largest Allocation: ${allocationData.reduce((max, item) => item.value > max ? item.value : max, 0)}%</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  `;
                  document.body.appendChild(detailsModal);
                  detailsModal.onclick = (e) => {
                    if (e.target === detailsModal) detailsModal.remove();
                  };
                  showNotification('Budget allocation details displayed', 'success');
                }}
                className="text-blue-600 text-sm hover:text-blue-800"
              >
                View Details
              </button>
            </div>
            <div className="h-64">
              <BudgetAllocationChart data={generateBudgetAllocationData()} />
            </div>
          </div>

          {/* Regional Performance Chart - Medium */}
          <div className="lg:col-span-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Regional Performance</h3>
              <button
                onClick={() => {
                  const regionalData = budgetAnalytics?.regionPerformance || [
                    { region: 'North America', budget: 1000000, actual: 1100000, performance: 110 },
                    { region: 'Europe', budget: 800000, actual: 750000, performance: 93.75 },
                    { region: 'Asia Pacific', budget: 600000, actual: 650000, performance: 108.33 },
                    { region: 'Latin America', budget: 400000, actual: 380000, performance: 95 },
                    { region: 'Middle East & Africa', budget: 300000, actual: 320000, performance: 106.67 }
                  ];
                  const regionsModal = document.createElement('div');
                  regionsModal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
                  regionsModal.innerHTML = `
                    <div class="bg-white rounded-lg p-6 max-w-5xl w-full mx-4 max-h-[80vh] overflow-y-auto">
                      <div class="flex justify-between items-center mb-4">
                        <h3 class="text-lg font-semibold">All Regions Performance</h3>
                        <button onclick="this.parentElement.parentElement.parentElement.remove()" class="text-gray-500 hover:text-gray-700 text-xl font-bold">×</button>
                      </div>
                      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                        ${regionalData.map(region => `
                          <div class="border rounded-lg p-4 ${
                            region.performance > 105 ? 'border-green-300 bg-green-50' :
                            region.performance < 95 ? 'border-red-300 bg-red-50' :
                            'border-yellow-300 bg-yellow-50'
                          }">
                            <h4 class="font-medium text-lg mb-2">${region.region}</h4>
                            <div class="space-y-2 text-sm">
                              <div class="flex justify-between">
                                <span>Budget:</span>
                                <span class="font-medium">${formatCurrency(region.budget)}</span>
                              </div>
                              <div class="flex justify-between">
                                <span>Actual:</span>
                                <span class="font-medium">${formatCurrency(region.actual)}</span>
                              </div>
                              <div class="flex justify-between">
                                <span>Performance:</span>
                                <span class="font-bold ${
                                  region.performance > 100 ? 'text-green-600' : 'text-red-600'
                                }">${region.performance.toFixed(1)}%</span>
                              </div>
                              <div class="w-full bg-gray-200 rounded-full h-2 mt-2">
                                <div class="${
                                  region.performance > 100 ? 'bg-green-500' : 'bg-red-500'
                                } h-2 rounded-full" style="width: ${Math.min(region.performance, 150)}%"></div>
                              </div>
                            </div>
                          </div>
                        `).join('')}
                      </div>
                      <div class="border-t pt-4">
                        <h4 class="font-medium mb-3">Performance Summary</h4>
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div class="text-center p-3 bg-green-50 rounded">
                            <div class="font-bold text-green-600">${regionalData.filter(r => r.performance > 105).length}</div>
                            <div class="text-green-700">Overperforming</div>
                          </div>
                          <div class="text-center p-3 bg-yellow-50 rounded">
                            <div class="font-bold text-yellow-600">${regionalData.filter(r => r.performance >= 95 && r.performance <= 105).length}</div>
                            <div class="text-yellow-700">On Target</div>
                          </div>
                          <div class="text-center p-3 bg-red-50 rounded">
                            <div class="font-bold text-red-600">${regionalData.filter(r => r.performance < 95).length}</div>
                            <div class="text-red-700">Underperforming</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  `;
                  document.body.appendChild(regionsModal);
                  regionsModal.onclick = (e) => {
                    if (e.target === regionsModal) regionsModal.remove();
                  };
                  showNotification('All regions performance displayed', 'success');
                }}
                className="text-blue-600 text-sm hover:text-blue-800"
              >
                View All Regions
              </button>
            </div>
            <div className="h-64">
              <BudgetComparisonChart
                data={budgetAnalytics?.regionPerformance.map(region => ({
                  category: region.region,
                  budget: region.budget,
                  actual: region.actual,
                  variance: region.performance - 100
                })) || [
                  { category: 'North America', budget: 1000000, actual: 1100000, variance: 10 },
                  { category: 'Europe', budget: 800000, actual: 750000, variance: -6.25 }
                ]}
              />
            </div>
          </div>
        </div>

        {/* GIT Overview */}
        <GitSummaryWidget userRole={user?.role} compact={true} />

        {/* Data Quality & Status */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Data Sources & Budget Integration</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="flex items-center p-4 bg-green-50 rounded-lg">
              <CheckCircle className="w-8 h-8 text-green-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-green-900">Sales Budget System</p>
                <p className="text-xs text-green-700">Connected • {budgetAnalytics ? budgetAnalytics.topCustomers.length : 0} customers</p>
              </div>
            </div>
            <div className="flex items-center p-4 bg-green-50 rounded-lg">
              <CheckCircle className="w-8 h-8 text-green-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-green-900">Rolling Forecast</p>
                <p className="text-xs text-green-700">Active • {budgetAnalytics ? budgetAnalytics.topCategories.length : 0} categories</p>
              </div>
            </div>
            <div className="flex items-center p-4 bg-green-50 rounded-lg">
              <CheckCircle className="w-8 h-8 text-green-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-green-900">OLAP Analytics</p>
                <p className="text-xs text-green-700">Real-time • Last sync: 2 min ago</p>
              </div>
            </div>
            <div className="flex items-center p-4 bg-blue-50 rounded-lg">
              <RefreshCw className="w-8 h-8 text-blue-600 mr-3 animate-pulse" />
              <div>
                <p className="text-sm font-medium text-blue-900">Oracle Database</p>
                <p className="text-xs text-blue-700">Syncing budget data...</p>
              </div>
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
      </div>
    </Layout>
  );
};

export default BiDashboard;
