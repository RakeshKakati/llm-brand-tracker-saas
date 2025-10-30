# 🔧 Fix: Supabase Redirecting to localhost:3000 in Production

## Problem
When signing in with Google on `https://www.kommi.in`, Supabase redirects back to `http://localhost:3000` instead of the production domain.

## Root Cause
Supabase's **URL Configuration** is set to `localhost:3000` as the Site URL or the redirect URLs include localhost.

## ✅ Solution

### Step 1: Update Supabase Site URL

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **Authentication** → **URL Configuration**
4. Under **Site URL**, set:
   ```
   https://www.kommi.in
   ```
   NOT `http://localhost:3000`

5. Click **Save**

### Step 2: Update Redirect URLs

Still in **Authentication** → **URL Configuration**:

Under **Redirect URLs**, make sure you have:
```
https://www.kommi.in/auth/callback
https://kommi.in/auth/callback
http://localhost:3000/auth/callback
```

**Important**: Keep localhost for local development, but ensure production URLs are listed.

6. Click **Save**

### Step 3: Verify Google Console Configuration

Ensure Google Cloud Console has the correct redirect URI (Supabase's callback):

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. **APIs & Services** → **Credentials**
3. Click your OAuth 2.0 Client ID
4. Under **Authorized redirect URIs**, verify:
   ```
   https://YOUR-PROJECT-ID.supabase.co/auth/v1/callback
   ```
   (Replace `YOUR-PROJECT-ID` with your actual Supabase project ID)

### Step 4: Verify Code Configuration

Check `AuthPage.tsx` uses `window.location.origin` correctly:

```typescript
redirectTo: `${window.location.origin}/auth/callback?redirect=${encodeURIComponent(redirectUrl)}`
```

This automatically uses:
- `http://localhost:3000` in development
- `https://www.kommi.in` in production

## ✅ Checklist

- [ ] Site URL in Supabase is `https://www.kommi.in` (NOT localhost)
- [ ] Redirect URLs include `https://www.kommi.in/auth/callback`
- [ ] Redirect URLs include `http://localhost:3000/auth/callback` (for dev)
- [ ] Google Console has Supabase callback URL (not app callback URL)
- [ ] Code uses `window.location.origin` (already correct)

## 🧪 Test

1. **Clear browser cache/cookies** (important!)
2. Go to `https://www.kommi.in/auth`
3. Click "Continue with Google"
4. After authorizing, should redirect to `https://www.kommi.in/auth/callback` (not localhost)
5. Should then redirect to dashboard on `https://www.kommi.in/dashboard`

## 🔍 Still Not Working?

1. **Check Supabase Logs**:
   - Go to Supabase Dashboard → Logs → Auth Logs
   - Look for redirect errors

2. **Check Browser Console**:
   - Open DevTools → Console
   - Look for any errors during OAuth flow

3. **Verify Environment Variables**:
   - Ensure `NEXT_PUBLIC_SUPABASE_URL` points to your Supabase project
   - Not a local Supabase instance URL

4. **Clear All Cookies**:
   - Clear cookies for `kommi.in`, `supabase.co`, and `google.com`
   - Try again in incognito mode

---

**Key Point**: The Site URL in Supabase determines where Supabase redirects users after OAuth. If it's set to `localhost:3000`, that's where users will be sent, even if they're on production.

