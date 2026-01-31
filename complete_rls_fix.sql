-- Complete RLS fix: Reset all orders policies to be permissive for testing
-- Run this to allow all authenticated users to modify orders

-- 1. Drop ALL existing policies on orders
DROP POLICY IF EXISTS "Authenticated users can view orders" ON public.orders;
DROP POLICY IF EXISTS "Waiters can update their accepted orders" ON public.orders;
DROP POLICY IF EXISTS "Waiters can accept pending orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can manage all orders" ON public.orders;
DROP POLICY IF EXISTS "Allow all authenticated users full access" ON public.orders;
DROP POLICY IF EXISTS "Waiters can update orders" ON public.orders;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.orders;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.orders;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON public.orders;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON public.orders;

-- 2. Create ONE simple policy that allows all operations for authenticated users
CREATE POLICY "authenticated_all_access"
ON public.orders
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- 3. Also ensure RLS is enabled
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- 4. Grant necessary permissions
GRANT ALL ON public.orders TO authenticated;

-- This should allow admins and waiters to do anything with orders for now
