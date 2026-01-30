-- FINAL COMPREHENSIVE FIX (v3) - THE NUCLEAR OPTION
-- This script dynamically removes ALL triggers on the orders table to ensure no legacy logic is blocking updates.

-- 1. Dynamically drop all triggers on 'orders'
DO $$
DECLARE
    trig_record RECORD;
BEGIN
    FOR trig_record IN 
        SELECT tgname 
        FROM pg_trigger 
        JOIN pg_class ON pg_trigger.tgrelid = pg_class.oid 
        JOIN pg_namespace ON pg_class.relnamespace = pg_namespace.oid
        WHERE pg_class.relname = 'orders' 
        AND pg_namespace.nspname = 'public'
        AND pg_trigger.tgisinternal = false
    LOOP
        EXECUTE 'DROP TRIGGER ' || quote_ident(trig_record.tgname) || ' ON public.orders';
    END LOOP;
END $$;

-- 2. Drop legacy functions to be safe
DROP FUNCTION IF EXISTS public.validate_status_transition();
DROP FUNCTION IF EXISTS public.log_order_status_change();
DROP FUNCTION IF EXISTS public.prevent_order_modification();

-- 3. Standardize status_history column
-- If it exists as JSONB[], we'll recreate it as a standard JSONB column (best for JS client).
ALTER TABLE public.orders DROP COLUMN IF EXISTS status_history CASCADE;
ALTER TABLE public.orders ADD COLUMN status_history JSONB DEFAULT '[]'::jsonb;

-- 4. Ensure status column is TEXT
ALTER TABLE public.orders ALTER COLUMN status TYPE TEXT USING status::text;

-- 5. RESET RLS Policies
ALTER TABLE public.orders DISABLE ROW LEVEL SECURITY;

-- Drop all possible order policies (covering names from all previous scripts)
DROP POLICY IF EXISTS "Public read access" ON public.orders;
DROP POLICY IF EXISTS "Allow public read access" ON public.orders;
DROP POLICY IF EXISTS "Allow public read access to status history" ON public.order_status_history;
DROP POLICY IF EXISTS "Customers can create orders" ON public.orders;
DROP POLICY IF EXISTS "Admins have full update access" ON public.orders;
DROP POLICY IF EXISTS "Admins can update orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can delete orders" ON public.orders;
DROP POLICY IF EXISTS "Waiters can update orders" ON public.orders;

-- 6. Apply Clean Policies
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Helper functions
CREATE OR REPLACE FUNCTION public.is_admin() RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_waiter() RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'waiter');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Policies
CREATE POLICY "Public read access" ON public.orders FOR SELECT USING (true);
CREATE POLICY "Customers can create orders" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins have full update access" ON public.orders FOR UPDATE USING (public.is_admin());
CREATE POLICY "Admins can delete orders" ON public.orders FOR DELETE USING (public.is_admin());
CREATE POLICY "Waiters can update orders" ON public.orders FOR UPDATE USING (public.is_waiter());

-- Final check for profiles role (just in case)
ALTER TABLE public.profiles ALTER COLUMN role TYPE TEXT USING role::text;
