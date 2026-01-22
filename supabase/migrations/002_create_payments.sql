
-- Create payments table
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_session_id UUID REFERENCES customer_sessions(id) NOT NULL,
  order_id UUID REFERENCES orders(id), -- Optional link to specific order, usually payment is per session
  amount DECIMAL(10, 2) NOT NULL,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('cash', 'card', 'mpesa')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  confirmed_at TIMESTAMPTZ
);

-- RLS
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Allow public insert (customers paying)
CREATE POLICY "Public insert payments" ON payments
  FOR INSERT WITH CHECK (true);

-- Allow public read (customers seeing their payments)
CREATE POLICY "Public read payments" ON payments
  FOR SELECT USING (true);

-- Allow admins/waiters to update (confirm payment)
-- Assuming is_admin() and is_waiter() functions exist from previous setup
CREATE POLICY "Staff update payments" ON payments
  FOR UPDATE USING (is_admin() OR is_waiter());
