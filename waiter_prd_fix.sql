-- Phase 4: Waiter Dashboard Enhancements
-- 1. Support for order rejection reasons
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- 2. Enhance payments table for waiter confirmation
ALTER TABLE public.payments
ADD COLUMN IF NOT EXISTS confirmed_by_waiter UUID REFERENCES public.profiles(id);

-- 3. Create a view for waiter performance
CREATE OR REPLACE VIEW public.waiter_performance AS
SELECT 
    waiter_id,
    p.full_name as waiter_name,
    COUNT(*) as total_orders,
    SUM(total_price) as total_revenue,
    COUNT(*) FILTER (WHERE status = 'delivered' AND DATE(delivered_at) = CURRENT_DATE) as today_orders,
    SUM(total_price) FILTER (WHERE status = 'delivered' AND DATE(delivered_at) = CURRENT_DATE) as today_revenue
FROM public.orders o
JOIN public.profiles p ON o.waiter_id = p.id
WHERE waiter_id IS NOT NULL 
  AND status != 'cancelled'
GROUP BY waiter_id, p.full_name;

-- Grant access
GRANT SELECT ON public.waiter_performance TO anon, authenticated;
