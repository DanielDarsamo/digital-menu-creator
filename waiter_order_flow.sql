-- Phase 5: Waiter Order Flow Redesign
-- This script adds payment type tracking, status transition validation, and audit improvements

-- 1. Add payment_type column to orders
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS payment_type TEXT CHECK (payment_type IN ('cash', 'card', 'mobile'));

-- 2. Rename waiter_id to accepted_by for clarity
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'orders' AND column_name = 'waiter_id') THEN
        ALTER TABLE public.orders RENAME COLUMN waiter_id TO accepted_by;
    END IF;
END $$;

-- 3. Ensure accepted_at column exists
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS accepted_at TIMESTAMPTZ;

-- 4. Create status transition validation function
CREATE OR REPLACE FUNCTION validate_status_transition(
    old_status TEXT,
    new_status TEXT
) RETURNS BOOLEAN AS $$
BEGIN
    -- Define allowed transitions
    RETURN CASE
        WHEN old_status = 'pending' AND new_status = 'confirmed' THEN TRUE
        WHEN old_status = 'confirmed' AND new_status IN ('preparing', 'cancelled') THEN TRUE
        WHEN old_status = 'preparing' AND new_status IN ('ready', 'cancelled') THEN TRUE
        WHEN old_status = 'ready' AND new_status = 'delivered' THEN TRUE
        WHEN old_status = new_status THEN TRUE -- Allow same status (no change)
        ELSE FALSE
    END;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 5. Create trigger to enforce status transitions
CREATE OR REPLACE FUNCTION enforce_status_transition()
RETURNS TRIGGER AS $$
BEGIN
    -- Only validate if status is changing
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        IF NOT validate_status_transition(OLD.status, NEW.status) THEN
            RAISE EXCEPTION 'Invalid status transition from % to %', OLD.status, NEW.status;
        END IF;
        
        -- Require payment_type before marking as delivered
        IF NEW.status = 'delivered' AND NEW.payment_type IS NULL THEN
            RAISE EXCEPTION 'Payment type is required before marking order as delivered';
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS check_status_transition ON public.orders;

-- Create the trigger
CREATE TRIGGER check_status_transition
    BEFORE UPDATE ON public.orders
    FOR EACH ROW
    EXECUTE FUNCTION enforce_status_transition();

-- 6. Update RLS policies for waiter order ownership
-- Drop existing policies
DROP POLICY IF EXISTS "Waiters can update their own orders" ON public.orders;

-- Waiters can only update orders they've accepted
CREATE POLICY "Waiters can update their accepted orders"
ON public.orders
FOR UPDATE
USING (
    accepted_by = auth.uid() 
    AND is_waiter()
)
WITH CHECK (
    accepted_by = auth.uid() 
    AND is_waiter()
);

-- Waiters can accept pending orders (set accepted_by)
CREATE POLICY "Waiters can accept pending orders"
ON public.orders
FOR UPDATE
USING (
    status = 'pending' 
    AND accepted_by IS NULL 
    AND is_waiter()
);

-- 7. Add index for accepted_by
CREATE INDEX IF NOT EXISTS idx_orders_accepted_by ON public.orders(accepted_by);

-- 8. Add index for payment_type
CREATE INDEX IF NOT EXISTS idx_orders_payment_type ON public.orders(payment_type);

-- 9. Update order_statistics view to include payment type breakdown
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
    AVG(total_price) FILTER (WHERE status = 'delivered') as avg_order_value,
    COUNT(*) FILTER (WHERE payment_type = 'cash') as cash_payments,
    COUNT(*) FILTER (WHERE payment_type = 'card') as card_payments,
    COUNT(*) FILTER (WHERE payment_type = 'mobile') as mobile_payments
FROM public.orders;

GRANT SELECT ON public.order_statistics TO anon, authenticated;

COMMENT ON COLUMN public.orders.payment_type IS 'Payment method: cash, card, or mobile';
COMMENT ON COLUMN public.orders.accepted_by IS 'Waiter who accepted this order';
COMMENT ON FUNCTION validate_status_transition IS 'Validates allowed status transitions for orders';
