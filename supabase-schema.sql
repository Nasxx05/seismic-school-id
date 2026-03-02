-- Seismic School ID — Supabase Database Schema
-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor → New Query)

-- 1. Create the users table
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL CHECK (char_length(name) >= 1 AND char_length(name) <= 100),
  magnitude TEXT NOT NULL CHECK (magnitude IN ('1','2','3','4','5','6','7','8','9','admin')),
  photo TEXT NOT NULL,
  signature TEXT NOT NULL CHECK (char_length(signature) <= 200000),
  registered_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 3. Allow anyone to read all users (directory is public)
CREATE POLICY "Allow public read" ON users
  FOR SELECT USING (true);

-- 4. Allow anyone to insert new users (rate-limited to 1 per 30 seconds per global)
CREATE POLICY "Allow public insert" ON users
  FOR INSERT WITH CHECK (
    NOT EXISTS (
      SELECT 1 FROM users
      WHERE registered_at > NOW() - INTERVAL '30 seconds'
    )
  );
