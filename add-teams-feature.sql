-- Team Collaboration Feature
-- Run this in Supabase SQL Editor

-- 1. Create teams table
CREATE TABLE IF NOT EXISTS teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  owner_email TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create team_members table
CREATE TABLE IF NOT EXISTS team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  user_email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member', 'viewer')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'invited')),
  invited_by TEXT,
  invited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  joined_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(team_id, user_email)
);

-- 3. Add team_id to tracked_brands
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'tracked_brands' AND column_name = 'team_id'
  ) THEN
    ALTER TABLE tracked_brands ADD COLUMN team_id UUID REFERENCES teams(id) ON DELETE SET NULL;
    RAISE NOTICE '✅ Added team_id to tracked_brands';
  ELSE
    RAISE NOTICE 'ℹ️  team_id already exists in tracked_brands';
  END IF;
END $$;

-- 4. Add team_id to brand_mentions
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'brand_mentions' AND column_name = 'team_id'
  ) THEN
    ALTER TABLE brand_mentions ADD COLUMN team_id UUID REFERENCES teams(id) ON DELETE SET NULL;
    RAISE NOTICE '✅ Added team_id to brand_mentions';
  ELSE
    RAISE NOTICE 'ℹ️  team_id already exists in brand_mentions';
  END IF;
END $$;

-- 5. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_teams_owner_email ON teams(owner_email);
CREATE INDEX IF NOT EXISTS idx_team_members_team_id ON team_members(team_id);
CREATE INDEX IF NOT EXISTS idx_team_members_user_email ON team_members(user_email);
CREATE INDEX IF NOT EXISTS idx_team_members_status ON team_members(status);
CREATE INDEX IF NOT EXISTS idx_tracked_brands_team_id ON tracked_brands(team_id);
CREATE INDEX IF NOT EXISTS idx_brand_mentions_team_id ON brand_mentions(team_id);

-- 6. Enable RLS
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

-- 7. RLS Policy: Users can view teams they own or are members of
DROP POLICY IF EXISTS "Users can view their teams" ON teams;
CREATE POLICY "Users can view their teams" ON teams
  FOR SELECT
  USING (
    owner_email = auth.jwt() ->> 'email'
    OR id IN (
      SELECT team_id FROM team_members 
      WHERE user_email = auth.jwt() ->> 'email' 
      AND status = 'active'
    )
  );

-- 8. RLS Policy: Users can create teams
DROP POLICY IF EXISTS "Users can create teams" ON teams;
CREATE POLICY "Users can create teams" ON teams
  FOR INSERT
  WITH CHECK (owner_email = auth.jwt() ->> 'email');

-- 9. RLS Policy: Team owners and admins can update teams
DROP POLICY IF EXISTS "Team owners and admins can update teams" ON teams;
CREATE POLICY "Team owners and admins can update teams" ON teams
  FOR UPDATE
  USING (
    owner_email = auth.jwt() ->> 'email'
    OR id IN (
      SELECT team_id FROM team_members 
      WHERE user_email = auth.jwt() ->> 'email' 
      AND role = 'admin' 
      AND status = 'active'
    )
  );

-- 10. RLS Policy: Team owners can delete teams
DROP POLICY IF EXISTS "Team owners can delete teams" ON teams;
CREATE POLICY "Team owners can delete teams" ON teams
  FOR DELETE
  USING (owner_email = auth.jwt() ->> 'email');

-- 11. RLS Policy: Users can view team members for teams they're in
DROP POLICY IF EXISTS "Users can view team members" ON team_members;
CREATE POLICY "Users can view team members" ON team_members
  FOR SELECT
  USING (
    user_email = auth.jwt() ->> 'email'
    OR team_id IN (
      SELECT id FROM teams 
      WHERE owner_email = auth.jwt() ->> 'email'
    )
    OR team_id IN (
      SELECT team_id FROM team_members 
      WHERE user_email = auth.jwt() ->> 'email' 
      AND status = 'active'
    )
  );

-- 12. RLS Policy: Team owners and admins can invite members
DROP POLICY IF EXISTS "Team owners and admins can invite members" ON team_members;
CREATE POLICY "Team owners and admins can invite members" ON team_members
  FOR INSERT
  WITH CHECK (
    team_id IN (
      SELECT id FROM teams 
      WHERE owner_email = auth.jwt() ->> 'email'
    )
    OR team_id IN (
      SELECT team_id FROM team_members 
      WHERE user_email = auth.jwt() ->> 'email' 
      AND role = 'admin' 
      AND status = 'active'
    )
  );

-- 13. RLS Policy: Team owners and admins can update members
DROP POLICY IF EXISTS "Team owners and admins can update members" ON team_members;
CREATE POLICY "Team owners and admins can update members" ON team_members
  FOR UPDATE
  USING (
    team_id IN (
      SELECT id FROM teams 
      WHERE owner_email = auth.jwt() ->> 'email'
    )
    OR team_id IN (
      SELECT team_id FROM team_members 
      WHERE user_email = auth.jwt() ->> 'email' 
      AND role = 'admin' 
      AND status = 'active'
    )
  );

-- 14. RLS Policy: Users can accept their own invitations
DROP POLICY IF EXISTS "Users can accept invitations" ON team_members;
CREATE POLICY "Users can accept invitations" ON team_members
  FOR UPDATE
  USING (user_email = auth.jwt() ->> 'email' AND status = 'pending')
  WITH CHECK (user_email = auth.jwt() ->> 'email' AND status = 'active');

-- 15. RLS Policy: Team owners and admins can remove members
DROP POLICY IF EXISTS "Team owners and admins can remove members" ON team_members;
CREATE POLICY "Team owners and admins can remove members" ON team_members
  FOR DELETE
  USING (
    team_id IN (
      SELECT id FROM teams 
      WHERE owner_email = auth.jwt() ->> 'email'
    )
    OR team_id IN (
      SELECT team_id FROM team_members 
      WHERE user_email = auth.jwt() ->> 'email' 
      AND role = 'admin' 
      AND status = 'active'
    )
  );

-- 16. Update tracked_brands RLS to include team access
DROP POLICY IF EXISTS "Users can view team tracked brands" ON tracked_brands;
CREATE POLICY "Users can view team tracked brands" ON tracked_brands
  FOR SELECT
  USING (
    user_email = auth.jwt() ->> 'email'
    OR team_id IN (
      SELECT team_id FROM team_members 
      WHERE user_email = auth.jwt() ->> 'email' 
      AND status = 'active'
    )
  );

-- 17. Update brand_mentions RLS to include team access
DROP POLICY IF EXISTS "Users can view team mentions" ON brand_mentions;
CREATE POLICY "Users can view team mentions" ON brand_mentions
  FOR SELECT
  USING (
    user_email = auth.jwt() ->> 'email'
    OR team_id IN (
      SELECT team_id FROM team_members 
      WHERE user_email = auth.jwt() ->> 'email' 
      AND status = 'active'
    )
  );

-- 18. Helper function to get user's teams
CREATE OR REPLACE FUNCTION get_user_teams(user_email_param TEXT)
RETURNS TABLE (
  id UUID,
  name TEXT,
  owner_email TEXT,
  role TEXT,
  status TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    t.id,
    t.name,
    t.owner_email,
    COALESCE(tm.role, 'owner')::TEXT as role,
    COALESCE(tm.status, 'active')::TEXT as status
  FROM teams t
  LEFT JOIN team_members tm ON t.id = tm.team_id AND tm.user_email = user_email_param
  WHERE t.owner_email = user_email_param OR (tm.user_email = user_email_param AND tm.status = 'active');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

SELECT '✅ Team collaboration feature schema created successfully!' AS status;

