import { createClient } from '@supabase/supabase-js'

// These will be set via environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://fillhumxgqahodknjxji.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZpbGxodW14Z3FhaG9ka25qeGppIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUwNzE1MjUsImV4cCI6MjA3MDY0NzUyNX0.mWHmgKt-MJZiBuy1IkUrjK5-RATF8NwGbWD4xLIrsmA'

// Log configuration for debugging
console.log('Supabase Configuration:', {
  url: supabaseUrl,
  hasKey: !!supabaseAnonKey,
  keyPrefix: supabaseAnonKey.substring(0, 20) + '...'
})

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database table names
export const TABLES = {
  USERS: 'users',
  YEARLY_BUDGETS: 'yearly_budgets',
  MONTHLY_BUDGETS: 'monthly_budgets', 
  STOCK_REQUESTS: 'stock_requests',
  STOCK_ALERTS: 'stock_alerts',
  STOCK_PROJECTIONS: 'stock_projections',
  STOCK_OVERVIEWS: 'stock_overviews',
  STOCK_OVERVIEW_ITEMS: 'stock_overview_items',
  WORKFLOW_ITEMS: 'workflow_items',
  WORKFLOW_COMMENTS: 'workflow_comments',
  WORKFLOW_NOTIFICATIONS: 'workflow_notifications',
  FORECAST_DATA: 'forecast_data',
  GIT_ETA_DATA: 'git_eta_data',
  COMMUNICATION_MESSAGES: 'communication_messages'
} as const

// Helper function to check if Supabase is properly configured
export const isSupabaseConfigured = () => {
  return supabaseUrl !== 'YOUR_SUPABASE_URL' && supabaseAnonKey !== 'YOUR_SUPABASE_ANON_KEY'
}

// Helper function for error handling
export const handleSupabaseError = (error: any, operation: string) => {
  console.error(`Supabase ${operation} error:`, error)
  throw new Error(error.message || `${operation} failed`)
}
