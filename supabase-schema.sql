-- Seismic School ID — Supabase Database Schema
-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor → New Query)

-- 1. Create the users table
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  magnitude INTEGER NOT NULL CHECK (magnitude >= 1 AND magnitude <= 9),
  photo TEXT NOT NULL,
  signature TEXT NOT NULL,
  registered_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 3. Allow anyone to read all users (directory is public)
CREATE POLICY "Allow public read" ON users
  FOR SELECT USING (true);

-- 4. Allow anyone to insert new users (registration is open)
CREATE POLICY "Allow public insert" ON users
  FOR INSERT WITH CHECK (true);
