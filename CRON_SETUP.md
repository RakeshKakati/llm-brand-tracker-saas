# External Cron Service Configuration

## Option 1: cron-job.org (Free)
1. Go to https://cron-job.org
2. Create free account
3. Add new cron job:
   - URL: https://llm-brand-tracker-saas.vercel.app/api/server-cron
   - Schedule: 0 9 * * * (once daily at 9:00 AM UTC)
   - Method: GET
   - Headers: User-Agent: External-Cron/1.0

## Option 2: EasyCron (Free tier)
1. Go to https://www.easycron.com
2. Create free account
3. Add new cron job:
   - URL: https://llm-brand-tracker-saas.vercel.app/api/server-cron
   - Schedule: 0 9 * * * (once daily at 9:00 AM UTC)
   - Method: GET

## Option 3: UptimeRobot (Free)
1. Go to https://uptimerobot.com
2. Create free account
3. Add new monitor:
   - URL: https://llm-brand-tracker-saas.vercel.app/api/server-cron
   - Interval: Daily at 9:00 AM UTC
   - Type: HTTP(s)

## Option 4: GitHub Actions (Current)
The GitHub Actions workflow should work, but may need to be enabled:
1. Go to your GitHub repository
2. Click "Actions" tab
3. Enable workflows if disabled
4. Check if cron.yml is running

## Option 5: Vercel Cron (Paid)
If you have Vercel Pro:
1. Add vercel.json with cron configuration
2. Deploy to Vercel
3. Cron jobs run automatically

## Test the Server Cron Endpoint
curl -X GET "https://llm-brand-tracker-saas.vercel.app/api/server-cron"
