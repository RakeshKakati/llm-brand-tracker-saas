"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/app/lib/supabaseClient";

export default function TrackerForm({
  onRunCheck,
}: {
  onRunCheck: (b: string, q: string, i: number) => void;
}) {
  const [brand, setBrand] = useState("");
  const [query, setQuery] = useState("");
  const [interval, setInterval] = useState(5); // default: 5 minutes
  const [loading, setLoading] = useState(false);

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
          interval_minutes: interval, // store interval in minutes now
        },
      ]);
      if (error) throw error;
      alert(`✅ Tracking "${brand}" for "${query}" every ${interval} minutes.`);
      setBrand("");
      setQuery("");
      setInterval(5);
    } catch (err: any) {
      console.error("❌ Supabase insert error:", err.message);
      alert("Failed to track brand. Check console for details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 bg-background border rounded-xl p-4 shadow-sm">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label>Brand</Label>
          <Input
            placeholder="e.g. Muttleycrew"
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
          />
        </div>
        <div>
          <Label>Query</Label>
          <Input
            placeholder="e.g. best dog treats bangalore"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div>
          <Label>Interval (minutes)</Label>
          <Input
            type="number"
            min={1}
            value={interval}
            onChange={(e) => setInterval(Number(e.target.value))}
          />
        </div>
      </div>

      <Separator className="my-4" />

      <div className="flex gap-3">
        <Button
          onClick={() => onRunCheck(brand, query, interval)}
          disabled={loading}
        >
          Search Now
        </Button>
        <Button
          variant="secondary"
          onClick={handleTrack}
          disabled={loading}
        >
          {loading ? "Saving..." : "Track This Combination"}
        </Button>
      </div>
    </div>
  );
}
