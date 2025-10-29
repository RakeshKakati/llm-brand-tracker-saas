# 💳 Stripe Live Keys Setup Guide

Complete guide to switch from Stripe test keys to live (production) keys.

---

## 🔴 IMPORTANT: Before Switching to Live Keys

1. **Test thoroughly in test mode first** - Make sure everything works with test keys
2. **You'll charge real money** - Live keys process real payments
3. **Webhook URL must be production** - Update webhook endpoint to your production domain
4. **Update all environments** - Local `.env`, Vercel production, and any other environments

---

## 📋 Step-by-Step Instructions

### 1. Get Live Stripe Keys

1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Toggle **"Test mode"** to **"Live mode"** (top right corner)
3. Go to **Developers** → **API keys**
4. Copy your **live keys**:
   - **Publishable key** (starts with `pk_live_...`)
   - **Secret key** (starts with `sk_live_...`)

   ⚠️ **Warning**: Keep your secret key safe! Never commit it to git.

---

### 2. Create Live Product & Price (if not already created)

1. In **Live mode**, go to **Products** → **Add Product**
2. Fill in:
   - **Name**: Pro Plan
   - **Description**: 10 brand trackers, hourly checks, advanced analytics, team collaboration
   - **Pricing**: $19.00 USD (or your desired price)
   - **Billing period**: Monthly
   - **Recurring**: Yes
3. Click **Save Product**
4. Copy the **Live Price ID** (starts with `price_...`)

---

### 3. Set Up Live Webhook Endpoint

1. In **Live mode**, go to **Developers** → **Webhooks**
2. Click **Add endpoint**
3. Set **Endpoint URL**: `https://your-production-domain.vercel.app/api/stripe/webhook`
   - Replace `your-production-domain.vercel.app` with your actual Vercel domain
4. Select events to listen to:
   - ✅ `checkout.session.completed`
   - ✅ `customer.subscription.updated`
   - ✅ `customer.subscription.deleted`
   - ✅ `invoice.payment_succeeded`
   - ✅ `invoice.payment_failed`
5. Click **Add endpoint**
6. Copy the **Signing secret** (starts with `whsec_...`)

---

### 4. Update Environment Variables

#### For Local Development (`.env` file)

Update your `.env` file with live keys:

```env
# Stripe Live Keys
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Stripe Live Price ID
STRIPE_PRO_PRICE_ID=price_...

# App URL (production domain)
NEXT_PUBLIC_APP_URL=https://your-production-domain.vercel.app
```

**Important**: Replace all `pk_test_` with `pk_live_`, `sk_test_` with `sk_live_`, and update the price ID to your live price ID.

---

队伍

#### For Vercel Production

1. Go to your project on [Vercel](https://vercel.com)
2. Click **Settings** → **Environment Variables**
3. For each Stripe variable:
   - Click on the existing variable (or create new if missing)
   - Update the value to the **live** version:
     - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` → `pk_live_...`
     - `STRIPE_SECRET_KEY` → `sk_live_...`
     - `STRIPE_WEBHOOK_SECRET` → `whsec_...` (new live webhook secret)
     - `STRIPE_PRO_PRICE_ID` → `price_...` (live price ID)
     - `NEXT_PUBLIC_APP_URL` → `https://your-production-domain.vercel.app`
4. Make sure **Environment** is set to **Production**
5. Click **Save**
6. **Redeploy** your application after updating variables

---

### 5. Verify Configuration

#### Check Environment Variables

Create a test API route to verify (remove after testing):

```typescript
// src/app/api/test-stripe-config/route.ts
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    publishable_key_set: !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    publishable_key_preview: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.substring(0, 12) + "...",
    secret_key_set: !!process.env.STRIPE_SECRET_KEY,
    secret_key_preview: process.env.STRIPE_SECRET_KEY?.substring(0, 12) + "...",
    webhook_secret_set: !!process.env.STRIPE_WEBHOOK_SECRET,
    price_id: process.env.STRIPE_PRO_PRICE_ID,
    app_url: process.env.NEXT_PUBLIC_APP_URL,
    is_live_mode: process.env.STRIPE_SECRET_KEY?.startsWith("sk_live_"),
  });
}
```

Visit: `https://your-domain.vercel.app/api/test-stripe-config`

**Expected output**:
```json
{
  "publishable_key_set": true,
  "publishable_key_preview": "pk_live_...",
  "secret_key_set": true,
  "secret_key_preview": "sk_live_...",
  "webhook_secret_set": true,
  "price_id": "price_...",
  "app_url": "https://your-domain.vercel.app",
  "is_live_mode": true
}
```

---

### 6. Test Live Integration

⚠️ **Warning**: These tests will charge real money!

1. **Test Checkout Flow**:
   - Go to Settings → Upgrade to Pro
   - Use a **real credit card** (or Stripe test card: `4242 4242 4242 4242` won't work in live mode)
   - Complete the payment
   - Verify redirect to dashboard

2. **Test Webhook**:
   - Go to Stripe Dashboard → **Developers** → **Webhooks**
   - Click on your webhook endpoint
   - Check **Recent events** tab
   - You should see `checkout.session.completed` events appearing

3. **Test Subscription Management**:
   - Go to Settings → Manage Subscription
   - Verify you can access the customer portal
   - Check that subscription details are correct

---

## 🔍 Troubleshooting

### Webhook Not Receiving Events

**Symptoms**: Subscriptions not updating in database after payment

**Fix**:
1. Check webhook URL is correct: `https://your-domain.vercel.app/api/stripe/webhook`
2. Verify webhook secret matches: `STRIPE_WEBHOOK_SECRET` in environment
3. Check Vercel logs: **Deployments** → **Functions** → **Logs**
4. Test webhook endpoint manually in Stripe Dashboard → **Send test webhook**

### "Invalid API Key" Error

**Symptoms**: Payments failing or API calls returning 401

**Fix**:
1. Verify keys start with `pk_live_` and `sk_live_` (not `pk_test_` or `sk_test_`)
2. Check keys are copied correctly (no extra spaces)
3. Restart your server after updating `.env`
4. Redeploy on Vercel after updating environment variables

### Price ID Not Found

**Symptoms**: Checkout fails with "Price ID not found"

**Fix**:
1. Verify `STRIPE_PRO_PRICE_ID` matches your **live** price ID
2. Check price ID doesn't have quotes: `STRIPE_PRO_PRICE_ID=price_...` (not `"price_..."`)
3. Ensure price is for the **live** product, not test product

래스

## ✅ Checklist

Before going live, verify:

- [ ] Stripe account is fully verified
- [ ] All environment variables updated with live keys
- [ ] Webhook endpoint created for production domain
- [ ] Webhook events selected correctly
- [ ] Live Price ID created and copied
- [ ] `NEXT_PUBLIC_APP_URL` set to production domain
- [ ] Vercel environment variables updated
- [ ] Application redeployed after updating variables
- [ ] Tested checkout flow with real card (small amount)
- [ ] Verified webhook receives events
- [ ] Tested subscription management portal
- [ ] Removed test configuration API routes (if created)

---

## 🔐 Security Best Practices

1. **Never commit `.env` files** - Already in `.gitignore`, double-check
2. **Rotate keys if exposed** - If keys are ever exposed, rotate them in Stripe Dashboard
3. **Use environment-specific keys** - Keep test keys for development, live keys for production
4. **Monitor Stripe Dashboard** - Regularly check for failed payments or suspicious activity
5. **Enable webhook signing** - Always verify webhook signatures (already implemented)

---

## 📚 Additional Resources

- [Stripe Dashboard](https://dashboard.stripe.com)
- [Stripe API Reference](https://stripe.com/docs/api)
- [Stripe Webhooks Guide](https://stripe.com/docs/webhooks)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)

---

## 🆘 Support

If you encounter issues:
1. Check Stripe Dashboard → **Developers** → **Logs** for API errors
2. Check Vercel → **Deployments** → **Functions** → **Logs** for server errors
3. Verify all environment variables are set correctly
4. Test webhook endpoint manually in Stripe Dashboard

