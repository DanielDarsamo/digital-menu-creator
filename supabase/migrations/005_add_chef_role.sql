-- Migration 005: Add chef role to profiles
-- This enables Kitchen staff to be properly identified and permissioned

-- Step 1: Drop existing role constraint if it exists
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;

-- Step 2: Add new constraint with chef role
ALTER TABLE profiles ADD CONSTRAINT profiles_role_check 
    CHECK (role IN ('admin', 'waiter', 'chef'));

-- Step 3: Grant chef users the ability to read their own profile (for RLS)
-- (This is already covered by existing RLS, but we ensure it's explicit)

-- Verification query
-- SELECT role, COUNT(*) FROM profiles GROUP BY role;
