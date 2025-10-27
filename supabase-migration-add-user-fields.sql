-- ========================================
-- SIMPLE MIGRATION: Add user fields only
-- Run this ONCE in Supabase SQL Editor
-- ========================================

-- 1. Add user_email to tracked_brands (if missing)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'tracked_brands' AND column_name = 'user_email'
  ) THEN
    ALTER TABLE tracked_brands ADD COLUMN user_email TEXT;
    RAISE NOTICE '✅ Added user_email to tracked_brands';
  ELSE
    RAISE NOTICE 'ℹ️  user_email already exists in tracked_brands';
  END IF;
END $$;

-- 2. Add user_id to tracked_brands (if missing)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'tracked_brands' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE tracked_brands ADD COLUMN user_id UUID;
    RAISE NOTICE '✅ Added user_id to tracked_brands';
  ELSE
    RAISE NOTICE 'ℹ️  user_id already exists in tracked_brands';
  END IF;
END $$;

-- 3. Add user_email to brand_mentions (if missing)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'brand_mentions' AND column_name = 'user_email'
  ) THEN
    ALTER TABLE brand_mentions ADD COLUMN user_email TEXT;
    RAISE NOTICE '✅ Added user_email to brand_mentions';
  ELSE
    RAISE NOTICE 'ℹ️  user_email already exists in brand_mentions';
  END IF;
END $$;

-- 4. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_tracked_brands_user_email 
  ON tracked_brands(user_email);

CREATE INDEX IF NOT EXISTS idx_brand_mentions_user_email 
  ON brand_mentions(user_email);

-- 5. Enable RLS on tables (if not already enabled)
ALTER TABLE tracked_brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE brand_mentions ENABLE ROW LEVEL SECURITY;

-- 6. Create RLS policies for tracked_brands
DROP POLICY IF EXISTS "Users can view their own trackers" ON tracked_brands;
CREATE POLICY "Users can view their own trackers" ON tracked_brands
  FOR SELECT USING (auth.jwt() ->> 'email' = user_email);

DROP POLICY IF EXISTS "Users can insert their own trackers" ON tracked_brands;
CREATE POLICY "Users can insert their own trackers" ON tracked_brands
  FOR INSERT WITH CHECK (auth.jwt() ->> 'email' = user_email);

DROP POLICY IF EXISTS "Users can update their own trackers" ON tracked_brands;
CREATE POLICY "Users can update their own trackers" ON tracked_brands
  FOR UPDATE USING (auth.jwt() ->> 'email' = user_email);

DROP POLICY IF EXISTS "Users can delete their own trackers" ON tracked_brands;
CREATE POLICY "Users can delete their own trackers" ON tracked_brands
  FOR DELETE USING (auth.jwt() ->> 'email' = user_email);

-- 7. Create RLS policies for brand_mentions
DROP POLICY IF EXISTS "Users can view their own mentions" ON brand_mentions;
CREATE POLICY "Users can view their own mentions" ON brand_mentions
  FOR SELECT USING (auth.jwt() ->> 'email' = user_email);

DROP POLICY IF EXISTS "Users can insert their own mentions" ON brand_mentions;
CREATE POLICY "Users can insert their own mentions" ON brand_mentions
  FOR INSERT WITH CHECK (auth.jwt() ->> 'email' = user_email);

-- ========================================
-- DONE! ✅
-- ========================================
-- You should see messages like:
--   ✅ Added user_email to tracked_brands
--   ✅ Added user_id to tracked_brands
--   ✅ Added user_email to brand_mentions
-- ========================================

SELECT '🎉 Migration complete! Your tables now support multi-tenant data.' AS status;

