-- Debug: Check current RLS policies on orders table
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'orders';

-- This will show you all the RLS policies.
-- Look for UPDATE policies that might be blocking subsequent updates.
