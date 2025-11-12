"use client";

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
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  XCircle
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import React, { useEffect, useState, useRef } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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


// Example real-time RAG comparison data
const EXAMPLE_RAG_COMPARISON = [
  {
    brand: "Your CRM",
    position: 1,
    mentioned: true,
    evidence: "Your CRM is a powerful solution for startups looking to streamline their sales process...",
    sources: [
      { url: "https://techcrunch.com/best-crm-startups", title: "TechCrunch" },
      { url: "https://forbes.com/crm-comparison", title: "Forbes" }
    ],
    method: "RAG",
    isUser: true
  },
  {
    brand: "Salesforce",
    position: 2,
    mentioned: true,
    evidence: "Salesforce remains the industry leader with comprehensive features...",
    sources: [
      { url: "https://techcrunch.com/best-crm-startups", title: "TechCrunch" }
    ],
    method: "RAG",
    isUser: false
  },
  {
    brand: "HubSpot",
    position: 3,
    mentioned: true,
    evidence: "HubSpot offers great free tier options for growing businesses...",
    sources: [],
    method: "Standard",
    isUser: false
  },
  {
    brand: "Pipedrive",
    position: 4,
    mentioned: false,
    evidence: "Not mentioned in current AI search results",
    sources: [],
    method: "RAG",
    isUser: false
  }
];


export default function LandingPageSaaS() {
  const [scrollY, setScrollY] = useState(0);
  const [activeSection, setActiveSection] = useState(0);
  const [counterValues, setCounterValues] = useState({ mentions: 0, sources: 0, competitors: 0, coverage: 0 });
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
              <Badge variant="outline">Built for Agencies</Badge>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
              The AI Visibility Platform
              <br />
              <span className="text-primary relative inline-block">
                Built for Agencies
                <span className="absolute -bottom-2 left-0 right-0 h-1 bg-primary/30"></span>
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              Track how your clients appear in ChatGPT, Perplexity, and Gemini — monitor mentions, analyze competitors, and extract leads from every AI result.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-6">
              <Link href="/auth">
                <Button size="lg" className="text-lg px-8 py-6 group transition-all duration-300 hover:scale-105 hover:shadow-xl">
                  Try Kommi Free for Agencies
                  <ArrowRight className="ml-2 w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="text-lg px-8 py-6 transition-all duration-300 hover:scale-105 hover:border-primary">
                Book a Demo
                <PlayCircle className="ml-2 w-5 h-5" />
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Free forever • No credit card required
            </p>
          </div>
          
          {/* Interactive Dashboard Mockup */}
          <div className="mt-12 rounded-lg border border-border/40 bg-card shadow-2xl overflow-hidden transition-all duration-500 hover:shadow-3xl hover:scale-[1.01]">
            <div className="bg-muted/50 px-6 py-4 border-b flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="ml-4 text-sm font-medium text-muted-foreground">kommi Dashboard</span>
                <Badge variant="outline" className="ml-2">
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
                    <Badge>
                      <Clock className="w-3 h-3 mr-1" />
                      Latest searches
                    </Badge>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-4 rounded-lg border bg-primary/5 border-primary/20 transition-all duration-300 hover:bg-primary/10 hover:scale-[1.02]">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                          <Badge className="bg-green-600">
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

      {/* Section 2: Core Value */}
      <section className="container max-w-screen-2xl px-4 py-24 bg-gradient-to-b from-background to-muted/30">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <Badge variant="outline" className="mb-4">Core Value</Badge>
            <h2 className="text-4xl font-bold mb-4">See how your brands appear across AI — and what to do next</h2>
            <p className="text-xl text-muted-foreground">
              Three powerful capabilities that transform AI visibility into actionable insights
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <Card className="p-8 border-2 border-primary/20 bg-background transition-all duration-300 hover:border-primary/40 hover:shadow-lg hover:scale-105">
              <div className="mb-6">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Eye className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-2xl font-bold mb-3">Track Every Mention</h3>
                <p className="text-muted-foreground mb-4">
                  Monitor your clients across ChatGPT, Perplexity, Gemini, and more.
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-primary" />
                    <span>Detect brand mentions, citations, and ranking positions in real time</span>
                  </li>
                </ul>
              </div>
            </Card>

            <Card className="p-8 border-2 border-primary/20 bg-background transition-all duration-300 hover:border-primary/40 hover:shadow-lg hover:scale-105">
              <div className="mb-6">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <BarChart3 className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-2xl font-bold mb-3">Analyze Competitors</h3>
                <p className="text-muted-foreground mb-4">
                  Compare brand visibility, citation links, and domain-level mentions.
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-primary" />
                    <span>Identify who's dominating AI answers and why</span>
                  </li>
                </ul>
              </div>
            </Card>

            <Card className="p-8 border-2 border-primary/20 bg-background transition-all duration-300 hover:border-primary/40 hover:shadow-lg hover:scale-105">
              <div className="mb-6">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-2xl font-bold mb-3">Generate Leads Instantly</h3>
                <p className="text-muted-foreground mb-4">
                  Extract contacts from every source URL — authors, emails, social links — all scored for accuracy.
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-primary" />
                    <span>Turn brand mentions into new business opportunities</span>
                  </li>
                </ul>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Section 3: Built for Agencies - KEY DIFFERENTIATOR */}
      <section className="container max-w-screen-2xl px-4 py-24 bg-muted/50">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <Badge variant="outline" className="mb-4">Agency-First</Badge>
            <h2 className="text-4xl font-bold mb-4">Built for all your brands with custom dashboards</h2>
            <p className="text-xl text-muted-foreground">
              Kommi was built for multi-client operations — manage unlimited brands, teams, and clients in one unified workspace.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center mb-12">
            <div className="animate-in fade-in slide-in-from-left-4 duration-700">
              <h3 className="text-3xl font-bold mb-6">Team sections, multi-brand dashboards, and automated monitoring</h3>
              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold mb-1">Custom dashboards for every client brand</p>
                    <p className="text-sm text-muted-foreground">Each client gets their own branded dashboard with real-time AI visibility metrics</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold mb-1">Team collaboration with roles and permissions</p>
                    <p className="text-sm text-muted-foreground">Invite team members, assign roles (owner, admin, member), and control access per client</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold mb-1">Hourly monitoring & real-time alerts</p>
                    <p className="text-sm text-muted-foreground">Automated checks every hour. Get instant alerts when positions change or new mentions appear</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold mb-1">Client-ready white-label reports</p>
                    <p className="text-sm text-muted-foreground">Generate professional reports your clients will love — perfect for monthly reviews</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold mb-1">Webhooks & integrations</p>
                    <p className="text-sm text-muted-foreground">Push data into Slack, HubSpot, Notion, or any tool via webhooks</p>
                  </div>
                </li>
              </ul>
              <Link href="/auth">
                <Button size="lg" className="group transition-all duration-300 hover:scale-105">
                  Join the Agency Beta
                  <ArrowRight className="ml-2 w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
                </Button>
              </Link>
            </div>
            <div className="rounded-lg border border-border/40 bg-card shadow-xl overflow-hidden transition-all duration-500 hover:shadow-2xl hover:scale-[1.02]">
              <div className="bg-muted/50 px-6 py-4 border-b flex items-center justify-between">
                <span className="text-sm font-medium">kommi Agency Workspace</span>
                <Badge className="bg-green-600">
                  <Activity className="w-3 h-3 mr-1" />
                  Active
                </Badge>
              </div>
              <div className="p-8 bg-gradient-to-br from-primary/5 to-background">
                <div className="space-y-4">
                  <Card className="p-4 border-2 border-primary/20">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold">Client: TechStartup Inc.</span>
                      <Badge>3 brands</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">Custom dashboard • 12 mentions this week</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Bell className="w-3 h-3" />
                      <span>Last update: 23m ago</span>
                    </div>
                  </Card>
                  <Card className="p-4 border-2 border-primary/20">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold">Client: GrowthCo</span>
                      <Badge>5 brands</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">Custom dashboard • 28 mentions this week</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Bell className="w-3 h-3" />
                      <span>Last update: 15m ago</span>
                    </div>
                  </Card>
                  <Card className="p-4 border-2 border-primary/20">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold">Team Members</span>
                      <Badge variant="outline">4 active</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">2 owners • 2 members • Role-based access</p>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 4: Live Intelligence */}
      <section className="container max-w-screen-2xl px-4 py-24 bg-gradient-to-br from-primary/5 via-background to-muted/30">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <Badge variant="outline" className="mb-4">
              <Zap className="w-3 h-3 mr-1" />
              Real-Time Intelligence
            </Badge>
            <h2 className="text-4xl font-bold mb-4">Real-Time AI Tracking with RAG</h2>
            <p className="text-xl text-muted-foreground">
              Kommi's Retrieval-Augmented Generation (RAG) engine checks AI results live, pulling real web data every time you run a brand scan.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center mb-12">
            <div className="order-2 md:order-1 rounded-lg border border-border/40 bg-card shadow-xl overflow-hidden transition-all duration-500 hover:shadow-2xl hover:scale-[1.02]">
              <div className="bg-muted/50 px-6 py-4 border-b flex items-center justify-between">
                <span className="text-sm font-medium">Real-time Comparison: &quot;{EXAMPLE_QUERY}&quot;</span>
                <Badge variant="outline" className="text-xs">
                  <Zap className="w-3 h-3 mr-1" />
                  RAG Enabled
                </Badge>
              </div>
              <div className="p-8 bg-gradient-to-br from-primary/5 to-background">
                <div className="space-y-3 mb-4">
                  {EXAMPLE_RAG_COMPARISON.map((comp, idx) => (
                    <div 
                      key={idx} 
                      className={`p-4 rounded-lg transition-all duration-300 hover:scale-[1.02] ${
                        comp.isUser 
                          ? 'bg-primary/10 border-2 border-primary/30 shadow-lg' 
                          : 'bg-muted/50 border hover:bg-muted/70'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold flex-shrink-0 ${
                          comp.mentioned 
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' 
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
                        }`}>
                          {comp.position}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span className={`font-medium ${comp.isUser ? 'text-primary text-lg' : ''}`}>
                              {comp.brand}
                            </span>
                            {comp.isUser && (
                              <Badge variant="default" className="text-xs">You</Badge>
                            )}
                            {comp.mentioned ? (
                              <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                            ) : (
                              <XCircle className="w-4 h-4 text-gray-400 flex-shrink-0" />
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground break-words">
                            {comp.evidence}
                          </p>
                        </div>
                        <div className="flex items-start gap-2 flex-shrink-0 ml-2">
                          <Badge variant="outline" className="text-xs whitespace-nowrap">
                            {comp.method}
                          </Badge>
                          {comp.sources && comp.sources.length > 0 && (
                            <Badge variant="secondary" className="text-xs whitespace-nowrap">
                              {comp.sources.length} source{comp.sources.length > 1 ? 's' : ''}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 p-3 bg-primary/5 rounded-lg border border-primary/20">
                  <p className="text-sm">
                    <strong className="text-primary">Real-time Insight:</strong> You&apos;re #1 in AI search results! 
                    RAG technology provides instant, accurate data from ChatGPT.
                  </p>
                </div>
              </div>
            </div>
            <div className="order-1 md:order-2 animate-in fade-in slide-in-from-right-4 duration-700">
              <h3 className="text-3xl font-bold mb-4">Live intelligence, not static scraping</h3>
              <p className="text-lg text-muted-foreground mb-6">
                You see where your clients rank in AI conversations — with full evidence and citations. 
                This isn't static scraping. It's live intelligence, powered by GPT-4 and OpenAI's real-time web search.
              </p>
              <div className="space-y-4 mb-6">
                <div className="flex items-start gap-3">
                  <Zap className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold mb-1">Real-Time Web Data</p>
                    <p className="text-sm text-muted-foreground">
                      Every scan pulls fresh data from AI platforms — no cached results
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Target className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold mb-1">Full Evidence & Citations</p>
                    <p className="text-sm text-muted-foreground">
                      See exactly what AI says about your clients, with source links and context
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Link2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold mb-1">Powered by GPT-4</p>
                    <p className="text-sm text-muted-foreground">
                      Built on OpenAI's latest models for the most accurate AI visibility tracking
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 mb-6">
                <p className="text-sm text-muted-foreground italic">
                  "This isn't static scraping. It's live intelligence, powered by GPT-4 and OpenAI's real-time web search."
                </p>
              </div>
              <Link href="/auth">
                <Button size="lg" className="group transition-all duration-300 hover:scale-105 w-full md:w-auto">
                  Start Tracking with RAG
                  <ArrowRight className="ml-2 w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Section 5: Competitive Intelligence */}
      <section className="container max-w-screen-2xl px-4 py-24 bg-muted/50">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <Badge variant="outline" className="mb-4">Competitive Intelligence</Badge>
            <h2 className="text-4xl font-bold mb-4">Know who owns the AI answers</h2>
            <p className="text-xl text-muted-foreground">
              Kommi's analytics break down citation frequency, source categories, competitor share of voice, and position tracking
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
            <div className="animate-in fade-in slide-in-from-left-4 duration-700">
              <h3 className="text-3xl font-bold mb-4">Deep competitive insights</h3>
              <p className="text-lg text-muted-foreground mb-6">
                Kommi's analytics break down:
              </p>
              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold mb-1">Citation frequency per domain</p>
                    <p className="text-sm text-muted-foreground">See which sources AI cites most for your clients and competitors</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold mb-1">Source categories (News, Blogs, Social, Forums)</p>
                    <p className="text-sm text-muted-foreground">Understand where your clients appear across content types</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold mb-1">Competitor share of voice</p>
                    <p className="text-sm text-muted-foreground">Compare how often competitors appear vs your clients</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold mb-1">Position tracking and opportunity scoring</p>
                    <p className="text-sm text-muted-foreground">Identify high-opportunity queries where you can win</p>
                  </div>
                </li>
              </ul>
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 mb-6">
                <p className="text-sm italic text-muted-foreground mb-2">
                  "Kommi gave us AI share-of-voice data our SEO tools completely missed."
                </p>
                <p className="text-xs text-muted-foreground">— Growth Director, Digital Agency Partner</p>
              </div>
              <Link href="/auth">
                <Button size="lg" className="group transition-all duration-300 hover:scale-105">
                  Explore Competitive Intelligence
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

      {/* Section 6: Automation & Integrations */}
      <section className="container max-w-screen-2xl px-4 py-24 bg-gradient-to-b from-background to-muted/30">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <Badge variant="outline" className="mb-4">Integrations</Badge>
            <h2 className="text-4xl font-bold mb-4">Plug Kommi into your agency workflow</h2>
            <p className="text-xl text-muted-foreground">
              Trigger Slack alerts, create CRM leads, or push AI mentions into your data warehouse — automatically.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center mb-12">
            <div className="animate-in fade-in slide-in-from-left-4 duration-700">
              <h3 className="text-3xl font-bold mb-4">Every mention becomes an insight, lead, or report</h3>
              <p className="text-lg text-muted-foreground mb-6">
                Kommi integrates with the tools your agency already uses. Set up webhooks once, and every brand mention 
                automatically flows into your workflow.
              </p>
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="flex flex-col items-center justify-center gap-2 p-4 rounded-lg border bg-background hover:border-primary/50 transition-all duration-300 hover:shadow-md">
                  <div className="w-16 h-16 rounded-lg flex items-center justify-center shadow-md relative overflow-hidden bg-white p-4">
                    <Image 
                      src="/logos/integrations/make.svg" 
                      alt="Make.com integration logo" 
                      width={48} 
                      height={48}
                      className="object-contain"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "https://cdn.simpleicons.org/make/6E3FFC";
                      }}
                    />
                  </div>
                  <span className="font-medium text-sm">Make.com</span>
                </div>
                <div className="flex flex-col items-center justify-center gap-2 p-4 rounded-lg border bg-background hover:border-primary/50 transition-all duration-300 hover:shadow-md">
                  <div className="w-16 h-16 rounded-lg flex items-center justify-center shadow-md relative overflow-hidden bg-white p-4">
                    <Image 
                      src="/logos/integrations/zapier.svg" 
                      alt="Zapier integration logo" 
                      width={48} 
                      height={48}
                      className="object-contain"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "https://cdn.simpleicons.org/zapier/FF4A00";
                      }}
                    />
                  </div>
                  <span className="font-medium text-sm">Zapier</span>
                </div>
                <div className="flex flex-col items-center justify-center gap-2 p-4 rounded-lg border bg-background hover:border-primary/50 transition-all duration-300 hover:shadow-md">
                  <div className="w-16 h-16 rounded-lg flex items-center justify-center shadow-md relative overflow-hidden bg-white p-4">
                    <Image 
                      src="/logos/integrations/hubspot.svg" 
                      alt="HubSpot integration logo" 
                      width={48} 
                      height={48}
                      className="object-contain"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "https://cdn.simpleicons.org/hubspot/FF7A59";
                      }}
                    />
                  </div>
                  <span className="font-medium text-sm">HubSpot</span>
                </div>
                <div className="flex flex-col items-center justify-center gap-2 p-4 rounded-lg border bg-background hover:border-primary/50 transition-all duration-300 hover:shadow-md">
                  <div className="w-16 h-16 rounded-lg flex items-center justify-center shadow-md relative overflow-hidden bg-white p-4">
                    <Image 
                      src="/logos/integrations/salesforce.svg" 
                      alt="Salesforce integration logo" 
                      width={48} 
                      height={48}
                      className="object-contain"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "https://cdn.simpleicons.org/salesforce/00A1E0";
                      }}
                    />
                  </div>
                  <span className="font-medium text-sm">Salesforce</span>
                </div>
                <div className="flex flex-col items-center justify-center gap-2 p-4 rounded-lg border bg-background hover:border-primary/50 transition-all duration-300 hover:shadow-md">
                  <div className="w-16 h-16 rounded-lg flex items-center justify-center shadow-md relative overflow-hidden bg-white p-4">
                    <Image 
                      src="/logos/integrations/slack.svg" 
                      alt="Slack integration logo" 
                      width={48} 
                      height={48}
                      className="object-contain"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "https://cdn.simpleicons.org/slack/4A154B";
                      }}
                    />
                  </div>
                  <span className="font-medium text-sm">Slack</span>
                </div>
                <div className="flex flex-col items-center justify-center gap-2 p-4 rounded-lg border bg-background hover:border-primary/50 transition-all duration-300 hover:shadow-md">
                  <div className="w-16 h-16 rounded-lg flex items-center justify-center shadow-md relative overflow-hidden bg-white p-4">
                    <Image 
                      src="/logos/integrations/notion.svg" 
                      alt="Notion integration logo" 
                      width={48} 
                      height={48}
                      className="object-contain"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "https://cdn.simpleicons.org/notion/000000";
                      }}
                    />
                  </div>
                  <span className="font-medium text-sm">Notion</span>
                </div>
              </div>
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 mb-6">
                <p className="text-sm text-muted-foreground">
                  <strong className="text-primary">Microcopy:</strong> Every mention can become an insight, lead, or report — instantly.
                </p>
              </div>
              <Link href="/auth">
                <Button size="lg" className="group transition-all duration-300 hover:scale-105">
                  Set Up Integrations
                  <ArrowRight className="ml-2 w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
                </Button>
              </Link>
            </div>
            <div className="rounded-lg border border-border/40 bg-card shadow-xl overflow-hidden transition-all duration-500 hover:shadow-2xl hover:scale-[1.02]">
              <div className="bg-muted/50 px-6 py-4 border-b">
                <span className="text-sm font-medium">kommi Integrations</span>
              </div>
              <div className="p-8 bg-gradient-to-br from-primary/5 to-background">
                <div className="space-y-4">
                  <Card className="p-4 border-2 border-primary/20">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold">Webhook: Slack Channel</span>
                      <Badge className="bg-green-600">Active</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">Sends alerts when clients are mentioned</p>
                  </Card>
                  <Card className="p-4 border-2 border-primary/20">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold">Webhook: HubSpot CRM</span>
                      <Badge className="bg-green-600">Active</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">Creates leads from brand mentions</p>
                  </Card>
                  <Card className="p-4 border-2 border-primary/20">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold">Webhook: Make.com</span>
                      <Badge className="bg-green-600">Active</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">Triggers custom automation workflows</p>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 7: Pricing */}
      <section className="container max-w-screen-2xl px-4 py-24 bg-gradient-to-b from-background to-muted/30">
        <div className="mx-auto max-w-4xl text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Start free. Scale with your agency.</h2>
          <p className="text-xl text-muted-foreground mb-4">
            Choose the plan that fits your agency's needs
          </p>
          <Badge variant="outline" className="text-sm">
            Most agencies choose Pro ($19/mo per seat)
          </Badge>
        </div>
        
        <div className="max-w-4xl mx-auto mb-12">
          <Card className="p-8 border-2 border-primary/20">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[200px]">Feature</TableHead>
                  <TableHead className="text-center">Free</TableHead>
                  <TableHead className="text-center">Pro</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">Trackers</TableCell>
                  <TableCell className="text-center">5</TableCell>
                  <TableCell className="text-center">Unlimited</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Check Frequency</TableCell>
                  <TableCell className="text-center">Daily</TableCell>
                  <TableCell className="text-center">Hourly</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">History</TableCell>
                  <TableCell className="text-center">30 days</TableCell>
                  <TableCell className="text-center">1 year</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Contacts</TableCell>
                  <TableCell className="text-center">Basic</TableCell>
                  <TableCell className="text-center">Unlimited</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Integrations</TableCell>
                  <TableCell className="text-center">Webhooks</TableCell>
                  <TableCell className="text-center">Advanced</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Teams</TableCell>
                  <TableCell className="text-center">Single</TableCell>
                  <TableCell className="text-center">Multi-member</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </Card>
        </div>

        <div className="text-center">
          <Link href="/auth">
            <Button size="lg" className="text-lg px-8 py-6 group transition-all duration-300 hover:scale-105">
              Start Free
              <ArrowRight className="ml-2 w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Section 8: Proof & Trust */}
      <section className="container max-w-screen-2xl px-4 py-24 bg-muted/20">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Trusted by forward-thinking agencies globally</h2>
            <p className="text-lg text-muted-foreground mb-12">
              From boutique digital shops to enterprise marketing teams, Kommi powers AI visibility for agencies that move faster than the algorithm.
            </p>
          </div>

          {/* Twitter Testimonials - Row 1 (slides left) */}
          <div className="mb-8 overflow-hidden">
            <div className="flex gap-4 animate-scroll-left">
              {[
                {
                  name: "Sarah Chen",
                  handle: "@sarahchen",
                  avatar: "https://ui-avatars.com/api/?name=Sarah+Chen&size=48&background=10b981&color=fff&bold=true",
                  verified: true,
                  date: "2h",
                  content: "Kommi helped us identify which AI queries our clients weren't ranking for. We've increased their visibility by 40% in just 2 months. Game changer for our agency!",
                  replies: 12,
                  retweets: 28,
                  likes: 156
                },
                {
                  name: "Marcus Rodriguez",
                  handle: "@marcusrod",
                  avatar: "https://ui-avatars.com/api/?name=Marcus+Rodriguez&size=48&background=eab308&color=fff&bold=true",
                  verified: false,
                  date: "4h",
                  content: "The real-time RAG tracking is a game-changer. We can now show clients exactly where they stand in AI search results instantly. No more guessing!",
                  replies: 8,
                  retweets: 19,
                  likes: 89
                },
                {
                  name: "Alex Kim",
                  handle: "@alexkim",
                  avatar: "https://ui-avatars.com/api/?name=Alex+Kim&size=48&background=3b82f6&color=fff&bold=true",
                  verified: true,
                  date: "6h",
                  content: "Contact extraction from AI sources has generated 200+ qualified leads for our clients. This is the future of lead gen. Highly recommend!",
                  replies: 15,
                  retweets: 42,
                  likes: 203
                },
                {
                  name: "Jordan Taylor",
                  handle: "@jordantaylor",
                  avatar: "https://ui-avatars.com/api/?name=Jordan+Taylor&size=48&background=ef4444&color=fff&bold=true",
                  verified: false,
                  date: "8h",
                  content: "Kommi's webhook integrations saved us 10+ hours per week. All our client mentions now automatically flow into their CRMs. Set it and forget it!",
                  replies: 6,
                  retweets: 23,
                  likes: 127
                },
                {
                  name: "Emma Wilson",
                  handle: "@emmawilson",
                  avatar: "https://ui-avatars.com/api/?name=Emma+Wilson&size=48&background=8b5cf6&color=fff&bold=true",
                  verified: true,
                  date: "12h",
                  content: "Finally, a tool that shows WHY competitors win, not just WHERE they rank. Kommi's competitive intelligence is exactly what we needed.",
                  replies: 9,
                  retweets: 31,
                  likes: 178
                }
              ].map((tweet, idx) => (
                <Card key={idx} className="min-w-[320px] max-w-[320px] p-4 bg-background border border-border/50 hover:border-border transition-all">
                  <div className="flex items-start gap-3 mb-3">
                    <Image 
                      src={tweet.avatar}
                      alt={tweet.name}
                      width={48}
                      height={48}
                      className="rounded-full flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1 mb-0.5">
                        <span className="font-bold text-sm">{tweet.name}</span>
                        {tweet.verified && (
                          <svg viewBox="0 0 22 22" className="w-4 h-4 text-blue-500 fill-current">
                            <path d="M20.396 11c-.018-.646-.215-1.275-.57-1.816-.354-.54-.852-.972-1.438-1.246.223-.607.27-1.264.14-1.897-.131-.634-.437-1.218-.882-1.687-.47-.445-1.053-.75-1.687-.882-.633-.13-1.29-.083-1.897.14-.273-.587-.704-1.086-1.245-1.44S11.647 1.62 11 1.604c-.646.017-1.273.213-1.813.568s-.969.854-1.24 1.44c-.608-.223-1.267-.272-1.902-.14-.635.13-1.22.436-1.69.882-.445.47-.749 1.055-.878 1.688-.13.633-.08 1.29.144 1.896-.587.274-1.087.705-1.443 1.245-.356.54-.555 1.17-.574 1.817.02.647.218 1.276.574 1.817.356.54.856.972 1.443 1.245-.224.606-.274 1.263-.144 1.896.13.634.433 1.218.877 1.688.47.443 1.054.747 1.687.878.633.132 1.29.084 1.897-.136.274.586.705 1.084 1.246 1.439.54.354 1.17.551 1.816.569.647-.016 1.276-.213 1.817-.567s.972-.854 1.245-1.44c.604.239 1.266.296 1.903.164.636-.132 1.22-.447 1.68-.907.46-.46.776-1.044.908-1.681s.075-1.299-.165-1.903c.586-.274 1.084-.705 1.439-1.246.354-.54.551-1.17.569-1.816zM9.662 14.85l-3.429-3.428 1.293-1.302 2.072 2.072 4.4-4.794 1.347 1.246z"/>
                          </svg>
                        )}
                        <span className="text-muted-foreground text-sm">{tweet.handle}</span>
                        <span className="text-muted-foreground text-sm">·</span>
                        <span className="text-muted-foreground text-sm">{tweet.date}</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm mb-3 leading-relaxed">{tweet.content}</p>
                  <div className="flex items-center justify-between text-muted-foreground text-sm pt-2 border-t border-border/50">
                    <button className="flex items-center gap-2 hover:text-blue-500 transition-colors">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M1.751 10c0-4.42 3.584-8 8.005-8h4.366c4.49 0 8.129 3.64 8.129 8.13 0 2.96-1.607 5.47-4 6.865l-8.129 4.13V18.5c-1.794 0-3.248-1.456-3.248-3.25V10zm8.005-6.5c-3.317 0-6.005 2.69-6.005 6v5.25c0 1.794 1.456 3.25 3.248 3.25h.75v-3.5h-.75c-.69 0-1.25-.56-1.25-1.25v-5c0-3.317 2.69-6 6.005-6h4.366c3.317 0 6.005 2.69 6.005 6v5c0 .69-.56 1.25-1.25 1.25h-2.5v3.5h2.5c2.07 0 3.75-1.68 3.75-3.75v-5c0-4.42-3.584-8-8.129-8h-4.366z"/>
                      </svg>
                      <span>{tweet.replies}</span>
                    </button>
                    <button className="flex items-center gap-2 hover:text-green-500 transition-colors">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M4.5 3.88l4.432 4.14-1.364 1.46L5.5 7.55V16c0 1.1.896 2 2 2H13v2H7.5c-2.209 0-4-1.791-4-4V7.55L1.432 9.48.068 8.02 4.5 3.88zM16.5 6H11V4h5.5c2.209 0 4 1.791 4 4v7.45l2.068-1.93 1.364 1.46-4.432 4.14-4.432-4.14 1.364-1.46 2.068 1.93V8c0-1.1-.896-2-2-2z"/>
                      </svg>
                      <span>{tweet.retweets}</span>
                    </button>
                    <button className="flex items-center gap-2 hover:text-red-500 transition-colors">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M16.697 5.5c-1.222-.06-2.679.51-3.89 2.16l-.805 1.09-.806-1.09C9.984 6.01 8.526 5.44 7.304 5.5c-1.243.07-2.349.78-2.91 1.91-.552 1.12-.633 2.78.479 4.82 1.074 1.97 3.257 4.27 7.129 6.61 3.87-2.34 6.052-4.64 7.126-6.61 1.111-2.04 1.03-3.7.477-4.82-.561-1.13-1.666-1.84-2.908-1.91zm4.187 7.69c-1.351 2.48-4.001 5.12-8.379 7.67l-.503.3-.504-.3c-4.379-2.55-7.029-5.19-8.382-7.67-1.36-2.5-1.41-4.86-.514-6.67.887-1.79 2.487-2.99 4.282-3.2 1.37-.19 2.79.04 3.94 1.03 1.15.99 1.88 2.3 2.05 3.68.17 1.38-.19 2.82-1.01 3.99l-.01.02c-.19.26-.49.41-.81.41-.32 0-.62-.15-.81-.41l-.01-.02c-.82-1.17-1.18-2.61-1.01-3.99.17-1.38.9-2.69 2.05-3.68 1.15-.99 2.57-1.22 3.94-1.03 1.8.21 3.4 1.41 4.28 3.2.9 1.81.85 4.17-.51 6.67z"/>
                      </svg>
                      <span>{tweet.likes}</span>
                    </button>
                    <button className="flex items-center gap-2 hover:text-blue-500 transition-colors">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2.59l5.7 5.7-1.41 1.42L13 6.41V16h-2V6.41L6.71 9.71 5.29 8.29 12 2.59zM21 15l-.02 3.51c0 1.38-1.12 2.49-2.5 2.49H5.5C4.11 21 3 19.88 3 18.5V15h2v3.5c0 .28.22.5.5.5h12.98c.28 0 .5-.22.5-.5L19 15h2z"/>
                      </svg>
                    </button>
                  </div>
                </Card>
              ))}
              {/* Duplicate for seamless loop */}
              {[
                {
                  name: "Sarah Chen",
                  handle: "@sarahchen",
                  avatar: "https://ui-avatars.com/api/?name=Sarah+Chen&size=48&background=10b981&color=fff&bold=true",
                  verified: true,
                  date: "2h",
                  content: "Kommi helped us identify which AI queries our clients weren't ranking for. We've increased their visibility by 40% in just 2 months. Game changer for our agency!",
                  replies: 12,
                  retweets: 28,
                  likes: 156
                },
                {
                  name: "Marcus Rodriguez",
                  handle: "@marcusrod",
                  avatar: "https://ui-avatars.com/api/?name=Marcus+Rodriguez&size=48&background=eab308&color=fff&bold=true",
                  verified: false,
                  date: "4h",
                  content: "The real-time RAG tracking is a game-changer. We can now show clients exactly where they stand in AI search results instantly. No more guessing!",
                  replies: 8,
                  retweets: 19,
                  likes: 89
                }
              ].map((tweet, idx) => (
                <Card key={`dup-${idx}`} className="min-w-[320px] max-w-[320px] p-4 bg-background border border-border/50 hover:border-border transition-all">
                  <div className="flex items-start gap-3 mb-3">
                    <Image 
                      src={tweet.avatar}
                      alt={tweet.name}
                      width={48}
                      height={48}
                      className="rounded-full flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1 mb-0.5">
                        <span className="font-bold text-sm">{tweet.name}</span>
                        {tweet.verified && (
                          <svg viewBox="0 0 22 22" className="w-4 h-4 text-blue-500 fill-current">
                            <path d="M20.396 11c-.018-.646-.215-1.275-.57-1.816-.354-.54-.852-.972-1.438-1.246.223-.607.27-1.264.14-1.897-.131-.634-.437-1.218-.882-1.687-.47-.445-1.053-.75-1.687-.882-.633-.13-1.29-.083-1.897.14-.273-.587-.704-1.086-1.245-1.44S11.647 1.62 11 1.604c-.646.017-1.273.213-1.813.568s-.969.854-1.24 1.44c-.608-.223-1.267-.272-1.902-.14-.635.13-1.22.436-1.69.882-.445.47-.749 1.055-.878 1.688-.13.633-.08 1.29.144 1.896-.587.274-1.087.705-1.443 1.245-.356.54-.555 1.17-.574 1.817.02.647.218 1.276.574 1.817.356.54.856.972 1.443 1.245-.224.606-.274 1.263-.144 1.896.13.634.433 1.218.877 1.688.47.443 1.054.747 1.687.878.633.132 1.29.084 1.897-.136.274.586.705 1.084 1.246 1.439.54.354 1.17.551 1.816.569.647-.016 1.276-.213 1.817-.567s.972-.854 1.245-1.44c.604.239 1.266.296 1.903.164.636-.132 1.22-.447 1.68-.907.46-.46.776-1.044.908-1.681s.075-1.299-.165-1.903c.586-.274 1.084-.705 1.439-1.246.354-.54.551-1.17.569-1.816zM9.662 14.85l-3.429-3.428 1.293-1.302 2.072 2.072 4.4-4.794 1.347 1.246z"/>
                          </svg>
                        )}
                        <span className="text-muted-foreground text-sm">{tweet.handle}</span>
                        <span className="text-muted-foreground text-sm">·</span>
                        <span className="text-muted-foreground text-sm">{tweet.date}</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm mb-3 leading-relaxed">{tweet.content}</p>
                  <div className="flex items-center justify-between text-muted-foreground text-sm pt-2 border-t border-border/50">
                    <button className="flex items-center gap-2 hover:text-blue-500 transition-colors">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M1.751 10c0-4.42 3.584-8 8.005-8h4.366c4.49 0 8.129 3.64 8.129 8.13 0 2.96-1.607 5.47-4 6.865l-8.129 4.13V18.5c-1.794 0-3.248-1.456-3.248-3.25V10zm8.005-6.5c-3.317 0-6.005 2.69-6.005 6v5.25c0 1.794 1.456 3.25 3.248 3.25h.75v-3.5h-.75c-.69 0-1.25-.56-1.25-1.25v-5c0-3.317 2.69-6 6.005-6h4.366c3.317 0 6.005 2.69 6.005 6v5c0 .69-.56 1.25-1.25 1.25h-2.5v3.5h2.5c2.07 0 3.75-1.68 3.75-3.75v-5c0-4.42-3.584-8-8.129-8h-4.366z"/>
                      </svg>
                      <span>{tweet.replies}</span>
                    </button>
                    <button className="flex items-center gap-2 hover:text-green-500 transition-colors">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M4.5 3.88l4.432 4.14-1.364 1.46L5.5 7.55V16c0 1.1.896 2 2 2H13v2H7.5c-2.209 0-4-1.791-4-4V7.55L1.432 9.48.068 8.02 4.5 3.88zM16.5 6H11V4h5.5c2.209 0 4 1.791 4 4v7.45l2.068-1.93 1.364 1.46-4.432 4.14-4.432-4.14 1.364-1.46 2.068 1.93V8c0-1.1-.896-2-2-2z"/>
                      </svg>
                      <span>{tweet.retweets}</span>
                    </button>
                    <button className="flex items-center gap-2 hover:text-red-500 transition-colors">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M16.697 5.5c-1.222-.06-2.679.51-3.89 2.16l-.805 1.09-.806-1.09C9.984 6.01 8.526 5.44 7.304 5.5c-1.243.07-2.349.78-2.91 1.91-.552 1.12-.633 2.78.479 4.82 1.074 1.97 3.257 4.27 7.129 6.61 3.87-2.34 6.052-4.64 7.126-6.61 1.111-2.04 1.03-3.7.477-4.82-.561-1.13-1.666-1.84-2.908-1.91zm4.187 7.69c-1.351 2.48-4.001 5.12-8.379 7.67l-.503.3-.504-.3c-4.379-2.55-7.029-5.19-8.382-7.67-1.36-2.5-1.41-4.86-.514-6.67.887-1.79 2.487-2.99 4.282-3.2 1.37-.19 2.79.04 3.94 1.03 1.15.99 1.88 2.3 2.05 3.68.17 1.38-.19 2.82-1.01 3.99l-.01.02c-.19.26-.49.41-.81.41-.32 0-.62-.15-.81-.41l-.01-.02c-.82-1.17-1.18-2.61-1.01-3.99.17-1.38.9-2.69 2.05-3.68 1.15-.99 2.57-1.22 3.94-1.03 1.8.21 3.4 1.41 4.28 3.2.9 1.81.85 4.17-.51 6.67z"/>
                      </svg>
                      <span>{tweet.likes}</span>
                    </button>
                    <button className="flex items-center gap-2 hover:text-blue-500 transition-colors">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2.59l5.7 5.7-1.41 1.42L13 6.41V16h-2V6.41L6.71 9.71 5.29 8.29 12 2.59zM21 15l-.02 3.51c0 1.38-1.12 2.49-2.5 2.49H5.5C4.11 21 3 19.88 3 18.5V15h2v3.5c0 .28.22.5.5.5h12.98c.28 0 .5-.22.5-.5L19 15h2z"/>
                      </svg>
                    </button>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Twitter Testimonials - Row 2 (slides right) */}
          <div className="overflow-hidden">
            <div className="flex gap-4 animate-scroll-right">
              {[
                {
                  name: "David Park",
                  handle: "@davidpark",
                  avatar: "https://ui-avatars.com/api/?name=David+Park&size=48&background=06b6d4&color=fff&bold=true",
                  verified: false,
                  date: "1d",
                  content: "We've been using Kommi for 3 months now. The competitive intelligence features helped us win 5 new clients. ROI is insane!",
                  replies: 24,
                  retweets: 67,
                  likes: 312
                },
                {
                  name: "Lisa Anderson",
                  handle: "@lisanderson",
                  avatar: "https://ui-avatars.com/api/?name=Lisa+Anderson&size=48&background=f59e0b&color=fff&bold=true",
                  verified: true,
                  date: "1d",
                  content: "The contact extraction feature is pure gold. We've automated our entire lead gen process. Our sales team loves it!",
                  replies: 18,
                  retweets: 54,
                  likes: 289
                },
                {
                  name: "Ryan Chen",
                  handle: "@ryanchen",
                  avatar: "https://ui-avatars.com/api/?name=Ryan+Chen&size=48&background=ec4899&color=fff&bold=true",
                  verified: false,
                  date: "2d",
                  content: "Kommi's webhook integration with HubSpot is seamless. Every mention becomes a lead automatically. This is the future!",
                  replies: 11,
                  retweets: 38,
                  likes: 198
                },
                {
                  name: "Maya Patel",
                  handle: "@mayapatel",
                  avatar: "https://ui-avatars.com/api/?name=Maya+Patel&size=48&background=14b8a6&color=fff&bold=true",
                  verified: true,
                  date: "2d",
                  content: "Best investment we've made this year. Kommi shows us exactly what to optimize and why. Data-driven decisions made easy.",
                  replies: 16,
                  retweets: 45,
                  likes: 267
                },
                {
                  name: "Chris Thompson",
                  handle: "@christhompson",
                  avatar: "https://ui-avatars.com/api/?name=Chris+Thompson&size=48&background=6366f1&color=fff&bold=true",
                  verified: false,
                  date: "3d",
                  content: "The RAG technology is mind-blowing. Real-time AI search tracking that actually works. Our clients are impressed!",
                  replies: 9,
                  retweets: 29,
                  likes: 145
                }
              ].map((tweet, idx) => (
                <Card key={idx} className="min-w-[320px] max-w-[320px] p-4 bg-background border border-border/50 hover:border-border transition-all">
                  <div className="flex items-start gap-3 mb-3">
                    <Image 
                      src={tweet.avatar}
                      alt={tweet.name}
                      width={48}
                      height={48}
                      className="rounded-full flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1 mb-0.5">
                        <span className="font-bold text-sm">{tweet.name}</span>
                        {tweet.verified && (
                          <svg viewBox="0 0 22 22" className="w-4 h-4 text-blue-500 fill-current">
                            <path d="M20.396 11c-.018-.646-.215-1.275-.57-1.816-.354-.54-.852-.972-1.438-1.246.223-.607.27-1.264.14-1.897-.131-.634-.437-1.218-.882-1.687-.47-.445-1.053-.75-1.687-.882-.633-.13-1.29-.083-1.897.14-.273-.587-.704-1.086-1.245-1.44S11.647 1.62 11 1.604c-.646.017-1.273.213-1.813.568s-.969.854-1.24 1.44c-.608-.223-1.267-.272-1.902-.14-.635.13-1.22.436-1.69.882-.445.47-.749 1.055-.878 1.688-.13.633-.08 1.29.144 1.896-.587.274-1.087.705-1.443 1.245-.356.54-.555 1.17-.574 1.817.02.647.218 1.276.574 1.817.356.54.856.972 1.443 1.245-.224.606-.274 1.263-.144 1.896.13.634.433 1.218.877 1.688.47.443 1.054.747 1.687.878.633.132 1.29.084 1.897-.136.274.586.705 1.084 1.246 1.439.54.354 1.17.551 1.816.569.647-.016 1.276-.213 1.817-.567s.972-.854 1.245-1.44c.604.239 1.266.296 1.903.164.636-.132 1.22-.447 1.68-.907.46-.46.776-1.044.908-1.681s.075-1.299-.165-1.903c.586-.274 1.084-.705 1.439-1.246.354-.54.551-1.17.569-1.816zM9.662 14.85l-3.429-3.428 1.293-1.302 2.072 2.072 4.4-4.794 1.347 1.246z"/>
                          </svg>
                        )}
                        <span className="text-muted-foreground text-sm">{tweet.handle}</span>
                        <span className="text-muted-foreground text-sm">·</span>
                        <span className="text-muted-foreground text-sm">{tweet.date}</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm mb-3 leading-relaxed">{tweet.content}</p>
                  <div className="flex items-center justify-between text-muted-foreground text-sm pt-2 border-t border-border/50">
                    <button className="flex items-center gap-2 hover:text-blue-500 transition-colors">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M1.751 10c0-4.42 3.584-8 8.005-8h4.366c4.49 0 8.129 3.64 8.129 8.13 0 2.96-1.607 5.47-4 6.865l-8.129 4.13V18.5c-1.794 0-3.248-1.456-3.248-3.25V10zm8.005-6.5c-3.317 0-6.005 2.69-6.005 6v5.25c0 1.794 1.456 3.25 3.248 3.25h.75v-3.5h-.75c-.69 0-1.25-.56-1.25-1.25v-5c0-3.317 2.69-6 6.005-6h4.366c3.317 0 6.005 2.69 6.005 6v5c0 .69-.56 1.25-1.25 1.25h-2.5v3.5h2.5c2.07 0 3.75-1.68 3.75-3.75v-5c0-4.42-3.584-8-8.129-8h-4.366z"/>
                      </svg>
                      <span>{tweet.replies}</span>
                    </button>
                    <button className="flex items-center gap-2 hover:text-green-500 transition-colors">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M4.5 3.88l4.432 4.14-1.364 1.46L5.5 7.55V16c0 1.1.896 2 2 2H13v2H7.5c-2.209 0-4-1.791-4-4V7.55L1.432 9.48.068 8.02 4.5 3.88zM16.5 6H11V4h5.5c2.209 0 4 1.791 4 4v7.45l2.068-1.93 1.364 1.46-4.432 4.14-4.432-4.14 1.364-1.46 2.068 1.93V8c0-1.1-.896-2-2-2z"/>
                      </svg>
                      <span>{tweet.retweets}</span>
                    </button>
                    <button className="flex items-center gap-2 hover:text-red-500 transition-colors">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M16.697 5.5c-1.222-.06-2.679.51-3.89 2.16l-.805 1.09-.806-1.09C9.984 6.01 8.526 5.44 7.304 5.5c-1.243.07-2.349.78-2.91 1.91-.552 1.12-.633 2.78.479 4.82 1.074 1.97 3.257 4.27 7.129 6.61 3.87-2.34 6.052-4.64 7.126-6.61 1.111-2.04 1.03-3.7.477-4.82-.561-1.13-1.666-1.84-2.908-1.91zm4.187 7.69c-1.351 2.48-4.001 5.12-8.379 7.67l-.503.3-.504-.3c-4.379-2.55-7.029-5.19-8.382-7.67-1.36-2.5-1.41-4.86-.514-6.67.887-1.79 2.487-2.99 4.282-3.2 1.37-.19 2.79.04 3.94 1.03 1.15.99 1.88 2.3 2.05 3.68.17 1.38-.19 2.82-1.01 3.99l-.01.02c-.19.26-.49.41-.81.41-.32 0-.62-.15-.81-.41l-.01-.02c-.82-1.17-1.18-2.61-1.01-3.99.17-1.38.9-2.69 2.05-3.68 1.15-.99 2.57-1.22 3.94-1.03 1.8.21 3.4 1.41 4.28 3.2.9 1.81.85 4.17-.51 6.67z"/>
                      </svg>
                      <span>{tweet.likes}</span>
                    </button>
                    <button className="flex items-center gap-2 hover:text-blue-500 transition-colors">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2.59l5.7 5.7-1.41 1.42L13 6.41V16h-2V6.41L6.71 9.71 5.29 8.29 12 2.59zM21 15l-.02 3.51c0 1.38-1.12 2.49-2.5 2.49H5.5C4.11 21 3 19.88 3 18.5V15h2v3.5c0 .28.22.5.5.5h12.98c.28 0 .5-.22.5-.5L19 15h2z"/>
                      </svg>
                    </button>
                  </div>
                </Card>
              ))}
              {/* Duplicate for seamless loop */}
              {[
                {
                  name: "David Park",
                  handle: "@davidpark",
                  avatar: "https://ui-avatars.com/api/?name=David+Park&size=48&background=06b6d4&color=fff&bold=true",
                  verified: false,
                  date: "1d",
                  content: "We've been using Kommi for 3 months now. The competitive intelligence features helped us win 5 new clients. ROI is insane!",
                  replies: 24,
                  retweets: 67,
                  likes: 312
                },
                {
                  name: "Lisa Anderson",
                  handle: "@lisanderson",
                  avatar: "https://ui-avatars.com/api/?name=Lisa+Anderson&size=48&background=f59e0b&color=fff&bold=true",
                  verified: true,
                  date: "1d",
                  content: "The contact extraction feature is pure gold. We've automated our entire lead gen process. Our sales team loves it!",
                  replies: 18,
                  retweets: 54,
                  likes: 289
                }
              ].map((tweet, idx) => (
                <Card key={`dup2-${idx}`} className="min-w-[320px] max-w-[320px] p-4 bg-background border border-border/50 hover:border-border transition-all">
                  <div className="flex items-start gap-3 mb-3">
                    <Image 
                      src={tweet.avatar}
                      alt={tweet.name}
                      width={48}
                      height={48}
                      className="rounded-full flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1 mb-0.5">
                        <span className="font-bold text-sm">{tweet.name}</span>
                        {tweet.verified && (
                          <svg viewBox="0 0 22 22" className="w-4 h-4 text-blue-500 fill-current">
                            <path d="M20.396 11c-.018-.646-.215-1.275-.57-1.816-.354-.54-.852-.972-1.438-1.246.223-.607.27-1.264.14-1.897-.131-.634-.437-1.218-.882-1.687-.47-.445-1.053-.75-1.687-.882-.633-.13-1.29-.083-1.897.14-.273-.587-.704-1.086-1.245-1.44S11.647 1.62 11 1.604c-.646.017-1.273.213-1.813.568s-.969.854-1.24 1.44c-.608-.223-1.267-.272-1.902-.14-.635.13-1.22.436-1.69.882-.445.47-.749 1.055-.878 1.688-.13.633-.08 1.29.144 1.896-.587.274-1.087.705-1.443 1.245-.356.54-.555 1.17-.574 1.817.02.647.218 1.276.574 1.817.356.54.856.972 1.443 1.245-.224.606-.274 1.263-.144 1.896.13.634.433 1.218.877 1.688.47.443 1.054.747 1.687.878.633.132 1.29.084 1.897-.136.274.586.705 1.084 1.246 1.439.54.354 1.17.551 1.816.569.647-.016 1.276-.213 1.817-.567s.972-.854 1.245-1.44c.604.239 1.266.296 1.903.164.636-.132 1.22-.447 1.68-.907.46-.46.776-1.044.908-1.681s.075-1.299-.165-1.903c.586-.274 1.084-.705 1.439-1.246.354-.54.551-1.17.569-1.816zM9.662 14.85l-3.429-3.428 1.293-1.302 2.072 2.072 4.4-4.794 1.347 1.246z"/>
                          </svg>
                        )}
                        <span className="text-muted-foreground text-sm">{tweet.handle}</span>
                        <span className="text-muted-foreground text-sm">·</span>
                        <span className="text-muted-foreground text-sm">{tweet.date}</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm mb-3 leading-relaxed">{tweet.content}</p>
                  <div className="flex items-center justify-between text-muted-foreground text-sm pt-2 border-t border-border/50">
                    <button className="flex items-center gap-2 hover:text-blue-500 transition-colors">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M1.751 10c0-4.42 3.584-8 8.005-8h4.366c4.49 0 8.129 3.64 8.129 8.13 0 2.96-1.607 5.47-4 6.865l-8.129 4.13V18.5c-1.794 0-3.248-1.456-3.248-3.25V10zm8.005-6.5c-3.317 0-6.005 2.69-6.005 6v5.25c0 1.794 1.456 3.25 3.248 3.25h.75v-3.5h-.75c-.69 0-1.25-.56-1.25-1.25v-5c0-3.317 2.69-6 6.005-6h4.366c3.317 0 6.005 2.69 6.005 6v5c0 .69-.56 1.25-1.25 1.25h-2.5v3.5h2.5c2.07 0 3.75-1.68 3.75-3.75v-5c0-4.42-3.584-8-8.129-8h-4.366z"/>
                      </svg>
                      <span>{tweet.replies}</span>
                    </button>
                    <button className="flex items-center gap-2 hover:text-green-500 transition-colors">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M4.5 3.88l4.432 4.14-1.364 1.46L5.5 7.55V16c0 1.1.896 2 2 2H13v2H7.5c-2.209 0-4-1.791-4-4V7.55L1.432 9.48.068 8.02 4.5 3.88zM16.5 6H11V4h5.5c2.209 0 4 1.791 4 4v7.45l2.068-1.93 1.364 1.46-4.432 4.14-4.432-4.14 1.364-1.46 2.068 1.93V8c0-1.1-.896-2-2-2z"/>
                      </svg>
                      <span>{tweet.retweets}</span>
                    </button>
                    <button className="flex items-center gap-2 hover:text-red-500 transition-colors">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M16.697 5.5c-1.222-.06-2.679.51-3.89 2.16l-.805 1.09-.806-1.09C9.984 6.01 8.526 5.44 7.304 5.5c-1.243.07-2.349.78-2.91 1.91-.552 1.12-.633 2.78.479 4.82 1.074 1.97 3.257 4.27 7.129 6.61 3.87-2.34 6.052-4.64 7.126-6.61 1.111-2.04 1.03-3.7.477-4.82-.561-1.13-1.666-1.84-2.908-1.91zm4.187 7.69c-1.351 2.48-4.001 5.12-8.379 7.67l-.503.3-.504-.3c-4.379-2.55-7.029-5.19-8.382-7.67-1.36-2.5-1.41-4.86-.514-6.67.887-1.79 2.487-2.99 4.282-3.2 1.37-.19 2.79.04 3.94 1.03 1.15.99 1.88 2.3 2.05 3.68.17 1.38-.19 2.82-1.01 3.99l-.01.02c-.19.26-.49.41-.81.41-.32 0-.62-.15-.81-.41l-.01-.02c-.82-1.17-1.18-2.61-1.01-3.99.17-1.38.9-2.69 2.05-3.68 1.15-.99 2.57-1.22 3.94-1.03 1.8.21 3.4 1.41 4.28 3.2.9 1.81.85 4.17-.51 6.67z"/>
                      </svg>
                      <span>{tweet.likes}</span>
                    </button>
                    <button className="flex items-center gap-2 hover:text-blue-500 transition-colors">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2.59l5.7 5.7-1.41 1.42L13 6.41V16h-2V6.41L6.71 9.71 5.29 8.29 12 2.59zM21 15l-.02 3.51c0 1.38-1.12 2.49-2.5 2.49H5.5C4.11 21 3 19.88 3 18.5V15h2v3.5c0 .28.22.5.5.5h12.98c.28 0 .5-.22.5-.5L19 15h2z"/>
                      </svg>
                    </button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Section 9: Final CTA */}
      <section className="container max-w-screen-2xl px-4 py-20">
        <div className="mx-auto max-w-4xl">
          <Card className="bg-gradient-to-br from-primary via-primary/95 to-primary/90 border-0 text-primary-foreground p-8 md:p-12 text-center shadow-2xl">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4">
              Measure the unmeasurable.
              <br />
              See where your clients stand in the AI era.
            </h2>
            <p className="text-base md:text-lg mb-8 max-w-2xl mx-auto opacity-90">
              Start tracking AI visibility for your agency clients today. Free forever plan available.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/auth" className="w-full sm:w-auto">
                <Button size="lg" variant="secondary" className="w-full sm:w-auto text-lg px-8 bg-background text-foreground hover:bg-background/90">
                  Start Tracking with Kommi
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="w-full sm:w-auto text-lg px-8 bg-transparent border-2 border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10">
                Book a Demo
              </Button>
            </div>
          </Card>
        </div>
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
                The AI visibility platform built for agencies. Track, analyze, and optimize your clients' presence in AI-powered search results.
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
                <li><a href="#" className="hover:text-foreground transition-colors">API</a></li>
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
              © 2025 Kommi Technologies Inc. | Built in India, deployed on Vercel
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
