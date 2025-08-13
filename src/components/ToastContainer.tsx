import React, { useState, useEffect } from 'react';
import { CheckCircle, AlertTriangle, XCircle, X, Bell } from 'lucide-react';

interface Toast {
  id: string;
  type: 'success' | 'warning' | 'error';
  title: string;
  message: string;
}

const ToastContainer: React.FC = () => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { ...toast, id }]);
    
    // Auto remove after 7 seconds
    setTimeout(() => {
      removeToast(id);
    }, 7000);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  // Example function to trigger toasts (can be called from other components)
  useEffect(() => {
    // You can expose this function globally or through context
    (window as any).showToast = addToast;
  }, []);

  const getToastIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-orange-600" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <CheckCircle className="w-5 h-5 text-blue-600" />;
    }
  };

  const getToastClasses = (type: string) => {
    const baseClasses = "bs-toast toast animate__animated m-2 animate__slideInDown";
    switch (type) {
      case 'success':
        return `${baseClasses} bg-green-50 border-green-200`;
      case 'warning':
        return `${baseClasses} bg-orange-50 border-orange-200`;
      case 'error':
        return `${baseClasses} bg-red-50 border-red-200`;
      default:
        return `${baseClasses} bg-blue-50 border-blue-200`;
    }
  };

  const getToastHeaderTitle = (type: string) => {
    switch (type) {
      case 'success':
        return 'Great!';
      case 'warning':
        return 'Warning!';
      case 'error':
        return 'Oops!';
      default:
        return 'Info';
    }
  };

  return (
    <div className="toast-container position-absolute bottom-10 start-50 translate-middle-x p-3 fixed bottom-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`${getToastClasses(toast.type)} max-w-sm w-full border rounded-lg shadow-lg p-4 transform transition-all duration-300 ease-in-out`}
          role="alert"
          aria-live="assertive"
          aria-atomic="true"
        >
          <div className="toast-header flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <Bell className="w-4 h-4" />
              <div className="me-auto fw-medium font-medium text-gray-900">
                {getToastHeaderTitle(toast.type)}
              </div>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="btn-close text-gray-400 hover:text-gray-600 focus:outline-none"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="toast-body text-sm text-gray-600">
            {toast.message}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ToastContainer;