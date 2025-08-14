import React, { useState, useEffect } from 'react';
import { X, Percent, Save, RotateCcw, AlertTriangle, Edit3, Check } from 'lucide-react';
import { discountService, DiscountRule } from '../services/discountService';
import { useAuth } from '../contexts/AuthContext';

interface DiscountManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DiscountManagementModal: React.FC<DiscountManagementModalProps> = ({
  isOpen,
  onClose
}) => {
  const { user } = useAuth();
  const [rules, setRules] = useState<DiscountRule[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [categories, setCategories] = useState<string[]>([]);
  const [editingRule, setEditingRule] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadRules();
    }
  }, [isOpen]);

  const loadRules = () => {
    const allRules = discountService.getAllRules();
    const uniqueCategories = discountService.getCategories();
    
    setRules(allRules);
    setCategories(uniqueCategories);
    
    if (!selectedCategory && uniqueCategories.length > 0) {
      setSelectedCategory(uniqueCategories[0]);
    }
  };

  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleEditStart = (rule: DiscountRule) => {
    if (!rule.isEditable) {
      showNotification('This discount rule cannot be edited', 'error');
      return;
    }

    if (user?.role !== 'admin' && user?.role !== 'manager') {
      showNotification('You do not have permission to edit discount rules', 'error');
      return;
    }

    setEditingRule(rule.id);
    setEditValue(rule.discountPercentage.toString());
  };

  const handleEditSave = (ruleId: string) => {
    try {
      const newPercentage = parseFloat(editValue);
      
      if (isNaN(newPercentage)) {
        showNotification('Please enter a valid number', 'error');
        return;
      }

      discountService.updateDiscountRule(ruleId, newPercentage, user?.name || 'Unknown');
      
      // Reload rules
      loadRules();
      
      setEditingRule(null);
      setEditValue('');
      
      showNotification('Discount rule updated successfully', 'success');
      
    } catch (error) {
      showNotification(error instanceof Error ? error.message : 'Failed to update discount rule', 'error');
    }
  };

  const handleEditCancel = () => {
    setEditingRule(null);
    setEditValue('');
  };

  const handleResetToDefaults = () => {
    if (window.confirm('Are you sure you want to reset all discount rules to their default values? This action cannot be undone.')) {
      discountService.resetToDefaults();
      loadRules();
      showNotification('Discount rules reset to defaults', 'success');
    }
  };

  const filteredRules = rules.filter(rule => {
    const matchesCategory = !selectedCategory || rule.category === selectedCategory;
    const matchesSearch = !searchTerm || 
      rule.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rule.brand.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesCategory && matchesSearch;
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        <div className="border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Percent className="w-6 h-6 text-blue-600" />
              <div>
                <h2 className="text-xl font-bold text-gray-900">Discount Management</h2>
                <p className="text-sm text-gray-600">
                  Manage category and brand-based discount rules
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
        </div>

        {/* Notification */}
        {notification && (
          <div className={`mx-6 mt-4 p-3 rounded-lg ${
            notification.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
            <div className="flex items-center gap-2">
              {notification.type === 'success' ? <Check className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
              {notification.message}
            </div>
          </div>
        )}

        <div className="p-6">
          {/* Controls */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category Filter
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Rules
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Search category or brand..."
              />
            </div>

            <div className="flex items-end">
              <button
                onClick={handleResetToDefaults}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                disabled={user?.role !== 'admin'}
                title={user?.role !== 'admin' ? 'Admin access required' : 'Reset all rules to defaults'}
              >
                <RotateCcw className="w-4 h-4" />
                Reset to Defaults
              </button>
            </div>
          </div>

          {/* Rules Table */}
          <div className="overflow-hidden rounded-lg border border-gray-200">
            <div className="max-h-[50vh] overflow-y-auto">
              <table className="w-full">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Brand
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Discount %
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Last Modified
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredRules.map((rule) => (
                    <tr key={rule.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">
                        {rule.category}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {rule.brand || '(All brands)'}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {editingRule === rule.id ? (
                          <div className="flex items-center justify-center gap-2">
                            <input
                              type="number"
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              className="w-20 px-2 py-1 text-center border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              min="0"
                              max="50"
                              step="0.01"
                              autoFocus
                            />
                            <span className="text-gray-500">%</span>
                          </div>
                        ) : (
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            rule.discountPercentage > 15 ? 'bg-red-100 text-red-800' :
                            rule.discountPercentage > 5 ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {rule.discountPercentage.toFixed(2)}%
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center text-xs text-gray-500">
                        <div>
                          {new Date(rule.lastModified).toLocaleDateString()}
                        </div>
                        {rule.modifiedBy && (
                          <div className="text-gray-400">
                            by {rule.modifiedBy}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {editingRule === rule.id ? (
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleEditSave(rule.id)}
                              className="text-green-600 hover:text-green-800 transition-colors"
                              title="Save"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={handleEditCancel}
                              className="text-gray-600 hover:text-gray-800 transition-colors"
                              title="Cancel"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleEditStart(rule)}
                            disabled={!rule.isEditable || (user?.role !== 'admin' && user?.role !== 'manager')}
                            className="text-blue-600 hover:text-blue-800 transition-colors disabled:text-gray-400 disabled:cursor-not-allowed"
                            title={
                              !rule.isEditable ? 'Not editable' :
                              (user?.role !== 'admin' && user?.role !== 'manager') ? 'Admin/Manager access required' :
                              'Edit discount percentage'
                            }
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Summary */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="text-sm text-blue-700 mb-1">Total Rules</div>
              <div className="text-2xl font-bold text-blue-900">{filteredRules.length}</div>
            </div>
            
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="text-sm text-green-700 mb-1">Editable Rules</div>
              <div className="text-2xl font-bold text-green-900">
                {filteredRules.filter(rule => rule.isEditable).length}
              </div>
            </div>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="text-sm text-yellow-700 mb-1">High Discounts (&gt;15%)</div>
              <div className="text-2xl font-bold text-yellow-900">
                {filteredRules.filter(rule => rule.discountPercentage > 15).length}
              </div>
            </div>
          </div>

          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div className="text-sm text-yellow-800">
                <div className="font-medium mb-1">Discount Rule Management</div>
                <div>
                  • Only Admin and Manager roles can edit discount rules<br/>
                  • Maximum discount allowed is 50%<br/>
                  • Changes are applied immediately to all budget calculations<br/>
                  • Use "Reset to Defaults" to restore original discount values
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4">
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiscountManagementModal;
