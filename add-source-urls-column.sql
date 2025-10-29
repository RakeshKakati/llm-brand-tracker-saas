-- Add source_urls column to brand_mentions table
-- Run this in Supabase SQL Editor

-- Add source_urls column as TEXT array
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'brand_mentions' AND column_name = 'source_urls'
  ) THEN
    ALTER TABLE brand_mentions ADD COLUMN source_urls TEXT[];
    RAISE NOTICE '✅ Added source_urls to brand_mentions';
  ELSE
    RAISE NOTICE 'ℹ️  source_urls already exists in brand_mentions';
  END IF;
END $$;

SELECT '✅ source_urls column added successfully!' AS status;



