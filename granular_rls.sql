
-- Disable RLS momentarily to clean up
ALTER TABLE orders DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies to start fresh
DROP POLICY IF EXISTS "Enable all access for authenticated users" ON orders;
DROP POLICY IF EXISTS "Admins have full access" ON orders;
DROP POLICY IF EXISTS "Waiters can view available and assigned orders" ON orders;
DROP POLICY IF EXISTS "Waiters can update orders" ON orders;
DROP POLICY IF EXISTS "Waiters can update assigned orders" ON orders; 
DROP POLICY IF EXISTS "Customers can view their own orders" ON orders;

-- Enable RLS
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- 1. Admin Policy: Full Access (Select, Insert, Update, Delete)
CREATE POLICY "Admins have full access" ON orders
FOR ALL
TO authenticated
USING (
  auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin')
)
WITH CHECK (
  auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin')
);

-- 2. Waiter Select Policy
-- Waiters can see confirmed orders (available to pick up) 
-- OR orders they have already accepted
CREATE POLICY "Waiters can view orders" ON orders
FOR SELECT
TO authenticated
USING (
  auth.uid() IN (SELECT id FROM profiles WHERE role = 'waiter') AND
  (
    (status = 'confirmed' AND accepted_by IS NULL) OR 
    (accepted_by = auth.uid())
  )
);

-- 3. Waiter Update Policy
-- Waiters can update orders if:
-- a) They are accepting a confirmed order (transitioning accepted_by from NULL to their ID)
-- b) They are updating an order they already accepted
CREATE POLICY "Waiters can update orders" ON orders
FOR UPDATE
TO authenticated
USING (
  auth.uid() IN (SELECT id FROM profiles WHERE role = 'waiter') AND
  (
    (status = 'confirmed' AND accepted_by IS NULL) OR 
    (accepted_by = auth.uid())
  )
)
WITH CHECK (
  auth.uid() IN (SELECT id FROM profiles WHERE role = 'waiter') AND
  accepted_by = auth.uid()
);

-- 4. Customer Policy (Optional, for future)
-- Customers can see orders they created (if we track customer_id or via cookie/session match)
-- For now, maybe just "Customers can insert"? 
-- Assuming customers are anonymous or authenticated differently?
-- If customers are anonymous (public), we need a policy for anon.
-- If customers are authenticated, we need a policy for them.
-- For now, let's assume customers use the 'anon' role to INSERT.

CREATE POLICY "Public can create orders" ON orders
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Customers should ability to view their order? usually via ID/UUID which is hard to guess.
-- But for "My Orders" feature, they might need to read.
-- If the app uses a persistent ID for the customer, we can use that.
-- For now, let's allow anon to SELECT if they know the ID? No, that's "Enable read access for all users".
-- Let's stick to authenticated roles for management. Customers might see order status via public subscription or just local state.


-- Validate Profiles Policies
-- Ensure users can read their own profile to make the subqueries work
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile" ON profiles
FOR SELECT
TO authenticated
USING (
  auth.uid() = id
);
