"use client";

import { Badge } from "@/components/ui/badge";

// Reusable Badge Component (matching landing page)
function Badge({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="px-[14px] py-[6px] bg-white shadow-[0px_0px_0px_4px_rgba(55,50,47,0.05)] overflow-hidden rounded-[90px] flex justify-start items-center gap-[8px] border border-[rgba(2,6,23,0.08)] shadow-xs">
      <div className="w-[14px] h-[14px] relative overflow-hidden flex items-center justify-center">{icon}</div>
      <div className="text-center flex justify-center flex-col text-[#37322F] text-xs font-medium leading-3 font-sans">
        {text}
      </div>
    </div>
  )
}

export default function DocumentationSection() {
  return (
    <div className="w-full border-b border-[rgba(55,50,47,0.12)] flex flex-col justify-center items-center">
      {/* Header Section */}
      <div className="self-stretch px-4 sm:px-6 md:px-8 lg:px-0 lg:max-w-[1060px] lg:w-[1060px] py-8 sm:py-12 md:py-16 border-b border-[rgba(55,50,47,0.12)] flex justify-center items-center gap-6">
        <div className="w-full max-w-[616px] lg:w-[616px] px-4 sm:px-6 py-4 sm:py-5 shadow-[0px_2px_4px_rgba(50,45,43,0.06)] overflow-hidden rounded-lg flex flex-col justify-start items-center gap-3 sm:gap-4 shadow-none">
          <Badge
            icon={
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="1" y="1" width="10" height="10" stroke="#37322F" strokeWidth="1" fill="none" />
                <rect x="3" y="3" width="6" height="6" stroke="#37322F" strokeWidth="1" fill="none" />
                <rect x="5" y="5" width="2" height="2" fill="#37322F" />
              </svg>
            }
            text="Documentation"
          />
          <div className="w-full max-w-[598.06px] lg:w-[598.06px] text-center flex justify-center flex-col text-[#49423D] text-xl sm:text-2xl md:text-3xl lg:text-5xl font-semibold leading-tight md:leading-[60px] font-sans tracking-tight">
            Everything you need to get started
          </div>
          <div className="self-stretch text-center text-[#605A57] text-sm sm:text-base font-normal leading-6 sm:leading-7 font-sans">
            Comprehensive guides, API documentation, and examples
            <br />
            to help you track your brand effectively.
          </div>
        </div>
      </div>

      {/* Documentation Cards */}
      <div className="self-stretch flex justify-center items-start">
        <div className="w-4 sm:w-6 md:w-8 lg:w-12 self-stretch relative overflow-hidden">
          {/* Left decorative pattern */}
          <div className="w-[120px] sm:w-[140px] md:w-[162px] left-[-40px] sm:left-[-50px] md:left-[-58px] top-[-120px] absolute flex flex-col justify-start items-start">
            {Array.from({ length: 200 }).map((_, i) => (
              <div
                key={i}
                className="self-stretch h-3 sm:h-4 rotate-[-45deg] origin-top-left outline outline-[0.5px] outline-[rgba(3,7,18,0.08)] outline-offset-[-0.25px]"
              />
            ))}
          </div>
        </div>

        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0 border-l border-r border-[rgba(55,50,47,0.12)]">
          {/* Getting Started */}
          <div className="border-b border-r-0 md:border-r lg:border-r border-[rgba(55,50,47,0.12)] p-4 sm:p-6 md:p-8 lg:p-12 flex flex-col justify-start items-start gap-4 sm:gap-6">
            <div className="flex flex-col gap-2">
              <h3 className="text-[#37322F] text-lg sm:text-xl font-semibold leading-tight font-sans">
                Getting Started
              </h3>
              <p className="text-[#605A57] text-sm md:text-base font-normal leading-relaxed font-sans">
                Learn the basics of brand tracking and set up your first monitoring campaign.
              </p>
            </div>
            <div className="space-y-2">
              <div className="text-[#37322F] text-sm font-medium">Quick Start Guide</div>
              <div className="text-[#37322F] text-sm font-medium">Account Setup</div>
              <div className="text-[#37322F] text-sm font-medium">First Brand Tracker</div>
            </div>
          </div>

          {/* API Reference */}
          <div className="border-b border-r-0 lg:border-r border-[rgba(55,50,47,0.12)] p-4 sm:p-6 md:p-8 lg:p-12 flex flex-col justify-start items-start gap-4 sm:gap-6">
            <div className="flex flex-col gap-2">
              <h3 className="text-[#37322F] text-lg sm:text-xl font-semibold leading-tight font-sans">
                API Reference
              </h3>
              <p className="text-[#605A57] text-sm md:text-base font-normal leading-relaxed font-sans">
                Complete API documentation for integrating brand tracking into your applications.
              </p>
            </div>
            <div className="space-y-2">
              <div className="text-[#37322F] text-sm font-medium">Authentication</div>
              <div className="text-[#37322F] text-sm font-medium">Brand Tracking API</div>
              <div className="text-[#37322F] text-sm font-medium">Webhooks</div>
            </div>
          </div>

          {/* Examples */}
          <div className="border-b md:border-b-0 lg:border-b border-[rgba(55,50,47,0.12)] p-4 sm:p-6 md:p-8 lg:p-12 flex flex-col justify-start items-start gap-4 sm:gap-6">
            <div className="flex flex-col gap-2">
              <h3 className="text-[#37322F] text-lg sm:text-xl font-semibold leading-tight font-sans">
                Examples
              </h3>
              <p className="text-[#605A57] text-sm md:text-base font-normal leading-relaxed font-sans">
                Real-world examples and use cases to inspire your brand tracking strategy.
              </p>
            </div>
            <div className="space-y-2">
              <div className="text-[#37322F] text-sm font-medium">E-commerce Tracking</div>
              <div className="text-[#37322F] text-sm font-medium">SaaS Monitoring</div>
              <div className="text-[#37322F] text-sm font-medium">Competitor Analysis</div>
            </div>
          </div>
        </div>

        <div className="w-4 sm:w-6 md:w-8 lg:w-12 self-stretch relative overflow-hidden">
          {/* Right decorative pattern */}
          <div className="w-[120px] sm:w-[140px] md:w-[162px] left-[-40px] sm:left-[-50px] md:left-[-58px] top-[-120px] absolute flex flex-col justify-start items-start">
            {Array.from({ length: 200 }).map((_, i) => (
              <div
                key={i}
                className="self-stretch h-3 sm:h-4 rotate-[-45deg] origin-top-left outline outline-[0.5px] outline-[rgba(3,7,18,0.08)] outline-offset-[-0.25px]"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}


