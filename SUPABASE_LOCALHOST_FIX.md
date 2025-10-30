# 🚨 URGENT: Fix localhost:3000 Redirect Issue

## Problem
Google OAuth is redirecting to `http://localhost:3000` even when accessing `https://www.kommi.in`

## Root Cause
**Supabase Site URL is set to `localhost:3000`** - This is the PRIMARY cause. Supabase overrides the `redirectTo` parameter if the Site URL doesn't match your production domain.

## ✅ IMMEDIATE FIX (Do This Now)

### Step 1: Update Supabase Site URL

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **Authentication** → **URL Configuration**
4. **Site URL** field - Change from:
   ```
   http://localhost:3000
   ```
   To:
   ```
   https://www.kommi.in
   ```
5. Click **Save** (bottom of page)

### Step 2: Add Redirect URLs

Still in **Authentication** → **URL Configuration**, under **Redirect URLs**, click **Add URL** and add:

```
https://www.kommi.in/auth/callback
https://kommi.in/auth/callback
http://localhost:3000/auth/callback
```

**Important**: 
- Keep `localhost:3000` for local development
- Add BOTH `www.kommi.in` and `kommi.in` (with and without www)
- Click **Save** after adding each URL

### Step 3: Verify Site URL Matches Production

After saving, verify:
- **Site URL**: `https://www.kommi.in` ✅
- **Redirect URLs** includes: `督促://www.kommi.in/auth/callback` ✅

### Step 4: Wait 30 Seconds

Supabase needs a moment to propagate the changes.

### Step 5: Clear Browser Cache

1. Open browser DevTools (F12)
2. Right-click the refresh button
3. Select "Empty Cache and Hard Reload"
4. OR open an Incognito/Private window

### Step 6: Test

1. Go to `https://www.kommi.in/auth`
2. Open browser DevTools → Console tab
3. Click "Continue with Google"
4. Check console logs - should show:
   ```
   🔐 Starting Google OAuth with redirect: https://www.kommi.in/auth/callback?redirect=...
   📍 Current origin: https://www.kommi.in
   📍 Current hostname: www.kommi.in
   ```
5. After Google authorization, should redirect to `https://www.kommi.in/auth/callback` (NOT localhost)

## 🔍 How Supabase Determines Redirect

Supabase uses this priority:

1. **Site URL** (if set) - Takes precedence for redirects
2. **Redirect URLs whitelist** - Must include your callback URL
3. **redirectTo parameter** - Only used if Site URL matches or is empty

**That's why Site URL must be `https://www.kommi.in` in production!**

## 🧪 Verify Configuration

Run this in browser console on `https://www.kommi.in`:

```javascript
console.log("Current origin:", window.location.origin);
console.log("Expected callback:", window.location.origin + "/auth/callback");
```

Should output:
```
Current origin: https://www.kommi.in
Expected callback: https://www.kommi.in/auth/callback
```

If it shows `localhost:3000`, you're running on a different URL.

## ⚠️ Still Not Working?

### Check 1: Multiple Supabase Projects

Do you have multiple Supabase projects?
- Verify you're updating the correct project
- Check `NEXT_PUBLIC_SUPABASE_URL` in your Vercel environment variables

### Check 2: Environment Variables

In Vercel:
1. Go to your project → Settings → Environment Variables
2. Verify `NEXT_PUBLIC_SUPABASE_URL` points to the correct Supabase project
3. It should be: `https://YOUR-PROJECT-ID.supabase.co`
4. NOT: `http://localhost:54321` or any local URL

### Check 3: Supabase Project URL

1. Go to Supabase Dashboard → Settings → General
2. Copy the **Project URL** (looks like: `https://abcdefghijklmnop.supabase.co`)
3. Verify this matches your `NEXT_PUBLIC_SUPABASE_URL`

### Check 4: Google Console Redirect URI

In Google Cloud Console:
1. **APIs & Services** → **Credentials**
2. Click your OAuth Client ID
3. **Authorized redirect URIs** should have:
   ```
   https://YOUR-PROJECT-ID.supabase.co/auth/v1/callback
   ```
   (NOT your app's callback URL)

### Check 5: Browser Console Logs

After clicking "Continue with Google", check console for:

```
🔐 Starting Google OAuth with redirect: https://www.kommi.in/auth/callback...
📍 Current origin: https://www.kommi.in
```

If you see `localhost:3000` in the logs, the code is running on localhost, not production.

## 📝 Summary

**MOST COMMON FIX**: Change Supabase Site URL from `localhost:3000` to `https://www.kommi.in`

That's it! 90% of the time this is the issue.

---

**Still stuck?** Check browser console logs and Supabase Auth logs (Dashboard → Logs → Auth Logs) for specific errors.

