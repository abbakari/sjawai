import React, { useState } from 'react';
import { X, Download, FileText, FileSpreadsheet, File, Calendar, Settings } from 'lucide-react';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (config: ExportConfig) => void;
  title?: string;
}

export interface ExportConfig {
  format: 'excel' | 'csv' | 'pdf' | 'json';
  dateRange: string;
  includeFilters: boolean;
  includeCharts: boolean;
  includeMetadata: boolean;
  filename: string;
  year: string;
}

const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose, onExport, title = "Export Data" }) => {
  const [config, setConfig] = useState<ExportConfig>({
    format: 'excel',
    dateRange: 'current-year',
    includeFilters: true,
    includeCharts: false,
    includeMetadata: true,
    filename: `budget_export_${new Date().getFullYear()}`,
    year: '2026'
  });

  const formatOptions = [
    { value: 'excel', label: 'Excel (.xlsx)', icon: FileSpreadsheet, description: 'Best for data analysis and calculations' },
    { value: 'csv', label: 'CSV (.csv)', icon: FileText, description: 'Simple format for data import/export' },
    { value: 'pdf', label: 'PDF (.pdf)', icon: File, description: 'Professional format for reports and sharing' },
    { value: 'json', label: 'JSON (.json)', icon: Settings, description: 'Raw data format for technical use' }
  ];

  const yearOptions = ['2024', '2025', '2026', '2027'];

  const handleExport = () => {
    onExport(config);
    onClose();
  };

  const getFormatIcon = (format: string) => {
    const option = formatOptions.find(opt => opt.value === format);
    return option ? option.icon : FileText;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <Download className="w-5 h-5 text-blue-600" />
            <h2 className="text-xl font-bold text-gray-900">{title}</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* File Format Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Export Format</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {formatOptions.map((option) => {
                const IconComponent = option.icon;
                return (
                  <div
                    key={option.value}
                    className={`border-2 rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${
                      config.format === option.value
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setConfig({...config, format: option.value as any})}
                  >
                    <div className="flex items-center space-x-3">
                      <IconComponent className={`w-6 h-6 ${
                        config.format === option.value ? 'text-blue-600' : 'text-gray-500'
                      }`} />
                      <div>
                        <h4 className="font-semibold text-gray-900">{option.label}</h4>
                        <p className="text-xs text-gray-600">{option.description}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Year Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                Budget Year
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={config.year}
                onChange={(e) => setConfig({...config, year: e.target.value})}
              >
                {yearOptions.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={config.dateRange}
                onChange={(e) => setConfig({...config, dateRange: e.target.value})}
              >
                <option value="current-year">Current Year</option>
                <option value="last-year">Last Year</option>
                <option value="all-time">All Time</option>
                <option value="custom">Custom Range</option>
              </select>
            </div>
          </div>

          {/* Filename */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">File Name</label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={config.filename}
              onChange={(e) => setConfig({...config, filename: e.target.value})}
              placeholder="Enter filename (without extension)"
            />
          </div>

          {/* Export Options */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Export Options</label>
            <div className="space-y-3">
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  checked={config.includeFilters}
                  onChange={(e) => setConfig({...config, includeFilters: e.target.checked})}
                />
                <div>
                  <span className="text-sm font-medium text-gray-900">Include Applied Filters</span>
                  <p className="text-xs text-gray-600">Export data with current filter settings applied</p>
                </div>
              </label>

              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  checked={config.includeCharts}
                  onChange={(e) => setConfig({...config, includeCharts: e.target.checked})}
                />
                <div>
                  <span className="text-sm font-medium text-gray-900">Include Charts and Graphs</span>
                  <p className="text-xs text-gray-600">Add visual charts to the export (PDF only)</p>
                </div>
              </label>

              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  checked={config.includeMetadata}
                  onChange={(e) => setConfig({...config, includeMetadata: e.target.checked})}
                />
                <div>
                  <span className="text-sm font-medium text-gray-900">Include Metadata</span>
                  <p className="text-xs text-gray-600">Add export timestamp, user info, and system details</p>
                </div>
              </label>
            </div>
          </div>

          {/* Preview */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Export Preview</h4>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <span>File:</span>
              <span className="font-mono bg-white px-2 py-1 rounded border">
                {config.filename}.{config.format === 'excel' ? 'xlsx' : config.format}
              </span>
            </div>
            <div className="mt-2 text-xs text-gray-500">
              Format: {formatOptions.find(f => f.value === config.format)?.label} | 
              Year: {config.year} | 
              Range: {config.dateRange.replace('-', ' ')}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between p-6 border-t border-gray-200">
          <div className="text-xs text-gray-500">
            Export will include all visible data and applied filters
          </div>
          <div className="flex space-x-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleExport}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExportModal;
