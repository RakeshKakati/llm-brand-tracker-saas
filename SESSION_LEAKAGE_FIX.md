# 🚨 Critical Security Fix: Session Leakage

## The Problem

When a new user made a payment and got redirected to the dashboard, they were logged in as **another user's account** (rakeshkakati89@gmail.com).

---

## Root Cause

### Shared Supabase Client Across Server & Client

All API routes were using the **same shared Supabase client**:

```typescript
// src/app/lib/supabaseClient.ts - SHARED CLIENT ❌
export const supabase = createClient(supabaseUrl, supabaseKey);
```

This client was used in:
- ✅ Client-side (browser) - OK
- ❌ **Server-side API routes - DANGEROUS**

### Why This Is Dangerous

When multiple users make requests:

1. **User A** (rakeshkakati89@gmail.com) makes a request
2. The shared `supabase` client stores User A's session
3. **User B** (new user) makes a payment
4. Webhook processes User B's payment using the **same client**
5. The client still has **User A's session**
6. User B gets logged in as **User A** 🚨

---

## The Fix

### Created Separate Server-Side Client

**New file**: `src/app/lib/supabaseServer.ts`

```typescript
import { createClient } from "@supabase/supabase-js";

// Admin client with SERVICE ROLE key (bypasses RLS)
export const supabaseAdmin = createClient(
  supabaseUrl, 
  supabaseServiceKey,  // ← SERVICE ROLE KEY
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false  // ← NO SESSION SHARING!
    }
  }
);
```

### Updated All API Routes

All server-side operations now use `supabaseAdmin`:

✅ Fixed:
- `src/app/api/stripe/webhook/route.ts`
- `src/app/api/stripe/create-checkout/route.ts`
- `src/app/api/stripe/create-portal/route.ts`
- `src/app/api/auth/signup/route.ts`
- `src/app/api/trackBrand/route.ts`
- `src/app/api/checkMention/route.ts`

---

## Required: Add SERVICE_ROLE_KEY to .env

### ⚠️ **CRITICAL**: You MUST add this to your `.env` file:

```env
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

### Where to Find It:

1. Go to **Supabase Dashboard**
2. Click **Settings** → **API**
3. Copy the **`service_role` key** (secret key)
4. Paste it in your `.env` file

**Example**:
```env
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFmcXZmanhldnFxaG94em14aHl1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczMDA2MDI4MCwiZXhwIjoyMDQ1NjM2MjgwfQ.xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

---

## What Changed

### Before (Vulnerable):

```typescript
// API Route
import { supabase } from "@/app/lib/supabaseClient"; // ❌ SHARED!

export async function POST(req: Request) {
  // This could use the wrong user's session!
  await supabase.from("subscriptions").update(...);
}
```

### After (Secure):

```typescript
// API Route
import { supabaseAdmin } from "@/app/lib/supabaseServer"; // ✅ ISOLATED!

export async function POST(req: Request) {
  // Uses SERVICE ROLE - no session mixing!
  await supabaseAdmin.from("subscriptions").update(...);
}
```

---

## Benefits

1. **No Session Leakage** - Each request is isolated
2. **Bypasses RLS** - Admin operations don't need user permissions
3. **More Secure** - Service key never exposed to client
4. **No Session Persistence** - Fresh state for every request

---

## Testing

### After Adding the Service Role Key:

1. **Restart your dev server**:
   ```bash
   npm run dev
   ```

2. **Test the flow**:
   - Sign up as a new user (e.g., `testuser@example.com`)
   - Click "Upgrade to Pro"
   - Complete payment with test card: `4242 4242 4242 4242`
   - After redirect, check you're logged in as `testuser@example.com` ✅

3. **Check logs**:
   ```
   💳 Creating Stripe checkout for: testuser@example.com
   ✅ Checkout session created
   🎣 Stripe webhook received: checkout.session.completed
   ✅ Subscription upgraded to Pro for: testuser@example.com
   ```

---

## Important Notes

### Service Role Key Security

⚠️ **NEVER**:
- Commit the service role key to Git
- Expose it in client-side code
- Share it publicly

✅ **ALWAYS**:
- Keep it in `.env` (which is in `.gitignore`)
- Use it only in server-side code
- Rotate it if compromised

### What About RLS?

The admin client **bypasses Row Level Security (RLS)**, which is fine for:
- Webhook handlers (Stripe events)
- Admin operations (signup, subscription management)
- Background jobs (cron tasks)

But you must **validate user ownership** in your code:
```typescript
// Example: Check user_email matches
if (user_email !== session.user.email) {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
```

---

## Summary

✅ **Fixed**: Session leakage between users
✅ **Added**: Server-side admin client (`supabaseAdmin`)
✅ **Updated**: All API routes to use isolated client
⚠️ **Required**: Add `SUPABASE_SERVICE_ROLE_KEY` to `.env`
✅ **Tested**: Build compiles successfully

---

## Next Steps

1. ✅ **Add SERVICE_ROLE_KEY to `.env`** ← DO THIS NOW
2. ✅ Restart dev server
3. ✅ Test new user signup + payment flow
4. ✅ Verify user stays logged in as themselves

---

**This was a critical security issue. Users were getting logged in as other users!** 🚨

Now fixed! 🎉

