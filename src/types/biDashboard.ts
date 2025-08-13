import { DataConnection, DataQuery, Visualization } from './dataSource';

export interface BiDashboard {
  id: string;
  name: string;
  description?: string;
  category: 'sales' | 'finance' | 'operations' | 'marketing' | 'custom';
  layout: DashboardLayout;
  widgets: DashboardWidget[];
  filters: DashboardFilter[];
  permissions: DashboardPermission[];
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  tags?: string[];
  refreshInterval?: number;
  theme: DashboardTheme;
}

export interface DashboardLayout {
  type: 'grid' | 'flex' | 'masonry';
  columns: number;
  margin: number;
  padding: number;
  responsive: boolean;
}

export interface DashboardWidget {
  id: string;
  type: WidgetType;
  title: string;
  description?: string;
  position: WidgetPosition;
  config: WidgetConfig;
  dataSource: string;
  query: DataQuery;
  refreshInterval?: number;
  isVisible: boolean;
}

export enum WidgetType {
  CHART = 'chart',
  TABLE = 'table',
  KPI = 'kpi',
  GAUGE = 'gauge',
  TEXT = 'text',
  IFRAME = 'iframe',
  IMAGE = 'image',
  MAP = 'map',
  CALENDAR = 'calendar',
  FORECAST = 'forecast',
  BUDGET_COMPARISON = 'budget_comparison',
  SALES_FUNNEL = 'sales_funnel',
  TREND_ANALYSIS = 'trend_analysis'
}

export interface WidgetPosition {
  x: number;
  y: number;
  width: number;
  height: number;
  minWidth?: number;
  minHeight?: number;
  maxWidth?: number;
  maxHeight?: number;
}

export interface WidgetConfig {
  // Chart configurations
  chartType?: ChartType;
  xAxis?: string;
  yAxis?: string[];
  groupBy?: string;
  aggregation?: AggregationType;
  colors?: string[];
  
  // Display options
  showLegend?: boolean;
  showGrid?: boolean;
  showLabels?: boolean;
  animate?: boolean;
  
  // Table configurations
  columns?: TableColumnConfig[];
  pagination?: boolean;
  sorting?: boolean;
  filtering?: boolean;
  
  // KPI configurations
  metric?: string;
  format?: string;
  comparison?: KpiComparison;
  threshold?: KpiThreshold;
  
  // Custom configurations
  customConfig?: { [key: string]: any };
}

export enum ChartType {
  LINE = 'line',
  BAR = 'bar',
  COLUMN = 'column',
  PIE = 'pie',
  DONUT = 'donut',
  AREA = 'area',
  SCATTER = 'scatter',
  BUBBLE = 'bubble',
  GAUGE = 'gauge',
  FUNNEL = 'funnel',
  WATERFALL = 'waterfall',
  HEATMAP = 'heatmap',
  TREEMAP = 'treemap',
  SANKEY = 'sankey',
  CANDLESTICK = 'candlestick'
}

export enum AggregationType {
  SUM = 'sum',
  AVERAGE = 'avg',
  COUNT = 'count',
  DISTINCT_COUNT = 'distinct_count',
  MIN = 'min',
  MAX = 'max',
  MEDIAN = 'median',
  PERCENTILE = 'percentile'
}

export interface TableColumnConfig {
  key: string;
  title: string;
  width?: number;
  sortable: boolean;
  filterable: boolean;
  format?: string;
  alignment?: 'left' | 'center' | 'right';
}

export interface KpiComparison {
  type: 'previous_period' | 'target' | 'baseline' | 'year_over_year';
  value: number;
  format: string;
  showChange: boolean;
  showPercentage: boolean;
}

export interface KpiThreshold {
  good: { min?: number; max?: number; color: string };
  warning: { min?: number; max?: number; color: string };
  critical: { min?: number; max?: number; color: string };
}

export interface DashboardFilter {
  id: string;
  name: string;
  type: FilterType;
  column: string;
  dataSource: string;
  defaultValue?: any;
  options?: FilterOption[];
  required: boolean;
  cascading?: string[];
}

export enum FilterType {
  DROPDOWN = 'dropdown',
  MULTISELECT = 'multiselect',
  DATE_PICKER = 'date_picker',
  DATE_RANGE = 'date_range',
  TEXT_INPUT = 'text_input',
  NUMBER_INPUT = 'number_input',
  SLIDER = 'slider',
  TOGGLE = 'toggle'
}

export interface FilterOption {
  label: string;
  value: any;
  color?: string;
}

export interface DashboardPermission {
  userId?: string;
  userType?: string;
  department?: string;
  access: 'view' | 'edit' | 'admin';
}

export interface DashboardTheme {
  name: string;
  colors: {
    primary: string;
    secondary: string;
    background: string;
    surface: string;
    text: string;
    accent: string;
  };
  fonts: {
    title: string;
    body: string;
    mono: string;
  };
  spacing: {
    small: number;
    medium: number;
    large: number;
  };
}

export interface AnalyticsMetric {
  id: string;
  name: string;
  description?: string;
  category: MetricCategory;
  formula: string;
  dataSource: string;
  dimension?: string;
  format: MetricFormat;
  isCalculated: boolean;
  dependencies?: string[];
  tags?: string[];
}

export enum MetricCategory {
  SALES = 'sales',
  FINANCE = 'finance',
  INVENTORY = 'inventory',
  CUSTOMER = 'customer',
  OPERATIONAL = 'operational',
  MARKETING = 'marketing'
}

export interface MetricFormat {
  type: 'number' | 'currency' | 'percentage' | 'duration' | 'custom';
  precision?: number;
  currency?: string;
  suffix?: string;
  prefix?: string;
}

export interface ForecastModel {
  id: string;
  name: string;
  description?: string;
  type: ForecastType;
  dataSource: string;
  targetMetric: string;
  features: string[];
  parameters: ForecastParameters;
  performance: ModelPerformance;
  lastTrained: string;
  isActive: boolean;
}

export enum ForecastType {
  LINEAR_REGRESSION = 'linear_regression',
  POLYNOMIAL_REGRESSION = 'polynomial_regression',
  ARIMA = 'arima',
  EXPONENTIAL_SMOOTHING = 'exponential_smoothing',
  NEURAL_NETWORK = 'neural_network',
  RANDOM_FOREST = 'random_forest',
  TIME_SERIES = 'time_series'
}

export interface ForecastParameters {
  horizon: number;
  seasonality?: 'auto' | 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  trend?: 'auto' | 'linear' | 'logistic';
  confidence_interval?: number;
  custom_params?: { [key: string]: any };
}

export interface ModelPerformance {
  accuracy: number;
  mae: number; // Mean Absolute Error
  mape: number; // Mean Absolute Percentage Error
  rmse: number; // Root Mean Square Error
  r_squared: number;
  cross_validation_score?: number;
}

export interface BudgetAnalytics {
  id: string;
  name: string;
  period: AnalyticsPeriod;
  budgetData: BudgetData;
  forecastData: ForecastData;
  variance: VarianceAnalysis;
  insights: AnalyticsInsight[];
  recommendations: Recommendation[];
  generatedAt: string;
}

export interface AnalyticsPeriod {
  start: string;
  end: string;
  granularity: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
}

export interface BudgetData {
  total: number;
  allocated: number;
  spent: number;
  remaining: number;
  byCategory: { [category: string]: number };
  byPeriod: { [period: string]: number };
  byDepartment?: { [department: string]: number };
}

export interface ForecastData {
  total: number;
  confidence: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  byCategory: { [category: string]: number };
  byPeriod: { [period: string]: number };
  scenarios: ForecastScenario[];
}

export interface ForecastScenario {
  name: string;
  probability: number;
  value: number;
  assumptions: string[];
}

export interface VarianceAnalysis {
  budgetVsForecast: number;
  budgetVsActual: number;
  forecastVsActual: number;
  significantVariances: SignificantVariance[];
  trendAnalysis: TrendAnalysis;
}

export interface SignificantVariance {
  metric: string;
  variance: number;
  percentage: number;
  threshold: number;
  explanation?: string;
}

export interface TrendAnalysis {
  direction: 'upward' | 'downward' | 'stable' | 'volatile';
  strength: number;
  seasonality?: {
    detected: boolean;
    period?: number;
    strength?: number;
  };
  outliers: OutlierDetection[];
}

export interface OutlierDetection {
  period: string;
  value: number;
  expectedRange: { min: number; max: number };
  severity: 'mild' | 'moderate' | 'severe';
}

export interface AnalyticsInsight {
  id: string;
  type: InsightType;
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  confidence: number;
  metrics: InsightMetric[];
  visualizationId?: string;
  actionable: boolean;
}

export enum InsightType {
  TREND = 'trend',
  ANOMALY = 'anomaly',
  CORRELATION = 'correlation',
  SEASONAL_PATTERN = 'seasonal_pattern',
  FORECAST_ACCURACY = 'forecast_accuracy',
  BUDGET_EFFICIENCY = 'budget_efficiency',
  GROWTH_OPPORTUNITY = 'growth_opportunity',
  RISK_FACTOR = 'risk_factor'
}

export interface InsightMetric {
  name: string;
  value: number;
  format: string;
  change?: number;
  changeFormat?: string;
}

export interface Recommendation {
  id: string;
  title: string;
  description: string;
  category: RecommendationCategory;
  priority: 'high' | 'medium' | 'low';
  impact: {
    financial?: number;
    timeframe?: string;
    confidence?: number;
  };
  actions: RecommendedAction[];
  metrics?: string[];
}

export enum RecommendationCategory {
  BUDGET_OPTIMIZATION = 'budget_optimization',
  FORECAST_IMPROVEMENT = 'forecast_improvement',
  PROCESS_ENHANCEMENT = 'process_enhancement',
  RISK_MITIGATION = 'risk_mitigation',
  GROWTH_STRATEGY = 'growth_strategy',
  COST_REDUCTION = 'cost_reduction'
}

export interface RecommendedAction {
  description: string;
  effort: 'low' | 'medium' | 'high';
  timeline: string;
  owner?: string;
  resources?: string[];
}

export interface DataExploration {
  id: string;
  name: string;
  description?: string;
  dataSource: string;
  queries: ExplorationQuery[];
  visualizations: ExplorationVisualization[];
  findings: ExplorationFinding[];
  createdAt: string;
  updatedAt: string;
}

export interface ExplorationQuery {
  id: string;
  sql: string;
  description?: string;
  results?: any[];
  executedAt?: string;
  executionTime?: number;
}

export interface ExplorationVisualization {
  id: string;
  queryId: string;
  type: ChartType;
  config: WidgetConfig;
  insights?: string[];
}

export interface ExplorationFinding {
  id: string;
  title: string;
  description: string;
  confidence: number;
  evidence: string[];
  visualizationIds: string[];
}
