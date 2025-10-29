-- Add max_trackers and max_brand_mentions columns to subscriptions table
-- Run this in Supabase SQL Editor

-- Add max_trackers column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'subscriptions' AND column_name = 'max_trackers'
  ) THEN
    ALTER TABLE subscriptions ADD COLUMN max_trackers INTEGER NOT NULL DEFAULT 5;
    RAISE NOTICE '✅ Added max_trackers to subscriptions';
  ELSE
    RAISE NOTICE 'ℹ️  max_trackers already exists in subscriptions';
  END IF;
END $$;

-- Add max_brand_mentions column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'subscriptions' AND column_name = 'max_brand_mentions'
  ) THEN
    ALTER TABLE subscriptions ADD COLUMN max_brand_mentions INTEGER NOT NULL DEFAULT 50;
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

-- Update the trigger function to use correct limits for new users
CREATE OR REPLACE FUNCTION public.handle_new_user_subscription()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.subscriptions (
    user_email, 
    plan_type, 
    status, 
    max_trackers,
    max_brand_mentions
  )
  VALUES (
    NEW.email, 
    'free', 
    'active', 
    3,
    50
  )
  ON CONFLICT (user_email) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Verify the changes
SELECT 
  plan_type,
  COUNT(*) as count,
  MAX(max_trackers) as max_trackers,
  MAX(max_brand_mentions) as max_mentions
FROM subscriptions
GROUP BY plan_type
ORDER BY plan_type;

SELECT '✅ Subscription limits columns added and updated successfully!' AS status;

