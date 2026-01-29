-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create Menu Categories Table
CREATE TABLE IF NOT EXISTS menu_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    icon TEXT,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Menu Items Table
CREATE TABLE IF NOT EXISTS menu_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id UUID REFERENCES menu_categories(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    price NUMERIC NOT NULL,
    image_url TEXT,
    is_vegetarian BOOLEAN DEFAULT FALSE,
    is_seafood BOOLEAN DEFAULT FALSE,
    is_kids_friendly BOOLEAN DEFAULT FALSE,
    is_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create RLS Policies
ALTER TABLE menu_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;

-- Allow read access to everyone
CREATE POLICY "Public categories are viewable by everyone" 
ON menu_categories FOR SELECT USING (true);

CREATE POLICY "Public items are viewable by everyone" 
ON menu_items FOR SELECT USING (true);

-- Allow write access only to admins (assuming exists logic or profile check)
-- For simplicity in this script, we'll allow authenticated users with role 'admin'
-- Note: This relies on your existing auth setup. Adjust as needed.

CREATE POLICY "Admins can insert categories" 
ON menu_categories FOR INSERT 
WITH CHECK (
  auth.uid() IN (
    SELECT id FROM profiles WHERE role = 'admin'
  )
);

CREATE POLICY "Admins can update categories" 
ON menu_categories FOR UPDATE 
USING (
  auth.uid() IN (
    SELECT id FROM profiles WHERE role = 'admin'
  )
);

CREATE POLICY "Admins can delete categories" 
ON menu_categories FOR DELETE 
USING (
  auth.uid() IN (
    SELECT id FROM profiles WHERE role = 'admin'
  )
);

CREATE POLICY "Admins can insert items" 
ON menu_items FOR INSERT 
WITH CHECK (
  auth.uid() IN (
    SELECT id FROM profiles WHERE role = 'admin'
  )
);

CREATE POLICY "Admins can update items" 
ON menu_items FOR UPDATE 
USING (
  auth.uid() IN (
    SELECT id FROM profiles WHERE role = 'admin'
  )
);

CREATE POLICY "Admins can delete items" 
ON menu_items FOR DELETE 
USING (
  auth.uid() IN (
    SELECT id FROM profiles WHERE role = 'admin'
  )
);
