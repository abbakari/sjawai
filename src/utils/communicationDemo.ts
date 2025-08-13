interface CommunicationMessage {
  id: string;
  fromUserId: string;
  fromUserName: string;
  fromUserRole: 'admin' | 'salesman' | 'manager' | 'supply_chain';
  toUserId: string;
  toUserName: string;
  toUserRole: 'admin' | 'salesman' | 'manager' | 'supply_chain';
  subject: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  priority: 'low' | 'medium' | 'high' | 'critical';
  category: 'stock_request' | 'budget_approval' | 'forecast_inquiry' | 'supply_chain' | 'general' | 'system_alert';
  replyToId?: string;
  status: 'pending' | 'responded' | 'resolved' | 'escalated';
}

export const initializeCommunicationDemo = () => {
  const existingMessages = localStorage.getItem('admin_communication_messages');
  
  if (!existingMessages) {
    const demoMessages: CommunicationMessage[] = [];

    localStorage.setItem('admin_communication_messages', JSON.stringify(demoMessages));
    console.log('Communication system initialized with empty data');
    return true;
  }
  
  return false;
};

export const getCommunicationStats = () => {
  try {
    const messages = JSON.parse(localStorage.getItem('admin_communication_messages') || '[]');
    
    return {
      totalMessages: messages.length,
      unreadMessages: messages.filter((m: CommunicationMessage) => !m.isRead).length,
      pendingMessages: messages.filter((m: CommunicationMessage) => m.status === 'pending').length,
      byCategory: {
        stock_request: messages.filter((m: CommunicationMessage) => m.category === 'stock_request').length,
        budget_approval: messages.filter((m: CommunicationMessage) => m.category === 'budget_approval').length,
        forecast_inquiry: messages.filter((m: CommunicationMessage) => m.category === 'forecast_inquiry').length,
        supply_chain: messages.filter((m: CommunicationMessage) => m.category === 'supply_chain').length,
        general: messages.filter((m: CommunicationMessage) => m.category === 'general').length
      },
      byPriority: {
        critical: messages.filter((m: CommunicationMessage) => m.priority === 'critical').length,
        high: messages.filter((m: CommunicationMessage) => m.priority === 'high').length,
        medium: messages.filter((m: CommunicationMessage) => m.priority === 'medium').length,
        low: messages.filter((m: CommunicationMessage) => m.priority === 'low').length
      }
    };
  } catch (error) {
    console.error('Error getting communication stats:', error);
    return null;
  }
};
