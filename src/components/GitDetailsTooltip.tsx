import React, { useState } from 'react';
import { Package, Calendar, Truck, AlertCircle, Info } from 'lucide-react';
import DataPersistenceManager from '../utils/dataPersistence';

interface GitDetailsTooltipProps {
  customer: string;
  item: string;
  children: React.ReactNode;
}

const GitDetailsTooltip: React.FC<GitDetailsTooltipProps> = ({ customer, item, children }) => {
  const [showTooltip, setShowTooltip] = useState(false);

  const gitItems = DataPersistenceManager.getGitDataForItem(customer, item);

  if (gitItems.length === 0) {
    return <>{children}</>;
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ordered': return 'text-blue-600 bg-blue-50';
      case 'shipped': return 'text-yellow-600 bg-yellow-50';
      case 'in_transit': return 'text-purple-600 bg-purple-50';
      case 'arrived': return 'text-green-600 bg-green-50';
      case 'delayed': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const formatEta = (eta: string) => {
    const date = new Date(eta);
    const today = new Date();
    const diffDays = Math.ceil((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    return {
      date: date.toLocaleDateString(),
      daysText: diffDays < 0 ? `${Math.abs(diffDays)} days overdue` :
                diffDays === 0 ? 'Today' :
                `${diffDays} days`,
      isOverdue: diffDays < 0,
      isUrgent: diffDays <= 7 && diffDays >= 0
    };
  };

  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className="cursor-help"
      >
        {children}
      </div>
      
      {showTooltip && (
        <div className="absolute z-50 bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg">
          <div className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Package className="w-4 h-4 text-blue-600" />
              <h4 className="font-semibold text-gray-900">GIT Details</h4>
            </div>
            
            <div className="space-y-3">
              {gitItems.map((gitItem: any, index) => (
                <div key={gitItem.id} className={`border rounded-lg p-3 ${index < gitItems.length - 1 ? 'border-b' : ''}`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">
                        {gitItem.gitQuantity.toLocaleString()} units
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(gitItem.status)}`}>
                        {gitItem.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                    {gitItem.priority !== 'medium' && (
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        gitItem.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                        gitItem.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {gitItem.priority.toUpperCase()}
                      </span>
                    )}
                  </div>
                  
                  <div className="space-y-1 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Truck className="w-3 h-3" />
                      <span>Supplier: {gitItem.supplier}</span>
                    </div>
                    
                    {gitItem.eta && (
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3 h-3" />
                        {(() => {
                          const etaInfo = formatEta(gitItem.eta);
                          return (
                            <span className={
                              etaInfo.isOverdue ? 'text-red-600' :
                              etaInfo.isUrgent ? 'text-orange-600' :
                              'text-gray-600'
                            }>
                              ETA: {etaInfo.date} ({etaInfo.daysText})
                            </span>
                          );
                        })()}
                      </div>
                    )}
                    
                    {gitItem.poNumber && (
                      <div className="flex items-center gap-2">
                        <Info className="w-3 h-3" />
                        <span>PO: {gitItem.poNumber}</span>
                      </div>
                    )}
                    
                    {gitItem.trackingNumber && (
                      <div className="flex items-center gap-2">
                        <Package className="w-3 h-3" />
                        <span>Tracking: {gitItem.trackingNumber}</span>
                      </div>
                    )}
                    
                    {gitItem.estimatedValue > 0 && (
                      <div className="text-xs text-gray-500">
                        Est. Value: ${gitItem.estimatedValue.toLocaleString()}
                      </div>
                    )}
                    
                    {gitItem.notes && (
                      <div className="text-xs text-gray-500 mt-2 p-2 bg-gray-50 rounded">
                        💬 {gitItem.notes}
                      </div>
                    )}
                  </div>
                  
                  <div className="text-xs text-gray-400 mt-2 border-t pt-2">
                    Added by admin • {new Date(gitItem.createdAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
            
            {gitItems.length > 1 && (
              <div className="mt-3 pt-3 border-t border-gray-200">
                <div className="text-sm font-medium text-gray-900">
                  Total: {gitItems.reduce((sum: number, item: any) => sum + item.gitQuantity, 0).toLocaleString()} units
                </div>
                <div className="text-xs text-gray-500">
                  across {gitItems.length} shipments
                </div>
              </div>
            )}
          </div>
          
          {/* Tooltip arrow */}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-200"></div>
        </div>
      )}
    </div>
  );
};

export default GitDetailsTooltip;
