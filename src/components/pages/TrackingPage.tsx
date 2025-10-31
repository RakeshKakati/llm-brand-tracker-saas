"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Search, 
  Plus, 
  Play, 
  Pause, 
  Trash2,
  Activity,
  CheckCircle,
  XCircle,
  Loader2,
  RefreshCw,
  MoreVertical
} from "lucide-react";
import { supabase } from "@/app/lib/supabaseClient";

interface TrackingPageProps {
  teamId?: string;
}

export default function TrackingPage({ teamId }: TrackingPageProps = {}) {
  const [brand, setBrand] = useState("");
  const [query, setQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [interval, setInterval] = useState(5);
  const [loading, setLoading] = useState(false);
  const [trackers, setTrackers] = useState<any[]>([]);
  const [testSearchLoading, setTestSearchLoading] = useState(false);
  const [testSearchResult, setTestSearchResult] = useState<any>(null);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());

  const handleTrack = async () => {
    if (!brand || !query) {
      alert("Please enter both brand and query.");
      return;
    }
    try {
      setLoading(true);
      
      // Get user session to pass to API
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user?.email) {
        throw new Error("You must be logged in to create a tracker");
      }
      
      console.log("🔍 Creating tracker for:", brand, query, "User:", session.user.email);
      
      // Use the API endpoint to properly handle user auth and limits
      const response = await fetch("/api/trackBrand", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ 
          brand, 
          query, 
          interval,
          user_email: session.user.email,
          user_id: session.user.id,
          team_id: teamId || null
        }),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || "Failed to create tracker");
      }
      
      console.log("✅ Tracker created successfully");
      
      // Refresh trackers list
      await fetchTrackersData(false);
      
      setBrand("");
      setQuery("");
      setInterval(5);
      alert(`✅ Successfully created tracker for "${brand}" searching "${query}".`);
    } catch (err: any) {
      console.error("❌ Error creating tracker:", err);
      alert(err.message || "Failed to create tracker");
    } finally {
      setLoading(false);
    }
  };

  const fetchTrackersData = async (isAutoRefresh: boolean = false) => {
    try {
      if (!isAutoRefresh) {
        setLoading(true);
      }
      
      // Get current user's email
      const { data: { session } } = await supabase.auth.getSession();
      console.log("📧 TrackingPage - Session:", session);
      console.log("👤 TrackingPage - User email:", session?.user?.email);
      
      if (!session?.user?.email) {
        console.error("❌ No user session found in TrackingPage");
        return;
      }
      
      // Fetch trackers
      // Team workspace: Show all team members' trackers (RLS handles access)
      // Personal workspace: Show only current user's trackers
      console.log("🔍 Fetching trackers for:", session.user.email, teamId ? `team: ${teamId}` : "");
      let trackersQuery = supabase
        .from("tracked_brands")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (teamId) {
        trackersQuery = trackersQuery.eq("team_id", teamId);
      } else {
        trackersQuery = trackersQuery.eq("user_email", session.user.email).is("team_id", null);
      }
      
      const { data, error } = await trackersQuery;
      
      if (error) {
        console.error("❌ Error fetching trackers:", error);
        return;
      }
      
      console.log("✅ Trackers fetched:", data?.length || 0);
      setTrackers(data || []);
    } catch (err) {
      console.error("Error fetching trackers:", err);
    } finally {
      if (!isAutoRefresh) {
        setLoading(false);
      }
    }
  };

  const toggleTracker = async (id: string, active: boolean) => {
    const { error } = await supabase
      .from("tracked_brands")
      .update({ active: !active })
      .eq("id", id);
    
    if (!error) {
      fetchTrackersData(false);
    }
  };

  const deleteTracker = async (id: string) => {
    if (confirm("Are you sure you want to delete this tracker?")) {
      const { error } = await supabase
        .from("tracked_brands")
        .delete()
        .eq("id", id);
      
      if (!error) {
        fetchTrackersData(false);
      }
    }
  };

  // Lightweight query suggestions (client-side)
  const baseSuggestions: string[] = [
    "best {brand} alternatives",
    "{brand} pricing",
    "is {brand} good",
    "top {brand} competitors",
    "{brand} reviews",
    "best crm for startups",
    "best project management tools",
    "enterprise software solutions",
    "small business crm software"
  ];

  const suggestions = baseSuggestions
    .map(s => brand ? s.replaceAll("{brand}", brand) : s)
    .filter(s => !query || s.toLowerCase().includes(query.toLowerCase()))
    .slice(0, 6);

  const runCheck = async (brand: string, query: string) => {
    try {
      setTestSearchLoading(true);
      setTestSearchResult(null);
      
      // Get user email from session to pass to API
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user?.email) {
        throw new Error("You must be logged in to run a search");
      }
      
      console.log("🔍 Running check for:", brand, query, "User:", session.user.email);
      
      const res = await fetch("/api/checkMention", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          // Pass access token for server-side auth verification
          "Authorization": `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ 
          brand, 
          query,
          user_email: session.user.email,  // Explicitly pass user_email
          team_id: teamId || null  // Pass team_id if in team workspace
        }),
      });
      
      if (res.ok) {
        const result = await res.json();
        console.log("✅ Check completed:", result);
        setTestSearchResult({
          brand,
          query,
          mentioned: result.mentioned,
          evidence: result.evidence,
          timestamp: new Date().toISOString()
        });
      } else {
        const errorData = await res.json().catch(() => ({ error: "Unknown error" }));
        throw new Error(errorData.error || `HTTP ${res.status}`);
      }
    } catch (error) {
      console.error("❌ Error running check:", error);
      setTestSearchResult({
        brand,
        query,
        error: error.message || "Failed to run check"
      });
    } finally {
      setTestSearchLoading(false);
    }
  };

  // Load trackers on component mount
  useEffect(() => {
    fetchTrackersData(false);
  }, []);

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Brand Tracking</h1>
          <p className="text-sm text-muted-foreground">Create and manage brand mention trackers</p>
        </div>
        <Button
          onClick={() => {
            console.log("🔄 Manual refresh triggered");
            fetchTrackersData(false);
            setLastRefresh(new Date());
          }}
          disabled={loading}
          variant="outline"
          size="sm"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Create New Tracker */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Create New Tracker
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="brand-name">Brand Name</Label>
              <Input
                id="brand-name"
                placeholder="e.g. Muttleycrew"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="search-query">Search Query</Label>
              <div className="relative">
                <Input
                  id="search-query"
                  placeholder="e.g. best dog treats bangalore"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onFocus={() => setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                />
                {showSuggestions && suggestions.length > 0 && (
                  <div className="absolute z-10 mt-1 w-full rounded-md border bg-popover shadow-md">
                    {suggestions.map((s, idx) => (
                      <button
                        key={idx}
                        type="button"
                        className="w-full text-left px-3 py-2 text-sm hover:bg-muted transition-colors"
                        onMouseDown={(e) => { e.preventDefault(); setQuery(s); setShowSuggestions(false); }}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={() => runCheck(brand, query)}
              disabled={loading || testSearchLoading || !brand || !query}
              variant="outline"
            >
              {testSearchLoading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Search className="w-4 h-4 mr-2" />
              )}
              {testSearchLoading ? "Searching..." : "Search"}
            </Button>
            <Button
              onClick={handleTrack}
              disabled={loading || !brand || !query}
            >
              <Plus className="w-4 h-4 mr-2" />
              {loading ? "Creating..." : "Create Tracker"}
            </Button>
          </div>

          {/* Search Results - Inline */}
          {testSearchResult && (
            <div className={`p-4 rounded-lg border ${
              testSearchResult.error 
                ? 'bg-destructive/10 border-destructive/20' 
                : testSearchResult.mentioned 
                  ? 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900' 
                  : 'bg-muted/50 border'
            }`}>
              {testSearchResult.error ? (
                <div className="flex items-start gap-3">
                  <XCircle className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <h3 className="font-medium text-destructive mb-1">Search Failed</h3>
                    <p className="text-sm text-muted-foreground">{testSearchResult.error}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setTestSearchResult(null)}
                  >
                    <XCircle className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Badge variant={testSearchResult.mentioned ? "default" : "secondary"} className="text-sm">
                        {testSearchResult.mentioned ? (
                          <>
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Mentioned
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3 h-3 mr-1" />
                            Not Found
                          </>
                        )}
                      </Badge>
                      <span className="font-medium">{testSearchResult.brand}</span>
                      <span className="text-sm text-muted-foreground">• {testSearchResult.query}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setBrand(testSearchResult.brand);
                          setQuery(testSearchResult.query);
                          setTestSearchResult(null);
                        }}
                      >
                        Use This
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => setTestSearchResult(null)}
                      >
                        <XCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  {testSearchResult.evidence && testSearchResult.evidence !== "No mention found" && (
                    <p className="text-sm text-muted-foreground pl-8">
                      {testSearchResult.evidence}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Active Trackers */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              <CardTitle>Active Trackers</CardTitle>
              <Badge variant="secondary">{trackers.length}</Badge>
            </div>
            {selectedRows.size > 0 && (
              <div className="text-sm text-muted-foreground">
                {selectedRows.size} selected
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {trackers.length === 0 ? (
            <div className="p-12 text-center">
              <Activity className="w-12 h-12 mx-auto mb-4 opacity-50 text-muted-foreground" />
              <p className="text-sm font-medium text-muted-foreground">No trackers created yet</p>
              <p className="text-xs mt-1 text-muted-foreground">Create your first brand tracker above</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <div className="flex items-center justify-center">
                        <Checkbox
                          checked={selectedRows.size === trackers.length && trackers.length > 0}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedRows(new Set(trackers.map(t => t.id)));
                            } else {
                              setSelectedRows(new Set());
                            }
                          }}
                          aria-label="Select all"
                        />
                      </div>
                    </TableHead>
                    <TableHead>Brand</TableHead>
                    <TableHead>Query</TableHead>
                    <TableHead className="w-32">Status</TableHead>
                    <TableHead className="w-40">Created</TableHead>
                    <TableHead className="w-16"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {trackers.map((tracker) => (
                    <TableRow
                      key={tracker.id}
                      className={selectedRows.has(tracker.id) ? "bg-muted/50" : ""}
                    >
                      <TableCell>
                        <div className="flex items-center justify-center">
                          <Checkbox
                            checked={selectedRows.has(tracker.id)}
                            onCheckedChange={(checked) => {
                              const newSelected = new Set(selectedRows);
                              if (checked) {
                                newSelected.add(tracker.id);
                              } else {
                                newSelected.delete(tracker.id);
                              }
                              setSelectedRows(newSelected);
                            }}
                            aria-label="Select row"
                          />
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{tracker.brand}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {tracker.query}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={tracker.active ? "default" : "secondary"}
                          className="text-xs"
                        >
                          {tracker.active ? (
                            <>
                              <Activity className="w-3 h-3 mr-1" />
                              Active
                            </>
                          ) : (
                            <>
                              <Pause className="w-3 h-3 mr-1" />
                              Paused
                            </>
                          )}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(tracker.created_at).toLocaleDateString('en-GB', { 
                          day: '2-digit', 
                          month: '2-digit', 
                          year: 'numeric' 
                        })}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              className="h-8 w-8 p-0"
                              size="icon"
                            >
                              <MoreVertical className="h-4 w-4" />
                              <span className="sr-only">Open menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem
                              onClick={() => runCheck(tracker.brand, tracker.query)}
                            >
                              <Search className="w-4 h-4 mr-2" />
                              Check Now
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => toggleTracker(tracker.id, tracker.active)}
                            >
                              {tracker.active ? (
                                <>
                                  <Pause className="w-4 h-4 mr-2" />
                                  Pause
                                </>
                              ) : (
                                <>
                                  <Play className="w-4 h-4 mr-2" />
                                  Resume
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => deleteTracker(tracker.id)}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
