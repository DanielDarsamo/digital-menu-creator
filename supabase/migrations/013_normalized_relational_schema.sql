-- =============================================================================
-- Migration 013: Normalized Relational Schema for Fortaleza Restaurant System
-- =============================================================================
-- Purpose:
--   Upgrades the existing schema to a fully normalized relational model.
--   Replaces JSONB order items with a proper order_items table, adds a
--   structured order_events audit log, enforces the complete order lifecycle
--   (including 'paid' status), adds soft-delete to menu_items, and introduces
--   proper FK relationships between orders and staff (waiter/chef).
--
-- Depends on: 000_master_schema.sql through 012_seed_menu_data.sql
-- =============================================================================

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 1: EXTEND ORDER STATUS ENUM
-- Add 'paid' as a terminal state (was missing from original schema)
-- ─────────────────────────────────────────────────────────────────────────────

-- Supabase/PostgreSQL requires ALTER TYPE to add enum values
-- 'paid' sits between 'delivered' and 'cancelled' in the lifecycle
ALTER TYPE public.order_status ADD VALUE IF NOT EXISTS 'paid' AFTER 'delivered';

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 2: EXTEND orders TABLE
-- Add structured FK columns for staff assignment and lifecycle timestamps.
-- The legacy JSONB 'items' column is retained for backward compatibility
-- during the transition period. New code should use order_items table.
-- ─────────────────────────────────────────────────────────────────────────────

-- Staff assignment FKs (reference profiles, not auth.users directly)
-- ON DELETE SET NULL: Preserve order history if staff account is deleted
ALTER TABLE public.orders
    ADD COLUMN IF NOT EXISTS waiter_id UUID REFERENCES public.profiles(id)
        ON DELETE SET NULL ON UPDATE CASCADE,
    ADD COLUMN IF NOT EXISTS chef_id UUID REFERENCES public.profiles(id)
        ON DELETE SET NULL ON UPDATE CASCADE;

-- Lifecycle timestamps: one per status transition, immutable after set
-- These create a permanent audit trail at the row level
ALTER TABLE public.orders
    ADD COLUMN IF NOT EXISTS confirmed_at  TIMESTAMPTZ DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS preparing_at  TIMESTAMPTZ DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS ready_at      TIMESTAMPTZ DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS delivered_at_v2 TIMESTAMPTZ DEFAULT NULL,  -- delivered_at already exists
    ADD COLUMN IF NOT EXISTS paid_at       TIMESTAMPTZ DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS cancelled_at  TIMESTAMPTZ DEFAULT NULL;

-- Ensure total_amount column exists (normalized name alongside total_price)
ALTER TABLE public.orders
    ADD COLUMN IF NOT EXISTS total_amount NUMERIC(10,2) NOT NULL DEFAULT 0
        CHECK (total_amount >= 0);

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 3: EXTEND menu_categories TABLE
-- Add missing integrity columns to the existing menu_categories table
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE public.menu_categories
    ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN IF NOT EXISTS display_order INTEGER NOT NULL DEFAULT 0;

-- Enforce unique category names to prevent duplicates
ALTER TABLE public.menu_categories
    DROP CONSTRAINT IF EXISTS menu_categories_name_unique;
ALTER TABLE public.menu_categories
    ADD CONSTRAINT menu_categories_name_unique UNIQUE (name);

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 4: EXTEND menu_items TABLE
-- Add soft-delete support and tighten constraints.
-- CRITICAL: Hard delete is blocked by order_items FK (RESTRICT).
-- Soft delete is the ONLY safe way to "remove" a menu item.
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE public.menu_items
    ADD COLUMN IF NOT EXISTS is_deleted  BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN IF NOT EXISTS deleted_at  TIMESTAMPTZ DEFAULT NULL;

-- Integrity check: deleted_at must be set iff is_deleted is true
ALTER TABLE public.menu_items
    DROP CONSTRAINT IF EXISTS menu_items_soft_delete_consistency;
ALTER TABLE public.menu_items
    ADD CONSTRAINT menu_items_soft_delete_consistency
        CHECK (
            (is_deleted = false AND deleted_at IS NULL) OR
            (is_deleted = true  AND deleted_at IS NOT NULL)
        );

-- Ensure price is non-negative
ALTER TABLE public.menu_items
    DROP CONSTRAINT IF EXISTS menu_items_price_non_negative;
ALTER TABLE public.menu_items
    ADD CONSTRAINT menu_items_price_non_negative
        CHECK (price >= 0);

-- Change category FK from CASCADE to RESTRICT to prevent accidental data loss.
-- Admin must reassign items before deleting a category.
ALTER TABLE public.menu_items
    DROP CONSTRAINT IF EXISTS menu_items_category_id_fkey;
ALTER TABLE public.menu_items
    ADD CONSTRAINT menu_items_category_id_fkey
        FOREIGN KEY (category_id)
        REFERENCES public.menu_categories(id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE;

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 5: CREATE order_items TABLE
-- Normalized junction table replacing JSONB items column.
-- Stores a price SNAPSHOT at order time to preserve historical accuracy.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.order_items (
    id                   UUID        PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Parent order: cascade delete (items are meaningless without order)
    order_id             UUID        NOT NULL
                                     REFERENCES public.orders(id)
                                     ON DELETE CASCADE
                                     ON UPDATE CASCADE,

    -- Referenced menu item: RESTRICT delete to prevent history corruption.
    -- Use soft delete (menu_items.is_deleted) instead of hard delete.
    menu_item_id         UUID        NOT NULL
                                     REFERENCES public.menu_items(id)
                                     ON DELETE RESTRICT
                                     ON UPDATE CASCADE,

    -- Quantity must be positive
    quantity             INTEGER     NOT NULL CHECK (quantity > 0),

    -- Price SNAPSHOT at the moment the order was placed.
    -- This is intentionally denormalized: if the menu price changes later,
    -- historical orders must reflect what the customer actually paid.
    unit_price           NUMERIC(10,2) NOT NULL CHECK (unit_price >= 0),

    -- Computed column: enforced by CHECK and maintained by trigger
    subtotal             NUMERIC(10,2) NOT NULL CHECK (subtotal >= 0),

    -- Item-level special instructions (e.g. "no onions")
    special_instructions TEXT        DEFAULT NULL,

    created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Integrity: subtotal must equal quantity × unit_price
    CONSTRAINT order_items_subtotal_check
        CHECK (subtotal = quantity * unit_price)
);

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 6: CREATE order_events TABLE
-- Complete immutable audit log for every order state transition.
-- Replaces the existing order_audit_logs table with a richer structure.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.order_events (
    id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Parent order: cascade delete (events are meaningless without order)
    order_id     UUID        NOT NULL
                             REFERENCES public.orders(id)
                             ON DELETE CASCADE
                             ON UPDATE CASCADE,

    -- Actor who triggered the event.
    -- SET NULL: preserve event log even if staff account is deleted.
    -- NULL is valid for anonymous customer actions or system events.
    actor_id     UUID        DEFAULT NULL
                             REFERENCES public.profiles(id)
                             ON DELETE SET NULL
                             ON UPDATE CASCADE,

    -- Snapshot of actor's role at the time of the action.
    -- Stored separately because roles can change after the fact.
    actor_role   TEXT        DEFAULT NULL,

    -- Event classification
    event_type   TEXT        NOT NULL
                             CHECK (event_type IN (
                                 'created',
                                 'confirmed',
                                 'preparing',
                                 'ready',
                                 'delivered',
                                 'paid',
                                 'cancelled',
                                 'modified',
                                 'note_added',
                                 'item_added',
                                 'item_removed'
                             )),

    -- Status transition (NULL for non-status events like 'note_added')
    from_status  TEXT        DEFAULT NULL,
    to_status    TEXT        DEFAULT NULL,

    -- Flexible metadata: cancellation reason, payment method, etc.
    metadata     JSONB       DEFAULT '{}'::jsonb,

    -- Immutable timestamp: no updated_at on audit records
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 7: TRIGGERS
-- ─────────────────────────────────────────────────────────────────────────────

-- 7a. Auto-calculate order_items.subtotal on insert/update
-- Prevents application-layer bugs from storing incorrect subtotals
CREATE OR REPLACE FUNCTION public.calculate_order_item_subtotal()
RETURNS TRIGGER AS $$
BEGIN
    NEW.subtotal := NEW.quantity * NEW.unit_price;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_calculate_subtotal ON public.order_items;
CREATE TRIGGER trg_calculate_subtotal
    BEFORE INSERT OR UPDATE ON public.order_items
    FOR EACH ROW
    EXECUTE FUNCTION public.calculate_order_item_subtotal();

-- 7b. Auto-update orders.total_amount when order_items change
-- Keeps the denormalized total in sync with the normalized line items
CREATE OR REPLACE FUNCTION public.sync_order_total_amount()
RETURNS TRIGGER AS $$
DECLARE
    target_order_id UUID;
BEGIN
    -- Determine which order to recalculate
    IF TG_OP = 'DELETE' THEN
        target_order_id := OLD.order_id;
    ELSE
        target_order_id := NEW.order_id;
    END IF;

    UPDATE public.orders
    SET
        total_amount = (
            SELECT COALESCE(SUM(subtotal), 0)
            FROM public.order_items
            WHERE order_id = target_order_id
        ),
        updated_at = NOW()
    WHERE id = target_order_id;

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sync_order_total ON public.order_items;
CREATE TRIGGER trg_sync_order_total
    AFTER INSERT OR UPDATE OR DELETE ON public.order_items
    FOR EACH ROW
    EXECUTE FUNCTION public.sync_order_total_amount();

-- 7c. Auto-stamp lifecycle timestamps on orders when status changes
-- Ensures confirmed_at, preparing_at, etc. are always set correctly
CREATE OR REPLACE FUNCTION public.stamp_order_lifecycle_timestamps()
RETURNS TRIGGER AS $$
BEGIN
    -- Only act on status changes
    IF OLD.status IS NOT DISTINCT FROM NEW.status THEN
        RETURN NEW;
    END IF;

    -- Stamp the appropriate timestamp for the new status
    CASE NEW.status::TEXT
        WHEN 'confirmed'  THEN NEW.confirmed_at  := COALESCE(NEW.confirmed_at,  NOW());
        WHEN 'preparing'  THEN NEW.preparing_at  := COALESCE(NEW.preparing_at,  NOW());
        WHEN 'ready'      THEN NEW.ready_at      := COALESCE(NEW.ready_at,      NOW());
        WHEN 'delivered'  THEN NEW.delivered_at_v2 := COALESCE(NEW.delivered_at_v2, NOW());
        WHEN 'paid'       THEN NEW.paid_at       := COALESCE(NEW.paid_at,       NOW());
        WHEN 'cancelled'  THEN NEW.cancelled_at  := COALESCE(NEW.cancelled_at,  NOW());
        ELSE NULL;
    END CASE;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_stamp_order_lifecycle ON public.orders;
CREATE TRIGGER trg_stamp_order_lifecycle
    BEFORE UPDATE ON public.orders
    FOR EACH ROW
    WHEN (OLD.status IS DISTINCT FROM NEW.status)
    EXECUTE FUNCTION public.stamp_order_lifecycle_timestamps();

-- 7d. Auto-insert an order_event record on every status change
-- Provides a complete, tamper-evident audit trail
CREATE OR REPLACE FUNCTION public.log_order_status_change()
RETURNS TRIGGER AS $$
DECLARE
    v_actor_id   UUID;
    v_actor_role TEXT;
BEGIN
    -- Attempt to get actor from session context (set by application layer)
    -- Falls back to NULL for anonymous/system operations
    BEGIN
        v_actor_id := current_setting('app.current_user_id', true)::UUID;
    EXCEPTION WHEN OTHERS THEN
        v_actor_id := NULL;
    END;

    -- Fetch actor role at time of action
    IF v_actor_id IS NOT NULL THEN
        SELECT role::TEXT INTO v_actor_role
        FROM public.profiles
        WHERE id = v_actor_id;
    END IF;

    INSERT INTO public.order_events (
        order_id,
        actor_id,
        actor_role,
        event_type,
        from_status,
        to_status,
        metadata
    ) VALUES (
        NEW.id,
        v_actor_id,
        v_actor_role,
        NEW.status::TEXT,   -- event_type matches the new status
        OLD.status::TEXT,
        NEW.status::TEXT,
        jsonb_build_object(
            'waiter_id', NEW.waiter_id,
            'chef_id',   NEW.chef_id
        )
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_log_order_status_change ON public.orders;
CREATE TRIGGER trg_log_order_status_change
    AFTER UPDATE ON public.orders
    FOR EACH ROW
    WHEN (OLD.status IS DISTINCT FROM NEW.status)
    EXECUTE FUNCTION public.log_order_status_change();

-- 7e. Log order creation event
CREATE OR REPLACE FUNCTION public.log_order_creation()
RETURNS TRIGGER AS $$
DECLARE
    v_actor_id UUID;
BEGIN
    BEGIN
        v_actor_id := current_setting('app.current_user_id', true)::UUID;
    EXCEPTION WHEN OTHERS THEN
        v_actor_id := NULL;
    END;

    INSERT INTO public.order_events (
        order_id,
        actor_id,
        actor_role,
        event_type,
        from_status,
        to_status,
        metadata
    ) VALUES (
        NEW.id,
        v_actor_id,
        NULL,   -- anonymous customer creates orders
        'created',
        NULL,
        NEW.status::TEXT,
        jsonb_build_object(
            'table', NEW.customer_table,
            'customer_name', NEW.customer_name
        )
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_log_order_creation ON public.orders;
CREATE TRIGGER trg_log_order_creation
    AFTER INSERT ON public.orders
    FOR EACH ROW
    EXECUTE FUNCTION public.log_order_creation();

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 8: ROW LEVEL SECURITY
-- ─────────────────────────────────────────────────────────────────────────────

-- Enable RLS on new tables
ALTER TABLE public.order_items  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_events ENABLE ROW LEVEL SECURITY;

-- ── order_items policies ──────────────────────────────────────────────────────

-- Anonymous customers can insert order items (when creating an order)
CREATE POLICY "Anyone can insert order items" ON public.order_items
    FOR INSERT TO anon, authenticated
    WITH CHECK (true);

-- Anonymous customers can view order items (for their order confirmation)
CREATE POLICY "Anyone can view order items" ON public.order_items
    FOR SELECT TO anon, authenticated
    USING (true);

-- Only staff can update order items (e.g. quantity corrections)
CREATE POLICY "Staff can update order items" ON public.order_items
    FOR UPDATE TO authenticated
    USING (public.is_staff());

-- Only admins can delete order items
CREATE POLICY "Admins can delete order items" ON public.order_items
    FOR DELETE TO authenticated
    USING (public.is_admin());

-- ── order_events policies ─────────────────────────────────────────────────────

-- Audit log is insert-only from application perspective
-- The trigger function uses SECURITY DEFINER to bypass RLS for inserts

-- Staff and admins can read the full audit trail
CREATE POLICY "Staff can view order events" ON public.order_events
    FOR SELECT TO authenticated
    USING (public.is_staff());

-- Admins have full access (for potential corrections)
CREATE POLICY "Admins full access to order events" ON public.order_events
    FOR ALL TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 9: PERFORMANCE INDEXES
-- ─────────────────────────────────────────────────────────────────────────────

-- order_items: most common query patterns
CREATE INDEX IF NOT EXISTS idx_order_items_order_id
    ON public.order_items(order_id);

CREATE INDEX IF NOT EXISTS idx_order_items_menu_item_id
    ON public.order_items(menu_item_id);

-- order_events: audit queries by order and time
CREATE INDEX IF NOT EXISTS idx_order_events_order_id
    ON public.order_events(order_id);

CREATE INDEX IF NOT EXISTS idx_order_events_actor_id
    ON public.order_events(actor_id);

CREATE INDEX IF NOT EXISTS idx_order_events_created_at
    ON public.order_events(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_order_events_event_type
    ON public.order_events(event_type);

-- orders: staff assignment queries
CREATE INDEX IF NOT EXISTS idx_orders_waiter_id
    ON public.orders(waiter_id);

CREATE INDEX IF NOT EXISTS idx_orders_chef_id
    ON public.orders(chef_id);

-- menu_items: filter out soft-deleted items efficiently
CREATE INDEX IF NOT EXISTS idx_menu_items_is_deleted
    ON public.menu_items(is_deleted)
    WHERE is_deleted = false;

CREATE INDEX IF NOT EXISTS idx_menu_items_category_available
    ON public.menu_items(category_id, is_available)
    WHERE is_deleted = false;

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 10: HELPER VIEWS
-- Convenience views for common query patterns
-- ─────────────────────────────────────────────────────────────────────────────

-- Active menu items (excludes soft-deleted)
CREATE OR REPLACE VIEW public.active_menu_items AS
    SELECT
        mi.*,
        mc.name  AS category_name,
        mc.display_order AS category_display_order
    FROM public.menu_items mi
    JOIN public.menu_categories mc ON mc.id = mi.category_id
    WHERE mi.is_deleted = false
      AND mi.is_available = true
      AND mc.is_active = true
    ORDER BY mc.display_order, mc.name, mi.name;

-- Order summary with item count and staff names
CREATE OR REPLACE VIEW public.order_summary AS
    SELECT
        o.id,
        o.order_number,
        o.customer_name,
        o.customer_table,
        o.status,
        o.total_amount,
        o.created_at,
        o.confirmed_at,
        o.preparing_at,
        o.ready_at,
        o.delivered_at_v2 AS delivered_at,
        o.paid_at,
        o.cancelled_at,
        o.waiter_id,
        CONCAT(wp.first_name, ' ', wp.last_name) AS waiter_name,
        o.chef_id,
        CONCAT(cp.first_name, ' ', cp.last_name) AS chef_name,
        COUNT(oi.id)  AS item_count,
        SUM(oi.quantity) AS total_items
    FROM public.orders o
    LEFT JOIN public.profiles wp ON wp.id = o.waiter_id
    LEFT JOIN public.profiles cp ON cp.id = o.chef_id
    LEFT JOIN public.order_items oi ON oi.order_id = o.id
    GROUP BY
        o.id, o.order_number, o.customer_name, o.customer_table,
        o.status, o.total_amount, o.created_at, o.confirmed_at,
        o.preparing_at, o.ready_at, o.delivered_at_v2, o.paid_at,
        o.cancelled_at, o.waiter_id, wp.first_name, wp.last_name,
        o.chef_id, cp.first_name, cp.last_name;

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 11: SOFT-DELETE HELPER FUNCTION
-- Application should call this instead of DELETE on menu_items
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.soft_delete_menu_item(p_item_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE public.menu_items
    SET
        is_deleted   = true,
        is_available = false,
        deleted_at   = NOW(),
        updated_at   = NOW()
    WHERE id = p_item_id
      AND is_deleted = false;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Menu item % not found or already deleted', p_item_id;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 12: VALIDATION QUERIES
-- Run these after applying the migration to verify correctness
-- ─────────────────────────────────────────────────────────────────────────────

-- Verify all new tables exist
-- SELECT table_name FROM information_schema.tables
-- WHERE table_schema = 'public'
-- AND table_name IN ('order_items', 'order_events');

-- Verify new columns on orders
-- SELECT column_name FROM information_schema.columns
-- WHERE table_schema = 'public' AND table_name = 'orders'
-- AND column_name IN ('waiter_id', 'chef_id', 'confirmed_at', 'paid_at', 'cancelled_at', 'total_amount');

-- Verify soft-delete columns on menu_items
-- SELECT column_name FROM information_schema.columns
-- WHERE table_schema = 'public' AND table_name = 'menu_items'
-- AND column_name IN ('is_deleted', 'deleted_at');

-- Verify 'paid' status is in the enum
-- SELECT enumlabel FROM pg_enum
-- JOIN pg_type ON pg_type.oid = pg_enum.enumtypid
-- WHERE pg_type.typname = 'order_status';

-- Verify triggers exist
-- SELECT trigger_name FROM information_schema.triggers
-- WHERE trigger_schema = 'public'
-- AND trigger_name IN (
--   'trg_calculate_subtotal',
--   'trg_sync_order_total',
--   'trg_stamp_order_lifecycle',
--   'trg_log_order_status_change',
--   'trg_log_order_creation'
-- );
