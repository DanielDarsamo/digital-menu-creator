-- Fortaleza Order History & Status Tracking System
-- Run this SQL in your Supabase SQL Editor AFTER the initial schema

-- Add customer_id column to orders table for tracking user orders
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_id UUID;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_email TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_phone TEXT;

-- Create order_status_history table for immutable audit log
CREATE TABLE IF NOT EXISTS order_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  old_status TEXT,
  new_status TEXT NOT NULL,
  changed_by TEXT, -- 'customer', 'admin', 'system'
  changed_at TIMESTAMPTZ DEFAULT NOW(),
  notes TEXT
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_order_status_history_order_id ON order_status_history(order_id);
CREATE INDEX IF NOT EXISTS idx_order_status_history_changed_at ON order_status_history(changed_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_customer_email ON orders(customer_email);
CREATE INDEX IF NOT EXISTS idx_orders_customer_phone ON orders(customer_phone);

-- Function to log status changes automatically
CREATE OR REPLACE FUNCTION log_order_status_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Only log if status actually changed
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO order_status_history (order_id, old_status, new_status, changed_by)
    VALUES (NEW.id, OLD.status, NEW.status, 'system');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically log status changes
DROP TRIGGER IF EXISTS trigger_log_order_status_change ON orders;
CREATE TRIGGER trigger_log_order_status_change
  AFTER UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION log_order_status_change();

-- Function to prevent order modification after confirmation
CREATE OR REPLACE FUNCTION prevent_order_modification()
RETURNS TRIGGER AS $$
BEGIN
  -- Allow status updates
  IF OLD.status != 'pending' AND (
    OLD.items IS DISTINCT FROM NEW.items OR
    OLD.total_price IS DISTINCT FROM NEW.total_price OR
    OLD.customer_name IS DISTINCT FROM NEW.customer_name OR
    OLD.customer_table IS DISTINCT FROM NEW.customer_table
  ) THEN
    RAISE EXCEPTION 'Cannot modify order after confirmation. Order is immutable.';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to enforce immutability
DROP TRIGGER IF EXISTS trigger_prevent_order_modification ON orders;
CREATE TRIGGER trigger_prevent_order_modification
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION prevent_order_modification();

-- Function to validate status transitions (one-way only)
CREATE OR REPLACE FUNCTION validate_status_transition()
RETURNS TRIGGER AS $$
DECLARE
  valid_transitions TEXT[][];
BEGIN
  -- Define valid status transitions
  valid_transitions := ARRAY[
    ARRAY['pending', 'confirmed'],
    ARRAY['pending', 'cancelled'],
    ARRAY['confirmed', 'preparing'],
    ARRAY['confirmed', 'cancelled'],
    ARRAY['preparing', 'ready'],
    ARRAY['preparing', 'cancelled'],
    ARRAY['ready', 'delivered'],
    ARRAY['ready', 'cancelled']
  ];

  -- Check if transition is valid
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    IF NOT (ARRAY[OLD.status, NEW.status] = ANY(valid_transitions)) THEN
      RAISE EXCEPTION 'Invalid status transition from % to %', OLD.status, NEW.status;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to validate status transitions
DROP TRIGGER IF EXISTS trigger_validate_status_transition ON orders;
CREATE TRIGGER trigger_validate_status_transition
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION validate_status_transition();

-- Enable RLS on order_status_history
ALTER TABLE order_status_history ENABLE ROW LEVEL SECURITY;

-- Create policies for order_status_history
CREATE POLICY "Allow public read access to status history" ON order_status_history
  FOR SELECT
  USING (true);

CREATE POLICY "Allow system insert to status history" ON order_status_history
  FOR INSERT
  WITH CHECK (true);

-- Create view for customer order history
CREATE OR REPLACE VIEW customer_order_history AS
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
  -- Get status history as JSON array
  (
    SELECT json_agg(
      json_build_object(
        'old_status', osh.old_status,
        'new_status', osh.new_status,
        'changed_at', osh.changed_at,
        'changed_by', osh.changed_by
      ) ORDER BY osh.changed_at
    )
    FROM order_status_history osh
    WHERE osh.order_id = o.id
  ) as status_history
FROM orders o
WHERE o.status IN ('delivered', 'cancelled')
ORDER BY o.created_at DESC;

-- Grant access to the view
GRANT SELECT ON customer_order_history TO anon, authenticated;

-- Create function to get customer orders by email or phone
CREATE OR REPLACE FUNCTION get_customer_orders(
  p_email TEXT DEFAULT NULL,
  p_phone TEXT DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  order_number INTEGER,
  items JSONB,
  total_price DECIMAL,
  customer_name TEXT,
  customer_table TEXT,
  customer_notes TEXT,
  status TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  status_history JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    o.id,
    o.order_number,
    o.items,
    o.total_price,
    o.customer_name,
    o.customer_table,
    o.customer_notes,
    o.status,
    o.created_at,
    o.updated_at,
    (
      SELECT jsonb_agg(
        jsonb_build_object(
          'old_status', osh.old_status,
          'new_status', osh.new_status,
          'changed_at', osh.changed_at,
          'changed_by', osh.changed_by
        ) ORDER BY osh.changed_at
      )
      FROM order_status_history osh
      WHERE osh.order_id = o.id
    ) as status_history
  FROM orders o
  WHERE 
    (p_email IS NOT NULL AND o.customer_email = p_email) OR
    (p_phone IS NOT NULL AND o.customer_phone = p_phone)
  ORDER BY o.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Comments
COMMENT ON TABLE order_status_history IS 'Immutable audit log of all order status changes';
COMMENT ON COLUMN orders.customer_email IS 'Customer email for order tracking';
COMMENT ON COLUMN orders.customer_phone IS 'Customer phone for order tracking';
COMMENT ON FUNCTION prevent_order_modification() IS 'Prevents modification of confirmed orders (immutability)';
COMMENT ON FUNCTION validate_status_transition() IS 'Ensures status transitions are one-way only';
COMMENT ON FUNCTION log_order_status_change() IS 'Automatically logs all status changes to audit table';
