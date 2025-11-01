import { Inter } from "next/font/google";
import "./globals.css";
import type { Metadata } from "next";
import { headers } from "next/headers";
import Script from "next/script";
import { ThemeProvider } from "@/components/theme-provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://www.kommi.in"),
  title: {
    default: "kommi",
    template: "%s • kommi",
  },
  description: "Track and improve your brand's visibility in AI answers. Competitors, sources, positions, teams and contacts.",
  keywords: [
    "AI visibility",
    "brand monitoring",
    "AI search",
    "competitor analysis",
    "OpenAI citations",
    "contacts extraction",
    "SaaS AI marketing tools",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: "/",
    siteName: "kommi",
    title: "Monitor and improve your brand visibility in AI",
    description: "See how often AI mentions your brand, track sources and competitors, and extract contacts to win mentions.",
    images: [
      {
        url: "/logo.svg",
        width: 512,
        height: 512,
        alt: "kommi logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Monitor and improve your brand visibility in AI",
    description: "See how often AI mentions your brand, track sources and competitors, and extract contacts to win mentions.",
    images: ["/logo.svg"],
  },
  icons: {
    icon: "/logo.svg",
    shortcut: "/logo.svg",
    apple: "/logo.svg",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Google Tag Manager */}
        <Script id="gtm-init" strategy="afterInteractive">
          {`
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','GTM-TN7MS6LF');
          `}
        </Script>
        {/* Google tag (gtag.js) */}
        <Script async src="https://www.googletagmanager.com/gtag/js?id=AW-17691304936" />
        <Script id="gtag-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'AW-17691304936');
          `}
        </Script>
      </head>
      <body className={inter.className}>
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-TN7MS6LF"
            height="0"
            width="0"
            style={{ display: 'none', visibility: 'hidden' }}
          />
        </noscript>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
