-- Create ebook_downloads table for storing email addresses of users who download the ebook
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS ebook_downloads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  downloaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for email lookups
CREATE INDEX IF NOT EXISTS idx_ebook_downloads_email ON ebook_downloads(email);
CREATE INDEX IF NOT EXISTS idx_ebook_downloads_downloaded_at ON ebook_downloads(downloaded_at DESC);

-- No RLS needed since this is public data collection (lead generation)
-- We want to allow inserts from anyone

