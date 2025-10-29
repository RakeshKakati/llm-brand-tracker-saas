"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  Settings,
  BarChart3,
  Target,
  FileText,
  Loader2,
  Building2,
  Crown,
  Zap,
  ArrowRight,
} from "lucide-react";
import { supabase } from "@/app/lib/supabaseClient";
import DashboardPage from "./DashboardPage";
import TrackingPage from "./TrackingPage";
import HistoryPage from "./HistoryPage";

interface TeamWorkspacePageProps {
  teamId: string;
  onBack: () => void;
}

export default function TeamWorkspacePage({ teamId, onBack }: TeamWorkspacePageProps) {
  const [team, setTeam] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string>("");
  const [subscription, setSubscription] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("dashboard");

  useEffect(() => {
    fetchTeamAndUser();
  }, [teamId]);

  const fetchTeamAndUser = async () => {
    try {
      setLoading(true);
      
      // Get user session
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user?.email) {
        console.error("❌ No user session");
        return;
      }

      setUserEmail(session.user.email);

      // Fetch subscription to check plan type
      const { data: subData } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("user_email", session.user.email)
        .maybeSingle();
      
      setSubscription(subData || { plan_type: "free", status: "active" });

      // Fetch team details using the API
      const response = await fetch(`/api/teams/${teamId}?user_email=${encodeURIComponent(session.user.email)}`);
      
      if (response.ok) {
        const data = await response.json();
        setTeam(data.team);
      } else {
        const errorData = await response.json();
        console.error("Error fetching team:", errorData);
        console.error("Team ID:", teamId);
        console.error("User Email:", session.user.email);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center p-6">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        <p className="text-sm text-muted-foreground mt-2">Loading team workspace...</p>
      </div>
    );
  }

  if (!team) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center p-6">
        <p className="text-sm text-muted-foreground">Team not found</p>
        <Button onClick={onBack} variant="outline" className="mt-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Teams
        </Button>
      </div>
    );
  }

  const isPro = subscription?.plan_type === "pro" && subscription?.status === "active";

  const handleUpgrade = async () => {
    try {
      const response = await fetch("/api/stripe/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_email: userEmail,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create checkout session");
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error: any) {
      console.error("❌ Upgrade error:", error);
      alert(error.message || "Failed to start upgrade process");
    }
  };

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
      {/* Upgrade Banner for Free Users */}
      {!isPro && (
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/20">
                  <Crown className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">You're viewing a team workspace</h3>
                  <p className="text-xs text-muted-foreground">
                    Upgrade to Pro to create your own teams and collaborate with unlimited members.
                  </p>
                </div>
              </div>
              <Button onClick={handleUpgrade} size="sm" variant="outline" className="whitespace-nowrap">
                <Zap className="w-3 h-3 mr-2" />
                Upgrade to Pro
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <Building2 className="w-5 h-5 text-primary flex-shrink-0" />
          <div className="flex-1 min-w-0 space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight truncate">
                {team.name}
              </h1>
              <Badge variant="outline" className="flex-shrink-0">Team Workspace</Badge>
            </div>
            {team.description && (
              <p className="text-sm text-muted-foreground truncate">{team.description}</p>
            )}
          </div>
        </div>
        <Button onClick={onBack} variant="outline" size="sm" className="flex-shrink-0">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
      </div>

      {/* Team Workspace Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="dashboard">
            <BarChart3 className="w-4 h-4 mr-2" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="trackers">
            <Target className="w-4 h-4 mr-2" />
            Trackers
          </TabsTrigger>
          <TabsTrigger value="history">
            <FileText className="w-4 h-4 mr-2" />
            History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="mt-6">
          <DashboardPage teamId={teamId} />
        </TabsContent>

        <TabsContent value="trackers" className="mt-6">
          <TrackingPage teamId={teamId} />
        </TabsContent>

        <TabsContent value="history" className="mt-6">
          <HistoryPage teamId={teamId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

