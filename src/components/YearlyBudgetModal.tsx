import React, { useState, useEffect } from 'react';
import { X, Calendar, Save, Download, Plus, Minus, TrendingUp, Target, BarChart3, AlertCircle, CheckCircle2, Info } from 'lucide-react';

interface MonthlyBudget {
  month: string;
  budgetValue: number;
  actualValue: number;
  rate: number;
  stock: number;
  git: number;
  discount: number;
}

interface YearlyBudgetData {
  customer: string;
  item: string;
  category: string;
  brand: string;
  year: string;
  totalBudget: number;
  monthlyData: MonthlyBudget[];
}

interface YearlyBudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: YearlyBudgetData) => void;
  selectedCustomer?: string;
  year: string;
}

const YearlyBudgetModal: React.FC<YearlyBudgetModalProps> = ({
  isOpen,
  onClose,
  onSave,
  selectedCustomer = '',
  year
}) => {
  const [budgetData, setBudgetData] = useState<YearlyBudgetData>({
    customer: selectedCustomer,
    item: '',
    category: '',
    brand: '',
    year,
    totalBudget: 0,
    monthlyData: []
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});
  const [showHelpTips, setShowHelpTips] = useState(true);

  // Generate all months
  const getAllMonths = () => {
    const months = [];
    for (let i = 0; i < 12; i++) {
      const date = new Date(parseInt(year), i, 1);
      months.push({
        month: date.toLocaleDateString('en-US', { month: 'short' }),
        full: date.toLocaleDateString('en-US', { month: 'long' }),
        budgetValue: 0,
        actualValue: 0,
        rate: 0,
        stock: 0,
        git: 0,
        discount: 0
      });
    }
    return months;
  };

  useEffect(() => {
    if (isOpen) {
      setBudgetData(prev => ({
        ...prev,
        customer: selectedCustomer,
        monthlyData: getAllMonths()
      }));
      setCurrentStep(1);
      setValidationErrors({});
    }
  }, [isOpen, selectedCustomer, year]);

  const validateStep = (step: number) => {
    const errors: {[key: string]: string} = {};
    
    if (step >= 1) {
      if (!budgetData.customer.trim()) errors.customer = 'Customer name is required';
      if (!budgetData.item.trim()) errors.item = 'Item/Product name is required';
    }
    
    if (step >= 2) {
      if (!budgetData.totalBudget || budgetData.totalBudget <= 0) {
        errors.totalBudget = 'Total budget must be greater than 0';
      }
    }
    
    if (step >= 4) {
      const hasAnyBudgetValue = budgetData.monthlyData.some(month => month.budgetValue > 0);
      if (!hasAnyBudgetValue) {
        errors.monthly = 'At least one month must have budget units > 0';
      }
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 4));
    }
  };

  const handlePrevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleMonthlyChange = (monthIndex: number, field: keyof MonthlyBudget, value: number) => {
    setBudgetData(prev => ({
      ...prev,
      monthlyData: prev.monthlyData.map((month, index) =>
        index === monthIndex ? { ...month, [field]: value } : month
      )
    }));
  };

  const calculateTotals = () => {
    const totalBudget = budgetData.monthlyData.reduce((sum, month) => sum + (month.budgetValue * month.rate), 0);
    const totalUnits = budgetData.monthlyData.reduce((sum, month) => sum + month.budgetValue, 0);
    const totalDiscount = budgetData.monthlyData.reduce((sum, month) => sum + month.discount, 0);
    const netBudget = totalBudget - totalDiscount;
    
    return { totalBudget, totalUnits, totalDiscount, netBudget };
  };

  const distributeEvenly = () => {
    if (!budgetData.totalBudget) return;
    
    const monthlyValue = Math.round(budgetData.totalBudget / 12);
    const defaultRate = 100; // Default rate of $100 per unit
    const requiredUnits = Math.round(monthlyValue / defaultRate);
    
    setBudgetData(prev => ({
      ...prev,
      monthlyData: prev.monthlyData.map(month => ({
        ...month,
        budgetValue: requiredUnits,
        rate: defaultRate
      }))
    }));
    setCurrentStep(4);
  };

  const applySeasonalPattern = () => {
    if (!budgetData.totalBudget) return;
    
    // Apply seasonal pattern: higher in Q4, lower in Q1
    const seasonalMultipliers = [0.7, 0.7, 0.8, 0.9, 1.0, 1.0, 1.1, 1.1, 1.2, 1.3, 1.4, 1.5];
    const totalMultiplier = seasonalMultipliers.reduce((sum, mult) => sum + mult, 0);
    const defaultRate = 100;
    
    setBudgetData(prev => ({
      ...prev,
      monthlyData: prev.monthlyData.map((month, index) => {
        const monthlyBudget = Math.round((budgetData.totalBudget * seasonalMultipliers[index]) / totalMultiplier);
        const requiredUnits = Math.round(monthlyBudget / defaultRate);
        return {
          ...month,
          budgetValue: requiredUnits,
          rate: defaultRate
        };
      })
    }));
    setCurrentStep(4);
  };

  const handleSave = () => {
    if (validateStep(4)) {
      const totals = calculateTotals();
      const finalData = {
        ...budgetData,
        totalBudget: totals.netBudget
      };
      onSave(finalData);
      onClose();
    }
  };

  const totals = calculateTotals();
  const isStepValid = (step: number) => {
    const tempErrors = {};
    if (step >= 1 && (!budgetData.customer.trim() || !budgetData.item.trim())) return false;
    if (step >= 2 && (!budgetData.totalBudget || budgetData.totalBudget <= 0)) return false;
    if (step >= 4 && !budgetData.monthlyData.some(month => month.budgetValue > 0)) return false;
    return true;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[9999] p-2 sm:p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-7xl h-[95vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b bg-gradient-to-r from-blue-50 to-green-50 flex-shrink-0">
          <div className="flex-1">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
              📊 Create Yearly Budget - {year}
              <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                Step {currentStep} of 4
              </span>
            </h2>
            <p className="text-gray-600 text-sm sm:text-base mt-1">
              Create a comprehensive yearly budget plan with monthly breakdown for better forecasting
            </p>
            
            {/* Progress Bar */}
            <div className="mt-4 flex items-center gap-2">
              {[1, 2, 3, 4].map((step) => (
                <div key={step} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    step < currentStep ? 'bg-green-600 text-white' :
                    step === currentStep ? 'bg-blue-600 text-white' :
                    'bg-gray-200 text-gray-600'
                  }`}>
                    {step < currentStep ? <CheckCircle2 className="w-4 h-4" /> : step}
                  </div>
                  {step < 4 && (
                    <div className={`w-12 h-1 ${
                      step < currentStep ? 'bg-green-600' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowHelpTips(!showHelpTips)}
              className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1"
            >
              <Info className="w-4 h-4" />
              {showHelpTips ? 'Hide' : 'Show'} Tips
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row flex-1 min-h-0">
          {/* Left Panel - Current Step Content */}
          <div className="w-full lg:w-1/3 p-4 sm:p-6 border-r bg-gray-50 overflow-y-auto">
            
            {/* Help Tips */}
            {showHelpTips && (
              <div className="bg-blue-100 border border-blue-200 rounded-lg p-4 mb-6">
                <h3 className="text-lg font-semibold mb-3 text-blue-900 flex items-center gap-2">
                  <Info className="w-5 h-5" />
                  Quick Start Guide
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-3">
                    <span className={`rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                      currentStep >= 1 ? 'bg-green-600 text-white' : 'bg-blue-600 text-white'
                    }`}>1</span>
                    <div>
                      <p className="font-medium text-blue-900">Basic Information</p>
                      <p className="text-blue-700">Enter customer name and product details</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className={`rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                      currentStep >= 2 ? (currentStep > 2 ? 'bg-green-600 text-white' : 'bg-blue-600 text-white') : 'bg-gray-300 text-gray-600'
                    }`}>2</span>
                    <div>
                      <p className="font-medium text-blue-900">Total Budget</p>
                      <p className="text-blue-700">Set your yearly budget target amount</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className={`rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                      currentStep >= 3 ? (currentStep > 3 ? 'bg-green-600 text-white' : 'bg-blue-600 text-white') : 'bg-gray-300 text-gray-600'
                    }`}>3</span>
                    <div>
                      <p className="font-medium text-blue-900">Distribution</p>
                      <p className="text-blue-700">Choose how to spread budget across months</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className={`rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                      currentStep >= 4 ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'
                    }`}>4</span>
                    <div>
                      <p className="font-medium text-blue-900">Monthly Details</p>
                      <p className="text-blue-700">Fine-tune monthly values and save</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 1: Basic Information */}
            {currentStep === 1 && (
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <span className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">1</span>
                  Basic Information
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Customer Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                        validationErrors.customer ? 'border-red-300' : 'border-gray-300'
                      }`}
                      value={budgetData.customer}
                      onChange={(e) => setBudgetData(prev => ({ ...prev, customer: e.target.value }))}
                      placeholder="e.g., Action Aid International (Tz)"
                    />
                    {validationErrors.customer && (
                      <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {validationErrors.customer}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Item/Product Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                        validationErrors.item ? 'border-red-300' : 'border-gray-300'
                      }`}
                      value={budgetData.item}
                      onChange={(e) => setBudgetData(prev => ({ ...prev, item: e.target.value }))}
                      placeholder="e.g., BF Goodrich All-Terrain Tyres"
                    />
                    {validationErrors.item && (
                      <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {validationErrors.item}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                      <select
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        value={budgetData.category}
                        onChange={(e) => setBudgetData(prev => ({ ...prev, category: e.target.value }))}
                      >
                        <option value="">Select category</option>
                        <option value="Tyres">Tyres</option>
                        <option value="Accessories">Accessories</option>
                        <option value="Batteries">Batteries</option>
                        <option value="Oil & Lubricants">Oil & Lubricants</option>
                        <option value="Spare Parts">Spare Parts</option>
                        <option value="Tools & Equipment">Tools & Equipment</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Brand</label>
                      <select
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        value={budgetData.brand}
                        onChange={(e) => setBudgetData(prev => ({ ...prev, brand: e.target.value }))}
                      >
                        <option value="">Select brand</option>
                        <option value="BF Goodrich">BF Goodrich</option>
                        <option value="Michelin">Michelin</option>
                        <option value="Bridgestone">Bridgestone</option>
                        <option value="Continental">Continental</option>
                        <option value="Generic">Generic</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Total Budget */}
            {currentStep === 2 && (
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <span className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">2</span>
                  Set Total Budget
                </h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Total Yearly Budget (USD) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-3 text-gray-500 text-lg">$</span>
                    <input
                      type="number"
                      className={`w-full pl-8 pr-3 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 text-lg font-semibold ${
                        validationErrors.totalBudget ? 'border-red-300' : 'border-gray-300'
                      }`}
                      value={budgetData.totalBudget || ''}
                      onChange={(e) => setBudgetData(prev => ({ ...prev, totalBudget: parseInt(e.target.value) || 0 }))}
                      placeholder="100000"
                    />
                  </div>
                  {validationErrors.totalBudget && (
                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {validationErrors.totalBudget}
                    </p>
                  )}
                  <p className="text-xs text-gray-600 mt-2">
                    💡 This amount will be distributed across all 12 months. You can adjust individual months later.
                  </p>
                  
                  {budgetData.totalBudget > 0 && (
                    <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-sm text-green-800">
                        <strong>Average per month:</strong> ${Math.round(budgetData.totalBudget / 12).toLocaleString()}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Step 3: Distribution */}
            {currentStep === 3 && (
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <span className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">3</span>
                  Distribution Method
                </h3>
                
                <p className="text-sm text-gray-600 mb-4">
                  Choose how to distribute your <strong>${budgetData.totalBudget.toLocaleString()}</strong> budget across the year:
                </p>
                
                <div className="space-y-3">
                  <button
                    onClick={distributeEvenly}
                    className="w-full bg-blue-100 text-blue-800 px-4 py-4 rounded-lg text-sm hover:bg-blue-200 transition-colors flex items-center gap-3 text-left"
                    disabled={!budgetData.totalBudget}
                  >
                    <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <div className="font-medium">Equal Distribution</div>
                      <div className="text-xs text-blue-600">
                        Same amount each month (~${Math.round((budgetData.totalBudget || 0) / 12).toLocaleString()}/month)
                      </div>
                      <div className="text-xs text-blue-500 mt-1">
                        Best for: Consistent sales patterns, stable demand
                      </div>
                    </div>
                  </button>
                  
                  <button
                    onClick={applySeasonalPattern}
                    className="w-full bg-green-100 text-green-800 px-4 py-4 rounded-lg text-sm hover:bg-green-200 transition-colors flex items-center gap-3 text-left"
                    disabled={!budgetData.totalBudget}
                  >
                    <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <TrendingUp className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <div className="font-medium">Seasonal Distribution</div>
                      <div className="text-xs text-green-600">
                        Higher in Q4 (Nov-Dec), lower in Q1 (Jan-Mar)
                      </div>
                      <div className="text-xs text-green-500 mt-1">
                        Best for: Holiday sales, seasonal products, end-of-year demand
                      </div>
                    </div>
                  </button>
                  
                  <div className="w-full bg-purple-100 text-purple-800 px-4 py-4 rounded-lg text-sm flex items-center gap-3">
                    <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <BarChart3 className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <div className="font-medium">Manual Distribution</div>
                      <div className="text-xs text-purple-600">
                        Customize each month individually in the next step
                      </div>
                      <div className="text-xs text-purple-500 mt-1">
                        Best for: Complex seasonal patterns, specific campaigns
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-xs text-yellow-800">
                    💡 <strong>Tip:</strong> You can always adjust individual months in Step 4, regardless of which method you choose here.
                  </p>
                </div>
              </div>
            )}

            {/* Step 4: Summary and Actions */}
            {currentStep === 4 && (
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <span className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">4</span>
                  Review & Save
                </h3>
                
                {/* Summary Cards */}
                <div className="space-y-3 mb-6">
                  <div className="bg-white p-3 rounded-lg border">
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-medium">Calculated Budget</span>
                    </div>
                    <p className="text-lg font-bold text-blue-600">${totals.totalBudget.toLocaleString()}</p>
                  </div>
                  
                  <div className="bg-white p-3 rounded-lg border">
                    <div className="flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-medium">Total Units</span>
                    </div>
                    <p className="text-lg font-bold text-green-600">{totals.totalUnits.toLocaleString()}</p>
                  </div>
                  
                  <div className="bg-white p-3 rounded-lg border">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-purple-600" />
                      <span className="text-sm font-medium">Net Budget</span>
                    </div>
                    <p className="text-lg font-bold text-purple-600">${totals.netBudget.toLocaleString()}</p>
                    <p className="text-xs text-gray-500">After discounts</p>
                  </div>
                </div>

                {validationErrors.monthly && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                    <p className="text-red-800 text-sm flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      {validationErrors.monthly}
                    </p>
                  </div>
                )}

                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <p className="text-sm text-green-800">
                    ✅ <strong>Ready to save!</strong> Your budget will be added to the main table and shared with the Rolling Forecast dashboard.
                  </p>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-6 pt-4 border-t">
              <button
                onClick={handlePrevStep}
                disabled={currentStep === 1}
                className="px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              
              {currentStep < 4 ? (
                <button
                  onClick={handleNextStep}
                  disabled={!isStepValid(currentStep)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next Step
                </button>
              ) : (
                <button
                  onClick={handleSave}
                  disabled={!isStepValid(4)}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Save Budget
                </button>
              )}
            </div>
          </div>

          {/* Right Panel - Monthly Budget Table */}
          <div className="flex-1 flex flex-col min-h-0 h-full">
            {/* Monthly Budget Header */}
            <div className="p-3 sm:p-4 border-b bg-white flex-shrink-0">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <h4 className="text-lg font-semibold flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-blue-600" />
                    Monthly Budget Details - {year}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {budgetData.totalBudget > 0
                      ? `Adjust monthly values below. Target: $${budgetData.totalBudget.toLocaleString()}`
                      : "Complete basic information and set total budget to see monthly breakdown"
                    }
                  </p>
                </div>

                <div className="flex gap-2">
                  <button className="bg-gray-100 text-gray-700 px-3 py-2 rounded-lg text-xs sm:text-sm hover:bg-gray-200 transition-colors flex items-center gap-2">
                    <Download className="w-3 h-3 sm:w-4 sm:h-4" />
                    Export
                  </button>
                </div>
              </div>
            </div>

            {/* Monthly Budget Table */}
            <div className="flex-1 p-3 sm:p-4 flex flex-col min-h-0">
              <div className="border border-gray-300 rounded-lg bg-white flex-1 flex flex-col min-h-0">
                <div className="flex-1 overflow-auto" style={{ minHeight: '300px', maxHeight: '500px' }}>
                  <table className="w-full border-collapse min-w-[900px]">
                    {/* Sticky Header */}
                    <thead className="sticky top-0 z-10">
                      <tr className="bg-gray-100 border-b-2 border-gray-300">
                        <th className="border-r border-gray-300 p-3 text-left text-sm font-semibold text-gray-700 bg-gray-100 min-w-[100px]">
                          📅 Month
                        </th>
                        <th className="border-r border-gray-300 p-3 text-center text-sm font-semibold text-gray-700 bg-gray-100 min-w-[120px]" title="Number of units to budget for this month">
                          📦 Budget Units
                          <div className="text-xs font-normal text-gray-500">Quantity to sell</div>
                        </th>
                        <th className="border-r border-gray-300 p-3 text-center text-sm font-semibold text-gray-700 bg-gray-100 min-w-[100px]" title="Price per unit">
                          💰 Rate ($)
                          <div className="text-xs font-normal text-gray-500">Price per unit</div>
                        </th>
                        <th className="border-r border-gray-300 p-3 text-center text-sm font-semibold text-gray-700 bg-gray-100 min-w-[100px]" title="Stock level">
                          📊 Stock
                          <div className="text-xs font-normal text-gray-500">Current inventory</div>
                        </th>
                        <th className="border-r border-gray-300 p-3 text-center text-sm font-semibold text-gray-700 bg-gray-100 min-w-[80px]" title="Goods in Transit">
                          🚛 GIT
                          <div className="text-xs font-normal text-gray-500">In transit</div>
                        </th>
                        <th className="border-r border-gray-300 p-3 text-center text-sm font-semibold text-gray-700 bg-gray-100 min-w-[100px]" title="Discount amount">
                          🏷️ Discount ($)
                          <div className="text-xs font-normal text-gray-500">Deduction</div>
                        </th>
                        <th className="p-3 text-center text-sm font-semibold text-gray-700 bg-gray-100 min-w-[120px]" title="Final calculated value">
                          ✅ Total Value ($)
                          <div className="text-xs font-normal text-gray-500">Units × Rate - Discount</div>
                        </th>
                      </tr>
                    </thead>
                    
                    {/* Scrollable Body */}
                    <tbody>
                      {budgetData.monthlyData.map((month, index) => (
                        <tr key={index} className="hover:bg-gray-50 border-b border-gray-200">
                          <td className="border-r border-gray-200 p-3 font-medium bg-gray-50 sticky left-0 z-5">
                            <div className="text-sm font-semibold">{month.month}</div>
                            <div className="text-xs text-gray-500">{month.full}</div>
                          </td>
                          <td className="border-r border-gray-200 p-2">
                            <input
                              type="number"
                              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-center"
                              value={month.budgetValue || ''}
                              onChange={(e) => handleMonthlyChange(index, 'budgetValue', parseInt(e.target.value) || 0)}
                              placeholder="0"
                            />
                          </td>
                          <td className="border-r border-gray-200 p-2">
                            <input
                              type="number"
                              step="0.01"
                              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-center"
                              value={month.rate || ''}
                              onChange={(e) => handleMonthlyChange(index, 'rate', parseFloat(e.target.value) || 0)}
                              placeholder="0.00"
                            />
                          </td>
                          <td className="border-r border-gray-200 p-2">
                            <input
                              type="number"
                              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-center"
                              value={month.stock || ''}
                              onChange={(e) => handleMonthlyChange(index, 'stock', parseInt(e.target.value) || 0)}
                              placeholder="0"
                            />
                          </td>
                          <td className="border-r border-gray-200 p-2">
                            <input
                              type="number"
                              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-center"
                              value={month.git || ''}
                              onChange={(e) => handleMonthlyChange(index, 'git', parseInt(e.target.value) || 0)}
                              placeholder="0"
                            />
                          </td>
                          <td className="border-r border-gray-200 p-2">
                            <input
                              type="number"
                              step="0.01"
                              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-center"
                              value={month.discount || ''}
                              onChange={(e) => handleMonthlyChange(index, 'discount', parseFloat(e.target.value) || 0)}
                              placeholder="0.00"
                            />
                          </td>
                          <td className="p-3 font-semibold text-green-600 bg-green-50 text-center">
                            ${((month.budgetValue * month.rate) - month.discount).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    
                    {/* Sticky Footer */}
                    <tfoot className="sticky bottom-0 z-10">
                      <tr className="bg-gray-200 font-bold border-t-2 border-gray-400">
                        <td className="border-r border-gray-400 p-3 font-bold text-gray-800 bg-gray-200 sticky left-0 z-15">
                          📊 TOTAL
                        </td>
                        <td className="border-r border-gray-400 p-3 font-bold text-blue-600 bg-blue-50 text-center">
                          {totals.totalUnits.toLocaleString()}
                        </td>
                        <td className="border-r border-gray-400 p-3 text-gray-500 bg-gray-200 text-center">
                          -
                        </td>
                        <td className="border-r border-gray-400 p-3 font-bold text-gray-800 bg-gray-200 text-center">
                          {budgetData.monthlyData.reduce((sum, month) => sum + month.stock, 0).toLocaleString()}
                        </td>
                        <td className="border-r border-gray-400 p-3 font-bold text-gray-800 bg-gray-200 text-center">
                          {budgetData.monthlyData.reduce((sum, month) => sum + month.git, 0).toLocaleString()}
                        </td>
                        <td className="border-r border-gray-400 p-3 font-bold text-red-600 bg-red-50 text-center">
                          ${totals.totalDiscount.toLocaleString()}
                        </td>
                        <td className="p-3 font-bold text-green-700 bg-green-100 text-lg text-center">
                          ${totals.netBudget.toLocaleString()}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="p-4 sm:p-6 border-t bg-gray-50 flex flex-col sm:flex-row gap-3 sm:justify-between flex-shrink-0">
              <div className="text-sm text-gray-600">
                💡 <strong>Tip:</strong> All fields are optional except Budget Units and Rate. The system will calculate Total Value automatically.
              </div>
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="px-4 sm:px-6 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm sm:text-base"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={!isStepValid(4)}
                  className={`px-4 sm:px-6 py-2 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm sm:text-base ${
                    isStepValid(4)
                      ? 'bg-green-600 text-white hover:bg-green-700'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  <Save className="w-4 h-4" />
                  {isStepValid(4)
                    ? 'Save & Add to Budget Table'
                    : 'Complete Required Fields'
                  }
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default YearlyBudgetModal;
