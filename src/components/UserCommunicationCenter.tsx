import React, { useState, useEffect } from 'react';
import { 
  X, 
  MessageSquare, 
  Send, 
  Search, 
  Bell, 
  Reply, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  User,
  RefreshCw,
  Plus,
  Paperclip
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
  replyToId?: string;
  status: 'pending' | 'responded' | 'resolved' | 'escalated';
}

interface UserCommunicationCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

const UserCommunicationCenter: React.FC<UserCommunicationCenterProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'inbox' | 'compose' | 'sent'>('inbox');
  const [messages, setMessages] = useState<CommunicationMessage[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<CommunicationMessage | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [replyToMessage, setReplyToMessage] = useState<CommunicationMessage | null>(null);
  
  // Compose form state
  const [composeForm, setComposeForm] = useState({
    toUserId: 'admin',
    toUserRole: 'admin' as 'admin' | 'salesman' | 'manager' | 'supply_chain',
    subject: '',
    message: '',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'critical',
    category: 'general' as 'stock_request' | 'budget_approval' | 'forecast_inquiry' | 'supply_chain' | 'general' | 'system_alert'
  });

  useEffect(() => {
    if (isOpen) {
      loadMessages();
    }
  }, [isOpen]);

  const loadMessages = () => {
    try {
      const savedMessages = localStorage.getItem('admin_communication_messages');
      if (savedMessages) {
        const allMessages: CommunicationMessage[] = JSON.parse(savedMessages);
        // Filter messages relevant to current user
        const userMessages = allMessages.filter(msg => 
          msg.fromUserId === user?.name || msg.toUserId === user?.name
        );
        setMessages(userMessages);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const sendMessage = () => {
    if (!composeForm.subject || !composeForm.message) {
      alert('Please fill in subject and message');
      return;
    }

    const newMessage: CommunicationMessage = {
      id: Date.now().toString(),
      fromUserId: user?.name || 'unknown',
      fromUserName: user?.name || 'Unknown User',
      fromUserRole: user?.role as any || 'salesman',
      toUserId: composeForm.toUserId,
      toUserName: composeForm.toUserId === 'admin' ? 'Admin' : 'User',
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

    // Get existing messages and add new one
    const existingMessages = JSON.parse(localStorage.getItem('admin_communication_messages') || '[]');
    const updatedMessages = [newMessage, ...existingMessages];
    localStorage.setItem('admin_communication_messages', JSON.stringify(updatedMessages));

    // Update local state
    setMessages([newMessage, ...messages]);

    // Reset form
    setComposeForm({
      toUserId: 'admin',
      toUserRole: 'admin',
      subject: '',
      message: '',
      priority: 'medium',
      category: 'general'
    });
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
    setActiveTab('compose');
  };

  const markAsRead = (messageId: string) => {
    const existingMessages = JSON.parse(localStorage.getItem('admin_communication_messages') || '[]');
    const updatedMessages = existingMessages.map((msg: CommunicationMessage) => 
      msg.id === messageId ? { ...msg, isRead: true } : msg
    );
    localStorage.setItem('admin_communication_messages', JSON.stringify(updatedMessages));
    
    setMessages(prev => prev.map(msg => 
      msg.id === messageId ? { ...msg, isRead: true } : msg
    ));
  };

  const inboxMessages = messages.filter(msg => msg.toUserId === user?.name);
  const sentMessages = messages.filter(msg => msg.fromUserId === user?.name);
  const filteredInbox = inboxMessages.filter(msg => 
    searchTerm === '' || 
    msg.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    msg.fromUserName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    msg.message.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-600 bg-red-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'medium': return 'text-blue-600 bg-blue-100';
      case 'low': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MessageSquare className="w-6 h-6 text-blue-600" />
              <div>
                <h2 className="text-xl font-bold text-gray-900">Communication Center</h2>
                <p className="text-sm text-gray-600">
                  Messages and notifications for {user?.name}
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
              { id: 'inbox', label: 'Inbox', icon: Bell, count: inboxMessages.filter(m => !m.isRead).length },
              { id: 'compose', label: 'Compose', icon: Send },
              { id: 'sent', label: 'Sent', icon: CheckCircle, count: sentMessages.length }
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
                    activeTab === tab.id ? 'bg-white text-blue-600' : 'bg-blue-500 text-white'
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
                  <div className="relative">
                    <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search messages..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                  {filteredInbox.length === 0 ? (
                    <div className="p-6 text-center text-gray-500">
                      <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <p>No messages found</p>
                      <p className="text-sm">Check back later or compose a new message</p>
                    </div>
                  ) : (
                    filteredInbox.map((message) => (
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
                        <div className="text-xs text-gray-500">
                          {new Date(message.timestamp).toLocaleString()}
                        </div>
                      </div>
                    ))
                  )}
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
                        To *
                      </label>
                      <select
                        value={composeForm.toUserId}
                        onChange={(e) => {
                          const value = e.target.value;
                          setComposeForm(prev => ({
                            ...prev,
                            toUserId: value,
                            toUserRole: value === 'admin' ? 'admin' : 'salesman'
                          }));
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        disabled={!!replyToMessage}
                      >
                        <option value="admin">Admin</option>
                        <option value="john_salesman">John Salesman</option>
                        <option value="sarah_manager">Sarah Manager</option>
                        <option value="mike_supply">Mike Supply Chain</option>
                        <option value="jane_salesman">Jane Salesman</option>
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
                        setReplyToMessage(null);
                        setComposeForm({
                          toUserId: 'admin',
                          toUserRole: 'admin',
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
                      onClick={sendMessage}
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

          {activeTab === 'sent' && (
            <div className="w-full p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Sent Messages</h3>
              <div className="space-y-3">
                {sentMessages.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <Send className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p>No sent messages</p>
                  </div>
                ) : (
                  sentMessages.map((message) => (
                    <div key={message.id} className="bg-white border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="font-medium text-gray-900">{message.subject}</div>
                          <div className="text-sm text-gray-600">
                            To: {message.toUserName} ({message.toUserRole})
                          </div>
                        </div>
                        <div className="text-right">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(message.priority)}`}>
                            {message.priority}
                          </span>
                          <div className="text-xs text-gray-500 mt-1">
                            {new Date(message.timestamp).toLocaleString()}
                          </div>
                        </div>
                      </div>
                      <div className="text-sm text-gray-700 line-clamp-2">
                        {message.message}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserCommunicationCenter;
