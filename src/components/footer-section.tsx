"use client";

import Image from "next/image";

export default function FooterSection() {
  return (
    <div className="w-full py-8 sm:py-12 md:py-16 flex justify-center items-center">
      <div className="w-full max-w-[1060px] px-4 sm:px-6 md:px-8 lg:px-0">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <Image 
                src="/logo.svg" 
                alt="kommi logo" 
                width={24} 
                height={24}
                className="object-contain"
              />
              <div className="text-foreground text-lg font-semibold">kommi</div>
            </div>
            <div className="text-muted-foreground text-sm">
              Monitor your brand's AI visibility and stay ahead of the competition with real-time tracking and analytics.
            </div>
          </div>

          {/* Product */}
          <div className="flex flex-col gap-4">
            <div className="text-foreground text-sm font-semibold">Product</div>
            <div className="flex flex-col gap-2">
              <a href="#features" className="text-muted-foreground text-sm hover:text-foreground transition-colors">Features</a>
              <a href="#pricing" className="text-muted-foreground text-sm hover:text-foreground transition-colors">Pricing</a>
              <a href="/auth" className="text-muted-foreground text-sm hover:text-foreground transition-colors">Sign Up</a>
              <a href="/auth" className="text-muted-foreground text-sm hover:text-foreground transition-colors">Sign In</a>
            </div>
          </div>

          {/* Resources */}
          <div className="flex flex-col gap-4">
            <div className="text-foreground text-sm font-semibold">Resources</div>
            <div className="flex flex-col gap-2">
              <a href="#" className="text-muted-foreground text-sm hover:text-foreground transition-colors">Documentation</a>
              <a href="#" className="text-muted-foreground text-sm hover:text-foreground transition-colors">API Reference</a>
              <a href="#" className="text-muted-foreground text-sm hover:text-foreground transition-colors">Help Center</a>
              <a href="#" className="text-muted-foreground text-sm hover:text-foreground transition-colors">Community</a>
            </div>
          </div>

          {/* Comparisons */}
          <div className="flex flex-col gap-4">
            <div className="text-foreground text-sm font-semibold">Comparisons</div>
            <div className="flex flex-col gap-2">
              <a href="/blogs/comparisons/kommi-vs-peec-ai" className="text-muted-foreground text-sm hover:text-foreground transition-colors">vs Peec AI</a>
              <a href="/blogs/comparisons/kommi-vs-otterly-ai" className="text-muted-foreground text-sm hover:text-foreground transition-colors">vs Otterly AI</a>
              <a href="/blogs/comparisons/kommi-vs-knowatoa-ai" className="text-muted-foreground text-sm hover:text-foreground transition-colors">vs Knowatoa AI</a>
              <a href="/blogs/comparisons/kommi-vs-profound-ai" className="text-muted-foreground text-sm hover:text-foreground transition-colors">vs Profound AI</a>
              <a href="/blogs/comparisons/kommi-vs-rankshift" className="text-muted-foreground text-sm hover:text-foreground transition-colors">vs Rankshift</a>
            </div>
          </div>

          {/* Company */}
          <div className="flex flex-col gap-4">
            <div className="text-foreground text-sm font-semibold">Company</div>
            <div className="flex flex-col gap-2">
              <a href="#" className="text-muted-foreground text-sm hover:text-foreground transition-colors">About</a>
              <a href="#" className="text-muted-foreground text-sm hover:text-foreground transition-colors">Blog</a>
              <a href="#" className="text-muted-foreground text-sm hover:text-foreground transition-colors">Careers</a>
              <a href="#" className="text-muted-foreground text-sm hover:text-foreground transition-colors">Contact</a>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-8 pt-8 border-t border-border/40 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-muted-foreground text-xs">
            © 2024 kommi. All rights reserved.
          </div>
          <div className="flex items-center gap-6">
            <a href="#" className="text-muted-foreground text-xs hover:text-foreground transition-colors">Privacy Policy</a>
            <a href="#" className="text-muted-foreground text-xs hover:text-foreground transition-colors">Terms of Service</a>
            <a href="#" className="text-muted-foreground text-xs hover:text-foreground transition-colors">Cookie Policy</a>
          </div>
        </div>
      </div>
    </div>
  );
}







