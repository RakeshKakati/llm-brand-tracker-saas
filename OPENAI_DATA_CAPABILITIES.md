# 📊 OpenAI Data Capabilities: What You Can & Can't Get

## The Short Answer

**❌ OpenAI does NOT provide search volume data like Google Trends.**

OpenAI's API is designed for:
- Text generation
- Web search (sources)
- Content analysis
- **NOT** for search volume/trends data

---

## What Data OpenAI DOES Provide

### 1. **Text Response** ✅
```json
{
  "output": [
    {
      "type": "message",
      "content": "Your brand is mentioned in the following context..."
    }
  ]
}
```
- The actual AI response to your query
- Whether your brand is mentioned
- Evidence/context of the mention

### 2. **Source URLs** ✅
```json
{
  "output": [
    {
      "type": "web_search_call",
      "action": {
        "sources": [
          {
            "url": "https://techcrunch.com/article",
            "title": "Article Title"
          }
        ]
      }
    }
  ]
}
```
- URLs that were cited in the response
- Article titles
- Source metadata

### 3. **Mention Status** ✅
- Whether your brand appears in the response
- Position/context of mention
- Evidence snippets

### 4. **Query Processing** ✅
- How the query is interpreted
- What sources are searched
- Response quality

---

## What Data OpenAI DOES NOT Provide

### ❌ Search Volume
- No query volume data
- No "how many people searched this" metrics
- No trend data over time

### ❌ Search Trends
- No historical trend analysis
- No comparison between queries
- No "trending up/down" indicators

### ❌ Query Statistics
- No popularity scores
- No search frequency
- No relative volume data

### ❌ Geographic Data
- No regional search volumes
- No location-based trends
- No country-specific data

---

## How to Get Search Volume Data

### Option 1: Google Trends API (Free)
```javascript
// Google Trends doesn't have official API, but you can:
// 1. Use google-trends-api npm package
// 2. Scrape Google Trends (with rate limits)
// 3. Use Google Keyword Planner (requires AdWords account)

import { googleTrends } from 'google-trends-api';

const trends = await googleTrends.interestOverTime({
  keyword: 'best CRM for startups',
  startTime: new Date('2024-01-01'),
  endTime: new Date('2024-12-31'),
  geo: 'US'
});
```

**Limitations:**
- Requires npm package or scraping
- Rate limits
- Not real-time
- Relative volume only (0-100 scale)

### Option 2: Google Keyword Planner API (Paid)
```javascript
// Requires Google Ads account
// Provides actual search volume numbers
// More accurate than Trends

const keywordData = await googleAds.keywordPlanner.ideas({
  keywords: ['best CRM for startups'],
  geo: 'US',
  dateRange: 'LAST_30_DAYS'
});

// Returns:
// - Average monthly searches
// - Competition level
// - CPC estimates
```

**Limitations:**
- Requires Google Ads account
- Costs money (pay-per-use)
- More complex setup

### Option 3: SEMrush API (Paid)
```javascript
// Professional SEO tool
// Provides comprehensive keyword data

const semrush = await semrushAPI.keyword({
  keyword: 'best CRM for startups',
  database: 'us',
  export_columns: 'Ph,Po,Pp,Pd,Nq,Cp,Ur,Tr,Tc,Co,Nr,Td'
});

// Returns:
// - Search volume
// - CPC
// - Competition
// - Trends
```

**Limitations:**
- Expensive ($99+/month)
- API rate limits
- Requires subscription

### Option 4: Ahrefs API (Paid)
```javascript
// Similar to SEMrush
// Keyword research data

const ahrefs = await ahrefsAPI.keyword({
  keyword: 'best CRM for startups',
  output: 'json'
});
```

**Limitations:**
- Expensive ($99+/month)
- API access requires subscription

### Option 5: DataForSEO (Affordable)
```javascript
// Aggregates data from multiple sources
// More affordable than SEMrush/Ahrefs

const dataForSEO = await dataForSEOAPI.keywords({
  keyword: 'best CRM for startups',
  location: 'United States',
  language: 'en'
});
```

**Limitations:**
- Pay-per-use pricing
- Data quality varies
- Some data is estimated

---

## Creative Solution: Build Your Own Trends

Since you're already tracking queries, you can create **your own trend data**:

### 1. **Track Query Frequency**
```sql
-- Track how often each query is checked
CREATE TABLE query_trends (
  query TEXT,
  date DATE,
  check_count INTEGER,
  mentions_count INTEGER,
  avg_position DECIMAL
);

-- Aggregate daily
SELECT 
  query,
  DATE(created_at) as date,
  COUNT(*) as check_count,
  SUM(CASE WHEN mentioned THEN 1 ELSE 0 END) as mentions_count,
  AVG(position) as avg_position
FROM brand_mentions
GROUP BY query, DATE(created_at)
ORDER BY date DESC;
```

### 2. **Calculate Trends**
```typescript
// Compare query frequency over time
function calculateTrend(query: string, period: 'week' | 'month') {
  const current = getQueryCount(query, period);
  const previous = getQueryCount(query, period, 'previous');
  
  const trend = {
    query,
    current,
    previous,
    change: current - previous,
    changePercent: ((current - previous) / previous) * 100,
    trend: current > previous ? 'up' : 'down'
  };
  
  return trend;
}
```

### 3. **Relative Volume Scoring**
```typescript
// Score queries by how often they're checked
function scoreQueryPopularity(query: string) {
  const totalChecks = getTotalChecks(query);
  const allQueries = getAllQueries();
  const maxChecks = Math.max(...allQueries.map(q => q.checkCount));
  
  // Score 0-100 (like Google Trends)
  const score = (totalChecks / maxChecks) * 100;
  
  return {
    query,
    score, // 0-100
    checkCount: totalChecks,
    rank: getRank(query)
  };
}
```

---

## Combining OpenAI Data with Search Volume

### Strategy 1: Enrich Queries with Volume Data
```typescript
// 1. Check brand mention with OpenAI
const mentionResult = await checkMention(brand, query);

// 2. Get search volume from Google Trends
const volumeData = await getGoogleTrends(query);

// 3. Combine insights
const enrichedData = {
  query,
  mentioned: mentionResult.mentioned,
  position: mentionResult.position,
  searchVolume: volumeData.volume, // From Google Trends
  trend: volumeData.trend, // From Google Trends
  opportunityScore: calculateOpportunity(mentionResult, volumeData)
};
```

### Strategy 2: Prioritize High-Volume Queries
```typescript
// Only check mentions for high-volume queries
const highVolumeQueries = await getHighVolumeQueries([
  'best CRM for startups',
  'CRM comparison',
  'top CRM tools'
]);

// Check mentions only for these
for (const query of highVolumeQueries) {
  await checkMention(brand, query);
}
```

### Strategy 3: Trend Analysis Dashboard
```typescript
// Combine your data with external trends
const dashboard = {
  queries: queries.map(query => ({
    query,
    openaiData: {
      mentioned: getMentionStatus(query),
      position: getPosition(query),
      sources: getSources(query)
    },
    volumeData: {
      searchVolume: getVolume(query), // From Google Trends
      trend: getTrend(query), // From Google Trends
      competition: getCompetition(query) // From Google Trends
    },
    opportunityScore: calculateScore(query)
  }))
};
```

---

## Implementation: Add Search Volume to Your Platform

### Step 1: Add Volume Data Source
```typescript
// src/lib/search-volume-service.ts
import { googleTrends } from 'google-trends-api';

export async function getSearchVolume(query: string) {
  try {
    // Option 1: Google Trends (free, relative)
    const trends = await googleTrends.interestOverTime({
      keyword: query,
      startTime: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), // Last 90 days
      geo: 'US'
    });
    
    return {
      query,
      volume: parseTrendsData(trends),
      trend: calculateTrend(trends),
      source: 'google_trends'
    };
  } catch (error) {
    // Fallback: Use your own data
    return {
      query,
      volume: getYourOwnTrendData(query),
      trend: 'unknown',
      source: 'internal'
    };
  }
}
```

### Step 2: Enhance Database Schema
```sql
-- Add search volume columns
ALTER TABLE brand_mentions ADD COLUMN IF NOT EXISTS search_volume INTEGER;
ALTER TABLE brand_mentions ADD COLUMN IF NOT EXISTS volume_trend TEXT; -- 'up', 'down', 'stable'
ALTER TABLE brand_mentions ADD COLUMN IF NOT EXISTS volume_source TEXT; -- 'google_trends', 'internal', 'semrush'

-- Create query trends table
CREATE TABLE IF NOT EXISTS query_trends (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  query TEXT NOT NULL,
  date DATE NOT NULL,
  check_count INTEGER DEFAULT 0,
  mentions_count INTEGER DEFAULT 0,
  avg_position DECIMAL,
  search_volume INTEGER, -- From external source
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(query, date)
);
```

### Step 3: Update API to Include Volume
```typescript
// src/app/api/checkMention/route.ts
export async function POST(req: Request) {
  // ... existing code ...
  
  // Get search volume (optional, don't block if it fails)
  let volumeData = null;
  try {
    volumeData = await getSearchVolume(query);
  } catch (error) {
    console.log('⚠️ Search volume lookup failed, continuing...');
  }
  
  // Store with volume data
  await supabaseAdmin.from("brand_mentions").insert([{
    brand,
    query,
    mentioned,
    evidence,
    search_volume: volumeData?.volume || null,
    volume_trend: volumeData?.trend || null,
    volume_source: volumeData?.source || null,
    // ... other fields
  }]);
}
```

### Step 4: Display in Dashboard
```typescript
// src/components/pages/DashboardPage.tsx
// Add search volume column to queries table
<TableCell>
  <div className="flex items-center gap-2">
    {mention.search_volume ? (
      <>
        <TrendingUp className="w-4 h-4" />
        <span>{mention.search_volume.toLocaleString()}/mo</span>
        {mention.volume_trend === 'up' && <Badge variant="success">↑</Badge>}
      </>
    ) : (
      <span className="text-muted-foreground">—</span>
    )}
  </div>
</TableCell>
```

---

## Recommended Approach

### For Free Tier:
1. ✅ **Build your own trends** from your query data
2. ✅ Track query frequency over time
3. ✅ Calculate relative popularity
4. ✅ Show trends in dashboard

### For Pro Tier:
1. ✅ Integrate Google Trends API (free)
2. ✅ Add search volume to queries
3. ✅ Show trends over time
4. ✅ Prioritize high-volume queries

### For Enterprise Tier:
1. ✅ Integrate SEMrush/DataForSEO API
2. ✅ Get actual search volume numbers
3. ✅ Advanced trend analysis
4. ✅ Competitive keyword research

---

## Quick Win: Internal Trends

**Start with your own data:**
```sql
-- Track query popularity in your system
SELECT 
  query,
  COUNT(*) as times_checked,
  SUM(CASE WHEN mentioned THEN 1 ELSE 0 END) as times_mentioned,
  AVG(position) as avg_position,
  COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '7 days') as last_week_checks,
  COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '30 days') as last_month_checks
FROM brand_mentions
GROUP BY query
ORDER BY times_checked DESC
LIMIT 20;
```

**This gives you:**
- Most popular queries (by your users)
- Query trends (increasing/decreasing)
- Opportunity scores (high checks, low mentions = opportunity)

---

## Bottom Line

1. **OpenAI doesn't provide search volume** - use Google Trends/SEMrush
2. **Build your own trends** - track query frequency in your system
3. **Combine both** - OpenAI mentions + external volume data
4. **Start simple** - use your own data first, add external APIs later

**The value:** You can create a "Trends" feature using your own query data, then enhance it with external APIs when needed.


