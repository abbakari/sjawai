// API Configuration for STM Budget Frontend

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

class ApiService {
  private baseURL: string;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    
    const defaultOptions: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, defaultOptions);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return { data };
    } catch (error) {
      console.error('API request failed:', error);
      return { 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      };
    }
  }

  // Authentication
  async login(username: string, password: string) {
    return this.request('/auth/login/', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
  }

  async getCurrentUser() {
    return this.request('/auth/me/');
  }

  // Budget API
  async getBudgets(params?: Record<string, any>) {
    const searchParams = params ? `?${new URLSearchParams(params)}` : '';
    return this.request(`/budgets/${searchParams}`);
  }

  async createBudget(budgetData: any) {
    return this.request('/budgets/', {
      method: 'POST',
      body: JSON.stringify(budgetData),
    });
  }

  async updateBudget(id: number, budgetData: any) {
    return this.request(`/budgets/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(budgetData),
    });
  }

  async getBudgetById(id: number) {
    return this.request(`/budgets/${id}/`);
  }

  async deleteBudget(id: number) {
    return this.request(`/budgets/${id}/`, {
      method: 'DELETE',
    });
  }

  // Forecast API
  async getForecasts(params?: Record<string, any>) {
    const searchParams = params ? `?${new URLSearchParams(params)}` : '';
    return this.request(`/forecasts/${searchParams}`);
  }

  async createForecast(forecastData: any) {
    return this.request('/forecasts/', {
      method: 'POST',
      body: JSON.stringify(forecastData),
    });
  }

  async updateForecast(id: number, forecastData: any) {
    return this.request(`/forecasts/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(forecastData),
    });
  }

  // Users API
  async getUsers() {
    return this.request('/users/');
  }

  // Health check
  async healthCheck() {
    return this.request('/health/');
  }
}

// Export singleton instance
export const apiService = new ApiService();

// Export types
export type { ApiResponse };
export default ApiService;
