-- SQL Commands to Insert User Types and Demo Users into Supabase Database
-- Run this SQL in your Supabase SQL Editor after setting up the main schema

-- First, create the users in Supabase Auth (this needs to be done through the dashboard or auth functions)
-- Then run these INSERT statements to add user profile data

-- Insert demo users into the users table
-- Note: The user IDs should match the auth.users IDs created through Supabase Auth
INSERT INTO users (id, name, email, role, department, is_active, created_at, updated_at) VALUES 
  (
    '00000000-0000-0000-0000-000000000001', 
    'System Administrator', 
    'admin@example.com', 
    'admin', 
    'IT',
    true,
    NOW(),
    NOW()
  ),
  (
    '00000000-0000-0000-0000-000000000002', 
    'John Salesman', 
    'salesman@example.com', 
    'salesman', 
    'Sales',
    true,
    NOW(),
    NOW()
  ),
  (
    '00000000-0000-0000-0000-000000000003', 
    'Jane Manager', 
    'manager@example.com', 
    'manager', 
    'Sales Management',
    true,
    NOW(),
    NOW()
  ),
  (
    '00000000-0000-0000-0000-000000000004', 
    'Bob Supply Chain', 
    'supply@example.com', 
    'supply_chain', 
    'Supply Chain',
    true,
    NOW(),
    NOW()
  )
ON CONFLICT (email) DO UPDATE SET
  name = EXCLUDED.name,
  role = EXCLUDED.role,
  department = EXCLUDED.department,
  is_active = EXCLUDED.is_active,
  updated_at = NOW();

-- Verify the user types are properly constrained
-- The role column has a CHECK constraint: role IN ('admin', 'salesman', 'manager', 'supply_chain')

-- Optional: Create a view to see user roles and permissions
CREATE OR REPLACE VIEW user_roles_summary AS
SELECT 
  u.id,
  u.name,
  u.email,
  u.role,
  u.department,
  u.is_active,
  u.created_at,
  u.last_login,
  CASE 
    WHEN u.role = 'admin' THEN 'Full system access, user management, all reports'
    WHEN u.role = 'salesman' THEN 'Create budgets and forecasts, view own data'
    WHEN u.role = 'manager' THEN 'Approve budgets/forecasts, view team data'
    WHEN u.role = 'supply_chain' THEN 'View approved items, manage inventory'
  END as role_description
FROM users u
ORDER BY 
  CASE u.role 
    WHEN 'admin' THEN 1
    WHEN 'manager' THEN 2
    WHEN 'supply_chain' THEN 3
    WHEN 'salesman' THEN 4
  END,
  u.name;

-- Query to check all user types are inserted correctly
SELECT 
  role,
  COUNT(*) as user_count,
  ARRAY_AGG(name ORDER BY name) as users
FROM users 
WHERE is_active = true
GROUP BY role
ORDER BY 
  CASE role 
    WHEN 'admin' THEN 1
    WHEN 'manager' THEN 2
    WHEN 'supply_chain' THEN 3
    WHEN 'salesman' THEN 4
  END;

-- Create a function to get user permissions based on role
CREATE OR REPLACE FUNCTION get_user_permissions(user_role TEXT)
RETURNS TABLE(permission_name TEXT, description TEXT, resource TEXT, action TEXT) AS $$
BEGIN
  CASE user_role
    WHEN 'admin' THEN
      RETURN QUERY VALUES 
        ('View All Dashboards', 'Access to all system dashboards', 'dashboard', 'read'),
        ('Manage Users', 'Create, edit, and delete users', 'users', 'manage'),
        ('View All Reports', 'Access to all reports and analytics', 'reports', 'read'),
        ('System Settings', 'Configure system settings', 'settings', 'manage'),
        ('Approve All', 'Approve all requests from any role', 'approvals', 'manage');
    
    WHEN 'salesman' THEN
      RETURN QUERY VALUES 
        ('Create Sales Budget', 'Create and edit sales budgets', 'sales_budget', 'create'),
        ('Submit for Approval', 'Submit budgets for manager approval', 'approvals', 'submit'),
        ('Create Forecasts', 'Create rolling forecasts', 'forecasts', 'create'),
        ('View Own Data', 'View own created budgets and forecasts', 'own_data', 'read'),
        ('Customer Management', 'Manage customer relationships', 'customers', 'manage');
    
    WHEN 'manager' THEN
      RETURN QUERY VALUES 
        ('Approve Sales Budgets', 'Review and approve sales budgets', 'sales_budget', 'approve'),
        ('Approve Forecasts', 'Review and approve forecasts', 'forecasts', 'approve'),
        ('Provide Feedback', 'Add comments and feedback', 'feedback', 'create'),
        ('View Team Data', 'View all team member data', 'team_data', 'read'),
        ('Send to Supply Chain', 'Forward approved items to supply chain', 'supply_chain', 'forward');
    
    WHEN 'supply_chain' THEN
      RETURN QUERY VALUES 
        ('View Approved Budgets', 'View manager-approved budgets', 'approved_budgets', 'read'),
        ('View Approved Forecasts', 'View manager-approved forecasts', 'approved_forecasts', 'read'),
        ('Inventory Management', 'Manage inventory based on forecasts', 'inventory', 'manage'),
        ('Supply Planning', 'Plan supply chain operations', 'supply_planning', 'manage'),
        ('Customer Satisfaction', 'Monitor customer satisfaction metrics', 'customer_satisfaction', 'read');
  END CASE;
END;
$$ LANGUAGE plpgsql;

-- Usage example: SELECT * FROM get_user_permissions('admin');
