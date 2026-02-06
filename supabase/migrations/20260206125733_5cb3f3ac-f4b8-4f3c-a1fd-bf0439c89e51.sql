-- =====================================================
-- Complete Database Schema for Fortaleza de Sabores
-- =====================================================

-- 1. Create role enum for user management
CREATE TYPE public.app_role AS ENUM ('admin', 'waiter', 'chef');

-- 2. Create user_roles table (security best practice - separate from profiles)
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (user_id, role)
);

-- 3. Create customer_sessions table for order tracking
CREATE TABLE public.customer_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_name TEXT,
    phone_number TEXT,
    table_id TEXT,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Create orders table
CREATE TABLE public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number INTEGER NOT NULL,
    items JSONB NOT NULL DEFAULT '[]'::jsonb,
    total_price DECIMAL(10,2) NOT NULL DEFAULT 0,
    customer_name TEXT,
    customer_table TEXT,
    customer_notes TEXT,
    customer_session_id UUID REFERENCES public.customer_sessions(id),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('draft', 'pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled')),
    sent_to_admin BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Create profiles table for user information
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Create menu_items table
CREATE TABLE public.menu_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    category TEXT NOT NULL,
    image_url TEXT,
    available BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- Enable Row Level Security on all tables
-- =====================================================
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- Security Definer Functions (prevent RLS recursion)
-- =====================================================

-- Check if user has a specific role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.user_roles
        WHERE user_id = _user_id
        AND role = _role
    )
$$;

-- Get user's primary role
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id UUID)
RETURNS app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT role
    FROM public.user_roles
    WHERE user_id = _user_id
    LIMIT 1
$$;

-- Helper functions for common role checks
CREATE OR REPLACE FUNCTION public.is_admin() 
RETURNS BOOLEAN AS $$
BEGIN
    RETURN public.has_role(auth.uid(), 'admin');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.is_waiter() 
RETURNS BOOLEAN AS $$
BEGIN
    RETURN public.has_role(auth.uid(), 'waiter');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.is_chef() 
RETURNS BOOLEAN AS $$
BEGIN
    RETURN public.has_role(auth.uid(), 'chef');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.is_staff()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN public.has_role(auth.uid(), 'admin') 
        OR public.has_role(auth.uid(), 'waiter') 
        OR public.has_role(auth.uid(), 'chef');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- =====================================================
-- RLS Policies for user_roles
-- =====================================================
CREATE POLICY "Users can view own roles" ON public.user_roles
FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles" ON public.user_roles
FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage roles" ON public.user_roles
FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- =====================================================
-- RLS Policies for customer_sessions
-- =====================================================
CREATE POLICY "Anyone can create customer sessions" ON public.customer_sessions
FOR INSERT TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Anyone can view customer sessions" ON public.customer_sessions
FOR SELECT TO anon, authenticated
USING (true);

CREATE POLICY "Anyone can update customer sessions" ON public.customer_sessions
FOR UPDATE TO anon, authenticated
USING (true);

-- =====================================================
-- RLS Policies for orders
-- =====================================================
CREATE POLICY "Anyone can create orders" ON public.orders
FOR INSERT TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Anyone can view orders" ON public.orders
FOR SELECT TO anon, authenticated
USING (true);

CREATE POLICY "Staff can update orders" ON public.orders
FOR UPDATE TO authenticated
USING (public.is_staff());

CREATE POLICY "Admins can delete orders" ON public.orders
FOR DELETE TO authenticated
USING (public.is_admin());

-- =====================================================
-- RLS Policies for profiles
-- =====================================================
CREATE POLICY "Users can view own profile" ON public.profiles
FOR SELECT TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON public.profiles
FOR SELECT TO authenticated
USING (public.is_admin());

CREATE POLICY "Users can update own profile" ON public.profiles
FOR UPDATE TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = id);

-- =====================================================
-- RLS Policies for menu_items
-- =====================================================
CREATE POLICY "Anyone can view menu items" ON public.menu_items
FOR SELECT TO anon, authenticated
USING (true);

CREATE POLICY "Admins can manage menu items" ON public.menu_items
FOR ALL TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- =====================================================
-- Indexes for performance
-- =====================================================
CREATE INDEX idx_orders_status ON public.orders(status);
CREATE INDEX idx_orders_created_at ON public.orders(created_at DESC);
CREATE INDEX idx_orders_session ON public.orders(customer_session_id);
CREATE INDEX idx_orders_order_number ON public.orders(order_number);
CREATE INDEX idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX idx_menu_items_category ON public.menu_items(category);
CREATE INDEX idx_menu_items_available ON public.menu_items(available);

-- =====================================================
-- Triggers for updated_at timestamps
-- =====================================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_orders_updated_at
    BEFORE UPDATE ON public.orders
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_customer_sessions_updated_at
    BEFORE UPDATE ON public.customer_sessions
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_menu_items_updated_at
    BEFORE UPDATE ON public.menu_items
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- Order number sequence function
-- =====================================================
CREATE OR REPLACE FUNCTION public.get_next_order_number()
RETURNS INTEGER AS $$
DECLARE
    next_number INTEGER;
BEGIN
    SELECT COALESCE(MAX(order_number), 0) + 1 INTO next_number FROM public.orders;
    RETURN next_number;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- Enable Realtime for orders table
-- =====================================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;