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
    const demoMessages: CommunicationMessage[] = [
      {
        id: '1',
        fromUserId: 'john_salesman',
        fromUserName: 'John Salesman',
        fromUserRole: 'salesman',
        toUserId: 'admin',
        toUserName: 'Admin',
        toUserRole: 'admin',
        subject: 'Urgent: Stock Request for BF Goodrich Tyres',
        message: `Hi Admin,

I need urgent stock replenishment for BF Goodrich tyres. Current situation:

- Current Stock: 7 units
- Customer orders pending: 25 units  
- Expected delivery date needed: Next week

This is affecting our ability to meet customer commitments. Please prioritize this request.

Best regards,
John`,
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        isRead: false,
        priority: 'high',
        category: 'stock_request',
        status: 'pending'
      },
      {
        id: '2',
        fromUserId: 'admin',
        fromUserName: 'Admin',
        fromUserRole: 'admin',
        toUserId: 'john_salesman',
        toUserName: 'John Salesman',
        toUserRole: 'salesman',
        subject: 'Re: Urgent: Stock Request for BF Goodrich Tyres',
        message: `Hi John,

I've reviewed your stock request. Here's the update:

✅ Action Taken:
- Updated BF Goodrich stock from 7 to 150 units
- This should cover your pending orders and provide buffer stock

📊 Details:
- New stock level: 150 units
- Reserved for your orders: 25 units
- Available for additional sales: 125 units

The stock update is now live in your system. You can proceed with your customer deliveries.

Best regards,
Admin`,
        timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
        isRead: false,
        priority: 'high',
        category: 'stock_request',
        replyToId: '1',
        status: 'responded'
      },
      {
        id: '3',
        fromUserId: 'sarah_manager',
        fromUserName: 'Sarah Manager',
        fromUserRole: 'manager',
        toUserId: 'admin',
        toUserName: 'Admin',
        toUserRole: 'admin',
        subject: 'Budget Approval Request - Q1 2026',
        message: `Hello Admin,

Please review and approve the following budget submissions:

📋 Summary:
- Total submissions: 15 budgets
- Total value: $2.5M
- Submitted by: 8 salesmen
- Review period: Q1 2026

🔍 Key highlights:
- BF Goodrich products: $800K (32%)
- Michelin products: $650K (26%)  
- Accessories: $1.05M (42%)

All budgets have been reviewed and approved at manager level. Awaiting final admin approval for implementation.

Time-sensitive: Customer commitments are pending these approvals.

Best regards,
Sarah`,
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        isRead: false,
        priority: 'medium',
        category: 'budget_approval',
        status: 'pending'
      },
      {
        id: '4',
        fromUserId: 'mike_supply',
        fromUserName: 'Mike Supply Chain',
        fromUserRole: 'supply_chain',
        toUserId: 'admin',
        toUserName: 'Admin',
        toUserRole: 'admin',
        subject: 'Delivery Update - Michelin Shipment',
        message: `Hi Admin,

Update on incoming Michelin tyre shipment:

🚛 Shipment Details:
- Product: Michelin LTX Trail series
- Quantity: 500 units
- Original ETA: March 12th
- Revised ETA: March 15th (3-day delay)

📍 Current Status:
- Location: In transit from supplier
- Customs clearance: Completed
- Expected arrival: March 15th, 10 AM

⚠️ Impact:
- Affects 3 pending customer orders
- Recommended to update GIT system with new ETA

Please update the system accordingly and notify affected sales teams.

Best regards,
Mike`,
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        isRead: true,
        priority: 'medium',
        category: 'supply_chain',
        status: 'responded'
      },
      {
        id: '5',
        fromUserId: 'jane_salesman',
        fromUserName: 'Jane Salesman',
        fromUserRole: 'salesman',
        toUserId: 'sarah_manager',
        toUserName: 'Sarah Manager',
        toUserRole: 'manager',
        subject: 'Forecast Clarification - Action Aid Account',
        message: `Hi Sarah,

I need clarification on the rolling forecast for Action Aid International:

❓ Questions:
1. Should I include the new product line (Valve accessories) in Q2 forecast?
2. Customer mentioned potential 30% volume increase - how should I factor this?
3. Current budget allocation seems conservative - can we adjust?

📊 Current Status:
- Q1 Actual: 85% of budget achieved
- Q2 Pipeline: Looking very promising
- Customer feedback: Extremely positive

This account has potential for significant growth. Your guidance would be appreciated.

Thanks,
Jane`,
        timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
        isRead: false,
        priority: 'medium',
        category: 'forecast_inquiry',
        status: 'pending'
      },
      {
        id: '6',
        fromUserId: 'sarah_manager',
        fromUserName: 'Sarah Manager',
        fromUserRole: 'manager',
        toUserId: 'jane_salesman',
        toUserName: 'Jane Salesman',
        toUserRole: 'salesman',
        subject: 'Re: Forecast Clarification - Action Aid Account',
        message: `Hi Jane,

Great questions! Here are my responses:

✅ Answers:
1. **New Product Line**: Yes, include valve accessories with conservative 10% market penetration
2. **Volume Increase**: Factor in 20% increase (not full 30%) to be realistic
3. **Budget Adjustment**: Approved - you can increase Q2 budget by 15%

📈 Recommendations:
- Update your rolling forecast with these parameters
- Schedule customer meeting to confirm volume commitments  
- Coordinate with supply chain for inventory planning

This is excellent account management. Keep up the great work!

Best regards,
Sarah`,
        timestamp: new Date(Date.now() - 7 * 60 * 60 * 1000).toISOString(),
        isRead: false,
        priority: 'medium',
        category: 'forecast_inquiry',
        replyToId: '5',
        status: 'responded'
      }
    ];

    localStorage.setItem('admin_communication_messages', JSON.stringify(demoMessages));
    console.log('Demo communication data initialized with', demoMessages.length, 'messages');
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
