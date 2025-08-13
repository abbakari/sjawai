// Sample GIT data for testing integration
export const sampleGitData = [
  {
    id: 'git_sample_1',
    customer: 'Action Aid International (Tz)',
    item: 'BF GOODRICH TYRE 235/85R16 120/116S TL ATT/A KO2 LRERWLGO',
    category: 'TYRE SERVICE',
    brand: 'BF GOODRICH',
    gitQuantity: 150,
    eta: '2025-09-15',
    supplier: 'BF Goodrich',
    poNumber: 'PO-2025-001',
    status: 'in_transit',
    priority: 'high',
    createdBy: 'Admin',
    createdAt: new Date().toISOString(),
    lastUpdated: new Date().toISOString(),
    notes: 'Urgent delivery for Q3 targets',
    trackingNumber: 'TRK-BFG-001',
    estimatedValue: 45000
  },
  {
    id: 'git_sample_2',
    customer: 'Action Aid International (Tz)',
    item: 'MICHELIN TYRE 265/65R17 112T TL LTX TRAIL',
    category: 'TYRE SERVICE',
    brand: 'MICHELIN',
    gitQuantity: 100,
    eta: '2025-08-24',
    supplier: 'Michelin',
    poNumber: 'PO-2025-002',
    status: 'shipped',
    priority: 'medium',
    createdBy: 'Admin',
    createdAt: new Date().toISOString(),
    lastUpdated: new Date().toISOString(),
    notes: 'Premium tire delivery',
    trackingNumber: 'TRK-MCH-002',
    estimatedValue: 30000
  },
  {
    id: 'git_sample_3',
    customer: 'ADVENT CONSTRUCTION LTD.',
    item: 'WHEEL BALANCE ALLOYD RIMS',
    category: 'TYRE SERVICE',
    brand: 'TYRE SERVICE',
    gitQuantity: 75,
    eta: '2025-10-01',
    supplier: 'Wheel Balance Co.',
    poNumber: 'PO-2025-003',
    status: 'ordered',
    priority: 'low',
    createdBy: 'Admin',
    createdAt: new Date().toISOString(),
    lastUpdated: new Date().toISOString(),
    notes: 'Standard delivery schedule',
    trackingNumber: '',
    estimatedValue: 15000
  },
  {
    id: 'git_sample_4',
    customer: 'ADVENT CONSTRUCTION LTD.',
    item: 'BF GOODRICH TYRE 235/85R16 120/116S TL ATT/A KO2 LRERWLGO',
    category: 'TYRE SERVICE',
    brand: 'BF GOODRICH',
    gitQuantity: 50,
    eta: '2025-09-15',
    supplier: 'BF Goodrich',
    poNumber: 'PO-2025-004',
    status: 'delayed',
    priority: 'urgent',
    createdBy: 'Admin',
    createdAt: new Date().toISOString(),
    lastUpdated: new Date().toISOString(),
    notes: 'Delayed due to supplier issues',
    trackingNumber: 'TRK-BFG-004',
    estimatedValue: 15000
  }
];

// Function to initialize sample data if no GIT data exists
export const initializeSampleGitData = () => {
  const existingData = localStorage.getItem('git_eta_data');
  if (!existingData || JSON.parse(existingData).length === 0) {
    console.log('Initializing sample GIT data...');
    localStorage.setItem('git_eta_data', JSON.stringify(sampleGitData));
    return true;
  }
  return false;
};
