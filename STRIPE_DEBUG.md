# 🔍 Stripe Debugging Guide

## Issues Found and Fixed

### 1. Price ID Has Quotes
**Problem**: Your `.env` file has:
```env
STRIPE_PRO_PRICE_ID="price_1SMX3B86tpt5LW4RSXNSgUkq"
```

**Should be** (without quotes):
```env
STRIPE_PRO_PRICE_ID=price_1SMX3B86tpt5LW4RSXNSgUkq
```

**Fix Applied**: Code now removes quotes automatically.

---

### 2. Missing NEXT_PUBLIC_APP_URL
Make sure you have this in `.env`:
```env
NEXT_PUBLIC_APP_URL=http://localhost:3002
```

---

## Current Environment Variables in .env

```env
✅ NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51S3pLq86tpt5LW4R...
✅ STRIPE_SECRET_KEY=sk_test_51S3pLq86tpt5LW4RsL0M98V1uvKvk...
✅ STRIPE_PRO_PRICE_ID="price_1SMX3B86tpt5LW4RSXNSgUkq" (has quotes - will be cleaned)
✅ STRIPE_WEBHOOK_SECRET=whsec_32eMA0WWRllQzBA6q7sXDQmbMwNOHZna
```

---

## Testing Steps

### 1. Check Environment Variables
```bash
# Restart dev server
npm run dev
```

### 2. Check Console Logs
Open browser console (F12) when you click "Upgrade to Pro":

**Should see**:
```
💳 Starting upgrade process for: your@email.com
💳 Using Price ID: price_1SMX3B86tpt5LW4RSXNSgUkq
💳 Creating Stripe checkout for: your@email.com
💳 Using Price ID: price_1SMX3B86tpt5LW4RSXNSgUkq
💳 App URL: http://localhost:3002
✅ Checkout session created: {...}
🔗 Redirecting to: https://checkout.stripe.com/...
```

**If you see errors**:
- `❌ No Stripe Price ID found` → Check `.env` file
- `❌ STRIPE_SECRET_KEY is not set` → Check `.env` file
- `❌ Checkout creation failed` → Check server logs

---

## Common Errors and Fixes

### Error: "No Stripe Price ID found"
**Cause**: Price ID not in environment
**Fix**: 
1. Check `.env` has `STRIPE_PRO_PRICE_ID`
2. Remove quotes: `STRIPE_PRO_PRICE_ID=price_...`
3. Restart server: `npm run dev`

### Error: "Invalid API Key"
**Cause**: Wrong Stripe key
**Fix**:
1. Go to Stripe Dashboard → Developers → API keys
2. Copy **Secret key** (starts with `sk_test_`)
3. Update `.env`: `STRIPE_SECRET_KEY=sk_test_...`
4. Restart server

### Error: "Invalid Price ID"
**Cause**: Price doesn't exist in Stripe
**Fix**:
1. Go to Stripe Dashboard → Products
2. Check Pro Plan product exists
3. Copy correct Price ID
4. Update `.env`: `STRIPE_PRO_PRICE_ID=price_...`
5. Restart server

### Error: "Redirect failed"
**Cause**: Missing app URL
**Fix**:
1. Add to `.env`: `NEXT_PUBLIC_APP_URL=http://localhost:3002`
2. Restart server

---

## Manual Testing

### 1. Test API Endpoint Directly

```bash
# Test create-checkout endpoint
curl -X POST http://localhost:3002/api/stripe/create-checkout \
  -H "Content-Type: application/json" \
  -d '{
    "priceId": "price_1SMX3B86tpt5LW4RSXNSgUkq",
    "user_email": "test@example.com"
  }'
```

**Expected Response**:
```json
{
  "sessionId": "cs_test_...",
  "url": "https://checkout.stripe.com/..."
}
```

### 2. Check Server Logs

Terminal should show:
```
💳 Creating Stripe checkout for: test@example.com
💳 Using Price ID: price_1SMX3B86tpt5LW4RSXNSgUkq
💳 App URL: http://localhost:3002
✅ Checkout session created: cs_test_...
```

---

## Updated Code Changes

### 1. `src/lib/stripe.ts`
- ✅ Now removes quotes from price ID automatically
- ✅ Logs price ID for debugging
- ✅ Shows error if price ID missing

### 2. `src/app/api/stripe/create-checkout/route.ts`
- ✅ Checks if secret key exists
- ✅ Logs price ID being used
- ✅ Logs app URL
- ✅ Better error messages

### 3. `src/components/pages/SettingsPage.tsx`
- ✅ Validates price ID before API call
- ✅ Shows alert if Stripe not configured
- ✅ Logs all steps for debugging
- ✅ Better error handling

---

## Complete .env File

Your `.env` should look like this (without quotes):

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# OpenAI
OPENAI_API_KEY=sk-proj-...

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxx
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxx
STRIPE_PRO_PRICE_ID=price_xxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx

# App
NEXT_PUBLIC_APP_URL=http://localhost:3002
```

**Note**: Remove the quotes around `STRIPE_PRO_PRICE_ID`

---

## Next Steps

1. **Update .env file** - Remove quotes from price ID
2. **Restart server** - `npm run dev`
3. **Clear browser cache** - Ctrl+Shift+R (or Cmd+Shift+R on Mac)
4. **Try upgrade again** - Go to Settings → Click "Upgrade to Pro"
5. **Check console logs** - Should see detailed logs
6. **Use test card**: `4242 4242 4242 4242`

---

## Still Having Issues?

Check these logs in order:

1. **Browser Console** (F12) - Frontend errors
2. **Terminal** (where `npm run dev` runs) - Backend errors  
3. **Stripe Dashboard** → Developers → Logs - Stripe API errors

Share the error messages and I'll help debug!

