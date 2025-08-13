import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { YearlyBudgetData } from './BudgetContext';
import { supabase, isSupabaseConfigured, handleSupabaseError, TABLES } from '../lib/supabase';
import { useAuth } from './AuthContext';

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
  isLoading: boolean;
  error: string | null;
  submitForApproval: (budgetData: YearlyBudgetData[], forecastData?: ForecastData[]) => Promise<string>;
  approveItem: (itemId: string, comment: string, managerId: string) => Promise<void>;
  rejectItem: (itemId: string, comment: string, managerId: string) => Promise<void>;
  addComment: (itemId: string, comment: string, userId: string, userRole: string, isFollowBack?: boolean) => Promise<void>;
  sendToSupplyChain: (itemId: string, managerId: string) => Promise<void>;
  getItemsByState: (state: WorkflowState) => WorkflowItem[];
  getItemsBySalesman: (salesmanName: string) => WorkflowItem[];
  getItemsByYear: (year: string) => WorkflowItem[];
  getNotificationsForUser: (userId: string, role: string) => WorkflowNotification[];
  markNotificationAsRead: (notificationId: string) => Promise<void>;
  getItemDetails: (itemId: string) => WorkflowItem | undefined;
  refreshWorkflowData: () => Promise<void>;
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
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // Convert database row to WorkflowItem
  const convertDatabaseToWorkflowItem = (row: any): WorkflowItem => {
    const comments = row.workflow_comments?.map((comment: any) => ({
      id: comment.id,
      author: comment.author,
      authorRole: comment.author_role,
      message: comment.message,
      timestamp: comment.created_at,
      type: comment.type,
      isFollowBack: comment.is_follow_back
    })) || [];

    return {
      id: row.id,
      type: row.type,
      title: row.title,
      description: row.description,
      createdBy: row.created_by,
      createdByRole: row.created_by_role,
      currentState: row.current_state,
      submittedAt: row.submitted_at,
      reviewedAt: row.reviewed_at,
      reviewedBy: row.reviewed_by,
      approvedBy: row.approved_by,
      approvedAt: row.approved_at,
      rejectedBy: row.rejected_by,
      rejectedAt: row.rejected_at,
      sentToSupplyChainAt: row.sent_to_supply_chain_at,
      comments,
      budgetData: row.budget_data || [],
      forecastData: row.forecast_data || [],
      customers: row.customers || [],
      totalValue: parseFloat(row.total_value) || 0,
      year: row.year,
      priority: row.priority
    };
  };

  // Convert database row to WorkflowNotification
  const convertDatabaseToNotification = (row: any): WorkflowNotification => ({
    id: row.id,
    recipientId: row.recipient_id,
    recipientRole: row.recipient_role,
    fromUser: row.from_user,
    fromRole: row.from_role,
    title: row.title,
    message: row.message,
    workflowItemId: row.workflow_item_id,
    type: row.type,
    timestamp: row.created_at,
    read: row.is_read
  });

  // Load workflow data from Supabase
  const loadWorkflowData = async () => {
    if (!isSupabaseConfigured() || !user) return;

    setIsLoading(true);
    setError(null);

    try {
      // Load workflow items with comments
      const { data: workflowData, error: workflowError } = await supabase
        .from(TABLES.WORKFLOW_ITEMS)
        .select(`
          *,
          workflow_comments (*)
        `)
        .order('created_at', { ascending: false });

      if (workflowError) throw workflowError;

      // Load notifications
      const { data: notificationData, error: notificationError } = await supabase
        .from(TABLES.WORKFLOW_NOTIFICATIONS)
        .select('*')
        .order('created_at', { ascending: false });

      if (notificationError) throw notificationError;

      // Convert and set data
      setWorkflowItems(workflowData?.map(convertDatabaseToWorkflowItem) || []);
      setNotifications(notificationData?.map(convertDatabaseToNotification) || []);

    } catch (err: any) {
      const errorMessage = `Failed to load workflow data: ${err?.message || err || 'Unknown error'}`;
      setError(errorMessage);
      console.error('Error loading workflow data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Load data when user changes
  useEffect(() => {
    if (user) {
      loadWorkflowData();
    } else {
      setWorkflowItems([]);
      setNotifications([]);
    }
  }, [user]);

  const submitForApproval = async (budgetData: YearlyBudgetData[], forecastData?: ForecastData[]): Promise<string> => {
    if (!user) throw new Error('User must be logged in');

    const year = budgetData[0]?.year || new Date().getFullYear().toString();
    const customers = [...new Set([...budgetData.map(b => b.customer), ...(forecastData?.map(f => f.customer) || [])])];
    const totalValue = budgetData.reduce((sum, b) => sum + b.totalBudget, 0) +
                      (forecastData?.reduce((sum, f) => sum + f.forecastValue, 0) || 0);

    if (!isSupabaseConfigured()) {
      // Fallback for development
      const id = `wf_${Date.now()}`;
      const newItem: WorkflowItem = {
        id,
        type: forecastData && forecastData.length > 0 ? 'rolling_forecast' : 'sales_budget',
        title: `${year} ${forecastData ? 'Forecast' : 'Budget'} - ${customers.join(', ')}`,
        description: `Submitted for manager approval`,
        createdBy: budgetData[0]?.createdBy || 'Unknown',
        createdByRole: 'salesman',
        currentState: 'submitted',
        submittedAt: new Date().toISOString(),
        customers,
        totalValue,
        year,
        priority: totalValue > 200000 ? 'high' : totalValue > 100000 ? 'medium' : 'low',
        comments: [{
          id: `c_${Date.now()}`,
          author: budgetData[0]?.createdBy || 'System',
          authorRole: 'salesman',
          message: 'Data submitted for approval.',
          timestamp: new Date().toISOString(),
          type: 'comment'
        }],
        budgetData,
        forecastData
      };

      setWorkflowItems(prev => [...prev, newItem]);
      return id;
    }

    try {
      // Insert workflow item
      const { data: workflowData, error: workflowError } = await supabase
        .from(TABLES.WORKFLOW_ITEMS)
        .insert({
          type: forecastData && forecastData.length > 0 ? 'rolling_forecast' : 'sales_budget',
          title: `${year} ${forecastData ? 'Forecast' : 'Budget'} - ${customers.join(', ')}`,
          description: `Submitted for manager approval`,
          created_by: user.id,
          created_by_role: 'salesman',
          current_state: 'submitted',
          submitted_at: new Date().toISOString(),
          customers,
          total_value: totalValue,
          year,
          priority: totalValue > 200000 ? 'high' : totalValue > 100000 ? 'medium' : 'low',
          budget_data: budgetData,
          forecast_data: forecastData
        })
        .select()
        .single();

      if (workflowError) throw workflowError;

      // Add initial comment
      await supabase
        .from(TABLES.WORKFLOW_COMMENTS)
        .insert({
          workflow_item_id: workflowData.id,
          author: user.id,
          author_role: 'salesman',
          message: 'Data submitted for approval.',
          type: 'comment'
        });

      await loadWorkflowData();
      return workflowData.id;

    } catch (err: any) {
      handleSupabaseError(err, 'submit for approval');
      throw err;
    }
  };

  const approveItem = async (itemId: string, comment: string, managerId: string): Promise<void> => {
    if (!isSupabaseConfigured()) {
      // Fallback for development
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
      return;
    }

    try {
      // Update workflow item
      const { error: updateError } = await supabase
        .from(TABLES.WORKFLOW_ITEMS)
        .update({
          current_state: 'approved',
          approved_by: user?.id || managerId,
          approved_at: new Date().toISOString()
        })
        .eq('id', itemId);

      if (updateError) throw updateError;

      // Add approval comment
      await supabase
        .from(TABLES.WORKFLOW_COMMENTS)
        .insert({
          workflow_item_id: itemId,
          author: user?.id || managerId,
          author_role: 'manager',
          message: comment,
          type: 'approval'
        });

      // Create notification (if needed)
      // Implementation depends on notification requirements

      await loadWorkflowData();

    } catch (err: any) {
      handleSupabaseError(err, 'approve item');
      throw err;
    }
  };

  const rejectItem = async (itemId: string, comment: string, managerId: string): Promise<void> => {
    if (!isSupabaseConfigured()) {
      // Fallback for development
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
      return;
    }

    try {
      // Update workflow item
      const { error: updateError } = await supabase
        .from(TABLES.WORKFLOW_ITEMS)
        .update({
          current_state: 'rejected',
          rejected_by: user?.id || managerId,
          rejected_at: new Date().toISOString()
        })
        .eq('id', itemId);

      if (updateError) throw updateError;

      // Add rejection comment
      await supabase
        .from(TABLES.WORKFLOW_COMMENTS)
        .insert({
          workflow_item_id: itemId,
          author: user?.id || managerId,
          author_role: 'manager',
          message: comment,
          type: 'rejection'
        });

      await loadWorkflowData();

    } catch (err: any) {
      handleSupabaseError(err, 'reject item');
      throw err;
    }
  };

  const addComment = async (itemId: string, comment: string, userId: string, userRole: string, isFollowBack?: boolean): Promise<void> => {
    if (!isSupabaseConfigured()) {
      // Fallback for development
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

          return {
            ...item,
            comments: [...item.comments, newComment]
          };
        }
        return item;
      }));
      return;
    }

    try {
      await supabase
        .from(TABLES.WORKFLOW_COMMENTS)
        .insert({
          workflow_item_id: itemId,
          author: user?.id || userId,
          author_role: userRole,
          message: comment,
          type: 'comment',
          is_follow_back: isFollowBack || false
        });

      await loadWorkflowData();

    } catch (err: any) {
      handleSupabaseError(err, 'add comment');
      throw err;
    }
  };

  const sendToSupplyChain = async (itemId: string, managerId: string): Promise<void> => {
    if (!isSupabaseConfigured()) {
      // Fallback for development
      setWorkflowItems(prev => prev.map(item => {
        if (item.id === itemId) {
          return {
            ...item,
            currentState: 'sent_to_supply_chain' as WorkflowState,
            sentToSupplyChainAt: new Date().toISOString()
          };
        }
        return item;
      }));
      return;
    }

    try {
      const { error } = await supabase
        .from(TABLES.WORKFLOW_ITEMS)
        .update({
          current_state: 'sent_to_supply_chain',
          sent_to_supply_chain_at: new Date().toISOString()
        })
        .eq('id', itemId);

      if (error) throw error;
      await loadWorkflowData();

    } catch (err: any) {
      handleSupabaseError(err, 'send to supply chain');
      throw err;
    }
  };

  const getItemsByState = (state: WorkflowState): WorkflowItem[] => {
    return workflowItems.filter(item => item.currentState === state);
  };

  const getItemsBySalesman = (salesmanName: string): WorkflowItem[] => {
    return workflowItems.filter(item => item.createdBy === salesmanName);
  };

  const getItemsByYear = (year: string): WorkflowItem[] => {
    return workflowItems.filter(item => item.year === year);
  };

  const getNotificationsForUser = (userId: string, role: string): WorkflowNotification[] => {
    return notifications.filter(notification => 
      notification.recipientId === userId || notification.recipientRole === role
    ).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  };

  const markNotificationAsRead = async (notificationId: string): Promise<void> => {
    if (!isSupabaseConfigured()) {
      setNotifications(prev => prev.map(notification =>
        notification.id === notificationId ? { ...notification, read: true } : notification
      ));
      return;
    }

    try {
      const { error } = await supabase
        .from(TABLES.WORKFLOW_NOTIFICATIONS)
        .update({ is_read: true })
        .eq('id', notificationId);

      if (error) throw error;
      await loadWorkflowData();

    } catch (err: any) {
      handleSupabaseError(err, 'mark notification as read');
      throw err;
    }
  };

  const getItemDetails = (itemId: string): WorkflowItem | undefined => {
    return workflowItems.find(item => item.id === itemId);
  };

  const refreshWorkflowData = async (): Promise<void> => {
    await loadWorkflowData();
  };

  const value: WorkflowContextType = {
    workflowItems,
    notifications,
    isLoading,
    error,
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
    getItemDetails,
    refreshWorkflowData
  };

  return (
    <WorkflowContext.Provider value={value}>
      {children}
    </WorkflowContext.Provider>
  );
};
