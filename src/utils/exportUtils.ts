import { CustomerItemForecast, Customer, BudgetImpact } from '../types/forecast';
import { formatCurrency } from './budgetCalculations';

export interface ExportData {
  customers: Customer[];
  forecasts: CustomerItemForecast[];
  budgetAnalysis: {
    monthly: BudgetImpact[];
    yearly: BudgetImpact;
    summary: any;
  };
}

export const generateCSV = (data: ExportData): string => {
  const headers = [
    'Customer Name',
    'Customer Code',
    'Region',
    'Segment',
    'Item SKU',
    'Item Name',
    'Category',
    'Brand',
    'Month',
    'Year',
    'Quantity',
    'Unit Price',
    'Total Value',
    'Confidence',
    'Status',
    'Created Date',
    'Updated Date'
  ];

  const rows = [];
  rows.push(headers.join(','));

  data.forecasts.forEach(forecast => {
    forecast.monthlyForecasts.forEach(monthlyForecast => {
      const row = [
        `"${forecast.customer.name}"`,
        forecast.customer.code,
        forecast.customer.region,
        forecast.customer.segment,
        forecast.item.sku,
        `"${forecast.item.name}"`,
        forecast.item.category,
        forecast.item.brand,
        monthlyForecast.month,
        monthlyForecast.year,
        monthlyForecast.quantity,
        monthlyForecast.unitPrice,
        monthlyForecast.totalValue,
        forecast.confidence,
        forecast.status,
        forecast.createdAt,
        forecast.updatedAt
      ];
      rows.push(row.join(','));
    });
  });

  return rows.join('\n');
};

export const generateJSON = (data: ExportData): string => {
  return JSON.stringify(data, null, 2);
};

export const generateBudgetAnalysisCSV = (budgetAnalysis: any): string => {
  const headers = [
    'Month',
    'Year',
    'Budget Target',
    'Forecast Amount',
    'Variance',
    'Variance Percentage'
  ];

  const rows = [];
  rows.push(headers.join(','));

  budgetAnalysis.monthly.forEach((impact: BudgetImpact) => {
    const row = [
      impact.month,
      impact.year,
      impact.originalBudget,
      impact.forecastImpact,
      impact.variance,
      impact.variancePercentage.toFixed(2)
    ];
    rows.push(row.join(','));
  });

  // Add yearly summary
  const yearlyRow = [
    'YEARLY TOTAL',
    budgetAnalysis.yearly.year,
    budgetAnalysis.yearly.originalBudget,
    budgetAnalysis.yearly.forecastImpact,
    budgetAnalysis.yearly.variance,
    budgetAnalysis.yearly.variancePercentage.toFixed(2)
  ];
  rows.push(yearlyRow.join(','));

  return rows.join('\n');
};

export const downloadFile = (content: string, filename: string, contentType: string = 'text/csv') => {
  const blob = new Blob([content], { type: contentType });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

export const exportForecastData = (
  data: ExportData,
  format: 'csv' | 'json' | 'budget-csv' = 'csv',
  filename?: string
) => {
  const timestamp = new Date().toISOString().split('T')[0];
  
  switch (format) {
    case 'csv':
      const csvContent = generateCSV(data);
      downloadFile(csvContent, filename || `forecast-data-${timestamp}.csv`);
      break;
    
    case 'json':
      const jsonContent = generateJSON(data);
      downloadFile(jsonContent, filename || `forecast-data-${timestamp}.json`, 'application/json');
      break;
    
    case 'budget-csv':
      const budgetCsvContent = generateBudgetAnalysisCSV(data.budgetAnalysis);
      downloadFile(budgetCsvContent, filename || `budget-analysis-${timestamp}.csv`);
      break;
    
    default:
      throw new Error(`Unsupported export format: ${format}`);
  }
};

// Export template for importing data
export const generateImportTemplate = (): string => {
  const headers = [
    'Customer Name',
    'Customer Code',
    'Customer Email',
    'Customer Phone',
    'Region',
    'Segment',
    'Item SKU',
    'Item Name',
    'Category',
    'Brand',
    'Unit Price',
    'Month',
    'Year',
    'Quantity Forecast',
    'Confidence (low/medium/high)',
    'Notes'
  ];

  const sampleRow = [
    'Sample Customer',
    'CUST001',
    'customer@example.com',
    '+1-555-0123',
    'North America',
    'Enterprise',
    'PROD001',
    'Sample Product',
    'Electronics',
    'Sample Brand',
    '99.99',
    'Jan',
    '2025',
    '100',
    'high',
    'Sample forecast notes'
  ];

  return [headers.join(','), sampleRow.join(',')].join('\n');
};

export const downloadImportTemplate = () => {
  const content = generateImportTemplate();
  const timestamp = new Date().toISOString().split('T')[0];
  downloadFile(content, `forecast-import-template-${timestamp}.csv`);
};
