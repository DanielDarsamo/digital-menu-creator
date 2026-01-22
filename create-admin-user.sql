-- Create Admin User
-- Run this in Supabase SQL Editor to create an admin account

-- First, you need to create the user in Supabase Auth Dashboard:
-- 1. Go to Authentication > Users
-- 2. Click "Add User"
-- 3. Email: admin@fortaleza.com
-- 4. Password: admin123 (or your preferred password)
-- 5. Confirm email automatically: Yes

-- Then run this SQL to set the role to admin:
-- (Replace the email with the actual admin email you created)

UPDATE profiles 
SET role = 'admin', full_name = 'Admin User'
WHERE id = (
  SELECT id FROM auth.users 
  WHERE email = 'admin@fortaleza.com'
);

-- Verify the admin user was created:
SELECT 
  u.email,
  p.full_name,
  p.role,
  p.created_at
FROM auth.users u
JOIN profiles p ON u.id = p.id
WHERE p.role = 'admin';
