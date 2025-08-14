import { apiService } from '../lib/api';

export interface RollingForecastItem {
  id: string;
  customer: string;
  item: string;
  // Dynamic year data structure
  yearlyBudgets: { [year: string]: number };  // Budget data for any year
  yearlyActuals: { [year: string]: number };  // YTD/actual data for any year
  forecast: number;
  stock: number;
  git: number;
  eta: string;
  budgetDistribution?: { [key: string]: number };
  forecast_data?: { [key: string]: number };
  created_by?: number;
  created_at?: string;
  updated_at?: string;

  // Legacy compatibility fields
  bud25?: number;
  ytd25?: number;
}

export class RollingForecastService {
  async getAllForecasts(): Promise<RollingForecastItem[]> {
    try {
      const response = await apiService.getForecasts();
      if (response.data && response.data.results) {
        return response.data.results.map(this.transformBackendToFrontend);
      }
      throw new Error('No forecast data received');
    } catch (error) {
      console.error('Failed to fetch forecasts from API:', error);
      throw error;
    }
  }

  async createForecast(forecastData: Partial<RollingForecastItem>): Promise<RollingForecastItem> {
    try {
      const backendData = this.transformFrontendToBackend(forecastData);
      const response = await apiService.createForecast(backendData);
      if (response.data) {
        return this.transformBackendToFrontend(response.data);
      }
      throw new Error('Failed to create forecast');
    } catch (error) {
      console.error('Failed to create forecast:', error);
      throw error;
    }
  }

  async updateForecast(id: string, forecastData: Partial<RollingForecastItem>): Promise<RollingForecastItem> {
    try {
      const backendData = this.transformFrontendToBackend(forecastData);
      const response = await apiService.updateForecast(parseInt(id), backendData);
      if (response.data) {
        return this.transformBackendToFrontend(response.data);
      }
      throw new Error('Failed to update forecast');
    } catch (error) {
      console.error('Failed to update forecast:', error);
      throw error;
    }
  }

  async saveMonthlyForecastData(forecastId: string, monthlyData: { [key: string]: number }): Promise<RollingForecastItem> {
    try {
      // Calculate total forecast from monthly data
      const totalForecast = Object.values(monthlyData).reduce((sum, value) => sum + (value || 0), 0);
      
      const updateData = {
        forecast_data: monthlyData,
        forecast: totalForecast
      };

      return await this.updateForecast(forecastId, updateData);
    } catch (error) {
      console.error('Failed to save monthly forecast data:', error);
      throw error;
    }
  }

  async submitForecastForApproval(forecastData: RollingForecastItem[]): Promise<string> {
    try {
      // Create a submission batch
      const submissionId = `forecast_submission_${Date.now()}`;
      
      // Update all forecasts with submission status
      const promises = forecastData.map(forecast => 
        this.updateForecast(forecast.id, {
          ...forecast,
          // Add submission metadata
          forecast_data: {
            ...forecast.forecast_data,
            _submission_id: submissionId,
            _submitted_at: new Date().toISOString()
          }
        })
      );
      
      await Promise.all(promises);
      return submissionId;
    } catch (error) {
      console.error('Failed to submit forecasts for approval:', error);
      throw error;
    }
  }

  private transformBackendToFrontend(backendItem: any): RollingForecastItem {
    // Create dynamic year data structure
    const yearlyBudgets: { [year: string]: number } = {};
    const yearlyActuals: { [year: string]: number } = {};

    // Populate from legacy fields if available
    if (backendItem.bud25 !== undefined) yearlyBudgets['2025'] = backendItem.bud25;
    if (backendItem.ytd25 !== undefined) yearlyActuals['2025'] = backendItem.ytd25;

    // Populate from dynamic yearly data if available
    if (backendItem.yearly_budgets) {
      Object.assign(yearlyBudgets, backendItem.yearly_budgets);
    }
    if (backendItem.yearly_actuals) {
      Object.assign(yearlyActuals, backendItem.yearly_actuals);
    }

    return {
      id: backendItem.id.toString(),
      customer: backendItem.customer,
      item: backendItem.item,
      yearlyBudgets,
      yearlyActuals,
      forecast: backendItem.forecast || 0,
      stock: backendItem.stock || 0,
      git: backendItem.git || 0,
      eta: backendItem.eta || '',
      // Legacy compatibility
      bud25: backendItem.bud25 || 0,
      ytd25: backendItem.ytd25 || 0,
      budgetDistribution: this.generateDefaultBudgetDistribution(backendItem.bud25 || 0),
      forecast_data: typeof backendItem.forecast_data === 'object' ? backendItem.forecast_data : {},
      created_by: backendItem.created_by,
      created_at: backendItem.created_at,
      updated_at: backendItem.updated_at
    };
  }

  private transformFrontendToBackend(frontendItem: Partial<RollingForecastItem>): any {
    return {
      customer: frontendItem.customer || '',
      item: frontendItem.item || '',
      bud25: frontendItem.bud25 || 0,
      ytd25: frontendItem.ytd25 || 0,
      forecast: frontendItem.forecast || 0,
      stock: frontendItem.stock || 0,
      git: frontendItem.git || 0,
      eta: frontendItem.eta || '',
      forecast_data: frontendItem.forecast_data || {}
    };
  }

  private generateDefaultBudgetDistribution(totalBudget: number): { [key: string]: number } {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                   'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    const distribution: { [key: string]: number } = {};
    const baseAmount = Math.floor(totalBudget / 12);
    const remainder = totalBudget % 12;
    
    months.forEach((month, index) => {
      distribution[month] = baseAmount + (index < remainder ? 1 : 0);
    });
    
    return distribution;
  }
}

export const rollingForecastService = new RollingForecastService();
