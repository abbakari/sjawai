import React, { useState, useEffect } from 'react';
import { ArrowLeft, Bell, X, MessageCircle, Clock, CheckCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface FollowBack {
  id: string;
  from: string;
  message: string;
  submissionId: string;
  customerName: string;
  timestamp: string;
  read: boolean;
  type: 'question' | 'clarification' | 'update' | 'approval_needed';
}

const FollowBacksButton: React.FC = () => {
  const { user } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [followBacks, setFollowBacks] = useState<FollowBack[]>([]);

  // Sample follow-back data - in real implementation, this would come from API
  useEffect(() => {
    if (user) {
      const sampleFollowBacks: FollowBack[] = [
        {
          id: 'fb_001',
          from: 'Supply Chain Team',
          message: 'Need clarification on delivery address for Action Aid International order. Current address seems incomplete.',
          submissionId: 'sub_001',
          customerName: 'Action Aid International (Tz)',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          read: false,
          type: 'clarification'
        },
        {
          id: 'fb_002',
          from: 'Manager',
          message: 'Please review the budget allocation for Q2. Some items need adjustment before final approval.',
          submissionId: 'budget_456',
          customerName: 'ADVENT CONSTRUCTION LTD.',
          timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
          read: true,
          type: 'approval_needed'
        },
        {
          id: 'fb_003',
          from: 'Supply Chain Team',
          message: 'Update: Your forecast for Oxfam Tanzania has been processed. Expected delivery: Dec 15.',
          submissionId: 'forecast_789',
          customerName: 'Oxfam Tanzania',
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          read: false,
          type: 'update'
        }
      ];

      setFollowBacks(sampleFollowBacks);
    }
  }, [user]);

  const unreadCount = followBacks.filter(fb => !fb.read).length;

  const markAsRead = (id: string) => {
    setFollowBacks(prev => prev.map(fb => 
      fb.id === id ? { ...fb, read: true } : fb
    ));
  };

  const markAllAsRead = () => {
    setFollowBacks(prev => prev.map(fb => ({ ...fb, read: true })));
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'question': return '❓';
      case 'clarification': return '🔍';
      case 'update': return '📋';
      case 'approval_needed': return '⚠️';
      default: return '💬';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'question': return 'bg-blue-100 text-blue-800';
      case 'clarification': return 'bg-yellow-100 text-yellow-800';
      case 'update': return 'bg-green-100 text-green-800';
      case 'approval_needed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInHours = Math.floor((now.getTime() - time.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  return (
    <>
      {/* Follow-backs Button */}
      <button
        onClick={() => setShowModal(true)}
        className="relative flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-800 rounded-lg hover:bg-purple-200 transition-colors"
        title="View follow-back messages"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="font-medium">Follow-backs</span>
        {unreadCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Follow-backs Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <ArrowLeft className="w-6 h-6 text-purple-600" />
                  <h2 className="text-xl font-bold text-gray-900">Follow-back Messages</h2>
                  {unreadCount > 0 && (
                    <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-sm font-medium">
                      {unreadCount} unread
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      Mark all as read
                    </button>
                  )}
                  <button
                    onClick={() => setShowModal(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(80vh-120px)]">
              {followBacks.length === 0 ? (
                <div className="text-center py-8">
                  <MessageCircle className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No follow-back messages</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    You'll see messages from managers and supply chain team here.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {followBacks.map((followBack) => (
                    <div
                      key={followBack.id}
                      className={`border rounded-lg p-4 transition-colors ${
                        followBack.read ? 'bg-white border-gray-200' : 'bg-blue-50 border-blue-200'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{getTypeIcon(followBack.type)}</span>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-gray-900">
                                {followBack.from}
                              </span>
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(followBack.type)}`}>
                                {followBack.type.replace('_', ' ').toUpperCase()}
                              </span>
                              {!followBack.read && (
                                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                              )}
                            </div>
                            <div className="text-sm text-gray-500 flex items-center gap-2 mt-1">
                              <Clock className="w-3 h-3" />
                              {formatTimeAgo(followBack.timestamp)}
                            </div>
                          </div>
                        </div>
                        {!followBack.read && (
                          <button
                            onClick={() => markAsRead(followBack.id)}
                            className="text-blue-600 hover:text-blue-800 p-1 rounded transition-colors"
                            title="Mark as read"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      <div className="mb-3">
                        <p className="text-gray-700 text-sm leading-relaxed">
                          {followBack.message}
                        </p>
                      </div>

                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <div>
                          <span className="font-medium">Customer:</span> {followBack.customerName}
                        </div>
                        <div>
                          <span className="font-medium">Ref:</span> {followBack.submissionId}
                        </div>
                      </div>

                      {followBack.type === 'clarification' || followBack.type === 'approval_needed' ? (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <button className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition-colors">
                            Respond
                          </button>
                        </div>
                      ) : null}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-3">
              <div className="flex justify-between items-center text-sm text-gray-600">
                <span>
                  {followBacks.length} total messages
                </span>
                <span>
                  Stay updated with real-time follow-backs
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FollowBacksButton;
