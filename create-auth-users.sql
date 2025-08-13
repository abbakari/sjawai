-- Step 1: Create users in Supabase Auth first
-- This SQL creates auth users and then inserts them into the users table

-- Option A: Create auth users using Supabase Auth API (recommended)
-- You'll need to run this in your application or use Supabase dashboard
-- But here's the SQL equivalent for reference:

-- Function to create a user with auth and profile data
CREATE OR REPLACE FUNCTION create_user_with_profile(
  user_email TEXT,
  user_password TEXT,
  user_name TEXT,
  user_role TEXT,
  user_department TEXT
) RETURNS UUID AS $$
DECLARE
  new_user_id UUID;
BEGIN
  -- This would typically be done via Supabase Auth API
  -- For demo purposes, we'll use a deterministic UUID based on email
  new_user_id := gen_random_uuid();
  
  -- Insert into users table (assuming auth user exists)
  INSERT INTO users (id, name, email, role, department, is_active, created_at, updated_at)
  VALUES (new_user_id, user_name, user_email, user_role, user_department, true, NOW(), NOW())
  ON CONFLICT (email) DO UPDATE SET
    name = EXCLUDED.name,
    role = EXCLUDED.role,
    department = EXCLUDED.department,
    updated_at = NOW();
    
  RETURN new_user_id;
END;
$$ LANGUAGE plpgsql;

-- Option B: For development/demo - temporarily disable the foreign key constraint
-- WARNING: Only use this for development/demo purposes

-- Temporarily drop the foreign key constraint
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_id_fkey;

-- Insert demo users with fixed UUIDs
INSERT INTO users (id, name, email, role, department, is_active, created_at, updated_at) VALUES 
  (
    '00000000-0000-0000-0000-000000000001'::UUID, 
    'System Administrator', 
    'admin@example.com', 
    'admin', 
    'IT',
    true,
    NOW(),
    NOW()
  ),
  (
    '00000000-0000-0000-0000-000000000002'::UUID, 
    'John Salesman', 
    'salesman@example.com', 
    'salesman', 
    'Sales',
    true,
    NOW(),
    NOW()
  ),
  (
    '00000000-0000-0000-0000-000000000003'::UUID, 
    'Jane Manager', 
    'manager@example.com', 
    'manager', 
    'Sales Management',
    true,
    NOW(),
    NOW()
  ),
  (
    '00000000-0000-0000-0000-000000000004'::UUID, 
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

-- Re-add the foreign key constraint (optional for demo)
-- ALTER TABLE users ADD CONSTRAINT users_id_fkey 
--   FOREIGN KEY (id) REFERENCES auth.users(id);

-- Verify users were created
SELECT id, name, email, role, department, is_active 
FROM users 
ORDER BY 
  CASE role 
    WHEN 'admin' THEN 1
    WHEN 'manager' THEN 2
    WHEN 'supply_chain' THEN 3
    WHEN 'salesman' THEN 4
  END;
