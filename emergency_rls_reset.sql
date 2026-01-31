-- Emergency RLS Reset - Run this to completely reset RLS policies
-- This will help us identify if RLS is the problem

-- 1. Disable RLS on orders table temporarily
ALTER TABLE public.orders DISABLE ROW LEVEL SECURITY;

-- 2. Drop ALL existing policies on orders
DROP POLICY IF EXISTS "Authenticated users can view orders" ON public.orders;
DROP POLICY IF EXISTS "Waiters can update their accepted orders" ON public.orders;
DROP POLICY IF EXISTS "Waiters can accept pending orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can manage all orders" ON public.orders;
DROP POLICY IF EXISTS "Waiters can update orders" ON public.orders;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.orders;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.orders;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON public.orders;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON public.orders;

-- 3. Re-enable RLS with simple policies
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- 4. Create simple, permissive policies for testing
CREATE POLICY "Allow all authenticated users full access"
ON public.orders
FOR ALL
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

-- 5. Check profiles table RLS
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users to read all profiles"
ON public.profiles
FOR SELECT
USING (auth.role() = 'authenticated');

CREATE POLICY "Allow users to insert their own profile"
ON public.profiles
FOR INSERT
WITH CHECK (auth.uid() = id);

CREATE POLICY "Allow users to update their own profile"
ON public.profiles
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- 6. Verify the functions exist and work
SELECT proname, provolatile, prosecdef 
FROM pg_proc 
WHERE proname IN ('is_admin', 'is_waiter');

-- If the above query returns no rows, the functions don't exist
-- You can create simple test versions:

CREATE OR REPLACE FUNCTION public.test_auth() 
RETURNS TABLE(user_id uuid, user_role text) AS $$
BEGIN
    RETURN QUERY
    SELECT auth.uid(), p.role
    FROM public.profiles p
    WHERE p.id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Test this function after login:
-- SELECT * FROM test_auth();
