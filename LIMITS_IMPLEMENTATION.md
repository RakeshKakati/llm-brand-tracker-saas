# 📊 Limits Implementation Documentation

## Current Implementation

### 1. **Max Trackers Limit** ✅ **ENFORCED**

**Location**: `src/app/api/trackBrand/route.ts`

**How it works**:
- When creating a new tracker, the API checks the user's `subscriptions` table for `max_trackers`
- If `max_trackers` is `null` or doesn't exist, it falls back to:
  - Pro plan: 10 trackers
  - Free plan: 3 trackers
- Counts all **active** trackers for that user
- **Blocks creation** if `count >= limit` (returns 403 error)

**Code**:
```typescript
// Check subscription limits
const { data: subscription } = await supabaseAdmin
  .from("subscriptions")
  .select("max_trackers, plan_type")
  .eq("user_email", user_email)
  .eq("status", "active")
  .single();

// Determine limits based on plan type
const limit = subscription?.max_trackers || (subscription?.plan_type === 'pro' ? 10 : 3);

// Count current trackers
const { count } = await supabaseAdmin
  .from("tracked_brands")
  .select("*", { count: "exact", head: true })
  .eq("user_email", user_email)
  .eq("active", true);

// Enforce limit
if (count !== null && count >= limit) {
  return NextResponse.json({ 
    error: `Tracker limit reached. Your ${subscription?.plan_type || 'free'} plan allows ${limit} trackers.`,
    limit: limit,
    current: count
  }, { status: 403 });
}
```

---

### 2. **Max Brand Mentions Limit** ❌ **NOT CURRENTLY ENFORCED**

**Location**: `src/app/api/checkMention/route.ts`

**Status**: The limit is **stored** in the `subscriptions` table as `max_brand_mentions`, but it's **NOT enforced** when creating brand mentions.

**Current behavior**:
- Users can create **unlimited** brand mentions regardless of their plan
- The limit is only used for **display purposes** in the usage API

**Code** (what's missing):
```typescript
// ❌ NOT IMPLEMENTED - This check doesn't exist in checkMention/route.ts
// The API should check the limit before inserting a new mention, similar to trackBrand
```

---

## Database Schema

### Subscriptions Table

```sql
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY,
  user_email TEXT,
  plan_type TEXT, -- 'free' or 'pro'
  status TEXT, -- 'active', 'cancelled', etc.
  max_trackers INTEGER, -- Can be NULL (falls back to plan defaults ELSE)
  max_brand_mentions INTEGER, -- Can be NULL (falls back to plan defaults)
  stripe_subscription_id TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

**Default Values**:
- **Free Plan**: `max_trackers = 3`, `max_brand_mentions = 50`
- **Pro Plan**: `max_trackers = 10`, `max_brand_mentions = 100`

---

## Will Limits Change if You Update Supabase?

### ✅ **YES - For Trackers (Already Works)**

If you update `max_trackers` in the `subscriptions` table:
1. The value is **read from the database** on every tracker creation request
2. Changes will be **immediately effective** (no code changes needed)
3. The next time a user tries to create a tracker, the new limit will be enforced

**Example**:
```sql
-- Increase a user's tracker limit to 20
UPDATE subscriptions 
SET max_trackers = 20 
WHERE user_email = 'user@example.com';
```
**Result**: User can now create up to 20 trackers (immediate effect)

---

### ⚠️ **For Mentions - Currently Doesn't Matter**

Since mentions aren't enforced, updating `max_brand_mentions` in the database:
- Will show the new limit in the usage API response
- Will **NOT** block new mentions (they're unlimited currently)

---

## What Happens When Limits Are Reached?

### **Trackers Limit** ✅

**When a user reaches the limit**:
1. API returns **403 Forbidden** error
2. Error message: `"Tracker limit reached. Your free plan allows 3 trackers."`
3. User cannot create new trackers until:
   - They delete an existing tracker (set `active = false` or delete)
   - You increase their `max_trackers` in the database
   - They upgrade to a higher plan

**User Experience**:
- Frontend should display the error message
- User must manage existing trackers (delete/pause) before creating new ones

---

### **Mentions Limit** ❌

**Current behavior**: Nothing happens - users can keep creating mentions indefinitely.

**If we implement enforcement** (see recommendations below):
- API should return **403 Forbidden** error
- Error message: `"Brand mention limit reached. Your free plan allows 50 mentions."`
- User would need to:
  - Delete old mentions
  - You increase their `max_brand_mentions`
  - Upgrade their plan

---

## Recommendations

### 1. **Implement Mention Limits** 🔴 **HIGH PRIORITY**

Add enforcement to `src/app/api/checkMention/route.ts`:

```typescript
// Before inserting the mention, check limits
const { data: subscription } = await supabaseAdmin
  .from("subscriptions")
  .select("max_brand_mentions, plan_type")
  .eq("user_email", user_email)
  .eq("status", "active")
  .maybeSingle();

const mentionLimit = subscription?.max_brand_mentions || 
  (subscription?.plan_type === 'pro' ? 100 : 50);

// Count current mentions
const { count: mentionCount } = await supabaseAdmin
  .from("brand_mentions")
  .select("*", { count: "exact", head: true })
  .eq("user_email", user_email);

// Enforce limit
if (mentionCount !== null && mentionCount >= mentionLimit) {
  return NextResponse.json({ 
    error: `Brand mention limit reached. Your ${subscription?.plan_type || 'free'} plan allows ${mentionLimit} mentions.`,
    limit: mentionLimit,
    current: mentionCount
  }, { status: 403 });
}

// Continue with mention creation...
```

---

### 2. **Consider Time-Based Limits** 💡

Instead of total mentions, you might want:
- **Monthly mention limit**: Reset each month
- **Daily mention limit**: For rate limiting
- **Ongoing storage**: Keep all mentions but limit API usage

---

### 3. **Add Limit Management UI** 💡

Create an admin interface to:
- View user limits
- Update limits for specific users
- See usage statistics
- Bulk update limits

---

## Testing Limits

### Test Tracker Limit:
```bash
# 1. Create 3 trackers (free plan limit)
# 2. Try to create a 4th tracker
# Expected: 403 error with message about limit
```

### Test Mention Limit (after implementation):
```bash
# 1. Create 50 mentions (free plan limit)
# 2. Try to create a 51st mention
# Expected: 403 error with message about limit
```

---

## Summary

| Feature | Limit Stored? | Limit Enforced? | Database Updates Work? |
|---------|--------------|-----------------|------------------------|
| **Max Trackers** | ✅ Yes | ✅ Yes | ✅ Yes - Immediate |
| **Max Mentions** | ✅ Yes | ❌ No | ❌ N/A (not enforced) |

**Key Takeaway**: 
- Tracker limits **work perfectly** and will update if you change them in Supabase
- Mention limits are **not enforced** - users can create unlimited mentions
- To enforce mention limits, we need to add the check to `checkMention/route.ts`

