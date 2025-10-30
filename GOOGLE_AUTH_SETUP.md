# 🔐 Google Authentication Setup Guide

Complete guide for setting up Google OAuth sign-native in kommi.

---

## ✅ What's Implemented

### Frontend (`AuthPage.tsx`):
- ✅ "Continue with Google" button with Google logo
- ✅ Integrated with Supabase OAuth
- ✅ Handles redirects with query parameters
- ✅ Loading states and error handling

### Backend (`/auth/callback/route.ts`):
- ✅ OAuth callback handler
- ✅ Automatic user profile creation
- ✅ Automatic free subscription creation
- ✅ Redirects to dashboard after successful auth

---

## 📋 Required Setup in Supabase

### 1. Enable Google Provider

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **Authentication** → **Providers**
4. Find **Google** in the list
5. Toggle **Enable Google provider**
6. Click **Save**

---

### 2. Get Google OAuth Credentials

#### Step 1: Go to Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable **Google+ API**:
   - Go to **APIs & Services** → **Library**
   - Search for "Google+ API"
   - Click **Enable**

#### Step 2: Create OAuth Credentials

1. Go to **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **OAuth client ID**
3. If prompted, configure OAuth consent screen:
   - Choose **External** (or Internal if using Google Workspace)
   - Fill in app name: **kommi**
   - Add your email as support email
   - Add app domain: `kommi.in`
   - Save and continue

4. Create OAuth Client ID:
   - **Application type**: Web application
   - **Name**: kommi Web Client
   - **Authorized JavaScript origins**:
     - `https://YOUR-PROJECT-ID.supabase.co` (replace YOUR-PROJECT-ID with your actual Supabase project ID)
     - `http://localhost:3000` (for local development)
     - `https://www.kommi.in` (your production domain)
   - **Authorized redirect URIs** (CRITICAL - must match Supabase):
     - `https://YOUR-PROJECT-ID.supabase.co/auth/v1/callback` (replace YOUR-PROJECT-ID)
     - For local dev (if using Supabase local): `http://localhost:54321/auth/v1/callback`
   - Click **Create**
   - **Copy the Client ID and Client Secret**

   ⚠️ **IMPORTANT**: The redirect URI must be Supabase's callback URL, NOT your app's callback URL!
   - ✅ CORRECT: `https://YOUR-PROJECT-ID.supabase.co/auth/v1/callback`
   - ❌ WRONG: `https://www.kommi.in/auth/callback`

---

### 3. Add Credentials to Supabase

1. Go back to Supabase Dashboard
2. **Authentication** → **Providers** → **Google**
3. Paste:
   - **Client ID** (from Google Cloud Console)
   - **Client Secret** (from Google Cloud Console)
4. Click **Save**

---

### 4. Configure Redirect URLs in Supabase

1. In Supabase Dashboard, go to **Authentication** → **URL Configuration**
2. Under **Redirect URLs**, add:
   - `http://localhost:3000/auth/callback`
   - `http://localhost:3002/auth/callback` (if using port 3002)
   - `https://www.kommi.in/auth/callback`
   - `https://kommi.in/auth/callback`
3. Click **Save**

---

## ✅ Verification Checklist

### Supabase Configuration:
- [ ] Google provider is enabled
- [ ] Client ID is added
- [ ] Client Secret is added
- [ ] Redirect URLs are configured in Supabase

### Google Cloud Console:
- [ ] OAuth consent screen is configured
- [ ] OAuth client ID created (Web application type)
- [ ] Authorized JavaScript origins include your domains
- [ ] Authorized redirect URIs include `/auth/callback` paths

### Code:
- [ ] `AuthPage.tsx` has Google sign-in button
- [ ] `/auth/callback/route.ts` exists and handles OAuth callback
- [ ] User profile creation works for Google users
- [ ] Subscription creation works for Google users

---

## 🧪 Testing

### Local Testing:
1. Start your dev server: `npm run dev`
2. Go to `http://localhost:3000/auth`
3. Click "Continue with Google"
4. Select your Google account
5. Should redirect back to dashboard

### Production Testing:
1. Deploy to Vercel
2. Visit `https://www.kommi.in/auth`
3. Click "Continue with Google"
4. Select your Google account
5. Should redirect back to dashboard

---

## 🔍 Troubleshooting

### Error: "redirect_uri_mismatch" ⚠️ **MOST COMMON**
**Cause**: Redirect URI in Google Console doesn't match what Supabase sends to Google
**Fix**: 
1. Find your Supabase project ID:
   - Go to Supabase Dashboard → Settings → General
   - Copy your **Project Reference ID** (looks like: `abcdefghijklmnop`)
2. In Google Cloud Console → OAuth Client → Authorized redirect URIs:
   - Add: `https://YOUR-PROJECT-ID.supabase.co/auth/v1/callback`
   - Replace `YOUR-PROJECT-ID` with your actual Supabase project ID
   - **Must be exactly this format** - Supabase handles the OAuth flow
3. Remove any app callback URLs like `https://www.kommi.in/auth/callback` from Google Console (they're not needed there)
4. Save and wait 1-2 minutes for changes to propagate
5. Try signing in again

### Error: "invalid_client"
**Cause**: Wrong Client ID or Secret in Supabase
**Fix**: 
1. Double-check Client ID and Secret in Supabase
2. Make sure no extra spaces or quotes

### Users Created but No Profile/Subscription
**Cause**: Callback route may not be creating profiles
**Fix**: 
1. Check Vercel logs for errors
2. Verify `SUPABASE_SERVICE_ROLE_KEY` is set in environment variables

### Redirect Loop
**Cause**: Callback URL not properly configured
**Fix**: 
1. Check that `/auth/callback` route exists
2. Verify redirect URLs in both Google Console and Supabase

---

## 📚 Additional Notes

### User Profile Creation:
- Google OAuth users get their name from `user_metadata.name` or fallback to email prefix
- Automatically creates free subscription with default limits

### Session Management:
- Session is automatically managed by Supabase
- Users stay logged in across page refreshes
- Session persists in localStorage

### Security:
- OAuth flow uses secure HTTPS endpoints
- Tokens are managed by Supabase Auth
- No sensitive credentials stored in frontend code

---

## 🚀 Next Steps

After setup, you can also add:
- GitHub OAuth provider
- Microsoft OAuth provider
- Apple Sign In
- Email magic links

All follow the same pattern - just enable the provider in Supabase and update the button in `AuthPage.tsx`.

