
-- Fix infinite recursion in RLS policies

-- 1. Create a secure function to check if a user is an admin
-- SECURITY DEFINER means it runs with the privileges of the creator (postgres/admin), bypassing RLS
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid()
    AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Update Policies to use the function

-- Drop problematic policies
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update profiles" ON public.profiles;

-- Re-create policies using the function
CREATE POLICY "Admins can view all profiles" 
ON public.profiles FOR SELECT 
TO authenticated 
USING (public.is_admin());

CREATE POLICY "Admins can update profiles" 
ON public.profiles FOR UPDATE 
TO authenticated 
USING (public.is_admin());

-- Ensure basic user policies exist
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" 
ON public.profiles FOR SELECT 
TO authenticated 
USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" 
ON public.profiles FOR UPDATE
TO authenticated 
USING (auth.uid() = id);

-- 3. Allow inserting new profiles (for sign up trigger or direct insert)
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" 
ON public.profiles FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = id);

-- Grant execute on function
GRANT EXECUTE ON FUNCTION public.is_admin TO authenticated;
