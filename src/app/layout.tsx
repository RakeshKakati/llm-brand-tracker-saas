import { Inter } from "next/font/google";
import "./globals.css";
import type { Metadata } from "next";
import { headers } from "next/headers";

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
    "SaaS marketing",
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
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
