
-- Add last_updated_by column to orders table if it doesn't exist
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS last_updated_by uuid REFERENCES public.profiles(id);

-- Add last_updated_by to audit trail trigger or ensures it's updated manually
-- (We are updating it manually in OrderService for now)

-- Grant usage
GRANT ALL ON public.orders TO authenticated;
