-- Phase 3: Operations & Analysis Schema
-- This script adds views for analytics and updates permissions for staff management.

-- 1. Create a view for item performance (Best Sellers)
CREATE OR REPLACE VIEW public.item_performance AS
WITH flat_items AS (
    SELECT 
        (jsonb_array_elements(items)->>'id') as item_id,
        (jsonb_array_elements(items)->>'name') as item_name,
        (jsonb_array_elements(items)->>'quantity')::numeric as quantity,
        (jsonb_array_elements(items)->>'price')::numeric as price,
        status,
        created_at
    FROM public.orders
    WHERE status != 'cancelled'
)
SELECT 
    item_id,
    item_name,
    SUM(quantity) as total_quantity,
    SUM(quantity * price) as total_revenue,
    COUNT(*) as order_count
FROM flat_items
GROUP BY item_id, item_name
ORDER BY total_quantity DESC;

-- Grant access to the view
GRANT SELECT ON public.item_performance TO anon, authenticated;

-- 2. Update profiles RLS to allow admins to manage staff
-- We already have is_admin() function from previous fixes.

-- Add policy for admins to UPDATE profiles (to change roles)
DROP POLICY IF EXISTS "Admins can update any profile" ON public.profiles;
CREATE POLICY "Admins can update any profile" ON public.profiles
  FOR UPDATE USING (public.is_admin());

-- Add policy for admins to DELETE profiles (if needed)
DROP POLICY IF EXISTS "Admins can delete profiles" ON public.profiles;
CREATE POLICY "Admins can delete profiles" ON public.profiles
  FOR DELETE USING (public.is_admin());

-- 3. Enhance order_statistics with average order value
CREATE OR REPLACE VIEW public.order_statistics AS
SELECT
  COUNT(*) as total_orders,
  COUNT(*) FILTER (WHERE status = 'pending') as pending_orders,
  COUNT(*) FILTER (WHERE status = 'confirmed') as confirmed_orders,
  COUNT(*) FILTER (WHERE status = 'preparing') as preparing_orders,
  COUNT(*) FILTER (WHERE status = 'ready') as ready_orders,
  COUNT(*) FILTER (WHERE status = 'delivered') as delivered_orders,
  COUNT(*) FILTER (WHERE status = 'cancelled') as cancelled_orders,
  COUNT(*) FILTER (WHERE status = 'delivered' AND DATE(delivered_at) = CURRENT_DATE) as today_orders,
  SUM(total_price) as total_revenue,
  SUM(total_price) FILTER (WHERE status = 'delivered' AND DATE(delivered_at) = CURRENT_DATE) as today_revenue,
  -- NEW: Average Order Value
  CASE WHEN COUNT(*) > 0 THEN SUM(total_price) / COUNT(*) ELSE 0 END as avg_order_value
FROM orders;

-- Restore permissions
GRANT SELECT ON public.order_statistics TO anon, authenticated;
