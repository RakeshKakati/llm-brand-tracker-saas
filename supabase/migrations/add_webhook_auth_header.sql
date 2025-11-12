-- Add webhook_auth_header column if it doesn't exist
-- Run this if you already ran add_integrations.sql before the auth header was added

ALTER TABLE integrations ADD COLUMN IF NOT EXISTS webhook_auth_header TEXT;

-- Add comment
COMMENT ON COLUMN integrations.webhook_auth_header IS 'Optional Authorization header (e.g., "Bearer token" or "Basic base64")';


