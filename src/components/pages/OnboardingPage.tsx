"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Globe, CheckCircle, ArrowRight, Target, Search, Sparkles, Plus, X } from "lucide-react";
import { supabase } from "@/app/lib/supabaseClient";
import { useRouter } from "next/navigation";

interface BusinessInfo {
  name: string;
  description: string;
  category: string;
  industry: string;
  targetAudience: string;
}

interface CompetitorOption {
  domain: string;
  name: string;
  selected: boolean;
}

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [website, setWebsite] = useState("");
  const [loading, setLoading] = useState(false);
  const [confirmedBusinessInfo, setConfirmedBusinessInfo] = useState<BusinessInfo | null>(null);
  const [editedBusinessInfo, setEditedBusinessInfo] = useState<BusinessInfo | null>(null);
  const [competitorOptions, setCompetitorOptions] = useState<CompetitorOption[]>([]);
  const [newCompetitorDomain, setNewCompetitorDomain] = useState("");
  const [prompts, setPrompts] = useState<string[]>([]);
  const [selectedPrompt, setSelectedPrompt] = useState<string>("");
  const [processingPrompt, setProcessingPrompt] = useState(false);
  const [generatingPrompts, setGeneratingPrompts] = useState(false);

  const handleParseWebsite = async () => {
    if (!website.trim()) {
      alert("Please enter a website URL");
      return;
    }

    try {
      setLoading(true);
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user?.email) {
        throw new Error("You must be logged in");
      }

      const response = await fetch("/api/onboarding/parse-website", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          website: website.trim(),
          user_email: session.user.email,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to parse website");
      }

      // Set parsed business info (editable)
      const parsedBusiness = result.business;
      setConfirmedBusinessInfo(parsedBusiness);
      setEditedBusinessInfo(parsedBusiness);

      // Convert competitors to selectable options
      const competitorOpts: CompetitorOption[] = (result.competitors || []).map((comp: string) => {
        const domain = comp.replace(/^https?:\/\//, "").replace(/\/$/, "");
        const name = domain.split(".")[0];
        return {
          domain: domain,
          name: name.charAt(0).toUpperCase() + name.slice(1),
          selected: true, // Default to selected
        };
      });
      setCompetitorOptions(competitorOpts);
      setStep(2); // Go to confirmation step
    } catch (error: any) {
      console.error("Error parsing website:", error);
      alert(error.message || "Failed to parse website. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddNewCompetitor = () => {
    if (!newCompetitorDomain.trim()) return;

    const domain = newCompetitorDomain.trim().replace(/^https?:\/\//, "").replace(/\/$/, "");
    const name = domain.split(".")[0];
    
    // Check if already exists
    if (competitorOptions.some(c => c.domain === domain)) {
      alert("This competitor is already in the list");
      return;
    }

    setCompetitorOptions([...competitorOptions, {
      domain: domain,
      name: name.charAt(0).toUpperCase() + name.slice(1),
      selected: true,
    }]);
    setNewCompetitorDomain("");
  };

  const toggleCompetitorSelection = (index: number) => {
    const updated = [...competitorOptions];
    updated[index].selected = !updated[index].selected;
    setCompetitorOptions(updated);
  };

  const removeCompetitor = (index: number) => {
    setCompetitorOptions(competitorOptions.filter((_, i) => i !== index));
  };

  const handleConfirmAndContinue = async () => {
    if (!editedBusinessInfo) return;

    try {
      setLoading(true);
      
      // Update confirmed business info
      setConfirmedBusinessInfo(editedBusinessInfo);

      // Generate prompts based on confirmed info and selected competitors
      await generatePrompts(editedBusinessInfo, competitorOptions.filter(c => c.selected));

      // Add selected competitors to database
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user?.email) {
        throw new Error("You must be logged in");
      }

      // Check subscription limits for warning
      const { data: sub } = await supabase
        .from("subscriptions")
        .select("plan_type")
        .eq("user_email", session.user.email)
        .maybeSingle();
      
      const plan = (sub?.plan_type || "free").toLowerCase();
      const limit = plan === "pro" ? 5 : 1;

      const selectedCompetitors = competitorOptions.filter(c => c.selected);
      
      // Warn if exceeding limit, but still try to add all selected
      if (selectedCompetitors.length > limit) {
        console.warn(`User selected ${selectedCompetitors.length} competitors but plan allows ${limit}`);
      }
      
      // Add ALL selected competitors (database will enforce limits if needed)
      let addedCount = 0;
      let skippedCount = 0;
      
      for (const competitor of selectedCompetitors) {
        try {
          const { error } = await supabase
            .from("tracked_competitors")
            .insert({
              user_email: session.user.email,
              name: competitor.name,
              domain: competitor.domain,
            });

          if (error) {
            if (error.message.includes("duplicate")) {
              console.log(`Competitor ${competitor.domain} already exists`);
              skippedCount++;
            } else if (error.message.includes("limit") || error.message.includes("Limit")) {
              console.warn(`Limit reached for competitor ${competitor.domain}:`, error.message);
              skippedCount++;
            } else {
              console.error(`Error adding competitor ${competitor.domain}:`, error);
              skippedCount++;
            }
          } else {
            addedCount++;
          }
        } catch (err) {
          console.error(`Error processing competitor ${competitor.domain}:`, err);
          skippedCount++;
        }
      }

      // Show feedback if some competitors couldn't be added
      if (skippedCount > 0 && addedCount > 0) {
        console.log(`Added ${addedCount} competitors, ${skippedCount} skipped (may be duplicates or limit reached)`);
      }

      setStep(3); // Go to prompt selection
    } catch (error: any) {
      console.error("Error confirming info:", error);
      alert(error.message || "Failed to proceed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const generatePrompts = async (business: BusinessInfo, selectedCompetitors: CompetitorOption[]) => {
    try {
      setGeneratingPrompts(true);
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user?.email) {
        throw new Error("You must be logged in");
      }

      const response = await fetch("/api/onboarding/generate-prompts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          business: business,
          competitors: selectedCompetitors.map(c => c.domain),
          user_email: session.user.email,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to generate prompts");
      }

      setPrompts(result.prompts || []);
    } catch (error: any) {
      console.error("Error generating prompts:", error);
      // Fallback prompts
      const fallback = [
        `best ${business.category.toLowerCase()}`,
        `top ${business.category.toLowerCase()} 2024`,
        `${business.category.toLowerCase()} for ${business.targetAudience.toLowerCase()}`,
        `best ${business.category.toLowerCase()} for startups`,
        `${business.category.toLowerCase()} comparison`
      ];
      setPrompts(fallback);
    } finally {
      setGeneratingPrompts(false);
    }
  };

  const handleSelectPrompt = async (prompt: string) => {
    try {
      setProcessingPrompt(true);
      setSelectedPrompt(prompt);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user?.email) {
        throw new Error("You must be logged in");
      }

      // Run the search
      const checkResponse = await fetch("/api/checkMention", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          brand: confirmedBusinessInfo?.name || "Your Brand",
          query: prompt,
          user_email: session.user.email,
        }),
      });

      // Create a tracker for this brand/query
      const trackResponse = await fetch("/api/trackBrand", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          brand: confirmedBusinessInfo?.name || "Your Brand",
          query: prompt,
          interval: 5,
          user_email: session.user.email,
          user_id: session.user.id,
        }),
      });

      if (!trackResponse.ok) {
        const error = await trackResponse.json();
        throw new Error(error.error || "Failed to create tracker");
      }

      // Redirect to tracking page - refresh to hide onboarding
      window.location.href = "/dashboard";
    } catch (error: any) {
      console.error("Error processing prompt:", error);
      alert(error.message || "Failed to start tracking. Redirecting to dashboard...");
      window.location.href = "/dashboard";
    } finally {
      setProcessingPrompt(false);
    }
  };

  return (
    <div className="flex flex-1 flex-col gap-6 p-6 max-w-4xl mx-auto">
      {/* Progress Steps */}
      <div className="flex items-center justify-between mb-8">
        <div className={`flex items-center gap-2 ${step >= 1 ? 'text-primary' : 'text-muted-foreground'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
            step >= 1 ? 'bg-primary text-primary-foreground border-primary' : 'border-muted-foreground'
          }`}>
            {step > 1 ? <CheckCircle className="w-5 h-5" /> : '1'}
          </div>
          <span className="text-sm font-medium">Website</span>
        </div>
        <div className="flex-1 h-0.5 bg-muted mx-4" />
        <div className={`flex items-center gap-2 ${step >= 2 ? 'text-primary' : 'text-muted-foreground'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
            step >= 2 ? 'bg-primary text-primary-foreground border-primary' : 'border-muted-foreground'
          }`}>
            {step > 2 ? <CheckCircle className="w-5 h-5" /> : '2'}
          </div>
          <span className="text-sm font-medium">Competitors</span>
        </div>
        <div className="flex-1 h-0.5 bg-muted mx-4" />
        <div className={`flex items-center gap-2 ${step >= 3 ? 'text-primary' : 'text-muted-foreground'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
            step >= 3 ? 'bg-primary text-primary-foreground border-primary' : 'border-muted-foreground'
          }`}>
            3
          </div>
          <span className="text-sm font-medium">Search</span>
        </div>
      </div>

      {/* Step 1: Get Website */}
      {step === 1 && (
        <Card className="p-8">
          <CardHeader className="text-center pb-6">
            <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Globe className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">Welcome! Let's Get Started</CardTitle>
            <CardDescription className="text-base">
              Enter your website URL and we'll analyze your business to set up tracking
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="website" className="text-sm font-medium">Website URL</Label>
              <Input
                id="website"
                type="text"
                placeholder="example.com or https://example.com"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleParseWebsite()}
                className="mt-2"
              />
            </div>
            <Button
              onClick={handleParseWebsite}
              disabled={loading || !website.trim()}
              className="w-full"
              size="lg"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing Website...
                </>
              ) : (
                <>
                  Analyze Website
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Confirm Business Info & Select Competitors */}
      {step === 2 && editedBusinessInfo && (
        <Card className="p-8">
          <CardHeader className="pb-6">
            <div className="flex items-center gap-3 mb-2">
              <Target className="w-6 h-6 text-primary" />
              <CardTitle className="text-2xl">Confirm Your Business Information</CardTitle>
            </div>
            <CardDescription className="text-base">
              Please review and edit the information we found, then select competitors to track
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Editable Business Information */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="businessName" className="text-sm font-medium">Business Name *</Label>
                <Input
                  id="businessName"
                  value={editedBusinessInfo.name}
                  onChange={(e) => setEditedBusinessInfo({ ...editedBusinessInfo, name: e.target.value })}
                  className="mt-2"
                  placeholder="Your business name"
                />
              </div>
              <div>
                <Label htmlFor="category" className="text-sm font-medium">Category *</Label>
                <Input
                  id="category"
                  value={editedBusinessInfo.category}
                  onChange={(e) => setEditedBusinessInfo({ ...editedBusinessInfo, category: e.target.value })}
                  className="mt-2"
                  placeholder="e.g., CRM Software, E-commerce Platform"
                />
              </div>
              <div>
                <Label htmlFor="description" className="text-sm font-medium">Description</Label>
                <Textarea
                  id="description"
                  value={editedBusinessInfo.description}
                  onChange={(e) => setEditedBusinessInfo({ ...editedBusinessInfo, description: e.target.value })}
                  className="mt-2"
                  rows={3}
                  placeholder="What your business does"
                />
              </div>
              <div>
                <Label htmlFor="industry" className="text-sm font-medium">Industry</Label>
                <Input
                  id="industry"
                  value={editedBusinessInfo.industry}
                  onChange={(e) => setEditedBusinessInfo({ ...editedBusinessInfo, industry: e.target.value })}
                  className="mt-2"
                  placeholder="e.g., SaaS, E-commerce, Healthcare"
                />
              </div>
              <div>
                <Label htmlFor="targetAudience" className="text-sm font-medium">Target Audience</Label>
                <Input
                  id="targetAudience"
                  value={editedBusinessInfo.targetAudience}
                  onChange={(e) => setEditedBusinessInfo({ ...editedBusinessInfo, targetAudience: e.target.value })}
                  className="mt-2"
                  placeholder="e.g., Startups, Small Businesses, Enterprise"
                />
              </div>
            </div>

            {/* Competitor Selection */}
            <div>
              <Label className="text-sm font-medium mb-3 block">
                Select Competitors to Track ({competitorOptions.filter(c => c.selected).length} selected)
              </Label>
              {competitorOptions.length > 0 ? (
                <div className="space-y-2 p-4 bg-muted/50 rounded-lg border max-h-60 overflow-y-auto">
                  {competitorOptions.map((comp, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 rounded hover:bg-background transition-colors">
                      <div className="flex items-center gap-3 flex-1">
                        <Checkbox
                          checked={comp.selected}
                          onCheckedChange={() => toggleCompetitorSelection(idx)}
                        />
                        <Globe className="w-4 h-4 text-muted-foreground" />
                        <div className="flex-1">
                          <div className="font-medium text-sm">{comp.name}</div>
                          <div className="text-xs text-muted-foreground">{comp.domain}</div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => removeCompetitor(idx)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 bg-muted/50 rounded-lg border text-sm text-muted-foreground">
                  No competitors found. Add them below or continue without competitors.
                </div>
              )}

              {/* Add New Competitor */}
              <div className="flex gap-2 mt-3">
                <Input
                  placeholder="Add competitor domain (e.g., competitor.com)"
                  value={newCompetitorDomain}
                  onChange={(e) => setNewCompetitorDomain(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddNewCompetitor()}
                />
                <Button onClick={handleAddNewCompetitor} variant="outline">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <Button
              onClick={handleConfirmAndContinue}
              disabled={loading || generatingPrompts || !editedBusinessInfo.name.trim() || !editedBusinessInfo.category.trim()}
              className="w-full"
              size="lg"
            >
              {loading || generatingPrompts ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {generatingPrompts ? "Generating Prompts..." : "Saving..."}
                </>
              ) : (
                <>
                  Continue to Search Prompts
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Select Prompt */}
      {step === 3 && (
        <Card className="p-8">
          <CardHeader className="pb-6">
            <div className="flex items-center gap-3 mb-2">
              <Sparkles className="w-6 h-6 text-primary" />
              <CardTitle className="text-2xl">Choose Your First Search Query</CardTitle>
            </div>
            <CardDescription className="text-base">
              {confirmedBusinessInfo && (
                <>We've generated search prompts based on <strong>{confirmedBusinessInfo.name}</strong> ({confirmedBusinessInfo.category}). Select one to start tracking:</>
              )}
              {!confirmedBusinessInfo && "Select a prompt to start tracking:"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {prompts.length > 0 ? (
              prompts.map((prompt, idx) => (
                <Button
                  key={idx}
                  variant={selectedPrompt === prompt ? "default" : "outline"}
                  className="w-full justify-start h-auto py-4 px-4 text-left"
                  onClick={() => handleSelectPrompt(prompt)}
                  disabled={processingPrompt}
                >
                  <div className="flex items-center gap-3 flex-1">
                    <Search className="w-5 h-5 flex-shrink-0" />
                    <span className="flex-1">{prompt}</span>
                    {selectedPrompt === prompt && processingPrompt && (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    )}
                  </div>
                </Button>
              ))
            ) : (
              <div className="p-4 bg-muted/50 rounded-lg border text-sm text-muted-foreground">
                No prompts generated. You can create a tracker manually.
              </div>
            )}
            {processingPrompt && (
              <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg">
                <div className="flex items-center gap-2 text-primary">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm font-medium">Setting up your tracker and running first search...</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

