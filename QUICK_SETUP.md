# Quick Setup Guide - cron-job.org

## 🚀 5-Minute Setup

### 1. Go to cron-job.org
**URL:** https://cron-job.org

### 2. Sign Up
- Click **"Sign Up"** (top right)
- Email: `your-email@example.com`
- Password: `your-password`
- Click **"Create Account"**
- Verify email

### 3. Create Cron Job
Click **"Create cronjob"** (green button)

**Fill in exactly:**
```
Title: Brand Tracker Cron Job
Address: https://llm-brand-tracker-saas.vercel.app/api/server-cron
Method: GET
Schedule: */5 * * * *
Timeout: 60
User-Agent: BrandTracker-Cron/1.0
```

### 4. Save
- Click **"Create cronjob"**
- Status should show **"Active"**

### 5. Test
- Wait 5 minutes
- Check execution history in dashboard
- Go to your app: https://llm-brand-tracker-saas.vercel.app
- Navigate to "Mention History"
- You should see new entries every 5 minutes!

## ✅ Success Checklist

- [ ] Account created on cron-job.org
- [ ] Cron job created and active
- [ ] URL is correct: `https://llm-brand-tracker-saas.vercel.app/api/server-cron`
- [ ] Schedule is: `*/5 * * * *`
- [ ] Execution history shows successful runs
- [ ] Mention History page shows new entries
- [ ] Works without browser being open

## 🔧 Troubleshooting

**If cron job fails:**
- Check URL is accessible in browser
- Verify schedule syntax: `*/5 * * * *`
- Increase timeout to 60 seconds
- Check execution logs

**If no mentions appear:**
- Wait 10-15 minutes (takes a few cycles)
- Verify trackers are active in your app
- Check cron service dashboard for errors

## 📞 Need Help?

The cron job endpoint is working perfectly:
```bash
curl https://llm-brand-tracker-saas.vercel.app/api/server-cron
```

Should return:
```json
{
  "message": "Processed 3 trackers",
  "results": [...],
  "timestamp": "2025-10-25T..."
}
```
