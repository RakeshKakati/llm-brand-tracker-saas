# Webhooks with Make.com (formerly Integromat) - Setup Guide

## ✅ Yes, it works perfectly with Make.com!

Webhooks are universal HTTP endpoints - they work with **any platform** that accepts HTTP POST requests, including:
- ✅ Make.com (Integromat)
- ✅ Zapier
- ✅ n8n
- ✅ Custom webhooks
- ✅ Any HTTP endpoint

## How to Set Up

### Step 1: Create Webhook in Make.com

1. Open your Make.com scenario
2. Add a **Webhook** module (trigger)
3. Choose "Custom webhook"
4. Click "Save" - Make.com will generate a webhook URL like:
   ```
   https://hook.make.com/abc123def456...
   ```
5. Copy this URL

### Step 2: Add Integration in kommi

1. Go to **Integrations** page in kommi dashboard
2. Click **"Add Webhook"**
3. Enter:
   - **Name**: "Make.com Webhook" (or any name)
   - **Webhook URL**: Paste the Make.com webhook URL
   - **Webhook Secret** (optional): For security
4. Configure filters (optional):
   - ✅ "Only trigger when brand is mentioned"
   - Minimum position (e.g., only if position ≤ 3)
5. Click **"Create Integration"**

### Step 3: Test the Connection

1. Click the **Play button** (▶️) next to your integration
2. This sends a test payload to Make.com
3. Check Make.com - you should see the test data arrive!

## What Data Gets Sent

When a brand mention is found, kommi sends a POST request with this JSON structure:

```json
{
  "event": "brand_mentioned",
  "timestamp": "2025-01-15T10:30:00Z",
  "data": {
    "brand": "kommi",
    "query": "best brand tracking tools",
    "mentioned": true,
    "position": 1,
    "evidence": "kommi is mentioned as a powerful brand tracking solution...",
    "source_urls": [
      "https://example.com/article",
      "https://another-site.com/review"
    ],
    "sources": [
      {
        "url": "https://example.com/article",
        "title": "Example Article"
      }
    ]
  }
}
```

## Make.com Workflow Examples

### Example 1: Create Lead in CRM

**Scenario**: When kommi finds a brand mention → Create lead in Pipedrive

1. **Webhook** (trigger) - receives data from kommi
2. **Data Store** (optional) - parse JSON
3. **Pipedrive > Create a Person**
   - Map `data.brand` → Company Name
   - Map `data.query` → Notes
   - Map `data.position` → Custom field

### Example 2: Send Slack Notification

**Scenario**: Get notified when brand is mentioned

1. **Webhook** (trigger)
2. **Slack > Create a Message**
   - Channel: #brand-mentions
   - Message: `"🎉 {data.brand} mentioned in '{data.query}' - Position: {data.position}"`

### Example 3: Update Google Sheet

**Scenario**: Track all mentions in a spreadsheet

1. **Webhook** (trigger)
2. **Google Sheets > Add a Row**
   - Sheet: Brand Mentions
   - Columns: Brand, Query, Position, Timestamp, Sources

### Example 4: Filtered Notifications

**Scenario**: Only notify if position ≤ 3

1. In kommi, set **Minimum Position** filter to `3`
2. Only mentions in top 3 positions will trigger webhook
3. Connect to Slack/Email for high-priority alerts

## Advanced: Custom Payload Template

You can customize the JSON payload structure in the future (coming soon). For now, use Make.com's data transformation to reshape the data as needed.

## Troubleshooting

### Webhook not receiving data?
1. Check integration status in kommi (should be "active")
2. Test webhook using the ▶️ button
3. Check Make.com webhook logs
4. Verify webhook URL is correct and uses HTTPS

### Getting errors?
1. Check integration logs in kommi
2. Look at error count in integrations table
3. After 5 errors, integration auto-pauses
4. Reactivate and check webhook URL

### Testing in Make.com
1. Use kommi's "Test" button to send sample data
2. Or wait for a real brand mention to trigger
3. Make.com will show the data in the webhook module

## Security

- **HTTPS Required**: Webhook URLs must use HTTPS (except localhost for development)
- **Webhook Secret** (optional): Add a secret for signature verification
- **Signature Header**: `X-Kommi-Signature: sha256=<signature>` (if secret configured)

## Next Steps

1. ✅ Create webhook in Make.com
2. ✅ Add integration in kommi
3. ✅ Test the connection
4. ✅ Build your Make.com workflow
5. ✅ Watch brand mentions flow automatically!

## Support

- Check integration logs in kommi dashboard
- View last triggered time and success/error counts
- Test webhook anytime with the Play button

---

**Pro Tip**: Start with a simple workflow (Slack notification) to test, then build more complex automations!


