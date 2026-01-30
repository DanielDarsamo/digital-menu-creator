-- DIAGNOSTIC: List triggers and their function source code
SELECT 
    trig.tgname AS trigger_name,
    proc.proname AS function_name,
    proc.prosrc AS function_source
FROM pg_trigger trig
JOIN pg_proc proc ON trig.tgfoid = proc.oid
WHERE trig.tgrelid = 'public.orders'::regclass;
