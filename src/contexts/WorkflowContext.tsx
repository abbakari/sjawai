import React, { createContext, useContext, useState, ReactNode } from 'react';
import { YearlyBudgetData } from './BudgetContext';

export type WorkflowState = 'draft' | 'submitted' | 'in_review' | 'approved' | 'rejected' | 'sent_to_supply_chain';
export type WorkflowType = 'sales_budget' | 'rolling_forecast';

export interface WorkflowComment {
  id: string;
  author: string;
  authorRole: string;
  message: string;
  timestamp: string;
  type: 'comment' | 'approval' | 'rejection' | 'request_changes';
  isFollowBack?: boolean;
}

export interface WorkflowNotification {
  id: string;
  recipientId: string;
  recipientRole: string;
  fromUser: string;
  fromRole: string;
  title: string;
  message: string;
  workflowItemId: string;
  type: 'approval' | 'rejection' | 'comment' | 'follow_back' | 'supply_chain_request';
  timestamp: string;
  read: boolean;
}

export interface ForecastData {
  id: string;
  customer: string;
  item: string;
  category: string;
  brand: string;
  year: string;
  quarter?: string;
  month?: string;
  forecastUnits: number;
  forecastValue: number;
  actualUnits?: number;
  actualValue?: number;
  variance?: number;
  createdBy: string;
  createdAt: string;
}

export interface WorkflowItem {
  id: string;
  type: WorkflowType;
  title: string;
  description?: string;
  createdBy: string;
  createdByRole: string;
  currentState: WorkflowState;
  submittedAt?: string;
  reviewedAt?: string;
  reviewedBy?: string;
  approvedBy?: string;
  approvedAt?: string;
  rejectedBy?: string;
  rejectedAt?: string;
  sentToSupplyChainAt?: string;
  comments: WorkflowComment[];
  budgetData?: YearlyBudgetData[];
  forecastData?: ForecastData[];
  customers: string[];
  totalValue: number;
  year: string;
  priority: 'low' | 'medium' | 'high';
}

export interface WorkflowContextType {
  workflowItems: WorkflowItem[];
  notifications: WorkflowNotification[];
  submitForApproval: (budgetData: YearlyBudgetData[], forecastData?: ForecastData[]) => string;
  approveItem: (itemId: string, comment: string, managerId: string) => void;
  rejectItem: (itemId: string, comment: string, managerId: string) => void;
  addComment: (itemId: string, comment: string, userId: string, userRole: string, isFollowBack?: boolean) => void;
  sendToSupplyChain: (itemId: string, managerId: string) => void;
  getItemsByState: (state: WorkflowState) => WorkflowItem[];
  getItemsBySalesman: (salesmanName: string) => WorkflowItem[];
  getItemsByYear: (year: string) => WorkflowItem[];
  getNotificationsForUser: (userId: string, role: string) => WorkflowNotification[];
  markNotificationAsRead: (notificationId: string) => void;
  getItemDetails: (itemId: string) => WorkflowItem | undefined;
}

const WorkflowContext = createContext<WorkflowContextType | undefined>(undefined);

export const useWorkflow = () => {
  const context = useContext(WorkflowContext);
  if (context === undefined) {
    throw new Error('useWorkflow must be used within a WorkflowProvider');
  }
  return context;
};

interface WorkflowProviderProps {
  children: ReactNode;
}

export const WorkflowProvider: React.FC<WorkflowProviderProps> = ({ children }) => {
  const [workflowItems, setWorkflowItems] = useState<WorkflowItem[]>([]);

  const [notifications, setNotifications] = useState<WorkflowNotification[]>([]);

  const generateYears = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let year = 2021; year <= currentYear + 1; year++) {
      years.push(year.toString());
    }
    return years;
  };

  const submitForApproval = (budgetData: YearlyBudgetData[], forecastData?: ForecastData[]) => {
    const id = `wf_${Date.now()}`;
    const year = budgetData[0]?.year || new Date().getFullYear().toString();
    const customers = [...new Set([...budgetData.map(b => b.customer), ...(forecastData?.map(f => f.customer) || [])])];
    const totalValue = budgetData.reduce((sum, b) => sum + b.totalBudget, 0) +
                      (forecastData?.reduce((sum, f) => sum + f.forecastValue, 0) || 0);

    const newItem: WorkflowItem = {
      id,
      type: forecastData && forecastData.length > 0 ? 'rolling_forecast' : 'sales_budget',
      title: `${year} ${forecastData ? 'Forecast' : 'Budget'} - ${customers.join(', ')}`,
      description: `Submitted for manager approval - Original data preserved in tables for other purposes`,
      createdBy: budgetData[0]?.createdBy || 'Unknown',
      createdByRole: 'salesman',
      currentState: 'submitted',
      submittedAt: new Date().toISOString(),
      customers,
      totalValue,
      year,
      priority: totalValue > 200000 ? 'high' : totalValue > 100000 ? 'medium' : 'low',
      comments: [
        {
          id: `c_${Date.now()}`,
          author: budgetData[0]?.createdBy || 'System',
          authorRole: 'salesman',
          message: 'Data submitted for approval. Original data remains available in sales budget and rolling forecast tables for continued use and other purposes.',
          timestamp: new Date().toISOString(),
          type: 'comment'
        }
      ],
      budgetData,
      forecastData
    };

    setWorkflowItems(prev => [...prev, newItem]);

    console.log(`Workflow ${id} created. Original data preserved in tables for other purposes.`);
    return id;
  };

  const approveItem = (itemId: string, comment: string, managerId: string) => {
    setWorkflowItems(prev => prev.map(item => {
      if (item.id === itemId) {
        const approvalComment: WorkflowComment = {
          id: `c_${Date.now()}`,
          author: managerId,
          authorRole: 'manager',
          message: comment,
          timestamp: new Date().toISOString(),
          type: 'approval'
        };

        // Create notification for salesman
        const notification: WorkflowNotification = {
          id: `n_${Date.now()}`,
          recipientId: item.createdBy,
          recipientRole: 'salesman',
          fromUser: managerId,
          fromRole: 'manager',
          title: `Your ${item.type.replace('_', ' ')} has been approved`,
          message: `${comment} Note: Your original data remains available in the tables for continued use.`,
          workflowItemId: itemId,
          type: 'approval',
          timestamp: new Date().toISOString(),
          read: false
        };

        setNotifications(prev => [...prev, notification]);

        return {
          ...item,
          currentState: 'approved' as WorkflowState,
          approvedBy: managerId,
          approvedAt: new Date().toISOString(),
          comments: [...item.comments, approvalComment]
        };
      }
      return item;
    }));
  };

  const rejectItem = (itemId: string, comment: string, managerId: string) => {
    setWorkflowItems(prev => prev.map(item => {
      if (item.id === itemId) {
        const rejectionComment: WorkflowComment = {
          id: `c_${Date.now()}`,
          author: managerId,
          authorRole: 'manager',
          message: comment,
          timestamp: new Date().toISOString(),
          type: 'rejection'
        };

        // Create notification for salesman
        const notification: WorkflowNotification = {
          id: `n_${Date.now()}`,
          recipientId: item.createdBy,
          recipientRole: 'salesman',
          fromUser: managerId,
          fromRole: 'manager',
          title: `Your ${item.type.replace('_', ' ')} has been rejected`,
          message: `${comment} Your original data remains available in the tables for revision and resubmission.`,
          workflowItemId: itemId,
          type: 'rejection',
          timestamp: new Date().toISOString(),
          read: false
        };

        setNotifications(prev => [...prev, notification]);

        return {
          ...item,
          currentState: 'rejected' as WorkflowState,
          rejectedBy: managerId,
          rejectedAt: new Date().toISOString(),
          comments: [...item.comments, rejectionComment]
        };
      }
      return item;
    }));
  };

  const addComment = (itemId: string, comment: string, userId: string, userRole: string, isFollowBack?: boolean) => {
    setWorkflowItems(prev => prev.map(item => {
      if (item.id === itemId) {
        const newComment: WorkflowComment = {
          id: `c_${Date.now()}`,
          author: userId,
          authorRole: userRole,
          message: comment,
          timestamp: new Date().toISOString(),
          type: 'comment',
          isFollowBack
        };

        // Create notification for the other party
        const recipientRole = userRole === 'salesman' ? 'manager' : 'salesman';
        const recipientId = userRole === 'salesman' ? (item.approvedBy || item.rejectedBy || 'Manager') : item.createdBy;

        const notification: WorkflowNotification = {
          id: `n_${Date.now()}`,
          recipientId: recipientId!,
          recipientRole,
          fromUser: userId,
          fromRole: userRole,
          title: `New ${isFollowBack ? 'follow-back' : 'comment'} on ${item.title}`,
          message: comment,
          workflowItemId: itemId,
          type: isFollowBack ? 'follow_back' : 'comment',
          timestamp: new Date().toISOString(),
          read: false
        };

        setNotifications(prev => [...prev, notification]);

        return {
          ...item,
          comments: [...item.comments, newComment]
        };
      }
      return item;
    }));
  };

  const sendToSupplyChain = (itemId: string, managerId: string) => {
    setWorkflowItems(prev => prev.map(item => {
      if (item.id === itemId) {
        // Create notification for supply chain
        const notification: WorkflowNotification = {
          id: `n_${Date.now()}`,
          recipientId: 'Supply Chain Team',
          recipientRole: 'supply_chain',
          fromUser: managerId,
          fromRole: 'manager',
          title: `New approved item for supply chain processing`,
          message: `Approved ${item.type.replace('_', ' ')}: ${item.title}`,
          workflowItemId: itemId,
          type: 'supply_chain_request',
          timestamp: new Date().toISOString(),
          read: false
        };

        setNotifications(prev => [...prev, notification]);

        return {
          ...item,
          currentState: 'sent_to_supply_chain' as WorkflowState,
          sentToSupplyChainAt: new Date().toISOString()
        };
      }
      return item;
    }));
  };

  const getItemsByState = (state: WorkflowState) => {
    return workflowItems.filter(item => item.currentState === state);
  };

  const getItemsBySalesman = (salesmanName: string) => {
    return workflowItems.filter(item => item.createdBy === salesmanName);
  };

  const getItemsByYear = (year: string) => {
    return workflowItems.filter(item => item.year === year);
  };

  const getNotificationsForUser = (userId: string, role: string) => {
    return notifications.filter(notification => 
      notification.recipientId === userId || notification.recipientRole === role
    ).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  };

  const markNotificationAsRead = (notificationId: string) => {
    setNotifications(prev => prev.map(notification =>
      notification.id === notificationId ? { ...notification, read: true } : notification
    ));
  };

  const getItemDetails = (itemId: string) => {
    return workflowItems.find(item => item.id === itemId);
  };

  const value: WorkflowContextType = {
    workflowItems,
    notifications,
    submitForApproval,
    approveItem,
    rejectItem,
    addComment,
    sendToSupplyChain,
    getItemsByState,
    getItemsBySalesman,
    getItemsByYear,
    getNotificationsForUser,
    markNotificationAsRead,
    getItemDetails
  };

  return (
    <WorkflowContext.Provider value={value}>
      {children}
    </WorkflowContext.Provider>
  );
};
