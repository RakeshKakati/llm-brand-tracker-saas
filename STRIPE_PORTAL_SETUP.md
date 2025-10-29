# 🔧 Stripe Customer Portal Setup

## Problem

When clicking "Manage Billing" button, you see this error:

```json
{
  "error": {
    "message": "No configuration provided and your test mode default configuration has not been created..."
  }
}
```

This happens because the Stripe Customer Portal needs to be configured in the Stripe Dashboard first.

---

## ✅ Solution: Configure Customer Portal in Stripe

### Step 1: Go to Stripe Dashboard

1. Go to [https://dashboard.stripe.com](https://dashboard.stripe.com)
2. Make sure you're in **Test Mode** (toggle in top right)
3. Go to **Settings** → **Billing** → **Customer portal**

   Or direct link: [https://dashboard.stripe.com/test/settings/billing/portal](https://dashboard.stripe.com/test/settings/billing/portal)

### Step 2: Configure Portal Settings

#### Basic Settings

1. **Business information** (optional but recommended):
   - Customer support email: Your email
   - Support phone: Your phone number
   - Support website: Your website URL

2. **Features to enable**:
   - ✅ **Update payment methods** - Let customers add/edit cards
   - ✅ **Cancel subscriptions** - Allow self-service cancellation
   - ✅ **Switch plans** - Let customers upgrade/downgrade
   - ✅ **View invoices** - Show billing history

#### Cancellation Settings

**"What should happen when a customer cancels?"**

Choose one:

**Option A: Continue until end of billing period** (Recommended)
- Customer keeps access until period ends
- Better for user experience
- Billing: Subscription cancelled at period end

**Option B: Cancel immediately**
- Immediate cancellation
- Customer loses access right away
- Billing: Charges prorated

#### Confirmation Email

- ✅ Send email when subscription is cancelled
- ✅ Send email when subscription is updated

### Step 3: Save Configuration

1. Click **Save** button at bottom of page
2. Wait for confirmation message
3. Configuration is now active

---

## 🧪 Testing the Portal

### Test the "Manage Billing" Button

1. **Upgrade to Pro** (if not already):
   - Go to Settings page
   - Click "Upgrade to Pro"
   - Use test card: `4242 4242 4242 4242`
   - Complete payment

2. **Test Manage Billing**:
   - Go to Settings page
   - Click "Manage Billing" button
   - Should open Stripe Customer Portal
   - You should see:
     - Payment methods
     - Subscription details
     - Invoice history
     - Cancel subscription option

### Test Cancellation Flow

1. In Customer Portal, click "Cancel subscription"
2. Confirm cancellation
3. Should see confirmation message
4. Return to your app
5. Wait for webhook to process (a few seconds)
6. Refresh Settings page
7. Should show "Cancelled" status with end date

---

## 🐛 Troubleshooting

### Error: "No configuration found"

**Solution**: Make sure you saved the portal configuration in Test Mode

1. Go to: [https://dashboard.stripe.com/test/settings/billing/portal](https://dashboard.stripe.com/test/settings/billing/portal)
2. Click "Save" even if you didn't change anything
3. Wait for confirmation
4. Try again

### Error: "Invalid customer"

**Cause**: User doesn't have an active Stripe subscription

**Solution**: 
- Make sure user has upgraded to Pro
- Check `subscriptions` table has `stripe_subscription_id`
- Verify it's not expired or cancelled

### Portal opens but shows error

**Cause**: Missing customer information

**Solution**:
- Check Stripe Dashboard → Customers
- Verify customer has email address
- Make sure customer is linked to subscription

---

## 📋 Quick Checklist

- [ ] Logged into Stripe Dashboard
- [ ] Switched to Test Mode
- [ ] Opened Customer Portal settings
- [ ] Configured business information
- [ ] Enabled features (cancellation, invoices, etc.)
- [ ] Saved configuration
- [ ] Tested with upgrade flow
- [ ] Tested "Manage Billing" button
- [ ] Verified portal opens successfully
- [ ] Tested cancellation flow

---

## 🚀 Production Setup

When ready for production:

1. Switch to **Live Mode** in Stripe
2. Go to [https://dashboard.stripe.com/settings/billing/portal](https://dashboard.stripe.com/settings/billing/portal)
3. Repeat the configuration steps above
4. Save configuration
5. Test with real payment (small amount)

**Important**: The portal configuration is separate for Test Mode and Live Mode. Configure both!

---

## 📚 Additional Resources

- [Stripe Customer Portal Docs](https://stripe.com/docs/billing/subscriptions/integrating-customer-portal)
- [Portal Configuration Guide](https://stripe.com/docs/billing/subscriptions/customer-portal)
- [API Reference](https://stripe.com/docs/api/customer_portal)

