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

export default function FAQSection() {
  const faqs = [
    {
      question: "How does brand tracking work?",
      answer: "Our platform uses AI-powered web search to monitor mentions of your brand across various online sources. We analyze search results and provide real-time notifications when your brand is mentioned."
    },
    {
      question: "What types of queries can I track?",
      answer: "You can track any search query related to your brand, including product names, company mentions, competitor comparisons, and industry-specific terms."
    },
    {
      question: "How accurate is the brand detection?",
      answer: "Our AI-powered system has a 95%+ accuracy rate in detecting brand mentions. We use advanced natural language processing to distinguish between genuine mentions and false positives."
    },
    {
      question: "Can I track multiple brands?",
      answer: "Yes! Depending on your plan, you can track multiple brands and queries simultaneously. Our Professional plan supports up to 50 trackers, while Enterprise offers unlimited tracking."
    },
    {
      question: "How often are searches performed?",
      answer: "Searches are performed in real-time when you create a tracker, and then automatically repeated based on your settings. You can choose between hourly, daily, or weekly monitoring frequencies."
    },
    {
      question: "Is there an API available?",
      answer: "Yes! We provide a comprehensive REST API for Professional and Enterprise users, allowing you to integrate brand tracking directly into your applications and workflows."
    }
  ];

  return (
    <div className="w-full border-b border-[rgba(55,50,47,0.12)] flex flex-col justify-center items-center">
      {/* Header Section */}
      <div className="self-stretch px-4 sm:px-6 md:px-8 lg:px-0 lg:max-w-[1060px] lg:w-[1060px] py-8 sm:py-12 md:py-16 border-b border-[rgba(55,50,47,0.12)] flex justify-center items-center gap-6">
        <div className="w-full max-w-[616px] lg:w-[616px] px-4 sm:px-6 py-4 sm:py-5 shadow-[0px_2px_4px_rgba(50,45,43,0.06)] overflow-hidden rounded-lg flex flex-col justify-start items-center gap-3 sm:gap-4 shadow-none">
          <Badge
            icon={
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="6" cy="6" r="5" stroke="#37322F" strokeWidth="1" fill="none" />
                <path d="M6 3v3l2 2" stroke="#37322F" strokeWidth="1" fill="none" />
              </svg>
            }
            text="FAQ"
          />
          <div className="w-full max-w-[598.06px] lg:w-[598.06px] text-center flex justify-center flex-col text-[#49423D] text-xl sm:text-2xl md:text-3xl lg:text-5xl font-semibold leading-tight md:leading-[60px] font-sans tracking-tight">
            Frequently asked questions
          </div>
          <div className="self-stretch text-center text-[#605A57] text-sm sm:text-base font-normal leading-6 sm:leading-7 font-sans">
            Everything you need to know about Brand Tracker
            <br />
            and how it can help your business.
          </div>
        </div>
      </div>

      {/* FAQ Grid */}
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

        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-0 border-l border-r border-[rgba(55,50,47,0.12)]">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className={`border-b border-r-0 md:border-r border-[rgba(55,50,47,0.12)] p-4 sm:p-6 md:p-8 lg:p-12 flex flex-col justify-start items-start gap-4 sm:gap-6 ${
                index % 2 === 1 ? 'md:border-r-0' : ''
              } ${index >= faqs.length - 2 ? 'md:border-b-0' : ''}`}
            >
              <div className="flex flex-col gap-3">
                <h3 className="text-[#37322F] text-lg sm:text-xl font-semibold leading-tight font-sans">
                  {faq.question}
                </h3>
                <p className="text-[#605A57] text-sm md:text-base font-normal leading-relaxed font-sans">
                  {faq.answer}
                </p>
              </div>
            </div>
          ))}
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


