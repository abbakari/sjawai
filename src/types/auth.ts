export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  permissions: Permission[];
  isActive: boolean;
  createdAt: string;
  lastLogin: string;
}

export type UserRole = 'admin' | 'salesman' | 'manager' | 'supply_chain';

export interface Permission {
  id: string;
  name: string;
  description: string;
  resource: string;
  action: string;
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  error: string | null;
}

// Role-based permissions
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  admin: [
    { id: '1', name: 'View All Dashboards', description: 'Access to all system dashboards', resource: 'dashboard', action: 'read' },
    { id: '2', name: 'Manage Users', description: 'Create, edit, and delete users', resource: 'users', action: 'manage' },
    { id: '3', name: 'View All Reports', description: 'Access to all reports and analytics', resource: 'reports', action: 'read' },
    { id: '4', name: 'System Settings', description: 'Configure system settings', resource: 'settings', action: 'manage' },
    { id: '5', name: 'Approve All', description: 'Approve all requests from any role', resource: 'approvals', action: 'manage' }
  ],
  salesman: [
    { id: '6', name: 'Create Sales Budget', description: 'Create and edit sales budgets', resource: 'sales_budget', action: 'create' },
    { id: '7', name: 'Submit for Approval', description: 'Submit budgets for manager approval', resource: 'approvals', action: 'submit' },
    { id: '8', name: 'Create Forecasts', description: 'Create rolling forecasts', resource: 'forecasts', action: 'create' },
    { id: '9', name: 'View Own Data', description: 'View own created budgets and forecasts', resource: 'own_data', action: 'read' },
    { id: '10', name: 'Customer Management', description: 'Manage customer relationships', resource: 'customers', action: 'manage' }
  ],
  manager: [
    { id: '11', name: 'Approve Sales Budgets', description: 'Review and approve sales budgets', resource: 'sales_budget', action: 'approve' },
    { id: '12', name: 'Approve Forecasts', description: 'Review and approve forecasts', resource: 'forecasts', action: 'approve' },
    { id: '13', name: 'Provide Feedback', description: 'Add comments and feedback', resource: 'feedback', action: 'create' },
    { id: '14', name: 'View Team Data', description: 'View all team member data', resource: 'team_data', action: 'read' },
    { id: '15', name: 'Send to Supply Chain', description: 'Forward approved items to supply chain', resource: 'supply_chain', action: 'forward' }
  ],
  supply_chain: [
    { id: '16', name: 'View Approved Budgets', description: 'View manager-approved budgets', resource: 'approved_budgets', action: 'read' },
    { id: '17', name: 'View Approved Forecasts', description: 'View manager-approved forecasts', resource: 'approved_forecasts', action: 'read' },
    { id: '18', name: 'Inventory Management', description: 'Manage inventory based on forecasts', resource: 'inventory', action: 'manage' },
    { id: '19', name: 'Supply Planning', description: 'Plan supply chain operations', resource: 'supply_planning', action: 'manage' },
    { id: '20', name: 'Customer Satisfaction', description: 'Monitor customer satisfaction metrics', resource: 'customer_satisfaction', action: 'read' }
  ]
};

// Dashboard configurations for each role
export const ROLE_DASHBOARDS: Record<UserRole, string[]> = {
  admin: ['Dashboard', 'SalesBudget', 'RollingForecast', 'UserManagement', 'DataSources', 'InventoryManagement', 'DistributionManagement', 'BiDashboard'],
  salesman: ['Dashboard', 'SalesBudget', 'RollingForecast'],
  manager: ['Dashboard', 'SalesBudget', 'RollingForecast', 'ApprovalCenter'],
  supply_chain: ['Dashboard', 'InventoryManagement', 'DistributionManagement', 'SupplyChainDashboard']
};

// Workflow states
export type WorkflowState = 'draft' | 'submitted' | 'approved' | 'rejected' | 'in_progress' | 'completed';

export interface WorkflowItem {
  id: string;
  type: 'sales_budget' | 'forecast';
  title: string;
  createdBy: string;
  createdByRole: UserRole;
  currentState: WorkflowState;
  submittedAt?: string;
  approvedBy?: string;
  approvedAt?: string;
  comments: WorkflowComment[];
  data: any;
}

export interface WorkflowComment {
  id: string;
  author: string;
  authorRole: UserRole;
  message: string;
  timestamp: string;
  type: 'comment' | 'approval' | 'rejection' | 'feedback';
}
