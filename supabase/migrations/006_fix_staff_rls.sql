-- Migration 006: Sync profiles schema and fix RLS for Staff Management
-- This allows administrators to see and manage the entire staff list.

-- 1. Ensure columns match the user's requested schema
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone TEXT;

-- 2. Update role constraint to support the chef role
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check 
    CHECK (role IN ('admin', 'waiter', 'chef'));

-- 3. Create or Update Helper Function for Admin checks
-- SECURITY DEFINER allows this function to bypass RLS when checking roles
CREATE OR REPLACE FUNCTION public.is_admin() 
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Re-configure RLS for profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Clear old policies to start fresh
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can delete profiles" ON public.profiles;

-- Policy: Everyone can see their OWN profile (essential for login/session)
CREATE POLICY "Users can view own profile" ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Policy: Administrators can see ALL profiles
CREATE POLICY "Admins can view all profiles" ON public.profiles
FOR SELECT
TO authenticated
USING (public.is_admin());

-- Policy: Administrators can UPDATE any profile (for role/status management)
CREATE POLICY "Admins can update profiles" ON public.profiles
FOR UPDATE
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Policy: Administrators can DELETE any profile
CREATE POLICY "Admins can delete profiles" ON public.profiles
FOR DELETE
TO authenticated
USING (public.is_admin());
