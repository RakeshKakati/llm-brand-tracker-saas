# kommi Brand Kit

Complete brand assets, colors, typography, and usage guidelines for kommi.

---

## 📁 Logo Assets

### Primary Logos

**Location:** `/public/logo.svg` and `/public/logo.png`

#### SVG Logo (Recommended)
- **File:** `public/logo.svg`
- **Format:** SVG (scalable vector)
- **Usage:** Web, digital, print (high resolution)
- **Sizes available:** Scalable (recommended: 24px, 48px, 96px, 192px)

#### PNG Logo
- **File:** `public/logo.png`
- **Format:** PNG (raster)
- **Usage:** Fallback when SVG not supported
- **Sizes available:** As per source file

### Favicon Set

- **File:** `public/favicon.ico`
  - **Format:** ICO (multi-size)
  - **Usage:** Browser tab icon
  - **Size:** 16x16, 32x32 (multiple resolutions)

- **File:** `public/favicon.png`
  - **Format:** PNG
  - **Usage:** Modern browser favicon
  - **Size:** 512x512 (scaled down by browser)

- **File:** `public/favicon-32x32.png`
  - **Format:** PNG
  - **Usage:** Explicit 32x32 favicon
  - **Size:** 32x32px

---

## 🎨 Color Palette

### Primary Colors

**Primary Dark (Text/Background)**
- **Hex:** `#37322F` / `hsl(240, 5.9%, 10%)`
- **Usage:** Primary text, headings, brand elements
- **CSS Var:** `--primary`, `--foreground`

**Primary Light (Background)**
- **Hex:** `#FAFAFA` / `hsl(0, 0%, 98%)`
- **Usage:** Page backgrounds, card backgrounds
- **CSS Var:** `--background`

### Secondary Colors

**Secondary Text**
- **Hex:** `#605A57`
- **Usage:** Body text, secondary information
- **HSL:** `hsl(240, 3.8%, 46.1%)` (muted-foreground)

**Borders & Dividers**
- **Hex:** `#E4E4E7` / `hsl(240, 5.9%, 90%)`
- **Usage:** Borders, dividers, subtle separations
- **CSS Var:** `--border`, `--input`

### Accent Colors

**Chart/Data Colors** (for analytics dashboards)
- **Chart 1:** `#FF6B6B` / `hsl(12, 76%, 61%)`
- **Chart 2:** `#4ECDC4` / `hsl(173, 58%, 39%)`
- **Chart 3:** `#2C3E50` / `hsl(197, 37%, 24%)`
- **Chart 4:** `#F9CA24` / `hsl(43, 74%, 66%)`
- **Chart 5:** `#F0932B` / `hsl(27, 87%, 67%)`

**Destructive/Actions**
- **Hex:** `#EF4444` / `hsl(0, 84.2%, 60.2%)`
- **Usage:** Errors, warnings, delete actions
- **CSS Var:** `--destructive`

---

## 📝 Typography

### Primary Font Family

**Font:** Inter (Google Fonts)
- **Import:** `@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');`
- **Usage:** All UI text, headings, body copy

**Fallback Stack:**
```css
font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
```

### Type Scale

**Headings**
- **H1:** `text-4xl md:text-5xl lg:text-6xl` (36-60px), `font-bold`
- **H2:** `text-3xl` (30px), `font-bold`
- **H3:** `text-2xl` (24px), `font-semibold`
- **H4:** `text-xl` (20px), `font-semibold`

**Body Text**
- **Large:** `text-xl md:text-2xl` (20-24px)
- **Base:** `text-base` (16px)
- **Small:** `text-sm` (14px)
- **XSmall:** `text-xs` (12px)

**Brand Name**
- **Size:** `text-xl` (20px)
- **Weight:** `font-semibold`
- **Style:** Lowercase "kommi" (all lowercase)

---

## 📐 Logo Usage Guidelines

### Minimum Sizes
- **Digital:** 24px minimum height
- **Print:** 0.5 inch minimum height

### Spacing Rules
- **Clear space:** Minimum 1x logo height on all sides
- **Do not:** Place near competing logos or cluttered backgrounds

### Background Usage
- ✅ Use on white/light backgrounds (#FAFAFA)
- ✅ Use on dark backgrounds with proper contrast
- ❌ Do not use on busy patterns
- ❌ Do not stretch or distort the logo

### Logo Lockups

**Standard Logo + Text**
```
[Logo Icon] kommi
```
- Gap: 8px (0.5rem)
- Logo size: 24px height
- Text: 20px, semibold, lowercase

---

## 🖼️ File Formats & Exports Needed

### Recommended Logo Exports

If you need to generate additional sizes:

1. **SVG** (Primary)
   - 24x24px
   - 48x48px
   - 96x96px
   - 192x192px
   - 512x512px (for high-res displays)

2. **PNG** (Fallbacks)
   - 24x24px @1x, @2x, @3x (72x72px @3x)
   - 48x48px @1x, @2x, @3x (144x144px @3x)
   - 512x512px (for social media)

3. **Favicon Package**
   - ✅ Already have: favicon.ico, favicon.png, favicon-32x32.png
   - Consider adding: apple-touch-icon (180x180px)

4. **Social Media Assets**
   - **Open Graph:** 1200x630px (for link previews)
   - **Twitter Card:** 1200x675px
   - **Instagram Profile:** 320x320px
   - **LinkedIn Company:** 300x300px

---

## 🎯 Brand Voice & Messaging

### Tagline
**"Make your brand AI-compatible"**

### Value Propositions
- Track and improve your brand's visibility in AI answers
- Get cited, discovered, and preferred by AI
- Monitor competitors, sources, positions

### Tone
- **Professional yet approachable**
- **Direct and clear**
- **Startup-friendly** (not enterprise-heavy)
- **Solution-focused**

---

## 📱 Social Media Guidelines

### Profile Images
- Use logo on solid background (#FAFAFA or white)
- Minimum 200x200px
- Maintain clear space around logo

### Cover Images
- Include tagline or key value prop
- Use brand colors
- Recommended size: 1500x500px (Twitter/X), 820x312px (LinkedIn)

### Post Templates
- Use brand colors for CTAs
- Include logo watermark (subtle) if needed
- Maintain consistent font (Inter)

---

## 🔗 Logo Files Reference

All logo files are located in `/public/`:

```
/public/
├── logo.svg          ← Primary logo (SVG, scalable)
├── logo.png          ← Fallback logo (PNG)
├── favicon.ico       ← Multi-size favicon
├── favicon.png       ← Modern favicon (512x512)
└── favicon-32x32.png ← Explicit 32x32 favicon
```

### How to Use in Code

**Next.js Image Component:**
```tsx
import Image from 'next/image';

<Image 
  src="/logo.svg" 
  alt="kommi logo" 
  width={24} 
  height={24}
  className="object-contain"
/>
```

**Direct HTML:**
```html
<img src="/logo.svg" alt="kommi logo" width="24" height="24" />
```

---

## ✅ Quick Checklist

Before using kommi brand assets:

- [ ] Logo is at least 24px height
- [ ] Clear space (1x logo height) maintained
- [ ] Using Inter font for text
- [ ] Colors match brand palette
- [ ] Logo not distorted or stretched
- [ ] Proper contrast on background
- [ ] Favicon set correctly in HTML head

---

## 📧 Contact for Brand Assets

If you need additional logo formats, sizes, or brand guidelines:
- Check `/public/` folder for current assets
- Request new exports: maintain SVG as source, export PNGs at multiple resolutions
- For print: request 300 DPI versions of PNGs

---

## 🔄 Version History

- **v1.0** (Current)
  - Logo SVG and PNG in `/public/`
  - Favicon set (ICO, PNG, 32x32)
  - Color palette defined in CSS variables
  - Inter font family established







