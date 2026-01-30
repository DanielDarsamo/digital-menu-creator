-- FIX: Reset RLS Policies to resolve "operator does not exist: text[] = text" error.
-- This error likely comes from a malformed Policy comparing a text column to an array.

-- 1. Disable RLS temporarily to ensure no interference during reset
ALTER TABLE public.orders DISABLE ROW LEVEL SECURITY;

-- 2. (Skipped) Do NOT drop functions to avoid dependency errors on other tables (like payments).
-- We will use CREATE OR REPLACE below to update them in-place.

-- 3. Drop ALL existing policies on 'orders' only
-- Note: We drop by name, covering standard names.
DROP POLICY IF EXISTS "Allow public read access" ON public.orders;
DROP POLICY IF EXISTS "Public read access" ON public.orders;
DROP POLICY IF EXISTS "Customers can create orders" ON public.orders;
DROP POLICY IF EXISTS "Admins have full update access" ON public.orders;
DROP POLICY IF EXISTS "Admins can update orders" ON public.orders; -- Potential variant
DROP POLICY IF EXISTS "Admins can delete orders" ON public.orders;
DROP POLICY IF EXISTS "Waiters can update orders" ON public.orders;

-- 4. Re-create Helper Functions
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

CREATE OR REPLACE FUNCTION public.is_waiter() 
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role = 'waiter'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Re-create Policies (Clean & Correct Types)

-- Public Read (for Customer View)
CREATE POLICY "Public read access" ON public.orders
FOR SELECT USING (true);

-- Customer Insert
CREATE POLICY "Customers can create orders" ON public.orders
FOR INSERT WITH CHECK (true);

-- Admin Update (Full)
CREATE POLICY "Admins have full update access" ON public.orders
FOR UPDATE USING (public.is_admin());

-- Admin Delete
CREATE POLICY "Admins can delete orders" ON public.orders
FOR DELETE USING (public.is_admin());

-- Waiter Update
CREATE POLICY "Waiters can update orders" ON public.orders
FOR UPDATE USING (public.is_waiter());

-- 6. Ensure status_history column exists and is correct type
-- We use JSONB to store the array of history objects.
-- If it exists as JSONB[], we leave it (Postgres handles it).
-- Just adding if missing.
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS status_history JSONB[] DEFAULT ARRAY[]::JSONB[];

-- 7. Re-Enable RLS
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
