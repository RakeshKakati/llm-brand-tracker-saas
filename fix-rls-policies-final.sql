-- FINAL FIX: Drop all policies first, then recreate
-- Run this step by step if needed

-- STEP 1: Check what policies exist
SELECT tablename, policyname FROM pg_policies 
WHERE tablename IN ('tracked_brands', 'brand_mentions')
ORDER BY tablename, policyname;

-- STEP 2: Manually drop the policy that's causing issues
-- (Run this line based on what you see in STEP 1)
DROP POLICY "Users can view tracked brands" ON tracked_brands;

-- STEP 3: Now run the rest
DROP POLICY IF EXISTS "Users can view team tracked brands" ON tracked_brands;
DROP POLICY IF EXISTS "Users can view their own tracked brands" ON tracked_brands;
DROP POLICY IF EXISTS "Users can insert tracked brands" ON tracked_brands;
DROP POLICY IF EXISTS "Users can insert their own tracked brands" ON tracked_brands;
DROP POLICY IF EXISTS "Users can update tracked brands" ON tracked_brands;
DROP POLICY IF EXISTS "Users can update their own tracked brands" ON tracked_brands;
DROP POLICY IF EXISTS "Users can delete tracked brands" ON tracked_brands;
DROP POLICY IF EXISTS "Users can delete their own tracked brands" ON tracked_brands;
DROP POLICY IF EXISTS "Users can view own tracked brands" ON tracked_brands;
DROP POLICY IF EXISTS "Users can insert own tracked brands" ON tracked_brands;
DROP POLICY IF EXISTS "Users can update own tracked brands" ON tracked_brands;
DROP POLICY IF EXISTS "Users can delete own tracked brands" ON tracked_brands;

-- Brand mentions
DROP POLICY IF EXISTS "Users can view brand mentions" ON brand_mentions;
DROP POLICY IF EXISTS "Users can view team mentions" ON brand_mentions;
DROP POLICY IF EXISTS "Users can view their own mentions" ON brand_mentions;
DROP POLICY IF EXISTS "Users can insert brand mentions" ON brand_mentions;
DROP POLICY IF EXISTS "Users can insert their own mentions" ON brand_mentions;
DROP POLICY IF EXISTS "Users can view own brand mentions" ON brand_mentions;
DROP POLICY IF EXISTS "Users can insert own brand mentions" ON brand_mentions;

-- STEP 4: Create all policies fresh
CREATE POLICY "Users can view tracked brands" ON tracked_brands
  FOR SELECT USING (user_email = auth.jwt() ->> 'email');

CREATE POLICY "Users can insert tracked brands" ON tracked_brands
  FOR INSERT WITH CHECK (user_email = auth.jwt() ->> 'email');

CREATE POLICY "Users can update tracked brands" ON tracked_brands
  FOR UPDATE USING (user_email = auth.jwt() ->> 'email');

CREATE POLICY "Users can delete tracked brands" ON tracked_brands
  FOR DELETE USING (user_email = auth.jwt() ->> 'email');

CREATE POLICY "Users can view brand mentions" ON brand_mentions
  FOR SELECT USING (user_email = auth.jwt() ->> 'email');

CREATE POLICY "Users can insert brand mentions" ON brand_mentions
  FOR INSERT WITH CHECK (user_email = auth.jwt() ->> 'email');

SELECT '✅ All policies recreated!' AS status;

