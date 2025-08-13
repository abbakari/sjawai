import React, { useState, useCallback } from 'react';
import { X, Upload, FileText, AlertCircle, CheckCircle, File } from 'lucide-react';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (file: File, config: ImportConfig) => void;
}

export interface ImportConfig {
  dataType: 'budget' | 'forecast' | 'sales' | 'inventory';
  mergeStrategy: 'replace' | 'append' | 'update';
  validateData: boolean;
  createBackup: boolean;
}

const ImportModal: React.FC<ImportModalProps> = ({ isOpen, onClose, onImport }) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [config, setConfig] = useState<ImportConfig>({
    dataType: 'budget',
    mergeStrategy: 'replace',
    validateData: true,
    createBackup: true
  });

  const supportedFormats = [
    { ext: '.xlsx', type: 'Excel files', icon: FileText },
    { ext: '.csv', type: 'CSV files', icon: File },
    { ext: '.json', type: 'JSON files', icon: File }
  ];

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (isValidFile(file)) {
        setSelectedFile(file);
      }
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (isValidFile(file)) {
        setSelectedFile(file);
      }
    }
  };

  const isValidFile = (file: File) => {
    const validExtensions = ['.xlsx', '.csv', '.json'];
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    return validExtensions.includes(fileExtension);
  };

  const handleImport = () => {
    if (selectedFile) {
      onImport(selectedFile, config);
      onClose();
      setSelectedFile(null);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <Upload className="w-5 h-5 text-blue-600" />
            <h2 className="text-xl font-bold text-gray-900">Import Data</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* File Upload Area */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Upload File</label>
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragActive
                  ? 'border-blue-500 bg-blue-50'
                  : selectedFile
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              {selectedFile ? (
                <div className="flex items-center justify-center space-x-3">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                  <div className="text-left">
                    <p className="font-medium text-gray-900">{selectedFile.name}</p>
                    <p className="text-sm text-gray-600">{formatFileSize(selectedFile.size)}</p>
                  </div>
                  <button
                    onClick={() => setSelectedFile(null)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <div>
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-lg font-medium text-gray-900 mb-2">
                    Drop your file here or{' '}
                    <label className="text-blue-600 hover:text-blue-700 cursor-pointer">
                      browse
                      <input
                        type="file"
                        className="hidden"
                        accept=".xlsx,.csv,.json"
                        onChange={handleFileSelect}
                      />
                    </label>
                  </p>
                  <p className="text-sm text-gray-600">
                    Supported formats: {supportedFormats.map(f => f.ext).join(', ')}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Supported Formats */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Supported Formats</label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {supportedFormats.map((format, index) => {
                const IconComponent = format.icon;
                return (
                  <div key={index} className="flex items-center space-x-2 p-3 border border-gray-200 rounded-lg">
                    <IconComponent className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="font-medium text-gray-900">{format.ext}</p>
                      <p className="text-xs text-gray-600">{format.type}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Import Configuration */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Data Type</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={config.dataType}
                onChange={(e) => setConfig({...config, dataType: e.target.value as any})}
              >
                <option value="budget">Budget Data</option>
                <option value="forecast">Forecast Data</option>
                <option value="sales">Sales Data</option>
                <option value="inventory">Inventory Data</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Merge Strategy</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={config.mergeStrategy}
                onChange={(e) => setConfig({...config, mergeStrategy: e.target.value as any})}
              >
                <option value="replace">Replace existing data</option>
                <option value="append">Append to existing data</option>
                <option value="update">Update existing records</option>
              </select>
            </div>
          </div>

          {/* Import Options */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Import Options</label>
            <div className="space-y-3">
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  checked={config.validateData}
                  onChange={(e) => setConfig({...config, validateData: e.target.checked})}
                />
                <div>
                  <span className="text-sm font-medium text-gray-900">Validate Data</span>
                  <p className="text-xs text-gray-600">Check data format and integrity before import</p>
                </div>
              </label>

              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  checked={config.createBackup}
                  onChange={(e) => setConfig({...config, createBackup: e.target.checked})}
                />
                <div>
                  <span className="text-sm font-medium text-gray-900">Create Backup</span>
                  <p className="text-xs text-gray-600">Backup existing data before import</p>
                </div>
              </label>
            </div>
          </div>

          {/* Warning */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start space-x-2">
              <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-yellow-800">Important Notes</h4>
                <ul className="text-sm text-yellow-700 mt-1 space-y-1">
                  <li>• Make sure your data follows the required format</li>
                  <li>• Large files may take several minutes to process</li>
                  <li>• Existing data will be affected based on merge strategy</li>
                  <li>• Always create a backup before major imports</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between p-6 border-t border-gray-200">
          <div className="text-xs text-gray-500">
            {selectedFile ? `Ready to import: ${selectedFile.name}` : 'No file selected'}
          </div>
          <div className="flex space-x-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleImport}
              disabled={!selectedFile}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Upload className="w-4 h-4" />
              <span>Import Data</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImportModal;
