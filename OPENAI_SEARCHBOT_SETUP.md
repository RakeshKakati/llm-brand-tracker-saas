# OpenAI SearchBot Setup Guide

This guide helps ensure your site appears in OpenAI searches (ChatGPT search features).

## ✅ Step 1: Robots.txt Configuration (Complete)

The `robots.ts` file has been updated to explicitly allow OAI-SearchBot:

```typescript
{
  userAgent: "OAI-SearchBot",
  allow: "/",
}
```

This will generate a robots.txt file that allows OAI-SearchBot to crawl your entire site.

## 🔒 Step 2: IP Allowlisting (If Required)

OpenAI recommends allowing requests from their published IP ranges. This is typically done at the server/CDN level, not in your application code.

### Option A: Vercel IP Allowlisting

If you're using Vercel and need to allowlist OpenAI's IP ranges:

1. **Get OpenAI IP ranges**: Fetch the list from `https://openai.com/searchbot.json`
2. **Vercel Configuration**: 
   - Go to your Vercel project settings
   - Navigate to "Security" or "Firewall" settings
   - Add OpenAI's IP ranges to your allowlist
   - Note: Vercel may not have direct IP allowlisting in free tier; you may need Pro/Enterprise

### Option B: Cloudflare (If Using)

If you're using Cloudflare:

1. Go to Cloudflare Dashboard → Security → WAF
2. Create a firewall rule to allow traffic from OpenAI IP ranges
3. Or use "Access" rules to whitelist IP ranges

### Option C: Next.js Middleware (Application Level)

If IP allowlisting is required at the application level, you can create middleware:

1. Create `src/middleware.ts`:
```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Fetch OpenAI IP ranges (you may want to cache this)
async function getOpenAIIPRanges(): Promise<string[]> {
  try {
    const response = await fetch('https://openai.com/searchbot.json');
    const data = await response.json();
    return data.ip_ranges || [];
  } catch (error) {
    console.error('Failed to fetch OpenAI IP ranges:', error);
    return [];
  }
}

export async function middleware(request: NextRequest) {
  const userAgent = request.headers.get('user-agent') || '';
  
  // Check if request is from OAI-SearchBot
  if (userAgent.includes('OAI-SearchBot')) {
    const ipRanges = await getOpenAIIPRanges();
    const clientIP = request.ip || 
      request.headers.get('x-forwarded-for')?.split(',')[0] ||
      request.headers.get('x-real-ip');
    
    // Allow if IP is in OpenAI's ranges (simplified check)
    // Note: This is a basic implementation; for production, use proper IP range matching
    // You may want to use a library like ipaddr.js for proper CIDR matching
    
    // For now, allow all OAI-SearchBot requests
    // In production, implement proper IP range checking
    return NextResponse.next();
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: '/(.*)',
};
```

**Note**: The middleware approach above is a starting point. For production, implement proper CIDR range matching using a library like `ipaddr.js`.

## 📋 Verification

After deployment:

1. **Test robots.txt**: Visit `https://yourdomain.com/robots.txt` and verify OAI-SearchBot is listed
2. **Check User-Agent**: Monitor your server logs for requests with `OAI-SearchBot/1.0; +https://openai.com/searchbot`
3. **Test in ChatGPT**: Search for content that should appear on your site in ChatGPT

## 🔗 Resources

- OpenAI SearchBot Documentation: https://openai.com/searchbot
- IP Ranges JSON: https://openai.com/searchbot.json
- Full User-Agent String: `OAI-SearchBot/1.0; +https://openai.com/searchbot`

## 📝 Notes

- The robots.txt configuration (Step 1) is usually sufficient for most cases
- IP allowlisting (Step 2) may be required if you have strict firewall rules
- Make sure your sitemap is up to date (`/sitemap.xml`) as it helps crawlers discover content
- Ensure your pages have proper meta tags and structured data for better indexing

