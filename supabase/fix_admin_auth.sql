-- Fix admin auth_user_id linkage
-- Run this in Supabase SQL Editor

-- First, check current admin and auth user
SELECT id, email, auth_user_id FROM admins WHERE email = 'admin@acme.com';
SELECT id, email FROM auth.users WHERE email = 'admin@acme.com';

-- Update admin record with correct auth_user_id
UPDATE admins 
SET auth_user_id = (SELECT id FROM auth.users WHERE email = 'admin@acme.com')
WHERE email = 'admin@acme.com';

-- Verify the update
SELECT a.id, a.email, a.auth_user_id, au.id as auth_id
FROM admins a
LEFT JOIN auth.users au ON a.auth_user_id = au.id
WHERE a.email = 'admin@acme.com';
