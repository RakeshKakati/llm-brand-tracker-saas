-- Complete SaaS Database Setup for Brand Tracker
-- Run this entire file in Supabase SQL Editor

-- ========================================
-- PART 1: Base Tables and Authentication
-- ========================================

-- 1. Create users table for storing user profiles
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create tracked_brands table
CREATE TABLE IF NOT EXISTS tracked_brands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand TEXT NOT NULL,
  query TEXT NOT NULL,
  interval_minutes INTEGER DEFAULT 5,
  active BOOLEAN DEFAULT true,
  user_email TEXT NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create brand_mentions table
CREATE TABLE IF NOT EXISTS brand_mentions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand TEXT NOT NULL,
  query TEXT NOT NULL,
  mentioned BOOLEAN NOT NULL,
  evidence TEXT,
  raw_output TEXT,
  user_email TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create subscriptions table
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

-- ========================================
-- PART 2: Enable Row Level Security
-- ========================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE tracked_brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE brand_mentions ENABLE ROW LEVEL SECURITY;

-- ========================================
-- PART 3: RLS Policies for Users
-- ========================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Users can insert own profile" ON users;

-- Create policies for users
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- ========================================
-- PART 4: RLS Policies for Subscriptions
-- ========================================

DROP POLICY IF EXISTS "Users can view own subscription" ON subscriptions;
DROP POLICY IF EXISTS "Users can update own subscription" ON subscriptions;
DROP POLICY IF EXISTS "Users can insert own subscription" ON subscriptions;

CREATE POLICY "Users can view own subscription" ON subscriptions
  FOR SELECT USING (user_email = (SELECT email FROM auth.users WHERE id = auth.uid()));

CREATE POLICY "Users can update own subscription" ON subscriptions
  FOR UPDATE USING (user_email = (SELECT email FROM auth.users WHERE id = auth.uid()));

CREATE POLICY "Users can insert own subscription" ON subscriptions
  FOR INSERT WITH CHECK (user_email = (SELECT email FROM auth.users WHERE id = auth.uid()));

-- ========================================
-- PART 5: RLS Policies for Tracked Brands
-- ========================================

DROP POLICY IF EXISTS "Users can view own tracked brands" ON tracked_brands;
DROP POLICY IF EXISTS "Users can insert own tracked brands" ON tracked_brands;
DROP POLICY IF EXISTS "Users can update own tracked brands" ON tracked_brands;
DROP POLICY IF EXISTS "Users can delete own tracked brands" ON tracked_brands;

CREATE POLICY "Users can view own tracked brands" ON tracked_brands
  FOR SELECT USING (user_email = (SELECT email FROM auth.users WHERE id = auth.uid()));

CREATE POLICY "Users can insert own tracked brands" ON tracked_brands
  FOR INSERT WITH CHECK (user_email = (SELECT email FROM auth.users WHERE id = auth.uid()));

CREATE POLICY "Users can update own tracked brands" ON tracked_brands
  FOR UPDATE USING (user_email = (SELECT email FROM auth.users WHERE id = auth.uid()));

CREATE POLICY "Users can delete own tracked brands" ON tracked_brands
  FOR DELETE USING (user_email = (SELECT email FROM auth.users WHERE id = auth.uid()));

-- ========================================
-- PART 6: RLS Policies for Brand Mentions
-- ========================================

DROP POLICY IF EXISTS "Users can view own brand mentions" ON brand_mentions;
DROP POLICY IF EXISTS "Users can insert own brand mentions" ON brand_mentions;

CREATE POLICY "Users can view own brand mentions" ON brand_mentions
  FOR SELECT USING (user_email = (SELECT email FROM auth.users WHERE id = auth.uid()));

CREATE POLICY "Users can insert own brand mentions" ON brand_mentions
  FOR INSERT WITH CHECK (user_email = (SELECT email FROM auth.users WHERE id = auth.uid()));

-- ========================================
-- PART 7: Functions and Triggers
-- ========================================

-- Function to automatically create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop and recreate trigger for user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to automatically create free subscription for new users
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

-- Drop and recreate trigger for subscription creation
DROP TRIGGER IF EXISTS on_auth_user_created_subscription ON auth.users;
CREATE TRIGGER on_auth_user_created_subscription
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_subscription();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop and recreate triggers for updated_at
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_tracked_brands_updated_at ON tracked_brands;
CREATE TRIGGER update_tracked_brands_updated_at
  BEFORE UPDATE ON tracked_brands
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_subscriptions_updated_at ON subscriptions;
CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to sync user_email from auth to tracked_brands
CREATE OR REPLACE FUNCTION public.sync_tracked_brands_user_email()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.user_email IS NULL THEN
    NEW.user_email := (SELECT email FROM auth.users WHERE id = NEW.user_id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop and recreate trigger for sync
DROP TRIGGER IF EXISTS sync_tracked_brands_email ON tracked_brands;
CREATE TRIGGER sync_tracked_brands_email
  BEFORE INSERT OR UPDATE ON tracked_brands
  FOR EACH ROW EXECUTE FUNCTION public.sync_tracked_brands_user_email();

-- ========================================
-- PART 8: Indexes for Performance
-- ========================================

CREATE INDEX IF NOT EXISTS idx_tracked_brands_user_email ON tracked_brands(user_email);
CREATE INDEX IF NOT EXISTS idx_tracked_brands_user_id ON tracked_brands(user_id);
CREATE INDEX IF NOT EXISTS idx_tracked_brands_active ON tracked_brands(active);
CREATE INDEX IF NOT EXISTS idx_brand_mentions_user_email ON brand_mentions(user_email);
CREATE INDEX IF NOT EXISTS idx_brand_mentions_created_at ON brand_mentions(created_at);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_email ON subscriptions(user_email);

-- ========================================
-- PART 9: Helper Functions
-- ========================================

-- Function to get user's subscription details
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

-- Function to check if user can add more trackers
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

-- ========================================
-- PART 10: Verification
-- ========================================

-- Check that all tables were created
DO $$
BEGIN
  RAISE NOTICE '✅ Setup complete! Tables created:';
  RAISE NOTICE '  - users';
  RAISE NOTICE '  - subscriptions';
  RAISE NOTICE '  - tracked_brands';
  RAISE NOTICE '  - brand_mentions';
  RAISE NOTICE '';
  RAISE NOTICE '✅ RLS enabled on all tables';
  RAISE NOTICE '✅ Triggers created for auto user/subscription creation';
  RAISE NOTICE '✅ Indexes created for performance';
  RAISE NOTICE '';
  RAISE NOTICE '🎉 Your multi-tenant SaaS database is ready!';
END $$;

