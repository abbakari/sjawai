import React, { useState } from 'react';
import {
  ArrowRight,
  CheckCircle,
  Clock,
  XCircle,
  Send,
  Users,
  Building,
  Target,
  TrendingUp,
  Package,
  Eye,
  MessageCircle,
  DollarSign,
  AlertTriangle,
  Shield
} from 'lucide-react';
import { WorkflowItem, WorkflowState } from '../contexts/WorkflowContext';

interface ManagerApprovalWorkflowProps {
  items: WorkflowItem[];
  onApprove: (item: WorkflowItem) => void;
  onReject: (item: WorkflowItem) => void;
  onSendToSupply: (item: WorkflowItem) => void;
  onViewDetails: (item: WorkflowItem) => void;
}

interface WorkflowStep {
  id: string;
  title: string;
  description: string;
  icon: any;
  status: 'completed' | 'current' | 'pending';
  count: number;
}

const ManagerApprovalWorkflow: React.FC<ManagerApprovalWorkflowProps> = ({
  items,
  onApprove,
  onReject,
  onSendToSupply,
  onViewDetails
}) => {
  const [selectedStep, setSelectedStep] = useState<string>('submitted');
  const [viewMode, setViewMode] = useState<'workflow' | 'table'>('workflow');

  // Calculate workflow steps with counts
  const workflowSteps: WorkflowStep[] = [
    {
      id: 'submitted',
      title: 'Submitted by Salesmen',
      description: 'New submissions awaiting manager review',
      icon: Users,
      status: 'current',
      count: items.filter(item => item.currentState === 'submitted').length
    },
    {
      id: 'in_review',
      title: 'Under Manager Review',
      description: 'Items currently being reviewed',
      icon: Eye,
      status: 'current',
      count: items.filter(item => item.currentState === 'in_review').length
    },
    {
      id: 'approved',
      title: 'Manager Approved',
      description: 'Approved items ready for supply chain',
      icon: CheckCircle,
      status: 'current',
      count: items.filter(item => item.currentState === 'approved').length
    },
    {
      id: 'sent_to_supply_chain',
      title: 'Sent to Supply Chain',
      description: 'Items forwarded to supply chain for processing',
      icon: Send,
      status: 'completed',
      count: items.filter(item => item.currentState === 'sent_to_supply_chain').length
    }
  ];

  const getStepItems = (stepId: string) => {
    return items.filter(item => item.currentState === stepId);
  };

  const getItemPriorityColor = (item: WorkflowItem) => {
    const value = item.totalValue;
    if (value > 500000) return 'border-l-4 border-red-500 bg-red-50';
    if (value > 200000) return 'border-l-4 border-orange-500 bg-orange-50';
    if (value > 100000) return 'border-l-4 border-yellow-500 bg-yellow-50';
    return 'border-l-4 border-green-500 bg-green-50';
  };

  const getStepColor = (step: WorkflowStep) => {
    if (step.count > 0) {
      if (step.id === 'submitted') return 'bg-yellow-100 border-yellow-300 text-yellow-800';
      if (step.id === 'in_review') return 'bg-blue-100 border-blue-300 text-blue-800';
      if (step.id === 'approved') return 'bg-green-100 border-green-300 text-green-800';
      if (step.id === 'sent_to_supply_chain') return 'bg-purple-100 border-purple-300 text-purple-800';
    }
    return 'bg-gray-100 border-gray-300 text-gray-600';
  };

  return (
    <div className="space-y-6">
      {/* Workflow Overview */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Building className="w-6 h-6 text-blue-600" />
            Manager Approval Workflow
          </h2>
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('workflow')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                viewMode === 'workflow' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Workflow View
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                viewMode === 'table' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Table View
            </button>
          </div>
        </div>

        {/* Workflow Steps */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {workflowSteps.map((step, index) => (
            <div key={step.id} className="relative">
              <button
                onClick={() => setSelectedStep(step.id)}
                className={`w-full p-4 rounded-lg border-2 transition-all duration-200 ${
                  selectedStep === step.id
                    ? getStepColor(step) + ' ring-2 ring-blue-300'
                    : getStepColor(step) + ' hover:shadow-md'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <step.icon className="w-6 h-6" />
                  <span className="text-2xl font-bold">{step.count}</span>
                </div>
                <h3 className="font-semibold text-sm mb-1">{step.title}</h3>
                <p className="text-xs opacity-80">{step.description}</p>
              </button>
              
              {/* Arrow connector */}
              {index < workflowSteps.length - 1 && (
                <div className="hidden md:block absolute top-1/2 -right-2 transform -translate-y-1/2 z-10">
                  <ArrowRight className="w-4 h-4 text-gray-400 bg-white rounded-full p-0.5" />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
          <div className="text-center">
            <div className="text-lg font-bold text-blue-600">
              ${items.reduce((sum, item) => sum + item.totalValue, 0).toLocaleString()}
            </div>
            <div className="text-xs text-gray-600">Total Value</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-green-600">
              {items.filter(item => item.type === 'sales_budget').length}
            </div>
            <div className="text-xs text-gray-600">Sales Budgets</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-purple-600">
              {items.filter(item => item.type === 'rolling_forecast').length}
            </div>
            <div className="text-xs text-gray-600">Rolling Forecasts</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-orange-600">
              {items.filter(item => item.totalValue > 200000).length}
            </div>
            <div className="text-xs text-gray-600">High Value Items</div>
          </div>
        </div>
      </div>

      {/* Step Details */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              {workflowSteps.find(s => s.id === selectedStep)?.title}
            </h3>
            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
              {getStepItems(selectedStep).length} items
            </span>
          </div>
          <p className="text-gray-600 mt-1">
            {workflowSteps.find(s => s.id === selectedStep)?.description}
          </p>
        </div>

        <div className="p-6">
          {viewMode === 'workflow' ? (
            <div className="space-y-4">
              {getStepItems(selectedStep).map((item) => (
                <div key={item.id} className={`rounded-lg border p-4 ${getItemPriorityColor(item)}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        {item.type === 'sales_budget' ? (
                          <Target className="w-5 h-5 text-blue-600" />
                        ) : (
                          <TrendingUp className="w-5 h-5 text-green-600" />
                        )}
                        <h4 className="font-semibold text-gray-900">{item.title}</h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          item.type === 'sales_budget' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                        }`}>
                          {item.type === 'sales_budget' ? 'BUDGET' : 'FORECAST'}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div>
                          <div className="text-xs text-gray-500 uppercase">Submitted By</div>
                          <div className="font-medium text-gray-900">{item.createdBy}</div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500 uppercase">Total Value</div>
                          <div className="font-bold text-green-600">${item.totalValue.toLocaleString()}</div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500 uppercase">Customers</div>
                          <div className="font-medium text-gray-900">{item.customers.length}</div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500 uppercase">Submitted</div>
                          <div className="font-medium text-gray-900">
                            {item.submittedAt ? new Date(item.submittedAt).toLocaleDateString() : '-'}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-sm">
                        <span className="flex items-center gap-1 text-gray-600">
                          <Users className="w-4 h-4" />
                          {item.customers.join(', ')}
                        </span>
                      </div>

                      {/* Risk indicators */}
                      <div className="flex items-center gap-2 mt-2">
                        {item.totalValue > 500000 && (
                          <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" />
                            High Value
                          </span>
                        )}
                        {item.customers.length > 3 && (
                          <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs font-medium">
                            Multiple Customers
                          </span>
                        )}
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                          <Shield className="w-3 h-3" />
                          Credit OK
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 ml-4">
                      <button
                        onClick={() => onViewDetails(item)}
                        className="flex items-center gap-2 px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                        Details
                      </button>

                      {selectedStep === 'submitted' && (
                        <>
                          <button
                            onClick={() => onApprove(item)}
                            className="flex items-center gap-2 px-3 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                          >
                            <CheckCircle className="w-4 h-4" />
                            Approve
                          </button>
                          <button
                            onClick={() => onReject(item)}
                            className="flex items-center gap-2 px-3 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                          >
                            <XCircle className="w-4 h-4" />
                            Reject
                          </button>
                        </>
                      )}

                      {selectedStep === 'approved' && (
                        <button
                          onClick={() => onSendToSupply(item)}
                          className="flex items-center gap-2 px-3 py-2 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                        >
                          <Send className="w-4 h-4" />
                          Send to Supply
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {getStepItems(selectedStep).length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p>No items in this step</p>
                </div>
              )}
            </div>
          ) : (
            /* Table View */
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Salesman</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customers</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {getStepItems(selectedStep).map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {item.type === 'sales_budget' ? (
                            <Target className="w-5 h-5 text-blue-600 mr-2" />
                          ) : (
                            <TrendingUp className="w-5 h-5 text-green-600 mr-2" />
                          )}
                          <div>
                            <div className="text-sm font-medium text-gray-900">{item.title}</div>
                            <div className="text-sm text-gray-500">{item.type.replace('_', ' ').toUpperCase()}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.createdBy}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                        ${item.totalValue.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.customers.length}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.submittedAt ? new Date(item.submittedAt).toLocaleDateString() : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button
                          onClick={() => onViewDetails(item)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          View
                        </button>
                        {selectedStep === 'submitted' && (
                          <>
                            <button
                              onClick={() => onApprove(item)}
                              className="text-green-600 hover:text-green-900"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => onReject(item)}
                              className="text-red-600 hover:text-red-900"
                            >
                              Reject
                            </button>
                          </>
                        )}
                        {selectedStep === 'approved' && (
                          <button
                            onClick={() => onSendToSupply(item)}
                            className="text-purple-600 hover:text-purple-900"
                          >
                            Send to Supply
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManagerApprovalWorkflow;
