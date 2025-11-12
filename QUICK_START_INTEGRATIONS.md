# Quick Start: Integrations Feature

## Step 1: Run Database Migration ⚠️ REQUIRED

**Before using integrations, you MUST run the database migration:**

1. Open Supabase Dashboard
2. Go to SQL Editor
3. Copy and paste the contents of `supabase/migrations/add_integrations.sql`
4. Click "Run"

**Or run via CLI:**
```bash
# If you have Supabase CLI
supabase db push
```

**Check if table exists:**
```sql
-- Run this in Supabase SQL Editor
SELECT * FROM integrations LIMIT 1;
```

If you get an error "relation 'integrations' does not exist", the migration hasn't been run.

## Step 2: Test the Integration

1. Go to **Integrations** page in dashboard
2. Click **"Add Webhook"**
3. Enter:
   - Name: "Test Webhook"
   - URL: `https://hook.make.com/your-webhook-url` (or any test URL)
4. Click **"Create Integration"**
5. You should see it appear in the list immediately

## Troubleshooting

### "No integrations yet" after creating one?

**Check 1: Database migration**
- Run the migration SQL in Supabase
- Verify table exists: `SELECT * FROM integrations;`

**Check 2: Browser console**
- Open browser DevTools (F12)
- Check Console tab for errors
- Look for API errors or fetch errors

**Check 3: Network tab**
- Open Network tab in DevTools
- Create an integration
- Check the `/api/integrations` requests
- Look at response status and body

**Check 4: User email**
- Verify you're signed in
- Check if user_email matches in database
- Integration is created with your current email

### Integration created but not showing?

1. **Refresh the page** - sometimes UI needs refresh
2. **Check browser console** - look for fetch errors
3. **Verify in database**:
   ```sql
   SELECT * FROM integrations WHERE user_email = 'your-email@example.com';
   ```
4. **Check API response**:
   - Open Network tab
   - Find GET `/api/integrations`
   - Check response body

### Common Errors

**Error: "relation 'integrations' does not exist"**
→ Run the database migration!

**Error: "Failed to fetch integrations"**
→ Check Supabase connection
→ Verify RLS policies are set up
→ Check browser console for details

**Error: "Unauthorized"**
→ Make sure you're signed in
→ Check if user_email is being sent correctly

## Manual Database Check

Run this to see all integrations:
```sql
SELECT 
  id,
  name,
  type,
  status,
  webhook_url,
  user_email,
  created_at
FROM integrations
ORDER BY created_at DESC;
```

## Next Steps

Once integrations are showing:
1. ✅ Test webhook with Play button
2. ✅ Configure filters (mentioned only, position)
3. ✅ Watch webhooks trigger on new mentions
4. ✅ Check integration logs for debugging


