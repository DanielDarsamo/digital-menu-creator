-- INSTRUCTIONS:
-- 1. Sign up a new user in your application (if you haven't already).
-- 2. Replace 'YOUR_EMAIL@EXAMPLE.COM' below with your email.
-- 3. Run this script in the Supabase SQL Editor.

-- This script will find your user by email and either:
-- A) Create a new admin profile if none exists
-- B) Update your existing profile to be an admin

INSERT INTO public.profiles (id, email, role, is_active, first_name, last_name)
SELECT 
    id, 
    email, 
    'admin'::user_role, 
    true, 
    'Admin', 
    'User'
FROM auth.users
WHERE email = 'admin@fortaleza.com'
ON CONFLICT (id) DO UPDATE
SET 
    role = 'admin'::user_role,
    is_active = true,
    updated_at = NOW();

-- Verify the result
SELECT * FROM public.profiles 
WHERE id IN (SELECT id FROM auth.users WHERE email = 'admin@fortaleza.com');
