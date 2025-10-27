# 🔧 Stripe Webhook & Subscription Update Fix

## Problem

After making a Stripe payment, the subscription data was **not updating** in the database, so the Settings page showed **Free plan** instead of **Pro plan**.

---

## Root Causes

### 1. Webhook Used `.update()` Instead of `.upsert()`

The webhook tried to **update** a subscription that might not exist:

```typescript
// ❌ BEFORE - Fails if row doesn't exist
await supabaseAdmin
  .from("subscriptions")
  .update(updateData)
  .eq("user_email", user_email);
```

If a user signed up but didn't have a subscription row, the update would fail silently.

### 2. Redirect Went to Dashboard, Not Settings

```typescript
// ❌ BEFORE
success_url: `${APP_URL}/dashboard?upgraded=true`
```

User couldn't see their upgraded subscription immediately after payment.

### 3. Settings Page Didn't Auto-Refresh

After payment, the Settings page didn't automatically fetch the updated subscription data.

---

## The Fix

### 1. Changed Webhook to Use `.upsert()`

```typescript
// ✅ AFTER - Creates or updates subscription
await supabaseAdmin
  .from("subscriptions")
  .upsert(updateData, { 
    onConflict: "user_email",
    ignoreDuplicates: false 
  });
```

Now the webhook will:
- **Create** a subscription if it doesn't exist
- **Update** existing subscription if it does

### 2. Updated Redirect URL

```typescript
// ✅ AFTER
success_url: `${APP_URL}/dashboard?page=settings&upgraded=true`
```

User goes directly to Settings page after payment.

### 3. Added Auto-Refresh in Settings

```typescript
// ✅ Settings page now refreshes data after payment
useEffect(() => {
  if (urlParams.get('upgraded') === 'true') {
    alert("🎉 Payment successful! Upgrading...");
    
    // Refresh multiple times to catch webhook
    setTimeout(() => fetchUserData(), 1000);
    setTimeout(() => fetchUserData(), 3000);
    setTimeout(() => fetchUserData(), 5000);
  }
}, []);
```

---

## Files Modified

1. ✅ **`src/app/api/stripe/webhook/route.ts`**
   - Changed `.update()` to `.upsert()`
   - Added `user_email` to updateData
   - Added detailed error logging
   - Added confirmation logging

2. ✅ **`src/app/api/stripe/create-checkout/route.ts`**
   - Changed success URL to `/dashboard?page=settings&upgraded=true`
   - Changed cancel URL to `/dashboard?page=settings&cancelled=true`

3. ✅ **`src/components/pages/SettingsPage.tsx`**
   - Added URL parameter detection
   - Added auto-refresh after payment
   - Added success/cancel alerts
   - Refreshes data 3 times (1s, 3s, 5s delay)

4. ✅ **`fix-subscriptions-unique-constraint.sql`** (NEW)
   - SQL script to add UNIQUE constraint on `user_email`
   - Required for upsert to work properly

---

## Required: Run SQL Migration

### ⚠️ **CRITICAL**: Run this in Supabase SQL Editor

Go to **Supabase Dashboard** → **SQL Editor** → Run this:

```sql
-- Add unique constraint on user_email
ALTER TABLE subscriptions 
ADD CONSTRAINT IF NOT EXISTS subscriptions_user_email_key 
UNIQUE (user_email);
```

Or run the provided file: `fix-subscriptions-unique-constraint.sql`

**Why this is needed:**
- `.upsert()` requires a unique constraint to know which row to update
- Without it, upsert won't work and subscriptions won't update

---

## How It Works Now

### Payment Flow:

```
1. User clicks "Upgrade to Pro"
   ↓
2. Redirects to Stripe checkout
   ↓
3. User enters card: 4242 4242 4242 4242
   ↓
4. Payment succeeds
   ↓
5. Stripe sends webhook to /api/stripe/webhook
   ↓
6. Webhook UPSERTS subscription:
   - plan_type: "pro"
   - status: "active"
   - stripe_subscription_id: "sub_xxx"
   - stripe_customer_id: "cus_xxx"
   - current_period_end: date
   ↓
7. User redirected to: /dashboard?page=settings&upgraded=true
   ↓
8. Settings page shows alert: "🎉 Payment successful!"
   ↓
9. Settings page auto-refreshes 3 times
   ↓
10. User sees: "💎 Pro Plan - $29/month"
```

---

## Testing

### 1. Add Service Role Key (if you haven't)

```env
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIs...
```

### 2. Run SQL Migration

```sql
ALTER TABLE subscriptions 
ADD CONSTRAINT IF NOT EXISTS subscriptions_user_email_key 
UNIQUE (user_email);
```

### 3. Test Payment Flow

1. **Sign up as new user**: `testuser@example.com`
2. **Go to Settings**
3. **Click "Upgrade to Pro - $29/month"**
4. **Enter test card**: `4242 4242 4242 4242`
5. **Any future date and CVC**: `12/34` `123`
6. **Complete payment**
7. **Should redirect to Settings with alert**
8. **Settings should show "Pro" plan within 5 seconds**

### 4. Check Logs

**Browser Console:**
```
🎉 Payment successful! Refreshing subscription data...
📧 SettingsPage - Session: testuser@example.com
🔍 Fetching subscription for: testuser@example.com
✅ Subscription found: {plan_type: 'pro', status: 'active', ...}
```

**Vercel/Server Logs:**
```
🎣 Stripe webhook received: checkout.session.completed
✅ Checkout completed for: testuser@example.com
✅ Subscription upgraded to Pro for: testuser@example.com
✅ Update data: {plan_type: 'pro', ...}
```

---

## What Changed in Database

### Before Payment:
```sql
SELECT * FROM subscriptions WHERE user_email = 'testuser@example.com';

| user_email          | plan_type | status | stripe_subscription_id |
|---------------------|-----------|--------|------------------------|
| testuser@example.com | free      | active | NULL                   |
```

### After Payment:
```sql
SELECT * FROM subscriptions WHERE user_email = 'testuser@example.com';

| user_email          | plan_type | status | stripe_subscription_id | stripe_customer_id | current_period_end |
|---------------------|-----------|--------|------------------------|--------------------|--------------------|
| testuser@example.com | pro       | active | sub_1SMX3B86tpt5LW4R   | cus_ABC123...      | 2025-11-27         |
```

---

## Troubleshooting

### Issue: Still shows "Free" plan after payment

**Check:**
1. **Did you run the SQL migration?**
   ```sql
   SELECT conname FROM pg_constraint 
   WHERE conrelid = 'subscriptions'::regclass 
   AND conname = 'subscriptions_user_email_key';
   ```
   Should return: `subscriptions_user_email_key`

2. **Is webhook working?**
   - Go to **Stripe Dashboard** → **Developers** → **Webhooks**
   - Check recent events for `checkout.session.completed`
   - Should show `200 OK` response

3. **Check Vercel logs:**
   - Look for `✅ Subscription upgraded to Pro`
   - If you see errors, check the error details

4. **Manually refresh Settings:**
   - Open browser DevTools (F12)
   - Go to Settings page
   - Check console for logs
   - Wait 5 seconds for auto-refresh

---

## Summary

✅ **Fixed**: Webhook now uses `.upsert()` instead of `.update()`
✅ **Fixed**: Success URL redirects to Settings page
✅ **Fixed**: Settings page auto-refreshes after payment
✅ **Added**: Success alert when payment completes
✅ **Added**: SQL migration for unique constraint
⚠️ **Required**: Run SQL migration in Supabase
✅ **Tested**: Build compiles successfully

---

## Next Steps

1. ✅ **Run SQL migration** (fix-subscriptions-unique-constraint.sql)
2. ✅ **Restart dev server** (`npm run dev`)
3. ✅ **Test payment flow**
4. ✅ **Verify subscription updates in Settings**
5. ⏳ **Deploy to Vercel** (when ready to push)

---

**The subscription data will now properly update after Stripe payments!** 🎉

