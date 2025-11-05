# Dashboard Real-time Check Guide

## How to Use Real-time Data in Dashboard

### Quick Start

1. **Open Dashboard**: Navigate to `/dashboard` in your app
2. **Click "Check Now (Real-time)" button**: Top right corner, next to Refresh button
3. **View Results**: Results appear in a card below the header
4. **See Latest Data**: Dashboard automatically refreshes with new mentions

### Features

✅ **One-Click Check**: Checks all active trackers instantly  
✅ **Real-time Results**: Shows current ChatGPT responses  
✅ **Source Links**: Displays citations from ChatGPT  
✅ **Auto Refresh**: Dashboard updates with new data  
✅ **Visual Status**: Green checkmark for mentions, gray X for not found  

### What You'll See

When you click "Check Now (Real-time)":

1. **Button shows "Checking..."** with animated pulse
2. **Progress**: Checks each active tracker one by one
3. **Results Card Appears** showing:
   - Brand name and query
   - Mention status (Mentioned/Not Found)
   - Evidence snippet
   - Source links (if available)
   - Timestamp

4. **Summary Alert**: Shows how many brands were mentioned
5. **Dashboard Refreshes**: Latest data appears in charts and stats

### Example Results Card

```
Real-time Check Results
Latest real-time mentions check - 11/5/2024, 9:30 AM

┌─────────────────────────────────────────┐
│ kommi                    [Mentioned]    ✓│
│ "best brand tracking tools"              │
│ "kommi is a powerful brand tracking..."  │
│ [Source 1] [Source 2] [Source 3]         │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ competitor              [Not Found]      ✗│
│ "best analytics tools"                    │
└─────────────────────────────────────────┘
```

### How It Works

1. **Fetches Active Trackers**: Gets all your active brand trackers
2. **Calls Realtime API**: Uses `/api/trackBrand/realtime` endpoint
3. **RAG Enhancement**: If enabled, uses RAG for better results
4. **Stores Results**: Saves to database (same as regular checks)
5. **Updates Dashboard**: Refreshes all charts and stats

### Requirements

- ✅ Must be signed in
- ✅ Must have at least one active tracker
- ✅ RAG is optional (works with or without it)

### RAG Enabled vs Disabled

**RAG Disabled (default):**
- Uses standard checkMention endpoint
- Still works perfectly
- Results stored normally

**RAG Enabled:**
- Uses realtime endpoint with RAG
- Enhanced source extraction
- More accurate real-time data
- Better source citations

### Tips

1. **Check Regularly**: Use "Check Now" when you need immediate updates
2. **View Sources**: Click source links to see where ChatGPT found mentions
3. **Clear Results**: Click "Clear" button to hide results card
4. **Monitor Progress**: Watch console logs for real-time progress

### Troubleshooting

**"No active trackers found"**
- Add a tracker first in Tracking page
- Make sure tracker is set to "Active"

**"Please sign in"**
- Sign in to your account
- Refresh the page

**No results showing**
- Check browser console for errors
- Verify API endpoint is working
- Check server logs

---

**Note**: Real-time checks use the same API as scheduled checks, but trigger immediately. Results are stored in the database and appear in all dashboard sections.

