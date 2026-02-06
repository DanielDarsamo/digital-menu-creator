-- 000_master_schema.sql
-- COMPLETE PROJECT SCHEMA
-- Run this script in the Supabase SQL Editor to set up the entire database.

-- 1. EXTENSIONS & CLEANUP
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing objects to ensure clean state
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS public.is_admin();
DROP FUNCTION IF EXISTS public.is_staff();
DROP FUNCTION IF EXISTS get_next_order_number();

DROP TABLE IF EXISTS public.orders CASCADE;
DROP TABLE IF EXISTS public.customer_sessions CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

DROP TYPE IF EXISTS public.order_status;
DROP TYPE IF EXISTS public.user_role;
DROP TYPE IF EXISTS public.session_status;

-- 2. ENUMS
CREATE TYPE public.user_role AS ENUM ('admin', 'waiter', 'chef');
CREATE TYPE public.order_status AS ENUM ('pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled');
CREATE TYPE public.session_status AS ENUM ('active', 'closed');

-- 3. TABLES

-- Profiles (Staff & Users)
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    first_name TEXT DEFAULT '',
    last_name TEXT DEFAULT '',
    phone TEXT,
    role user_role DEFAULT 'waiter',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Customer Sessions (Cart Persistence)
CREATE TABLE public.customer_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_name TEXT,
    phone_number TEXT,
    table_id TEXT NOT NULL,
    status session_status DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Orders
CREATE TABLE public.orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number SERIAL,
    customer_session_id UUID REFERENCES public.customer_sessions(id) ON DELETE SET NULL,
    
    -- Snapshot of customer info
    customer_name TEXT,
    customer_email TEXT,
    customer_phone TEXT,
    customer_table TEXT,
    customer_notes TEXT,
    
    -- Order Content
    items JSONB NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    status order_status DEFAULT 'pending',
    payment_type TEXT CHECK (payment_type IN ('cash', 'card', 'mobile')),
    
    -- Tracking
    sent_to_admin BOOLEAN DEFAULT false,
    rejection_reason TEXT,
    
    -- Staff Actions
    accepted_by UUID REFERENCES auth.users(id),
    accepted_by_role user_role,
    accepted_by_name TEXT,
    accepted_at TIMESTAMP WITH TIME ZONE,
    
    delivered_at TIMESTAMP WITH TIME ZONE,
    
    last_updated_by_role user_role,
    last_updated_by_name TEXT,
    
    status_history JSONB DEFAULT '[]'::jsonb,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. FUNCTIONS & TRIGGERS

-- Helper: Check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin() 
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper: Check if user is staff
CREATE OR REPLACE FUNCTION public.is_staff() 
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'waiter', 'chef'));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: Handle new user creation (Fixes potential NULL role issues)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, first_name, last_name, role, is_active, phone)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'first_name', 'New'),
    COALESCE(new.raw_user_meta_data->>'last_name', 'User'),
    'waiter'::user_role, -- Safety default (Admin promotion is separate)
    TRUE,
    new.raw_user_meta_data->>'phone'
  )
  ON CONFLICT (id) DO UPDATE
  SET
    email = EXCLUDED.email,
    updated_at = NOW();
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Function: Get Next Order Number (Safe RPC)
CREATE OR REPLACE FUNCTION get_next_order_number()
RETURNS INTEGER AS $$
BEGIN
    RETURN nextval('orders_order_number_seq');
END;
$$ LANGUAGE plpgsql;

-- 5. RLS POLICIES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Public profiles view own" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Admins view all profiles" ON public.profiles FOR SELECT USING (public.is_admin());
CREATE POLICY "Admins update all profiles" ON public.profiles FOR UPDATE USING (public.is_admin());
CREATE POLICY "Admins delete profiles" ON public.profiles FOR DELETE USING (public.is_admin());

-- Sessions Policies
CREATE POLICY "Public create sessions" ON public.customer_sessions FOR INSERT WITH CHECK (true);
CREATE POLICY "Public view sessions" ON public.customer_sessions FOR SELECT USING (true);
CREATE POLICY "Public update sessions" ON public.customer_sessions FOR UPDATE USING (true);

-- Orders Policies
CREATE POLICY "Public create orders" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Staff view all orders" ON public.orders FOR SELECT USING (public.is_staff());
CREATE POLICY "Owner view orders" ON public.orders FOR SELECT USING (true); -- Simplified to allow session-based fetching
CREATE POLICY "Staff update orders" ON public.orders FOR UPDATE USING (public.is_staff());
CREATE POLICY "Admins delete orders" ON public.orders FOR DELETE USING (public.is_admin());

-- 6. SEED ADMIN USER
-- Manually creates an admin user if it doesn't exist
-- Credentials: admin@fortaleza.com / fortaleza2024

DO $$
DECLARE
  new_id uuid := gen_random_uuid();
  user_email text := 'admin@fortaleza.com';
  user_password text := 'fortaleza2024';
BEGIN
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = user_email) THEN
    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password, 
      email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
      created_at, updated_at
    ) VALUES (
      '00000000-0000-0000-0000-000000000000', new_id, 'authenticated', 'authenticated', user_email, 
      crypt(user_password, gen_salt('bf')), 
      now(), 
      '{"provider":"email","providers":["email"]}', '{"first_name": "System", "last_name": "Admin"}',
      now(), now()
    );
  END IF;
END $$;

-- 7. PROMOTE ADMIN
-- Ensures the user is definitely an admin
UPDATE public.profiles 
SET role = 'admin', is_active = true, first_name = 'System', last_name = 'Admin'
WHERE email = 'admin@fortaleza.com';
