import React, { useState } from 'react';
import { X, Eye, EyeOff } from 'lucide-react';

interface PasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PasswordModal: React.FC<PasswordModalProps> = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle password change logic here
    console.log('Password change submitted:', formData);
    onClose();
  };

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="modal fade fixed inset-0 z-50 overflow-y-auto" style={{ display: 'block' }}>
      <div className="modal-dialog modal-dialog-centered modal-simple modal-add-new-cc flex items-center justify-center min-h-screen px-4">
        <div className="modal-content p-3 p-md-5 bg-white rounded-lg shadow-xl max-w-lg w-full">
          <div className="modal-body">
            <button 
              type="button" 
              className="btn-close absolute top-4 right-4 text-gray-400 hover:text-gray-600" 
              onClick={onClose}
            >
              <X className="w-6 h-6" />
            </button>
            
            <div className="text-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Change Password</h3>
            </div>
            
            <form className="row g-3 space-y-4" onSubmit={handleSubmit}>
              <div className="col-12">
                <label className="form-label w-100 block text-sm font-medium text-gray-700 mb-1">Code</label>
                <input 
                  type="text" 
                  className="form-control w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600" 
                  value="345" 
                  readOnly 
                />
              </div>
              
              <div className="col-12">
                <label className="form-label w-100 block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                <div className="input-group input-group-merge relative">
                  <input
                    type={showPasswords.current ? 'text' : 'password'}
                    className="form-control w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                    value={formData.currentPassword}
                    onChange={(e) => setFormData({...formData, currentPassword: e.target.value})}
                    placeholder="············"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('current')}
                    className="input-group-text cursor-pointer absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    {showPasswords.current ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
              
              <div className="col-12">
                <label className="form-label w-100 block text-sm font-medium text-gray-700 mb-1">New Password</label>
                <div className="input-group input-group-merge relative">
                  <input
                    type={showPasswords.new ? 'text' : 'password'}
                    className="form-control w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                    value={formData.newPassword}
                    onChange={(e) => setFormData({...formData, newPassword: e.target.value})}
                    placeholder="············"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('new')}
                    className="input-group-text cursor-pointer absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    {showPasswords.new ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
              
              <div className="col-12 text-center pt-4">
                <button 
                  type="submit" 
                  className="btn btn-primary me-sm-3 me-1 mt-3 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors mr-3"
                >
                  Submit
                </button>
                <button 
                  type="button" 
                  className="btn btn-label-secondary btn-reset mt-3 px-6 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors" 
                  onClick={onClose}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      
      {/* Modal Backdrop */}
      <div 
        className="fixed inset-0 bg-gray-500 opacity-75 -z-10" 
        onClick={onClose}
      ></div>
    </div>
  );
};

export default PasswordModal;