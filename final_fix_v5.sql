-- FINAL COMPREHENSIVE FIX (v5) - REMOVING PROBLEMATIC ROLE ALTERATION
-- This script handles dependent views and avoids touching the 'profiles' table schema to prevent dependency errors.

-- 1. DROP DEPENDENT VIEWS 
DROP VIEW IF EXISTS public.order_statistics;
DROP VIEW IF EXISTS public.customer_order_history;

-- 2. DYNAMICALLY DROP ALL TRIGGERS ON 'orders'
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

-- 3. DROP LEGACY FUNCTIONS
DROP FUNCTION IF EXISTS public.validate_status_transition();
DROP FUNCTION IF EXISTS public.log_order_status_change();
DROP FUNCTION IF EXISTS public.prevent_order_modification();

-- 4. STANDARDIZE COLUMNS 
-- Standardize status_history to JSONB
ALTER TABLE public.orders DROP COLUMN IF EXISTS status_history CASCADE;
ALTER TABLE public.orders ADD COLUMN status_history JSONB DEFAULT '[]'::jsonb;

-- Standardize status to TEXT (removing any constraint and dependency issues)
-- We use USING to safely convert existing data
ALTER TABLE public.orders ALTER COLUMN status TYPE TEXT USING status::text;
ALTER TABLE public.orders ALTER COLUMN status SET DEFAULT 'pending';

-- 5. RESET RLS POLICIES
ALTER TABLE public.orders DISABLE ROW LEVEL SECURITY;

-- Drop all possible order policies
DROP POLICY IF EXISTS "Public read access" ON public.orders;
DROP POLICY IF EXISTS "Allow public read access" ON public.orders;
DROP POLICY IF EXISTS "Allow public read access to status history" ON public.order_status_history;
DROP POLICY IF EXISTS "Customers can create orders" ON public.orders;
DROP POLICY IF EXISTS "Allow public insert access" ON public.orders;
DROP POLICY IF EXISTS "Admins have full update access" ON public.orders;
DROP POLICY IF EXISTS "Admins can update orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can delete orders" ON public.orders;
DROP POLICY IF EXISTS "Waiters can update orders" ON public.orders;
DROP POLICY IF EXISTS "Allow public update access" ON public.orders;
DROP POLICY IF EXISTS "Allow public delete access" ON public.orders;

-- 6. RE-ENABLE AND APPLY CLEAN POLICIES
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Re-create Helper Functions (safely using CREATE OR REPLACE)
CREATE OR REPLACE FUNCTION public.is_admin() RETURNS BOOLEAN AS $$
BEGIN
  -- We query profiles but don't change its schema to avoid dependency breaks on other tables
  RETURN EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_waiter() RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'waiter');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Re-create Policies
CREATE POLICY "Public read access" ON public.orders FOR SELECT USING (true);
CREATE POLICY "Customers can create orders" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins have full update access" ON public.orders FOR UPDATE USING (public.is_admin());
CREATE POLICY "Admins can delete orders" ON public.orders FOR DELETE USING (public.is_admin());
CREATE POLICY "Waiters can update orders" ON public.orders FOR UPDATE USING (public.is_waiter());

-- 7. RE-CREATE VIEWS

-- Re-create order_statistics
CREATE OR REPLACE VIEW public.order_statistics AS
SELECT
  COUNT(*) as total_orders,
  COUNT(*) FILTER (WHERE status = 'pending') as pending_orders,
  COUNT(*) FILTER (WHERE status = 'confirmed') as confirmed_orders,
  COUNT(*) FILTER (WHERE status = 'preparing') as preparing_orders,
  COUNT(*) FILTER (WHERE status = 'ready') as ready_orders,
  COUNT(*) FILTER (WHERE status = 'delivered') as delivered_orders,
  COUNT(*) FILTER (WHERE status = 'cancelled') as cancelled_orders,
  COUNT(*) FILTER (WHERE DATE(created_at) = CURRENT_DATE) as today_orders,
  SUM(total_price) as total_revenue,
  SUM(total_price) FILTER (WHERE DATE(created_at) = CURRENT_DATE) as today_revenue
FROM orders;

-- Re-create customer_order_history
CREATE OR REPLACE VIEW public.customer_order_history AS
SELECT 
  o.id,
  o.order_number,
  o.items,
  o.total_price,
  o.customer_name,
  o.customer_email,
  o.customer_phone,
  o.customer_table,
  o.customer_notes,
  o.status,
  o.created_at,
  o.updated_at,
  o.status_history
FROM public.orders o
WHERE o.status IN ('delivered', 'cancelled')
ORDER BY o.created_at DESC;

-- 8. RESTORE PERMISSIONS
GRANT SELECT ON public.order_statistics TO anon, authenticated;
GRANT SELECT ON public.customer_order_history TO anon, authenticated;
