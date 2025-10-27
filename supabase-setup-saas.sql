-- SaaS Database Schema for Brand Tracker
-- This extends the basic setup with subscriptions and user-centric data

-- 1. Create subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email TEXT NOT NULL,
  plan_type TEXT NOT NULL CHECK (plan_type IN ('free', 'pro', 'enterprise')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired')),
  max_trackers INTEGER NOT NULL DEFAULT 5,
  features JSONB DEFAULT '{}',
  stripe_subscription_id TEXT,
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_email)
);

-- 2. Update users table to include subscription reference
ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_id UUID REFERENCES subscriptions(id);

-- 3. Update tracked_brands to include user_email
ALTER TABLE tracked_brands ADD COLUMN IF NOT EXISTS user_email TEXT NOT NULL;
ALTER TABLE tracked_brands ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id) ON DELETE CASCADE;

-- 4. Update brand_mentions to include user_email
ALTER TABLE brand_mentions ADD COLUMN IF NOT EXISTS user_email TEXT NOT NULL;

-- 5. Enable Row Level Security
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE tracked_brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE brand_mentions ENABLE ROW LEVEL SECURITY;

-- 6. Create RLS Policies for subscriptions
CREATE POLICY "Users can view own subscription" ON subscriptions
  FOR SELECT USING (user_email = auth.jwt() ->> 'email');

CREATE POLICY "Users can update own subscription" ON subscriptions
  FOR UPDATE USING (user_email = auth.jwt() ->> 'email');

-- 7. Create RLS Policies for tracked_brands
CREATE POLICY "Users can view own tracked brands" ON tracked_brands
  FOR SELECT USING (user_email = auth.jwt() ->> 'email');

CREATE POLICY "Users can insert own tracked brands" ON tracked_brands
  FOR INSERT WITH CHECK (user_email = auth.jwt() ->> 'email');

CREATE POLICY "Users can update own tracked brands" ON tracked_brands
  FOR UPDATE USING (user_email = auth.jwt() ->> 'email');

CREATE POLICY "Users can delete own tracked brands" ON tracked_brands
  FOR DELETE USING (user_email = auth.jwt() ->> 'email');

-- 8. Create RLS Policies for brand_mentions
CREATE POLICY "Users can view own brand mentions" ON brand_mentions
  FOR SELECT USING (user_email = auth.jwt() ->> 'email');

CREATE POLICY "Users can insert own brand mentions" ON brand_mentions
  FOR INSERT WITH CHECK (user_email = auth.jwt() ->> 'email');

-- 9. Create function to automatically create free subscription for new users
CREATE OR REPLACE FUNCTION public.handle_new_user_subscription()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.subscriptions (
    user_email, 
    plan_type, 
    status, 
    max_trackers
  )
  VALUES (
    NEW.email, 
    'free', 
    'active', 
    5
  )
  ON CONFLICT (user_email) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. Create trigger to automatically create subscription on user signup
CREATE OR REPLACE TRIGGER on_auth_user_created_subscription
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_subscription();

-- 11. Create function to sync user_email from auth to tracked_brands
CREATE OR REPLACE FUNCTION public.sync_tracked_brands_user_email()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.user_email IS NULL THEN
    NEW.user_email := (SELECT email FROM auth.users WHERE id = NEW.user_id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 12. Create trigger for sync
CREATE OR REPLACE TRIGGER sync_tracked_brands_email
  BEFORE INSERT OR UPDATE ON tracked_brands
  FOR EACH ROW EXECUTE FUNCTION public.sync_tracked_brands_user_email();

-- 13. Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_tracked_brands_user_email ON tracked_brands(user_email);
CREATE INDEX IF NOT EXISTS idx_tracked_brands_user_id ON tracked_brands(user_id);
CREATE INDEX IF NOT EXISTS idx_brand_mentions_user_email ON brand_mentions(user_email);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_email ON subscriptions(user_email);

-- 14. Function to get user's subscription details
CREATE OR REPLACE FUNCTION public.get_user_subscription(user_email_param TEXT)
RETURNS TABLE (
  plan_type TEXT,
  status TEXT,
  max_trackers INTEGER,
  features JSONB,
  current_period_end TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.plan_type,
    s.status,
    s.max_trackers,
    s.features,
    s.current_period_end
  FROM subscriptions s
  WHERE s.user_email = user_email_param
  AND s.status = 'active';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 15. Function to check if user can add more trackers
CREATE OR REPLACE FUNCTION public.can_user_add_tracker(user_email_param TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  current_count INTEGER;
  max_allowed INTEGER;
BEGIN
  SELECT COUNT(*) INTO current_count
  FROM tracked_brands
  WHERE user_email = user_email_param AND active = true;
  
  SELECT max_trackers INTO max_allowed
  FROM subscriptions
  WHERE user_email = user_email_param AND status = 'active'
  LIMIT 1;
  
  RETURN (current_count < COALESCE(max_allowed, 5));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

