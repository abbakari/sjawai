import React, { useState, useEffect } from 'react';
import { DownloadIcon, Edit3, ChevronLeft, Calendar } from 'lucide-react';
import { useBudget } from '../contexts/BudgetContext';
import { useAuth } from '../contexts/AuthContext';
import DataPersistenceManager from '../utils/dataPersistence';
import { getShortMonthNames } from '../utils/timeUtils';
import {
  generateAvailableYears,
  getDefaultYearSelection,
  getYearValue,
  getCurrentYear
} from '../utils/dynamicYearUtils';

interface RollingForecastReportProps {
  onBack: () => void;
}

interface ReportData {
  id: string;
  customer: string;
  item: string;
  brand: string;
  category: string;
  JAN: number;
  FEB: number;
  MAR: number;
  APR: number;
  MAY: number;
  JUN: number;
  JUL: number;
  AUG: number;
  SEP: number;
  OCT: number;
  NOV: number;
  DEC: number;
  BUDGET_YEAR: number;
  FORECAST_YEAR: number;
}

const RollingForecastReport: React.FC<RollingForecastReportProps> = ({ onBack }) => {
  const { user } = useAuth();

  // Dynamic year state
  const availableYears = generateAvailableYears();
  const defaultYears = getDefaultYearSelection();
  const [selectedBaseYear, setSelectedBaseYear] = useState(defaultYears.baseYear);
  const [selectedTargetYear, setSelectedTargetYear] = useState(defaultYears.targetYear);

  const [reportData, setReportData] = useState<ReportData[]>([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [showExportPreview, setShowExportPreview] = useState(false);
  const [exportData, setExportData] = useState<string>('');

  useEffect(() => {
    const loadReportData = () => {
      try {
        // Get all rolling forecast data
        const savedForecastData = DataPersistenceManager.getRollingForecastData();
        
        // Sample table data for demonstration (you may want to replace this with actual data source)
        const sampleTableData = [
          {
            id: '1',
            customer: 'Action Aid International (Tz)',
            item: 'BF GOODRICH TYRE 235/85R16 120/116S TL ATT/A KO2 LRERWLGO',
            brand: 'BF GOODRICH',
            category: 'TYRE SERVICE',
            bud25: 120,
            budgetDistribution: { JAN: 10, FEB: 8, MAR: 12, APR: 15, MAY: 10, JUN: 8, JUL: 12, AUG: 15, SEP: 10, OCT: 8, NOV: 6, DEC: 6 }
          },
          {
            id: '2',
            customer: 'Action Aid International (Tz)',
            item: 'BF GOODRICH TYRE 265/65R17 120/117S TL ATT/A KO2 LRERWLGO',
            brand: 'BF GOODRICH',
            category: 'TYRE SERVICE',
            bud25: 80,
            budgetDistribution: { JAN: 8, FEB: 6, MAR: 10, APR: 12, MAY: 8, JUN: 6, JUL: 10, AUG: 12, SEP: 8, OCT: 0, NOV: 0, DEC: 0 }
          },
          {
            id: '3',
            customer: 'Action Aid International (Tz)',
            item: 'MICHELIN TYRE 265/65R17 112T TL LTX TRAIL',
            brand: 'MICHELIN',
            category: 'TYRE SERVICE',
            bud25: 150,
            budgetDistribution: { JAN: 15, FEB: 12, MAR: 18, APR: 20, MAY: 15, JUN: 12, JUL: 18, AUG: 20, SEP: 15, OCT: 5, NOV: 0, DEC: 0 }
          },
          {
            id: '4',
            customer: 'ADVENT CONSTRUCTION LTD.',
            item: 'WHEEL BALANCE ALLOYD RIMS',
            brand: 'TYRE SERVICE',
            category: 'TYRE SERVICE',
            bud25: 200,
            budgetDistribution: { JAN: 20, FEB: 15, MAR: 25, APR: 30, MAY: 20, JUN: 15, JUL: 25, AUG: 30, SEP: 20, OCT: 0, NOV: 0, DEC: 0 }
          },
          {
            id: '5',
            customer: 'ADVENT CONSTRUCTION LTD.',
            item: 'BF GOODRICH TYRE 235/85R16 120/116S TL ATT/A KO2 LRERWLGO',
            brand: 'BF GOODRICH',
            category: 'TYRE SERVICE',
            bud25: 90,
            budgetDistribution: { JAN: 10, FEB: 8, MAR: 12, APR: 15, MAY: 10, JUN: 8, JUL: 12, AUG: 15, SEP: 0, OCT: 0, NOV: 0, DEC: 0 }
          }
        ];

        const processedData: ReportData[] = sampleTableData.map(row => {
          // Get forecast data for this row
          const forecastEntry = savedForecastData.find(f => 
            f.customer === row.customer && f.item === row.item
          );

          // Get monthly forecast values
          const monthlyForecast = getShortMonthNames().reduce((acc, month) => {
            acc[month as keyof typeof acc] = forecastEntry?.forecastData?.[month] || 0;
            return acc;
          }, {} as Record<string, number>);

          // Calculate totals
          const forecastTotal = Object.values(monthlyForecast).reduce((sum, val) => sum + val, 0);

          return {
            id: row.id,
            customer: row.customer,
            item: row.item,
            brand: row.brand,
            category: row.category,
            JAN: monthlyForecast.JAN || 0,
            FEB: monthlyForecast.FEB || 0,
            MAR: monthlyForecast.MAR || 0,
            APR: monthlyForecast.APR || 0,
            MAY: monthlyForecast.MAY || 0,
            JUN: monthlyForecast.JUN || 0,
            JUL: monthlyForecast.JUL || 0,
            AUG: monthlyForecast.AUG || 0,
            SEP: monthlyForecast.SEP || 0,
            OCT: monthlyForecast.OCT || 0,
            NOV: monthlyForecast.NOV || 0,
            DEC: monthlyForecast.DEC || 0,
            BUDGET_YEAR: getYearValue(row, selectedBaseYear, 'budget'),
            FORECAST_YEAR: forecastTotal
          };
        });

        setReportData(processedData);
        setLoading(false);
      } catch (error) {
        console.error('Error loading report data:', error);
        setLoading(false);
      }
    };

    loadReportData();
  }, []);

  const handleExport = () => {
    // Create CSV content
    const headers = [
      'CUSTOMER', 'ITEM', 'BRAND', 'CATEGORY',
      'JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN',
      'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC',
      `BUDGET${selectedBaseYear}`, `FORECAST${selectedTargetYear}`
    ];

    const csvContent = [
      headers.join(','),
      ...reportData.map(row => [
        `"${row.customer}"`,
        `"${row.item}"`,
        `"${row.brand}"`,
        `"${row.category}"`,
        row.JAN,
        row.FEB,
        row.MAR,
        row.APR,
        row.MAY,
        row.JUN,
        row.JUL,
        row.AUG,
        row.SEP,
        row.OCT,
        row.NOV,
        row.DEC,
        row.BUDGET_YEAR,
        row.FORECAST_YEAR
      ].join(','))
    ].join('\n');

    // Show export preview first
    setExportData(csvContent);
    setShowExportPreview(true);
  };

  const handleDownloadCsv = () => {
    // Download CSV
    const blob = new Blob([exportData], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `rolling_forecast_report_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setShowExportPreview(false);
  };

  const handleCellEdit = (rowId: string, field: string, value: number) => {
    if (!editMode) return;

    setReportData(prevData =>
      prevData.map(row => {
        if (row.id === rowId) {
          const updatedRow = { ...row, [field]: value };
          // Recalculate FORECAST2025 if monthly data changed
          if (['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'].includes(field)) {
            updatedRow.FORECAST2025 = [
              updatedRow.JAN, updatedRow.FEB, updatedRow.MAR, updatedRow.APR,
              updatedRow.MAY, updatedRow.JUN, updatedRow.JUL, updatedRow.AUG,
              updatedRow.SEP, updatedRow.OCT, updatedRow.NOV, updatedRow.DEC
            ].reduce((sum, val) => sum + val, 0);
          }
          return updatedRow;
        }
        return row;
      })
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            Back to Rolling Forecast
          </button>
          <div className="h-6 w-px bg-gray-300"></div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Budget / Rolling Forecast Report</h1>
            <p className="text-sm text-gray-600">Rolling Forecast as of 2025-2026</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleExport}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <DownloadIcon className="w-4 h-4" />
            Export
          </button>
          <button
            onClick={() => setEditMode(!editMode)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              editMode
                ? 'bg-green-600 text-white hover:bg-green-700'
                : 'bg-orange-500 text-white hover:bg-orange-600'
            }`}
          >
            <Edit3 className="w-4 h-4" />
            {editMode ? 'Save Changes' : 'Edit'}
          </button>
        </div>
      </div>

      {/* Report Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                  CUSTOMER
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                  ITEM
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                  BRAND
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                  CATEGORY
                </th>
                <th className="bg-blue-50 border-r border-gray-200" colSpan={12}>
                  <div className="px-3 py-2 text-center text-xs font-medium text-blue-700 uppercase tracking-wider">
                    MONTHS
                  </div>
                  <div className="grid grid-cols-12 border-t border-gray-200">
                    {['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'].map((month, index) => (
                      <div
                        key={month}
                        className={`px-2 py-1 text-center text-xs font-medium text-blue-600 uppercase tracking-wider ${
                          index < 11 ? 'border-r border-gray-200' : ''
                        }`}
                      >
                        {month}
                      </div>
                    ))}
                  </div>
                </th>
                <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                  BUDGET2025
                </th>
                <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  FORECAST2025
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {reportData.length === 0 ? (
                <tr>
                  <td colSpan={18} className="px-6 py-8 text-center text-gray-500">
                    No data available in table
                  </td>
                </tr>
              ) : (
                reportData.map((row, index) => (
                  <tr key={row.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-3 py-3 text-sm text-gray-900 border-r border-gray-200 max-w-[200px]">
                      <div className="truncate" title={row.customer}>
                        {row.customer}
                      </div>
                    </td>
                    <td className="px-3 py-3 text-sm text-gray-900 border-r border-gray-200 max-w-[250px]">
                      <div className="truncate" title={row.item}>
                        {row.item}
                      </div>
                    </td>
                    <td className="px-3 py-3 text-sm text-gray-900 border-r border-gray-200">
                      {row.brand}
                    </td>
                    <td className="px-3 py-3 text-sm text-gray-900 border-r border-gray-200">
                      {row.category}
                    </td>
                    
                    {/* Monthly data columns */}
                    {['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'].map(month => (
                      <td key={month} className="px-3 py-3 text-center text-sm text-gray-900 border-r border-gray-200">
                        {editMode ? (
                          <input
                            type="number"
                            value={row[month as keyof ReportData] || 0}
                            onChange={(e) => handleCellEdit(row.id, month, parseInt(e.target.value) || 0)}
                            className="w-16 px-1 py-1 text-center border border-gray-300 rounded text-sm"
                            min="0"
                          />
                        ) : (
                          row[month as keyof ReportData] || '-'
                        )}
                      </td>
                    ))}
                    
                    <td className="px-3 py-3 text-center text-sm font-medium text-gray-900 border-r border-gray-200">
                      {row.BUDGET2025}
                    </td>
                    <td className="px-3 py-3 text-center text-sm font-medium text-green-600">
                      {row.FORECAST2025}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary Statistics */}
      {reportData.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Report Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="text-sm text-blue-700 mb-1">Total Budget 2025</div>
              <div className="text-2xl font-bold text-blue-900">
                {reportData.reduce((sum, row) => sum + row.BUDGET2025, 0).toLocaleString()}
              </div>
              <div className="text-xs text-blue-600">Units</div>
            </div>
            
            <div className="bg-green-50 rounded-lg p-4">
              <div className="text-sm text-green-700 mb-1">Total Forecast 2025</div>
              <div className="text-2xl font-bold text-green-900">
                {reportData.reduce((sum, row) => sum + row.FORECAST2025, 0).toLocaleString()}
              </div>
              <div className="text-xs text-green-600">Units</div>
            </div>
            
            <div className="bg-purple-50 rounded-lg p-4">
              <div className="text-sm text-purple-700 mb-1">Variance</div>
              <div className="text-2xl font-bold text-purple-900">
                {(() => {
                  const totalBudget = reportData.reduce((sum, row) => sum + row.BUDGET2025, 0);
                  const totalForecast = reportData.reduce((sum, row) => sum + row.FORECAST2025, 0);
                  const variance = totalForecast - totalBudget;
                  const percentage = totalBudget > 0 ? ((variance / totalBudget) * 100).toFixed(1) : '0.0';
                  return `${variance >= 0 ? '+' : ''}${percentage}%`;
                })()}
              </div>
              <div className="text-xs text-purple-600">vs Budget</div>
            </div>
          </div>
        </div>
      )}

      {/* Export Preview Modal */}
      {showExportPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Export Preview</h2>
                <button
                  onClick={() => setShowExportPreview(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-6 max-h-[70vh] overflow-auto">
              <div className="mb-4 flex items-center justify-between">
                <p className="text-sm text-gray-600">Preview of data to be exported ({reportData.length} rows)</p>
                <div className="flex gap-3">
                  <button
                    onClick={handleDownloadCsv}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                  >
                    <DownloadIcon className="w-4 h-4" />
                    Download CSV
                  </button>
                </div>
              </div>

              {/* Export Preview Table */}
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-2 py-2 text-left border-r border-gray-200">CUSTOMER</th>
                        <th className="px-2 py-2 text-left border-r border-gray-200">ITEM</th>
                        <th className="px-2 py-2 text-left border-r border-gray-200">BRAND</th>
                        <th className="px-2 py-2 text-left border-r border-gray-200">CATEGORY</th>
                        {['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'].map(month => (
                          <th key={month} className="px-2 py-2 text-center border-r border-gray-200">{month}</th>
                        ))}
                        <th className="px-2 py-2 text-center border-r border-gray-200">BUDGET2025</th>
                        <th className="px-2 py-2 text-center">FORECAST2025</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {reportData.map((row, index) => (
                        <tr key={row.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="px-2 py-2 border-r border-gray-200 max-w-[120px] truncate" title={row.customer}>
                            {row.customer}
                          </td>
                          <td className="px-2 py-2 border-r border-gray-200 max-w-[150px] truncate" title={row.item}>
                            {row.item}
                          </td>
                          <td className="px-2 py-2 border-r border-gray-200">{row.brand}</td>
                          <td className="px-2 py-2 border-r border-gray-200">{row.category}</td>
                          {['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'].map(month => (
                            <td key={month} className="px-2 py-2 text-center border-r border-gray-200">
                              {row[month as keyof ReportData] || 0}
                            </td>
                          ))}
                          <td className="px-2 py-2 text-center border-r border-gray-200 font-medium">
                            {row.BUDGET2025}
                          </td>
                          <td className="px-2 py-2 text-center font-medium text-green-600">
                            {row.FORECAST2025}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* CSV Raw Data Preview */}
              <div className="mt-6">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Raw CSV Data Preview (first 10 lines):</h3>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 font-mono text-xs">
                  <pre className="whitespace-pre-wrap">
                    {exportData.split('\n').slice(0, 10).join('\n')}
                    {exportData.split('\n').length > 10 && '\n... and ' + (exportData.split('\n').length - 10) + ' more lines'}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RollingForecastReport;
