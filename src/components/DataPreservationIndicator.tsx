import React from 'react';
import { Shield, Database, CheckCircle, Info } from 'lucide-react';

interface DataPreservationIndicatorProps {
  itemsCount: number;
  submittedCount: number;
  preservedCount: number;
  dataType: 'budget' | 'forecast';
  compact?: boolean;
}

const DataPreservationIndicator: React.FC<DataPreservationIndicatorProps> = ({
  itemsCount,
  submittedCount,
  preservedCount,
  dataType,
  compact = false
}) => {
  if (compact) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-blue-600" />
          <div className="text-sm">
            <span className="font-medium text-blue-900">Data Preserved:</span>
            <span className="text-blue-700 ml-1">
              {preservedCount} {dataType} entries remain in table after submission
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 rounded-lg p-4">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <Database className="w-5 h-5 text-blue-600" />
          </div>
        </div>
        
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h4 className="font-medium text-blue-900">Data Preservation Status</h4>
            <CheckCircle className="w-4 h-4 text-green-600" />
          </div>
          
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Total {dataType} entries:</span>
              <span className="font-medium text-gray-900">{itemsCount}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Submitted for approval:</span>
              <span className="font-medium text-orange-600">{submittedCount}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Preserved in table:</span>
              <span className="font-medium text-green-600">{preservedCount}</span>
            </div>
          </div>
          
          <div className="mt-3 p-3 bg-white rounded border border-blue-200">
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
              <div className="text-xs text-blue-800">
                <p className="font-medium mb-1">Why Data is Preserved:</p>
                <ul className="space-y-1 text-blue-700">
                  <li>• Allows continued editing and refinement</li>
                  <li>• Maintains historical reference</li>
                  <li>• Enables reporting and analysis</li>
                  <li>• Provides backup for resubmission if needed</li>
                  <li>• Supports ongoing business operations</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataPreservationIndicator;
