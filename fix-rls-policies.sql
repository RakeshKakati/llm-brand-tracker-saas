-- URGENT FIX: Restore all RLS policies for tracked_brands and brand_mentions
-- This fixes the issue where data appears "gone" due to missing RLS policies
-- Run this immediately in Supabase SQL Editor

-- ========================================
-- FIX: tracked_brands RLS Policies
-- ========================================

-- Drop ALL existing policies to start fresh
DROP POLICY IF EXISTS "Users can view team tracked brands" ON tracked_brands;
DROP POLICY IF EXISTS "Users can view their own tracked brands" ON tracked_brands;
DROP POLICY IF EXISTS "Users can insert their own tracked brands" ON tracked_brands;
DROP POLICY IF EXISTS "Users can update their own tracked brands" ON tracked_brands;
DROP POLICY IF EXISTS "Users can delete their own tracked brands" ON tracked_brands;
DROP POLICY IF EXISTS "Users can view own tracked brands" ON tracked_brands;
DROP POLICY IF EXISTS "Users can insert own tracked brands" ON tracked_brands;
DROP POLICY IF EXISTS "Users can update own tracked brands" ON tracked_brands;
DROP POLICY IF EXISTS "Users can delete own tracked brands" ON tracked_brands;

-- SELECT: Users can see their own trackers OR team trackers
CREATE POLICY "Users can view tracked brands" ON tracked_brands
  FOR SELECT
  USING (
    user_email = auth.jwt() ->> 'email'
    OR team_id IN (
      SELECT team_id FROM team_members 
      WHERE user_email = auth.jwt() ->> 'email' 
      AND status = 'active'
    )
  );

-- INSERT: Users can only insert their own trackers (or assign to team if they're a member)
CREATE POLICY "Users can insert tracked brands" ON tracked_brands
  FOR INSERT
  WITH CHECK (
    user_email = auth.jwt() ->> 'email'
    AND (
      team_id IS NULL 
      OR team_id IN (
        SELECT team_id FROM team_members 
        WHERE user_email = auth.jwt() ->> 'email' 
        AND status = 'active'
      )
      OR team_id IN (
        SELECT id FROM teams 
        WHERE owner_email = auth.jwt() ->> 'email'
      )
    )
  );

-- UPDATE: Users can update their own trackers OR team trackers (if they have permission)
CREATE POLICY "Users can update tracked brands" ON tracked_brands
  FOR UPDATE
  USING (
    user_email = auth.jwt() ->> 'email'
    OR (
      team_id IN (
        SELECT team_id FROM team_members
        WHERE user_email = auth.jwt() ->> 'email' 
        AND role IN ('admin', 'member')
        AND status = 'active'
      )
    )
  );

-- DELETE: Users can delete their own trackers OR team trackers (if admin)
CREATE POLICY "Users can delete tracked brands" ON tracked_brands
  FOR DELETE
  USING (
    user_email = auth.jwt() ->> 'email'
    OR (
      team_id IN (
        SELECT team_id FROM team_members 
        WHERE user_email = auth.jwt() ->> 'email' 
        AND role = 'admin'
        AND status = 'active'
      )
    )
    OR team_id IN (
      SELECT id FROM teams 
      WHERE owner_email = auth.jwt() ->> 'email'
    )
  );

-- ========================================
-- FIX: brand_mentions RLS Policies
-- ========================================

-- Drop ALL existing policies to start fresh
DROP POLICY IF EXISTS "Users can view team mentions" ON brand_mentions;
DROP POLICY IF EXISTS "Users can view their own mentions" ON brand_mentions;
DROP POLICY IF EXISTS "Users can insert their own mentions" ON brand_mentions;
DROP POLICY IF EXISTS "Users can view own brand mentions" ON brand_mentions;
DROP POLICY IF EXISTS "Users can insert own brand mentions" ON brand_mentions;

-- SELECT: Users can see their own mentions OR team mentions
CREATE POLICY "Users can view brand mentions" ON brand_mentions
  FOR SELECT
  USING (
    user_email = auth.jwt() ->> 'email'
    OR team_id IN (
      SELECT team_id FROM team_members 
      WHERE user_email = auth.jwt() ->> 'email' 
      AND status = 'active'
    )
  );

-- INSERT: Users can only insert their own mentions (system creates these)
CREATE POLICY "Users can insert brand mentions" ON brand_mentions
  FOR INSERT
  WITH CHECK (
    user_email = auth.jwt() ->> 'email'
    AND (
      team_id IS NULL 
      OR team_id IN (
        SELECT team_id FROM team_members 
        WHERE user_email = auth.jwt() ->> 'email' 
        AND status = 'active'
      )
      OR team_id IN (
        SELECT id FROM teams 
        WHERE owner_email = auth.jwt() ->> 'email'
      )
    )
  );

-- ========================================
-- VERIFICATION
-- ========================================

-- Check that policies exist
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  cmd 
FROM pg_policies 
WHERE tablename IN ('tracked_brands', 'brand_mentions')
ORDER BY tablename, policyname;

SELECT '✅ RLS policies restored! Your data should now be visible.' AS status;
