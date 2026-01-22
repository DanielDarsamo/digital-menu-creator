
-- Create customer_sessions table
CREATE TABLE IF NOT EXISTS customer_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  table_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'closed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_customer_sessions_table ON customer_sessions(table_id);
CREATE INDEX IF NOT EXISTS idx_customer_sessions_status ON customer_sessions(status);
CREATE INDEX IF NOT EXISTS idx_customer_sessions_phone ON customer_sessions(phone_number);

-- RLS
ALTER TABLE customer_sessions ENABLE ROW LEVEL SECURITY;

-- Allow public access (needed for guest entry) - Refine later for security
CREATE POLICY "Public full access to sessions" ON customer_sessions
  FOR ALL USING (true);

-- Trigger for updated_at
CREATE TRIGGER update_customer_sessions_updated_at
  BEFORE UPDATE ON customer_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
