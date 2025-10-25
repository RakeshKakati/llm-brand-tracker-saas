# Complete Guide: Setting Up Free Cron Service

## Step-by-Step Setup for cron-job.org (Recommended)

### Step 1: Create Account
1. Go to **https://cron-job.org**
2. Click **"Sign Up"** (top right)
3. Fill in:
   - Email: your-email@example.com
   - Password: create a strong password
   - Confirm password
4. Click **"Create Account"**
5. Check your email and verify your account

### Step 2: Create New Cron Job
1. After logging in, click **"Create cronjob"** (green button)
2. Fill in the form:

**Basic Settings:**
- **Title:** `Brand Tracker Cron Job`
- **Address:** `https://llm-brand-tracker-saas.vercel.app/api/server-cron`
- **Method:** `GET`
- **Schedule:** `*/5 * * * *` (every 5 minutes)

**Advanced Settings:**
- **Timeout:** `60` seconds
- **Retry:** `3` times
- **User-Agent:** `BrandTracker-Cron/1.0`

**Notifications (Optional):**
- **Email on failure:** Check this if you want error notifications
- **Email on success:** Leave unchecked (too many emails)

### Step 3: Save and Activate
1. Click **"Create cronjob"** button
2. Your cron job will be **"Active"** immediately
3. You'll see it in your dashboard with status "Active"

### Step 4: Test the Setup
1. Wait 5 minutes for the first run
2. Go to your cron job in the dashboard
3. Click on the job name to see execution history
4. You should see successful runs every 5 minutes

### Step 5: Verify It's Working
1. Go to your app: **https://llm-brand-tracker-saas.vercel.app**
2. Navigate to **"Mention History"** page
3. Wait 5-10 minutes
4. You should see new mention entries appearing automatically
5. The timestamps should show recent activity

## Alternative: EasyCron Setup

### Step 1: Create Account
1. Go to **https://www.easycron.com**
2. Click **"Sign Up"**
3. Use email and password to create account

### Step 2: Create Cron Job
1. Click **"Add Cron Job"**
2. Fill in:
   - **Job Name:** `Brand Tracker`
   - **URL:** `https://llm-brand-tracker-saas.vercel.app/api/server-cron`
   - **Schedule:** `*/5 * * * *`
   - **HTTP Method:** `GET`
   - **Timeout:** `60`
3. Click **"Save"**

## Alternative: UptimeRobot Setup

### Step 1: Create Account
1. Go to **https://uptimerobot.com**
2. Click **"Sign Up"**
3. Create account with email

### Step 2: Add Monitor
1. Click **"Add New Monitor"**
2. Select **"HTTP(s)"** type
3. Fill in:
   - **Friendly Name:** `Brand Tracker Cron`
   - **URL:** `https://llm-brand-tracker-saas.vercel.app/api/server-cron`
   - **Monitoring Interval:** `5 minutes`
4. Click **"Create Monitor"**

## Testing Your Setup

### Method 1: Check Cron Service Dashboard
- Log into your cron service
- Look for execution history/logs
- Should show successful HTTP 200 responses

### Method 2: Check Your App
1. Go to **https://llm-brand-tracker-saas.vercel.app**
2. Navigate to **"Mention History"**
3. Wait 5-10 minutes
4. Refresh the page
5. You should see new entries with recent timestamps

### Method 3: Manual Test
Run this command to test the endpoint:
```bash
curl -X GET "https://llm-brand-tracker-saas.vercel.app/api/server-cron"
```

Expected response:
```json
{
  "message": "Processed 3 trackers",
  "results": [...],
  "timestamp": "2025-10-25T..."
}
```

## Troubleshooting

### If Cron Job Fails:
1. Check the URL is correct: `https://llm-brand-tracker-saas.vercel.app/api/server-cron`
2. Verify the schedule: `*/5 * * * *`
3. Check timeout is set to 60 seconds
4. Look at execution logs in your cron service dashboard

### If No New Mentions Appear:
1. Wait 10-15 minutes (sometimes takes a few cycles)
2. Check if your trackers are active in the app
3. Verify the cron service is actually running
4. Check browser console for any errors

### If You Get Errors:
1. Make sure the URL is accessible: test it in browser
2. Check if Vercel deployment is working
3. Verify your trackers exist and are active
4. Check cron service logs for specific error messages

## Success Indicators

✅ **Cron service shows successful executions**
✅ **Mention History page shows new entries every 5 minutes**
✅ **Timestamps are recent (within last 5 minutes)**
✅ **No manual intervention required**
✅ **Works even when browser is closed**

## Free Tier Limits

- **cron-job.org:** 3 cron jobs, 1-minute minimum interval
- **EasyCron:** 20 cron jobs, 1-minute minimum interval  
- **UptimeRobot:** 50 monitors, 5-minute minimum interval

All are sufficient for your brand tracker needs!
