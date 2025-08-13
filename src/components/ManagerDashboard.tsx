import React, { useState, useEffect } from 'react';
import {
  Users,
  Target,
  TrendingUp,
  BarChart3,
  Eye,
  MessageSquare,
  CheckCircle,
  XCircle,
  Clock,
  Star,
  Building,
  User,
  Phone,
  Mail,
  MapPin,
  CreditCard,
  Calendar,
  DollarSign,
  Package,
  Filter,
  Search
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useBudget } from '../contexts/BudgetContext';
import { useWorkflow } from '../contexts/WorkflowContext';
import { formatDateTimeForDisplay, getTimeAgo } from '../utils/timeUtils';

interface CustomerSalesmanData {
  customer: {
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
    recentOrders: number;
    avgOrderValue: number;
  };
  salesman: {
    name: string;
    email: string;
    department: string;
    performance: {
      totalBudgets: number;
      totalForecasts: number;
      approvalRate: number;
      avgResponseTime: number;
    };
  };
  budgets: any[];
  forecasts: any[];
  totalValue: number;
  status: 'active' | 'pending' | 'needs_attention';
}

interface ManagerDashboardProps {
  isOpen: boolean;
  onClose: () => void;
}

const ManagerDashboard: React.FC<ManagerDashboardProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const { yearlyBudgets } = useBudget();
  const { workflowItems } = useWorkflow();
  const [activeTab, setActiveTab] = useState<'overview' | 'customers' | 'salesmen' | 'approvals'>('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedCustomer, setSelectedCustomer] = useState<string | null>(null);

  // Sample customer-salesman mapping data
  const [customerSalesmanData, setCustomerSalesmanData] = useState<CustomerSalesmanData[]>([
    {
      customer: {
        id: 'cust_001',
        name: 'Action Aid International (Tz)',
        code: 'AAI001',
        email: 'procurement@actionaid.tz',
        phone: '+255-22-123-4567',
        region: 'East Africa',
        segment: 'NGO',
        creditLimit: 500000,
        outstandingBalance: 75000,
        creditRating: 'A+',
        recentOrders: 15,
        avgOrderValue: 28500
      },
      salesman: {
        name: 'John Salesman',
        email: 'john.salesman@company.com',
        department: 'Sales',
        performance: {
          totalBudgets: 12,
          totalForecasts: 8,
          approvalRate: 85,
          avgResponseTime: 24
        }
      },
      budgets: yearlyBudgets.filter(b => b.customer.includes('Action Aid') && b.createdBy === 'John Salesman'),
      forecasts: workflowItems.filter(w => w.type === 'rolling_forecast' && w.customers.includes('Action Aid International (Tz)') && w.createdBy === 'John Salesman'),
      totalValue: 285000,
      status: 'active'
    },
    {
      customer: {
        id: 'cust_002',
        name: 'ADVENT CONSTRUCTION LTD.',
        code: 'ADV002',
        email: 'orders@advent.com',
        phone: '+1-555-0101',
        region: 'North America',
        segment: 'Enterprise',
        creditLimit: 750000,
        outstandingBalance: 125000,
        creditRating: 'A',
        recentOrders: 8,
        avgOrderValue: 85000
      },
      salesman: {
        name: 'Sarah Johnson',
        email: 'sarah.johnson@company.com',
        department: 'Sales',
        performance: {
          totalBudgets: 18,
          totalForecasts: 12,
          approvalRate: 92,
          avgResponseTime: 18
        }
      },
      budgets: yearlyBudgets.filter(b => b.customer.includes('ADVENT') && b.createdBy === 'Sarah Johnson'),
      forecasts: workflowItems.filter(w => w.type === 'rolling_forecast' && w.customers.includes('ADVENT CONSTRUCTION LTD.') && w.createdBy === 'Sarah Johnson'),
      totalValue: 425000,
      status: 'active'
    },
    {
      customer: {
        id: 'cust_003',
        name: 'Oxfam Tanzania',
        code: 'OXF003',
        email: 'logistics@oxfam.tz',
        phone: '+255-22-456-7890',
        region: 'East Africa',
        segment: 'NGO',
        creditLimit: 400000,
        outstandingBalance: 45000,
        creditRating: 'A+',
        recentOrders: 12,
        avgOrderValue: 35000
      },
      salesman: {
        name: 'Mike Thompson',
        email: 'mike.thompson@company.com',
        department: 'Regional Sales',
        performance: {
          totalBudgets: 9,
          totalForecasts: 6,
          approvalRate: 78,
          avgResponseTime: 36
        }
      },
      budgets: [],
      forecasts: [],
      totalValue: 180000,
      status: 'needs_attention'
    }
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'needs_attention': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
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

  const filteredData = customerSalesmanData.filter(item => {
    const matchesSearch = item.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.salesman.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || item.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  // Calculate summary metrics
  const totalCustomers = customerSalesmanData.length;
  const activeSalesmen = [...new Set(customerSalesmanData.map(item => item.salesman.name))].length;
  const totalValue = customerSalesmanData.reduce((sum, item) => sum + item.totalValue, 0);
  const pendingApprovals = workflowItems.filter(item => item.currentState === 'submitted').length;
  const averagePerformance = customerSalesmanData.reduce((sum, item) => sum + item.salesman.performance.approvalRate, 0) / customerSalesmanData.length;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[9999] p-2 sm:p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-7xl h-[95vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b bg-gradient-to-r from-blue-50 to-purple-50 flex-shrink-0">
          <div className="flex-1">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
              👑 Manager Dashboard
              <span className="text-sm bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
                {user?.department} Department
              </span>
            </h2>
            <p className="text-gray-600 text-sm sm:text-base mt-1">
              Customer-Salesman Relationship Management & Performance Overview
            </p>
          </div>
          
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
          >
            <XCircle className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>

        {/* Summary Metrics */}
        <div className="p-4 bg-gray-50 border-b flex-shrink-0">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-white rounded-lg p-3 border">
              <div className="flex items-center gap-2 mb-1">
                <Building className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">Customers</span>
              </div>
              <p className="text-xl font-bold text-blue-600">{totalCustomers}</p>
            </div>
            
            <div className="bg-white rounded-lg p-3 border">
              <div className="flex items-center gap-2 mb-1">
                <Users className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-green-900">Salesmen</span>
              </div>
              <p className="text-xl font-bold text-green-600">{activeSalesmen}</p>
            </div>
            
            <div className="bg-white rounded-lg p-3 border">
              <div className="flex items-center gap-2 mb-1">
                <DollarSign className="w-4 h-4 text-purple-600" />
                <span className="text-sm font-medium text-purple-900">Total Value</span>
              </div>
              <p className="text-lg font-bold text-purple-600">${(totalValue / 1000).toFixed(0)}K</p>
            </div>
            
            <div className="bg-white rounded-lg p-3 border">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="w-4 h-4 text-orange-600" />
                <span className="text-sm font-medium text-orange-900">Pending</span>
              </div>
              <p className="text-xl font-bold text-orange-600">{pendingApprovals}</p>
            </div>
            
            <div className="bg-white rounded-lg p-3 border">
              <div className="flex items-center gap-2 mb-1">
                <Star className="w-4 h-4 text-yellow-600" />
                <span className="text-sm font-medium text-yellow-900">Avg Performance</span>
              </div>
              <p className="text-xl font-bold text-yellow-600">{averagePerformance.toFixed(0)}%</p>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="p-4 bg-white border-b flex gap-4 flex-shrink-0">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search customers or salesmen..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="needs_attention">Needs Attention</option>
          </select>
        </div>

        {/* Customer-Salesman Cards */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredData.map((item) => (
              <div key={item.customer.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                {/* Customer Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">{item.customer.name}</h3>
                    <p className="text-sm text-gray-600">{item.customer.code} • {item.customer.segment}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCreditRatingColor(item.customer.creditRating)}`}>
                      {item.customer.creditRating}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(item.status)}`}>
                      {item.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                </div>

                {/* Customer Details */}
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Customer Information</h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3 h-3 text-gray-500" />
                      <span className="text-gray-600">{item.customer.region}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-3 h-3 text-gray-500" />
                      <span className="text-gray-600">{item.customer.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="w-3 h-3 text-gray-500" />
                      <span className="text-gray-600">{item.customer.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-3 h-3 text-gray-500" />
                      <span className="text-gray-600">${item.customer.creditLimit.toLocaleString()}</span>
                    </div>
                  </div>
                  
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <div className="grid grid-cols-3 gap-3 text-center">
                      <div>
                        <div className="text-xs text-gray-500">Recent Orders</div>
                        <div className="text-sm font-medium">{item.customer.recentOrders}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">Avg Order Value</div>
                        <div className="text-sm font-medium">${item.customer.avgOrderValue.toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">Outstanding</div>
                        <div className="text-sm font-medium text-orange-600">${item.customer.outstandingBalance.toLocaleString()}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Salesman Information */}
                <div className="bg-blue-50 rounded-lg p-4 mb-4">
                  <h4 className="text-sm font-medium text-blue-900 mb-3 flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Assigned Salesman
                  </h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-blue-900">{item.salesman.name}</span>
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">{item.salesman.department}</span>
                    </div>
                    <div className="text-sm text-blue-700">{item.salesman.email}</div>
                    
                    <div className="grid grid-cols-2 gap-3 mt-3 text-sm">
                      <div>
                        <span className="text-blue-600">Budgets:</span>
                        <span className="font-medium ml-1">{item.salesman.performance.totalBudgets}</span>
                      </div>
                      <div>
                        <span className="text-blue-600">Forecasts:</span>
                        <span className="font-medium ml-1">{item.salesman.performance.totalForecasts}</span>
                      </div>
                      <div>
                        <span className="text-blue-600">Approval Rate:</span>
                        <span className="font-medium ml-1">{item.salesman.performance.approvalRate}%</span>
                      </div>
                      <div>
                        <span className="text-blue-600">Response Time:</span>
                        <span className="font-medium ml-1">{item.salesman.performance.avgResponseTime}h</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Budget & Forecast Summary */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-green-50 rounded-lg p-3 text-center">
                    <div className="text-sm text-green-600 mb-1">Total Value</div>
                    <div className="text-lg font-bold text-green-700">${item.totalValue.toLocaleString()}</div>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-3 text-center">
                    <div className="text-sm text-purple-600 mb-1">Active Items</div>
                    <div className="text-lg font-bold text-purple-700">{item.budgets.length + item.forecasts.length}</div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <button
                    className="flex-1 bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                    onClick={() => {
                      const details = [
                        `Customer: ${item.customer.name}`,
                        `Code: ${item.customer.code}`,
                        `Region: ${item.customer.region}`,
                        `Segment: ${item.customer.segment}`,
                        `Credit Limit: $${item.customer.creditLimit.toLocaleString()}`,
                        `Outstanding: $${item.customer.outstandingBalance.toLocaleString()}`,
                        `Credit Rating: ${item.customer.creditRating}`,
                        `Recent Orders: ${item.customer.recentOrders}`,
                        `Avg Order Value: $${item.customer.avgOrderValue.toLocaleString()}`,
                        `\nAssigned Salesman: ${item.salesman.name}`,
                        `Department: ${item.salesman.department}`,
                        `Email: ${item.salesman.email}`,
                        `Approval Rate: ${item.salesman.performance.approvalRate}%`,
                        `Avg Response Time: ${item.salesman.performance.avgResponseTime}h`,
                        `\nBusiness Metrics:`,
                        `Total Budgets: ${item.salesman.performance.totalBudgets}`,
                        `Total Forecasts: ${item.salesman.performance.totalForecasts}`,
                        `Total Value: $${item.totalValue.toLocaleString()}`,
                        `Status: ${item.status.replace('_', ' ').toUpperCase()}`
                      ];
                      alert(`Detailed Information:\n\n${details.join('\n')}`);
                    }}
                  >
                    <Eye className="w-4 h-4" />
                    View Details
                  </button>
                  <button
                    className="flex-1 bg-green-600 text-white px-3 py-2 rounded text-sm hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                    onClick={() => {
                      const contactInfo = [
                        `Contacting: ${item.salesman.name}`,
                        `Email: ${item.salesman.email}`,
                        `Department: ${item.salesman.department}`,
                        `\nRegarding Customer: ${item.customer.name}`,
                        `Customer Email: ${item.customer.email}`,
                        `Customer Phone: ${item.customer.phone}`,
                        `\nCurrent Status: ${item.status.replace('_', ' ').toUpperCase()}`,
                        `\nThis would normally:`,
                        `- Send email notification to ${item.salesman.name}`,
                        `- Create follow-up task`,
                        `- Log interaction in CRM`,
                        `- Schedule follow-up reminder`
                      ];
                      alert(contactInfo.join('\n'));
                    }}
                  >
                    <MessageSquare className="w-4 h-4" />
                    Contact
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagerDashboard;
