import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  MessageSquare, 
  Eye, 
  Send,
  Filter,
  Search,
  Calendar,
  User,
  Building,
  Target,
  TrendingUp,
  Bell,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  DollarSign,
  Package,
  Users,
  FileText,
  BarChart3,
  ArrowRight,
  Star,
  Shield,
  Truck,
  MessageCircle,
  UserCheck,
  Building2,
  MapPin,
  Phone,
  Mail,
  CreditCard,
  Activity
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useWorkflow, WorkflowState, WorkflowItem } from '../contexts/WorkflowContext';
import { useBudget } from '../contexts/BudgetContext';
import WorkflowItemDetailModal from '../components/WorkflowItemDetailModal';
import ManagerApprovalWorkflow from '../components/ManagerApprovalWorkflow';
import GitSummaryWidget from '../components/GitSummaryWidget';
import DataPreservationIndicator from '../components/DataPreservationIndicator';
import DataPersistenceManager from '../utils/dataPersistence';

// Department and Manager Mappings
const DEPARTMENT_MANAGERS = {
  'Sales': ['Jane Manager'],
  'Regional Sales': ['Mark Regional Manager', 'Lisa Territory Manager'],
  'Enterprise': ['David Enterprise Manager'],
  'Government': ['Patricia Gov Manager']
};

const SALESMAN_DEPARTMENTS = {
  'John Salesman': 'Sales',
  'Sarah Johnson': 'Sales', 
  'Mike Thompson': 'Regional Sales',
  'Emily Davis': 'Regional Sales',
  'Robert Wilson': 'Enterprise',
  'Jennifer Brown': 'Government'
};

interface CustomerDetails {
  id: string;
  name: string;
  code: string;
  email: string;
  phone: string;
  region: string;
  segment: string;
  creditLimit: number;
  outstandingBalance: number;
  creditRating: 'A+' | 'A' | 'B+' | 'B' | 'C';
  manager: string;
  recentOrders: number;
  avgOrderValue: number;
}

const ApprovalCenter: React.FC = () => {
  const { user } = useAuth();
  const { 
    workflowItems, 
    notifications, 
    getItemsByState, 
    getItemsBySalesman, 
    getItemsByYear,
    getNotificationsForUser,
    markNotificationAsRead,
    approveItem,
    rejectItem,
    sendToSupplyChain,
    addComment,
    error: workflowError
  } = useWorkflow();
  
  const [selectedFilter, setSelectedFilter] = useState<WorkflowState | 'all'>('submitted');
  const [selectedType, setSelectedType] = useState<'all' | 'sales_budget' | 'rolling_forecast'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());
  const [selectedSalesman, setSelectedSalesman] = useState<string>('all');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [approvalAction, setApprovalAction] = useState<'approve' | 'reject' | 'send_to_supply'>('approve');
  const [approvalComment, setApprovalComment] = useState('');
  const [selectedItemForAction, setSelectedItemForAction] = useState<WorkflowItem | null>(null);

  // Enhanced customer details for better decision making
  const customerDetails: Record<string, CustomerDetails> = {
    'Action Aid International (Tz)': {
      id: 'aai_001',
      name: 'Action Aid International (Tz)',
      code: 'AAI001',
      email: 'procurement@actionaid.tz',
      phone: '+255-22-123-4567',
      region: 'East Africa',
      segment: 'NGO',
      creditLimit: 500000,
      outstandingBalance: 75000,
      creditRating: 'A+',
      manager: 'John Smith',
      recentOrders: 15,
      avgOrderValue: 28500
    },
    'ADVENT CONSTRUCTION LTD.': {
      id: 'adv_002',
      name: 'ADVENT CONSTRUCTION LTD.',
      code: 'ADV002',
      email: 'orders@advent.com',
      phone: '+1-555-0101',
      region: 'North America',
      segment: 'Enterprise',
      creditLimit: 750000,
      outstandingBalance: 125000,
      creditRating: 'A',
      manager: 'Sarah Johnson',
      recentOrders: 8,
      avgOrderValue: 85000
    },
    'Oxfam Tanzania': {
      id: 'oxf_003',
      name: 'Oxfam Tanzania',
      code: 'OXF003',
      email: 'logistics@oxfam.tz',
      phone: '+255-22-456-7890',
      region: 'East Africa',
      segment: 'NGO',
      creditLimit: 400000,
      outstandingBalance: 45000,
      creditRating: 'A+',
      manager: 'Maria Lopez',
      recentOrders: 12,
      avgOrderValue: 35000
    }
  };

  // Get current user's department
  const currentUserDepartment = user?.department || 'Sales';
  
  // Get salesmen under current manager's department
  const getManagedSalesmen = () => {
    if (user?.role !== 'manager') return [];
    
    return Object.entries(SALESMAN_DEPARTMENTS)
      .filter(([salesman, dept]) => {
        if (selectedDepartment === 'all') {
          return DEPARTMENT_MANAGERS[dept]?.includes(user.name);
        }
        return dept === selectedDepartment && DEPARTMENT_MANAGERS[dept]?.includes(user.name);
      })
      .map(([salesman]) => salesman);
  };

  // Filter items based on manager's department and hierarchy
  const getFilteredItems = () => {
    let filtered = workflowItems;

    // Department-based filtering for managers
    if (user?.role === 'manager') {
      const managedSalesmen = getManagedSalesmen();
      filtered = filtered.filter(item => managedSalesmen.includes(item.createdBy));
    }

    // Apply additional filters
    return filtered.filter(item => {
      const matchesFilter = selectedFilter === 'all' || item.currentState === selectedFilter;
      const matchesType = selectedType === 'all' || item.type === selectedType;
      const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.createdBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.customers.some(customer => customer.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesYear = selectedYear === 'all' || item.year === selectedYear;
      const matchesSalesman = selectedSalesman === 'all' || item.createdBy === selectedSalesman;
      
      return matchesFilter && matchesType && matchesSearch && matchesYear && matchesSalesman;
    });
  };

  const filteredItems = getFilteredItems();

  // Separate items by type
  const salesBudgetItems = filteredItems.filter(item => item.type === 'sales_budget');
  const forecastItems = filteredItems.filter(item => item.type === 'rolling_forecast');

  // Get user notifications
  const userNotifications = user ? getNotificationsForUser(user.name, user.role) : [];
  const unreadNotifications = userNotifications.filter(n => !n.read);

  // Statistics with department context
  const stats = {
    total: filteredItems.length,
    pending: filteredItems.filter(item => item.currentState === 'submitted').length,
    approved: filteredItems.filter(item => item.currentState === 'approved').length,
    rejected: filteredItems.filter(item => item.currentState === 'rejected').length,
    sentToSupplyChain: filteredItems.filter(item => item.currentState === 'sent_to_supply_chain').length,
    totalValue: filteredItems.reduce((sum, item) => sum + item.totalValue, 0),
    salesBudgetValue: salesBudgetItems.reduce((sum, item) => sum + item.totalValue, 0),
    forecastValue: forecastItems.reduce((sum, item) => sum + item.totalValue, 0)
  };

  const handleQuickAction = (item: WorkflowItem, action: 'approve' | 'reject' | 'send_to_supply') => {
    setSelectedItemForAction(item);
    setApprovalAction(action);
    setApprovalComment('');
    setShowApprovalModal(true);
  };

  const handleApprovalSubmit = () => {
    if (!selectedItemForAction || !user) return;

    const comment = approvalComment || `${approvalAction === 'approve' ? 'Approved' : approvalAction === 'reject' ? 'Rejected' : 'Sent to Supply Chain'} by ${user.name}`;

    switch (approvalAction) {
      case 'approve':
        approveItem(selectedItemForAction.id, comment, user.name);
        break;
      case 'reject':
        rejectItem(selectedItemForAction.id, comment, user.name);
        break;
      case 'send_to_supply':
        sendToSupplyChain(selectedItemForAction.id, user.name);
        break;
    }

    setShowApprovalModal(false);
    setSelectedItemForAction(null);
    setApprovalComment('');
  };

  const getStateColor = (state: WorkflowState) => {
    switch (state) {
      case 'submitted': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'in_review': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'approved': return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      case 'sent_to_supply_chain': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStateIcon = (state: WorkflowState) => {
    switch (state) {
      case 'submitted': return <Clock className="w-4 h-4" />;
      case 'in_review': return <Eye className="w-4 h-4" />;
      case 'approved': return <CheckCircle className="w-4 h-4" />;
      case 'rejected': return <XCircle className="w-4 h-4" />;
      case 'sent_to_supply_chain': return <Send className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getCreditRatingColor = (rating: string) => {
    switch (rating) {
      case 'A+': return 'text-green-600 bg-green-100';
      case 'A': return 'text-green-600 bg-green-100';
      case 'B+': return 'text-yellow-600 bg-yellow-100';
      case 'B': return 'text-orange-600 bg-orange-100';
      case 'C': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const renderCustomerInsight = (customerName: string) => {
    const customer = customerDetails[customerName];
    if (!customer) return null;

    const creditUtilization = (customer.outstandingBalance / customer.creditLimit) * 100;

    return (
      <div className="bg-gray-50 rounded-lg p-4 mt-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-medium text-gray-900 flex items-center gap-2">
            <Building2 className="w-4 h-4" />
            Customer Insight: {customer.name}
          </h4>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCreditRatingColor(customer.creditRating)}`}>
            {customer.creditRating} Rating
          </span>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
          <div>
            <span className="text-gray-500">Credit Limit:</span>
            <p className="font-medium">${customer.creditLimit.toLocaleString()}</p>
          </div>
          <div>
            <span className="text-gray-500">Outstanding:</span>
            <p className={`font-medium ${creditUtilization > 80 ? 'text-red-600' : creditUtilization > 60 ? 'text-yellow-600' : 'text-green-600'}`}>
              ${customer.outstandingBalance.toLocaleString()} ({creditUtilization.toFixed(1)}%)
            </p>
          </div>
          <div>
            <span className="text-gray-500">Recent Orders:</span>
            <p className="font-medium">{customer.recentOrders} (Last 6 months)</p>
          </div>
          <div>
            <span className="text-gray-500">Avg Order Value:</span>
            <p className="font-medium">${customer.avgOrderValue.toLocaleString()}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4 mt-3 text-xs text-gray-600">
          <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {customer.region}</span>
          <span className="flex items-center gap-1"><Shield className="w-3 h-3" /> {customer.segment}</span>
          <span className="flex items-center gap-1"><UserCheck className="w-3 h-3" /> {customer.manager}</span>
        </div>

        {creditUtilization > 80 && (
          <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded flex items-center gap-2 text-xs text-red-700">
            <AlertCircle className="w-4 h-4" />
            High credit utilization - Consider credit review before approval
          </div>
        )}
      </div>
    );
  };

  const renderItemCard = (item: WorkflowItem) => (
    <div key={item.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            {/* Header with Enhanced Type Indicators */}
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center gap-2">
                {item.type === 'sales_budget' ? (
                  <Target className="w-5 h-5 text-blue-600" />
                ) : (
                  <TrendingUp className="w-5 h-5 text-green-600" />
                )}
                <h3 className="text-lg font-semibold text-gray-900">{item.title}</h3>
              </div>
              
              <div className="flex gap-2">
                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${getStateColor(item.currentState)}`}>
                  {getStateIcon(item.currentState)}
                  {item.currentState.replace('_', ' ').toUpperCase()}
                </span>
                
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  item.type === 'sales_budget' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                }`}>
                  {item.type === 'sales_budget' ? 'SALES BUDGET' : 'ROLLING FORECAST'}
                </span>
              </div>
            </div>
            
            {/* Salesman Information - Enhanced */}
            <div className="bg-blue-50 rounded-lg p-4 mb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-blue-900">Submitted by: {item.createdBy}</h4>
                    <p className="text-sm text-blue-700">
                      Department: {SALESMAN_DEPARTMENTS[item.createdBy] || 'Sales'} | 
                      Role: {item.createdByRole.charAt(0).toUpperCase() + item.createdByRole.slice(1)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-blue-600 font-medium">
                    {new Date(item.submittedAt!).toLocaleDateString()}
                  </p>
                  <p className="text-xs text-blue-500">
                    {new Date(item.submittedAt!).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Financial Summary Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="bg-gray-50 rounded-lg p-3">
                <span className="text-xs text-gray-500 uppercase tracking-wide">Total Value</span>
                <p className="text-lg font-bold text-green-600">${item.totalValue.toLocaleString()}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <span className="text-xs text-gray-500 uppercase tracking-wide">Year</span>
                <p className="text-lg font-bold text-gray-900">{item.year}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <span className="text-xs text-gray-500 uppercase tracking-wide">Customers</span>
                <p className="text-lg font-bold text-gray-900">{item.customers.length}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <span className="text-xs text-gray-500 uppercase tracking-wide">Comments</span>
                <p className="text-lg font-bold text-gray-900">{item.comments.length}</p>
              </div>
            </div>

            {/* Customer Details with Insights */}
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900 flex items-center gap-2">
                <Building className="w-4 h-4" />
                Customer Details ({item.customers.length})
              </h4>

              {item.customers.map((customerName, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium text-gray-900">{customerName}</span>
                    <div className="flex items-center gap-2">
                      {customerDetails[customerName] && (
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCreditRatingColor(customerDetails[customerName].creditRating)}`}>
                          {customerDetails[customerName].creditRating}
                        </span>
                      )}
                      <button
                        onClick={() => {/* Toggle customer details */}}
                        className="text-blue-600 hover:text-blue-800 text-xs"
                      >
                        View Details
                      </button>
                    </div>
                  </div>

                  {renderCustomerInsight(customerName)}
                </div>
              ))}
            </div>

            {/* Data Preservation Notice */}
            <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">Data Preservation Status</span>
              </div>
              <p className="text-xs text-blue-800">
                ✅ Original {item.type.replace('_', ' ')} data has been preserved in the respective tables for continued use,
                analysis, and other business purposes, even after submission for approval.
              </p>
            </div>

            {/* Forecast Details for Rolling Forecast Items */}
            {item.type === 'rolling_forecast' && item.forecastData && (
              <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-medium text-green-900 mb-3 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Forecast Analysis ({item.forecastData.length} items)
                </h4>

                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="bg-white rounded-lg p-3 border border-green-200">
                    <div className="text-sm text-green-700">Total Forecast Value</div>
                    <div className="text-lg font-bold text-green-800">
                      ${item.forecastData.reduce((sum, f) => sum + f.forecastValue, 0).toLocaleString()}
                    </div>
                  </div>
                  <div className="bg-white rounded-lg p-3 border border-green-200">
                    <div className="text-sm text-green-700">Total Forecast Units</div>
                    <div className="text-lg font-bold text-green-800">
                      {item.forecastData.reduce((sum, f) => sum + f.forecastUnits, 0).toLocaleString()}
                    </div>
                  </div>
                  <div className="bg-white rounded-lg p-3 border border-green-200">
                    <div className="text-sm text-green-700">Avg Unit Rate</div>
                    <div className="text-lg font-bold text-green-800">
                      ${(item.forecastData.reduce((sum, f) => sum + f.forecastValue, 0) /
                       Math.max(item.forecastData.reduce((sum, f) => sum + f.forecastUnits, 0), 1)
                      ).toFixed(2)}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h5 className="text-sm font-medium text-green-800">Per Customer Breakdown:</h5>
                  {Object.entries(
                    item.forecastData.reduce((acc, forecast) => {
                      if (!acc[forecast.customer]) {
                        acc[forecast.customer] = { units: 0, value: 0, items: 0 };
                      }
                      acc[forecast.customer].units += forecast.forecastUnits;
                      acc[forecast.customer].value += forecast.forecastValue;
                      acc[forecast.customer].items += 1;
                      return acc;
                    }, {} as Record<string, {units: number, value: number, items: number}>)
                  ).map(([customer, totals]) => (
                    <div key={customer} className="flex justify-between items-center p-2 bg-white rounded border border-green-200">
                      <div>
                        <span className="text-sm font-medium text-gray-900">{customer}</span>
                        <span className="ml-2 text-xs text-gray-500">({totals.items} items)</span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-green-700">{totals.units.toLocaleString()} units</div>
                        <div className="text-xs text-green-600">${totals.value.toLocaleString()}</div>
                        <div className="text-xs text-purple-600">Rate: ${(totals.value / Math.max(totals.units, 1)).toFixed(2)}/unit</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Budget Details for Sales Budget Items */}
            {item.type === 'sales_budget' && item.budgetData && (
              <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-3 flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  Budget Analysis ({item.budgetData.length} items)
                </h4>

                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="bg-white rounded-lg p-3 border border-blue-200">
                    <div className="text-sm text-blue-700">Total Budget Value</div>
                    <div className="text-lg font-bold text-blue-800">
                      ${item.budgetData.reduce((sum, b) => sum + b.totalBudget, 0).toLocaleString()}
                    </div>
                  </div>
                  <div className="bg-white rounded-lg p-3 border border-blue-200">
                    <div className="text-sm text-blue-700">Total Budget Units</div>
                    <div className="text-lg font-bold text-blue-800">
                      {item.budgetData.reduce((sum, b) =>
                        sum + b.monthlyData.reduce((mSum, m) => mSum + m.budgetValue, 0), 0
                      ).toLocaleString()}
                    </div>
                  </div>
                  <div className="bg-white rounded-lg p-3 border border-blue-200">
                    <div className="text-sm text-blue-700">Avg Unit Rate</div>
                    <div className="text-lg font-bold text-blue-800">
                      ${(item.budgetData.reduce((sum, b) => sum + b.totalBudget, 0) /
                       Math.max(item.budgetData.reduce((sum, b) => sum + b.monthlyData.reduce((mSum, m) => mSum + m.budgetValue, 0), 0), 1)
                      ).toFixed(2)}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h5 className="text-sm font-medium text-blue-800">Per Customer Breakdown:</h5>
                  {Object.entries(
                    item.budgetData.reduce((acc, budget) => {
                      if (!acc[budget.customer]) {
                        acc[budget.customer] = { budget: 0, units: 0, items: 0 };
                      }
                      acc[budget.customer].budget += budget.totalBudget;
                      acc[budget.customer].units += budget.monthlyData.reduce((sum, m) => sum + m.budgetValue, 0);
                      acc[budget.customer].items += 1;
                      return acc;
                    }, {} as Record<string, {budget: number, units: number, items: number}>)
                  ).map(([customer, totals]) => (
                    <div key={customer} className="flex justify-between items-center p-2 bg-white rounded border border-blue-200">
                      <div>
                        <span className="text-sm font-medium text-gray-900">{customer}</span>
                        <span className="ml-2 text-xs text-gray-500">({totals.items} items)</span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-blue-700">{totals.units.toLocaleString()} units</div>
                        <div className="text-xs text-blue-600">${totals.budget.toLocaleString()}</div>
                        <div className="text-xs text-purple-600">Rate: ${(totals.budget / Math.max(totals.units, 1)).toFixed(2)}/unit</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Comments Section */}
            {item.comments.length > 0 && (
              <div className="mt-4 border-t border-gray-200 pt-4">
                <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                  <MessageCircle className="w-4 h-4" />
                  Comments & Feedback ({item.comments.length})
                </h4>
                
                <div className="space-y-3 max-h-48 overflow-y-auto">
                  {item.comments.map((comment) => (
                    <div key={comment.id} className="bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-900">{comment.author}</span>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            comment.type === 'approval' ? 'bg-green-100 text-green-800' :
                            comment.type === 'rejection' ? 'bg-red-100 text-red-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {comment.type}
                          </span>
                        </div>
                        <span className="text-xs text-gray-500">
                          {new Date(comment.timestamp).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700">{comment.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Enhanced Action Panel */}
          <div className="flex flex-col gap-3 ml-6 min-w-[180px]">
            <button
              onClick={() => setSelectedItem(item) || setShowDetailModal(true)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Eye className="w-4 h-4" />
              Full Details
            </button>
            
            {item.currentState === 'submitted' && user?.role === 'manager' && (
              <>
                <button
                  onClick={() => handleQuickAction(item, 'approve')}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
                >
                  <CheckCircle className="w-4 h-4" />
                  Approve
                </button>
                <button
                  onClick={() => handleQuickAction(item, 'reject')}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
                >
                  <XCircle className="w-4 h-4" />
                  Reject
                </button>
              </>
            )}
            
            {item.currentState === 'approved' && user?.role === 'manager' && (
              <button
                onClick={() => handleQuickAction(item, 'send_to_supply')}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors"
              >
                <Truck className="w-4 h-4" />
                Send to Supply
              </button>
            )}

            {/* Risk Assessment */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <h5 className="text-xs font-medium text-yellow-800 mb-2">Risk Assessment</h5>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-yellow-700">Value:</span>
                  <span className={item.totalValue > 200000 ? 'text-red-600' : item.totalValue > 100000 ? 'text-yellow-600' : 'text-green-600'}>
                    {item.totalValue > 200000 ? 'High' : item.totalValue > 100000 ? 'Medium' : 'Low'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-yellow-700">Credit:</span>
                  <span className="text-green-600">Good</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <Layout>
      <div className="space-y-6">
        {/* Error Display */}
        {workflowError && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-5 w-5 text-red-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Workflow Data Error</h3>
                <div className="mt-2 text-sm text-red-700">{workflowError}</div>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Header with Department Context */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                🏢 Approval Center - {currentUserDepartment} Department
                {unreadNotifications.length > 0 && (
                  <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-sm">
                    {unreadNotifications.length} new
                  </span>
                )}
              </h1>
              <p className="text-gray-600 mt-1">
                Managing {getManagedSalesmen().length} salesmen | {filteredItems.length} items requiring attention
              </p>
              <p className="text-sm text-blue-600 mt-1 flex items-center gap-1">
                <Shield className="w-4 h-4" />
                All submitted data remains preserved in original tables for continued operations
              </p>
            </div>
          </div>

          {/* Enhanced Statistics Dashboard */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-1">
                <Package className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">Total Items</span>
              </div>
              <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
            </div>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="w-4 h-4 text-yellow-600" />
                <span className="text-sm font-medium text-yellow-900">Pending</span>
              </div>
              <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
            </div>
            
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-green-900">Approved</span>
              </div>
              <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
            </div>
            
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-1">
                <XCircle className="w-4 h-4 text-red-600" />
                <span className="text-sm font-medium text-red-900">Rejected</span>
              </div>
              <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
            </div>
            
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-1">
                <Truck className="w-4 h-4 text-purple-600" />
                <span className="text-sm font-medium text-purple-900">To Supply</span>
              </div>
              <p className="text-2xl font-bold text-purple-600">{stats.sentToSupplyChain}</p>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-1">
                <Target className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">Budget Value</span>
              </div>
              <p className="text-lg font-bold text-blue-600">${(stats.salesBudgetValue / 1000).toFixed(0)}K</p>
            </div>
            
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-green-900">Forecast Value</span>
              </div>
              <p className="text-lg font-bold text-green-600">${(stats.forecastValue / 1000).toFixed(0)}K</p>
            </div>
          </div>
        </div>

        {/* Enhanced Filters with Department Support */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search items, salesmen, customers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <select
                value={selectedFilter}
                onChange={(e) => setSelectedFilter(e.target.value as WorkflowState | 'all')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="submitted">Submitted</option>
                <option value="in_review">In Review</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="sent_to_supply_chain">Sent to Supply</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-gray-400" />
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value as 'all' | 'sales_budget' | 'rolling_forecast')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Types</option>
                <option value="sales_budget">Sales Budget</option>
                <option value="rolling_forecast">Rolling Forecast</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-400" />
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Years</option>
                {[2021, 2022, 2023, 2024, 2025].map(year => (
                  <option key={year} value={year.toString()}>{year}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-gray-400" />
              <select
                value={selectedSalesman}
                onChange={(e) => setSelectedSalesman(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Salesmen</option>
                {getManagedSalesmen().map(salesman => (
                  <option key={salesman} value={salesman}>{salesman}</option>
                ))}
              </select>
            </div>

            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedFilter('submitted');
                setSelectedType('all');
                setSelectedYear('all');
                setSelectedSalesman('all');
              }}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* GIT Overview for Managers */}
        <GitSummaryWidget userRole={user?.role} compact={true} />

        {/* Data Preservation Overview for Managers */}
        {user?.role === 'manager' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-600" />
              Data Preservation Overview
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <DataPreservationIndicator
                itemsCount={DataPersistenceManager.getSalesBudgetData().length}
                submittedCount={DataPersistenceManager.getSubmittedSalesBudgetData().length}
                preservedCount={DataPersistenceManager.getOriginalSalesBudgetData().length}
                dataType="budget"
                compact={false}
              />

              <DataPreservationIndicator
                itemsCount={DataPersistenceManager.getRollingForecastData().length}
                submittedCount={DataPersistenceManager.getSubmittedRollingForecastData().length}
                preservedCount={DataPersistenceManager.getOriginalRollingForecastData().length}
                dataType="forecast"
                compact={false}
              />
            </div>

            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-green-900 mb-1">Manager Benefits</h4>
                  <p className="text-sm text-green-800">
                    As a manager, you can review submissions while knowing that salesmen retain access to their original data
                    for ongoing operations, reporting, and business continuity.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Manager Workflow */}
        <ManagerApprovalWorkflow
          items={filteredItems}
          onApprove={(item) => handleQuickAction(item, 'approve')}
          onReject={(item) => handleQuickAction(item, 'reject')}
          onSendToSupply={(item) => handleQuickAction(item, 'send_to_supply')}
          onViewDetails={(item) => {
            setSelectedItem(item);
            setShowDetailModal(true);
          }}
        />

        {/* Fallback: Original detailed view for complex analysis */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Detailed Analysis View</h3>
            <button
              onClick={() => {
                const detailedSection = document.getElementById('detailed-analysis');
                if (detailedSection) {
                  detailedSection.style.display = detailedSection.style.display === 'none' ? 'block' : 'none';
                }
              }}
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              Toggle Detailed View
            </button>
          </div>

          <div id="detailed-analysis" style={{display: 'none'}}>
            {/* Workflow Items - Separated by Type */}
            {selectedType === 'all' || selectedType === 'sales_budget' ? (
              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-3">
                  <Target className="w-6 h-6 text-blue-600" />
                  <h2 className="text-xl font-bold text-gray-900">Sales Budget Submissions</h2>
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                    {salesBudgetItems.length} items
                  </span>
                </div>

                <div className="space-y-4">
                  {salesBudgetItems.map(renderItemCard)}
                </div>
              </div>
            ) : null}

            {selectedType === 'all' || selectedType === 'rolling_forecast' ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                  <h2 className="text-xl font-bold text-gray-900">Rolling Forecast Submissions</h2>
                  <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                    {forecastItems.length} items
                  </span>
                </div>

                <div className="space-y-4">
                  {forecastItems.map(renderItemCard)}
                </div>
              </div>
            ) : null}
          </div>
        </div>

        {/* Empty State */}
        {filteredItems.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="text-gray-500 text-lg mb-2">No items found</div>
            <div className="text-gray-400 text-sm">
              {searchTerm || selectedFilter !== 'all' || selectedType !== 'all' ? 
                'Try adjusting your search criteria or filters' : 
                'No workflow items have been submitted yet'
              }
            </div>
          </div>
        )}
      </div>

      {/* Quick Approval Modal */}
      {showApprovalModal && selectedItemForAction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                {approvalAction === 'approve' ? 'Approve Item' : 
                 approvalAction === 'reject' ? 'Reject Item' : 'Send to Supply Chain'}
              </h3>
              
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">Item: {selectedItemForAction.title}</p>
                <p className="text-sm text-gray-600">Submitted by: {selectedItemForAction.createdBy}</p>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Comment (optional)
                </label>
                <textarea
                  value={approvalComment}
                  onChange={(e) => setApprovalComment(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder={`Add a comment for ${approvalAction}...`}
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleApprovalSubmit}
                  className={`flex-1 px-4 py-2 text-white font-medium rounded-md transition-colors ${
                    approvalAction === 'approve' ? 'bg-green-600 hover:bg-green-700' :
                    approvalAction === 'reject' ? 'bg-red-600 hover:bg-red-700' :
                    'bg-purple-600 hover:bg-purple-700'
                  }`}
                >
                  Confirm {approvalAction === 'approve' ? 'Approval' : 
                            approvalAction === 'reject' ? 'Rejection' : 'Send to Supply'}
                </button>
                <button
                  onClick={() => setShowApprovalModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 font-medium rounded-md hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedItem && (
        <WorkflowItemDetailModal
          item={selectedItem}
          isOpen={showDetailModal}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedItem(null);
          }}
        />
      )}
    </Layout>
  );
};

export default ApprovalCenter;
