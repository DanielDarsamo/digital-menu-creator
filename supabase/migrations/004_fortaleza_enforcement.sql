-- Fortaleza Digital Restaurant Platform
-- Migration: 004_fortaleza_enforcement.sql
-- Purpose: Strict server-side enforcement of Order Lifecycle, Roles, and Attribution.

-- 1. ENFORCE ORDER STATUS ENUM
-- We drop existing check to be safe, then apply the Strict Fortaleza Constraints
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check;
ALTER TABLE orders ADD CONSTRAINT orders_status_check 
    CHECK (status IN ('draft', 'pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled'));

-- 2. CREATE AUDIT LOG TABLE
-- "If a feature cannot be audited, it is incomplete"
CREATE TABLE IF NOT EXISTS order_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    previous_status TEXT,
    new_status TEXT,
    action_type TEXT NOT NULL, -- 'status_change', 'update_details', 'create', 'delete'
    changed_by_id UUID NOT NULL, -- References auth.users(id) ideally, but loosely for now
    changed_by_role TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb, -- Store reason, payment method details, etc.
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on audit logs (Admins view all, Waiters view own actions?)
ALTER TABLE order_audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins view all logs" ON order_audit_logs
    FOR SELECT TO authenticated
    USING (auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));

-- 3. THE "FORTALEZA" TRIGGER FUNCTION
CREATE OR REPLACE FUNCTION enforce_fortaleza_lifecycle()
RETURNS TRIGGER AS $$
DECLARE
    actor_role TEXT;
    actor_id UUID;
BEGIN
    -- 0. IDENTIFY ACTOR
    actor_id := auth.uid();
    
    -- Bypass for system/seed if needed (careful with this)
    IF actor_id IS NULL THEN
        RETURN NEW; -- Or RAISE EXCEPTION if simultaneous strictness required? 
                    -- For now, allow server-side admin scripts to pass.
    END IF;

    SELECT role INTO actor_role FROM profiles WHERE id = actor_id;

    -- Safety Check
    IF actor_role IS NULL THEN
        RAISE EXCEPTION 'Access Denied: User has no assigned role.';
    END IF;

    -- 1. ROLE PERMISSIONS & TRANSITIONS
    -- Determine Logic based on Role

    -- === CUSTOMER ===
    -- Can only: Create Draft -> Pending
    -- Cannot: Modify confirmed orders
    IF actor_role = 'customer' OR actor_role IS DISTINCT FROM 'admin' AND actor_role IS DISTINCT FROM 'waiter' AND actor_role IS DISTINCT FROM 'chef' THEN
       -- Assumed generic user is customer
       IF TG_OP = 'INSERT' THEN
           IF NEW.status NOT IN ('draft', 'pending') THEN
               RAISE EXCEPTION 'Customers can only create Draft or Pending orders.';
           END IF;
       ELSIF TG_OP = 'UPDATE' THEN
           -- Customer can only cancel if still pending? Directives say "Customers cannot cancel orders directly" (Item 1).
           RAISE EXCEPTION 'Customers cannot modify active orders.';
       END IF;
       -- Customer Delete is blocked by RLS usually, but safety here:
       IF TG_OP = 'DELETE' THEN
           RAISE EXCEPTION 'Customers cannot delete orders.';
       END IF;
    END IF;

    -- === WAITER ===
    -- Responsibilities: Accept, Set Payment, Deliver, Cancel
    IF actor_role = 'waiter' THEN
        IF TG_OP = 'DELETE' THEN
            RAISE EXCEPTION 'Waiters cannot delete orders.';
        END IF;
        
        IF TG_OP = 'UPDATE' THEN
            -- Check Assignment
            IF OLD.accepted_by IS DISTINCT FROM actor_id AND NEW.accepted_by IS DISTINCT FROM actor_id THEN
                -- If picking up an unassigned order
                 IF OLD.accepted_by IS NULL AND NEW.accepted_by = actor_id THEN
                    -- Authorized pickup
                 ELSE
                    RAISE EXCEPTION 'You cannot modify orders assigned to other waiters.';
                 END IF;
            END IF;

            -- Status Transitions
            IF OLD.status != NEW.status THEN
                 -- Allowed: pending -> confirmed (Accept)
                 IF OLD.status = 'pending' AND NEW.status = 'confirmed' THEN
                    -- Check if they claimed it
                    IF NEW.accepted_by != actor_id THEN
                        RAISE EXCEPTION 'You must accept the order to confirm it.';
                    END IF;
                 
                 -- Allowed: confirmed -> cancelled (Cancel)
                 ELSIF OLD.status = 'confirmed' AND NEW.status = 'cancelled' THEN
                    -- Reason required?
                    IF NEW.rejection_reason IS NULL OR length(NEW.rejection_reason) < 3 THEN
                        RAISE EXCEPTION 'Cancellation reason is required.';
                    END IF;

                 -- Allowed: preparing -> cancelled (Cancel)
                 ELSIF OLD.status = 'preparing' AND NEW.status = 'cancelled' THEN
                     IF NEW.rejection_reason IS NULL THEN
                        RAISE EXCEPTION 'Cancellation reason is required.';
                    END IF;

                 -- Allowed: ready -> delivered (Deliver)
                 ELSIF OLD.status = 'ready' AND NEW.status = 'delivered' THEN
                    IF NEW.payment_type IS NULL THEN
                        RAISE EXCEPTION 'Payment type required for delivery.';
                    END IF;

                 ELSE
                    RAISE EXCEPTION 'Waiters cannot perform transition: % -> %', OLD.status, NEW.status;
                 END IF;
            END IF;
            
            -- Waiter cannot modify ITEMS (?) "Waiters cannot Modify order contents"
            IF OLD.items IS DISTINCT FROM NEW.items THEN
                 RAISE EXCEPTION 'Waiters cannot modify order items.';
            END IF;
        END IF;
    END IF;

    -- === KITCHEN (CHEF) ===
    -- Responsibilities: confirmed -> preparing -> ready
    IF actor_role = 'chef' THEN
         IF TG_OP = 'DELETE' THEN RAISE EXCEPTION 'Chefs cannot delete orders.'; END IF;
         IF TG_OP = 'INSERT' THEN RAISE EXCEPTION 'Chefs cannot create orders.'; END IF;

         IF TG_OP = 'UPDATE' THEN
             -- Check for unauthorized field changes (Payment, Customer Info)
             IF NEW.payment_type IS DISTINCT FROM OLD.payment_type THEN
                  RAISE EXCEPTION 'Kitchen cannot modify payment details.';
             END IF;

             -- Status Transitions
             IF OLD.status != NEW.status THEN
                 IF OLD.status = 'confirmed' AND NEW.status = 'preparing' THEN
                     -- OK
                 ELSIF OLD.status = 'preparing' AND NEW.status = 'ready' THEN
                     -- OK
                 ELSE
                     RAISE EXCEPTION 'Chefs cannot perform transition: % -> %', OLD.status, NEW.status;
                 END IF;
             ELSE
                 -- Updating other fields? 
                 -- Kitchen likely shouldn't update anything else unless it's strictly kitchen notes?
                 -- For strictness:
                 RAISE EXCEPTION 'Kitchen can only update Order Status.';
             END IF;
         END IF;
    END IF;

    -- === ADMIN ===
    -- "Full visibility... Override if necessary"
    -- Admins pass all checks essentially, but we still Log.

    -- 2. ATTRIBUTION ENFORCEMENT
    -- Ensure the row reflects who touched it
    IF TG_OP = 'UPDATE' THEN
        NEW.last_updated_by_role := actor_role;
        NEW.last_updated_by_name := 'User ' || substr(actor_id::text, 1, 4); -- Simplified, ideally fetch name
        -- Note: The frontend sends 'last_updated_by_role' but we should override it with Truth
    END IF;

    -- 3. AUDIT LOGGING
    -- "Every order mutation must record..."
    IF TG_OP = 'UPDATE' OR TG_OP = 'INSERT' THEN
        INSERT INTO order_audit_logs (
            order_id, previous_status, new_status, action_type, changed_by_id, changed_by_role, metadata
        ) VALUES (
            COALESCE(NEW.id, OLD.id),
            CASE WHEN TG_OP = 'UPDATE' THEN OLD.status ELSE NULL END,
            NEW.status,
            TG_OP,
            actor_id,
            actor_role,
            jsonb_build_object('reason', NEW.rejection_reason)
        );
    ELSIF TG_OP = 'DELETE' THEN
         INSERT INTO order_audit_logs (
            order_id, previous_status, new_status, action_type, changed_by_id, changed_by_role
        ) VALUES (
            OLD.id,
            OLD.status,
            'DELETED',
            'DELETE',
            actor_id,
            actor_role
        );
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. BIND TRIGGER
DROP TRIGGER IF EXISTS trg_fortaleza_enforce ON orders;
CREATE TRIGGER trg_fortaleza_enforce
    BEFORE INSERT OR UPDATE OR DELETE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION enforce_fortaleza_lifecycle();
