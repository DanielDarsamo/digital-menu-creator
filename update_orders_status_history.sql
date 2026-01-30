-- Add status_history column to orders table
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS status_history JSONB[] DEFAULT ARRAY[]::JSONB[];

-- Comment on column
COMMENT ON COLUMN public.orders.status_history IS 'Audit trail of status changes';

-- No need to update RLS if 'update' policy is already broad enough for the table, 
-- but ensuring the column is writable is good.
-- Existing policies usually cover the whole row (FOR UPDATE USING ...).
