-- Temporary fix: Disable status transition trigger for admins
-- This allows admins to change order status freely while we fix RLS

-- Option 1: Completely disable the trigger temporarily
DROP TRIGGER IF EXISTS check_status_transition ON public.orders;

-- Option 2: Or make the trigger more permissive - only validate for specific cases
CREATE OR REPLACE FUNCTION enforce_status_transition()
RETURNS TRIGGER AS $$
BEGIN
    -- Only validate status transitions if:
    -- 1. Status is actually changing
    -- 2. NOT going to 'cancelled' (allow cancel from any state)
    IF OLD.status IS DISTINCT FROM NEW.status AND NEW.status != 'cancelled' THEN
        -- Only enforce strict validation for specific transitions
        -- Allow most transitions, just block obviously wrong ones
        IF (OLD.status = 'delivered' AND NEW.status != 'delivered') THEN
            -- Can't un-deliver an order
            RAISE EXCEPTION 'Cannot change status from delivered to %', NEW.status;
        END IF;
    END IF;
    
    -- Always require payment_type before marking as delivered
    IF NEW.status = 'delivered' AND NEW.payment_type IS NULL THEN
        RAISE EXCEPTION 'Payment type is required before marking order as delivered';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Re-create the trigger with the new permissive function
CREATE TRIGGER check_status_transition
    BEFORE UPDATE ON public.orders
    FOR EACH ROW
    EXECUTE FUNCTION enforce_status_transition();
