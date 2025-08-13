-- STMBudget Database Schema for Supabase
-- Run this SQL in your Supabase SQL editor to set up the database

-- Enable RLS (Row Level Security)
ALTER DEFAULT PRIVILEGES REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC;

-- Create users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'salesman', 'manager', 'supply_chain')),
  department TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login TIMESTAMP WITH TIME ZONE
);

-- Create yearly_budgets table
CREATE TABLE IF NOT EXISTS yearly_budgets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer TEXT NOT NULL,
  item TEXT NOT NULL,
  category TEXT NOT NULL,
  brand TEXT NOT NULL,
  year TEXT NOT NULL,
  total_budget DECIMAL(15,2) NOT NULL DEFAULT 0,
  created_by UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create monthly_budgets table (for monthly data within yearly budgets)
CREATE TABLE IF NOT EXISTS monthly_budgets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  yearly_budget_id UUID REFERENCES yearly_budgets(id) ON DELETE CASCADE,
  month TEXT NOT NULL,
  budget_value DECIMAL(10,2) DEFAULT 0,
  actual_value DECIMAL(10,2) DEFAULT 0,
  rate DECIMAL(10,2) DEFAULT 0,
  stock INTEGER DEFAULT 0,
  git INTEGER DEFAULT 0,
  discount DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create stock_requests table
CREATE TABLE IF NOT EXISTS stock_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('stock_alert', 'new_request', 'stock_projection', 'stock_overview', 'reorder_request')),
  title TEXT NOT NULL,
  item_name TEXT NOT NULL,
  category TEXT NOT NULL,
  brand TEXT NOT NULL,
  requested_quantity INTEGER NOT NULL DEFAULT 0,
  current_stock INTEGER NOT NULL DEFAULT 0,
  reason TEXT,
  customer_name TEXT,
  urgency TEXT NOT NULL CHECK (urgency IN ('low', 'medium', 'high', 'critical')),
  status TEXT NOT NULL CHECK (status IN ('draft', 'sent_to_manager', 'under_review', 'approved', 'rejected', 'completed')),
  created_by UUID REFERENCES auth.users(id) NOT NULL,
  created_by_role TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  sent_to_manager_at TIMESTAMP WITH TIME ZONE,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID REFERENCES auth.users(id),
  manager_comments TEXT,
  expected_delivery DATE,
  estimated_cost DECIMAL(12,2),
  supplier_info TEXT
);

-- Create stock_alerts table
CREATE TABLE IF NOT EXISTS stock_alerts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  item_name TEXT NOT NULL,
  current_stock INTEGER NOT NULL DEFAULT 0,
  minimum_level INTEGER NOT NULL DEFAULT 0,
  alert_type TEXT NOT NULL CHECK (alert_type IN ('low_stock', 'out_of_stock', 'overstocked')),
  category TEXT NOT NULL,
  brand TEXT NOT NULL,
  location TEXT NOT NULL,
  created_by UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT NOT NULL CHECK (status IN ('draft', 'sent_to_manager', 'under_review', 'approved', 'rejected', 'completed')),
  manager_notes TEXT,
  priority TEXT NOT NULL CHECK (priority IN ('low', 'medium', 'high', 'critical'))
);

-- Create stock_projections table
CREATE TABLE IF NOT EXISTS stock_projections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  item_name TEXT NOT NULL,
  category TEXT NOT NULL,
  brand TEXT NOT NULL,
  current_stock INTEGER NOT NULL DEFAULT 0,
  projected_demand INTEGER NOT NULL DEFAULT 0,
  projection_period TEXT NOT NULL CHECK (projection_period IN ('1_month', '3_months', '6_months', '1_year')),
  seasonal_factor DECIMAL(5,2) DEFAULT 1.0,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT NOT NULL CHECK (status IN ('draft', 'sent_to_manager', 'under_review', 'approved', 'rejected', 'completed')),
  manager_feedback TEXT
);

-- Create stock_overviews table
CREATE TABLE IF NOT EXISTS stock_overviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  created_by UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT NOT NULL CHECK (status IN ('draft', 'sent_to_manager', 'under_review', 'approved', 'rejected', 'completed')),
  manager_review TEXT
);

-- Create stock_overview_items table (for items within stock overviews)
CREATE TABLE IF NOT EXISTS stock_overview_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  stock_overview_id UUID REFERENCES stock_overviews(id) ON DELETE CASCADE,
  item_name TEXT NOT NULL,
  category TEXT NOT NULL,
  current_stock INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL CHECK (status IN ('good', 'warning', 'critical')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create workflow_items table
CREATE TABLE IF NOT EXISTS workflow_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('sales_budget', 'rolling_forecast')),
  title TEXT NOT NULL,
  description TEXT,
  created_by UUID REFERENCES auth.users(id) NOT NULL,
  created_by_role TEXT NOT NULL,
  current_state TEXT NOT NULL CHECK (current_state IN ('draft', 'submitted', 'in_review', 'approved', 'rejected', 'sent_to_supply_chain')),
  submitted_at TIMESTAMP WITH TIME ZONE,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID REFERENCES auth.users(id),
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  rejected_by UUID REFERENCES auth.users(id),
  rejected_at TIMESTAMP WITH TIME ZONE,
  sent_to_supply_chain_at TIMESTAMP WITH TIME ZONE,
  customers TEXT[] DEFAULT '{}',
  total_value DECIMAL(15,2) DEFAULT 0,
  year TEXT NOT NULL,
  priority TEXT NOT NULL CHECK (priority IN ('low', 'medium', 'high')),
  budget_data JSONB,
  forecast_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create workflow_comments table
CREATE TABLE IF NOT EXISTS workflow_comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  workflow_item_id UUID REFERENCES workflow_items(id) ON DELETE CASCADE,
  author UUID REFERENCES auth.users(id) NOT NULL,
  author_role TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('comment', 'approval', 'rejection', 'request_changes')),
  is_follow_back BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create workflow_notifications table
CREATE TABLE IF NOT EXISTS workflow_notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  recipient_id UUID REFERENCES auth.users(id),
  recipient_role TEXT NOT NULL,
  from_user UUID REFERENCES auth.users(id) NOT NULL,
  from_role TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  workflow_item_id UUID REFERENCES workflow_items(id),
  type TEXT NOT NULL CHECK (type IN ('approval', 'rejection', 'comment', 'follow_back', 'supply_chain_request')),
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create forecast_data table
CREATE TABLE IF NOT EXISTS forecast_data (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  workflow_item_id UUID REFERENCES workflow_items(id) ON DELETE CASCADE,
  customer TEXT NOT NULL,
  item TEXT NOT NULL,
  category TEXT NOT NULL,
  brand TEXT NOT NULL,
  year TEXT NOT NULL,
  quarter TEXT,
  month TEXT,
  forecast_units INTEGER DEFAULT 0,
  forecast_value DECIMAL(12,2) DEFAULT 0,
  actual_units INTEGER,
  actual_value DECIMAL(12,2),
  variance DECIMAL(5,2),
  created_by UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create git_eta_data table
CREATE TABLE IF NOT EXISTS git_eta_data (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer TEXT NOT NULL,
  item TEXT NOT NULL,
  category TEXT NOT NULL,
  brand TEXT NOT NULL,
  git_quantity INTEGER NOT NULL DEFAULT 0,
  eta DATE,
  supplier TEXT,
  po_number TEXT,
  status TEXT NOT NULL CHECK (status IN ('ordered', 'shipped', 'in_transit', 'delayed', 'delivered')),
  priority TEXT NOT NULL CHECK (priority IN ('low', 'medium', 'high', 'urgent', 'critical')),
  created_by UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  notes TEXT,
  tracking_number TEXT,
  estimated_value DECIMAL(12,2)
);

-- Create communication_messages table
CREATE TABLE IF NOT EXISTS communication_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  from_user_id UUID REFERENCES auth.users(id) NOT NULL,
  from_user_name TEXT NOT NULL,
  from_user_role TEXT NOT NULL,
  to_user_id UUID REFERENCES auth.users(id),
  to_user_name TEXT,
  to_user_role TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  priority TEXT NOT NULL CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  category TEXT NOT NULL CHECK (category IN ('stock_request', 'budget_approval', 'forecast_inquiry', 'supply_chain', 'general', 'system_alert')),
  reply_to_id UUID REFERENCES communication_messages(id),
  status TEXT NOT NULL CHECK (status IN ('pending', 'responded', 'resolved', 'escalated')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_yearly_budgets_user ON yearly_budgets(created_by);
CREATE INDEX IF NOT EXISTS idx_yearly_budgets_year ON yearly_budgets(year);
CREATE INDEX IF NOT EXISTS idx_monthly_budgets_yearly ON monthly_budgets(yearly_budget_id);
CREATE INDEX IF NOT EXISTS idx_stock_requests_user ON stock_requests(created_by);
CREATE INDEX IF NOT EXISTS idx_stock_requests_status ON stock_requests(status);
CREATE INDEX IF NOT EXISTS idx_workflow_items_user ON workflow_items(created_by);
CREATE INDEX IF NOT EXISTS idx_workflow_items_state ON workflow_items(current_state);
CREATE INDEX IF NOT EXISTS idx_workflow_comments_item ON workflow_comments(workflow_item_id);
CREATE INDEX IF NOT EXISTS idx_workflow_notifications_recipient ON workflow_notifications(recipient_id);
CREATE INDEX IF NOT EXISTS idx_communication_messages_to_user ON communication_messages(to_user_id);

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE yearly_budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE monthly_budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_projections ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_overviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_overview_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE forecast_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE git_eta_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE communication_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Users can view their own profile and admins can view all
CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Admins can view all users" ON users FOR SELECT USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);

-- Budget policies
CREATE POLICY "Users can view budgets they created" ON yearly_budgets FOR SELECT USING (created_by = auth.uid());
CREATE POLICY "Managers and admins can view all budgets" ON yearly_budgets FOR SELECT USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('manager', 'admin'))
);
CREATE POLICY "Users can create budgets" ON yearly_budgets FOR INSERT WITH CHECK (created_by = auth.uid());
CREATE POLICY "Users can update their budgets" ON yearly_budgets FOR UPDATE USING (created_by = auth.uid());

-- Stock policies
CREATE POLICY "Users can view stock requests they created" ON stock_requests FOR SELECT USING (created_by = auth.uid());
CREATE POLICY "Managers and admins can view all stock requests" ON stock_requests FOR SELECT USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('manager', 'admin', 'supply_chain'))
);
CREATE POLICY "Users can create stock requests" ON stock_requests FOR INSERT WITH CHECK (created_by = auth.uid());
CREATE POLICY "Users can update their stock requests" ON stock_requests FOR UPDATE USING (created_by = auth.uid());
CREATE POLICY "Managers can update any stock request" ON stock_requests FOR UPDATE USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('manager', 'admin'))
);

-- Similar policies for other tables...
-- (Add more specific policies as needed)

-- Functions for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_yearly_budgets_updated_at BEFORE UPDATE ON yearly_budgets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_workflow_items_updated_at BEFORE UPDATE ON workflow_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert demo users (run after setting up auth)
-- Note: These users will need to be created through Supabase Auth first
INSERT INTO users (id, name, email, role, department) VALUES 
  ('00000000-0000-0000-0000-000000000001', 'System Administrator', 'admin@example.com', 'admin', 'IT'),
  ('00000000-0000-0000-0000-000000000002', 'John Salesman', 'salesman@example.com', 'salesman', 'Sales'),
  ('00000000-0000-0000-0000-000000000003', 'Jane Manager', 'manager@example.com', 'manager', 'Sales'),
  ('00000000-0000-0000-0000-000000000004', 'Bob Supply Chain', 'supply@example.com', 'supply_chain', 'Supply Chain')
ON CONFLICT (email) DO NOTHING;
