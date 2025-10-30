# 🔧 Quick Fix: Google OAuth redirect_uri_mismatch Error

## Error Message
```
Error 400: redirect_uri_mismatch
Access blocked: fractional's request is invalid
```

## Root Cause
Google Cloud Console doesn't have the correct redirect URI. Supabase handles the OAuth flow, so Google needs **Supabase's callback URL**, not your app's callback URL.

---

## ✅ Quick Fix (3 Steps)

### Step 1: Find Your Supabase Project ID

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **Settings** → **General**
4. Find **Project Reference ID** (or **Reference ID**)
5. Copy it (looks like: `abcdefghijklmnop` or a shorter ID)

**OR** look at your Supabase URL:
- Your Supabase URL: `https://abcdefghijklmnop.supabase.co`
- Your Project ID is: `abcdefghijklmnop`

---

### Step 2: Update Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Go to **APIs & Services** → **Credentials**
4. Click on your **OAuth 2.0 Client ID** (the one you created)
5. Under **Authorized redirect URIs**, **DELETE** any URLs like:
   - ❌ `https://www.kommi.in/auth/callback`
   - ❌ `http://localhost:3000/auth/callback`
6. **ADD** this URL (replace `YOUR-PROJECT-ID` with your actual Supabase project ID):
   - ✅ `https://YOUR-PROJECT-ID.supabase.co/auth/v1/callback`

   **Example**: If your Supabase URL is `https://xyzabc123.supabase.co`, then the redirect URI should be:
   - ✅ `https://xyzabc123.supabase.co/auth/v1/callback`

7. Click **Save**
8. Wait **1-2 minutes** for Google to propagate the changes

---

### Step 3: Verify Supabase Configuration

1. Go to Supabase Dashboard → **Authentication** → **URL Configuration**
2. Under **Redirect URLs**, make sure you have:
   - `http://localhost:3000/auth/callback` (for local dev)
   - `https://www.kommi.in/auth/callback` (for production)
   - `https://kommi.in/auth/callback` (optional, without www)

3. Under **Site URL**, set to:
   - Production: `https://www.kommi.in`
   - Local: `http://localhost:3000`

---

## 🔄 How the OAuth Flow Works

```
User clicks "Sign in with Google"
    ↓
App redirects to: Supabase OAuth endpoint
    ↓
Supabase redirects to: Google OAuth
    ↓
User authorizes on Google
    ↓
Google redirects back to: https://YOUR-PROJECT-ID.supabase.co/auth/v1/callback
    ↓
Supabase processes OAuth
    ↓
Supabase redirects to: https://www.kommi.in/auth/callback
    ↓
Your app creates user profile/subscription
    ↓
User lands on dashboard
```

**Key Point**: Google only talks to Supabase's callback URL (`/auth/v1/callback`), not your app's callback URL (`/auth/callback`).

---

## ✅ Checklist

- [ ] Found Supabase Project ID
- [ ] Added `https://YOUR-PROJECT-ID.supabase.co/auth/v1/callback` to Google Console
- [ ] Removed app callback URLs from Google Console (they don't belong there)
- [ ] Clicked Save in Google Console
- [ ] Waited 1-2 minutes
- [ ] Verified Supabase URL Configuration has your app callback URLs
- [ ] Tested Google sign-in again

---

## 🧪 Testing

After making changes:

1. **Wait 1-2 minutes** (Google needs time to update)
2. Go to your auth page: `https://www.kommi.in/auth`
3. Click "Continue with Google"
4. Should redirect to Google login (not show error)
5. After authorizing, should redirect back to your app

---

## 🆘 Still Not Working?

1. **Double-check the Project ID**:
   - Check Supabase Dashboard → Settings → General
   - Make sure the URL in Google Console exactly matches

2. **Clear browser cache**:
   - Try incognito/private window
   - Clear cookies for `google.com`

3. **Check Supabase logs**:
   - Supabase Dashboard → Logs → Auth Logs
   - Look for any errors

4. **Verify Client ID/Secret**:
   - Make sure Client ID and Secret in Supabase match Google Console
   - No extra spaces or quotes

---

## 📝 Example

If your Supabase project URL is:
```
https://xyzabc123def456.supabase.co是否为
```

Then in Google Cloud Console → OAuth Client → Authorized redirect URIs, add:
```
https://xyzabc uploaded123def456.supabase.co/auth/v1/callback
```

That's it! No need to add `https://www.kommi.in/auth/callback` to Google Console.

