import React, { useState } from 'react';
import { Plus, Edit, Trash2, Eye, Download, Filter, Search, MoreHorizontal, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface CustomerForecast {
  id: string;
  customerName: string;
  customerCode: string;
  region: string;
  segment: string;
  jan: number;
  feb: number;
  mar: number;
  apr: number;
  may: number;
  jun: number;
  jul: number;
  aug: number;
  sep: number;
  oct: number;
  nov: number;
  dec: number;
  q1Total: number;
  q2Total: number;
  q3Total: number;
  q4Total: number;
  yearTotal: number;
  growth: number;
  confidence: 'High' | 'Medium' | 'Low';
  lastUpdated: string;
  status: 'Active' | 'Draft' | 'Approved';
}

interface ExcelLikeCustomerTableProps {
  data?: CustomerForecast[];
  onNewForecast: () => void;
  onEditForecast: (customer: CustomerForecast) => void;
  onDeleteForecast: (id: string) => void;
  onViewDetails: (customer: CustomerForecast) => void;
}

const ExcelLikeCustomerTable: React.FC<ExcelLikeCustomerTableProps> = ({
  data = [],
  onNewForecast,
  onEditForecast,
  onDeleteForecast,
  onViewDetails
}) => {
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<keyof CustomerForecast>('customerName');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Sample data if none provided
  const sampleData: CustomerForecast[] = data.length > 0 ? data : [
    {
      id: '1',
      customerName: 'Acme Corporation',
      customerCode: 'ACME001',
      region: 'North',
      segment: 'Enterprise',
      jan: 125000, feb: 135000, mar: 145000, apr: 155000, may: 165000, jun: 175000,
      jul: 185000, aug: 195000, sep: 205000, oct: 215000, nov: 225000, dec: 235000,
      q1Total: 405000, q2Total: 495000, q3Total: 585000, q4Total: 675000,
      yearTotal: 2160000, growth: 12.5, confidence: 'High', lastUpdated: `${new Date().getFullYear()}-01-15`, status: 'Active'
    },
    {
      id: '2',
      customerName: 'Global Industries Ltd',
      customerCode: 'GLOB002',
      region: 'South',
      segment: 'Mid-Market',
      jan: 85000, feb: 90000, mar: 95000, apr: 100000, may: 105000, jun: 110000,
      jul: 115000, aug: 120000, sep: 125000, oct: 130000, nov: 135000, dec: 140000,
      q1Total: 270000, q2Total: 315000, q3Total: 360000, q4Total: 405000,
      yearTotal: 1350000, growth: 8.3, confidence: 'Medium', lastUpdated: `${new Date().getFullYear()}-01-12`, status: 'Draft'
    },
    {
      id: '3',
      customerName: 'Tech Solutions Inc',
      customerCode: 'TECH003',
      region: 'East',
      segment: 'SMB',
      jan: 45000, feb: 50000, mar: 55000, apr: 60000, may: 65000, jun: 70000,
      jul: 75000, aug: 80000, sep: 85000, oct: 90000, nov: 95000, dec: 100000,
      q1Total: 150000, q2Total: 195000, q3Total: 240000, q4Total: 285000,
      yearTotal: 870000, growth: 15.2, confidence: 'High', lastUpdated: `${new Date().getFullYear()}-01-10`, status: 'Approved'
    },
    {
      id: '4',
      customerName: 'Manufacturing Plus',
      customerCode: 'MANU004',
      region: 'West',
      segment: 'Enterprise',
      jan: 95000, feb: 100000, mar: 105000, apr: 110000, may: 115000, jun: 120000,
      jul: 125000, aug: 130000, sep: 135000, oct: 140000, nov: 145000, dec: 150000,
      q1Total: 300000, q2Total: 345000, q3Total: 390000, q4Total: 435000,
      yearTotal: 1470000, growth: 6.8, confidence: 'Medium', lastUpdated: `${new Date().getFullYear()}-01-08`, status: 'Active'
    },
    {
      id: '5',
      customerName: 'Retail Chain Co',
      customerCode: 'RETA005',
      region: 'Central',
      segment: 'Enterprise',
      jan: 75000, feb: 80000, mar: 85000, apr: 90000, may: 95000, jun: 100000,
      jul: 105000, aug: 110000, sep: 115000, oct: 120000, nov: 125000, dec: 130000,
      q1Total: 240000, q2Total: 285000, q3Total: 330000, q4Total: 375000,
      yearTotal: 1230000, growth: 9.1, confidence: 'Low', lastUpdated: `${new Date().getFullYear()}-01-05`, status: 'Draft'
    }
  ];

  const filteredData = sampleData.filter(customer =>
    customer.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.customerCode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedData = [...filteredData].sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];
    
    if (sortDirection === 'asc') {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    } else {
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
    }
  });

  const handleSelectAll = () => {
    if (selectedRows.length === sortedData.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(sortedData.map(customer => customer.id));
    }
  };

  const handleRowSelect = (id: string) => {
    setSelectedRows(prev =>
      prev.includes(id) ? prev.filter(rowId => rowId !== id) : [...prev, id]
    );
  };

  const handleSort = (field: keyof CustomerForecast) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      Active: 'bg-green-100 text-green-800',
      Draft: 'bg-yellow-100 text-yellow-800',
      Approved: 'bg-blue-100 text-blue-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getConfidenceBadge = (confidence: string) => {
    const colors = {
      High: 'bg-green-100 text-green-800',
      Medium: 'bg-yellow-100 text-yellow-800',
      Low: 'bg-red-100 text-red-800'
    };
    return colors[confidence as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Header with Actions */}
      <div className="p-4 border-b bg-gray-50">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Customer Forecasts</h3>
            <p className="text-sm text-gray-600">Manage yearly forecasts for all customers</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
            {/* Search */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search customers..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            {/* Action Buttons */}
            <div className="flex gap-2">
              <button className="bg-gray-100 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Filter
              </button>
              <button className="bg-green-100 text-green-700 px-3 py-2 rounded-lg hover:bg-green-200 transition-colors flex items-center gap-2">
                <Download className="w-4 h-4" />
                Export
              </button>
              <button
                onClick={onNewForecast}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                New Forecast
              </button>
            </div>
          </div>
        </div>
        
        {/* Bulk Actions */}
        {selectedRows.length > 0 && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between">
              <span className="text-sm text-blue-800">
                {selectedRows.length} customer{selectedRows.length > 1 ? 's' : ''} selected
              </span>
              <div className="flex gap-2">
                <button className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700">
                  Bulk Edit
                </button>
                <button className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700">
                  Delete Selected
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Excel-like Table */}
      <div className="overflow-auto" style={{ maxHeight: '600px' }}>
        <table className="w-full border-collapse">
          {/* Sticky Header */}
          <thead className="bg-gray-100 sticky top-0 z-10">
            <tr>
              {/* Checkbox Column */}
              <th className="sticky left-0 bg-gray-100 z-20 w-12 p-3 border-r border-gray-300">
                <input
                  type="checkbox"
                  className="w-4 h-4 accent-blue-600"
                  checked={selectedRows.length === sortedData.length && sortedData.length > 0}
                  onChange={handleSelectAll}
                />
              </th>
              
              {/* Customer Info Columns - Sticky */}
              <th className="sticky left-12 bg-gray-100 z-20 min-w-[200px] p-3 text-left border-r border-gray-300">
                <button
                  onClick={() => handleSort('customerName')}
                  className="flex items-center gap-1 font-semibold text-gray-700 hover:text-gray-900"
                >
                  Customer Name
                  {sortField === 'customerName' && (
                    sortDirection === 'asc' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />
                  )}
                </button>
              </th>
              
              <th className="sticky left-[252px] bg-gray-100 z-20 min-w-[120px] p-3 text-left border-r border-gray-300">
                <span className="font-semibold text-gray-700">Code</span>
              </th>
              
              <th className="sticky left-[372px] bg-gray-100 z-20 min-w-[100px] p-3 text-left border-r border-gray-300">
                <span className="font-semibold text-gray-700">Region</span>
              </th>
              
              <th className="sticky left-[472px] bg-gray-100 z-20 min-w-[100px] p-3 text-left border-r border-gray-300">
                <span className="font-semibold text-gray-700">Segment</span>
              </th>

              {/* Monthly Columns */}
              {months.map(month => (
                <th key={month} className="min-w-[100px] p-3 text-center border-r border-gray-300">
                  <span className="font-semibold text-gray-700">{month}</span>
                </th>
              ))}

              {/* Quarterly Totals */}
              <th className="min-w-[120px] p-3 text-center border-r border-gray-300 bg-blue-50">
                <span className="font-semibold text-blue-700">Q1 Total</span>
              </th>
              <th className="min-w-[120px] p-3 text-center border-r border-gray-300 bg-blue-50">
                <span className="font-semibold text-blue-700">Q2 Total</span>
              </th>
              <th className="min-w-[120px] p-3 text-center border-r border-gray-300 bg-blue-50">
                <span className="font-semibold text-blue-700">Q3 Total</span>
              </th>
              <th className="min-w-[120px] p-3 text-center border-r border-gray-300 bg-blue-50">
                <span className="font-semibold text-blue-700">Q4 Total</span>
              </th>

              {/* Year Total & Metrics */}
              <th className="min-w-[140px] p-3 text-center border-r border-gray-300 bg-green-50">
                <span className="font-semibold text-green-700">Year Total</span>
              </th>
              <th className="min-w-[100px] p-3 text-center border-r border-gray-300">
                <span className="font-semibold text-gray-700">Growth %</span>
              </th>
              <th className="min-w-[100px] p-3 text-center border-r border-gray-300">
                <span className="font-semibold text-gray-700">Confidence</span>
              </th>
              <th className="min-w-[100px] p-3 text-center border-r border-gray-300">
                <span className="font-semibold text-gray-700">Status</span>
              </th>
              
              {/* Actions Column */}
              <th className="sticky right-0 bg-gray-100 z-20 min-w-[120px] p-3 text-center border-l border-gray-300">
                <span className="font-semibold text-gray-700">Actions</span>
              </th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody>
            {sortedData.map((customer, index) => (
              <tr
                key={customer.id}
                className={`border-b border-gray-200 hover:bg-gray-50 ${
                  selectedRows.includes(customer.id) ? 'bg-blue-50' : index % 2 === 0 ? 'bg-white' : 'bg-gray-25'
                }`}
              >
                {/* Checkbox */}
                <td className="sticky left-0 bg-inherit z-10 p-3 border-r border-gray-300">
                  <input
                    type="checkbox"
                    className="w-4 h-4 accent-blue-600"
                    checked={selectedRows.includes(customer.id)}
                    onChange={() => handleRowSelect(customer.id)}
                  />
                </td>

                {/* Customer Info - Sticky */}
                <td className="sticky left-12 bg-inherit z-10 p-3 border-r border-gray-300">
                  <div className="font-medium text-gray-900">{customer.customerName}</div>
                  <div className="text-sm text-gray-500">Updated: {customer.lastUpdated}</div>
                </td>
                
                <td className="sticky left-[252px] bg-inherit z-10 p-3 border-r border-gray-300">
                  <span className="font-mono text-sm">{customer.customerCode}</span>
                </td>
                
                <td className="sticky left-[372px] bg-inherit z-10 p-3 border-r border-gray-300">
                  <span className="text-sm">{customer.region}</span>
                </td>
                
                <td className="sticky left-[472px] bg-inherit z-10 p-3 border-r border-gray-300">
                  <span className="text-sm">{customer.segment}</span>
                </td>

                {/* Monthly Values */}
                <td className="p-3 text-right border-r border-gray-300">{formatCurrency(customer.jan)}</td>
                <td className="p-3 text-right border-r border-gray-300">{formatCurrency(customer.feb)}</td>
                <td className="p-3 text-right border-r border-gray-300">{formatCurrency(customer.mar)}</td>
                <td className="p-3 text-right border-r border-gray-300">{formatCurrency(customer.apr)}</td>
                <td className="p-3 text-right border-r border-gray-300">{formatCurrency(customer.may)}</td>
                <td className="p-3 text-right border-r border-gray-300">{formatCurrency(customer.jun)}</td>
                <td className="p-3 text-right border-r border-gray-300">{formatCurrency(customer.jul)}</td>
                <td className="p-3 text-right border-r border-gray-300">{formatCurrency(customer.aug)}</td>
                <td className="p-3 text-right border-r border-gray-300">{formatCurrency(customer.sep)}</td>
                <td className="p-3 text-right border-r border-gray-300">{formatCurrency(customer.oct)}</td>
                <td className="p-3 text-right border-r border-gray-300">{formatCurrency(customer.nov)}</td>
                <td className="p-3 text-right border-r border-gray-300">{formatCurrency(customer.dec)}</td>

                {/* Quarterly Totals */}
                <td className="p-3 text-right border-r border-gray-300 bg-blue-50 font-semibold">
                  {formatCurrency(customer.q1Total)}
                </td>
                <td className="p-3 text-right border-r border-gray-300 bg-blue-50 font-semibold">
                  {formatCurrency(customer.q2Total)}
                </td>
                <td className="p-3 text-right border-r border-gray-300 bg-blue-50 font-semibold">
                  {formatCurrency(customer.q3Total)}
                </td>
                <td className="p-3 text-right border-r border-gray-300 bg-blue-50 font-semibold">
                  {formatCurrency(customer.q4Total)}
                </td>

                {/* Year Total & Metrics */}
                <td className="p-3 text-right border-r border-gray-300 bg-green-50 font-bold text-green-700">
                  {formatCurrency(customer.yearTotal)}
                </td>
                <td className="p-3 text-center border-r border-gray-300">
                  <span className={`flex items-center justify-center gap-1 ${customer.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {customer.growth >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                    {customer.growth.toFixed(1)}%
                  </span>
                </td>
                <td className="p-3 text-center border-r border-gray-300">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getConfidenceBadge(customer.confidence)}`}>
                    {customer.confidence}
                  </span>
                </td>
                <td className="p-3 text-center border-r border-gray-300">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(customer.status)}`}>
                    {customer.status}
                  </span>
                </td>

                {/* Actions - Sticky */}
                <td className="sticky right-0 bg-inherit z-10 p-3 border-l border-gray-300">
                  <div className="flex items-center justify-center gap-1">
                    <button
                      onClick={() => onViewDetails(customer)}
                      className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onEditForecast(customer)}
                      className="p-1 text-gray-600 hover:bg-gray-100 rounded"
                      title="Edit"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDeleteForecast(customer.id)}
                      className="p-1 text-red-600 hover:bg-red-100 rounded"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>

          {/* Summary Footer */}
          <tfoot className="bg-gray-100 sticky bottom-0">
            <tr className="border-t-2 border-gray-300">
              <td colSpan={5} className="p-3 font-bold text-gray-900">TOTALS:</td>
              
              {/* Monthly Totals */}
              {months.map(month => {
                const monthKey = month.toLowerCase() as keyof CustomerForecast;
                const total = sortedData.reduce((sum, customer) => sum + (customer[monthKey] as number), 0);
                return (
                  <td key={month} className="p-3 text-right font-bold border-r border-gray-300">
                    {formatCurrency(total)}
                  </td>
                );
              })}
              
              {/* Quarterly Totals */}
              <td className="p-3 text-right font-bold border-r border-gray-300 bg-blue-50">
                {formatCurrency(sortedData.reduce((sum, customer) => sum + customer.q1Total, 0))}
              </td>
              <td className="p-3 text-right font-bold border-r border-gray-300 bg-blue-50">
                {formatCurrency(sortedData.reduce((sum, customer) => sum + customer.q2Total, 0))}
              </td>
              <td className="p-3 text-right font-bold border-r border-gray-300 bg-blue-50">
                {formatCurrency(sortedData.reduce((sum, customer) => sum + customer.q3Total, 0))}
              </td>
              <td className="p-3 text-right font-bold border-r border-gray-300 bg-blue-50">
                {formatCurrency(sortedData.reduce((sum, customer) => sum + customer.q4Total, 0))}
              </td>
              
              {/* Year Total */}
              <td className="p-3 text-right font-bold border-r border-gray-300 bg-green-50 text-green-700">
                {formatCurrency(sortedData.reduce((sum, customer) => sum + customer.yearTotal, 0))}
              </td>
              
              <td colSpan={4} className="p-3"></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};

export default ExcelLikeCustomerTable;
