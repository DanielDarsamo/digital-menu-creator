
-- Add session_id to orders
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS customer_session_id UUID REFERENCES customer_sessions(id);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_orders_session ON orders(customer_session_id);
