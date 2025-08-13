import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole, AuthContextType, ROLE_PERMISSIONS, ROLE_DASHBOARDS } from '../types/auth';
import { supabase, isSupabaseConfigured, handleSupabaseError } from '../lib/supabase';
import type { Session, User as SupabaseUser } from '@supabase/supabase-js';

// Mock user data for development (fallback when Supabase not configured)
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
  const [session, setSession] = useState<Session | null>(null);

  // Convert Supabase user to our User type
  const convertSupabaseUser = async (supabaseUser: SupabaseUser): Promise<User | null> => {
    try {
      const { data: userData, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', supabaseUser.id)
        .single();

      if (error) {
        console.warn('User not found in users table, using email-based role detection');
        // Fallback: determine role based on email for demo users
        const email = supabaseUser.email;
        let role: UserRole = 'salesman'; // default
        let name = supabaseUser.user_metadata?.name || email?.split('@')[0] || 'Unknown User';
        let department = 'Unknown';

        if (email?.includes('admin')) {
          role = 'admin';
          name = 'System Administrator';
          department = 'IT';
        } else if (email?.includes('manager')) {
          role = 'manager';
          name = 'Jane Manager';
          department = 'Sales';
        } else if (email?.includes('supply')) {
          role = 'supply_chain';
          name = 'Bob Supply Chain';
          department = 'Supply Chain';
        } else if (email?.includes('salesman')) {
          role = 'salesman';
          name = 'John Salesman';
          department = 'Sales';
        }

        return {
          id: supabaseUser.id,
          name,
          email: email || '',
          role,
          department,
          permissions: ROLE_PERMISSIONS[role],
          isActive: true,
          createdAt: supabaseUser.created_at,
          lastLogin: new Date().toISOString()
        };
      }

      return {
        id: userData.id,
        name: userData.name,
        email: userData.email,
        role: userData.role as UserRole,
        department: userData.department,
        permissions: ROLE_PERMISSIONS[userData.role as UserRole],
        isActive: userData.is_active,
        createdAt: userData.created_at,
        lastLogin: userData.last_login || new Date().toISOString()
      };
    } catch (err) {
      console.error('Error converting Supabase user:', err);
      return null;
    }
  };

  // Check for existing session on mount
  useEffect(() => {
    let mounted = true;

    const getSession = async () => {
      try {
        if (!isSupabaseConfigured()) {
          // Fallback to local storage for development
          const savedUser = localStorage.getItem('user');
          if (savedUser) {
            try {
              const parsedUser = JSON.parse(savedUser);
              setUser(parsedUser);
            } catch (error) {
              console.error('Error parsing saved user:', error);
              localStorage.removeItem('user');
            }
          }
          setIsLoading(false);
          return;
        }

        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          setError(error?.message || error || 'Authentication error');
        } else if (session && mounted) {
          setSession(session);
          const convertedUser = await convertSupabaseUser(session.user);
          if (convertedUser) {
            setUser(convertedUser);
          }
        }
      } catch (err) {
        console.error('Error in getSession:', err);
        setError('Failed to get session');
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    getSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;

        setSession(session);
        
        if (session?.user) {
          const convertedUser = await convertSupabaseUser(session.user);
          setUser(convertedUser);
        } else {
          setUser(null);
        }
        
        setIsLoading(false);
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);

    try {
      if (!isSupabaseConfigured()) {
        // Fallback to mock authentication for development
        await new Promise(resolve => setTimeout(resolve, 1000));

        const mockUser = MOCK_USERS[email];

        if (!mockUser) {
          throw new Error('Invalid email or password');
        }

        if (password !== 'password') {
          throw new Error('Invalid email or password');
        }

        const updatedUser = {
          ...mockUser,
          lastLogin: new Date().toISOString()
        };

        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        return;
      }

      // Handle demo users with simplified auth (no Supabase Auth required)
      if (email.includes('@example.com') && password === 'password') {
        // Get user from database directly
        const { data: userData, error } = await supabase
          .from('users')
          .select('*')
          .eq('email', email)
          .single();

        if (error || !userData) {
          throw new Error('Demo user not found in database');
        }

        const user: User = {
          id: userData.id,
          name: userData.name,
          email: userData.email,
          role: userData.role as UserRole,
          department: userData.department,
          permissions: ROLE_PERMISSIONS[userData.role as UserRole],
          isActive: userData.is_active,
          createdAt: userData.created_at,
          lastLogin: new Date().toISOString()
        };

        // Update last login in database
        await supabase
          .from('users')
          .update({ last_login: new Date().toISOString() })
          .eq('id', userData.id);

        setUser(user);
        return;
      }

      // Use Supabase authentication
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      if (data.user) {
        const convertedUser = await convertSupabaseUser(data.user);
        if (convertedUser) {
          setUser(convertedUser);
          
          // Update last login in database
          await supabase
            .from('users')
            .update({ last_login: new Date().toISOString() })
            .eq('id', data.user.id);
        }
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Login failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      if (isSupabaseConfigured()) {
        const { error } = await supabase.auth.signOut();
        if (error) {
          console.error('Error signing out:', error);
        }
      } else {
        // Fallback for development
        localStorage.removeItem('user');
      }
      
      setUser(null);
      setSession(null);
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
