# 🔐 Environment Variables Setup

Complete guide for all required environment variables.

---

## 📋 Required Variables

### 1. Supabase Configuration

Get these from your [Supabase Dashboard](https://supabase.com/dashboard):

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**How to get**:
1. Go to your Supabase project
2. Click **Settings** → **API**
3. Copy **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
4. Copy **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

---

### 2. OpenAI Configuration

Get this from [OpenAI Platform](https://platform.openai.com/api-keys):

```env
OPENAI_API_KEY=sk-proj-...
```

**How to get**:
1. Go to [OpenAI API Keys](https://platform.openai.com/api-keys)
2. Click **Create new secret key**
3. Copy the key (starts with `sk-proj-` or `sk-`)
4. **Save it immediately** (you won't see it again)

---

### 3. Stripe Configuration

Get these from your [Stripe Dashboard](https://dashboard.stripe.com):

```env
# Stripe API Keys
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Stripe Price ID for Pro Plan
STRIPE_PRO_PRICE_ID=price_...
```

**How to get**:

**API Keys**:
1. Go to **Developers** → **API keys**
2. Copy **Publishable key** → `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
3. Copy **Secret key** → `STRIPE_SECRET_KEY`

**Webhook Secret**:
1. Go to **Developers** → **Webhooks**
2. Add endpoint: `https://your-domain/api/stripe/webhook`
3. Copy **Signing secret** → `STRIPE_WEBHOOK_SECRET`

**Price ID**:
1. Go to **Products** → Create **Pro Plan** product
2. Set price: $29/month recurring
3. Copy **Price ID** → `STRIPE_PRO_PRICE_ID`

---

### 4. App Configuration

```env
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
```

**Local development**:
```env
NEXT_PUBLIC_APP_URL=http://localhost:3002
```

**Production**:
```env
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

---

## 📝 Complete .env File Template

Create a `.env` file in your project root:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# OpenAI
OPENAI_API_KEY=sk-proj-...

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRO_PRICE_ID=price_...

# App
NEXT_PUBLIC_APP_URL=http://localhost:3002
```

---

## 🚀 Deployment (Vercel)

### 1. Add Variables in Vercel Dashboard

1. Go to your project on [Vercel](https://vercel.com)
2. Click **Settings** → **Environment Variables**
3. Add each variable:
   - **Key**: Variable name (e.g., `OPENAI_API_KEY`)
   - **Value**: Your actual value
   - **Environment**: Select `Production`, `Preview`, `Development`
4. Click **Save**

### 2. Important Notes

**`NEXT_PUBLIC_*` variables**:
- Exposed to the browser
- Can be seen in client-side code
- Use only for non-sensitive data (publishable keys, URLs)

**Non-public variables**:
- Only available on server-side
- Never exposed to browser
- Use for secret keys (API keys, webhook secrets)

---

## ✅ Verification Checklist

### Local Development

```bash
# 1. Create .env file
cp .env.example .env

# 2. Fill in all values

# 3. Restart dev server
npm run dev

# 4. Check console for errors
```

### Vercel Deployment

- [ ] All variables added to Vercel
- [ ] `NEXT_PUBLIC_APP_URL` set to production domain
- [ ] Stripe webhook URL updated to production URL
- [ ] Test API keys replaced with live keys (for production)
- [ ] Redeployed after adding variables

---

## 🔍 Testing Variables

### Check if variables are loaded:

Create `src/app/api/test-env/route.ts`:

```typescript
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    hasSupabaseKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    hasOpenAI: !!process.env.OPENAI_API_KEY,
    hasStripe: !!process.env.STRIPE_SECRET_KEY,
    hasStripePubKey: !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    hasWebhook: !!process.env.STRIPE_WEBHOOK_SECRET,
    hasPriceId: !!process.env.STRIPE_PRO_PRICE_ID,
    appUrl: process.env.NEXT_PUBLIC_APP_URL,
  });
}
```

Visit: `http://localhost:3002/api/test-env`

All values should be `true` (except they'll show actual appUrl).

---

## 🐛 Common Issues

### "Missing NEXT_PUBLIC_SUPABASE_URL"
- Variable not in `.env` file
- Typo in variable name
- Server not restarted after adding

### "Missing OPENAI_API_KEY" 
- Variable not set in `.env`
- Using `NEXT_PUBLIC_` prefix (don't!)
- Key expired or invalid

### "Missing STRIPE_SECRET_KEY"
- Not added to Vercel environment variables
- Wrong key (using publishable instead of secret)
- Test key in production (or vice versa)

### "NEXT_PUBLIC_* not working in browser"
- Server not restarted after adding
- Build not regenerated
- Typo in variable name

---

## 🔐 Security Best Practices

1. **Never commit .env files**
   ```gitignore
   .env
   .env.local
   .env.*.local
   ```

2. **Use different keys for dev/prod**
   - Test keys for development
   - Live keys for production only

3. **Rotate keys regularly**
   - Generate new keys periodically
   - Update in both local and Vercel

4. **Never expose secret keys**
   - Don't use `NEXT_PUBLIC_` for secrets
   - Don't log secret values
   - Don't share keys in code/screenshots

5. **Validate all environment variables**
   - Check on app startup
   - Fail fast if missing
   - Provide helpful error messages

---

## 📚 Additional Resources

- [Next.js Environment Variables](https://nextjs.org/docs/pages/building-your-application/configuring/environment-variables)
- [Vercel Environment Variables](https://vercel.com/docs/projects/environment-variables)
- [Supabase API Keys](https://supabase.com/docs/guides/api)
- [OpenAI API Keys](https://platform.openai.com/docs/api-reference/authentication)
- [Stripe API Keys](https://stripe.com/docs/keys)

