# 🔧 Fix: "No such price" Stripe Error

## Problem
Error: `No such price: 'price_1SMX3B86tpt5LW4RSXNSgUkq'`

This happens when the **Stripe price ID** in your environment variables doesn't match your Stripe account mode (test/live) or doesn't exist.

---

## 🔍 Quick Diagnosis

### Check Your Current Setup

1. **Check your Stripe secret key**:
   - Go to Vercel → Settings → Environment Variables
   - Look at `STRIPE_SECRET_KEY`
   - Does it start with `sk_test_` (test) or `sk_live_` (live)?

2. **Check your price ID**:
   - Look at `STRIPE_PRO_PRICE_ID`
   - Current: `price_1SMX3B86tpt5LW4RSXNSgUkq`

3. **The issue**: Your price ID is from **test mode**, but you might be using **live keys** (or vice versa).

---

## ✅ Solution

### Option 1: Using Test Mode (Recommended for Development)

If you want to use **test mode**:

1. **Go to Stripe Dashboard** → Toggle to **"Test mode"** (top right)

2. **Create/Find your Pro Plan Product**:
   - Go to **Products** → Click your "Pro Plan" product (or create new)
   - Set price: **$19/month** recurring
   - **Copy the Price ID** (starts with `price_...`)

3. **Update Vercel Environment Variables**:
   - Go to Vercel → Your Project → **Settings** → **Environment Variables**
   - Update `STRIPE_SECRET_KEY` to test key: `sk_test_...`
   - Update `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` to test key: `pk_test_...`
   - Update `STRIPE_PRO_PRICE_ID` to the **test mode price ID** (from step 2)
   - Update `STRIPE_WEBHOOK_SECRET` to **test mode webhook secret**
   - Make sure **Environment** is set to **Production**
   - Click **Save**

4. **Redeploy**:
   - Go to **Deployments** tab
   - Click **"..."** on latest deployment → **Redeploy**

---

### Option 2: Using Live Mode (For Production)

If you want to use **live mode** (real payments):

1. **Go to Stripe Dashboard** → Toggle to **"Live mode"** (top right)

2. **Verify your Stripe account**:
   - Complete all verification steps
   - Add business information

3. **Create Pro Plan Product in Live Mode**:
   - Go to **Products** → **Add Product**
   - Name: **Pro Plan**
   - Description: 10 brand trackers, hourly checks, advanced analytics, team collaboration
   - Price: **$19.00 USD**
   - Billing: **Monthly recurring**
   - Click **Save Product**
   - **Copy the LIVE Price ID** (starts with `price_...`)

4. **Create Live Webhook**:
   - Go to **Developers** → **Webhooks** → **Add endpoint**
   - URL: `https://www.kommi.in/api/stripe/webhook`
   - Select events:
     - `checkout.session.completed`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `invoice.payment_succeeded`
     - `invoice.payment_failed`
   - **Copy the Signing secret** (`whsec_...`)

5. **Update Vercel Environment Variables**:
   - Go to Vercel → Your Project → **Settings** → **Environment Variables**
   - Update `STRIPE_SECRET_KEY` to live key: `sk_live_...`
   - Update `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` to live key: `pk_live_...`
   - Update `STRIPE_PRO_PRICE_ID` to the **live price ID** (from step 3)
   - Update `STRIPE_WEBHOOK_SECRET` to **live webhook secret** (from step 4)
   - Make sure **Environment** is set to **Production**
   - Click **Save**

6. **Redeploy**:
   - Go to **Deployments** tab
   - Click **"..."** on latest deployment → **Redeploy**

---

## 📋 Checklist

- [ ] Identified which mode you're using (test or live)
- [ ] Created/found the Pro Plan product in that mode
- [ ] Copied the correct Price ID
- [ ] Updated all Stripe environment variables in Vercel
- [ ] Verified webhook secret matches the mode
- [ ] Redeployed the application
- [能够让] Tested the upgrade flow again

---

## 🔍 How to Find Your Price ID

1. **Stripe Dashboard** → **Products**
2. Click on your **"Pro Plan"** product
3. Under **Pricing**, you'll see the price
4. Click the **three dots** (**...**) next to the price
5. Select **"Copy price ID"**
6. The price ID looks like: `price_1AbC2dEf3GhIjKlMnOpQrSt`

---

## ⚠️ Important Notes

- **Test mode prices** only work with **test keys** (`sk_test_`, `pk_test_`)
- **Live mode prices** only work with **live keys** (`sk_live_`, `pk_live_`)
- Price IDs are **unique to each mode** - you cannot use a test price ID with live keys
- Always **redeploy** after changing environment variables

---

## 🆘 Still Having Issues?

1. **Double-check the Price ID**:
   - Go to Stripe Dashboard
   - Verify the price exists and is active
   - Copy the price ID again

2. **Verify Environment Variables**:
   - Check Vercel logs to see which keys are being used
   - Make sure there are no typos or extra spaces

3. **Check Vercel Deployment Logs**:
   - Go to Vercel → **Deployments** → Click on deployment
   - Check **Functions** → **Logs** tab for any errors

4. **Test in Stripe Dashboard**:
   - Try creating a test checkout session directly in Stripe Dashboard
   - If it works there, the issue is with environment variables

---

## 📚 Related Documentation

- See `STRIPE_LIVE_KEYS_SETUP.md` for complete live mode setup
- See `STRIPE_SETUP.md` for general Stripe configuration

