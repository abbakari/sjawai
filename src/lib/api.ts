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

    // Get JWT token from localStorage
    const token = localStorage.getItem('access_token');

    const defaultOptions: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
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
  async login(email: string, password: string) {
    return this.request('/auth/login/', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async getCurrentUser() {
    return this.request('/auth/me/');
  }

  async getUserProfile() {
    return this.request('/auth/profile/');
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

  async getForecastById(id: number) {
    return this.request(`/forecasts/${id}/`);
  }

  // Users API
  async getUsers() {
    return this.request('/users/');
  }

  // Health check (note: health endpoint is at root level, not under /api/)
  async healthCheck() {
    const url = `${this.baseURL.replace('/api', '')}/health/`;
    const defaultOptions: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
      },
    };

    try {
      const response = await fetch(url, defaultOptions);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return { data };
    } catch (error) {
      console.error('Health check failed:', error);
      return {
        error: error instanceof Error ? error.message : 'Health check failed'
      };
    }
  }
}

// Export singleton instance
export const apiService = new ApiService();

// Export types
export type { ApiResponse };
export default ApiService;
