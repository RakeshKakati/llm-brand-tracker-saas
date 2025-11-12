# Integrations Feature Implementation Guide

## Overview
Enable users to push brand mention data directly to their CRM, marketing tools, and other platforms via integrations.

## Why This Is a Great Idea

### ✅ Benefits
1. **Reduces Manual Work**: Users don't need to export CSV and manually import
2. **Real-time Updates**: CRM gets updated automatically when mentions are found
3. **Increased Stickiness**: Once integrated, users are less likely to churn
4. **Higher Value**: Justifies premium pricing tiers
5. **Competitive Advantage**: Most competitors don't have this
6. **Better ROI**: Users can act on mentions immediately in their workflow

### 📊 Market Fit
- **Sales Teams**: Want mentions synced to Salesforce/Pipedrive as leads
- **Marketing Teams**: Need data in HubSpot/Marketo for campaigns
- **Customer Success**: Want to track brand mentions in Zendesk/Front
- **Agencies**: Need to push data to multiple client CRMs

## Implementation Strategy

### Phase 1: Webhooks (Universal & Fastest)
**Timeline: 1-2 weeks**

Start with webhooks - they work with ANY platform:
- Universal: Works with Zapier, Make, n8n, custom systems
- No OAuth complexity: Just need a URL
- Fast to implement: Single API endpoint
- Flexible: Users can configure their own workflows

**Implementation:**
```typescript
// src/app/api/integrations/webhook/route.ts
// User provides webhook URL, we POST data when mentions are found
```

**Features:**
- ✅ Custom webhook URLs
- ✅ Payload customization (JSON structure)
- ✅ Retry logic for failed requests
- ✅ Webhook testing interface
- ✅ Event filtering (only certain mentions trigger webhook)

### Phase 2: Native Integrations (High-Value Platforms)
**Timeline: 2-4 weeks per integration**

Focus on top 3-5 CRMs:
1. **HubSpot** (Marketing teams) - Most requested
2. **Salesforce** (Enterprise) - High-value customers
3. **Pipedrive** (Sales teams) - Growing fast
4. **Zapier** (Universal connector) - Opens entire ecosystem
5. **Slack** (Notifications) - Great for team alerts

**Implementation Pattern:**
```typescript
// Each integration:
// 1. OAuth flow (connect account)
// 2. Mapping interface (brand mentions → CRM fields)
// 3. Sync logic (push data on mention)
// 4. Settings (frequency, filters, etc.)
```

## Technical Architecture

### Database Schema

```sql
-- Integration configurations
CREATE TABLE integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  team_id UUID REFERENCES teams(id),
  type TEXT NOT NULL, -- 'webhook', 'hubspot', 'salesforce', etc.
  status TEXT DEFAULT 'active', -- 'active', 'paused', 'error'
  config JSONB NOT NULL, -- Platform-specific config
  mappings JSONB, -- Field mappings (mention → CRM fields)
  filters JSONB, -- Which mentions to sync
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Integration logs (for debugging)
CREATE TABLE integration_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  integration_id UUID REFERENCES integrations(id),
  status TEXT, -- 'success', 'error'
  message TEXT,
  payload JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- OAuth tokens (for native integrations)
CREATE TABLE oauth_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  integration_id UUID REFERENCES integrations(id),
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  expires_at TIMESTAMP,
  token_type TEXT DEFAULT 'Bearer',
  created_at TIMESTAMP DEFAULT NOW()
);
```

### API Structure

```
/api/integrations/
  ├── list (GET) - Get user's integrations
  ├── create (POST) - Create new integration
  ├── update/:id (PUT) - Update integration config
  ├── delete/:id (DELETE) - Remove integration
  ├── test/:id (POST) - Test integration
  ├── webhook/ (POST) - Webhook endpoint handler
  ├── oauth/
  │   ├── hubspot/authorize (GET)
  │   ├── hubspot/callback (GET)
  │   ├── salesforce/authorize (GET)
  │   └── salesforce/callback (GET)
  └── sync/:id (POST) - Manual sync trigger
```

### Trigger Points

Integrations should fire when:
1. **New mention found** (real-time)
2. **Mention updated** (position change, new sources)
3. **Scheduled sync** (daily/weekly summary)
4. **Manual trigger** (user clicks "Sync now")

## Recommended Integrations Priority

### Tier 1 (MVP - Build First)
1. **Webhooks** ⭐ - Universal, works everywhere
2. **Zapier** - Connects to 6,000+ apps
3. **Slack** - Team notifications (easy OAuth)

### Tier 2 (High Value)
4. **HubSpot** - Most popular marketing CRM
5. **Salesforce** - Enterprise customers
6. **Pipedrive** - Sales teams

### Tier 3 (Nice to Have)
7. **Google Sheets** - Simple data sync
8. **Notion** - Documentation teams
9. **Discord** - Community teams
10. **Microsoft Teams** - Enterprise

## Data Mapping Examples

### Brand Mention → HubSpot Contact
```json
{
  "email": "{{brand}}@example.com",
  "firstname": "{{brand}}",
  "lastname": "Mention",
  "company": "{{brand}}",
  "hs_lead_status": "OPEN",
  "kommi_mention_count": "{{mentionCount}}",
  "kommi_last_mentioned": "{{lastMentionDate}}",
  "kommi_position": "{{position}}",
  "kommi_query": "{{query}}"
}
```

### Brand Mention → Salesforce Lead
```json
{
  "FirstName": "{{brand}}",
  "LastName": "Mention",
  "Company": "{{brand}}",
  "LeadSource": "AI Search",
  "Kommi_Mention_Count__c": "{{mentionCount}}",
  "Kommi_Position__c": "{{position}}",
  "Kommi_Query__c": "{{query}}"
}
```

### Webhook Payload (Universal)
```json
{
  "event": "brand_mentioned",
  "timestamp": "2025-01-15T10:30:00Z",
  "data": {
    "brand": "kommi",
    "query": "best brand tracking tools",
    "mentioned": true,
    "position": 1,
    "sources": ["https://example.com/article"],
    "evidence": "kommi is mentioned as..."
  }
}
```

## UI/UX Flow

### Integration Setup Page
```
/integrations
├── Available Integrations (grid of cards)
│   ├── Webhooks (⭐ Recommended)
│   ├── Zapier
│   ├── HubSpot
│   └── ...
├── Active Integrations (list)
│   ├── HubSpot (Active)
│   │   ├── Configure mapping
│   │   ├── Test connection
│   │   └── View logs
│   └── Webhook (Active)
│       ├── Edit URL
│       └── Test webhook
└── Add Integration (button)
```

### Integration Card Components
- **Status indicator** (connected/disconnected)
- **Last sync time**
- **Recent activity** (last 5 syncs)
- **Quick actions** (test, edit, disconnect)
- **Error alerts** (if sync failed)

## Security Considerations

1. **OAuth Tokens**: Encrypt at rest, use secure storage
2. **Webhook URLs**: Validate HTTPS, allow whitelist
3. **Rate Limiting**: Prevent abuse
4. **Access Control**: Team-level permissions
5. **Data Privacy**: Only send data user authorizes
6. **Audit Logs**: Track all integration activity

## Pricing Strategy

### Free Tier
- 1 webhook integration
- Manual sync only

### Pro Tier ($19/month)
- 3 integrations (webhooks + native)
- Auto-sync on new mentions
- Zapier integration

### Enterprise
- Unlimited integrations
- Custom field mappings
- Priority support
- Dedicated webhook endpoints

## Implementation Steps

### Week 1-2: Webhooks
1. Create database schema
2. Build webhook API endpoint
3. Create integration UI
4. Add webhook testing
5. Document webhook format

### Week 3-4: Zapier Integration
1. Create Zapier app
2. OAuth flow
3. Trigger: "New Brand Mention"
4. Action: Push to CRM
5. Test with real accounts

### Week 5-6: HubSpot Integration
1. HubSpot OAuth setup
2. Contact creation/update
3. Field mapping UI
4. Sync logic
5. Error handling

## Success Metrics

- **Adoption Rate**: % of users with ≥1 integration
- **Retention**: Users with integrations vs without
- **Usage**: Avg syncs per user per month
- **Errors**: Failed sync rate (target <5%)
- **Support**: Integration-related tickets

## Competitive Analysis

**Peec AI**: ❌ No integrations
**Otterly AI**: ❌ No integrations
**Rankshift**: ❌ No integrations
**Knowatoa AI**: ❌ No integrations

**Your Advantage**: Be the first with native integrations!

## Next Steps

1. **Validate Demand**: Add "Request Integration" feature to gauge interest
2. **Start with Webhooks**: Fastest to market, universal solution
3. **Add Zapier**: Opens entire app ecosystem
4. **Focus on Top 3 CRMs**: HubSpot, Salesforce, Pipedrive
5. **Iterate Based on Usage**: See what users actually connect

## Conclusion

**Yes, this is an excellent idea!** 

Integrations are:
- ✅ High-value feature customers will pay for
- ✅ Differentiator from competitors
- ✅ Natural extension of your platform
- ✅ Increases retention and stickiness
- ✅ Enables premium pricing

Start with webhooks (universal), then add Zapier (ecosystem), then focus on top 3 native integrations based on user demand.


