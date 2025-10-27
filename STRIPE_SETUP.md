# 💳 Stripe Integration Setup Guide

Complete Stripe integration for Pro and Free plan subscriptions.

---

## ✅ What's Implemented

### Features
- ✅ Free Plan ($0 - 5 trackers)
- ✅ Pro Plan ($29/month - Unlimited trackers)
- ✅ Stripe Checkout for upgrades
- ✅ Stripe Customer Portal for subscription management
- ✅ Webhook handling for subscription events
- ✅ Automatic plan upgrades/downgrades
- ✅ Payment processing
- ✅ Subscription cancellation

---

## 🚀 Setup Instructions

### 1. Create Stripe Account

1. Go to [stripe.com](https://stripe.com)
2. Sign up for an account
3. Complete verification

### 2. Get Your API Keys

1. Go to Stripe Dashboard → **Developers** → **API keys**
2. Copy your keys:
   - **Publishable key** (starts with `pk_test_...` or `pk_live_...`)
   - **Secret key** (starts with `sk_test_...` or `sk_live_...`)

### 3. Create Product & Pricing

#### Create Pro Plan Product

1. Go to **Products** → **Add Product**
2. Fill in:
   - **Name**: Pro Plan
   - **Description**: Unlimited trackers, hourly checks, advanced analytics
   - **Pricing**: $29.00 USD
   - **Billing period**: Monthly
   - **Recurring**
3. Click **Save Product**
4. Copy the **Price ID** (starts with `price_...`)

### 4. Set Up Webhook

1. Go to **Developers** → **Webhooks**
2. Click **Add endpoint**
3. Set **Endpoint URL**: `https://your-domain.vercel.app/api/stripe/webhook`
4. Select events to listen to:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Click **Add endpoint**
6. Copy the **Signing secret** (starts with `whsec_...`)

### 5. Configure Environment Variables

Add these to your `.env` file:

```env
# Stripe Keys
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Stripe Price ID
STRIPE_PRO_PRICE_ID=price_...

# App URL
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
```

### 6. Deploy & Test

1. **Deploy to Vercel**:
   ```bash
   git push origin main
   ```

2. **Add Environment Variables** in Vercel:
   - Go to Project Settings → Environment Variables
   - Add all Stripe variables
   - Redeploy

3. **Test the Flow**:
   - Sign up for a free account
   - Go to Settings
   - Click "Upgrade to Pro"
   - Use Stripe test card: `4242 4242 4242 4242`
   - Any future date, any CVC

---

## 📋 How It Works

### User Journey

#### Free Plan (Default)
```
1. User signs up
2. Free subscription created automatically
   - plan_type: 'free'
   - max_trackers: 5
   - status: 'active'
```

#### Upgrade to Pro
```
1. User clicks "Upgrade to Pro" in Settings
2. Stripe Checkout session created
3. User enters payment details
4. Payment processed by Stripe
5. Webhook received: checkout.session.completed
6. Database updated:
   - plan_type: 'pro'
   - max_trackers: 999999
   - stripe_subscription_id: sub_...
   - current_period_end: date
7. User redirected to dashboard
```

#### Manage Subscription
```
1. User clicks "Manage Subscription"
2. Stripe Customer Portal opened
3. User can:
   - Update payment method
   - View invoices
   - Cancel subscription
```

#### Cancellation
```
1. User cancels via Customer Portal
2. Subscription continues until period end
3. Webhook received: customer.subscription.deleted
4. Database updated:
   - plan_type: 'free'
   - max_trackers: 5
   - status: 'cancelled'
   - stripe_subscription_id: null
```

---

## 🎯 API Endpoints

### `/api/stripe/create-checkout` (POST)
Creates Stripe Checkout session for upgrades.

**Request**:
```json
{
  "priceId": "price_...",
  "user_email": "user@example.com"
}
```

**Response**:
```json
{
  "sessionId": "cs_test_...",
  "url": "https://checkout.stripe.com/..."
}
```

### `/api/stripe/webhook` (POST)
Handles Stripe webhook events.

**Events Handled**:
- `checkout.session.completed` - Upgrade to Pro
- `customer.subscription.updated` - Subscription changes
- `customer.subscription.deleted` - Downgrade to Free
- `invoice.payment_succeeded` - Payment success
- `invoice.payment_failed` - Payment failure

### `/api/stripe/create-portal` (POST)
Creates Stripe Customer Portal session.

**Request**:
```json
{
  "user_email": "user@example.com"
}
```

**Response**:
```json
{
  "url": "https://billing.stripe.com/..."
}
```

---

## 🔍 Testing

### Test Credit Cards

Use these test cards in **test mode**:

**Success**:
- Card: `4242 4242 4242 4242`
- Exp: Any future date
- CVC: Any 3 digits
- ZIP: Any 5 digits

**Decline**:
- Card: `4000 0000 0000 0002`

**Requires Authentication**:
- Card: `4000 0025 0000 3155`

### Test Webhooks Locally

1. Install Stripe CLI:
   ```bash
   brew install stripe/stripe-cli/stripe
   ```

2. Login to Stripe:
   ```bash
   stripe login
   ```

3. Forward webhooks to local:
   ```bash
   stripe listen --forward-to localhost:3002/api/stripe/webhook
   ```

4. Copy the webhook secret shown
5. Update `.env`:
   ```env
   STRIPE_WEBHOOK_SECRET=whsec_...
   ```

6. Trigger test events:
   ```bash
   stripe trigger checkout.session.completed
   ```

---

## 📊 Database Schema

### subscriptions table

```sql
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY,
  user_email TEXT NOT NULL UNIQUE,
  plan_type TEXT CHECK (plan_type IN ('free', 'pro', 'enterprise')),
  status TEXT CHECK (status IN ('active', 'cancelled', 'expired')),
  max_trackers INTEGER DEFAULT 5,
  stripe_subscription_id TEXT,
  current_period_start TIMESTAMP,
  current_period_end TIMESTAMP,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

### Plan Limits

| Plan | Max Trackers | Price | Stripe Price ID |
|------|--------------|-------|-----------------|
| Free | 5 | $0 | - |
| Pro | Unlimited | $29/month | `price_...` |
| Enterprise | Custom | Custom | Custom |

---

## 🐛 Troubleshooting

### "No Price ID found"
- Check `.env` has `STRIPE_PRO_PRICE_ID`
- Verify price ID starts with `price_`
- Redeploy after adding env vars

### "Webhook signature verification failed"
- Check `STRIPE_WEBHOOK_SECRET` in `.env`
- Verify webhook endpoint URL is correct
- Check webhook is set to the correct API version

### "Subscription not updating"
- Check webhook events are being received
- Look at Stripe Dashboard → Developers → Webhooks → Logs
- Check server logs for webhook errors

### "Redirect not working"
- Check `NEXT_PUBLIC_APP_URL` is set correctly
- Verify success/cancel URLs in checkout session
- Check browser console for errors

---

## 🔐 Security Best Practices

1. **Never expose secret keys**
   - Only use `NEXT_PUBLIC_*` for publishable keys
   - Keep `STRIPE_SECRET_KEY` server-side only

2. **Verify webhook signatures**
   - Always verify `stripe-signature` header
   - Use `stripe.webhooks.constructEvent()`

3. **Validate user ownership**
   - Check `user_email` matches session
   - Verify subscription belongs to user

4. **Use HTTPS in production**
   - Stripe requires HTTPS for webhooks
   - Development can use HTTP with Stripe CLI

5. **Test in test mode first**
   - Use test keys for development
   - Switch to live keys only in production

---

## 🎉 You're All Set!

Your Stripe integration is complete! Users can now:

✅ Sign up for free (5 trackers)  
✅ Upgrade to Pro ($29/month - unlimited trackers)  
✅ Manage their subscription  
✅ Update payment methods  
✅ Cancel anytime  

**Next steps**:
1. Set up your Stripe account
2. Create the Pro plan product
3. Configure webhooks
4. Add environment variables
5. Deploy and test!

---

## 📞 Support

- [Stripe Documentation](https://stripe.com/docs)
- [Stripe Testing](https://stripe.com/docs/testing)
- [Stripe Webhooks Guide](https://stripe.com/docs/webhooks)
- [Stripe Dashboard](https://dashboard.stripe.com)

