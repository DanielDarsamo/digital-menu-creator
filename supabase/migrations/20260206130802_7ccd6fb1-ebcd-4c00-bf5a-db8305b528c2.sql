-- Create menu_categories table
CREATE TABLE IF NOT EXISTS public.menu_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    icon TEXT NOT NULL DEFAULT '🍽️',
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.menu_categories ENABLE ROW LEVEL SECURITY;

-- Anyone can view categories
CREATE POLICY "Anyone can view menu categories"
ON public.menu_categories FOR SELECT
USING (true);

-- Only admins can manage categories
CREATE POLICY "Admins can manage menu categories"
ON public.menu_categories FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Add new columns to menu_items for dietary information and category reference
ALTER TABLE public.menu_items
ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES public.menu_categories(id),
ADD COLUMN IF NOT EXISTS is_vegetarian BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS is_seafood BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS is_kids_friendly BOOLEAN DEFAULT false;