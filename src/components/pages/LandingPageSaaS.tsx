"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  TrendingUp, 
  Eye, 
  Shield,
  Zap,
  BarChart3,
  CheckCircle,
  ArrowRight,
  Rocket,
  Target,
  Users,
  Globe,
  Search,
  Bell,
  FileText,
  ArrowDown,
  PlayCircle,
  Clock,
  Activity,
  Link2,
  ExternalLink,
  Building2,
  Layers,
  Sparkles,
  Download,
  Mail,
  Phone,
  RefreshCw,
  AlertCircle,
  CheckCircle2
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState, useRef } from "react";

// Clock flip animation component with 3D flip effect
function FlipText({ words, className = "" }: { words: string[]; className?: string }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [nextIndex, setNextIndex] = useState(1);
  const [isFlipping, setIsFlipping] = useState(false);
  const [flipKey, setFlipKey] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsFlipping(true);
      setTimeout(() => {
        setCurrentIndex((prev) => {
          const newIndex = (prev + 1) % words.length;
          setNextIndex((newIndex + 1) % words.length);
          setFlipKey((k) => k + 1);
          setIsFlipping(false);
          return newIndex;
        });
      }, 600); // Half of flip animation duration
    }, 3500); // Change word every 3.5 seconds

    return () => clearInterval(interval);
  }, [words]);

  return (
    <span 
      className={`inline-block relative ${className}`} 
      style={{ 
        perspective: '1000px',
        perspectiveOrigin: 'center center'
      }}
    >
      <span
        key={`current-${currentIndex}-${flipKey}`}
        className="inline-block relative"
        style={{
          transformStyle: 'preserve-3d',
          transition: 'transform 0.6s cubic-bezier(0.37, 0, 0.63, 1)',
          transform: isFlipping ? 'rotateX(-90deg)' : 'rotateX(0deg)',
          opacity: isFlipping ? 0 : 1,
        }}
      >
        {words[currentIndex]}
      </span>
      <span
        key={`next-${nextIndex}-${flipKey}`}
        className="absolute left-0 top-0 inline-block"
        style={{
          transformStyle: 'preserve-3d',
          transition: 'transform 0.6s cubic-bezier(0.37, 0, 0.63, 1)',
          transform: isFlipping ? 'rotateX(0deg)' : 'rotateX(90deg)',
          opacity: isFlipping ? 1 : 0,
        }}
      >
        {words[nextIndex]}
      </span>
    </span>
  );
}

// Example data focused on "best CRM for startup"
const EXAMPLE_BRAND = "Your CRM";
const EXAMPLE_QUERY = "best CRM for startup";

// Rotating words for AI status - more impactful and action-oriented
const AI_STATUS_WORDS = [
  "AI‑discoverable",
  "AI‑preferred",
  "AI‑recommended",
  "AI‑top‑of‑mind",
  "AI‑leader",
  "AI‑visible"
];

// Rotating words for product type - more diverse and specific
const PRODUCT_TYPE_WORDS = [
  "CRM",
  "marketing platform",
  "sales tool",
  "analytics platform",
  "productivity suite",
  "business software",
  "collaboration tool"
];
const EXAMPLE_COMPETITORS = [
  { name: "Salesforce", appearances: 12, position: "#1", trend: "up" },
  { name: "Your CRM", appearances: 8, position: "#2", trend: "up", highlight: true },
  { name: "HubSpot", appearances: 6, position: "#3", trend: "down" },
  { name: "Pipedrive", appearances: 4, position: "#5", trend: "stable" }
];

const EXAMPLE_SOURCES = [
  { domain: "techcrunch.com", mentions: 42, status: "mentioned", url: "https://techcrunch.com/startup-crm-review" },
  { domain: "forbes.com", mentions: 28, status: "mentioned", url: "https://forbes.com/best-crm-startups" },
  { domain: "theverge.com", mentions: 15, status: "not mentioned", url: "https://theverge.com/crm-comparison" },
  { domain: "wired.com", mentions: 8, status: "not mentioned", url: "https://wired.com/startup-tools-2024" }
];

const EXAMPLE_CONTACTS = [
  { company: "TechCrunch", email: "editorial@techcrunch.com", phone: "+1 415 555 0123", domain: "techcrunch.com", confidence: 95 },
  { company: "Forbes", email: "contributors@forbes.com", phone: "+1 212 555 0198", domain: "forbes.com", confidence: 92 },
  { company: "The Verge", email: "tips@theverge.com", phone: "+1 212 555 0142", domain: "theverge.com", confidence: 88 }
];

// Ebook Download Section Component
const EbookDownloadSection: React.FC = () => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleDownloadEbook = async (e?: React.FormEvent) => {
    e?.preventDefault();
    
    // Validate email
    if (!email || !email.trim()) {
      setEmailError('Please enter your email address');
      return;
    }

    if (!validateEmail(email)) {
      setEmailError('Please enter a valid email address');
      return;
    }

    setEmailError('');
    setIsDownloading(true);

    try {
      const response = await fetch('/api/ebook/download', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email.trim() }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to download ebook' }));
        throw new Error(errorData.error || 'Failed to download ebook');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'how-to-rank-on-chatgpt-ebook.txt';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      // Show success message
      setEmail('');
    } catch (error: any) {
      console.error('Download error:', error);
      setEmailError(error.message || 'Failed to download ebook. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <section className="container max-w-screen-2xl px-4 py-24 bg-gradient-to-br from-primary/5 via-background to-muted/30">
      <div className="mx-auto max-w-5xl">
        <Card className="border-2 border-primary/20 bg-gradient-to-br from-card to-muted/20 p-8 md:p-12 shadow-xl transition-all duration-500 hover:shadow-2xl hover:scale-[1.01]">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <Badge variant="outline" className="mb-4">Free Resource</Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Complete Guide: How to Rank on ChatGPT
              </h2>
              <p className="text-lg text-muted-foreground mb-6">
                Discover the proven strategies to get your website featured in ChatGPT search results. 
                Learn how to configure OAI-SearchBot, optimize for Bing, and implement Generative Engine Optimization (GEO).
              </p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                  <span>Step-by-step OAI-SearchBot setup guide</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                  <span>Bing optimization strategies (critical for ChatGPT)</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                  <span>Generative Engine Optimization (GEO) techniques</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                  <span>Structured data & schema markup implementation</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                  <span>Monitoring & measurement strategies</span>
                </li>
              </ul>
              <form onSubmit={handleDownloadEbook} className="space-y-4">
                <div>
                  <Input
                    type="email"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setEmailError('');
                    }}
                    disabled={isDownloading}
                    className="w-full md:w-auto min-w-[280px]"
                    required
                  />
                  {emailError && (
                    <p className="text-sm text-red-600 dark:text-red-400 mt-2">{emailError}</p>
                  )}
                </div>
                <Button
                  type="submit"
                  disabled={isDownloading || !email}
                  size="lg"
                  className="group w-full md:w-auto transition-all duration-300 hover:scale-105 hover:shadow-lg"
                >
                  {isDownloading ? (
                    <>
                      <RefreshCw className="mr-2 w-5 h-5 animate-spin" />
                      Downloading...
                    </>
                  ) : (
                    <>
                      <Download className="mr-2 w-5 h-5 transition-transform duration-300 group-hover:translate-y-1" />
                      Download Free Ebook
                    </>
                  )}
                </Button>
              </form>
              <p className="text-sm text-muted-foreground mt-4">
                * Enter your email to download. We&apos;ll never spam you.
              </p>
            </div>
            <div className="relative">
              <Card className="p-6 bg-gradient-to-br from-primary/10 to-background border-2 border-primary/20">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <FileText className="w-8 h-8 text-primary" />
                    <div>
                      <p className="font-semibold">Complete Guide</p>
                      <p className="text-sm text-muted-foreground">15,000+ words</p>
                    </div>
                  </div>
                  <div className="border-t border-border/40 pt-4">
                    <p className="text-sm font-medium mb-2">What you&apos;ll learn:</p>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>✓ Configure OAI-SearchBot for discoverability</li>
                      <li>✓ Optimize for Bing (ChatGPT&apos;s search source)</li>
                      <li>✓ Implement GEO strategies for AI search</li>
                      <li>✓ Build brand authority &amp; credibility</li>
                      <li>✓ Track and measure your performance</li>
                    </ul>
                  </div>
                  <Link 
                    href="/blogs/how-to-rank-on-chatgpt-openai-seo-guide" 
                    className="flex items-center gap-2 text-sm text-primary hover:underline"
                  >
                    Read online version
                    <ExternalLink className="w-4 h-4" />
                  </Link>
                </div>
              </Card>
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
};

export default function LandingPageSaaS() {
  const [scrollY, setScrollY] = useState(0);
  const [activeSection, setActiveSection] = useState(0);
  const [counterValues, setCounterValues] = useState({ mentions: 0, sources: 0, competitors: 0, coverage: 0 });
  const [isExporting, setIsExporting] = useState(false);
  const [exported, setExported] = useState(false);
  const [monitoringActive, setMonitoringActive] = useState(true);
  const sectionRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    // Animate counters when section is visible
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const target = entry.target as HTMLElement;
            const dataValue = target.getAttribute("data-target");
            if (dataValue) {
              const max = parseInt(dataValue);
              animateCounter(target, max);
              observer.unobserve(entry.target);
            }
          }
        });
      },
      { threshold: 0.3 }
    );

    document.querySelectorAll("[data-target]").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const animateCounter = (element: HTMLElement, max: number) => {
    const duration = 2000;
    const steps = 60;
    const increment = max / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= max) {
        element.textContent = String(max);
        clearInterval(timer);
      } else {
        element.textContent = Math.floor(current).toString();
      }
    }, duration / steps);
  };

  const handleExportCSV = async () => {
    setIsExporting(true);
    // Simulate export delay
    setTimeout(() => {
      setIsExporting(false);
      setExported(true);
      setTimeout(() => setExported(false), 3000);
    }, 1500);
  };

  const pricingPlans = [
    {
      name: "Free",
      price: "$0",
      period: "/forever",
      description: "Perfect for getting started",
      features: [
        "5 brand trackers",
        "Daily checks",
        "Basic analytics",
        "Email support",
        "30 days history"
      ],
      cta: "Get Started",
      popular: false
    },
    {
      name: "Pro",
      price: "$19",
      period: "/month",
      description: "For growing businesses",
      features: [
        "10 brand trackers",
        "Hourly checks",
        "Advanced analytics",
        "Priority support",
        "1 year history",
        "Team collaboration"
      ],
      cta: "Get Started",
      popular: true
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "",
      description: "For large organizations",
      features: [
        "Everything in Pro",
        "Dedicated support",
        "Custom integrations",
        "On-premise deployment",
        "SLA guarantee",
        "Custom reporting"
      ],
      cta: "Contact Sales",
      popular: false
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
      {/* Header */}
      <nav className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 transition-all duration-300">
        <div className="container flex h-14 max-w-screen-2xl items-center justify-between px-4">
          <div className="flex items-center gap-2 group">
            <Image 
              src="/logo.svg" 
              alt="kommi logo" 
              width={24} 
              height={24}
              className="object-contain transition-transform duration-300 group-hover:scale-110"
            />
            <span className="font-semibold text-xl">kommi</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/auth">
              <Button variant="ghost" className="transition-all duration-200 hover:scale-105">Sign In</Button>
            </Link>
            <Link href="/auth">
              <Button className="transition-all duration-200 hover:scale-105 hover:shadow-lg">Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section with Journey Start */}
      <section className="container max-w-screen-2xl px-4 py-16 md:py-24">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="inline-block mb-4">
              <Badge variant="outline" className="animate-pulse">Live Example: Tracking &quot;{EXAMPLE_QUERY}&quot;</Badge>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
              Make your brand <span className="text-primary relative inline-block">
                AI‑compatible
                <span className="absolute -bottom-2 left-0 right-0 h-1 bg-primary/30 animate-pulse"></span>
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              See exactly how <strong className="text-foreground">{EXAMPLE_BRAND}</strong> appears when people ask AI: &quot;{EXAMPLE_QUERY}&quot;
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-6">
              <Link href="/auth">
                <Button size="lg" className="text-lg px-8 py-6 group transition-all duration-300 hover:scale-105 hover:shadow-xl">
                  Analyze For Free
                  <ArrowRight className="ml-2 w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="text-lg px-8 py-6 transition-all duration-300 hover:scale-105 hover:border-primary">
                Try live demo
                <PlayCircle className="ml-2 w-5 h-5" />
              </Button>
            </div>
            <p className="text-sm text-muted-foreground animate-pulse">
              Free forever • No credit card required
            </p>
          </div>
          
          {/* Interactive Dashboard Mockup */}
          <div className="mt-12 rounded-lg border border-border/40 bg-card shadow-2xl overflow-hidden transition-all duration-500 hover:shadow-3xl hover:scale-[1.01]">
            <div className="bg-muted/50 px-6 py-4 border-b flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="ml-4 text-sm font-medium text-muted-foreground">kommi Dashboard</span>
                <Badge variant="outline" className="ml-2 animate-pulse">
                  <Activity className="w-3 h-3 mr-1" />
                  Live
                </Badge>
              </div>
              <Badge variant="outline" className="text-xs">{EXAMPLE_QUERY}</Badge>
            </div>
            <div className="p-8 bg-gradient-to-br from-primary/5 to-background">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <Card className="p-6 border-2 border-primary/20 bg-background transition-all duration-300 hover:border-primary/40 hover:shadow-lg hover:scale-105">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-muted-foreground">Mentions Found</span>
                    <Bell className="w-4 h-4 text-blue-600 animate-bounce" />
                  </div>
                  <div className="text-3xl font-bold" data-target="8">8</div>
                  <div className="text-xs text-muted-foreground mt-1">Last 30d</div>
                </Card>
                <Card className="p-6 border-2 border-primary/20 bg-background transition-all duration-300 hover:border-primary/40 hover:shadow-lg hover:scale-105">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-muted-foreground">Unique Sources</span>
                    <Globe className="w-4 h-4 text-green-600" />
                  </div>
                  <div className="text-3xl font-bold" data-target="12">12</div>
                  <div className="text-xs text-muted-foreground mt-1">Cited by AI</div>
                </Card>
                <Card className="p-6 border-2 border-primary/20 bg-background transition-all duration-300 hover:border-primary/40 hover:shadow-lg hover:scale-105">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-muted-foreground">Best Position</span>
                    <TrendingUp className="w-4 h-4 text-purple-600" />
                  </div>
                  <div className="text-3xl font-bold">#2</div>
                  <div className="text-xs text-muted-foreground mt-1">Behind Salesforce</div>
                </Card>
                <Card className="p-6 border-2 border-primary/20 bg-background transition-all duration-300 hover:border-primary/40 hover:shadow-lg hover:scale-105">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-muted-foreground">Query Coverage</span>
                    <Activity className="w-4 h-4 text-orange-600" />
                  </div>
                  <div className="text-3xl font-bold" data-target="63">63%</div>
                  <div className="text-xs text-muted-foreground mt-1">Of searches mention you</div>
                </Card>
              </div>
              <Card className="bg-background border-2 border-primary/10 transition-all duration-300 hover:border-primary/30">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-lg">Recent Activity: &quot;{EXAMPLE_QUERY}&quot;</h3>
                    <Badge className="animate-pulse">
                      <Clock className="w-3 h-3 mr-1" />
                      Latest searches
                    </Badge>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-4 rounded-lg border bg-primary/5 border-primary/20 transition-all duration-300 hover:bg-primary/10 hover:scale-[1.02]">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                          <Badge className="bg-green-600 animate-pulse">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Mentioned
                            </Badge>
                          <span className="font-medium">{EXAMPLE_BRAND}</span>
                          <span className="text-sm text-muted-foreground">• {EXAMPLE_QUERY}</span>
                          </div>
                          <div className="flex items-center gap-2 flex-wrap text-xs text-muted-foreground">
                          <span className="flex items-center gap-1 hover:text-primary transition-colors cursor-pointer">
                                    <Link2 className="w-3 h-3" />
                            techcrunch.com
                                  </span>
                          <span className="flex items-center gap-1 hover:text-primary transition-colors cursor-pointer">
                            <Link2 className="w-3 h-3" />
                            forbes.com
                          </span>
                            <span>•</span>
                          <span>2h ago</span>
                          </div>
                        </div>
                      <Badge variant="outline" className="ml-2">Position #2</Badge>
                      </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Journey Section 1: Discover Mentions */}
      <section className="container max-w-screen-2xl px-4 py-24 bg-muted/50">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <Badge variant="outline" className="mb-4">Step 1: Discovery</Badge>
            <h2 className="text-4xl font-bold mb-4">Discover Your AI Mentions</h2>
            <p className="text-xl text-muted-foreground">
              See exactly how often <strong>{EXAMPLE_BRAND}</strong> appears when people ask: &quot;{EXAMPLE_QUERY}&quot;
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
            <div className="animate-in fade-in slide-in-from-left-4 duration-700">
              <h3 className="text-3xl font-bold mb-4">Real-time visibility tracking</h3>
              <p className="text-lg text-muted-foreground mb-6">
                We monitor AI platforms 24/7. When someone asks &quot;{EXAMPLE_QUERY}&quot;, we track if you're mentioned, 
                your position, and which sources AI cites. <strong>You're currently mentioned in 63% of searches</strong> for this query.
              </p>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-primary animate-in zoom-in duration-500" />
                  <span>8 mentions in last 30 days</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-primary animate-in zoom-in duration-500 delay-100" />
                  <span>Average position: #2 (behind Salesforce)</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-primary animate-in zoom-in duration-500 delay-200" />
                  <span>12 unique sources cited by AI</span>
                </li>
              </ul>
              <Link href="/auth">
                <Button size="lg" className="group transition-all duration-300 hover:scale-105">
                  Start tracking your brand
                  <ArrowRight className="ml-2 w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
                </Button>
              </Link>
            </div>
            <div className="rounded-lg border border-border/40 bg-card shadow-xl overflow-hidden transition-all duration-500 hover:shadow-2xl hover:scale-[1.02]">
              <div className="bg-muted/50 px-6 py-4 border-b flex items-center justify-between">
                <span className="text-sm font-medium">kommi Dashboard</span>
                <Badge variant="outline">
                  <RefreshCw className={`w-3 h-3 mr-1 ${monitoringActive ? 'animate-spin' : ''}`} />
                  Monitoring
                </Badge>
              </div>
              <div className="p-8 bg-gradient-to-br from-primary/5 to-background">
                <div className="space-y-4">
                  <Card className="p-6 border-2 border-primary/20 transition-all duration-300 hover:border-primary/40">
                    <div className="flex items-center justify-between mb-4">
                      <span className="font-semibold">Mention Rate</span>
                      <Badge className="bg-green-600 animate-pulse">63%</Badge>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span>Query: &quot;{EXAMPLE_QUERY}&quot;</span>
                        <span className="font-semibold">8/12 searches</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
                        <div 
                          className="bg-gradient-to-r from-primary to-primary/80 h-3 rounded-full transition-all duration-1000 ease-out"
                          style={{ width: '63%' }}
                        ></div>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        Your brand appears in 63% of AI responses for this query
                      </p>
                    </div>
                  </Card>
                  <Card className="p-6 border-2 border-primary/20 transition-all duration-300 hover:border-primary/40">
                    <div className="flex items-center justify-between mb-4">
                      <span className="font-semibold">Best Position</span>
                      <Badge variant="default" className="text-lg">#2</Badge>
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="w-5 h-5 text-green-600" />
                      <span className="text-sm font-medium">Up from #3 last week</span>
                    </div>
                    <p className="text-sm text-muted-foreground">Average ranking across all searches</p>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Journey Section 2: Competitor Positions */}
      <section className="container max-w-screen-2xl px-4 py-24 bg-gradient-to-b from-background to-muted/30">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <Badge variant="outline" className="mb-4">Step 2: Competitive Intelligence</Badge>
            <h2 className="text-4xl font-bold mb-4">See How You Stack Up</h2>
            <p className="text-xl text-muted-foreground">
              Compare your position against competitors for &quot;{EXAMPLE_QUERY}&quot;
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
            <div className="order-2 md:order-1 rounded-lg border border-border/40 bg-card shadow-xl overflow-hidden transition-all duration-500 hover:shadow-2xl hover:scale-[1.02]">
              <div className="bg-muted/50 px-6 py-4 border-b">
                <span className="text-sm font-medium">kommi Dashboard</span>
              </div>
              <div className="p-8 bg-gradient-to-br from-primary/5 to-background">
                <h4 className="font-semibold mb-4">Competitor Analysis: &quot;{EXAMPLE_QUERY}&quot;</h4>
                <div className="space-y-3">
                  {EXAMPLE_COMPETITORS.map((comp, idx) => (
                    <div 
                      key={idx} 
                      className={`flex items-center justify-between p-4 rounded-lg transition-all duration-300 hover:scale-[1.02] ${
                        comp.highlight 
                          ? 'bg-primary/10 border-2 border-primary/30 shadow-lg' 
                          : 'bg-muted/50 border hover:bg-muted/70'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Target className={`w-4 h-4 ${comp.highlight ? 'text-primary' : 'text-muted-foreground'}`} />
                        <span className={`font-medium ${comp.highlight ? 'text-primary text-lg' : ''}`}>
                          {comp.name}
                        </span>
                        {comp.highlight && (
                          <Badge variant="outline" className="ml-2">You</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant={comp.highlight ? "default" : "outline"} className="text-base">
                          {comp.position}
                        </Badge>
                        <div className="flex items-center gap-1">
                          {comp.trend === "up" && <TrendingUp className="w-4 h-4 text-green-600" />}
                          {comp.trend === "down" && <ArrowDown className="w-4 h-4 text-red-600" />}
                          <span className="text-sm text-muted-foreground">{comp.appearances} searches</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 p-3 bg-primary/5 rounded-lg border border-primary/20">
                  <p className="text-sm">
                    <strong className="text-primary">Insight:</strong> You're #2, just behind Salesforce. 
                    Focus on the sources they cite to close the gap.
                  </p>
              </div>
            </div>
            </div>
            <div className="order-1 md:order-2 animate-in fade-in slide-in-from-right-4 duration-700">
              <h3 className="text-3xl font-bold mb-4">Know your competitive position</h3>
              <p className="text-lg text-muted-foreground mb-6">
                For &quot;{EXAMPLE_QUERY}&quot;, you rank <strong className="text-primary text-xl">#2</strong>, appearing in 
                <strong className="text-primary"> 8 out of 12</strong> searches. Salesforce leads with 12 appearances at #1. 
                HubSpot is #3 with 6 appearances.
              </p>
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 mb-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-semibold mb-1">Action Item</p>
                    <p className="text-sm text-muted-foreground">
                      You're missing from 4 searches. Check which sources Salesforce cites that you don't. 
                      Export contacts from those sources to pitch for mentions.
              </p>
                  </div>
                </div>
              </div>
              <Link href="/auth">
                <Button size="lg" className="group transition-all duration-300 hover:scale-105">
                  Analyze your competitors
                  <ArrowRight className="ml-2 w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Journey Section 3: Cited Sources */}
      <section className="container max-w-screen-2xl px-4 py-24 bg-muted/50">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <Badge variant="outline" className="mb-4">Step 3: Source Intelligence</Badge>
            <h2 className="text-4xl font-bold mb-4">See Which Sources AI Cites</h2>
            <p className="text-xl text-muted-foreground">
              Know exactly which URLs mention you (and which don't) for &quot;{EXAMPLE_QUERY}&quot;
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
            <div className="animate-in fade-in slide-in-from-left-4 duration-700">
              <h3 className="text-3xl font-bold mb-4">Identify opportunity gaps</h3>
              <p className="text-lg text-muted-foreground mb-6">
                When AI answers &quot;{EXAMPLE_QUERY}&quot;, it cites specific URLs. We show you which sources 
                <strong className="text-green-600"> mention you</strong> (like TechCrunch, Forbes) and which 
                <strong className="text-orange-600"> don't mention you</strong> (like The Verge, Wired).
              </p>
              <ul className="space-y-3 mb-6">
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Mentioned sources (2)</p>
                    <p className="text-sm text-muted-foreground">techcrunch.com, forbes.com - Great! AI sees you here.</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Missing sources (2)</p>
                    <p className="text-sm text-muted-foreground">theverge.com, wired.com - Opportunity to pitch for mentions.</p>
                  </div>
                </li>
              </ul>
              <Link href="/auth">
                <Button size="lg" className="group transition-all duration-300 hover:scale-105">
                  View all sources
                  <ArrowRight className="ml-2 w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
                </Button>
              </Link>
            </div>
            <div className="rounded-lg border border-border/40 bg-card shadow-xl overflow-hidden transition-all duration-500 hover:shadow-2xl hover:scale-[1.02]">
              <div className="bg-muted/50 px-6 py-4 border-b">
                <span className="text-sm font-medium">kommi Dashboard</span>
              </div>
              <div className="p-8 bg-gradient-to-br from-primary/5 to-background">
                <h4 className="font-semibold mb-4">Cited Sources: &quot;{EXAMPLE_QUERY}&quot;</h4>
                <div className="space-y-3">
                  {EXAMPLE_SOURCES.map((source, idx) => (
                    <div 
                      key={idx} 
                      className={`flex items-center justify-between p-4 rounded-lg border transition-all duration-300 hover:scale-[1.02] hover:shadow-md cursor-pointer ${
                        source.status === "mentioned" 
                          ? 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900' 
                          : 'bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-900'
                      }`}
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <Globe className={`w-4 h-4 ${source.status === "mentioned" ? 'text-green-600' : 'text-orange-600'}`} />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">{source.domain}</span>
                            {source.status === "mentioned" ? (
                              <Badge variant="default" className="bg-green-600 text-xs">
                                <CheckCircle2 className="w-3 h-3 mr-1" />
                                Mentioned
                              </Badge>
                            ) : (
                              <Badge variant="secondary" className="text-xs">
                                <AlertCircle className="w-3 h-3 mr-1" />
                                No mention
                              </Badge>
                            )}
                      </div>
                          <a 
                            href={source.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-1 mt-1"
                          >
                            View article
                            <ExternalLink className="w-3 h-3" />
                          </a>
                      </div>
                    </div>
                        <div className="flex items-center gap-2">
                        <Badge variant={source.status === "mentioned" ? "default" : "outline"}>
                          {source.mentions} cites
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            </div>
          </div>
      </section>

      {/* Journey Section 4: Export Contacts & CSV */}
      <section className="container max-w-screen-2xl px-4 py-24 bg-gradient-to-b from-background to-muted/30">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <Badge variant="outline" className="mb-4">Step 4: Take Action</Badge>
            <h2 className="text-4xl font-bold mb-4">Export Contacts & Pitch for Mentions</h2>
            <p className="text-xl text-muted-foreground">
              Extract contact info from sources and export to CSV to increase your presence
            </p>
            </div>

          <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
            <div className="order-2 md:order-1 rounded-lg border border-border/40 bg-card shadow-xl overflow-hidden transition-all duration-500 hover:shadow-2xl hover:scale-[1.02]">
              <div className="bg-muted/50 px-6 py-4 border-b flex items-center justify-between">
                <span className="text-sm font-medium">Contacts from Cited Sources</span>
                <Badge variant="outline" className="text-xs">3 contacts found</Badge>
              </div>
              <div className="p-8 bg-gradient-to-br from-primary/5 to-background">
                <div className="space-y-3 mb-6">
                  {EXAMPLE_CONTACTS.map((c, idx) => (
                    <div 
                      key={idx} 
                      className="p-4 rounded-lg border bg-background transition-all duration-300 hover:scale-[1.02] hover:shadow-md hover:border-primary/30"
                    >
                      <div className="flex items-center justify-between mb-3">
                      <div>
                          <p className="font-medium">{c.company}</p>
                          <p className="text-sm text-muted-foreground">{c.domain}</p>
                      </div>
                        <Badge variant="secondary" className="animate-pulse">
                          {c.confidence}% match
                        </Badge>
                    </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                          <Mail className="w-4 h-4" />
                          {c.email}
                  </div>
                        <div className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                          <Phone className="w-4 h-4" />
                          {c.phone}
                  </div>
                      </div>
                    </div>
                  ))}
                  </div>
                <Button 
                  onClick={handleExportCSV}
                  disabled={isExporting || exported}
                  className="w-full group transition-all duration-300 hover:scale-105"
                  size="lg"
                >
                  {isExporting ? (
                    <>
                      <RefreshCw className="mr-2 w-5 h-5 animate-spin" />
                      Exporting...
                    </>
                  ) : exported ? (
                    <>
                      <CheckCircle className="mr-2 w-5 h-5" />
                      Exported!
                    </>
                  ) : (
                    <>
                      <Download className="mr-2 w-5 h-5 transition-transform duration-300 group-hover:translate-y-1" />
                      Export to CSV
                    </>
                  )}
                </Button>
                {exported && (
                  <p className="text-sm text-center text-primary mt-3 animate-in fade-in slide-in-from-top-2">
                    ✓ CSV downloaded! Ready to import into your CRM.
                  </p>
                )}
                </div>
              </div>
            <div className="order-1 md:order-2 animate-in fade-in slide-in-from-right-4 duration-700">
              <h3 className="text-3xl font-bold mb-4">Turn sources into outreach opportunities</h3>
              <p className="text-lg text-muted-foreground mb-6">
                We automatically extract emails, phone numbers, and social profiles from sources that don't mention you. 
                Export everything to CSV with one click—perfect for your sales team or outreach campaigns.
              </p>
              <ul className="space-y-3 mb-6">
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Smart extraction</p>
                    <p className="text-sm text-muted-foreground">Finds editorial emails, filters out junk (like Sentry telemetry).</p>
            </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">One-click CSV export</p>
                    <p className="text-sm text-muted-foreground">Includes domain, email, phone, confidence score—ready for your CRM.</p>
          </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Increase your presence</p>
                    <p className="text-sm text-muted-foreground">Reach out to sources that don't mention you. Pitch for mentions and move up in rankings.</p>
              </div>
                </li>
              </ul>
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                <p className="text-sm">
                  <strong className="text-primary">Pro Tip:</strong> Export contacts from sources that don't mention you. 
                  These are your highest-value outreach targets.
              </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Journey Section 5: Constant Monitoring */}
      <section className="container max-w-screen-2xl px-4 py-24 bg-muted/50">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <Badge variant="outline" className="mb-4">Step 5: Continuous Improvement</Badge>
            <h2 className="text-4xl font-bold mb-4">Constant Monitoring & Updates</h2>
            <p className="text-xl text-muted-foreground">
              Get real-time alerts when your position changes for &quot;{EXAMPLE_QUERY}&quot;
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="animate-in fade-in slide-in-from-left-4 duration-700">
              <h3 className="text-3xl font-bold mb-4">Stay ahead with hourly monitoring</h3>
              <p className="text-lg text-muted-foreground mb-6">
                We check AI platforms every hour for &quot;{EXAMPLE_QUERY}&quot;. You'll know immediately if:
              </p>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center gap-3">
                  <Bell className="w-5 h-5 text-primary animate-pulse" />
                  <span>Your position changes (you moved from #3 to #2 last week!)</span>
                </li>
                <li className="flex items-center gap-3">
                  <Bell className="w-5 h-5 text-primary animate-pulse" />
                  <span>New sources start citing you</span>
                </li>
                <li className="flex items-center gap-3">
                  <Bell className="w-5 h-5 text-primary animate-pulse" />
                  <span>Competitors gain or lose ground</span>
                </li>
                <li className="flex items-center gap-3">
                  <Bell className="w-5 h-5 text-primary animate-pulse" />
                  <span>Your mention rate increases or decreases</span>
                </li>
              </ul>
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="w-5 h-5 text-primary animate-pulse" />
                  <span className="font-semibold">Last update: 23 minutes ago</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Monitoring active for &quot;{EXAMPLE_QUERY}&quot;. You'll receive email alerts for significant changes.
                </p>
              </div>
                <Link href="/auth">
                <Button size="lg" className="group transition-all duration-300 hover:scale-105">
                  Start monitoring
                  <ArrowRight className="ml-2 w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
                  </Button>
                </Link>
              </div>
            <div className="rounded-lg border border-border/40 bg-card shadow-xl overflow-hidden transition-all duration-500 hover:shadow-2xl hover:scale-[1.02]">
              <div className="bg-muted/50 px-6 py-4 border-b flex items-center justify-between">
                <span className="text-sm font-medium">kommi Monitoring Dashboard</span>
                <Badge className="bg-green-600 animate-pulse">
                  <Activity className="w-3 h-3 mr-1 animate-spin" />
                  Active
                </Badge>
              </div>
              <div className="p-8 bg-gradient-to-br from-primary/5 to-background">
                <div className="space-y-4">
                  <Card className="p-6 border-2 border-primary/20">
                    <div className="flex items-center justify-between mb-4">
                      <span className="font-semibold">Query: &quot;{EXAMPLE_QUERY}&quot;</span>
                      <Badge variant="outline">Last 7 days</Badge>
                    </div>
                <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span>Mentions</span>
                        <span className="font-semibold">8</span>
                        </div>
                      <div className="flex justify-between text-sm">
                        <span>Best Position</span>
                        <Badge>#2</Badge>
                        </div>
                      <div className="flex justify-between text-sm">
                        <span>Status</span>
                        <Badge className="bg-green-600">
                          <TrendingUp className="w-3 h-3 mr-1" />
                          Improved
                        </Badge>
                      </div>
                      </div>
                  </Card>
                  <Card className="p-6 border-2 border-primary/20">
                    <div className="flex items-center justify-between mb-4">
                      <span className="font-semibold">Recent Updates</span>
                      <Clock className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between p-2 rounded bg-muted/50">
                        <span className="text-muted-foreground">Position changed</span>
                        <span className="font-medium">#3 → #2</span>
                </div>
                      <div className="flex items-center justify-between p-2 rounded bg-muted/50">
                        <span className="text-muted-foreground">New source added</span>
                        <span className="font-medium">forbes.com</span>
              </div>
                      <div className="flex items-center justify-between p-2 rounded bg-muted/50">
                        <span className="text-muted-foreground">Last check</span>
                        <span className="font-medium">23m ago</span>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="container max-w-screen-2xl px-4 py-24 bg-muted/20">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold mb-8">Trusted by marketing teams worldwide</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="p-6 transition-all duration-300 hover:scale-105 hover:shadow-lg">
              <div className="text-4xl font-bold text-primary mb-2" data-target="1450">1,450+</div>
              <div className="text-sm text-muted-foreground">Companies signed up</div>
            </Card>
            <Card className="p-6 transition-all duration-300 hover:scale-105 hover:shadow-lg">
              <div className="text-4xl font-bold text-primary mb-2" data-target="50">50K+</div>
              <div className="text-sm text-muted-foreground">Brand mentions tracked</div>
            </Card>
            <Card className="p-6 transition-all duration-300 hover:scale-105 hover:shadow-lg">
              <div className="text-4xl font-bold text-primary mb-2" data-target="98">98%</div>
              <div className="text-sm text-muted-foreground">Customer satisfaction</div>
            </Card>
          </div>
        </div>
      </section>

      {/* Free Ebook Section */}
      <EbookDownloadSection />

      {/* Pricing Section */}
      <section className="container max-w-screen-2xl px-4 py-24 bg-gradient-to-b from-background to-muted/30">
        <div className="mx-auto max-w-4xl text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Simple, Transparent Pricing</h2>
          <p className="text-xl text-muted-foreground mb-4">
            Choose the plan that fits your needs
          </p>
          <Badge variant="outline" className="text-sm">
            No credit card required • Free forever plan available
          </Badge>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {pricingPlans.map((plan, index) => (
            <Card 
              key={index} 
              className={`p-8 relative transition-all duration-500 hover:shadow-xl hover:scale-105 ${
                plan.popular 
                  ? 'border-2 border-primary shadow-2xl bg-gradient-to-br from-primary/5 to-background' 
                  : 'border hover:border-primary/30'
              }`}
            >
              {plan.popular && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white border-0 px-4 py-1 animate-pulse">
                  79% pick this
                </Badge>
              )}
              
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold mb-3">{plan.name}</h3>
                <div className="flex items-baseline justify-center gap-1 mb-2">
                  <span className="text-5xl font-bold">{plan.price}</span>
                  {plan.period && (
                    <span className="text-lg text-muted-foreground">{plan.period}</span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{plan.description}</p>
              </div>
              
              <ul className="space-y-4 mb-8 min-h-[280px]">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3 animate-in fade-in slide-in-from-left-4" style={{ animationDelay: `${i * 100}ms` }}>
                    <CheckCircle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${plan.popular ? 'text-primary' : 'text-green-600'}`} />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
              
              <Link href="/auth" className="block">
                <Button 
                  className={`w-full transition-all duration-300 hover:scale-105 ${plan.popular ? '' : 'border-2'}`}
                  variant={plan.popular ? "default" : "outline"}
                  size="lg"
                >
                  {plan.cta}
                </Button>
              </Link>
            </Card>
          ))}
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="container max-w-screen-2xl px-4 py-20">
        <Card className="bg-gradient-to-br from-primary via-primary/95 to-primary/90 border-0 text-primary-foreground p-12 text-center shadow-2xl transition-all duration-500 hover:shadow-3xl hover:scale-[1.02]">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to track &quot;{EXAMPLE_QUERY}&quot; for your brand?
          </h2>
          <p className="text-lg mb-8 max-w-2xl mx-auto opacity-90">
            Get a free analysis of your brand mentions and visibility in AI like ChatGPT, Claude, Gemini and more.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth">
              <Button size="lg" variant="secondary" className="text-lg px-8 bg-background text-foreground hover:bg-background/90 transition-all duration-300 hover:scale-105">
                Analyze For Free
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="text-lg px-8 bg-transparent border-2 border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10 transition-all duration-300 hover:scale-105">
              Start for free
            </Button>
          </div>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 bg-muted/30">
        <div className="container max-w-screen-2xl px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-8 mb-8">
            {/* Brand */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Image 
                  src="/logo.svg" 
                  alt="kommi logo" 
                  width={24} 
                  height={24}
                  className="object-contain"
                />
                <span className="font-bold text-lg">kommi</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Monitor and improve your brand visibility in AI. Track, analyze, and optimize your presence in AI-powered search results.
              </p>
            </div>
            
            {/* Product */}
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#features" className="hover:text-foreground transition-colors">Features</a></li>
                <li><a href="#pricing" className="hover:text-foreground transition-colors">Pricing</a></li>
                <li><Link href="/auth" className="hover:text-foreground transition-colors">Sign Up</Link></li>
                <li><Link href="/auth" className="hover:text-foreground transition-colors">Sign In</Link></li>
              </ul>
            </div>
            
            {/* Resources */}
            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="/blogs/comparisons" className="hover:text-foreground transition-colors">Comparisons</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Blog</a></li>
              </ul>
            </div>
            
            {/* Comparisons */}
            <div>
              <h4 className="font-semibold mb-4">Comparisons</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="/blogs/comparisons/kommi-vs-peec-ai" className="hover:text-foreground transition-colors">vs Peec AI</a></li>
                <li><a href="/blogs/comparisons/kommi-vs-otterly-ai" className="hover:text-foreground transition-colors">vs Otterly AI</a></li>
                <li><a href="/blogs/comparisons/kommi-vs-knowatoa-ai" className="hover:text-foreground transition-colors">vs Knowatoa AI</a></li>
                <li><a href="/blogs/comparisons/kommi-vs-profound-ai" className="hover:text-foreground transition-colors">vs Profound AI</a></li>
                <li><a href="/blogs/comparisons/kommi-vs-rankshift" className="hover:text-foreground transition-colors">vs Rankshift</a></li>
              </ul>
            </div>
            
            {/* Company */}
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">About</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Terms</a></li>
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t border-border/40 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              © 2025 kommi. All rights reserved.
            </p>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-foreground transition-colors">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
