# 🔧 Fix: HTTP 401 Unauthorized on Webhook Test

## Understanding the 401 Error

The `HTTP 401: Unauthorized` error means **Make.com is rejecting your webhook request**. This usually happens for one of these reasons:

## Common Causes & Solutions

### ✅ **Solution 1: Make.com Webhooks Don't Usually Need Auth**

**Make.com custom webhooks typically DON'T require authentication** - the unique URL IS the authentication. 

**If you're getting 401, check:**

1. **Is the webhook URL correct?**
   - Make sure you copied the **entire URL** from Make.com
   - URL should look like: `https://hook.make.com/abc123def456...`
   - Make sure there are no extra spaces or characters

2. **Is the webhook still active in Make.com?**
   - Go to Make.com → Your scenario
   - Check if the webhook module is still there
   - Make sure the scenario is saved and active

3. **Try creating a NEW webhook in Make.com**
   - Sometimes webhooks expire or get invalidated
   - Create a fresh webhook URL
   - Update it in kommi

### ✅ **Solution 2: Make.com Requires Authentication (Rare)**

Some Make.com webhooks might require authentication. If Make.com specifically requires it:

1. **Edit your integration in kommi**
2. **Add Authorization Header**:
   - Format: `Bearer your-token` or `Basic base64string`
   - Check Make.com docs for the required format

### ✅ **Solution 3: Check Request Format**

Make sure we're sending the request correctly. Check browser console (F12) for:
- Network tab → Find the webhook request
- Check the request headers and body
- Verify it's a POST request with JSON

### ✅ **Solution 4: Test Directly in Make.com**

1. **Manually trigger the webhook in Make.com**
2. **Check if Make.com receives the data**
3. If Make.com works but kommi doesn't, there's a format issue

## Quick Test Steps

1. **Verify webhook URL:**
   ```bash
   # Test the URL directly with curl
   curl -X POST https://hook.make.com/YOUR-WEBHOOK-URL \
     -H "Content-Type: application/json" \
     -d '{"test": "data"}'
   ```
   
   If this works, the URL is fine. If it returns 401, Make.com requires auth.

2. **Check Make.com webhook settings:**
   - Look for "Authentication" or "Security" settings
   - Some webhooks might require API keys or tokens

3. **Try a different webhook service:**
   - Test with a simple webhook tester like `webhook.site`
   - If that works, the issue is Make.com-specific

## Most Likely Fix

**99% of the time, Make.com webhooks don't need auth.** The 401 usually means:

1. ❌ **Wrong/expired URL** → Create a new webhook in Make.com
2. ❌ **URL has extra characters** → Copy URL again carefully
3. ❌ **Webhook module deleted** → Recreate it in Make.com

## If Make.com Actually Requires Auth

If Make.com specifically tells you it needs authentication:

1. **Get the auth token/API key from Make.com**
2. **Edit your integration in kommi**
3. **Add to "Authorization Header" field:**
   ```
   Bearer YOUR_MAKE_API_KEY
   ```
4. **Save and test again**

## Still Not Working?

1. **Check browser console** (F12 → Network tab)
   - Find the failed webhook request
   - Check the exact error message
   - Check request headers and body

2. **Check Make.com webhook logs**
   - Go to Make.com → Your scenario
   - Look at webhook execution history
   - See what Make.com received (if anything)

3. **Try webhook.site for testing:**
   - Go to https://webhook.site
   - Get a test URL
   - Add it to kommi
   - Test - if this works, the issue is Make.com-specific

---

**Remember:** Make.com custom webhooks usually work WITHOUT authentication. The unique URL is the security. If you're getting 401, the URL is likely wrong or expired.


