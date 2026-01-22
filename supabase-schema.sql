-- Fortaleza de Sabores - Database Schema
-- Run this SQL in your Supabase SQL Editor

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number INTEGER NOT NULL,
  items JSONB NOT NULL,
  total_price DECIMAL(10, 2) NOT NULL,
  customer_name TEXT,
  customer_table TEXT,
  customer_notes TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled')),
  sent_via_whatsapp BOOLEAN DEFAULT false,
  sent_to_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index on order_number for faster lookups
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);

-- Create index on status for filtering
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);

-- Create index on created_at for sorting
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);

-- Create a sequence for order numbers
CREATE SEQUENCE IF NOT EXISTS order_number_seq START 1;

-- Create a function to get the next order number
CREATE OR REPLACE FUNCTION get_next_order_number()
RETURNS INTEGER AS $$
BEGIN
  RETURN nextval('order_number_seq');
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to automatically update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (adjust based on your security needs)
-- Allow anyone to read orders (for now - you can restrict this later)
CREATE POLICY "Allow public read access" ON orders
  FOR SELECT
  USING (true);

-- Allow anyone to insert orders (customers placing orders)
CREATE POLICY "Allow public insert access" ON orders
  FOR INSERT
  WITH CHECK (true);

-- Allow anyone to update orders (for status changes)
CREATE POLICY "Allow public update access" ON orders
  FOR UPDATE
  USING (true);

-- Allow anyone to delete orders (you may want to restrict this)
CREATE POLICY "Allow public delete access" ON orders
  FOR DELETE
  USING (true);

-- Create a view for order statistics
CREATE OR REPLACE VIEW order_statistics AS
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

-- Grant access to the view
GRANT SELECT ON order_statistics TO anon, authenticated;

COMMENT ON TABLE orders IS 'Stores all customer orders for Fortaleza de Sabores restaurant';
COMMENT ON COLUMN orders.order_number IS 'Sequential order number for easy reference';
COMMENT ON COLUMN orders.items IS 'JSON array of order items with id, name, quantity, price, category';
COMMENT ON COLUMN orders.status IS 'Current status of the order in the workflow';
COMMENT ON COLUMN orders.sent_to_admin IS 'Whether the order was sent to the admin system';

-- ==========================================
-- NEW ADDITIONS FOR MVP ALIGNMENT
-- ==========================================

-- Customer Sessions
CREATE TABLE IF NOT EXISTS customer_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  table_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'closed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_customer_sessions_table ON customer_sessions(table_id);
CREATE INDEX IF NOT EXISTS idx_customer_sessions_status ON customer_sessions(status);
CREATE INDEX IF NOT EXISTS idx_customer_sessions_phone ON customer_sessions(phone_number);

-- Payments
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_session_id UUID REFERENCES customer_sessions(id) NOT NULL,
  order_id UUID REFERENCES orders(id),
  amount DECIMAL(10, 2) NOT NULL,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('cash', 'card', 'mpesa')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  confirmed_at TIMESTAMPTZ
);

ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Link Orders to Session
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS customer_session_id UUID REFERENCES customer_sessions(id);

CREATE INDEX IF NOT EXISTS idx_orders_session ON orders(customer_session_id);
