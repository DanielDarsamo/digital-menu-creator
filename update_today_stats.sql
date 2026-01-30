-- Update the order_statistics view to count orders delivered today
CREATE OR REPLACE VIEW public.order_statistics AS
SELECT
  COUNT(*) as total_orders,
  COUNT(*) FILTER (WHERE status = 'pending') as pending_orders,
  COUNT(*) FILTER (WHERE status = 'confirmed') as confirmed_orders,
  COUNT(*) FILTER (WHERE status = 'preparing') as preparing_orders,
  COUNT(*) FILTER (WHERE status = 'ready') as ready_orders,
  COUNT(*) FILTER (WHERE status = 'delivered') as delivered_orders,
  COUNT(*) FILTER (WHERE status = 'cancelled') as cancelled_orders,
  -- NEW: Count only delivered orders for 'today'
  COUNT(*) FILTER (WHERE status = 'delivered' AND DATE(delivered_at) = CURRENT_DATE) as today_orders,
  -- NEW: Revenue also filtered by delivered today
  SUM(total_price) as total_revenue,
  SUM(total_price) FILTER (WHERE status = 'delivered' AND DATE(delivered_at) = CURRENT_DATE) as today_revenue
FROM orders;

-- Restore permissions
GRANT SELECT ON public.order_statistics TO anon, authenticated;
