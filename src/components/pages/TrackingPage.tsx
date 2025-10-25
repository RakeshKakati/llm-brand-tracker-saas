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
  Activity
} from "lucide-react";
import { supabase } from "@/app/lib/supabaseClient";

export default function TrackingPage() {
  const [brand, setBrand] = useState("");
  const [query, setQuery] = useState("");
  const [interval, setInterval] = useState(5);
  const [loading, setLoading] = useState(false);
  const [trackers, setTrackers] = useState<any[]>([]);

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
      await fetchTrackers();
      
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

  const fetchTrackers = async () => {
    try {
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
    }
  };

  const toggleTracker = async (id: string, active: boolean) => {
    const { error } = await supabase
      .from("tracked_brands")
      .update({ active: !active })
      .eq("id", id);
    
    if (!error) {
      fetchTrackers();
    }
  };

  const deleteTracker = async (id: string) => {
    if (confirm("Are you sure you want to delete this tracker?")) {
      const { error } = await supabase
        .from("tracked_brands")
        .delete()
        .eq("id", id);
      
      if (!error) {
        fetchTrackers();
      }
    }
  };

  const runCheck = async (brand: string, query: string) => {
    try {
      const res = await fetch("/api/checkMention", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brand, query }),
      });
      if (res.ok) {
        alert("✅ Check completed! Check the history page for results.");
      }
    } catch (error) {
      console.error("Error running check:", error);
      alert("❌ Failed to run check");
    }
  };

  // Load trackers on component mount
  useEffect(() => {
    fetchTrackers();
  }, []);

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Brand Tracking</h1>
        <p className="text-gray-600">Create and manage brand mention trackers</p>
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
            disabled={loading || !brand || !query}
            variant="outline"
          >
            <Search className="w-4 h-4 mr-2" />
            Test Search
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
