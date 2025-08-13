import React, { useState } from 'react';
import { 
  X, 
  Calendar, 
  User, 
  DollarSign, 
  Package, 
  TrendingUp, 
  MessageSquare, 
  CheckCircle, 
  XCircle, 
  Send,
  AlertCircle,
  Target,
  Clock,
  Building
} from 'lucide-react';
import { WorkflowItem, useWorkflow } from '../contexts/WorkflowContext';
import { useAuth } from '../contexts/AuthContext';

interface WorkflowItemDetailModalProps {
  item: WorkflowItem;
  isOpen: boolean;
  onClose: () => void;
}

const WorkflowItemDetailModal: React.FC<WorkflowItemDetailModalProps> = ({
  item,
  isOpen,
  onClose
}) => {
  const { user } = useAuth();
  const { approveItem, rejectItem, addComment, sendToSupplyChain } = useWorkflow();
  const [actionType, setActionType] = useState<'approve' | 'reject' | 'comment' | null>(null);
  const [actionComment, setActionComment] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen || !item) return null;

  const handleAction = async () => {
    if (!actionComment.trim() || !user) return;
    
    setIsProcessing(true);
    
    try {
      switch (actionType) {
        case 'approve':
          approveItem(item.id, actionComment, user.name);
          break;
        case 'reject':
          rejectItem(item.id, actionComment, user.name);
          break;
        case 'comment':
          addComment(item.id, actionComment, user.name, user.role);
          break;
      }
      
      setActionComment('');
      setActionType(null);
      
      // Don't close modal automatically to let user see the result
    } catch (error) {
      console.error('Action failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSendToSupplyChain = () => {
    if (user) {
      sendToSupplyChain(item.id, user.name);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStateColor = (state: string) => {
    switch (state) {
      case 'submitted': return 'bg-blue-100 text-blue-800';
      case 'in_review': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'sent_to_supply_chain': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[9999] p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-blue-50 to-green-50">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-xl font-bold text-gray-900">{item.title}</h2>
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStateColor(item.currentState)}`}>
                {item.currentState.replace('_', ' ').toUpperCase()}
              </span>
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(item.priority)}`}>
                {item.priority.toUpperCase()} PRIORITY
              </span>
            </div>
            <p className="text-gray-600">{item.description}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Left Panel - Details */}
          <div className="w-2/3 p-6 overflow-y-auto">
            {/* Summary Cards */}
            <div className="grid grid-cols-4 gap-4 mb-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="w-5 h-5 text-blue-600" />
                  <span className="text-sm font-medium text-blue-900">Total Value</span>
                </div>
                <p className="text-2xl font-bold text-blue-600">
                  ${item.totalValue.toLocaleString()}
                </p>
              </div>
              
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Building className="w-5 h-5 text-green-600" />
                  <span className="text-sm font-medium text-green-900">Customers</span>
                </div>
                <p className="text-2xl font-bold text-green-600">{item.customers.length}</p>
              </div>
              
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-5 h-5 text-purple-600" />
                  <span className="text-sm font-medium text-purple-900">Year</span>
                </div>
                <p className="text-2xl font-bold text-purple-600">{item.year}</p>
              </div>
              
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <User className="w-5 h-5 text-orange-600" />
                  <span className="text-sm font-medium text-orange-900">Created By</span>
                </div>
                <p className="text-lg font-bold text-orange-600">{item.createdBy}</p>
              </div>
            </div>

            {/* Customer Details */}
            <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Building className="w-5 h-5 text-blue-600" />
                Customer Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {item.customers.map((customer, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-3">
                    <h4 className="font-medium text-gray-900">{customer}</h4>
                    <div className="text-sm text-gray-600 mt-1">
                      {item.budgetData?.filter(b => b.customer === customer).length || 0} budget items
                      {item.forecastData?.filter(f => f.customer === customer).length ? 
                        `, ${item.forecastData.filter(f => f.customer === customer).length} forecast items` : ''
                      }
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Budget Data */}
            {item.budgetData && item.budgetData.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Target className="w-5 h-5 text-green-600" />
                  Sales Budget Details
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="border border-gray-200 p-2 text-left text-sm font-semibold">Customer</th>
                        <th className="border border-gray-200 p-2 text-left text-sm font-semibold">Item</th>
                        <th className="border border-gray-200 p-2 text-left text-sm font-semibold">Category</th>
                        <th className="border border-gray-200 p-2 text-left text-sm font-semibold">Brand</th>
                        <th className="border border-gray-200 p-2 text-right text-sm font-semibold">Budget ($)</th>
                        <th className="border border-gray-200 p-2 text-center text-sm font-semibold">Months</th>
                      </tr>
                    </thead>
                    <tbody>
                      {item.budgetData.map((budget) => (
                        <tr key={budget.id} className="hover:bg-gray-50">
                          <td className="border border-gray-200 p-2 text-sm">{budget.customer}</td>
                          <td className="border border-gray-200 p-2 text-sm">{budget.item}</td>
                          <td className="border border-gray-200 p-2 text-sm">{budget.category}</td>
                          <td className="border border-gray-200 p-2 text-sm">{budget.brand}</td>
                          <td className="border border-gray-200 p-2 text-sm text-right font-semibold">
                            ${budget.totalBudget.toLocaleString()}
                          </td>
                          <td className="border border-gray-200 p-2 text-sm text-center">
                            {budget.monthlyData.filter(m => m.budgetValue > 0).length}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Forecast Data */}
            {item.forecastData && item.forecastData.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                  Rolling Forecast Details
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="border border-gray-200 p-2 text-left text-sm font-semibold">Customer</th>
                        <th className="border border-gray-200 p-2 text-left text-sm font-semibold">Item</th>
                        <th className="border border-gray-200 p-2 text-left text-sm font-semibold">Period</th>
                        <th className="border border-gray-200 p-2 text-right text-sm font-semibold">Units</th>
                        <th className="border border-gray-200 p-2 text-right text-sm font-semibold">Value ($)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {item.forecastData.map((forecast) => (
                        <tr key={forecast.id} className="hover:bg-gray-50">
                          <td className="border border-gray-200 p-2 text-sm">{forecast.customer}</td>
                          <td className="border border-gray-200 p-2 text-sm">{forecast.item}</td>
                          <td className="border border-gray-200 p-2 text-sm">
                            {forecast.quarter || forecast.month || forecast.year}
                          </td>
                          <td className="border border-gray-200 p-2 text-sm text-right">
                            {forecast.forecastUnits.toLocaleString()}
                          </td>
                          <td className="border border-gray-200 p-2 text-sm text-right font-semibold">
                            ${forecast.forecastValue.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Timeline */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Clock className="w-5 h-5 text-gray-600" />
                Timeline
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Created by {item.createdBy}</span>
                      <span className="text-sm text-gray-500">
                        {new Date(item.submittedAt!).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
                
                {item.approvedAt && (
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Approved by {item.approvedBy}</span>
                        <span className="text-sm text-gray-500">
                          {new Date(item.approvedAt).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
                
                {item.rejectedAt && (
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Rejected by {item.rejectedBy}</span>
                        <span className="text-sm text-gray-500">
                          {new Date(item.rejectedAt).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {item.sentToSupplyChainAt && (
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Sent to Supply Chain</span>
                        <span className="text-sm text-gray-500">
                          {new Date(item.sentToSupplyChainAt).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Panel - Comments & Actions */}
          <div className="w-1/3 border-l border-gray-200 p-6 flex flex-col">
            {/* Actions */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">Manager Actions</h3>
              
              {item.currentState === 'submitted' && user?.role === 'manager' && (
                <div className="space-y-2">
                  <button
                    onClick={() => setActionType('approve')}
                    className="w-full flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Approve
                  </button>
                  <button
                    onClick={() => setActionType('reject')}
                    className="w-full flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <XCircle className="w-4 h-4" />
                    Reject
                  </button>
                </div>
              )}

              {item.currentState === 'approved' && user?.role === 'manager' && (
                <button
                  onClick={handleSendToSupplyChain}
                  className="w-full flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Send className="w-4 h-4" />
                  Send to Supply Chain
                </button>
              )}

              <button
                onClick={() => setActionType('comment')}
                className="w-full flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors mt-2"
              >
                <MessageSquare className="w-4 h-4" />
                Add Comment
              </button>
            </div>

            {/* Action Form */}
            {actionType && (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg border">
                <h4 className="font-medium mb-2 capitalize">{actionType} Item</h4>
                <textarea
                  value={actionComment}
                  onChange={(e) => setActionComment(e.target.value)}
                  placeholder={`Enter ${actionType} message...`}
                  className="w-full p-3 border border-gray-300 rounded-lg resize-none"
                  rows={3}
                />
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={handleAction}
                    disabled={!actionComment.trim() || isProcessing}
                    className={`flex-1 px-4 py-2 rounded-lg text-white font-medium ${
                      actionType === 'approve' ? 'bg-green-600 hover:bg-green-700' :
                      actionType === 'reject' ? 'bg-red-600 hover:bg-red-700' :
                      'bg-blue-600 hover:bg-blue-700'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {isProcessing ? 'Processing...' : `Confirm ${actionType}`}
                  </button>
                  <button
                    onClick={() => {
                      setActionType(null);
                      setActionComment('');
                    }}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Comments */}
            <div className="flex-1">
              <h3 className="text-lg font-semibold mb-3">Comments & History</h3>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {item.comments.map((comment) => (
                  <div key={comment.id} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{comment.author}</span>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          comment.type === 'approval' ? 'bg-green-100 text-green-800' :
                          comment.type === 'rejection' ? 'bg-red-100 text-red-800' :
                          comment.isFollowBack ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {comment.isFollowBack ? 'Follow-back' : comment.type}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500">
                        {new Date(comment.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700">{comment.message}</p>
                  </div>
                ))}
                
                {item.comments.length === 0 && (
                  <div className="text-center py-6 text-gray-500">
                    <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No comments yet</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkflowItemDetailModal;
