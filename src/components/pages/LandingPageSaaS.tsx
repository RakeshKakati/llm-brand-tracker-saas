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
  Globe
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
      price: "$29",
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
            <span className="font-semibold text-xl">Brand Tracker</span>
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
      <section className="container max-w-screen-2xl px-4 py-24 md:py-32">
        <div className="mx-auto max-w-4xl text-center">
          <Badge className="mb-8 px-4 py-1.5 bg-primary/10 text-primary border-primary/20">
            <Rocket className="w-3 h-3 mr-2" />
            New: AI-Powered Brand Intelligence
          </Badge>
          <h1 className="text-5xl font-bold tracking-tight md:text-6xl lg:text-7xl mb-6">
            Never Miss a Brand{" "}
            <span className="text-primary">Mention</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
            Track your brand mentions across AI-powered search results in real-time. 
            Get instant alerts and powerful analytics to grow your online presence.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/auth">
              <Button size="lg" className="text-lg px-8 py-6">
                Start Free Trial
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="text-lg px-8 py-6">
              Watch Demo
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-6">
            No credit card required • 14-day free trial
          </p>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container max-w-screen-2xl px-4 py-24">
        <div className="mx-auto max-w-2xl text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Everything You Need</h2>
          <p className="text-xl text-muted-foreground">
            Powerful features to keep your brand on top
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="p-6 hover:shadow-lg transition-all hover:border-primary/20">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 rounded-lg bg-primary/10 text-primary">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold">{feature.title}</h3>
              </div>
              <p className="text-muted-foreground">{feature.description}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Pricing Section */}
      <section className="container max-w-screen-2xl px-4 py-24 bg-muted/50">
        <div className="mx-auto max-w-2xl text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Simple, Transparent Pricing</h2>
          <p className="text-xl text-muted-foreground">
            Choose the plan that fits your needs
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {pricingPlans.map((plan, index) => (
            <Card 
              key={index} 
              className={`p-8 relative ${plan.popular ? 'border-primary shadow-lg scale-105' : ''}`}
            >
              {plan.popular && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary">
                  Most Popular
                </Badge>
              )}
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <div className="flex items-baseline justify-center gap-2">
                  <span className="text-5xl font-bold">{plan.price}</span>
                  {plan.period && (
                    <span className="text-muted-foreground">/{plan.period}</span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-2">{plan.description}</p>
              </div>
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
              <Link href="/auth">
                <Button 
                  className="w-full" 
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

      {/* CTA Section */}
      <section className="container max-w-screen-2xl px-4 py-24">
        <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-2 border-primary/20 p-12 text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to Start Tracking?</h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of businesses monitoring their brand mentions in real-time
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth">
              <Button size="lg" className="text-lg px-8">
                Get Started Free
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="text-lg px-8">
              Schedule a Demo
            </Button>
          </div>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 py-8">
        <div className="container max-w-screen-2xl px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <span className="font-semibold">Brand Tracker</span>
            </div>
            <div className="flex gap-6 text-sm text-muted-foreground">
              <a href="#" className="hover:text-foreground">Privacy</a>
              <a href="#" className="hover:text-foreground">Terms</a>
              <a href="#" className="hover:text-foreground">Support</a>
            </div>
          </div>
          <p className="text-center text-sm text-muted-foreground mt-4">
            © 2025 Brand Tracker. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

