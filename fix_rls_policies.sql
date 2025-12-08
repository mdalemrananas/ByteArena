-- Fix RLS policies to allow Firebase-authenticated users to insert data
-- Run this in your Supabase SQL Editor

-- First, let's check what policies exist
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'users';

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Users can insert own profile" ON users;

-- Create new policies that work with Firebase authentication
-- 1. Allow users to view their own data
CREATE POLICY "Users can view own profile" ON users
FOR SELECT USING (auth.uid()::text = firebase_uid);

-- 2. Allow users to update their own data
CREATE POLICY "Users can update own profile" ON users
FOR UPDATE USING (auth.uid()::text = firebase_uid);

-- 3. Allow users to insert their own data (for new registrations)
CREATE POLICY "Users can insert own profile" ON users
FOR INSERT WITH CHECK (auth.uid()::text = firebase_uid);

-- 4. Allow service role to bypass RLS (for admin operations)
CREATE POLICY "Service role can manage all users" ON users
FOR ALL USING (role() = 'service_role');

-- Grant proper permissions
GRANT ALL ON users TO authenticated;
GRANT ALL ON users TO service_role;

-- Verify the policies are set correctly
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'users';
