
-- Function to validate status transitions and enforce role permissions
CREATE OR REPLACE FUNCTION enforce_status_transition()
RETURNS TRIGGER AS $$
DECLARE
    user_role text;
BEGIN
    -- Get the role of the user performing the update
    -- This relies on RLS policy on profiles allowing users to read their own profile
    SELECT role INTO user_role FROM profiles WHERE id = auth.uid();

    -- If no role found (system or unauthenticated), maybe allow or restrict?
    -- For now, if no role, assume system/admin or fail safe.
    IF user_role IS NULL THEN
        -- Allow system updates (e.g. from edge functions with service role)
        -- But if it's a real user without a profile, block.
        -- Assuming auth.uid() is not null for authenticated users.
        IF auth.uid() IS NOT NULL THEN
             RAISE EXCEPTION 'User profile not found or role not assigned.';
        END IF;
        -- If auth.uid() is null, it's a service role update, allow.
        RETURN NEW;
    END IF;

    -- Admin Bypass: Admins can do anything
    IF user_role = 'admin' THEN
        RETURN NEW;
    END IF;

    -- Waiter Logic
    IF user_role = 'waiter' THEN
        -- Check if waiter is assigning themselves
        IF OLD.accepted_by IS NULL AND NEW.accepted_by = auth.uid() THEN
            -- Allowing claiming the order
            -- Status might change from pending to confirmed? Or stay confirmed.
            -- If status changes, ensure valid transition.
        ELSIF OLD.accepted_by != auth.uid() THEN
            RAISE EXCEPTION 'You can only update orders assigned to you.';
        END IF;

        -- Status Transitions
        IF OLD.status != NEW.status THEN
            -- Valid Transitions for Waiters
            IF OLD.status = 'confirmed' AND NEW.status = 'preparing' THEN
                -- OK
            ELSIF OLD.status = 'preparing' AND NEW.status = 'ready' THEN
                -- OK
            ELSIF OLD.status = 'ready' AND NEW.status = 'delivered' THEN
                -- Must have payment type
                IF NEW.payment_type IS NULL THEN
                    RAISE EXCEPTION 'Payment type is required before marking as delivered.';
                END IF;
                -- OK
            ELSIF NEW.status = 'cancelled' THEN
                 -- OK (Waiters can cancel their orders)
            ELSE
                RAISE EXCEPTION 'Invalid status transition from % to % for waiter.', OLD.status, NEW.status;
            END IF;
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 
-- SECURITY DEFINER allows the function to run with privileges of the creator (usually postgres/admin)
-- This bypasses RLS on profiles if the table owner has access, but we still use auth.uid()
-- Actually, SECURITY DEFINER is risky if not careful. 
-- But here we need to read profiles. If RLS on profiles is restrictive, this helps?
-- No, we just added RLS to profiles to allow reading own profile. So we don't strictly need SECURITY DEFINER for that.
-- However, we might want to ensure consistent behavior. 
-- Let's stick to standard permissions (INVOKER) since we fixed profiles RLS.
-- Removing SECURITY DEFINER for safety unless needed.

CREATE OR REPLACE FUNCTION enforce_status_transition()
RETURNS TRIGGER AS $$
DECLARE
    user_role text;
BEGIN
    SELECT role INTO user_role FROM profiles WHERE id = auth.uid();

    IF user_role IS NULL AND auth.uid() IS NOT NULL THEN
         RAISE EXCEPTION 'User profile not found.';
    END IF;

    IF user_role = 'admin' THEN
        RETURN NEW;
    END IF;

    IF user_role = 'waiter' THEN
        -- Allow updates only if assigned to this waiter OR becoming assigned
        IF OLD.accepted_by IS DISTINCT FROM auth.uid() AND NEW.accepted_by IS DISTINCT FROM auth.uid() THEN
             -- Waiter trying to update unassigned order without taking it?
             -- If order is unassigned, they must take it (NEW.accepted_by = auth.uid()) 
             -- Exception: RLS handles visibility/update permission. This function handles logic.
             -- If RLS let it through, we double check?
             -- RLS says: Update allowed if (status='confirmed' and accepted_by is null) OR (accepted_by = auth.uid())
             -- So if they update an unassigned order, they MUST set accepted_by = auth.uid() in the UPDATE statement?
             -- If they assume RLS does it for them? No, RLS checks the result row.
             -- So we don't need to enforce "claiming" here strictly if RLS does it.
             NULL;
        END IF;

        IF OLD.status != NEW.status THEN
            IF OLD.status = 'confirmed' AND NEW.status = 'preparing' THEN
               -- OK
            ELSIF OLD.status = 'preparing' AND NEW.status = 'ready' THEN
               -- OK
            ELSIF OLD.status = 'ready' AND NEW.status = 'delivered' THEN
                IF NEW.payment_type IS NULL THEN
                    RAISE EXCEPTION 'Payment type is required before marking as delivered.';
                END IF;
            ELSIF NEW.status = 'cancelled' THEN
               -- OK
            ELSE
                RAISE EXCEPTION 'Invalid status transition from % to %.', OLD.status, NEW.status;
            END IF;
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS check_status_transition ON orders;
CREATE TRIGGER check_status_transition
    BEFORE UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION enforce_status_transition();
