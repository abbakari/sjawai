// Shared data persistence utility for sales budget and forecast data
// This ensures data saved by salesman is visible to managers

export interface SavedForecastData {
  id: string;
  customer: string;
  item: string;
  category: string;
  brand: string;
  type: 'sales_budget' | 'rolling_forecast';
  createdBy: string;
  createdAt: string;
  lastModified: string;
  budgetData?: {
    bud25: number;
    ytd25: number;
    budget2026: number;
    rate: number;
    stock: number;
    git: number;
    eta?: string;
    budgetValue2026: number;
    discount: number;
    monthlyData: Array<{
      month: string;
      budgetValue: number;
      actualValue: number;
      rate: number;
      stock: number;
      git: number;
      discount: number;
    }>;
  };
  forecastData?: {
    [month: string]: number; // Monthly forecast units
  };
  forecastTotal: number;
  status: 'draft' | 'saved' | 'submitted' | 'approved';
  // Metadata for tracking submissions and preserving originals
  submissionMetadata?: {
    originalId: string;
    workflowId: string;
    submittedAt: string;
    originalStatus: 'draft' | 'saved' | 'submitted' | 'approved';
  };
}

export interface SavedBudgetData {
  id: string;
  customer: string;
  item: string;
  category: string;
  brand: string;
  type: 'sales_budget';
  createdBy: string;
  createdAt: string;
  lastModified: string;
  budget2025: number;
  actual2025: number;
  budget2026: number;
  rate: number;
  stock: number;
  git: number;
  budgetValue2026: number;
  discount: number;
  monthlyData: Array<{
    month: string;
    budgetValue: number;
    actualValue: number;
    rate: number;
    stock: number;
    git: number;
    discount: number;
  }>;
  status: 'draft' | 'saved' | 'submitted' | 'approved';
  // Metadata for tracking submissions and preserving originals
  submissionMetadata?: {
    originalId: string;
    workflowId: string;
    submittedAt: string;
    originalStatus: 'draft' | 'saved' | 'submitted' | 'approved';
  };
}

const SALES_BUDGET_STORAGE_KEY = 'sales_budget_saved_data';
const ROLLING_FORECAST_STORAGE_KEY = 'rolling_forecast_saved_data';

export class DataPersistenceManager {
  // Save sales budget data
  static saveSalesBudgetData(data: SavedBudgetData[]): void {
    try {
      const existingData = this.getSalesBudgetData();
      const mergedData = [...existingData];

      data.forEach(newItem => {
        const existingIndex = mergedData.findIndex(item => 
          item.id === newItem.id || 
          (item.customer === newItem.customer && item.item === newItem.item)
        );
        
        if (existingIndex >= 0) {
          // Update existing item
          mergedData[existingIndex] = {
            ...newItem,
            lastModified: new Date().toISOString()
          };
        } else {
          // Add new item
          mergedData.push({
            ...newItem,
            lastModified: new Date().toISOString()
          });
        }
      });

      localStorage.setItem(SALES_BUDGET_STORAGE_KEY, JSON.stringify(mergedData));
      console.log('Sales budget data saved successfully:', mergedData.length, 'items');
    } catch (error) {
      console.error('Error saving sales budget data:', error);
    }
  }

  // Get sales budget data
  static getSalesBudgetData(): SavedBudgetData[] {
    try {
      const data = localStorage.getItem(SALES_BUDGET_STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error loading sales budget data:', error);
      return [];
    }
  }

  // Save rolling forecast data
  static saveRollingForecastData(data: SavedForecastData[]): void {
    try {
      const existingData = this.getRollingForecastData();
      const mergedData = [...existingData];

      data.forEach(newItem => {
        const existingIndex = mergedData.findIndex(item => 
          item.id === newItem.id || 
          (item.customer === newItem.customer && item.item === newItem.item)
        );
        
        if (existingIndex >= 0) {
          // Update existing item
          mergedData[existingIndex] = {
            ...newItem,
            lastModified: new Date().toISOString()
          };
        } else {
          // Add new item
          mergedData.push({
            ...newItem,
            lastModified: new Date().toISOString()
          });
        }
      });

      localStorage.setItem(ROLLING_FORECAST_STORAGE_KEY, JSON.stringify(mergedData));
      console.log('Rolling forecast data saved successfully:', mergedData.length, 'items');
    } catch (error) {
      console.error('Error saving rolling forecast data:', error);
    }
  }

  // Get rolling forecast data
  static getRollingForecastData(): SavedForecastData[] {
    try {
      const data = localStorage.getItem(ROLLING_FORECAST_STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error loading rolling forecast data:', error);
      return [];
    }
  }

  // Get data by user (for managers to see salesman data)
  static getSalesBudgetDataByUser(userName?: string): SavedBudgetData[] {
    const allData = this.getSalesBudgetData();
    if (!userName) return allData;
    return allData.filter(item => item.createdBy === userName);
  }

  static getRollingForecastDataByUser(userName?: string): SavedForecastData[] {
    const allData = this.getRollingForecastData();
    if (!userName) return allData;
    return allData.filter(item => item.createdBy === userName);
  }

  // Get data by customer (for managers to see customer breakdown)
  static getSalesBudgetDataByCustomer(customerName: string): SavedBudgetData[] {
    const allData = this.getSalesBudgetData();
    return allData.filter(item => item.customer.toLowerCase().includes(customerName.toLowerCase()));
  }

  static getRollingForecastDataByCustomer(customerName: string): SavedForecastData[] {
    const allData = this.getRollingForecastData();
    return allData.filter(item => item.customer.toLowerCase().includes(customerName.toLowerCase()));
  }

  // Update status of saved data while preserving original entry
  static updateSalesBudgetStatus(itemId: string, status: 'draft' | 'saved' | 'submitted' | 'approved'): void {
    const allData = this.getSalesBudgetData();
    const updatedData = allData.map(item => {
      if (item.id === itemId) {
        return { ...item, status, lastModified: new Date().toISOString() };
      }
      return item;
    });
    localStorage.setItem(SALES_BUDGET_STORAGE_KEY, JSON.stringify(updatedData));
    console.log(`Sales budget status updated: ${itemId} -> ${status}`);
  }

  static updateRollingForecastStatus(itemId: string, status: 'draft' | 'saved' | 'submitted' | 'approved'): void {
    const allData = this.getRollingForecastData();
    const updatedData = allData.map(item => {
      if (item.id === itemId) {
        return { ...item, status, lastModified: new Date().toISOString() };
      }
      return item;
    });
    localStorage.setItem(ROLLING_FORECAST_STORAGE_KEY, JSON.stringify(updatedData));
    console.log(`Rolling forecast status updated: ${itemId} -> ${status}`);
  }

  // Create submission copy while preserving original data
  static createSubmissionCopy(originalData: SavedBudgetData | SavedForecastData, workflowId: string): SavedBudgetData | SavedForecastData {
    const submissionCopy = {
      ...originalData,
      id: `${originalData.id}_submission_${workflowId}`,
      status: 'submitted' as const,
      lastModified: new Date().toISOString(),
      // Add metadata to track submission
      submissionMetadata: {
        originalId: originalData.id,
        workflowId,
        submittedAt: new Date().toISOString(),
        originalStatus: originalData.status
      }
    };

    console.log('Created submission copy with ID:', submissionCopy.id);
    return submissionCopy;
  }

  // Save submission copies while keeping originals intact
  static saveSubmissionCopies(budgetData: SavedBudgetData[], forecastData: SavedForecastData[], workflowId: string): void {
    try {
      // Create submission copies for budget data
      if (budgetData.length > 0) {
        const budgetCopies = budgetData.map(item => this.createSubmissionCopy(item, workflowId) as SavedBudgetData);
        this.saveSalesBudgetData(budgetCopies);
      }

      // Create submission copies for forecast data
      if (forecastData.length > 0) {
        const forecastCopies = forecastData.map(item => this.createSubmissionCopy(item, workflowId) as SavedForecastData);
        this.saveRollingForecastData(forecastCopies);
      }

      console.log(`Submission copies saved for workflow ${workflowId}`);
    } catch (error) {
      console.error('Error saving submission copies:', error);
    }
  }

  // Clear all data (admin function)
  static clearAllData(): void {
    localStorage.removeItem(SALES_BUDGET_STORAGE_KEY);
    localStorage.removeItem(ROLLING_FORECAST_STORAGE_KEY);
    console.log('All sales budget and forecast data cleared');
  }

  // Get summary statistics for managers - including submission tracking
  static getSummaryStats() {
    const budgetData = this.getSalesBudgetData();
    const forecastData = this.getRollingForecastData();

    // Separate original vs submission copies
    const originalBudgetData = budgetData.filter(item => !item.submissionMetadata);
    const submittedBudgetData = budgetData.filter(item => item.submissionMetadata);
    const originalForecastData = forecastData.filter(item => !item.submissionMetadata);
    const submittedForecastData = forecastData.filter(item => item.submissionMetadata);

    const totalBudgetItems = originalBudgetData.length;
    const totalForecastItems = originalForecastData.length;
    const totalSubmittedBudgetItems = submittedBudgetData.length;
    const totalSubmittedForecastItems = submittedForecastData.length;

    const totalBudgetValue = originalBudgetData.reduce((sum, item) => sum + item.budgetValue2026, 0);
    const totalForecastValue = originalForecastData.reduce((sum, item) => sum + item.forecastTotal * 100, 0);
    const totalSubmittedBudgetValue = submittedBudgetData.reduce((sum, item) => sum + item.budgetValue2026, 0);
    const totalSubmittedForecastValue = submittedForecastData.reduce((sum, item) => sum + item.forecastTotal * 100, 0);

    const uniqueCustomers = new Set([
      ...originalBudgetData.map(item => item.customer),
      ...originalForecastData.map(item => item.customer)
    ]);

    const uniqueSalesmen = new Set([
      ...originalBudgetData.map(item => item.createdBy),
      ...originalForecastData.map(item => item.createdBy)
    ]);

    return {
      // Original data (still available for other purposes)
      totalBudgetItems,
      totalForecastItems,
      totalBudgetValue,
      totalForecastValue,
      // Submitted data (for approval workflow)
      totalSubmittedBudgetItems,
      totalSubmittedForecastItems,
      totalSubmittedBudgetValue,
      totalSubmittedForecastValue,
      // General stats
      uniqueCustomers: uniqueCustomers.size,
      uniqueSalesmen: uniqueSalesmen.size,
      lastUpdated: new Date().toISOString()
    };
  }

  // Get only original data (excluding submission copies)
  static getOriginalSalesBudgetData(): SavedBudgetData[] {
    return this.getSalesBudgetData().filter(item => !item.submissionMetadata);
  }

  static getOriginalRollingForecastData(): SavedForecastData[] {
    return this.getRollingForecastData().filter(item => !item.submissionMetadata);
  }

  // Get only submitted data (submission copies)
  static getSubmittedSalesBudgetData(): SavedBudgetData[] {
    return this.getSalesBudgetData().filter(item => item.submissionMetadata);
  }

  static getSubmittedRollingForecastData(): SavedForecastData[] {
    return this.getRollingForecastData().filter(item => item.submissionMetadata);
  }

  // Get data by workflow ID
  static getDataByWorkflowId(workflowId: string): { budgetData: SavedBudgetData[], forecastData: SavedForecastData[] } {
    const budgetData = this.getSalesBudgetData().filter(item =>
      item.submissionMetadata?.workflowId === workflowId
    );
    const forecastData = this.getRollingForecastData().filter(item =>
      item.submissionMetadata?.workflowId === workflowId
    );

    return { budgetData, forecastData };
  }

  // Sync data between budget and forecast (for consistency)
  static syncBudgetToForecast(): void {
    const budgetData = this.getSalesBudgetData();
    const forecastData = this.getRollingForecastData();

    // Update forecast data with latest budget information
    const updatedForecastData = forecastData.map(forecastItem => {
      const matchingBudget = budgetData.find(budgetItem =>
        budgetItem.customer === forecastItem.customer &&
        budgetItem.item === forecastItem.item
      );

      if (matchingBudget && matchingBudget.lastModified > forecastItem.lastModified) {
        return {
          ...forecastItem,
          budgetData: {
            bud25: matchingBudget.budget2025,
            ytd25: matchingBudget.actual2025,
            budget2026: matchingBudget.budget2026,
            rate: matchingBudget.rate,
            stock: matchingBudget.stock,
            git: matchingBudget.git,
            budgetValue2026: matchingBudget.budgetValue2026,
            discount: matchingBudget.discount,
            monthlyData: matchingBudget.monthlyData
          },
          lastModified: new Date().toISOString()
        };
      }

      return forecastItem;
    });

    this.saveRollingForecastData(updatedForecastData);
  }

  // Get GIT data uploaded by admin
  static getGitData() {
    try {
      const data = localStorage.getItem('git_eta_data');
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error loading GIT data:', error);
      return [];
    }
  }

  // Get GIT data for a specific customer and item
  static getGitDataForItem(customer: string, item: string) {
    try {
      const gitData = this.getGitData();
      console.log('Getting GIT data for:', customer, item, 'Total GIT items:', gitData.length);

      const filtered = gitData.filter((gitItem: any) =>
        gitItem.customer && gitItem.item &&
        gitItem.customer.toLowerCase().includes(customer.toLowerCase()) &&
        gitItem.item.toLowerCase().includes(item.toLowerCase())
      );

      console.log('Filtered GIT items:', filtered.length, filtered);
      return filtered;
    } catch (error) {
      console.error('Error getting GIT data for item:', error);
      return [];
    }
  }

  // Get aggregated GIT quantity and ETA for customer/item combination
  static getGitSummaryForItem(customer: string, item: string) {
    try {
      const gitItems = this.getGitDataForItem(customer, item);

      console.log('GIT summary for', customer, item, '- found items:', gitItems.length);

      if (gitItems.length === 0) {
        return { gitQuantity: 0, eta: '', status: 'none', itemCount: 0 };
      }

      const totalGitQuantity = gitItems.reduce((sum: number, gitItem: any) => sum + (gitItem.gitQuantity || 0), 0);

      // Get the earliest ETA that's not yet arrived
      const futureEtas = gitItems
        .filter((item: any) => item.eta && item.status !== 'arrived' && new Date(item.eta) >= new Date())
        .sort((a: any, b: any) => new Date(a.eta).getTime() - new Date(b.eta).getTime());

      const earliestEta = futureEtas.length > 0 ? futureEtas[0].eta : (gitItems[0]?.eta || '');
      const overallStatus = this.determineOverallGitStatus(gitItems);

      const summary = {
        gitQuantity: totalGitQuantity,
        eta: earliestEta,
        status: overallStatus,
        itemCount: gitItems.length
      };

      console.log('GIT summary result:', summary);
      return summary;
    } catch (error) {
      console.error('Error calculating GIT summary:', error);
      return { gitQuantity: 0, eta: '', status: 'none', itemCount: 0 };
    }
  }

  // Determine overall status from multiple GIT items
  private static determineOverallGitStatus(gitItems: any[]) {
    if (gitItems.length === 0) return 'none';

    const statuses = gitItems.map(item => item.status);

    if (statuses.includes('delayed')) return 'delayed';
    if (statuses.includes('in_transit')) return 'in_transit';
    if (statuses.includes('shipped')) return 'shipped';
    if (statuses.includes('ordered')) return 'ordered';
    if (statuses.every(status => status === 'arrived')) return 'arrived';

    return 'mixed';
  }
}

export default DataPersistenceManager;
