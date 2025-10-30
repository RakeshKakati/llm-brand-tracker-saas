"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
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
import { IconDotsVertical } from "@tabler/icons-react";
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
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Plus className="w-5 h-5 text-gray-600" />
          <h2 className="text-lg font-semibold text-gray-900">Create New Tracker</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <Label className="text-sm font-medium text-gray-700">Brand Name</Label>
            <Input
              placeholder="e.g. Muttleycrew"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <Label className="text-sm font-medium text-gray-700">Search Query</Label>
            <Input
              placeholder="e.g. best dog treats bangalore"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
              className="mt-1"
            />
            {showSuggestions && suggestions.length > 0 && (
              <div className="relative">
                <div className="absolute z-10 mt-1 w-full rounded-md border bg-white shadow-md">
                  {suggestions.map((s, idx) => (
                    <button
                      key={idx}
                      type="button"
                      className="w-full text-left px-3 py-2 text-sm hover:bg-muted"
                      onMouseDown={(e) => { e.preventDefault(); setQuery(s); setShowSuggestions(false); }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
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
            {testSearchLoading ? "Searching..." : "Test Search"}
          </Button>
          <Button
            onClick={handleTrack}
            disabled={loading || !brand || !query}
          >
            <Plus className="w-4 h-4 mr-2" />
            {loading ? "Creating..." : "Create Tracker"}
          </Button>
        </div>
      </Card>

      {/* Test Search Results */}
      {testSearchResult && (
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Search className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">Test Search Results</h2>
          </div>
          
          {testSearchResult.error ? (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <XCircle className="w-5 h-5 text-red-500" />
                <h3 className="font-medium text-red-900">Search Failed</h3>
              </div>
              <p className="text-sm text-red-700">{testSearchResult.error}</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <h3 className="font-medium text-gray-900">{testSearchResult.brand}</h3>
                    <Badge variant={testSearchResult.mentioned ? "default" : "secondary"}>
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
                  </div>
                  <div className="text-xs text-gray-500">
                    {new Date(testSearchResult.timestamp).toLocaleTimeString()}
                  </div>
                </div>
                
                <p className="text-sm text-gray-600 mb-3">
                  <strong>Query:</strong> {testSearchResult.query}
                </p>
                
                {testSearchResult.evidence && testSearchResult.evidence !== "No mention found" && (
                  <div className="bg-white p-3 rounded-md border">
                    <p className="text-sm text-gray-700">
                      <strong>Evidence:</strong> {testSearchResult.evidence}
                    </p>
                  </div>
                )}
              </div>
              
              <div className="flex gap-2">
                <Button
                  onClick={() => setTestSearchResult(null)}
                  variant="outline"
                  size="sm"
                >
                  Close Results
                </Button>
                <Button
                  onClick={() => {
                    setBrand(testSearchResult.brand);
                    setQuery(testSearchResult.query);
                    setTestSearchResult(null);
                  }}
                  variant="outline"
                  size="sm"
                >
                  Fill Form Only
                </Button>
                <Button
                  onClick={async () => {
                    try {
                      setLoading(true);
                      
                      // Get user session
                      const { data: { session } } = await supabase.auth.getSession();
                      
                      if (!session?.user?.email) {
                        throw new Error("You must be logged in to create a tracker");
                      }
                      
                      console.log("🔍 Creating tracker from test results for:", session.user.email);
                      
                      // Use the API endpoint instead of direct insert
                      const response = await fetch("/api/trackBrand", {
                        method: "POST",
                        headers: { 
                          "Content-Type": "application/json",
                          "Authorization": `Bearer ${session.access_token}`
                        },
                        body: JSON.stringify({ 
                          brand: testSearchResult.brand,
                          query: testSearchResult.query,
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
                      
                      console.log("✅ Tracker created successfully from test results");
                      
                      // Refresh trackers list
                      await fetchTrackersData(false);
                      
                      // Clear form and results
                      setBrand("");
                      setQuery("");
                      setInterval(5);
                      setTestSearchResult(null);
                      
                      alert(`✅ Successfully created tracker for "${testSearchResult.brand}" searching "${testSearchResult.query}".`);
                    } catch (err: any) {
                      console.error("❌ Error creating tracker:", err);
                      alert(`❌ Failed to create tracker: ${err.message || 'Unknown error'}`);
                    } finally {
                      setLoading(false);
                    }
                  }}
                  disabled={loading}
                  size="sm"
                >
                  {loading ? "Creating..." : "Create Tracker"}
                </Button>
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Active Trackers */}
      <Card>
        <div className="flex items-center justify-between border-b p-6">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-muted-foreground" />
            <h2 className="text-base font-semibold">Active Trackers</h2>
            <Badge variant="secondary">{trackers.length}</Badge>
          </div>
          {selectedRows.size > 0 && (
            <div className="text-sm text-muted-foreground">
              {selectedRows.size} of {trackers.length} row(s) selected
            </div>
          )}
        </div>

        {trackers.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground">
            <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="text-sm font-medium">No trackers created yet</p>
            <p className="text-xs mt-1">Create your first brand tracker above</p>
          </div>
        ) : (
          <div className="overflow-hidden">
            <Table>
              <TableHeader className="bg-muted">
                <TableRow>
                  <TableHead className="w-12">
                    <div className="flex items-center justify-center">
                      <Checkbox
                        checked={selectedRows.size === trackers.length}
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
                  <TableHead className="w-20"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {trackers.map((tracker) => (
                  <TableRow
                    key={tracker.id}
                    data-state={selectedRows.has(tracker.id) && "selected"}
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
                        className="text-muted-foreground px-1.5"
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
                      {new Date(tracker.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            className="data-[state=open]:bg-muted text-muted-foreground flex size-8"
                            size="icon"
                          >
                            <IconDotsVertical />
                            <span className="sr-only">Open menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
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
                            className="text-red-600"
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
      </Card>
    </div>
  );
}
