export interface DataConnection {
  id: string;
  name: string;
  type: DataSourceType;
  status: 'connected' | 'disconnected' | 'error' | 'connecting';
  config: DataSourceConfig;
  createdAt: string;
  lastSync: string;
  description?: string;
  tags?: string[];
}

export enum DataSourceType {
  OLAP = 'olap',
  ORACLE = 'oracle',
  SQL_SERVER = 'sql_server',
  MYSQL = 'mysql',
  POSTGRESQL = 'postgresql',
  MONGODB = 'mongodb',
  REST_API = 'rest_api',
  CSV_FILE = 'csv_file',
  EXCEL_FILE = 'excel_file',
  SNOWFLAKE = 'snowflake',
  REDSHIFT = 'redshift',
  BIGQUERY = 'bigquery',
  POWER_BI = 'power_bi',
  TABLEAU = 'tableau',
  LOOKER = 'looker'
}

export interface DataSourceConfig {
  // Common fields
  host?: string;
  port?: number;
  database?: string;
  username?: string;
  password?: string;
  
  // OLAP specific
  cube?: string;
  mdxQuery?: string;
  dimensions?: string[];
  measures?: string[];
  
  // Oracle specific
  serviceName?: string;
  sid?: string;
  tnsName?: string;
  
  // API specific
  apiUrl?: string;
  apiKey?: string;
  headers?: { [key: string]: string };
  
  // File specific
  filePath?: string;
  sheetName?: string;
  hasHeaders?: boolean;
  delimiter?: string;
  
  // BI Tools specific
  workspaceId?: string;
  reportId?: string;
  dashboardId?: string;
  
  // Advanced options
  connectionString?: string;
  timeout?: number;
  poolSize?: number;
  ssl?: boolean;
  compression?: boolean;
}

export interface DataSchema {
  tables: DataTable[];
  relationships: DataRelationship[];
  metadata: SchemaMetadata;
}

export interface DataTable {
  name: string;
  schema?: string;
  columns: DataColumn[];
  primaryKey?: string[];
  indexes?: DataIndex[];
  rowCount?: number;
  lastUpdated?: string;
  description?: string;
}

export interface DataColumn {
  name: string;
  type: DataType;
  nullable: boolean;
  defaultValue?: any;
  description?: string;
  businessName?: string;
  format?: string;
  precision?: number;
  scale?: number;
}

export interface DataRelationship {
  name: string;
  fromTable: string;
  fromColumn: string;
  toTable: string;
  toColumn: string;
  type: 'one_to_one' | 'one_to_many' | 'many_to_many';
}

export interface DataIndex {
  name: string;
  columns: string[];
  unique: boolean;
  type: 'btree' | 'hash' | 'bitmap';
}

export interface SchemaMetadata {
  version: string;
  lastRefresh: string;
  totalTables: number;
  totalColumns: number;
  dataSourceType: DataSourceType;
}

export enum DataType {
  STRING = 'string',
  INTEGER = 'integer',
  DECIMAL = 'decimal',
  BOOLEAN = 'boolean',
  DATE = 'date',
  DATETIME = 'datetime',
  TIME = 'time',
  TEXT = 'text',
  JSON = 'json',
  BINARY = 'binary'
}

export interface DataQuery {
  id: string;
  name: string;
  description?: string;
  dataSourceId: string;
  sql?: string;
  mdx?: string; // For OLAP
  filters?: DataFilter[];
  parameters?: QueryParameter[];
  resultColumns: QueryColumn[];
  createdAt: string;
  updatedAt: string;
  tags?: string[];
}

export interface DataFilter {
  column: string;
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains' | 'starts_with' | 'ends_with' | 'in' | 'not_in' | 'between';
  value: any;
  logicalOperator?: 'AND' | 'OR';
}

export interface QueryParameter {
  name: string;
  type: DataType;
  defaultValue?: any;
  required: boolean;
  description?: string;
}

export interface QueryColumn {
  name: string;
  alias?: string;
  type: DataType;
  aggregation?: 'sum' | 'count' | 'avg' | 'min' | 'max' | 'distinct_count';
  format?: string;
}

export interface QueryResult {
  queryId: string;
  data: any[];
  columns: QueryColumn[];
  totalRows: number;
  executionTime: number;
  error?: string;
  executedAt: string;
}

export interface DataSyncJob {
  id: string;
  name: string;
  dataSourceId: string;
  scheduleType: 'manual' | 'hourly' | 'daily' | 'weekly' | 'monthly';
  scheduleConfig?: {
    hour?: number;
    minute?: number;
    dayOfWeek?: number;
    dayOfMonth?: number;
  };
  status: 'running' | 'completed' | 'failed' | 'scheduled';
  lastRun?: string;
  nextRun?: string;
  targetTable?: string;
  syncMode: 'full' | 'incremental';
  incrementalColumn?: string;
  config: {
    batchSize?: number;
    timeout?: number;
    retryAttempts?: number;
  };
}

export interface BiReport {
  id: string;
  name: string;
  description?: string;
  type: 'dashboard' | 'report' | 'chart' | 'table';
  dataSourceIds: string[];
  config: BiReportConfig;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  tags?: string[];
  isPublic: boolean;
}

export interface BiReportConfig {
  layout: ReportLayout;
  visualizations: Visualization[];
  filters: ReportFilter[];
  parameters: ReportParameter[];
  theme?: string;
  refreshInterval?: number;
}

export interface ReportLayout {
  type: 'grid' | 'flex' | 'tabs';
  columns: number;
  rows: number;
  gaps: number;
}

export interface Visualization {
  id: string;
  type: 'chart' | 'table' | 'kpi' | 'text' | 'image';
  position: { x: number; y: number; w: number; h: number };
  title: string;
  dataQuery: DataQuery;
  chartConfig?: ChartConfig;
  tableConfig?: TableConfig;
  kpiConfig?: KpiConfig;
}

export interface ChartConfig {
  chartType: 'line' | 'bar' | 'pie' | 'area' | 'scatter' | 'donut' | 'gauge' | 'funnel' | 'waterfall';
  xAxis: string;
  yAxis: string[];
  groupBy?: string;
  colors?: string[];
  showLegend: boolean;
  showGrid: boolean;
  animate: boolean;
}

export interface TableConfig {
  columns: TableColumn[];
  pagination: boolean;
  sorting: boolean;
  filtering: boolean;
  export: boolean;
  rowsPerPage: number;
}

export interface TableColumn {
  key: string;
  title: string;
  type: DataType;
  width?: number;
  sortable: boolean;
  filterable: boolean;
  format?: string;
  aggregation?: string;
}

export interface KpiConfig {
  metric: string;
  label: string;
  format: string;
  comparison?: {
    type: 'previous_period' | 'target' | 'baseline';
    value: number;
    format: string;
  };
  threshold?: {
    warning: number;
    critical: number;
  };
}

export interface ReportFilter {
  id: string;
  name: string;
  column: string;
  type: 'dropdown' | 'multiselect' | 'date_range' | 'text' | 'number_range';
  defaultValue?: any;
  options?: FilterOption[];
  required: boolean;
}

export interface FilterOption {
  label: string;
  value: any;
}

export interface ReportParameter {
  name: string;
  type: DataType;
  defaultValue?: any;
  required: boolean;
  description?: string;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
  };
}

export interface DataInsight {
  id: string;
  type: 'trend' | 'anomaly' | 'correlation' | 'forecast' | 'pattern';
  title: string;
  description: string;
  confidence: number;
  impact: 'high' | 'medium' | 'low';
  data: any;
  generatedAt: string;
  dataSourceId: string;
  visualizationId?: string;
}

export interface DataAlert {
  id: string;
  name: string;
  description?: string;
  dataSourceId: string;
  condition: AlertCondition;
  recipients: string[];
  frequency: 'immediate' | 'hourly' | 'daily' | 'weekly';
  isActive: boolean;
  lastTriggered?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AlertCondition {
  metric: string;
  operator: 'greater_than' | 'less_than' | 'equals' | 'not_equals' | 'percentage_change';
  value: number;
  timeframe?: string;
  aggregation?: 'sum' | 'avg' | 'count' | 'min' | 'max';
}

export interface DataQualityCheck {
  id: string;
  name: string;
  description?: string;
  dataSourceId: string;
  table: string;
  column?: string;
  checkType: 'completeness' | 'uniqueness' | 'validity' | 'consistency' | 'accuracy';
  rules: QualityRule[];
  schedule: string;
  status: 'passed' | 'failed' | 'warning' | 'not_run';
  lastRun?: string;
  score?: number;
}

export interface QualityRule {
  type: 'not_null' | 'unique' | 'range' | 'pattern' | 'custom';
  config: any;
  severity: 'error' | 'warning' | 'info';
}
