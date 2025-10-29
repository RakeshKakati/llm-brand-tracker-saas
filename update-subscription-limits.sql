-- Update subscription limits for proper plan enforcement
-- Run this in Supabase SQL Editor

-- Add max_brand_mentions column to subscriptions table if it doesn't exist
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

-- Update free subscriptions to have correct limits
UPDATE subscriptions
SET 
  max_trackers = 3,
  max_brand_mentions = 50
WHERE plan_type = 'free';

-- Update pro subscriptions to have correct limits
UPDATE subscriptions
SET 
  max_trackers = 10,
  max_brand_mentions = 100
WHERE plan_type = 'pro';

-- Update the default in the trigger function
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

SELECT '✅ Subscription limits updated successfully!' AS status;

