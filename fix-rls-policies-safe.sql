-- URGENT FIX: Restore RLS policies - Handles existing policies safely
-- This version will work even if policies already exist
-- Run this in Supabase SQL Editor

-- ========================================
-- STEP 1: Drop and recreate tracked_brands policies
-- ========================================

-- Drop policies safely (handles errors if they don't exist)
DO $$ 
BEGIN
  -- Drop tracked_brands policies
  BEGIN
    DROP POLICY "Users can view tracked brands" ON tracked_brands;
  EXCEPTION WHEN undefined_object THEN NULL;
  END;
  
  BEGIN
    DROP POLICY "Users can view team tracked brands" ON tracked_brands;
  EXCEPTION WHEN undefined_object THEN NULL;
  END;
  
  BEGIN
    DROP POLICY "Users can view their own tracked brands" ON tracked_brands;
  EXCEPTION WHEN undefined_object THEN NULL;
  END;
  
  BEGIN
    DROP POLICY "Users can insert tracked brands" ON tracked_brands;
  EXCEPTION WHEN undefined_object THEN NULL;
  END;
  
  BEGIN
    DROP POLICY "Users can insert their own tracked brands" ON tracked_brands;
  EXCEPTION WHEN undefined_object THEN NULL;
  END;
  
  BEGIN
    DROP POLICY "Users can update tracked brands" ON tracked_brands;
  EXCEPTION WHEN undefined_object THEN NULL;
  END;
  
  BEGIN
    DROP POLICY "Users can update their own tracked brands" ON tracked_brands;
  EXCEPTION WHEN undefined_object THEN NULL;
  END;
  
  BEGIN
    DROP POLICY "Users can delete tracked brands" ON tracked_brands;
  EXCEPTION WHEN undefined_object THEN NULL;
  END;
  
  BEGIN
    DROP POLICY "Users can delete their own tracked brands" ON tracked_brands;
  EXCEPTION WHEN undefined_object THEN NULL;
  END;
  
  BEGIN
    DROP POLICY "Users can view own tracked brands" ON tracked_brands;
  EXCEPTION WHEN undefined_object THEN NULL;
  END;
  
  BEGIN
    DROP POLICY "Users can insert own tracked brands" ON tracked_brands;
  EXCEPTION WHEN undefined_object THEN NULL;
  END;
  
  BEGIN
    DROP POLICY "Users can update own tracked brands" ON tracked_brands;
  EXCEPTION WHEN undefined_object THEN NULL;
  END;
  
  BEGIN
    DROP POLICY "Users can delete own tracked brands" ON tracked_brands;
  EXCEPTION WHEN undefined_object THEN NULL;
  END;
END $$;

-- Create policies for tracked_brands
CREATE POLICY "Users can view tracked brands" ON tracked_brands
  FOR SELECT
  USING (user_email = auth.jwt() ->> 'email');

CREATE POLICY "Users can insert tracked brands" ON tracked_brands
  FOR INSERT
  WITH CHECK (user_email = auth.jwt() ->> 'email');

CREATE POLICY "Users can update tracked brands" ON tracked_brands
  FOR UPDATE
  USING (user_email = auth.jwt() ->> 'email');

CREATE POLICY "Users can delete tracked brands" ON tracked_brands
  FOR DELETE
  USING (user_email = auth.jwt() ->> 'email');

-- ========================================
-- STEP 2: Drop and recreate brand_mentions policies
-- ========================================

DO $$ 
BEGIN
  -- Drop brand_mentions policies
  BEGIN
    DROP POLICY "Users can view brand mentions" ON brand_mentions;
  EXCEPTION WHEN undefined_object THEN NULL;
  END;
  
  BEGIN
    DROP POLICY "Users can view team mentions" ON brand_mentions;
  EXCEPTION WHEN undefined_object THEN NULL;
  END;
  
  BEGIN
    DROP POLICY "Users can view their own mentions" ON brand_mentions;
  EXCEPTION WHEN undefined_object THEN NULL;
  END;
  
  BEGIN
    DROP POLICY "Users can insert brand mentions" ON brand_mentions;
  EXCEPTION WHEN undefined_object THEN NULL;
  END;
  
  BEGIN
    DROP POLICY "Users can insert their own mentions" ON brand_mentions;
  EXCEPTION WHEN undefined_object THEN NULL;
  END;
  
  BEGIN
    DROP POLICY "Users can view own brand mentions" ON brand_mentions;
  EXCEPTION WHEN undefined_object THEN NULL;
  END;
  
  BEGIN
    DROP POLICY "Users can insert own brand mentions" ON brand_mentions;
  EXCEPTION WHEN undefined_object THEN NULL;
  END;
END $$;

-- Create policies for brand_mentions
CREATE POLICY "Users can view brand mentions" ON brand_mentions
  FOR SELECT
  USING (user_email = auth.jwt() ->> 'email');

CREATE POLICY "Users can insert brand mentions" ON brand_mentions
  FOR INSERT
  WITH CHECK (user_email = auth.jwt() ->> 'email');

-- ========================================
-- VERIFICATION
-- ========================================

SELECT '✅ FIX COMPLETE!' AS status;
SELECT 'Your data should now be visible. Refresh your dashboard.' AS message;

-- List all policies to verify
SELECT 
  tablename, 
  policyname, 
  cmd
FROM pg_policies 
WHERE tablename IN ('tracked_brands', 'brand_mentions')
ORDER BY tablename, policyname;

