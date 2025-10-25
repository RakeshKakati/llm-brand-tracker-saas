"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  Plus, 
  Play, 
  Pause, 
  Trash2,
  Clock,
  Activity,
  CheckCircle,
  XCircle,
  Loader2,
  RefreshCw
} from "lucide-react";
import { supabase } from "@/app/lib/supabaseClient";

export default function TrackingPage() {
  const [brand, setBrand] = useState("");
  const [query, setQuery] = useState("");
  const [interval, setInterval] = useState(5);
  const [loading, setLoading] = useState(false);
  const [trackers, setTrackers] = useState<any[]>([]);
  const [testSearchLoading, setTestSearchLoading] = useState(false);
  const [testSearchResult, setTestSearchResult] = useState<any>(null);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const handleTrack = async () => {
    if (!brand || !query) {
      alert("Please enter both brand and query.");
      return;
    }
    try {
      setLoading(true);
      const { error } = await supabase.from("tracked_brands").insert([
        {
          brand,
          query,
          interval_minutes: interval,
          active: true
        },
      ]);
      if (error) throw error;
      
      // Refresh trackers list
      await fetchTrackers(false);
      
      setBrand("");
      setQuery("");
      setInterval(5);
      alert(`✅ Successfully created tracker for "${brand}" searching "${query}" every ${interval} minutes.`);
    } catch (err: any) {
      console.error("❌ Supabase insert error:", err);
      alert(`❌ Failed to create tracker: ${err.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchTrackers = async (isAutoRefresh = false) => {
    try {
      if (!isAutoRefresh) {
        setLoading(true);
      }
      const { data, error } = await supabase
        .from("tracked_brands")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) {
        console.error("Error fetching trackers:", error);
        return;
      }
      
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
      fetchTrackers(false);
    }
  };

  const deleteTracker = async (id: string) => {
    if (confirm("Are you sure you want to delete this tracker?")) {
      const { error } = await supabase
        .from("tracked_brands")
        .delete()
        .eq("id", id);
      
      if (!error) {
        fetchTrackers(false);
      }
    }
  };

  const runCheck = async (brand: string, query: string) => {
    try {
      setTestSearchLoading(true);
      setTestSearchResult(null);
      
      const res = await fetch("/api/checkMention", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brand, query }),
      });
      
      if (res.ok) {
        const result = await res.json();
        setTestSearchResult({
          brand,
          query,
          mentioned: result.mentioned,
          evidence: result.evidence,
          timestamp: new Date().toISOString()
        });
      } else {
        throw new Error(`HTTP ${res.status}`);
      }
    } catch (error) {
      console.error("Error running check:", error);
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
    fetchTrackers(false);
    
    // Auto-refresh every 30 seconds to catch new trackers and status changes
    const interval = setInterval(() => {
      console.log("🔄 Auto-refreshing trackers data...");
      fetchTrackers(true); // Pass true for auto-refresh
      setLastRefresh(new Date());
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Brand Tracking</h1>
            <p className="text-gray-600">Create and manage brand mention trackers</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm text-gray-500">Last updated</p>
              <p className="text-xs text-gray-400">{lastRefresh.toLocaleTimeString()}</p>
            </div>
            <button
              onClick={() => {
                console.log("🔄 Manual refresh triggered");
                fetchTrackers(false); // Pass false for manual refresh
                setLastRefresh(new Date());
              }}
              disabled={loading}
              className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Create New Tracker */}
      <Card className="p-6 mb-8">
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
              className="mt-1"
            />
          </div>
          <div>
            <Label className="text-sm font-medium text-gray-700">Check Interval (minutes)</Label>
            <Input
              type="number"
              min={1}
              value={interval}
              onChange={(e) => setInterval(Number(e.target.value))}
              className="mt-1"
            />
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
        <Card className="p-6 mb-8">
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
                      const { error } = await supabase.from("tracked_brands").insert([
                        {
                          brand: testSearchResult.brand,
                          query: testSearchResult.query,
                          interval_minutes: interval,
                          active: true
                        },
                      ]);
                      if (error) throw error;
                      
                      // Refresh trackers list
                      await fetchTrackers(false);
                      
                      // Clear form and results
                      setBrand("");
                      setQuery("");
                      setInterval(5);
                      setTestSearchResult(null);
                      
                      alert(`✅ Successfully created tracker for "${testSearchResult.brand}" searching "${testSearchResult.query}" every ${interval} minutes.`);
                    } catch (err: any) {
                      console.error("❌ Supabase insert error:", err);
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
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">Active Trackers</h2>
            <Badge variant="secondary">{trackers.length}</Badge>
          </div>
        </div>

        <div className="space-y-4">
          {trackers.map((tracker) => (
            <div key={tracker.id} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-medium text-gray-900">{tracker.brand}</h3>
                    <Badge variant={tracker.active ? "default" : "secondary"}>
                      {tracker.active ? "Active" : "Paused"}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{tracker.query}</p>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Every {tracker.interval_minutes} min
                    </div>
                    <div>
                      Created {new Date(tracker.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => runCheck(tracker.brand, tracker.query)}
                  >
                    <Search className="w-3 h-3 mr-1" />
                    Check Now
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => toggleTracker(tracker.id, tracker.active)}
                  >
                    {tracker.active ? (
                      <Pause className="w-3 h-3 mr-1" />
                    ) : (
                      <Play className="w-3 h-3 mr-1" />
                    )}
                    {tracker.active ? "Pause" : "Resume"}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => deleteTracker(tracker.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
          
          {trackers.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Activity className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No trackers created yet</p>
              <p className="text-sm">Create your first brand tracker above</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
