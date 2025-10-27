# 🚨 Fix: Vercel Blocking Stripe Webhooks (401 Unauthorized)

## The Problem

Stripe webhooks are failing with **401 Unauthorized** error:

```
401 ERR: Unauthorized
https://main-llm-fractionel.vercel.app/api/stripe/webhook
```

**Why?** Vercel's **Deployment Protection** is blocking Stripe webhooks because they can't authenticate.

---

## The Solution

You need to **disable authentication** for the webhook endpoint so Stripe can access it.

### Option 1: Disable Deployment Protection for Webhook (Recommended)

1. **Go to Vercel Dashboard**:
   - Open your project: `llm-brand-tracker-saas`
   - Click **Settings** → **Deployment Protection**

2. **Add Bypass for Webhook**:
   - Find **"Protection Bypass for Automation"**
   - Click **"Add"** or **"Manage"**
   - Add this path: `/api/stripe/webhook`
   - Click **Save**

3. **Alternative: Disable Protection Completely** (easier but less secure):
   - Go to **Settings** → **Deployment Protection**
   - Set to **"Off"** or **"Only Production"**
   - Click **Save**

### Option 2: Use Vercel's Secret Bypass Token

If you want to keep protection enabled:

1. **Get Bypass Token**:
   - Vercel Dashboard → **Settings** → **Deployment Protection**
   - Copy the **"Protection Bypass for Automation"** secret

2. **Update Stripe Webhook URL**:
   - Go to Stripe Dashboard → **Developers** → **Webhooks**
   - Edit your webhook endpoint
   - Change URL to:
     ```
     https://main-llm-fractionel.vercel.app/api/stripe/webhook?x-vercel-protection-bypass=YOUR_SECRET_TOKEN
     ```
   - Click **Update**

---

## Files Already Updated (Ready to Push)

1. ✅ **`vercel.json`** (NEW)
   - Configures CORS headers for webhook
   
2. ✅ **`src/app/api/stripe/webhook/route.ts`**
   - Added `export const dynamic = 'force-dynamic'`
   - Added `export const runtime = 'nodejs'`
   - Ensures webhook runs in Node.js environment

---

## How to Test

### 1. Deploy Changes

Push to GitHub (will auto-deploy to Vercel):

```bash
git add -A
git commit -m "fix: Allow Stripe webhooks through Vercel protection"
git push origin main
```

### 2. Wait for Deployment

- Go to Vercel Dashboard
- Wait for deployment to complete (green checkmark)

### 3. Test Webhook in Stripe

**Option A: Use Stripe CLI (Local)**
```bash
stripe trigger payment_intent.succeeded
```

**Option B: Test from Stripe Dashboard**
1. Go to **Stripe Dashboard** → **Developers** → **Webhooks**
2. Click your webhook endpoint
3. Click **"Send test webhook"**
4. Select `checkout.session.completed`
5. Click **Send test webhook**

**Expected Result:**
```
✅ 200 OK
Response: {"received":true}
```

### 4. Make a Real Payment

1. Go to your app: Settings page
2. Click "Upgrade to Pro"
3. Use test card: `4242 4242 4242 4242`
4. Complete payment

**Check Stripe Dashboard:**
- **Developers** → **Webhooks**
- Should show `✅ 200 OK` for `checkout.session.completed`

---

## Verification Checklist

After deploying, verify:

- [ ] Webhook endpoint accessible without auth
- [ ] Stripe webhook shows `200 OK` instead of `401`
- [ ] Test payment updates subscription in database
- [ ] Settings page shows "Pro" plan after payment

---

## Common Issues

### Still Getting 401 After Deploy?

1. **Clear Vercel Cache**:
   - Vercel Dashboard → **Deployments**
   - Click **"Redeploy"** on latest deployment
   - Check **"Use existing build cache"** to OFF
   - Click **Redeploy**

2. **Check Deployment Protection is OFF**:
   - Vercel Dashboard → **Settings** → **Deployment Protection**
   - Should be **Off** or have `/api/stripe/webhook` in bypass list

3. **Verify Environment Variables**:
   - Vercel Dashboard → **Settings** → **Environment Variables**
   - Check `STRIPE_WEBHOOK_SECRET` exists
   - Check `SUPABASE_SERVICE_ROLE_KEY` exists

### Webhook Signature Verification Failing?

Make sure `STRIPE_WEBHOOK_SECRET` in Vercel matches the one in Stripe:

1. **Stripe Dashboard** → **Developers** → **Webhooks**
2. Click your webhook
3. Click **"Reveal secret"**
4. Copy the `whsec_...` value
5. Update in **Vercel** → **Settings** → **Environment Variables**
6. Redeploy

---

## Security Note

⚠️ **Webhook signature verification still protects you!**

Even though we're removing Vercel auth, the webhook validates the `stripe-signature` header, so only Stripe can call this endpoint.

```typescript
// This ensures only Stripe can send valid requests
event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
```

---

## Next Steps

1. ✅ **Push changes to GitHub** (I have them ready)
2. ✅ **Disable Vercel Deployment Protection** (or add bypass)
3. ✅ **Wait for Vercel deployment**
4. ✅ **Test webhook from Stripe Dashboard**
5. ✅ **Test real payment flow**

---

**After you disable Vercel protection, the webhooks will work!** 🎉

