-- Create extracted_contacts table for storing contact information from source URLs
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS extracted_contacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_email TEXT NOT NULL,
  
  -- Source information
  source_url TEXT NOT NULL,
  domain TEXT NOT NULL,
  mention_id BIGINT REFERENCES brand_mentions(id) ON DELETE SET NULL,
  brand TEXT,
  query TEXT,
  
  -- Contact information
  email TEXT,
  phone TEXT,
  linkedin_url TEXT,
  twitter_url TEXT,
  facebook_url TEXT,
  instagram_url TEXT,
  author_name TEXT,
  company_name TEXT,
  contact_page_url TEXT,
  
  -- Metadata
  extraction_method TEXT, -- 'direct', 'contact_page', 'author_page'
  confidence_score INTEGER DEFAULT 50, -- 0-100 (how likely this is a real contact)
  extracted_at TIMESTAMP DEFAULT NOW()
);

-- Ensure any prior version of the index is replaced with a compatible one
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE schemaname = 'public' AND indexname = 'unique_contact_idx'
  ) THEN
    DROP INDEX IF EXISTS unique_contact_idx;
  END IF;
END $$;

-- Create a standard unique index usable by PostgREST upsert
-- Note: rows with both email and phone NULL will not conflict (acceptable)
CREATE UNIQUE INDEX IF NOT EXISTS unique_contact_idx ON extracted_contacts(
  user_email,
  source_url,
  email,
  phone
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_contacts_user_email ON extracted_contacts(user_email);
CREATE INDEX IF NOT EXISTS idx_contacts_domain ON extracted_contacts(domain);
CREATE INDEX IF NOT EXISTS idx_contacts_brand ON extracted_contacts(brand);
CREATE INDEX IF NOT EXISTS idx_contacts_mention_id ON extracted_contacts(mention_id);
CREATE INDEX IF NOT EXISTS idx_contacts_extracted_at ON extracted_contacts(extracted_at DESC);

-- RLS Policies
ALTER TABLE extracted_contacts ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own contacts
CREATE POLICY "Users can view their own contacts"
  ON extracted_contacts
  FOR SELECT
  USING (auth.jwt() ->> 'email' = user_email);

-- Policy: Users can insert their own contacts
CREATE POLICY "Users can insert their own contacts"
  ON extracted_contacts
  FOR INSERT
  WITH CHECK (auth.jwt() ->> 'email' = user_email);

-- Policy: Users can update their own contacts
CREATE POLICY "Users can update their own contacts"
  ON extracted_contacts
  FOR UPDATE
  USING (auth.jwt() ->> 'email' = user_email)
  WITH CHECK (auth.jwt() ->> 'email' = user_email);

-- Policy: Users can delete their own contacts
CREATE POLICY "Users can delete their own contacts"
  ON extracted_contacts
  FOR DELETE
  USING (auth.jwt() ->> 'email' = user_email);

SELECT '✅ extracted_contacts table created successfully!' AS status;

