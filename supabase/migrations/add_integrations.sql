-- Integrations Feature - Phase 1: Webhooks
-- This migration adds support for webhook integrations

-- 1. Create integrations table
CREATE TABLE IF NOT EXISTS integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  user_email TEXT NOT NULL,
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  type TEXT NOT NULL DEFAULT 'webhook', -- 'webhook', 'hubspot', 'salesforce', etc.
  name TEXT NOT NULL, -- User-friendly name for the integration
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'error')),
  
  -- Webhook-specific config
  webhook_url TEXT, -- The URL to POST to
  webhook_secret TEXT, -- Optional secret for webhook signature
  webhook_method TEXT DEFAULT 'POST', -- HTTP method
  webhook_auth_header TEXT, -- Optional Authorization header (e.g., "Bearer token" or "Basic base64")
  
  -- Payload customization
  payload_template JSONB, -- Custom JSON structure (optional)
  event_filters JSONB, -- Which events trigger webhook (optional)
  
  -- General config (for future native integrations)
  config JSONB DEFAULT '{}',
  
  -- Metadata
  last_triggered_at TIMESTAMP WITH TIME ZONE,
  last_error TEXT,
  error_count INTEGER DEFAULT 0,
  success_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create integration_logs table for debugging
CREATE TABLE IF NOT EXISTS integration_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  integration_id UUID REFERENCES integrations(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL, -- 'brand_mentioned', 'mention_updated', etc.
  status TEXT NOT NULL CHECK (status IN ('success', 'error', 'pending')),
  status_code INTEGER, -- HTTP status code
  request_payload JSONB,
  response_body TEXT,
  error_message TEXT,
  duration_ms INTEGER, -- How long the request took
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_integrations_user_email ON integrations(user_email);
CREATE INDEX IF NOT EXISTS idx_integrations_team_id ON integrations(team_id);
CREATE INDEX IF NOT EXISTS idx_integrations_status ON integrations(status);
CREATE INDEX IF NOT EXISTS idx_integrations_type ON integrations(type);
CREATE INDEX IF NOT EXISTS idx_integration_logs_integration_id ON integration_logs(integration_id);
CREATE INDEX IF NOT EXISTS idx_integration_logs_created_at ON integration_logs(created_at DESC);

-- 4. Enable Row Level Security
ALTER TABLE integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE integration_logs ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies for integrations
CREATE POLICY "Users can view own integrations" ON integrations
  FOR SELECT 
  USING (
    user_email = (SELECT email FROM auth.users WHERE id = auth.uid())::text
    OR team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can create own integrations" ON integrations
  FOR INSERT 
  WITH CHECK (
    user_email = (SELECT email FROM auth.users WHERE id = auth.uid())::text
  );

CREATE POLICY "Users can update own integrations" ON integrations
  FOR UPDATE 
  USING (
    user_email = (SELECT email FROM auth.users WHERE id = auth.uid())::text
    OR team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid() AND role = 'owner')
  );

CREATE POLICY "Users can delete own integrations" ON integrations
  FOR DELETE 
  USING (
    user_email = (SELECT email FROM auth.users WHERE id = auth.uid())::text
    OR team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid() AND role = 'owner')
  );

-- 6. RLS Policies for integration_logs
CREATE POLICY "Users can view own integration logs" ON integration_logs
  FOR SELECT 
  USING (
    integration_id IN (
      SELECT id FROM integrations 
      WHERE user_email = (SELECT email FROM auth.users WHERE id = auth.uid())::text
      OR team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid())
    )
  );

-- 7. Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_integrations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_integrations_updated_at
  BEFORE UPDATE ON integrations
  FOR EACH ROW
  EXECUTE FUNCTION update_integrations_updated_at();

-- 8. Add comment for documentation
COMMENT ON TABLE integrations IS 'Stores integration configurations for webhooks and native integrations';
COMMENT ON TABLE integration_logs IS 'Logs all webhook requests for debugging and monitoring';

