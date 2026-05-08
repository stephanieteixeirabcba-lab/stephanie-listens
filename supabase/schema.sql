-- ============================================
-- STEPHANIE LISTENS — SUPABASE SCHEMA
-- Run this in your Supabase SQL Editor
-- ============================================

-- Create subscribers table
CREATE TABLE IF NOT EXISTS subscribers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  first_name TEXT,
  source TEXT DEFAULT 'website',
  subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  unsubscribed_at TIMESTAMP WITH TIME ZONE,
  tags TEXT[] DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster email lookups
CREATE INDEX IF NOT EXISTS idx_subscribers_email ON subscribers(email);
CREATE INDEX IF NOT EXISTS idx_subscribers_subscribed_at ON subscribers(subscribed_at DESC);
CREATE INDEX IF NOT EXISTS idx_subscribers_tags ON subscribers USING GIN(tags);

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_subscribers_updated_at ON subscribers;
CREATE TRIGGER update_subscribers_updated_at
  BEFORE UPDATE ON subscribers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS
ALTER TABLE subscribers ENABLE ROW LEVEL SECURITY;

-- Allow anonymous users to INSERT (for signup form)
CREATE POLICY "Allow public signup"
  ON subscribers
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Only authenticated users (you) can SELECT
CREATE POLICY "Allow authenticated read"
  ON subscribers
  FOR SELECT
  TO authenticated
  USING (true);

-- Only authenticated users (you) can UPDATE
CREATE POLICY "Allow authenticated update"
  ON subscribers
  FOR UPDATE
  TO authenticated
  USING (true);

-- Only authenticated users (you) can DELETE
CREATE POLICY "Allow authenticated delete"
  ON subscribers
  FOR DELETE
  TO authenticated
  USING (true);

-- ============================================
-- USEFUL QUERIES (for your reference)
-- ============================================

-- Count total subscribers
-- SELECT COUNT(*) FROM subscribers WHERE unsubscribed_at IS NULL;

-- Get all active subscribers
-- SELECT * FROM subscribers
-- WHERE unsubscribed_at IS NULL
-- ORDER BY subscribed_at DESC;

-- Get subscribers from this month
-- SELECT * FROM subscribers
-- WHERE subscribed_at >= date_trunc('month', NOW())
-- ORDER BY subscribed_at DESC;

-- Get subscribers by tag
-- SELECT * FROM subscribers
-- WHERE 'lead-magnet' = ANY(tags);

-- Unsubscribe someone
-- UPDATE subscribers
-- SET unsubscribed_at = NOW()
-- WHERE email = 'example@email.com';
