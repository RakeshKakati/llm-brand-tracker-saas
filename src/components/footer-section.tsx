"use client";

export default function FooterSection() {
  return (
    <div className="w-full py-8 sm:py-12 md:py-16 flex justify-center items-center">
      <div className="w-full max-w-[1060px] px-4 sm:px-6 md:px-8 lg:px-0">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="flex flex-col gap-4">
            <div className="text-[#37322F] text-lg font-semibold">Brand Tracker</div>
            <div className="text-[#605A57] text-sm">
              Monitor your brand's AI visibility and stay ahead of the competition with real-time tracking and analytics.
            </div>
          </div>

          {/* Product */}
          <div className="flex flex-col gap-4">
            <div className="text-[#37322F] text-sm font-semibold">Product</div>
            <div className="flex flex-col gap-2">
              <a href="#features" className="text-[#605A57] text-sm hover:text-[#37322F] transition-colors">Features</a>
              <a href="#pricing" className="text-[#605A57] text-sm hover:text-[#37322F] transition-colors">Pricing</a>
              <a href="/auth" className="text-[#605A57] text-sm hover:text-[#37322F] transition-colors">Sign Up</a>
              <a href="/auth" className="text-[#605A57] text-sm hover:text-[#37322F] transition-colors">Sign In</a>
            </div>
          </div>

          {/* Resources */}
          <div className="flex flex-col gap-4">
            <div className="text-[#37322F] text-sm font-semibold">Resources</div>
            <div className="flex flex-col gap-2">
              <a href="#" className="text-[#605A57] text-sm hover:text-[#37322F] transition-colors">Documentation</a>
              <a href="#" className="text-[#605A57] text-sm hover:text-[#37322F] transition-colors">API Reference</a>
              <a href="#" className="text-[#605A57] text-sm hover:text-[#37322F] transition-colors">Help Center</a>
              <a href="#" className="text-[#605A57] text-sm hover:text-[#37322F] transition-colors">Community</a>
            </div>
          </div>

          {/* Company */}
          <div className="flex flex-col gap-4">
            <div className="text-[#37322F] text-sm font-semibold">Company</div>
            <div className="flex flex-col gap-2">
              <a href="#" className="text-[#605A57] text-sm hover:text-[#37322F] transition-colors">About</a>
              <a href="#" className="text-[#605A57] text-sm hover:text-[#37322F] transition-colors">Blog</a>
              <a href="#" className="text-[#605A57] text-sm hover:text-[#37322F] transition-colors">Careers</a>
              <a href="#" className="text-[#605A57] text-sm hover:text-[#37322F] transition-colors">Contact</a>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-8 pt-8 border-t border-[rgba(55,50,47,0.12)] flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-[#605A57] text-xs">
            © 2024 Brand Tracker. All rights reserved.
          </div>
          <div className="flex items-center gap-6">
            <a href="#" className="text-[#605A57] text-xs hover:text-[#37322F] transition-colors">Privacy Policy</a>
            <a href="#" className="text-[#605A57] text-xs hover:text-[#37322F] transition-colors">Terms of Service</a>
            <a href="#" className="text-[#605A57] text-xs hover:text-[#37322F] transition-colors">Cookie Policy</a>
          </div>
        </div>
      </div>
    </div>
  );
}




