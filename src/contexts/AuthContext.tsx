import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole, AuthContextType, ROLE_PERMISSIONS, ROLE_DASHBOARDS } from '../types/auth';
import { apiService } from '../lib/api';

// Mock user data for development
const MOCK_USERS: Record<string, User> = {
  'admin@example.com': {
    id: '1',
    name: 'System Administrator',
    email: 'admin@example.com',
    role: 'admin',
    department: 'IT',
    permissions: ROLE_PERMISSIONS.admin,
    isActive: true,
    createdAt: '2024-01-01',
    lastLogin: new Date().toISOString()
  },
  'salesman@example.com': {
    id: '2',
    name: 'John Salesman',
    email: 'salesman@example.com',
    role: 'salesman',
    department: 'Sales',
    permissions: ROLE_PERMISSIONS.salesman,
    isActive: true,
    createdAt: '2024-01-01',
    lastLogin: new Date().toISOString()
  },
  'manager@example.com': {
    id: '3',
    name: 'Jane Manager',
    email: 'manager@example.com',
    role: 'manager',
    department: 'Sales',
    permissions: ROLE_PERMISSIONS.manager,
    isActive: true,
    createdAt: '2024-01-01',
    lastLogin: new Date().toISOString()
  },
  'supply@example.com': {
    id: '4',
    name: 'Bob Supply Chain',
    email: 'supply@example.com',
    role: 'supply_chain',
    department: 'Supply Chain',
    permissions: ROLE_PERMISSIONS.supply_chain,
    isActive: true,
    createdAt: '2024-01-01',
    lastLogin: new Date().toISOString()
  }
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);


  // Check for existing session on mount
  useEffect(() => {
    let mounted = true;

    const getSession = async () => {
      try {
        // Optional health check with timeout
        try {
          const healthCheck = await Promise.race([
            apiService.healthCheck(),
            new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 2000))
          ]);
          if (healthCheck.data) {
            console.log('Backend API is healthy:', healthCheck.data);
          }
        } catch (healthError) {
          console.warn('Health check failed or timed out, using localStorage only:', healthError);
        }

        // Use local storage for authentication
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
          try {
            const parsedUser = JSON.parse(savedUser);
            setUser(parsedUser);
            console.log('User loaded from localStorage:', parsedUser.email);
          } catch (error) {
            console.error('Error parsing saved user:', error);
            localStorage.removeItem('user');
          }
        }
      } catch (err) {
        console.error('Error in getSession:', err);
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    getSession();

    return () => {
      mounted = false;
    };
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('Attempting API login for:', email);
      const response = await apiService.login(email, password);

      if (response.error) {
        throw new Error(response.error);
      } else if (response.data) {
        // API login successful
        console.log('API login successful for:', email);
        const userData = response.data as any;

        // Store JWT tokens
        if (userData.access) {
          localStorage.setItem('access_token', userData.access);
        }
        if (userData.refresh) {
          localStorage.setItem('refresh_token', userData.refresh);
        }

        const apiUser: User = {
          id: userData.user?.id?.toString() || '1',
          name: userData.user?.name || email,
          email: userData.user?.email || email,
          role: (userData.user?.role || 'salesman') as UserRole,
          department: userData.user?.department || 'Sales',
          permissions: userData.user?.permissions || ROLE_PERMISSIONS[(userData.user?.role || 'salesman') as UserRole] || [],
          isActive: userData.user?.is_active !== false,
          createdAt: userData.user?.created_at || new Date().toISOString(),
          lastLogin: new Date().toISOString()
        };

        setUser(apiUser);
        localStorage.setItem('user', JSON.stringify(apiUser));
      } else {
        throw new Error('No response data received');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      const errorMessage = err.message || 'Login failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      localStorage.removeItem('user');
      setUser(null);
    } catch (err) {
      console.error('Error during logout:', err);
    }
  };

  const value: AuthContextType = {
    user,
    login,
    logout,
    isLoading,
    error
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Utility functions for role-based access
export const hasPermission = (user: User | null, resource: string, action: string): boolean => {
  if (!user) return false;
  
  return user.permissions.some(permission => 
    permission.resource === resource && permission.action === action
  );
};

export const canAccessDashboard = (user: User | null, dashboardName: string): boolean => {
  if (!user) return false;
  
  const userDashboards = ROLE_DASHBOARDS[user.role];
  return userDashboards.includes(dashboardName);
};

export const getUserRoleName = (role: UserRole): string => {
  switch (role) {
    case 'admin':
      return 'Administrator';
    case 'salesman':
      return 'Salesman';
    case 'manager':
      return 'Manager';
    case 'supply_chain':
      return 'Supply Chain';
    default:
      return 'Unknown';
  }
};
