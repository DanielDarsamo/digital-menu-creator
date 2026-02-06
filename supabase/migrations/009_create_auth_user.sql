-- 009_create_auth_user.sql
-- Run this in Supabase SQL Editor to create a new user manually.
-- NOTE: You must have the 'pgcrypto' extension enabled (usually is by default).

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Function to create user if not exists
DO $$
DECLARE
  new_id uuid := gen_random_uuid();
  -- EDIT THESE VALUES:
  user_email text := 'admin@fortaleza.com'; 
  user_password text := 'fortaleza2024';
BEGIN
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = user_email) THEN
    -- Insert into auth.users
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      recovery_sent_at,
      last_sign_in_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      confirmation_token,
      email_change,
      email_change_token_new,
      recovery_token
    ) VALUES (
      '00000000-0000-0000-0000-000000000000', -- standard instance_id
      new_id,
      'authenticated',
      'authenticated',
      user_email,
      crypt(user_password, gen_salt('bf')), -- Hash the password
      now(), -- Auto-confirm email
      now(),
      now(),
      '{"provider":"email","providers":["email"]}',
      '{}',
      now(),
      now(),
      '',
      '',
      '',
      ''
    );
    
    -- Insert into profiles (your app's table) - Trigger might handle this but doing it explicit safely
    INSERT INTO public.profiles (id, email, role, is_active, first_name, last_name)
    VALUES (
        new_id, 
        user_email, 
        'admin', -- Default to admin for this script
        true, 
        'System', 
        'Admin'
    )
    ON CONFLICT (id) DO NOTHING;
    
    RAISE NOTICE 'User created: % (Password: %)', user_email, user_password;
  ELSE
    RAISE NOTICE 'User already exists: %', user_email;
  END IF;
END $$;
