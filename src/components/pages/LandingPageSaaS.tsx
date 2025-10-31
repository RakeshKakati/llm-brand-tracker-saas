"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  Sparkles
} from "lucide-react";
import { Mail, Phone } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function LandingPageSaaS() {
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
      <nav className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container flex h-14 max-w-screen-2xl items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Image 
              src="/logo.svg" 
              alt="kommi logo" 
              width={24} 
              height={24}
              className="object-contain"
            />
            <span className="font-semibold text-xl">kommi</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/auth">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link href="/auth">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container max-w-screen-2xl px-4 py-16 md:py-24">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
              Make your brand <span className="text-primary">AI‑compatible</span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              Get cited, discovered, and preferred by AI. Track mentions, fix sources, and win AI search.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-6">
              <Link href="/auth">
                <Button size="lg" className="text-lg px-8 py-6">
                  Analyze For Free
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link href="/auth">
              <Button size="lg" variant="outline" className="text-lg px-8 py-6">
                Try live demo
              </Button>
                 </Link>
            </div>
              
            <p className="text-sm text-muted-foreground">
              Free forever • No credit card required
            </p>
          </div>
          
          {/* Dashboard Mockup */}
          <div className="mt-12 rounded-lg border border-border/40 bg-card shadow-2xl overflow-hidden">
            <div className="bg-muted/50 px-6 py-4 border-b flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="ml-4 text-sm font-medium text-muted-foreground">kommi Dashboard</span>
              </div>
              <Badge variant="outline" className="text-xs">Last 7 days</Badge>
            </div>
            <div className="p-8 bg-gradient-to-br from-primary/5 to-background">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <Card className="p-6 border-2 border-primary/20 bg-background">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-muted-foreground">Unique Sources</span>
                    <Globe className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="text-3xl font-bold">3</div>
                  <div className="text-xs text-muted-foreground mt-1">Last 30d</div>
                </Card>
                <Card className="p-6 border-2 border-primary/20 bg-background">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-muted-foreground">Unique Competitors</span>
                    <Target className="w-4 h-4 text-green-600" />
                  </div>
                  <div className="text-3xl font-bold">5</div>
                  <div className="text-xs text-muted-foreground mt-1">Last 30d</div>
                </Card>
                <Card className="p-6 border-2 border-primary/20 bg-background">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-muted-foreground">Mention Rate</span>
                    <BarChart3 className="w-4 h-4 text-purple-600" />
                  </div>
                  <div className="text-3xl font-bold">63%</div>
                  <div className="text-xs text-muted-foreground mt-1">Mentions / Searches</div>
                </Card>
                <Card className="p-6 border-2 border-primary/20 bg-background">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-muted-foreground">Query Coverage</span>
                    <Activity className="w-4 h-4 text-orange-600" />
                  </div>
                  <div className="text-3xl font-bold">45%</div>
                  <div className="text-xs text-muted-foreground mt-1">Queries with ≥ 1 mention</div>
                </Card>
              </div>
              <Card className="bg-background border-2 border-primary/10">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-lg">Recent Activity</h3>
                    <Badge>Latest searches</Badge>
                  </div>
                  <div className="space-y-3">
                    {[
                      { brand: "adidas", query: "best running shoes", mentioned: true, sources: ["letsrun.com", "techradar.com"], time: "4h ago" },
                      { brand: "nike", query: "top sneakers 2024", mentioned: true, sources: ["techradar.com"], time: "6h ago" },
                      { brand: "puma", query: "athletic footwear", mentioned: false, sources: [], time: "1d ago" }
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between p-4 rounded-lg border bg-muted/30">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <Badge variant={item.mentioned ? "default" : "secondary"}>
                              {item.mentioned ? "Mentioned" : "Not Found"}
                            </Badge>
                            <span className="font-medium">{item.brand}</span>
                            <span className="text-sm text-muted-foreground">• {item.query}</span>
                          </div>
                          <div className="flex items-center gap-2 flex-wrap text-xs text-muted-foreground">
                            {item.sources.length > 0 ? (
                              <>
                                {item.sources.slice(0, 2).map((src, i) => (
                                  <span key={i} className="flex items-center gap-1">
                                    <Link2 className="w-3 h-3" />
                                    {src}
                                  </span>
                                ))}
                                {item.sources.length > 2 && (
                                  <span>+{item.sources.length - 2} more</span>
                                )}
                              </>
                            ) : (
                              <span>No sources</span>
                            )}
                            <span>•</span>
                            <span>{item.time}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container max-w-screen-2xl px-4 py-24 bg-muted/50">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Track Your AI Visibility</h2>
            <p className="text-xl text-muted-foreground">
              See exactly how often you appear in AI-powered search results across major platforms
            </p>
          </div>

          {/* Feature 1: Visibility Tracking */}
          <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
            <div>
              <h3 className="text-3xl font-bold mb-4">Track your visibility score</h3>
              <p className="text-lg text-muted-foreground mb-6">
                Monitor your visibility across all major AI platforms and see exactly how often you appear in customer conversations. Get comprehensive analytics on mention rates, position rankings, and competitor comparisons.
              </p>
              <Link href="/auth">
                <Button size="lg">
                  View live demo
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            </div>
            <div className="rounded-lg border border-border/40 bg-card shadow-xl overflow-hidden">
              <div className="bg-muted/50 px-6 py-4 border-b">
                <span className="text-sm font-medium">kommi Dashboard</span>
              </div>
              <div className="p-8 bg-gradient-to-br from-primary/5 to-background">
                <div className="space-y-4">
                  <Card className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <span className="font-semibold">Visibility Score</span>
                      <Badge className="bg-green-600">63%</Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>ChatGPT</span>
                        <span className="font-semibold">45%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div className="bg-primary h-2 rounded-full" style={{ width: '45%' }}></div>
                      </div>
                    </div>
                  </Card>
                  <Card className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <span className="font-semibold">Best Position</span>
                      <Badge variant="default">#2</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">Average ranking across all searches</p>
                  </Card>
                </div>
              </div>
            </div>
          </div>

          {/* Feature 2: Source Tracking */}
          <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
            <div className="order-2 md:order-1 rounded-lg border border-border/40 bg-card shadow-xl overflow-hidden">
              <div className="bg-muted/50 px-6 py-4 border-b">
                <span className="text-sm font-medium">kommi Dashboard</span>
              </div>
              <div className="p-8 bg-gradient-to-br from-primary/5 to-background">
                <div className="space-y-3">
                  <h4 className="font-semibold mb-4">Top Sources</h4>
                  {[
                    { domain: "techcrunch.com", mentions: 42, status: "mentioned" },
                    { domain: "forbes.com", mentions: 28, status: "mentioned" },
                    { domain: "theverge.com", mentions: 15, status: "not mentioned" },
                    { domain: "wired.com", mentions: 8, status: "not mentioned" }
                  ].map((source, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 rounded-lg border bg-background">
                      <div className="flex items-center gap-3">
                        <Globe className="w-4 h-4 text-primary" />
                        <span className="text-sm font-medium">{source.domain}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={source.status === "mentioned" ? "default" : "secondary"}>
                          {source.mentions}
                        </Badge>
                        {source.status === "not mentioned" && (
                          <span className="text-xs text-muted-foreground">No mention</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="order-1 md:order-2">
              <h3 className="text-3xl font-bold mb-4">Identify the sources that don't mention you</h3>
              <p className="text-lg text-muted-foreground mb-6">
                See the URLs that AI models cite when answering questions. Know exactly which sources mention you and which don't. Get publisher contact information to pitch for mentions.
              </p>
              <Link href="/auth">
                <Button size="lg">
                  View live demo
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Feature 3: Competitor Analysis */}
          <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
            <div>
              <h3 className="text-3xl font-bold mb-4">Find out your competitors' AI visibility</h3>
              <p className="text-lg text-muted-foreground mb-6">
                Measure your visibility against your competitors. See who's getting mentioned more often, track their position rankings, and identify opportunities to outrank them.
              </p>
              <Link href="/auth">
                <Button size="lg">
                  View live demo
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            </div>
            <div className="rounded-lg border border-border/40 bg-card shadow-xl overflow-hidden">
              <div className="bg-muted/50 px-6 py-4 border-b">
                <span className="text-sm font-medium">kommi Dashboard</span>
              </div>
              <div className="p-8 bg-gradient-to-br from-primary/5 to-background">
                <h4 className="font-semibold mb-4">Competitor Analysis</h4>
                <div className="space-y-3">
                  {[
                    { name: "Salesforce", appearances: 12, position: "#1" },
                    { name: "Your Brand", appearances: 8, position: "#2", highlight: true },
                    { name: "HubSpot", appearances: 6, position: "#3" },
                    { name: "Pipedrive", appearances: 4, position: "#5" }
                  ].map((comp, idx) => (
                    <div key={idx} className={`flex items-center justify-between p-3 rounded-lg ${comp.highlight ? 'bg-primary/10 border-2 border-primary/30' : 'bg-muted/50 border'}`}>
                      <div className="flex items-center gap-3">
                        <Target className="w-4 h-4 text-primary" />
                        <span className={`font-medium ${comp.highlight ? 'text-primary' : ''}`}>{comp.name}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant="outline">{comp.position}</Badge>
                        <span className="text-sm text-muted-foreground">{comp.appearances} searches</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Feature 4: Position Tracking */}
          <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
            <div className="order-2 md:order-1 rounded-lg border border-border/40 bg-card shadow-xl overflow-hidden">
              <div className="bg-muted/50 px-6 py-4 border-b">
                <span className="text-sm font-medium">kommi Dashboard</span>
              </div>
              <div className="p-8 bg-gradient-to-br from-primary/5 to-background">
                <h4 className="font-semibold mb-4">Position Tracking</h4>
                <div className="space-y-3">
                  {[
                    { query: "best CRM software", position: "#2", trend: "up" },
                    { query: "enterprise solutions", position: "#1", trend: "up" },
                    { query: "project management", position: "#3", trend: "stable" }
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 rounded-lg border bg-background">
                      <div className="flex-1">
                        <p className="font-medium text-sm mb-1">{item.query}</p>
                        <div className="flex items-center gap-2">
                          <Badge className="bg-primary">#{item.position}</Badge>
                          {item.trend === "up" && <TrendingUp className="w-4 h-4 text-green-600" />}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="order-1 md:order-2">
              <h3 className="text-3xl font-bold mb-4">Track your brand position in AI answers</h3>
              <p className="text-lg text-muted-foreground mb-6">
                Know exactly where your brand ranks when AI answers questions. Track position changes over time and see how you compare to competitors. Most businesses have no idea what's being said about them by AI.
              </p>
              <Link href="/auth">
                <Button size="lg">
                  View live demo
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Feature 5: Team Collaboration */}
          <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
            <div>
              <h3 className="text-3xl font-bold mb-4">Team collaboration for market expansion</h3>
              <p className="text-lg text-muted-foreground mb-6">
                Share workspaces with your team. Collaborate on tracking strategies, share insights, and manage multiple brand trackers together. Perfect for agencies and growing teams.
              </p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-primary" />
                  <span>Shared team workspaces</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-primary" />
                  <span>Role-based permissions</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-primary" />
                  <span>Team dashboards and analytics</span>
                </li>
              </ul>
              <Link href="/auth">
               <Button size="lg">
                  Start collaborating
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            </div>
            <div className="rounded-lg border border-border/40 bg-card shadow-xl overflow-hidden">
              <div className="bg-muted/50 px-6 py-4 border-b">
                <span className="text-sm font-medium">kommi Team Workspace</span>
              </div>
              <div className="p-8 bg-gradient-to-br from-primary/5 to-background">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Building2 className="w-5 h-5 text-primary" />
                      <div>
                        <p className="font-semibold">Marketing Team</p>
                        <p className="text-xs text-muted-foreground">5 members</p>
                      </div>
                    </div>
                    <Badge>Active</Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Card className="p-4">
                      <div className="text-2xl font-bold mb-1">12</div>
                      <div className="text-xs text-muted-foreground">Team Trackers</div>
                    </Card>
                    <Card className="p-4">
                      <div className="text-2xl font-bold mb-1">47</div>
                      <div className="text-xs text-muted-foreground">Total Mentions</div>
                    </Card>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Members</span>
                      <div className="flex -space-x-2">
                          {[1,2,3,4].map((i) => (
                            <div key={i} className="w-6 h-6 rounded-full bg-primary/20 border-2 border-background"></div>
                          ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Feature 6: Search Query Analytics */}
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="order-2 md:order-1 rounded-lg border border-border/40 bg-card shadow-xl overflow-hidden">
              <div className="bg-muted/50 px-6 py-4 border-b">
                <span className="text-sm font-medium">kommi Dashboard</span>
              </div>
              <div className="p-8 bg-gradient-to-br from-primary/5 to-background">
                <h4 className="font-semibold mb-4">AI Search Queries</h4>
                <div className="space-y-2">
                  {[
                    "best CRM for startups",
                    "top project management tools",
                    "enterprise software solutions",
                    "small business CRM software"
                  ].map((query, idx) => (
                    <div key={idx} className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
                      <Search className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">{query}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="order-1 md:order-2">
              <h3 className="text-3xl font-bold mb-4">See what search queries AI uses</h3>
              <p className="text-lg text-muted-foreground mb-6">
                When AI answers questions, it searches the web with specific queries. Know exactly which keywords ChatGPT, Claude, and Gemini use. It's a critical insight for your content strategy.
              </p>
              <Link href="/auth">
                <Button size="lg">
                  View live demo
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      {/* Contacts Extraction (Beta) */}
      <section className="container max-w-screen-2xl px-4 py-24 bg-gradient-to-b from-background to-muted/30">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-3">Beta</Badge>
            <h2 className="text-4xl font-bold mb-4">Turn citations into contacts</h2>
            <p className="text-xl text-muted-foreground">
              Automatically extract emails, phone numbers, and social profiles from sources cited by AI. Reach out and earn mentions.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium">Contact extraction</p>
                    <p className="text-muted-foreground text-sm">Find emails, phones, and social links from cited sources (footer-aware, WhatsApp aware).</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium">Smart filtering</p>
                    <p className="text-muted-foreground text-sm">Removes telemetry/junk (sentry/wixpress) and asset-like emails automatically.</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium">No duplicates</p>
                    <p className="text-muted-foreground text-sm">De-duplicated per domain with confidence scores and CSV export.</p>
                  </div>
                </li>
              </ul>
              <div className="mt-6">
                <Link href="/auth">
                  <Button size="lg">
                    Try contacts (beta)
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
              </div>
            </div>
            <div className="rounded-lg border border-border/40 bg-card shadow-xl overflow-hidden">
              <div className="bg-muted/50 px-6 py-4 border-b">
                <span className="text-sm font-medium">Contacts (Beta)</span>
              </div>
              <div className="p-8 bg-gradient-to-br from-primary/5 to-background">
                <div className="space-y-3">
                  {[{company:'Acme CRM', email:'contact@acmecrm.com', phone:'+1 415 555 0133', domain:'acmecrm.com'}, {company:'Nimbus Suite', email:'hello@nimbussuite.com', phone:'+44 20 7946 0958', domain:'nimbussuite.com'}].map((c, idx) => (
                    <div key={idx} className="p-4 rounded-lg border bg-background">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{c.company}</p>
                          <p className="text-sm text-muted-foreground">{c.domain}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">95%</Badge>
                          <Badge variant="outline">Sample</Badge>
                        </div>
                      </div>
                      <div className="mt-3 text-sm space-y-1">
                        <div className="flex items-center gap-2"><Mail className="w-3 h-3" /> {c.email}</div>
                        <div className="flex items-center gap-2"><Phone className="w-3 h-3" /> {c.phone}</div>
                      </div>
                    </div>
                  ))}
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
            <Card className="p-6">
              <div className="text-4xl font-bold text-primary mb-2">1,450+</div>
              <div className="text-sm text-muted-foreground">Companies signed up</div>
            </Card>
            <Card className="p-6">
              <div className="text-4xl font-bold text-primary mb-2">50K+</div>
              <div className="text-sm text-muted-foreground">Brand mentions tracked</div>
            </Card>
            <Card className="p-6">
              <div className="text-4xl font-bold text-primary mb-2">98%</div>
              <div className="text-sm text-muted-foreground">Customer satisfaction</div>
            </Card>
          </div>
        </div>
      </section>

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
              className={`p-8 relative transition-all hover:shadow-xl ${
                plan.popular 
                  ? 'border-2 border-primary shadow-2xl scale-105 bg-gradient-to-br from-primary/5 to-background' 
                  : 'border hover:border-primary/30'
              }`}
            >
              {plan.popular && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white border-0 px-4 py-1">
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
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${plan.popular ? 'text-primary' : 'text-green-600'}`} />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
              
              <Link href="/auth" className="block">
                <Button 
                  className={`w-full ${plan.popular ? '' : 'border-2'}`}
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
        <Card className="bg-gradient-to-br from-primary via-primary/95 to-primary/90 border-0 text-primary-foreground p-12 text-center shadow-2xl">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Is your brand mentioned in ChatGPT?</h2>
          <p className="text-lg mb-8 max-w-2xl mx-auto opacity-90">
            Get a free analysis of your brand mentions and visibility in AI like ChatGPT, Claude, Gemini and more.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth">
              <Button size="lg" variant="secondary" className="text-lg px-8 bg-background text-foreground hover:bg-background/90">
                Analyze For Free
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="text-lg px-8 bg-transparent border-2 border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10">
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
