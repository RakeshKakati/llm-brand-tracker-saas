-- Add position column to brand_mentions table
-- Run this in Supabase SQL Editor

-- Add position column as INTEGER (position/rank: 1, 2, 3, etc.)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'brand_mentions' AND column_name = 'position'
  ) THEN
    ALTER TABLE brand_mentions ADD COLUMN position INTEGER;
    RAISE NOTICE '✅ Added position to brand_mentions';
  ELSE
    RAISE NOTICE 'ℹ️  position already exists in brand_mentions';
  END IF;
END $$;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_brand_mentions_position ON brand_mentions(position) WHERE position IS NOT NULL;

SELECT '✅ position column added successfully!' AS status;

