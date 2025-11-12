# 🚀 Expanding Contacts & Integrations: Practical Implementation Guide

## The Strategy

**Current competitors have:**
- ✅ Position tracking
- ✅ Competitor analysis  
- ✅ Source citations

**You have (unique):**
- 🎯 Contact extraction
- 🔗 Integrations

**The Goal:** Transform these into **"Mention-to-Customer Pipeline"**

---

## 📞 CONTACTS EXPANSION: 5 Features to Build

### 1. **Lead Scoring System** (Week 1)

**What it does:**
- Automatically scores contacts based on value
- Shows which leads are worth contacting first

**Implementation:**
```sql
-- Add to extracted_contacts table
ALTER TABLE extracted_contacts ADD COLUMN IF NOT EXISTS lead_score INTEGER DEFAULT 50;
ALTER TABLE extracted_contacts ADD COLUMN IF NOT EXISTS lead_tier TEXT DEFAULT 'medium'; -- 'high', 'medium', 'low'
ALTER TABLE extracted_contacts ADD COLUMN IF NOT EXISTS intent_signal TEXT; -- 'high_intent', 'medium_intent', 'low_intent'
```

**Scoring Logic:**
- **High-value (90-100)**: Mentions YOUR brand in top 3 positions
- **Medium (50-89)**: Mentions competitors (opportunity to win)
- **Low (0-49)**: Industry contacts (future outreach)

**UI Enhancement:**
```typescript
// Add to ContactsPage.tsx
- Badge showing "High-value Lead" on top contacts
- Filter by lead tier (High/Medium/Low)
- Sort by lead score
- Bulk action: "Add high-value leads to CRM"
```

**Value Prop:**
> "See which contacts are ready to buy - not just random emails"

---

### 2. **Contact Enrichment** (Week 2)

**What it does:**
- Fetches missing data (LinkedIn, company info, funding stage)
- Makes contacts more actionable

**Implementation:**
```typescript
// New API: /api/contacts/enrich
// Uses Clearbit, LinkedIn API, or Apollo.io
// Enriches: Company name, funding, employees, revenue, tech stack
```

**Features:**
- Auto-enrich on contact extraction
- Manual "Enrich Now" button
- Show enrichment status (pending/enriched/failed)

**UI Enhancement:**
```typescript
// Add to contact card:
- Company logo (from Clearbit)
- Funding stage badge
- Employee count
- Tech stack icons
- LinkedIn profile link
```

**Value Prop:**
> "Get full contact profiles, not just emails"

---

### 3. **Intent Signal Detection** (Week 2)

**What it does:**
- Analyzes queries to determine buyer intent
- Filters contacts by how ready they are to buy

**Implementation:**
```typescript
// Analyze the query from brand_mentions
// "Best CRM for startups" = High intent
// "CRM comparison" = Medium intent  
// "What is a CRM" = Low intent

const intentKeywords = {
  high: ['best', 'top', 'recommend', 'review', 'compare'],
  medium: ['alternatives', 'vs', 'comparison'],
  low: ['what is', 'how to', 'tutorial']
};

function detectIntent(query: string): 'high' | 'medium' | 'low' {
  // Simple keyword matching (can be enhanced with AI)
}
```

**UI Enhancement:**
- Badge: "🔥 High Intent" / "📊 Medium Intent" / "📚 Low Intent"
- Filter: "Show only high-intent leads"
- Sort: "Intent Score" option

**Value Prop:**
> "Contact people actively looking for your solution"

---

### 4. **Contact Status Tracking** (Week 3)

**What it does:**
- Tracks outreach status (not contacted, emailed, replied, converted)
- Shows pipeline progress

**Implementation:**
```sql
ALTER TABLE extracted_contacts ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'new';
-- Values: 'new', 'contacted', 'replied', 'meeting_scheduled', 'converted', 'lost'

ALTER TABLE extracted_contacts ADD COLUMN IF NOT EXISTS last_contacted_at TIMESTAMP;
ALTER TABLE extracted_contacts ADD COLUMN IF NOT EXISTS notes TEXT;
```

**UI Enhancement:**
```typescript
// Add status dropdown to each contact row
// Status badges with colors:
// - New: Gray
// - Contacted: Yellow
// - Replied: Blue
// - Meeting: Purple
// - Converted: Green
// - Lost: Red

// Add notes field (expandable)
// Add "Mark as contacted" button
```

**Value Prop:**
> "Track your outreach pipeline from contact to customer"

---

### 5. **Bulk Actions & CRM Push** (Week 3)

**What it does:**
- Select multiple contacts
- Push to CRM (via integrations)
- Export to CSV with custom fields

**Implementation:**
```typescript
// Add checkboxes to contact table
// Bulk actions dropdown:
// - "Add to HubSpot"
// - "Add to Pipedrive"  
// - "Export to CSV"
// - "Mark as contacted"
// - "Delete selected"

// Integration with existing integrations system
// When "Add to HubSpot" clicked:
// 1. Check if HubSpot integration exists
// 2. If yes, call /api/integrations/[id]/push-contacts
// 3. If no, show "Connect HubSpot first"
```

**UI Enhancement:**
- Checkbox column in table
- "Select All" checkbox
- Bulk actions toolbar (appears when contacts selected)
- Progress indicator for bulk operations

**Value Prop:**
> "Export 50 contacts to CRM in one click"

---

## 🔗 INTEGRATIONS EXPANSION: 5 Features to Build

### 1. **Native CRM Connections** (Week 4-5)

**What it does:**
- One-click connection to HubSpot, Pipedrive, Salesforce
- No webhook URLs needed

**Implementation:**
```typescript
// OAuth flow for each CRM
// Store OAuth tokens in integrations table
// Add new integration types: 'hubspot', 'pipedrive', 'salesforce'

// New API routes:
// /api/integrations/hubspot/authorize
// /api/integrations/hubspot/callback
// /api/integrations/pipedrive/authorize
// etc.

// Integration service:
// - Create contact in HubSpot when mention found
// - Update contact if exists
// - Add custom fields (kommi_position, kommi_query, etc.)
```

**UI Enhancement:**
```typescript
// Replace "Add Webhook" button with:
// - "Connect HubSpot" (big button)
// - "Connect Pipedrive" (big button)
// - "Connect Salesforce" (big button)
// - "Add Custom Webhook" (small link)

// After connection:
// - Show "Connected" status
// - Show sync settings (what to sync, when)
// - Test connection button
```

**Value Prop:**
> "Connect your CRM in 30 seconds - no API keys needed"

---

### 2. **Visual Workflow Builder** (Week 6-7)

**What it does:**
- Drag-and-drop workflow builder
- "When X happens → Do Y"

**Implementation:**
```typescript
// New component: WorkflowBuilder.tsx
// Uses react-flow or similar
// Stores workflows in database:

CREATE TABLE workflows (
  id UUID PRIMARY KEY,
  user_email TEXT,
  name TEXT,
  trigger TEXT, -- 'brand_mentioned', 'position_changed', etc.
  actions JSONB, -- [{type: 'create_crm_lead', config: {...}}, ...]
  enabled BOOLEAN DEFAULT true
);
```

**Pre-built Workflows:**
- "New Mention → Create CRM Lead"
- "Position Drops → Alert Slack"
- "Competitor Appears → Extract Contacts"
- "High-value Lead → Send Email"

**UI Enhancement:**
- Visual node-based editor
- Drag triggers and actions
- Connect nodes
- Test workflow
- Enable/disable toggle

**Value Prop:**
> "Build custom automations without code"

---

### 3. **Smart Workflow Suggestions** (Week 7)

**What it does:**
- AI suggests workflows based on user behavior
- "You extracted contacts 10 times - automate this?"

**Implementation:**
```typescript
// Analyze user actions:
// - How often they extract contacts
// - Which integrations they use
// - What manual tasks they repeat

// Suggest workflows:
// "You manually export contacts weekly → Set up auto-export?"
// "You check positions daily → Set up position alerts?"
// "You extract contacts from mentions → Auto-extract contacts?"

// Show suggestions in dashboard
// One-click to create workflow
```

**UI Enhancement:**
- "Workflow Suggestions" card in dashboard
- "Create Workflow" button on suggestions
- Show savings: "Save 2 hours/week"

**Value Prop:**
> "AI suggests automations to save you time"

---

### 4. **Contact-to-CRM Auto-Sync** (Week 8)

**What it does:**
- When contacts extracted → Auto-create in CRM
- When contact status changes → Update CRM
- Bi-directional sync (CRM → kommi)

**Implementation:**
```typescript
// Extend triggerIntegrations function
// Add new event: 'contact_extracted'
// When contact extracted:
// 1. Check if CRM integration exists
// 2. Check if contact already in CRM (by email)
// 3. Create or update contact
// 4. Add kommi metadata (source_url, query, position)

// Bi-directional sync:
// - Pull contacts from CRM
// - Match by email
// - Update status if contact exists in CRM
```

**UI Enhancement:**
- "Auto-sync contacts to CRM" toggle in integration settings
- Show sync status: "Last synced: 2 minutes ago"
- "Sync Now" button
- Sync log (what was synced, errors)

**Value Prop:**
> "Contacts automatically appear in your CRM - zero work"

---

### 5. **Multi-Step Workflows** (Week 9-10)

**What it does:**
- Complex automations: "Mention → Extract Contact → Create Lead → Assign Rep → Send Email"

**Implementation:**
```typescript
// Extend workflow actions:
// - create_crm_lead
// - extract_contacts
// - assign_to_rep
// - send_email
// - update_status
// - add_note

// Workflow execution:
// - Sequential (one after another)
// - Conditional (if/then)
// - Parallel (multiple actions at once)

// Example workflow:
{
  trigger: 'brand_mentioned',
  conditions: [{position: '<= 3'}],
  actions: [
    {type: 'extract_contacts', source_url: '{{source_url}}'},
    {type: 'create_crm_lead', crm: 'hubspot'},
    {type: 'send_email', template: 'new_lead'},
    {type: 'add_note', text: 'Auto-extracted from AI mention'}
  ]
}
```

**UI Enhancement:**
- Multi-step workflow builder
- Conditional logic (if position < 3, then...)
- Action sequencing
- Error handling (if step fails, continue/stop)

**Value Prop:**
> "Complete sales pipeline automation - mention to customer"

---

## 🎯 THE COMBINED KILLER FEATURE

### **"Mention-to-Customer Pipeline"**

**The Complete Flow:**
1. AI mentions your brand → kommi detects
2. **Auto-extract contacts** from source
3. **Auto-enrich** with company data
4. **Auto-score** leads (high/medium/low)
5. **Auto-create** CRM records
6. **Auto-assign** to sales rep
7. **Auto-send** personalized email
8. **Auto-track** engagement (opens, clicks)
9. **Auto-update** CRM with status

**All automated. Zero code.**

---

## 📊 PRIORITY ORDER

### Phase 1 (Immediate Impact - 2 weeks):
1. ✅ Lead scoring (simple, high value)
2. ✅ Contact status tracking (shows pipeline)
3. ✅ Bulk actions (saves time)

### Phase 2 (High Value - 3 weeks):
4. ✅ HubSpot native integration (most requested)
5. ✅ Contact-to-CRM auto-sync
6. ✅ Workflow builder (basic)

### Phase 3 (Game Changer - 4 weeks):
7. ✅ Contact enrichment
8. ✅ Intent detection
9. ✅ Multi-step workflows
10. ✅ Smart suggestions

---

## 💰 PRICING STRATEGY

### Free Tier:
- Basic contact extraction
- 1 webhook integration
- Manual export

### Pro ($19/month):
- Lead scoring
- Contact status tracking
- 1 native CRM (HubSpot OR Pipedrive)
- Basic workflows
- Bulk actions

### Enterprise ($99/month):
- Contact enrichment
- Intent detection
- All native CRMs
- Advanced workflows
- Multi-step automations
- API access

---

## 🔥 MARKETING MESSAGES

1. **"Turn AI Mentions into Customers"**
   - Extract → Enrich → Score → Automate

2. **"Your Sales Pipeline on Autopilot"**
   - Mention → Contact → Lead → Customer

3. **"The Only Tool That Closes Deals"**
   - Others track, you convert

4. **"Lead Generation on Steroids"**
   - Every mention = potential customer

---

## 🎯 NEXT STEPS

1. **Start with Lead Scoring** (easiest, highest value)
2. **Add HubSpot Integration** (most requested)
3. **Build Workflow Builder** (differentiator)
4. **Add Enrichment** (makes contacts valuable)

**Bottom Line:** You're not just tracking mentions - you're **building a complete sales pipeline**. That's your competitive advantage.


