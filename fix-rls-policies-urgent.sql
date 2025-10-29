-- URGENT FIX: Restore RLS policies - Safe version (works even if teams table doesn't exist)
-- Run this IMMEDIATELY in Supabase SQL Editor to restore access to your data

-- ========================================
-- STEP 1: Fix tracked_brands RLS Policies
-- ========================================

-- Drop ALL existing policies (try all possible names)
DO $$ 
BEGIN
  -- Drop all tracked_brands policies
  DROP POLICY IF EXISTS "Users can view team tracked brands" ON tracked_brands;
  DROP POLICY IF EXISTS "Users can view tracked brands" ON tracked_brands;
  DROP POLICY IF EXISTS "Users can view their own tracked brands" ON tracked_brands;
  DROP POLICY IF EXISTS "Users can insert their own tracked brands" ON tracked_brands;
  DROP POLICY IF EXISTS "Users can update their own tracked brands" ON tracked_brands;
  DROP POLICY IF EXISTS "Users can delete their own tracked brands" ON tracked_brands;
  DROP POLICY IF EXISTS "Users can view own tracked brands" ON tracked_brands;
  DROP POLICY IF EXISTS "Users can insert own tracked brands" ON tracked_brands;
  DROP POLICY IF EXISTS "Users can update own tracked brands" ON tracked_brands;
  DROP POLICY IF EXISTS "Users can delete own tracked brands" ON tracked_brands;
  
  -- Drop all brand_mentions policies
  DROP POLICY IF EXISTS "Users can view team mentions" ON brand_mentions;
  DROP POLICY IF EXISTS "Users can view brand mentions" ON brand_mentions;
  DROP POLICY IF EXISTS "Users can view their own mentions" ON brand_mentions;
  DROP POLICY IF EXISTS "Users can insert their own mentions" ON brand_mentions;
  DROP POLICY IF EXISTS "Users can view own brand mentions" ON brand_mentions;
  DROP POLICY IF EXISTS "Users can insert own brand mentions" ON brand_mentions;
END $$;

-- SELECT: Users can see their own trackers (essential for data visibility)
CREATE POLICY "Users can view tracked brands" ON tracked_brands
  FOR SELECT
  USING (user_email = auth.jwt() ->> 'email');

-- INSERT: Users can insert their own trackers
CREATE POLICY "Users can insert tracked brands" ON tracked_brands
  FOR INSERT
  WITH CHECK (user_email = auth.jwt() ->> 'email');

-- UPDATE: Users can update their own trackers
CREATE POLICY "Users can update tracked brands" ON tracked_brands
  FOR UPDATE
  USING (user_email = auth.jwt() ->> 'email');

-- DELETE: Users can delete their own trackers
CREATE POLICY "Users can delete tracked brands" ON tracked_brands
  FOR DELETE
  USING (user_email = auth.jwt() ->> 'email');

-- ========================================
-- STEP 2: Fix brand_mentions RLS Policies
-- ========================================
-- (Policies already dropped in STEP 1)

-- SELECT: Users can see their own mentions (essential for data visibility)
CREATE POLICY "Users can view brand mentions" ON brand_mentions
  FOR SELECT
  USING (user_email = auth.jwt() ->> 'email');

-- INSERT: Users can insert their own mentions
CREATE POLICY "Users can insert brand mentions" ON brand_mentions
  FOR INSERT
  WITH CHECK (user_email = auth.jwt() ->> 'email');

-- ========================================
-- VERIFICATION
-- ========================================

SELECT '✅ URGENT FIX COMPLETE!' AS status;
SELECT 'Your data should now be visible. Refresh your dashboard.' AS message;

-- List all policies to verify
SELECT 
  tablename, 
  policyname, 
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename IN ('tracked_brands', 'brand_mentions')
ORDER BY tablename, policyname;

