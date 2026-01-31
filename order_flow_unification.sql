-- Phase 6: Order Flow Unification - Database Schema
-- This script adds audit trail fields for order attribution and accountability

-- 1. Add audit trail columns to orders table
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS accepted_by_role TEXT CHECK (accepted_by_role IN ('admin', 'waiter'));

ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS accepted_by_name TEXT;

ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS last_updated_by_role TEXT CHECK (last_updated_by_role IN ('admin', 'waiter'));

ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS last_updated_by_name TEXT;

-- 2. Create function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Create trigger to auto-update updated_at
DROP TRIGGER IF EXISTS update_orders_updated_at ON public.orders;

CREATE TRIGGER update_orders_updated_at
    BEFORE UPDATE ON public.orders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 4. Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_orders_accepted_by_role ON public.orders(accepted_by_role);
CREATE INDEX IF NOT EXISTS idx_orders_accepted_by_name ON public.orders(accepted_by_name);
CREATE INDEX IF NOT EXISTS idx_orders_last_updated_by_role ON public.orders(last_updated_by_role);

-- 5. Add helpful comments
COMMENT ON COLUMN public.orders.accepted_by_role IS 'Role of person who accepted the order: admin or waiter';
COMMENT ON COLUMN public.orders.accepted_by_name IS 'Name of person who accepted the order';
COMMENT ON COLUMN public.orders.last_updated_by_role IS 'Role of person who last updated the order';
COMMENT ON COLUMN public.orders.last_updated_by_name IS 'Name of person who last updated the order';

-- 6. Backfill existing orders with default values (optional)
UPDATE public.orders 
SET 
    accepted_by_role = 'admin',
    accepted_by_name = 'System',
    last_updated_by_role = 'admin',
    last_updated_by_name = 'System'
WHERE accepted_by_role IS NULL;

-- 7. Verify the changes
SELECT 
    column_name, 
    data_type, 
    column_default,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'orders' 
AND column_name IN ('accepted_by_role', 'accepted_by_name', 'last_updated_by_role', 'last_updated_by_name')
ORDER BY ordinal_position;
