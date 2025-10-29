-- Fix existing subscriptions that don't have max_trackers
-- Run this in Supabase SQL Editor

-- First, add the columns if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'subscriptions' AND column_name = 'max_trackers'
  ) THEN
    ALTER TABLE subscriptions ADD COLUMN max_trackers INTEGER;
    RAISE NOTICE '✅ Added max_trackers to subscriptions';
  ELSE
    RAISE NOTICE 'ℹ️  max_trackers already exists in subscriptions';
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'subscriptions' AND column_name = 'max_brand_mentions'
  ) THEN
    ALTER TABLE subscriptions ADD COLUMN max_brand_mentions INTEGER;
    RAISE NOTICE '✅ Added max_brand_mentions to subscriptions';
  ELSE
    RAISE NOTICE 'ℹ️  max_brand_mentions already exists in subscriptions';
  END IF;
END $$;

-- Update all existing free subscriptions to have correct limits
UPDATE subscriptions
SET 
  max_trackers = 3,
  max_brand_mentions = 50
WHERE plan_type = 'free';

-- Update all existing pro subscriptions to have correct limits
UPDATE subscriptions
SET 
  max_trackers = 10,
  max_brand_mentions = 100
WHERE plan_type = 'pro';

-- Make columns NOT NULL with defaults (if they're NULL)
UPDATE subscriptions
SET max_trackers = COALESCE(max_trackers, 3)
WHERE max_trackers IS NULL;

UPDATE subscriptions
SET max_brand_mentions = COALESCE(max_brand_mentions, 50)
WHERE max_brand_mentions IS NULL;

-- Verify the changes
SELECT 
  user_email,
  plan_type,
  max_trackers,
  max_brand_mentions
FROM subscriptions
ORDER BY plan_type, user_email;

SELECT '✅ All subscriptions updated with correct limits!' AS status;

