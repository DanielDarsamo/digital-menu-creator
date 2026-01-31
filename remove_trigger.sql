-- Remove status transition validation completely
-- This allows free status changes for testing

-- Drop the trigger
DROP TRIGGER IF EXISTS check_status_transition ON public.orders;

-- Drop the function
DROP FUNCTION IF EXISTS enforce_status_transition();

-- Verify it's gone
SELECT tgname 
FROM pg_trigger 
WHERE tgrelid = 'public.orders'::regclass;

-- Should return empty result
