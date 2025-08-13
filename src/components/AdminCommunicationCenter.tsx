import React, { useState, useEffect } from 'react';
import { 
  X, 
  MessageSquare, 
  Send, 
  Users, 
  Search, 
  Filter, 
  Bell, 
  Eye, 
  Reply, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  User,
  ArrowLeft,
  ArrowRight,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

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
  attachments?: any[];
  replyToId?: string;
  status: 'pending' | 'responded' | 'resolved' | 'escalated';
}

interface User {
  id: string;
  name: string;
  role: 'salesman' | 'manager' | 'supply_chain';
  email: string;
  status: 'online' | 'offline' | 'busy';
  lastActive: string;
  pendingMessages: number;
}

interface AdminCommunicationCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

const AdminCommunicationCenter: React.FC<AdminCommunicationCenterProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'inbox' | 'compose' | 'users' | 'analytics'>('inbox');
  const [messages, setMessages] = useState<CommunicationMessage[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<CommunicationMessage | null>(null);
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isComposing, setIsComposing] = useState(false);
  const [replyToMessage, setReplyToMessage] = useState<CommunicationMessage | null>(null);
  
  // Compose form state
  const [composeForm, setComposeForm] = useState({
    toUserId: '',
    toUserRole: 'salesman' as 'salesman' | 'manager' | 'supply_chain',
    subject: '',
    message: '',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'critical',
    category: 'general' as 'stock_request' | 'budget_approval' | 'forecast_inquiry' | 'supply_chain' | 'general' | 'system_alert'
  });

  useEffect(() => {
    if (isOpen) {
      loadMessages();
      loadUsers();
    }
  }, [isOpen]);

  const loadMessages = () => {
    try {
      const savedMessages = localStorage.getItem('admin_communication_messages');
      if (savedMessages) {
        setMessages(JSON.parse(savedMessages));
      } else {
        // Initialize with sample data
        const sampleMessages: CommunicationMessage[] = [
          {
            id: '1',
            fromUserId: 'john_salesman',
            fromUserName: 'John Salesman',
            fromUserRole: 'salesman',
            toUserId: 'admin',
            toUserName: 'Admin',
            toUserRole: 'admin',
            subject: 'Stock Request for BF Goodrich Tyres',
            message: 'Hi Admin, we need urgent stock replenishment for BF Goodrich tyres. Current stock is critically low and we have pending customer orders.',
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            isRead: false,
            priority: 'high',
            category: 'stock_request',
            status: 'pending'
          },
          {
            id: '2',
            fromUserId: 'sarah_manager',
            fromUserName: 'Sarah Manager',
            fromUserRole: 'manager',
            toUserId: 'admin',
            toUserName: 'Admin',
            toUserRole: 'admin',
            subject: 'Budget Approval Request',
            message: 'Please review and approve the submitted budgets for Q1 2026. Total value: $2.5M across 15 customers.',
            timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
            isRead: false,
            priority: 'medium',
            category: 'budget_approval',
            status: 'pending'
          },
          {
            id: '3',
            fromUserId: 'mike_supply',
            fromUserName: 'Mike Supply Chain',
            fromUserRole: 'supply_chain',
            toUserId: 'admin',
            toUserName: 'Admin',
            toUserRole: 'admin',
            subject: 'Delivery Schedule Update',
            message: 'New shipment of Michelin tyres arriving next week. ETA: March 15th. Please update GIT accordingly.',
            timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
            isRead: true,
            priority: 'medium',
            category: 'supply_chain',
            status: 'responded'
          }
        ];
        setMessages(sampleMessages);
        localStorage.setItem('admin_communication_messages', JSON.stringify(sampleMessages));
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const loadUsers = () => {
    const sampleUsers: User[] = [
      {
        id: 'john_salesman',
        name: 'John Salesman',
        role: 'salesman',
        email: 'john@company.com',
        status: 'online',
        lastActive: new Date().toISOString(),
        pendingMessages: 2
      },
      {
        id: 'sarah_manager',
        name: 'Sarah Manager',
        role: 'manager',
        email: 'sarah@company.com',
        status: 'busy',
        lastActive: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        pendingMessages: 1
      },
      {
        id: 'mike_supply',
        name: 'Mike Supply Chain',
        role: 'supply_chain',
        email: 'mike@company.com',
        status: 'offline',
        lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        pendingMessages: 0
      },
      {
        id: 'jane_salesman',
        name: 'Jane Salesman',
        role: 'salesman',
        email: 'jane@company.com',
        status: 'online',
        lastActive: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        pendingMessages: 0
      }
    ];
    setUsers(sampleUsers);
  };

  const filteredMessages = messages.filter(message => {
    const matchesCategory = filterCategory === 'all' || message.category === filterCategory;
    const matchesPriority = filterPriority === 'all' || message.priority === filterPriority;
    const matchesSearch = searchTerm === '' || 
      message.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.fromUserName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.message.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesCategory && matchesPriority && matchesSearch;
  });

  const handleSendMessage = () => {
    if (!composeForm.toUserId || !composeForm.subject || !composeForm.message) {
      alert('Please fill in all required fields');
      return;
    }

    const newMessage: CommunicationMessage = {
      id: Date.now().toString(),
      fromUserId: 'admin',
      fromUserName: 'Admin',
      fromUserRole: 'admin',
      toUserId: composeForm.toUserId,
      toUserName: users.find(u => u.id === composeForm.toUserId)?.name || 'User',
      toUserRole: composeForm.toUserRole,
      subject: replyToMessage ? `Re: ${replyToMessage.subject}` : composeForm.subject,
      message: composeForm.message,
      timestamp: new Date().toISOString(),
      isRead: false,
      priority: composeForm.priority,
      category: composeForm.category,
      replyToId: replyToMessage?.id,
      status: 'pending'
    };

    const updatedMessages = [newMessage, ...messages];
    setMessages(updatedMessages);
    localStorage.setItem('admin_communication_messages', JSON.stringify(updatedMessages));

    // Mark original message as responded if it's a reply
    if (replyToMessage) {
      const updatedOriginal = updatedMessages.map(msg => 
        msg.id === replyToMessage.id ? { ...msg, status: 'responded' as const } : msg
      );
      setMessages(updatedOriginal);
      localStorage.setItem('admin_communication_messages', JSON.stringify(updatedOriginal));
    }

    // Reset form
    setComposeForm({
      toUserId: '',
      toUserRole: 'salesman',
      subject: '',
      message: '',
      priority: 'medium',
      category: 'general'
    });
    setIsComposing(false);
    setReplyToMessage(null);
    setActiveTab('inbox');
    
    alert('Message sent successfully!');
  };

  const handleReply = (message: CommunicationMessage) => {
    setReplyToMessage(message);
    setComposeForm({
      toUserId: message.fromUserId,
      toUserRole: message.fromUserRole,
      subject: message.subject,
      message: '',
      priority: message.priority,
      category: message.category
    });
    setIsComposing(true);
    setActiveTab('compose');
  };

  const markAsRead = (messageId: string) => {
    const updatedMessages = messages.map(msg => 
      msg.id === messageId ? { ...msg, isRead: true } : msg
    );
    setMessages(updatedMessages);
    localStorage.setItem('admin_communication_messages', JSON.stringify(updatedMessages));
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-600 bg-red-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'medium': return 'text-blue-600 bg-blue-100';
      case 'low': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'responded': return 'text-blue-600 bg-blue-100';
      case 'resolved': return 'text-green-600 bg-green-100';
      case 'escalated': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getUserStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'text-green-500';
      case 'busy': return 'text-yellow-500';
      case 'offline': return 'text-gray-400';
      default: return 'text-gray-400';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-7xl h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MessageSquare className="w-6 h-6 text-blue-600" />
              <div>
                <h2 className="text-xl font-bold text-gray-900">Admin Communication Center</h2>
                <p className="text-sm text-gray-600">
                  Manage all user communications and responses
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Tab Navigation */}
          <div className="flex space-x-1 mt-4">
            {[
              { id: 'inbox', label: 'Inbox', icon: Bell, count: messages.filter(m => !m.isRead).length },
              { id: 'compose', label: 'Compose', icon: Send },
              { id: 'users', label: 'Users', icon: Users, count: users.filter(u => u.status === 'online').length },
              { id: 'analytics', label: 'Analytics', icon: Eye }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
                {tab.count !== undefined && tab.count > 0 && (
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                    activeTab === tab.id ? 'bg-white text-blue-600' : 'bg-red-500 text-white'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex overflow-hidden">
          {activeTab === 'inbox' && (
            <div className="flex w-full">
              {/* Message List */}
              <div className="w-1/3 border-r border-gray-200 flex flex-col">
                <div className="p-4 border-b border-gray-200">
                  <div className="flex gap-2 mb-3">
                    <div className="relative flex-1">
                      <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Search messages..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <button
                      onClick={loadMessages}
                      className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                      title="Refresh"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <select
                      value={filterCategory}
                      onChange={(e) => setFilterCategory(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    >
                      <option value="all">All Categories</option>
                      <option value="stock_request">Stock Request</option>
                      <option value="budget_approval">Budget Approval</option>
                      <option value="forecast_inquiry">Forecast Inquiry</option>
                      <option value="supply_chain">Supply Chain</option>
                      <option value="general">General</option>
                    </select>
                    <select
                      value={filterPriority}
                      onChange={(e) => setFilterPriority(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    >
                      <option value="all">All Priorities</option>
                      <option value="critical">Critical</option>
                      <option value="high">High</option>
                      <option value="medium">Medium</option>
                      <option value="low">Low</option>
                    </select>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                  {filteredMessages.map((message) => (
                    <div
                      key={message.id}
                      onClick={() => {
                        setSelectedMessage(message);
                        if (!message.isRead) markAsRead(message.id);
                      }}
                      className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                        selectedMessage?.id === message.id ? 'bg-blue-50 border-blue-200' : ''
                      } ${!message.isRead ? 'bg-yellow-50' : ''}`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-400" />
                          <span className="font-medium text-sm">{message.fromUserName}</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(message.priority)}`}>
                            {message.priority}
                          </span>
                        </div>
                        {!message.isRead && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        )}
                      </div>
                      <div className="text-sm font-medium text-gray-900 mb-1 truncate">
                        {message.subject}
                      </div>
                      <div className="text-xs text-gray-600 mb-2 line-clamp-2">
                        {message.message}
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-500">
                          {new Date(message.timestamp).toLocaleString()}
                        </span>
                        <span className={`px-2 py-1 rounded-full font-medium ${getStatusColor(message.status)}`}>
                          {message.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Message Detail */}
              <div className="flex-1 flex flex-col">
                {selectedMessage ? (
                  <>
                    <div className="p-6 border-b border-gray-200">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            {selectedMessage.subject}
                          </h3>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span>From: <strong>{selectedMessage.fromUserName}</strong> ({selectedMessage.fromUserRole})</span>
                            <span>{new Date(selectedMessage.timestamp).toLocaleString()}</span>
                            <span className={`px-2 py-1 rounded-full font-medium ${getPriorityColor(selectedMessage.priority)}`}>
                              {selectedMessage.priority} priority
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleReply(selectedMessage)}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                          >
                            <Reply className="w-4 h-4" />
                            Reply
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="flex-1 p-6">
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-gray-800 whitespace-pre-wrap">{selectedMessage.message}</p>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center text-gray-500">
                    <div className="text-center">
                      <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <p>Select a message to view details</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'compose' && (
            <div className="w-full p-6">
              <div className="max-w-4xl mx-auto">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">
                  {replyToMessage ? 'Reply to Message' : 'Compose New Message'}
                </h3>

                {replyToMessage && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <div className="flex items-center gap-2 mb-2">
                      <Reply className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-800">Replying to:</span>
                    </div>
                    <div className="text-sm text-blue-700">
                      <div><strong>From:</strong> {replyToMessage.fromUserName}</div>
                      <div><strong>Subject:</strong> {replyToMessage.subject}</div>
                    </div>
                  </div>
                )}

                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        To User *
                      </label>
                      <select
                        value={composeForm.toUserId}
                        onChange={(e) => {
                          const selectedUser = users.find(u => u.id === e.target.value);
                          setComposeForm(prev => ({
                            ...prev,
                            toUserId: e.target.value,
                            toUserRole: selectedUser?.role || 'salesman'
                          }));
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        disabled={!!replyToMessage}
                      >
                        <option value="">Select User</option>
                        {users.map(user => (
                          <option key={user.id} value={user.id}>
                            {user.name} ({user.role})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Priority *
                      </label>
                      <select
                        value={composeForm.priority}
                        onChange={(e) => setComposeForm(prev => ({
                          ...prev,
                          priority: e.target.value as any
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="critical">Critical</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Category *
                      </label>
                      <select
                        value={composeForm.category}
                        onChange={(e) => setComposeForm(prev => ({
                          ...prev,
                          category: e.target.value as any
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="general">General</option>
                        <option value="stock_request">Stock Request</option>
                        <option value="budget_approval">Budget Approval</option>
                        <option value="forecast_inquiry">Forecast Inquiry</option>
                        <option value="supply_chain">Supply Chain</option>
                        <option value="system_alert">System Alert</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Subject *
                    </label>
                    <input
                      type="text"
                      value={composeForm.subject}
                      onChange={(e) => setComposeForm(prev => ({
                        ...prev,
                        subject: e.target.value
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter message subject"
                      disabled={!!replyToMessage}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Message *
                    </label>
                    <textarea
                      value={composeForm.message}
                      onChange={(e) => setComposeForm(prev => ({
                        ...prev,
                        message: e.target.value
                      }))}
                      rows={8}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter your message"
                    />
                  </div>

                  <div className="flex justify-end gap-3">
                    <button
                      onClick={() => {
                        setIsComposing(false);
                        setReplyToMessage(null);
                        setComposeForm({
                          toUserId: '',
                          toUserRole: 'salesman',
                          subject: '',
                          message: '',
                          priority: 'medium',
                          category: 'general'
                        });
                      }}
                      className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSendMessage}
                      className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                    >
                      <Send className="w-4 h-4" />
                      Send Message
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="w-full p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">User Management</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {users.map(user => (
                  <div key={user.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-gray-600" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{user.name}</div>
                          <div className="text-sm text-gray-600">{user.role}</div>
                        </div>
                      </div>
                      <div className={`w-3 h-3 rounded-full ${getUserStatusColor(user.status)}`} />
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-gray-600">Email:</span>
                        <span className="ml-2 text-gray-900">{user.email}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Status:</span>
                        <span className={`ml-2 font-medium ${getUserStatusColor(user.status)}`}>
                          {user.status}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Last Active:</span>
                        <span className="ml-2 text-gray-900">
                          {new Date(user.lastActive).toLocaleString()}
                        </span>
                      </div>
                      {user.pendingMessages > 0 && (
                        <div>
                          <span className="text-gray-600">Pending Messages:</span>
                          <span className="ml-2 bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium">
                            {user.pendingMessages}
                          </span>
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => {
                        setComposeForm(prev => ({
                          ...prev,
                          toUserId: user.id,
                          toUserRole: user.role
                        }));
                        setActiveTab('compose');
                      }}
                      className="w-full mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <MessageSquare className="w-4 h-4" />
                      Send Message
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="w-full p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Communication Analytics</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <Bell className="w-5 h-5 text-blue-600" />
                    <span className="text-sm font-medium text-blue-800">Total Messages</span>
                  </div>
                  <div className="text-2xl font-bold text-blue-900">{messages.length}</div>
                </div>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <Clock className="w-5 h-5 text-yellow-600" />
                    <span className="text-sm font-medium text-yellow-800">Pending Responses</span>
                  </div>
                  <div className="text-2xl font-bold text-yellow-900">
                    {messages.filter(m => m.status === 'pending').length}
                  </div>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="text-sm font-medium text-green-800">Resolved</span>
                  </div>
                  <div className="text-2xl font-bold text-green-900">
                    {messages.filter(m => m.status === 'resolved').length}
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-6">
                <h4 className="text-md font-medium text-gray-900 mb-4">Message Categories</h4>
                <div className="space-y-3">
                  {['stock_request', 'budget_approval', 'forecast_inquiry', 'supply_chain', 'general'].map(category => {
                    const count = messages.filter(m => m.category === category).length;
                    const percentage = messages.length > 0 ? (count / messages.length) * 100 : 0;
                    return (
                      <div key={category} className="flex items-center justify-between">
                        <span className="text-sm text-gray-700 capitalize">
                          {category.replace('_', ' ')}
                        </span>
                        <div className="flex items-center gap-3">
                          <div className="w-32 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium text-gray-900 w-8">{count}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminCommunicationCenter;
