"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import DocumentationSection from "../documentation-section"
import TestimonialsSection from "../testimonials-section"
import FAQSection from "../faq-section"
import CTASection from "../cta-section"
import FooterSection from "../footer-section"

// Reusable Badge Component
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

export default function LandingPage() {
  const [activeCard, setActiveCard] = useState(0)
  const [progress, setProgress] = useState(0)
  const mountedRef = useRef(true)

  useEffect(() => {
    const progressInterval = setInterval(() => {
      if (!mountedRef.current) return

      setProgress((prev) => {
        if (prev >= 100) {
          if (mountedRef.current) {
            setActiveCard((current) => (current + 1) % 3)
          }
          return 0
        }
        return prev + 2 // 2% every 100ms = 5 seconds total
      })
    }, 100)

    return () => {
      clearInterval(progressInterval)
      mountedRef.current = false
    }
  }, [])

  useEffect(() => {
    return () => {
      mountedRef.current = false
    }
  }, [])

  const handleCardClick = (index: number) => {
    if (!mountedRef.current) return
    setActiveCard(index)
    setProgress(0)
  }

  const handleSearch = () => {
    const brandName = (document.getElementById('brandName') as HTMLInputElement)?.value || '';
    const query = (document.getElementById('query') as HTMLInputElement)?.value || '';
    
    if (!brandName || !query) {
      alert("Please enter both brand name and query");
      return;
    }
    
    // Redirect to auth flow with tracking page redirect
    window.location.href = `/auth?brand=${encodeURIComponent(brandName)}&query=${encodeURIComponent(query)}&redirect=active`;
  };

  return (
    <div className="w-full min-h-screen relative bg-[#F7F5F3] overflow-x-hidden flex flex-col justify-start items-center">
      <div className="relative flex flex-col justify-start items-center w-full">
        {/* Main container with proper margins */}
        <div className="w-full max-w-none px-4 sm:px-6 md:px-8 lg:px-0 lg:max-w-[1060px] lg:w-[1060px] relative flex flex-col justify-start items-start min-h-screen">
          {/* Left vertical line */}
          <div className="w-[1px] h-full absolute left-4 sm:left-6 md:left-8 lg:left-0 top-0 bg-[rgba(55,50,47,0.12)] shadow-[1px_0px_0px_white] z-0"></div>

          {/* Right vertical line */}
          <div className="w-[1px] h-full absolute right-4 sm:right-6 md:right-8 lg:right-0 top-0 bg-[rgba(55,50,47,0.12)] shadow-[1px_0px_0px_white] z-0"></div>

          <div className="self-stretch pt-[9px] overflow-hidden border-b border-[rgba(55,50,47,0.06)] flex flex-col justify-center items-center gap-4 sm:gap-6 md:gap-8 lg:gap-[66px] relative z-10">
            {/* Navigation */}
            <div className="w-full h-12 sm:h-14 md:h-16 lg:h-[84px] absolute left-0 top-0 flex justify-center items-center z-20 px-6 sm:px-8 md:px-12 lg:px-0">
              <div className="w-full h-0 absolute left-0 top-6 sm:top-7 md:top-8 lg:top-[42px] border-t border-[rgba(55,50,47,0.12)] shadow-[0px_1px_0px_white]"></div>

              <div className="w-full max-w-[calc(100%-32px)] sm:max-w-[calc(100%-48px)] md:max-w-[calc(100%-64px)] lg:max-w-[700px] lg:w-[700px] h-10 sm:h-11 md:h-12 py-1.5 sm:py-2 px-3 sm:px-4 md:px-4 pr-2 sm:pr-3 bg-[#F7F5F3] backdrop-blur-sm shadow-[0px_0px_0px_2px_white] overflow-hidden rounded-[50px] flex justify-between items-center relative z-30">
                <div className="flex justify-center items-center">
                  <div className="flex justify-start items-center">
                    <div className="flex flex-col justify-center text-[#2F3037] text-sm sm:text-base md:text-lg lg:text-xl font-medium leading-5 font-sans">
                      Brand Tracker
                    </div>
                  </div>
                  <div className="pl-3 sm:pl-4 md:pl-5 lg:pl-5 flex justify-start items-start hidden sm:flex flex-row gap-2 sm:gap-3 md:gap-4 lg:gap-4">
                    <div className="flex justify-start items-center">
                      <a href="#features" className="flex flex-col justify-center text-[rgba(49,45,43,0.80)] text-xs md:text-[13px] font-medium leading-[14px] font-sans hover:text-[#37322F] transition-colors">
                        Features
                      </a>
                    </div>
                    <div className="flex justify-start items-center">
                      <a href="#pricing" className="flex flex-col justify-center text-[rgba(49,45,43,0.80)] text-xs md:text-[13px] font-medium leading-[14px] font-sans hover:text-[#37322F] transition-colors">
                        Pricing
                      </a>
                    </div>
                    <div className="flex justify-start items-center">
                      <div className="flex flex-col justify-center text-[rgba(49,45,43,0.80)] text-xs md:text-[13px] font-medium leading-[14px] font-sans">
                        Docs
                      </div>
                    </div>
                  </div>
                </div>
                <div className="h-6 sm:h-7 md:h-8 flex justify-start items-start gap-2 sm:gap-3">
                  <div 
                    onClick={() => window.location.href = '/auth'}
                    className="px-2 sm:px-3 md:px-[14px] py-1 sm:py-[6px] bg-white shadow-[0px_1px_2px_rgba(55,50,47,0.12)] overflow-hidden rounded-full flex justify-center items-center cursor-pointer hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex flex-col justify-center text-[#37322F] text-xs md:text-[13px] font-medium leading-5 font-sans">
                      Log in
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Hero Section */}
            <div className="pt-16 sm:pt-20 md:pt-24 lg:pt-[216px] pb-8 sm:pb-12 md:pb-16 flex flex-col justify-start items-center px-2 sm:px-4 md:px-8 lg:px-0 w-full sm:pl-0 sm:pr-0 pl-0 pr-0">
              <div className="w-full max-w-[937px] lg:w-[937px] flex flex-col justify-center items-center gap-3 sm:gap-4 md:gap-5 lg:gap-6">
                <div className="self-stretch rounded-[3px] flex flex-col justify-center items-center gap-4 sm:gap-5 md:gap-6 lg:gap-8">
                  <div className="w-full max-w-[748.71px] lg:w-[748.71px] text-center flex justify-center flex-col text-[#37322F] text-[24px] xs:text-[28px] sm:text-[36px] md:text-[52px] lg:text-[80px] font-normal leading-[1.1] sm:leading-[1.15] md:leading-[1.2] lg:leading-24 font-serif px-2 sm:px-4 md:px-0">
                    Track your brand mentions
                    <br />
                    across AI platforms
                  </div>
                  <div className="w-full max-w-[506.08px] lg:w-[506.08px] text-center flex justify-center flex-col text-[rgba(55,50,47,0.80)] sm:text-lg md:text-xl leading-[1.4] sm:leading-[1.45] md:leading-[1.5] lg:leading-7 font-sans px-2 sm:px-4 md:px-0 lg:text-lg font-medium text-sm">
                    Monitor how your brand appears in AI responses
                    <br className="hidden sm:block" />
                    and track mentions across different platforms.
                  </div>
                </div>
              </div>

              {/* Search Form */}
              <div className="w-full max-w-[497px] lg:w-[497px] flex flex-col justify-center items-center gap-6 sm:gap-8 md:gap-10 lg:gap-12 relative z-10 mt-6 sm:mt-8 md:mt-10 lg:mt-12">
                <div className="w-full flex flex-col gap-4">
                  <div className="w-full flex flex-col gap-2">
                    <input
                      id="brandName"
                      type="text"
                      placeholder="Enter your brand name"
                      className="w-full px-4 py-3 rounded-lg border border-[rgba(55,50,47,0.12)] bg-white text-[#37322F] placeholder-[rgba(55,50,47,0.6)] focus:outline-none focus:ring-2 focus:ring-[#37322F] focus:border-transparent"
                    />
                    <input
                      id="query"
                      type="text"
                      placeholder="Enter search query (e.g., 'best CRM software')"
                      className="w-full px-4 py-3 rounded-lg border border-[rgba(55,50,47,0.12)] bg-white text-[#37322F] placeholder-[rgba(55,50,47,0.6)] focus:outline-none focus:ring-2 focus:ring-[#37322F] focus:border-transparent"
                    />
                  </div>
                  <div className="backdrop-blur-[8.25px] flex justify-start items-center gap-4">
                    <div 
                      onClick={handleSearch}
                      className="h-10 sm:h-11 md:h-12 px-6 sm:px-8 md:px-10 lg:px-12 py-2 sm:py-[6px] relative bg-[#37322F] shadow-[0px_0px_0px_2.5px_rgba(255,255,255,0.08)_inset] overflow-hidden rounded-full flex justify-center items-center cursor-pointer hover:bg-[#2a2523] transition-colors"
                    >
                      <div className="w-20 sm:w-24 md:w-28 lg:w-44 h-[41px] absolute left-0 top-[-0.5px] bg-gradient-to-b from-[rgba(255,255,255,0)] to-[rgba(0,0,0,0.10)] mix-blend-multiply"></div>
                      <div className="flex flex-col justify-center text-white text-sm sm:text-base md:text-[15px] font-medium leading-5 font-sans">
                        Start tracking
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="absolute top-[232px] sm:top-[248px] md:top-[264px] lg:top-[320px] left-1/2 transform -translate-x-1/2 z-0 pointer-events-none">
                <img
                  src="/mask-group-pattern.svg"
                  alt=""
                  className="w-[936px] sm:w-[1404px] md:w-[2106px] lg:w-[2808px] h-auto opacity-30 sm:opacity-40 md:opacity-50 mix-blend-multiply"
                  style={{
                    filter: "hue-rotate(15deg) saturate(0.7) brightness(1.2)",
                  }}
                />
              </div>

              <div className="w-full max-w-[960px] lg:w-[960px] pt-2 sm:pt-4 pb-6 sm:pb-8 md:pb-10 px-2 sm:px-4 md:px-6 lg:px-11 flex flex-col justify-center items-center gap-2 relative z-5 my-8 sm:my-12 md:my-16 lg:my-16 mb-0 lg:pb-0">
                <div className="w-full max-w-[960px] lg:w-[960px] h-[200px] sm:h-[280px] md:h-[450px] lg:h-[695.55px] bg-white shadow-[0px_0px_0px_0.9056603908538818px_rgba(0,0,0,0.08)] overflow-hidden rounded-[6px] sm:rounded-[8px] lg:rounded-[9.06px] flex flex-col justify-start items-start">
                  {/* Dashboard Content */}
                  <div className="self-stretch flex-1 flex justify-start items-start">
                    {/* Main Content */}
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="relative w-full h-full overflow-hidden">
                        {/* Product Image 1 - Brand Tracking Dashboard */}
                        <div
                          className={`absolute inset-0 transition-all duration-500 ease-in-out ${
                            activeCard === 0 ? "opacity-100 scale-100 blur-0" : "opacity-0 scale-95 blur-sm"
                          }`}
                        >
                          <div className="w-full h-full bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-8">
                            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
                              <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-gray-900">Brand Mentions</h3>
                                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                              </div>
                              <div className="space-y-3">
                                <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                                  <div className="flex items-center space-x-3">
                                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">N</div>
                                    <div>
                                      <div className="font-medium text-gray-900">NexusAI</div>
                                      <div className="text-sm text-gray-500">best CRM software</div>
                                    </div>
                                  </div>
                                  <div className="text-green-600 text-sm font-medium">Mentioned</div>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                                  <div className="flex items-center space-x-3">
                                    <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold">Q</div>
                                    <div>
                                      <div className="font-medium text-gray-900">QuantumFlow</div>
                                      <div className="text-sm text-gray-500">project management tools</div>
                                    </div>
                                  </div>
                                  <div className="text-green-600 text-sm font-medium">Mentioned</div>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                                  <div className="flex items-center space-x-3">
                                    <div className="w-8 h-8 bg-gray-500 rounded-full flex items-center justify-center text-white text-sm font-bold">D</div>
                                    <div>
                                      <div className="font-medium text-gray-900">DataVault</div>
                                      <div className="text-sm text-gray-500">note taking apps</div>
                                    </div>
                                  </div>
                                  <div className="text-red-500 text-sm font-medium">Not Found</div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Product Image 2 - Analytics Dashboard */}
                        <div
                          className={`absolute inset-0 transition-all duration-500 ease-in-out ${
                            activeCard === 1 ? "opacity-100 scale-100 blur-0" : "opacity-0 scale-95 blur-sm"
                          }`}
                        >
                          <div className="w-full h-full bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-8">
                            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
                              <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-gray-900">Analytics</h3>
                                <div className="text-sm text-gray-500">Last 7 days</div>
                              </div>
                              <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                  <div className="text-sm text-gray-600">Total Searches</div>
                                  <div className="font-semibold text-gray-900">1,247</div>
                                </div>
                                <div className="flex items-center justify-between">
                                  <div className="text-sm text-gray-600">Mentions Found</div>
                                  <div className="font-semibold text-green-600">89</div>
                                </div>
                                <div className="flex items-center justify-between">
                                  <div className="text-sm text-gray-600">Success Rate</div>
                                  <div className="font-semibold text-blue-600">7.1%</div>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div className="bg-green-500 h-2 rounded-full" style={{width: '71%'}}></div>
                                </div>
                                <div className="text-xs text-gray-500 text-center">Mention Rate Trend</div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Product Image 3 - Source Analysis */}
                        <div
                          className={`absolute inset-0 transition-all duration-500 ease-in-out ${
                            activeCard === 2 ? "opacity-100 scale-100 blur-0" : "opacity-0 scale-95 blur-sm"
                          }`}
                        >
                          <div className="w-full h-full bg-gradient-to-br from-purple-50 to-violet-100 flex items-center justify-center p-8">
                            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
                              <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-gray-900">Source Tracking</h3>
                                <div className="text-sm text-gray-500">3 sources</div>
                              </div>
                              <div className="space-y-3">
                                <div className="p-3 bg-gray-50 rounded">
                                  <div className="flex items-center justify-between mb-2">
                                    <div className="text-sm font-medium text-gray-900">techcrunch.com</div>
                                    <div className="text-xs text-green-600">✓ Found</div>
                                  </div>
                                  <div className="text-xs text-gray-500">NexusAI raises $23M Series A...</div>
                                </div>
                                <div className="p-3 bg-gray-50 rounded">
                                  <div className="flex items-center justify-between mb-2">
                                    <div className="text-sm font-medium text-gray-900">producthunt.com</div>
                                    <div className="text-xs text-green-600">✓ Found</div>
                                  </div>
                                  <div className="text-xs text-gray-500">NexusAI - Modern CRM for startups</div>
                                </div>
                                <div className="p-3 bg-gray-50 rounded">
                                  <div className="flex items-center justify-between mb-2">
                                    <div className="text-sm font-medium text-gray-900">ycombinator.com</div>
                                    <div className="text-xs text-green-600">✓ Found</div>
                                  </div>
                                  <div className="text-xs text-gray-500">NexusAI (YC S22) - CRM platform</div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="self-stretch border-t border-[#E0DEDB] border-b border-[#E0DEDB] flex justify-center items-start">
                <div className="w-4 sm:w-6 md:w-8 lg:w-12 self-stretch relative overflow-hidden">
                  {/* Left decorative pattern */}
                  <div className="w-[120px] sm:w-[140px] md:w-[162px] left-[-40px] sm:left-[-50px] md:left-[-58px] top-[-120px] absolute flex flex-col justify-start items-start">
                    {Array.from({ length: 50 }).map((_, i) => (
                      <div
                        key={i}
                        className="self-stretch h-3 sm:h-4 rotate-[-45deg] origin-top-left outline outline-[0.5px] outline-[rgba(3,7,18,0.08)] outline-offset-[-0.25px]"
                      ></div>
                    ))}
                  </div>
                </div>

                <div className="flex-1 px-0 sm:px-2 md:px-0 flex flex-col md:flex-row justify-center items-stretch gap-0">
                  {/* Feature Cards */}
                  <FeatureCard
                    title="Track brand mentions"
                    description="Monitor how your brand appears in AI responses across different platforms and queries."
                    isActive={activeCard === 0}
                    progress={activeCard === 0 ? progress : 0}
                    onClick={() => handleCardClick(0)}
                  />
                  <FeatureCard
                    title="Analytics & insights"
                    description="Get real-time insights into brand visibility, mention trends, and competitive analysis."
                    isActive={activeCard === 1}
                    progress={activeCard === 1 ? progress : 0}
                    onClick={() => handleCardClick(1)}
                  />
                  <FeatureCard
                    title="Source tracking"
                    description="Identify and track the sources where your brand is mentioned with clickable links."
                    isActive={activeCard === 2}
                    progress={activeCard === 2 ? progress : 0}
                    onClick={() => handleCardClick(2)}
                  />
                </div>

                <div className="w-4 sm:w-6 md:w-8 lg:w-12 self-stretch relative overflow-hidden">
                  {/* Right decorative pattern */}
                  <div className="w-[120px] sm:w-[140px] md:w-[162px] left-[-40px] sm:left-[-50px] md:left-[-58px] top-[-120px] absolute flex flex-col justify-start items-start">
                    {Array.from({ length: 50 }).map((_, i) => (
                      <div
                        key={i}
                        className="self-stretch h-3 sm:h-4 rotate-[-45deg] origin-top-left outline outline-[0.5px] outline-[rgba(3,7,18,0.08)] outline-offset-[-0.25px]"
                      ></div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Social Proof Section */}
              <div className="w-full border-b border-[rgba(55,50,47,0.12)] flex flex-col justify-center items-center">
                <div className="self-stretch px-4 sm:px-6 md:px-24 py-8 sm:py-12 md:py-16 border-b border-[rgba(55,50,47,0.12)] flex justify-center items-center gap-6">
                  <div className="w-full max-w-[586px] px-4 sm:px-6 py-4 sm:py-5 shadow-[0px_2px_4px_rgba(50,45,43,0.06)] overflow-hidden rounded-lg flex flex-col justify-start items-center gap-3 sm:gap-4 shadow-none">
                    <Badge
                      icon={
                        <svg width="12" height="10" viewBox="0 0 12 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <rect x="1" y="3" width="4" height="6" stroke="#37322F" strokeWidth="1" fill="none" />
                          <rect x="7" y="1" width="4" height="8" stroke="#37322F" strokeWidth="1" fill="none" />
                          <rect x="2" y="4" width="1" height="1" fill="#37322F" />
                          <rect x="3.5" y="4" width="1" height="1" fill="#37322F" />
                          <rect x="2" y="5.5" width="1" height="1" fill="#37322F" />
                          <rect x="3.5" y="5.5" width="1" height="1" fill="#37322F" />
                          <rect x="8" y="2" width="1" height="1" fill="#37322F" />
                          <rect x="9.5" y="2" width="1" height="1" fill="#37322F" />
                          <rect x="8" y="3.5" width="1" height="1" fill="#37322F" />
                          <rect x="9.5" y="3.5" width="1" height="1" fill="#37322F" />
                          <rect x="8" y="5" width="1" height="1" fill="#37322F" />
                          <rect x="9.5" y="5" width="1" height="1" fill="#37322F" />
                        </svg>
                      }
                      text="Trusted by brands"
                    />
                    <div className="w-full max-w-[472.55px] text-center flex justify-center flex-col text-[#49423D] text-xl sm:text-2xl md:text-3xl lg:text-5xl font-semibold leading-tight md:leading-[60px] font-sans tracking-tight">
                      Monitor your brand presence
                    </div>
                    <div className="self-stretch text-center text-[#605A57] text-sm sm:text-base font-normal leading-6 sm:leading-7 font-sans">
                      Track how your brand appears in AI responses
                      <br className="hidden sm:block" />
                      and stay ahead of the competition.
                    </div>
                  </div>
                </div>

                {/* Logo Grid */}
                <div className="self-stretch border-[rgba(55,50,47,0.12)] flex justify-center items-start border-t border-b-0">
                  <div className="w-4 sm:w-6 md:w-8 lg:w-12 self-stretch relative overflow-hidden">
                    {/* Left decorative pattern */}
                    <div className="w-[120px] sm:w-[140px] md:w-[162px] left-[-40px] sm:left-[-50px] md:left-[-58px] top-[-120px] absolute flex flex-col justify-start items-start">
                      {Array.from({ length: 50 }).map((_, i) => (
                        <div
                          key={i}
                          className="self-stretch h-3 sm:h-4 rotate-[-45deg] origin-top-left outline outline-[0.5px] outline-[rgba(3,7,18,0.08)] outline-offset-[-0.25px]"
                        />
                      ))}
                    </div>
                  </div>

                  <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 md:grid-cols-4 gap-0 border-l border-r border-[rgba(55,50,47,0.12)]">
                    {/* Logo Grid - AI-generated brand names */}
                    {[
                      { name: "NexusAI", color: "from-blue-500 to-blue-600" },
                      { name: "QuantumFlow", color: "from-purple-500 to-purple-600" },
                      { name: "DataVault", color: "from-gray-600 to-gray-700" },
                      { name: "CloudSync", color: "from-pink-500 to-pink-600" },
                      { name: "TechForge", color: "from-indigo-500 to-indigo-600" },
                      { name: "ByteCore", color: "from-black to-gray-800" },
                      { name: "StreamLine", color: "from-green-500 to-green-600" },
                      { name: "PixelWave", color: "from-orange-500 to-orange-600" }
                    ].map((brand, index) => {
                      const isMobileFirstColumn = index % 2 === 0
                      const isMobileLastColumn = index % 2 === 1
                      const isDesktopFirstColumn = index % 4 === 0
                      const isDesktopLastColumn = index % 4 === 3
                      const isMobileBottomRow = index >= 6
                      const isDesktopTopRow = index < 4
                      const isDesktopBottomRow = index >= 4

                      return (
                        <div
                          key={index}
                          className={`
                            h-24 xs:h-28 sm:h-32 md:h-36 lg:h-40 flex justify-center items-center gap-1 xs:gap-2 sm:gap-3
                            border-b border-[rgba(227,226,225,0.5)]
                            ${index < 6 ? "sm:border-b-[0.5px]" : "sm:border-b"}
                            ${index >= 6 ? "border-b" : ""}
                            ${isMobileFirstColumn ? "border-r-[0.5px]" : ""}
                            sm:border-r-[0.5px] sm:border-l-0
                            ${isDesktopFirstColumn ? "md:border-l" : "md:border-l-[0.5px]"}
                            ${isDesktopLastColumn ? "md:border-r" : "md:border-r-[0.5px]"}
                            ${isDesktopTopRow ? "md:border-b-[0.5px]" : ""}
                            ${isDesktopBottomRow ? "md:border-t-[0.5px] md:border-b" : ""}
                            border-[#E3E2E1]
                          `}
                        >
                          <div className={`w-6 h-6 xs:w-7 xs:h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 lg:w-10 lg:h-10 relative shadow-[0px_-4px_8px_rgba(255,255,255,0.64)_inset] overflow-hidden rounded-full`}>
                            <div className={`w-full h-full bg-gradient-to-br ${brand.color} rounded-full flex items-center justify-center text-white font-bold text-xs`}>
                              {brand.name.charAt(0)}
                            </div>
                          </div>
                          <div className="text-center flex justify-center flex-col text-[#37322F] text-sm xs:text-base sm:text-lg md:text-xl lg:text-2xl font-medium leading-tight md:leading-9 font-sans">
                            {brand.name}
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  <div className="w-4 sm:w-6 md:w-8 lg:w-12 self-stretch relative overflow-hidden">
                    {/* Right decorative pattern */}
                    <div className="w-[120px] sm:w-[140px] md:w-[162px] left-[-40px] sm:left-[-50px] md:left-[-58px] top-[-120px] absolute flex flex-col justify-start items-start">
                      {Array.from({ length: 50 }).map((_, i) => (
                        <div
                          key={i}
                          className="self-stretch h-3 sm:h-4 rotate-[-45deg] origin-top-left outline outline-[0.5px] outline-[rgba(3,7,18,0.08)] outline-offset-[-0.25px]"
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Features Section */}
              <div id="features" className="w-full border-b border-[rgba(55,50,47,0.12)] flex flex-col justify-center items-center">
                {/* Header Section */}
                <div className="self-stretch px-4 sm:px-6 md:px-8 lg:px-0 lg:max-w-[1060px] lg:w-[1060px] py-8 sm:py-12 md:py-16 border-b border-[rgba(55,50,47,0.12)] flex justify-center items-center gap-6">
                  <div className="w-full max-w-[616px] lg:w-[616px] px-4 sm:px-6 py-4 sm:py-5 shadow-[0px_2px_4px_rgba(50,45,43,0.06)] overflow-hidden rounded-lg flex flex-col justify-start items-center gap-3 sm:gap-4 shadow-none">
                    <Badge
                      icon={
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <rect x="1" y="1" width="4" height="4" stroke="#37322F" strokeWidth="1" fill="none" />
                          <rect x="7" y="1" width="4" height="4" stroke="#37322F" strokeWidth="1" fill="none" />
                          <rect x="1" y="7" width="4" height="4" stroke="#37322F" strokeWidth="1" fill="none" />
                          <rect x="7" y="7" width="4" height="4" stroke="#37322F" strokeWidth="1" fill="none" />
                        </svg>
                      }
                      text="Features"
                    />
                    <div className="w-full max-w-[598.06px] lg:w-[598.06px] text-center flex justify-center flex-col text-[#49423D] text-xl sm:text-2xl md:text-3xl lg:text-5xl font-semibold leading-tight md:leading-[60px] font-sans tracking-tight">
                      Everything you need to track your brand
                    </div>
                    <div className="self-stretch text-center text-[#605A57] text-sm sm:text-base font-normal leading-6 sm:leading-7 font-sans">
                      Monitor mentions, analyze trends, and track sources
                      <br />
                      all in one powerful platform.
                    </div>
                  </div>
                </div>

                {/* Features Grid Content */}
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
                    {/* Top Left - Real-time Monitoring */}
                    <div className="border-b border-r-0 md:border-r border-[rgba(55,50,47,0.12)] p-4 sm:p-6 md:p-8 lg:p-12 flex flex-col justify-start items-start gap-4 sm:gap-6">
                      <div className="flex flex-col gap-2">
                        <h3 className="text-[#37322F] text-lg sm:text-xl font-semibold leading-tight font-sans">
                          Real-time monitoring
                        </h3>
                        <p className="text-[#605A57] text-sm md:text-base font-normal leading-relaxed font-sans">
                          Get instant notifications when your brand is mentioned in AI responses across different platforms.
                        </p>
                      </div>
                      <div className="w-full h-[200px] sm:h-[250px] md:h-[300px] rounded-lg flex items-center justify-center overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-100">
                        <div className="bg-white rounded-lg shadow-sm p-4 w-full max-w-xs">
                          <div className="flex items-center justify-between mb-3">
                            <div className="text-sm font-medium text-gray-900">Live Monitoring</div>
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                          </div>
                            <div className="space-y-2">
                              <div className="flex items-center space-x-2">
                                <div className="w-6 h-6 bg-blue-500 rounded flex items-center justify-center text-white text-xs font-bold">N</div>
                                <div className="text-xs text-gray-600">NexusAI mentioned in "best CRM"</div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <div className="w-6 h-6 bg-purple-500 rounded flex items-center justify-center text-white text-xs font-bold">Q</div>
                                <div className="text-xs text-gray-600">QuantumFlow found in "project tools"</div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <div className="w-6 h-6 bg-gray-400 rounded flex items-center justify-center text-white text-xs font-bold">D</div>
                                <div className="text-xs text-gray-500">DataVault not found in "note apps"</div>
                              </div>
                            </div>
                        </div>
                      </div>
                    </div>

                    {/* Top Right - Analytics */}
                    <div className="border-b border-[rgba(55,50,47,0.12)] p-4 sm:p-6 md:p-8 lg:p-12 flex flex-col justify-start items-start gap-4 sm:gap-6">
                      <div className="flex flex-col gap-2">
                        <h3 className="text-[#37322F] font-semibold leading-tight font-sans text-lg sm:text-xl">
                          Advanced analytics
                        </h3>
                        <p className="text-[#605A57] text-sm md:text-base font-normal leading-relaxed font-sans">
                          Track trends, analyze patterns, and get insights into how your brand performs across different queries.
                        </p>
                      </div>
                      <div className="w-full h-[200px] sm:h-[250px] md:h-[300px] rounded-lg flex overflow-hidden text-right items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100">
                        <div className="bg-white rounded-lg shadow-sm p-4 w-full max-w-xs">
                          <div className="text-sm font-medium text-gray-900 mb-3">Analytics Overview</div>
                          <div className="space-y-3">
                            <div className="flex justify-between items-center">
                              <div className="text-xs text-gray-600">Mentions</div>
                              <div className="text-sm font-semibold text-green-600">89</div>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-1.5">
                              <div className="bg-green-500 h-1.5 rounded-full" style={{width: '71%'}}></div>
                            </div>
                            <div className="flex justify-between items-center">
                              <div className="text-xs text-gray-600">Success Rate</div>
                              <div className="text-sm font-semibold text-blue-600">7.1%</div>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-1.5">
                              <div className="bg-blue-500 h-1.5 rounded-full" style={{width: '71%'}}></div>
                            </div>
                            <div className="text-xs text-gray-500 text-center">Last 7 days</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Left - Source tracking */}
                    <div className="border-r-0 md:border-r border-[rgba(55,50,47,0.12)] p-4 sm:p-6 md:p-8 lg:p-12 flex flex-col justify-start items-start gap-4 sm:gap-6 bg-transparent">
                      <div className="flex flex-col gap-2">
                        <h3 className="text-[#37322F] text-lg sm:text-xl font-semibold leading-tight font-sans">
                          Source tracking
                        </h3>
                        <p className="text-[#605A57] text-sm md:text-base font-normal leading-relaxed font-sans">
                          Identify and track the exact sources where your brand is mentioned with clickable links and detailed analysis.
                        </p>
                      </div>
                      <div className="w-full h-[200px] sm:h-[250px] md:h-[300px] rounded-lg flex overflow-hidden justify-center items-center relative bg-gradient-to-br from-purple-50 to-violet-100">
                        <div className="bg-white rounded-lg shadow-sm p-4 w-full max-w-xs">
                          <div className="text-sm font-medium text-gray-900 mb-3">Source Links</div>
                            <div className="space-y-2">
                              <div className="p-2 bg-gray-50 rounded text-xs">
                                <div className="text-blue-600 hover:underline cursor-pointer">techcrunch.com</div>
                                <div className="text-gray-500">NexusAI raises $23M...</div>
                              </div>
                              <div className="p-2 bg-gray-50 rounded text-xs">
                                <div className="text-blue-600 hover:underline cursor-pointer">producthunt.com</div>
                                <div className="text-gray-500">Modern CRM for startups</div>
                              </div>
                              <div className="p-2 bg-gray-50 rounded text-xs">
                                <div className="text-blue-600 hover:underline cursor-pointer">ycombinator.com</div>
                                <div className="text-gray-500">NexusAI (YC S22) platform</div>
                              </div>
                            </div>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Right - Competitive analysis */}
                    <div className="p-4 sm:p-6 md:p-8 lg:p-12 flex flex-col justify-start items-start gap-4 sm:gap-6">
                      <div className="flex flex-col gap-2">
                        <h3 className="text-[#37322F] text-lg sm:text-xl font-semibold leading-tight font-sans">
                          Competitive analysis
                        </h3>
                        <p className="text-[#605A57] text-sm md:text-base font-normal leading-relaxed font-sans">
                          Compare your brand performance against competitors and identify opportunities for improvement.
                        </p>
                      </div>
                      <div className="w-full h-[200px] sm:h-[250px] md:h-[300px] rounded-lg flex overflow-hidden items-center justify-center relative bg-gradient-to-br from-orange-50 to-amber-100">
                        <div className="bg-white rounded-lg shadow-sm p-4 w-full max-w-xs">
                          <div className="text-sm font-medium text-gray-900 mb-3">Competitor Analysis</div>
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <div className="text-xs text-gray-600">NexusAI</div>
                                <div className="text-xs font-semibold text-green-600">47%</div>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-1">
                                <div className="bg-green-500 h-1 rounded-full" style={{width: '47%'}}></div>
                              </div>
                              <div className="flex items-center justify-between">
                                <div className="text-xs text-gray-600">TechForge</div>
                                <div className="text-xs font-semibold text-blue-600">65%</div>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-1">
                                <div className="bg-blue-500 h-1 rounded-full" style={{width: '65%'}}></div>
                              </div>
                              <div className="flex items-center justify-between">
                                <div className="text-xs text-gray-600">ByteCore</div>
                                <div className="text-xs font-semibold text-purple-600">23%</div>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-1">
                                <div className="bg-purple-500 h-1 rounded-full" style={{width: '23%'}}></div>
                              </div>
                            </div>
                        </div>
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

              {/* Pricing Section */}
              <div id="pricing" className="w-full border-b border-[rgba(55,50,47,0.12)] flex flex-col justify-center items-center">
                {/* Header Section */}
                <div className="self-stretch px-4 sm:px-6 md:px-8 lg:px-0 lg:max-w-[1060px] lg:w-[1060px] py-8 sm:py-12 md:py-16 border-b border-[rgba(55,50,47,0.12)] flex justify-center items-center gap-6">
                  <div className="w-full max-w-[616px] lg:w-[616px] px-4 sm:px-6 py-4 sm:py-5 shadow-[0px_2px_4px_rgba(50,45,43,0.06)] overflow-hidden rounded-lg flex flex-col justify-start items-center gap-3 sm:gap-4 shadow-none">
                    <Badge
                      icon={
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <rect x="1" y="1" width="4" height="4" stroke="#37322F" strokeWidth="1" fill="none" />
                          <rect x="7" y="1" width="4" height="4" stroke="#37322F" strokeWidth="1" fill="none" />
                          <rect x="1" y="7" width="4" height="4" stroke="#37322F" strokeWidth="1" fill="none" />
                          <rect x="7" y="7" width="4" height="4" stroke="#37322F" strokeWidth="1" fill="none" />
                        </svg>
                      }
                      text="Pricing"
                    />
                    <div className="w-full max-w-[598.06px] lg:w-[598.06px] text-center flex justify-center flex-col text-[#49423D] text-xl sm:text-2xl md:text-3xl lg:text-5xl font-semibold leading-tight md:leading-[60px] font-sans tracking-tight">
                      Simple, transparent pricing
                    </div>
                    <div className="self-stretch text-center text-[#605A57] text-sm sm:text-base font-normal leading-6 sm:leading-7 font-sans">
                      Choose the plan that fits your team's needs
                      <br />
                      All plans include core tracking features.
                    </div>
                  </div>
                </div>

                {/* Pricing Cards */}
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

                  <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-0 border-l border-r border-[rgba(55,50,47,0.12)]">
                    {/* Starter Plan */}
                    <div className="border-b border-r-0 md:border-r border-[rgba(55,50,47,0.12)] p-4 sm:p-6 md:p-8 lg:p-12 flex flex-col justify-start items-start gap-4 sm:gap-6">
                      <div className="flex flex-col gap-2">
                        <h3 className="text-[#37322F] text-lg sm:text-xl font-semibold leading-tight font-sans">Starter</h3>
                        <div className="flex items-baseline">
                          <span className="text-[#37322F] text-3xl sm:text-4xl font-bold">$29</span>
                          <span className="text-[#605A57] ml-1">/month</span>
                        </div>
                        <p className="text-[#605A57] text-sm md:text-base font-normal leading-relaxed font-sans">
                          Perfect for small teams getting started with brand tracking.
                        </p>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                            <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <span className="text-[#605A57] text-sm">Up to 10 brand trackers</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                            <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <span className="text-[#605A57] text-sm">Real-time monitoring</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                            <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <span className="text-[#605A57] text-sm">Basic analytics</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                            <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <span className="text-[#605A57] text-sm">Email alerts</span>
                        </div>
                      </div>
                      <div 
                        onClick={handleSearch}
                        className="w-full h-10 px-6 py-2 relative bg-[#37322F] shadow-[0px_0px_0px_2.5px_rgba(255,255,255,0.08)_inset] overflow-hidden rounded-full flex justify-center items-center cursor-pointer hover:bg-[#2a2523] transition-colors mt-4"
                      >
                        <div className="flex flex-col justify-center text-white text-sm font-medium leading-5 font-sans">
                          Get Started
                        </div>
                      </div>
                    </div>

                    {/* Professional Plan */}
                    <div className="border-b border-r-0 md:border-r border-[rgba(55,50,47,0.12)] p-4 sm:p-6 md:p-8 lg:p-12 flex flex-col justify-start items-start gap-4 sm:gap-6 relative">
                      <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                        <div className="px-3 py-1 bg-[#37322F] text-white text-xs font-medium rounded-full">
                          Most Popular
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <h3 className="text-[#37322F] text-lg sm:text-xl font-semibold leading-tight font-sans">Professional</h3>
                        <div className="flex items-baseline">
                          <span className="text-[#37322F] text-3xl sm:text-4xl font-bold">$99</span>
                          <span className="text-[#605A57] ml-1">/month</span>
                        </div>
                        <p className="text-[#605A57] text-sm md:text-base font-normal leading-relaxed font-sans">
                          Ideal for growing marketing teams and agencies.
                        </p>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                            <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <span className="text-[#605A57] text-sm">Up to 50 brand trackers</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                            <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <span className="text-[#605A57] text-sm">Advanced analytics</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                            <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <span className="text-[#605A57] text-sm">Competitor analysis</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                            <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <span className="text-[#605A57] text-sm">API access</span>
                        </div>
                      </div>
                      <div 
                        onClick={handleSearch}
                        className="w-full h-10 px-6 py-2 relative bg-[#37322F] shadow-[0px_0px_0px_2.5px_rgba(255,255,255,0.08)_inset] overflow-hidden rounded-full flex justify-center items-center cursor-pointer hover:bg-[#2a2523] transition-colors mt-4"
                      >
                        <div className="flex flex-col justify-center text-white text-sm font-medium leading-5 font-sans">
                          Get Started
                        </div>
                      </div>
                    </div>

                    {/* Enterprise Plan */}
                    <div className="p-4 sm:p-6 md:p-8 lg:p-12 flex flex-col justify-start items-start gap-4 sm:gap-6">
                      <div className="flex flex-col gap-2">
                        <h3 className="text-[#37322F] text-lg sm:text-xl font-semibold leading-tight font-sans">Enterprise</h3>
                        <div className="flex items-baseline">
                          <span className="text-[#37322F] text-3xl sm:text-4xl font-bold">$299</span>
                          <span className="text-[#605A57] ml-1">/month</span>
                        </div>
                        <p className="text-[#605A57] text-sm md:text-base font-normal leading-relaxed font-sans">
                          For large organizations with complex monitoring needs.
                        </p>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                            <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <span className="text-[#605A57] text-sm">Unlimited trackers</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                            <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <span className="text-[#605A57] text-sm">Custom integrations</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                            <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <span className="text-[#605A57] text-sm">Priority support</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                            <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <span className="text-[#605A57] text-sm">Dedicated account manager</span>
                        </div>
                      </div>
                      <div 
                        onClick={handleSearch}
                        className="w-full h-10 px-6 py-2 relative bg-[#37322F] shadow-[0px_0px_0px_2.5px_rgba(255,255,255,0.08)_inset] overflow-hidden rounded-full flex justify-center items-center cursor-pointer hover:bg-[#2a2523] transition-colors mt-4"
                      >
                        <div className="flex flex-col justify-center text-white text-sm font-medium leading-5 font-sans">
                          Contact Sales
                        </div>
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

              {/* CTA Section */}
              <div className="w-full border-b border-[rgba(55,50,47,0.12)] flex flex-col justify-center items-center">
                <div className="self-stretch px-4 sm:px-6 md:px-24 py-8 sm:py-12 md:py-16 flex justify-center items-center gap-6">
                  <div className="w-full max-w-[586px] px-4 sm:px-6 py-4 sm:py-5 flex flex-col justify-start items-center gap-3 sm:gap-4">
                    <div className="w-full max-w-[472.55px] text-center flex justify-center flex-col text-[#49423D] text-xl sm:text-2xl md:text-3xl lg:text-5xl font-semibold leading-tight md:leading-[60px] font-sans tracking-tight">
                      Ready to track your brand?
                    </div>
                    <div className="self-stretch text-center text-[#605A57] text-sm sm:text-base font-normal leading-6 sm:leading-7 font-sans">
                      Start monitoring your brand mentions today
                      <br className="hidden sm:block" />
                      and stay ahead of the competition.
                    </div>
                    <div className="mt-4">
                      <div 
                        onClick={handleSearch}
                        className="h-10 sm:h-11 md:h-12 px-6 sm:px-8 md:px-10 lg:px-12 py-2 sm:py-[6px] relative bg-[#37322F] shadow-[0px_0px_0px_2.5px_rgba(255,255,255,0.08)_inset] overflow-hidden rounded-full flex justify-center items-center cursor-pointer hover:bg-[#2a2523] transition-colors"
                      >
                        <div className="w-20 sm:w-24 md:w-28 lg:w-44 h-[41px] absolute left-0 top-[-0.5px] bg-gradient-to-b from-[rgba(255,255,255,0)] to-[rgba(0,0,0,0.10)] mix-blend-multiply"></div>
                        <div className="flex flex-col justify-center text-white text-sm sm:text-base md:text-[15px] font-medium leading-5 font-sans">
                          Get started free
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="w-full py-8 sm:py-12 md:py-16 flex justify-center items-center">
                <div className="w-full max-w-[586px] text-center">
                  <div className="text-[#37322F] text-sm font-medium mb-2">Brand Tracker</div>
                  <div className="text-[#605A57] text-xs">© 2024 Brand Tracker. All rights reserved.</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// FeatureCard component definition inline
function FeatureCard({
  title,
  description,
  isActive,
  progress,
  onClick,
}: {
  title: string
  description: string
  isActive: boolean
  progress: number
  onClick: () => void
}) {
  return (
    <div
      className={`w-full md:flex-1 self-stretch px-6 py-5 overflow-hidden flex flex-col justify-start items-start gap-2 cursor-pointer relative border-b md:border-b-0 last:border-b-0 ${
        isActive
          ? "bg-white shadow-[0px_0px_0px_0.75px_#E0DEDB_inset]"
          : "border-l-0 border-r-0 md:border border-[#E0DEDB]/80"
      }`}
      onClick={onClick}
    >
      {isActive && (
        <div className="absolute top-0 left-0 w-full h-0.5 bg-[rgba(50,45,43,0.08)]">
          <div
            className="h-full bg-[#322D2B] transition-all duration-100 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      <div className="self-stretch flex justify-center flex-col text-[#49423D] text-sm md:text-sm font-semibold leading-6 md:leading-6 font-sans">
        {title}
      </div>
      <div className="self-stretch text-[#605A57] text-[13px] md:text-[13px] font-normal leading-[22px] md:leading-[22px] font-sans">
        {description}
      </div>
    </div>
  )
}