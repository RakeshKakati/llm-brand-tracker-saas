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
  Sparkles,
  ArrowRight,
  Rocket,
  Target,
  Users,
  Globe,
  Search,
  Bell,
  FileText,
  Database,
  ArrowDown,
  PlayCircle,
  Clock,
  Activity,
  Link2,
  ExternalLink
} from "lucide-react";
import Link from "next/link";

export default function LandingPageSaaS() {
  const features = [
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Real-time Monitoring",
      description: "Track brand mentions across AI-powered search results instantly"
    },
    {
      icon: <Target className="w-6 h-6" />,
      title: "AI-Powered Detection",
      description: "Advanced NLP for accurate brand mention identification"
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: "Analytics Dashboard",
      description: "Comprehensive insights and performance metrics"
    },
    {
      icon: <Globe className="w-6 h-6" />,
      title: "Source Tracking",
      description: "Identify and track exact sources with clickable links"
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Secure & Private",
      description: "End-to-end encryption and data protection"
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Multi-user Support",
      description: "Collaborate with team members seamlessly"
    }
  ];

  const pricingPlans = [
    {
      name: "Free",
      price: "$0",
      period: "forever",
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
      period: "month",
      description: "For growing businesses",
      features: [
        "Unlimited trackers",
        "Hourly checks",
        "Advanced analytics",
        "Priority support",
        "1 year history",
        "API access"
      ],
      cta: "Start Free Trial",
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
            <Sparkles className="h-5 w-5 text-primary" />
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
              AI search analytics for{" "}
              <span className="text-primary">marketing teams</span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              Track, analyze, and improve brand performance on AI search platforms
            </p>
            <p className="text-lg text-muted-foreground mb-8">
              through key metrics like{" "}
              <span className="font-semibold text-foreground">Visibility</span>,{" "}
              <span className="font-semibold text-foreground">Position</span>, and{" "}
              <span className="font-semibold text-foreground">Sentiment</span>
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/auth">
                <Button size="lg" className="text-lg px-8 py-6">
                  Start Free Trial
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="text-lg px-8 py-6">
                Talk to Sales
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mt-6">
              No credit card required • Trusted by 1000+ marketing teams
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card className="p-6 border-2 border-primary/20 bg-background">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-muted-foreground">Visibility</span>
                    <TrendingUp className="w-4 h-4 text-green-600" />
                  </div>
                  <div className="text-3xl font-bold">63%</div>
                  <div className="text-xs text-muted-foreground mt-1">Rank: 3/14</div>
                </Card>
                <Card className="p-6 border-2 border-primary/20 bg-background">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-muted-foreground">Sentiment</span>
                    <TrendingUp className="w-4 h-4 text-green-600" />
                  </div>
                  <div className="text-3xl font-bold">90</div>
                  <div className="text-xs text-muted-foreground mt-1">Rank: 2/14</div>
                </Card>
                <Card className="p-6 border-2 border-primary/20 bg-background">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-muted-foreground">Position</span>
                    <Target className="w-4 h-4 text-primary" />
                  </div>
                  <div className="text-3xl font-bold">2</div>
                  <div className="text-xs text-muted-foreground mt-1">Average rank</div>
                </Card>
              </div>
              <Card className="bg-background border-2 border-primary/10">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-lg">Competitive Comparison</h3>
                    <Badge>April 2025</Badge>
                  </div>
                  <div className="space-y-3">
                    {[
                      { brand: "Salesforce", visibility: 62, trend: "up" },
                      { brand: "Your Brand", visibility: 47, trend: "up", highlight: true },
                      { brand: "HubSpot", visibility: 65, trend: "down" },
                      { brand: "Zero", visibility: 32, trend: "stable" },
                      { brand: "Pipedrive", visibility: 21, trend: "up" }
                    ].map((item, idx) => (
                      <div key={idx} className={`flex items-center justify-between p-3 rounded-lg ${item.highlight ? 'bg-primary/10 border-2 border-primary/30' : 'bg-muted/50'}`}>
                        <span className={`font-medium ${item.highlight ? 'text-primary' : ''}`}>{item.brand}</span>
                        <div className="flex items-center gap-3">
                          <div className="w-32 bg-muted rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${item.highlight ? 'bg-primary' : 'bg-primary/40'}`}
                              style={{ width: `${item.visibility}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-semibold w-12 text-right">{item.visibility}%</span>
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


      {/* Product Features - Dashboard Views */}
      <section className="container max-w-screen-2xl px-4 py-24 bg-muted/50">
        <div className="mx-auto max-w-5xl text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">All Your Insights in One Place</h2>
          <p className="text-xl text-muted-foreground">
            Comprehensive dashboard with real-time metrics and competitive intelligence
          </p>
        </div>
        
        {/* Feature 1: Overview Dashboard */}
        <div className="max-w-6xl mx-auto mb-16">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold mb-2">Overview Dashboard</h3>
            <p className="text-muted-foreground">Real-time metrics at a glance</p>
          </div>
          <div className="rounded-lg border border-border/40 bg-card shadow-2xl overflow-hidden">
            <div className="bg-muted/50 px-6 py-4 border-b flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="ml-4 text-sm font-medium text-foreground">kommi Dashboard</span>
              </div>
              <Badge variant="outline" className="text-xs">Last 7 days</Badge>
            </div>
            <div className="p-8 bg-gradient-to-br from-primary/5 to-background">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card className="p-6 border-2 border-primary/20 bg-background">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-muted-foreground">Visibility</span>
                    <TrendingUp className="w-4 h-4 text-green-600" />
                  </div>
                  <div className="text-3xl font-bold">63%</div>
                  <div className="text-xs text-muted-foreground mt-1">Rank: 3/14</div>
                </Card>
                <Card className="p-6 border-2 border-primary/20 bg-background">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-muted-foreground">Sentiment</span>
                    <TrendingUp className="w-4 h-4 text-green-600" />
                  </div>
                  <div className="text-3xl font-bold">90</div>
                  <div className="text-xs text-muted-foreground mt-1">Rank: 2/14</div>
                </Card>
                <Card className="p-6 border-2 border-primary/20 bg-background">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-muted-foreground">Position</span>
                    <Target className="w-4 h-4 text-primary" />
                  </div>
                  <div className="text-3xl font-bold">2</div>
                  <div className="text-xs text-muted-foreground mt-1">Average rank</div>
                </Card>
              </div>
            </div>
          </div>
        </div>

        {/* Feature 2: Competitive Comparison */}
        <div className="max-w-6xl mx-auto mb-16">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold mb-2">Competitive Comparison</h3>
            <p className="text-muted-foreground">See how you stack up against competitors</p>
          </div>
          <div className="rounded-lg border border-border/40 bg-card shadow-2xl overflow-hidden">
            <div className="bg-muted/50 px-6 py-4 border-b flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="ml-4 text-sm font-medium text-foreground">kommi Dashboard</span>
              </div>
              <Badge variant="outline" className="text-xs">April 2025</Badge>
            </div>
            <div className="p-8 bg-gradient-to-br from-primary/5 to-background">
              <Card className="bg-background border-2 border-primary/10">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-lg">Competitive Comparison</h3>
                    <Badge>April 2025</Badge>
                  </div>
                  <div className="space-y-3">
                    {[
                      { brand: "Salesforce", visibility: 62 },
                      { brand: "Your Brand", visibility: 47, highlight: true },
                      { brand: "HubSpot", visibility: 65 },
                      { brand: "Zero", visibility: 32 },
                      { brand: "Pipedrive", visibility: 21 }
                    ].map((item, idx) => (
                      <div key={idx} className={`flex items-center justify-between p-3 rounded-lg ${item.highlight ? 'bg-primary/10 border-2 border-primary/30' : 'bg-muted/50'}`}>
                        <span className={`font-medium ${item.highlight ? 'text-primary font-semibold' : ''}`}>{item.brand}</span>
                        <div className="flex items-center gap-3">
                          <div className="w-32 bg-muted rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${item.highlight ? 'bg-primary' : 'bg-primary/40'}`}
                              style={{ width: `${item.visibility}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-semibold w-12 text-right">{item.visibility}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>

        {/* Feature 3: Source Tracking */}
        <div className="max-w-6xl mx-auto mb-16">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold mb-2">Top Sources</h3>
            <p className="text-muted-foreground">Identify where your brand mentions originate</p>
          </div>
          <div className="rounded-lg border border-border/40 bg-card shadow-2xl overflow-hidden">
            <div className="bg-muted/50 px-6 py-4 border-b flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="ml-4 text-sm font-medium text-foreground">kommi Dashboard</span>
              </div>
              <Badge variant="outline" className="text-xs">Top 10 Sources</Badge>
            </div>
            <div className="p-8 bg-gradient-to-br from-primary/5 to-background">
              <Card className="bg-background border-2 border-primary/10">
                <div className="p-6">
                  <div className="space-y-3">
                    {[
                      { domain: "techcrunch.com", mentions: 142, trend: "up" },
                      { domain: "producthunt.com", mentions: 98, trend: "up" },
                      { domain: "forbes.com", mentions: 76, trend: "stable" },
                      { domain: "theverge.com", mentions: 65, trend: "up" },
                      { domain: "wired.com", mentions: 54, trend: "down" }
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted/70 transition-colors">
                        <div className="flex items-center gap-4">
                          <Globe className="w-5 h-5 text-primary" />
                          <div>
                            <div className="font-medium">{item.domain}</div>
                            <div className="text-xs text-muted-foreground">{item.mentions} mentions</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {item.trend === "up" && <TrendingUp className="w-4 h-4 text-green-600" />}
                          {item.trend === "down" && <TrendingUp className="w-4 h-4 text-red-600 rotate-180" />}
                          {item.trend === "stable" && <Activity className="w-4 h-4 text-gray-400" />}
                          <ExternalLink className="w-4 h-4 text-muted-foreground" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>

        {/* Feature 4: Trend Analysis */}
        <div className="max-w-6xl mx-auto mb-16">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold mb-2">Trend Analysis</h3>
            <p className="text-muted-foreground">Track performance over time</p>
          </div>
          <div className="rounded-lg border border-border/40 bg-card shadow-2xl overflow-hidden">
            <div className="bg-muted/50 px-6 py-4 border-b flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="ml-4 text-sm font-medium text-foreground">kommi Dashboard</span>
              </div>
              <Badge variant="outline" className="text-xs">Last 30 days</Badge>
            </div>
            <div className="p-8 bg-gradient-to-br from-primary/5 to-background">
              <Card className="bg-background border-2 border-primary/10">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="font-semibold text-lg">Visibility Trend</h3>
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      +5.2% this month
                    </Badge>
                  </div>
                  <div className="h-48 flex items-end justify-between gap-2">
                    {[45, 48, 52, 49, 55, 58, 61, 59, 63, 65, 68, 63].map((value, idx) => (
                      <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                        <div 
                          className="w-full bg-primary rounded-t transition-all hover:bg-primary/80"
                          style={{ height: `${(value / 70) * 100}%` }}
                        ></div>
                        <span className="text-xs text-muted-foreground">{idx + 1}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Jan</span>
                    <span className="text-muted-foreground">Current</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>

        {/* Feature 5: Mention History */}
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold mb-2">Mention History</h3>
            <p className="text-muted-foreground">Track all brand mentions with full context</p>
          </div>
          <div className="rounded-lg border border-border/40 bg-card shadow-2xl overflow-hidden">
            <div className="bg-muted/50 px-6 py-4 border-b flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="ml-4 text-sm font-medium text-foreground">kommi Dashboard</span>
              </div>
              <Badge variant="outline" className="text-xs">Recent Mentions</Badge>
            </div>
            <div className="p-8 bg-gradient-to-br from-primary/5 to-background">
              <Card className="bg-background border-2 border-primary/10">
                <div className="p-6">
                  <div className="space-y-4">
                    {[
                      { query: "best CRM for startups", mentioned: true, sources: 5, time: "2h ago" },
                      { query: "top project management tools", mentioned: true, sources: 3, time: "5h ago" },
                      { query: "enterprise software solutions", mentioned: false, sources: 0, time: "1d ago" },
                      { query: "small business CRM software", mentioned: true, sources: 7, time: "2d ago" }
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between p-4 rounded-lg border bg-muted/30">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <Badge variant={item.mentioned ? "default" : "secondary"}>
                              {item.mentioned ? "Mentioned" : "Not Found"}
                            </Badge>
                            <span className="font-medium text-sm">{item.query}</span>
                          </div>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span>{item.sources} sources</span>
                            <span>•</span>
                            <span>{item.time}</span>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            </div>
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
            No credit card required • 14-day free trial
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
                  Most Popular
                </Badge>
              )}
              
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold mb-3">{plan.name}</h3>
                <div className="flex items-baseline justify-center gap-1 mb-2">
                  <span className="text-5xl font-bold">{plan.price}</span>
                  {plan.period && (
                    <span className="text-lg text-muted-foreground">/{plan.period}</span>
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
        
        <div className="mt-12 text-center">
          <p className="text-sm text-muted-foreground mb-4">
            Trusted by 1000+ marketing teams
          </p>
          <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
            <span className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              Free trial
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              No credit card
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              Cancel anytime
            </span>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="container max-w-screen-2xl px-4 py-20">
        <Card className="bg-gradient-to-br from-primary via-primary/95 to-primary/90 border-0 text-primary-foreground p-12 text-center shadow-2xl">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to start tracking your brand?</h2>
          <p className="text-lg mb-8 max-w-2xl mx-auto opacity-90">
            Join thousands of businesses monitoring their brand mentions in AI search results
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth">
              <Button size="lg" variant="secondary" className="text-lg px-8 bg-background text-foreground hover:bg-background/90">
                Start Free Trial
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="text-lg px-8 bg-transparent border-2 border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10">
              Talk to Sales
            </Button>
          </div>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 bg-muted/30">
        <div className="container max-w-screen-2xl px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* Brand */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <span className="font-bold text-lg">kommi</span>
              </div>
              <p className="text-sm text-muted-foreground">
                AI search analytics for marketing teams. Track, analyze, and improve your brand performance.
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
                <li><a href="#" className="hover:text-foreground transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">API Reference</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Blog</a></li>
              </ul>
            </div>
            
            {/* Company */}
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">About</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Careers</a></li>
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
              <a href="#" className="hover:text-foreground transition-colors">Cookie Policy</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

