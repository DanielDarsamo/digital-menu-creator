-- Fix: Allow admins to bypass status transition validation
-- Run this to let admins change order status freely

-- Update the trigger function to check if user is admin
CREATE OR REPLACE FUNCTION enforce_status_transition()
RETURNS TRIGGER AS $$
DECLARE
    is_admin_user BOOLEAN;
BEGIN
    -- Check if current user is admin
    SELECT EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    ) INTO is_admin_user;

    -- Admins can change to any status, skip validation
    IF is_admin_user THEN
        -- Still require payment_type before delivery
        IF NEW.status = 'delivered' AND NEW.payment_type IS NULL THEN
            RAISE EXCEPTION 'Payment type is required before marking order as delivered';
        END IF;
        RETURN NEW;
    END IF;

    -- For non-admins, validate status transitions
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- The trigger is already created, this just updates the function
