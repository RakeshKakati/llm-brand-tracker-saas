"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Globe, Target, Trash2, Calendar, ExternalLink } from "lucide-react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { supabase } from "@/app/lib/supabaseClient";

interface TrackedCompetitor {
  id: string;
  user_email: string;
  name: string;
  domain: string;
  active: boolean;
  created_at: string;
}

interface CompetitorMetric {
  id: string;
  name: string;
  domain: string;
  visibility: number;
  mentions: number;
  searches: number;
  lastSeen: string | null;
}

export default function CompetitorsPage() {
  const [name, setName] = useState("");
  const [domain, setDomain] = useState("");
  const [timeRange, setTimeRange] = useState("30d");
  const [items, setItems] = useState<TrackedCompetitor[]>([]);
  const [metrics, setMetrics] = useState<CompetitorMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [selected, setSelected] = useState<CompetitorMetric | null>(null);
  const [sources, setSources] = useState<{ url: string; timestamp: string; query: string }[]>([]);
  const [sourcesLoading, setSourcesLoading] = useState(false);

  useEffect(() => {
    fetchCompetitors();
  }, []);

  useEffect(() => {
    computeMetrics();
  }, [items, timeRange]);

  const fetchCompetitors = async () => {
    setLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user?.email) { setLoading(false); return; }
    const { data } = await supabase
      .from("tracked_competitors")
      .select("*")
      .eq("user_email", session.user.email)
      .order("created_at", { ascending: false });
    setItems(data || []);
    setLoading(false);
  };

  const isValidDomain = (d: string) => /^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(d);

  const handleAdd = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user?.email) return;
    if (!name.trim() || !isValidDomain(domain.trim())) {
      alert("Please enter a valid name and domain (e.g., sony.com)");
      return;
    }

    // Enforce plan limits
    const { data: sub } = await supabase
      .from("subscriptions")
      .select("plan_type")
      .eq("user_email", session.user.email)
      .maybeSingle();
    const plan = (sub?.plan_type || "free").toLowerCase();
    const current = items.length;
    const limit = plan === "pro" ? 5 : 1;
    if (current >= limit) {
      alert(`Limit reached. ${plan === "pro" ? "Max 5 competitors for Pro." : "Upgrade to Pro to track up to 5 competitors."}`);
      return;
    }

    const payload = { user_email: session.user.email, name: name.trim(), domain: domain.trim().toLowerCase() };
    const { error } = await supabase.from("tracked_competitors").insert(payload);
    if (error) {
      alert(error.message);
      return;
    }
    setName("");
    setDomain("");
    fetchCompetitors();
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("tracked_competitors").delete().eq("id", id);
    if (error) { alert(error.message); return; }
    setItems(prev => prev.filter(i => i.id !== id));
  };

  const computeMetrics = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user?.email || items.length === 0) { setMetrics([]); return; }

    // Fetch searches within time range
    const ref = new Date();
    const days = timeRange === "90d" ? 90 : timeRange === "7d" ? 7 : 30;
    const since = new Date(ref);
    since.setDate(ref.getDate() - days);
    const { data: searches } = await supabase
      .from("brand_mentions")
      .select("*")
      .eq("user_email", session.user.email)
      .gte("created_at", since.toISOString())
      .order("created_at", { ascending: false });
    const all = searches || [];

    // Build per-query denominators
    const denom = new Map<string, number>();
    all.forEach((m: any) => {
      const q = (m.query || '').trim();
      if (!q) return; denom.set(q, (denom.get(q) || 0) + 1);
    });

    // Compute per competitor
    const urlRegex = /https?:\/\/[^\s<>"{}|\\^`\[\]]+/g;
    const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const results: (CompetitorMetric & { counted: Set<string> })[] = items.map(i => ({ id: i.id, name: i.name, domain: i.domain.toLowerCase(), visibility: 0, mentions: 0, searches: 0, lastSeen: null, counted: new Set<string>() }));

    all.forEach((m: any) => {
      const q = (m.query || '').trim();
      const qDen = q ? (denom.get(q) || 0) : 0;
      const content = m.raw_output || '';
      const urls = (content.match(urlRegex) || []);
      const domains = new Set<string>();
      urls.forEach((u: string) => {
        try { const uo = new URL(u); domains.add(uo.hostname.replace(/^www\./, '')); } catch {}
      });
      results.forEach(r => {
        const brandRegex = new RegExp(`\\b${escapeRegExp(r.name)}\\b`, 'i');
        const brandPresent = brandRegex.test(content);
        const domainPresent = domains.has(r.domain);
        if (brandPresent || domainPresent) {
          r.mentions += 1;
          if (q && !r.counted.has(q)) {
            r.searches += qDen; // denominator = total searches for this exact query
            r.counted.add(q);
          }
          if (!r.lastSeen || new Date(m.created_at) > new Date(r.lastSeen)) r.lastSeen = m.created_at;
        }
      });
    });

    results.forEach(r => { r.visibility = r.searches > 0 ? (r.mentions / r.searches) * 100 : 0; });
    setMetrics(results.map(({ counted, ...rest }) => rest).sort((a,b) => b.visibility - a.visibility));
  };

  const openSources = async (comp: CompetitorMetric) => {
    setSelected(comp);
    setIsSheetOpen(true);
    setSourcesLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user?.email) { setSources([]); setSourcesLoading(false); return; }
      const ref = new Date();
      const days = timeRange === "90d" ? 90 : timeRange === "7d" ? 7 : 30;
      const since = new Date(ref); since.setDate(ref.getDate() - days);
      const { data: searches } = await supabase
        .from("brand_mentions")
        .select("*")
        .eq("user_email", session.user.email)
        .gte("created_at", since.toISOString())
        .order("created_at", { ascending: false });
      const all = searches || [];
      const urlRegex = /https?:\/\/[^\s<>"{}|\\^`\[\]]+/g;
      const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const out: { url: string; timestamp: string; query: string }[] = [];
      const seen = new Set<string>();
      all.forEach((m: any) => {
        const content = m.raw_output || '';
        const urls = (content.match(urlRegex) || []);
        // Determine if competitor applies to THIS query (brand name OR domain present in this search)
        const brandRegex = new RegExp(`\\b${escapeRegExp(comp.name)}\\b`, 'i');
        const brandPresent = brandRegex.test(content);
        let domainPresent = false;
        urls.forEach((u: string) => {
          try {
            const d = new URL(u).hostname.replace(/^www\./, '').toLowerCase();
            if (d === comp.domain.toLowerCase()) domainPresent = true;
          } catch {}
        });
        if (!(brandPresent || domainPresent)) return; // competitor not applicable to this query
        // Collect ALL sources for this query to show where results came from
        urls.forEach((u: string) => {
          try {
            const key = `${m.created_at}|${u}`;
            if (!seen.has(key)) {
              seen.add(key);
              out.push({ url: u, timestamp: m.created_at, query: m.query || '' });
            }
          } catch {}
        });
      });
      setSources(out);
    } finally {
      setSourcesLoading(false);
    }
  };

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Competitors</h1>
          <p className="text-sm text-muted-foreground">Track specific competitors and measure their visibility.</p>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[160px]"><SelectValue placeholder="Last 30 days" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="90d">Last 90 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="7d">Last 7 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Add Competitor</CardTitle>
          <CardDescription>Enter a brand name and a valid domain (e.g., sony.com)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-3">
            <Input placeholder="Competitor name" value={name} onChange={(e) => setName(e.target.value)} />
            <Input placeholder="Domain (e.g., sony.com)" value={domain} onChange={(e) => setDomain(e.target.value)} />
            <Button onClick={handleAdd} className="sm:w-40">Save</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              <CardTitle>Tracked Competitors</CardTitle>
            </div>
            <Badge variant="secondary">{items.length} tracked</Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[200px]">Name</TableHead>
                  <TableHead className="min-w-[200px]">Domain</TableHead>
                  <TableHead className="w-[100px] text-center">Visibility</TableHead>
                  <TableHead className="w-[120px] text-center">Mentions</TableHead>
                  <TableHead className="w-[100px] text-center">Searches</TableHead>
                  <TableHead className="w-[140px]">Last Seen</TableHead>
                  <TableHead className="w-[80px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {metrics.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell className="font-medium">{m.name}</TableCell>
                    <TableCell>
                      <a href={`https://${m.domain}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary">
                        <span className="flex h-5 w-5 items-center justify-center rounded border bg-background">
                          <img src={`https://www.google.com/s2/favicons?domain=${m.domain}&sz=32`} alt={`${m.name} favicon`} className="h-4 w-4" onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
                        </span>
                        <span>{m.domain}</span>
                      </a>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant={m.visibility > 50 ? "default" : m.visibility > 25 ? "secondary" : "outline"}>{m.visibility.toFixed(1)}%</Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge
                        variant="secondary"
                        className="font-mono cursor-pointer hover:bg-primary hover:text-primary-foreground"
                        onClick={() => openSources(m)}
                      >
                        {m.mentions}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center"><Badge variant="outline" className="font-mono">{m.searches}</Badge></TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <Calendar className="w-3 h-3" />
                        {m.lastSeen ? new Date(m.lastSeen).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="icon" onClick={() => handleDelete(m.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Sources Sheet */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              {selected?.name} — {selected?.domain}
            </SheetTitle>
            <SheetDescription>
              All source links where this competitor appeared
            </SheetDescription>
          </SheetHeader>
          <div className="mt-6 space-y-3">
            {sourcesLoading ? (
              <p className="text-sm text-muted-foreground">Loading sources...</p>
            ) : sources.length === 0 ? (
              <p className="text-sm text-muted-foreground">No sources found in this time range.</p>
            ) : (
              sources.map((s, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-lg border bg-muted/30 hover:bg-muted/50 transition-colors">
                  <ExternalLink className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <a href={s.url} target="_blank" rel="noopener noreferrer" className="text-sm font-medium hover:text-primary break-all">
                      {s.url}
                    </a>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                      <Badge variant="outline">{s.query || '—'}</Badge>
                      <span>•</span>
                      <Calendar className="h-3 w-3" />
                      {new Date(s.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}


