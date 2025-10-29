"use client";

import * as React from "react";
import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  TrendingUp, 
  Eye, 
  Clock, 
  CheckCircle, 
  XCircle,
  Activity,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Target,
  AlertCircle,
  Globe,
  ExternalLink,
  Calendar
} from "lucide-react";
import { supabase } from "@/app/lib/supabaseClient";
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent,
  ChartConfig 
} from "@/components/ui/chart-config";
import { Area, AreaChart, CartesianGrid, XAxis, LineChart, Line, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from "recharts";

interface MentionDetail {
  url: string;
  brand: string;
  query: string;
  timestamp: string;
}

interface SourceData {
  domain: string;
  count: number;
  queries: string[];
  lastSeen: string; // Timestamp of most recent mention
  mentions: MentionDetail[]; // All individual URLs from this domain
}

interface CompetitorData {
  competitorName: string;
  domain: string;
  totalMentions: number;
  totalSearches: number;
  visibility: number; // (totalMentions / totalSearches) * 100
  lastSeen: string;
}

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalTrackers: 0,
    activeTrackers: 0,
    totalMentions: 0,
    recentMentions: 0
  });
  const [recentMentions, setRecentMentions] = useState<any[]>([]);
  const [mentionTrend, setMentionTrend] = useState<any[]>([]);
  const [topSources, setTopSources] = useState<SourceData[]>([]);
  const [competitors, setCompetitors] = useState<CompetitorData[]>([]);
  const [chartMentionsRaw, setChartMentionsRaw] = useState<any[]>([]);
  const [timeRange, setTimeRange] = useState("30d");
  const [loading, setLoading] = useState(true);
  const [selectedSource, setSelectedSource] = useState<SourceData | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [currentSourcesPage, setCurrentSourcesPage] = useState(1);
  const sourcesPerPage = 10;
  const [trackedCompetitors, setTrackedCompetitors] = useState<{ name: string; domain: string }[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Get current user
      const { data: { session } } = await supabase.auth.getSession();
      console.log("📊 Dashboard - User session:", session?.user?.email);
      
      if (!session?.user?.email) {
        console.error("❌ No user session found in Dashboard");
        setLoading(false);
        return;
      }

      const userEmail = session.user.email;
      console.log("🔍 Fetching dashboard data for:", userEmail);
      
      // Fetch tracked brands count (filtered by user)
      const { count: trackersCount } = await supabase
        .from("tracked_brands")
        .select("*", { count: "exact", head: true })
        .eq("user_email", userEmail);

      // Fetch active trackers count (filtered by user)
      const { count: activeCount } = await supabase
        .from("tracked_brands")
        .select("*", { count: "exact", head: true })
        .eq("user_email", userEmail)
        .eq("active", true);

      // Fetch total mentions count (filtered by user)
      const { count: mentionsCount } = await supabase
        .from("brand_mentions")
        .select("*", { count: "exact", head: true })
        .eq("user_email", userEmail);

      // Fetch recent mentions (last 24 hours, filtered by user)
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      const { count: recentCount } = await supabase
        .from("brand_mentions")
        .select("*", { count: "exact", head: true })
        .eq("user_email", userEmail)
        .gte("created_at", yesterday.toISOString());

      // Fetch recent mentions for display (filtered by user)
      const { data: recentData } = await supabase
        .from("brand_mentions")
        .select("*")
        .eq("user_email", userEmail)
        .order("created_at", { ascending: false })
        .limit(5);

      // Fetch mentions for chart (last 7 days, filtered by user)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const { data: mentionsData } = await supabase
        .from("brand_mentions")
        .select("*")
        .eq("user_email", userEmail)
        .gte("created_at", sevenDaysAgo.toISOString())
        .order("created_at", { ascending: true });

      console.log("✅ Dashboard data fetched:", {
        trackers: trackersCount,
        active: activeCount,
        mentions: mentionsCount,
        recent: recentCount
      });

      setStats({
        totalTrackers: trackersCount || 0,
        activeTrackers: activeCount || 0,
        totalMentions: mentionsCount || 0,
        recentMentions: recentCount || 0
      });

      setRecentMentions(recentData || []);

      // Process data for chart
      if (mentionsData) {
        const grouped = mentionsData.reduce((acc: any, mention: any) => {
          const date = new Date(mention.created_at).toLocaleDateString();
          if (!acc[date]) {
            acc[date] = 0;
          }
          acc[date]++;
          return acc;
        }, {});

        const chartData = Object.entries(grouped).map(([name, value]) => ({
          name,
          value: value
        }));
        setMentionTrend(chartData);
      }

      // Fetch ALL mentions for top sources analysis (only where brand was mentioned)
      const { data: allMentions } = await supabase
        .from("brand_mentions")
        .select("*")
        .eq("user_email", userEmail)
        .eq("mentioned", true) // Only get mentions where brand was found
        .order("created_at", { ascending: false });

      console.log("🔍 Fetched all mentions for sources:", allMentions?.length);

      // Process top sources
      const sources = processTopSources(allMentions || []);
      setTopSources(sources);

      // Load tracked competitors for this user
      const { data: tc } = await supabase
        .from("tracked_competitors")
        .select("name, domain")
        .eq("user_email", userEmail)
        .order("created_at", { ascending: false });
      setTrackedCompetitors((tc || []).map((r: any) => ({ name: r.name, domain: (r.domain || '').toLowerCase() })));

      // Fetch ALL searches (for competitor visibility denominators)
      const { data: allSearches } = await supabase
        .from("brand_mentions")
        .select("*")
        .eq("user_email", userEmail)
        .order("created_at", { ascending: false });

      // Process competitors (use ALL searches to compute per-query denominators)
      const competitorData = processCompetitors(allSearches || []);
      setCompetitors(competitorData);

      // Fetch ALL mentions for chart (last 90 days)
      const ninetyDaysAgo = new Date();
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
      
      const { data: chartMentions } = await supabase
        .from("brand_mentions")
        .select("created_at, mentioned, query, brand")
        .eq("user_email", userEmail)
        .gte("created_at", ninetyDaysAgo.toISOString())
        .order("created_at", { ascending: true });

      console.log("📈 Fetched chart mentions:", chartMentions?.length, "records");

      // Store chart mentions for other components
      if (chartMentions && chartMentions.length > 0) {
        setChartMentionsRaw(chartMentions);
      } else {
        console.log("⚠️ No chart data available");
      }

    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const processTopSources = (mentions: any[]): SourceData[] => {
    console.log("🔍 Processing top sources from", mentions.length, "mentions");
    const sourcesMap = new Map<string, { count: number; queries: Set<string>; lastSeen: string; mentions: MentionDetail[] }>();

    mentions.forEach((mention, index) => {
      if (!mention.raw_output) {
        console.log(`⚠️ Mention ${index + 1}: No raw_output`);
        return;
      }
      if (!mention.mentioned) {
        console.log(`⚠️ Mention ${index + 1}: Not mentioned`);
        return;
      }

      try {
        // Extract URLs directly from raw_output string (handles both JSON and plain text)
        const urlRegex = /https?:\/\/[^\s<>"{}|\\^`\[\]]+/g;
        const urls = mention.raw_output.match(urlRegex) || [];

        if (urls.length === 0) {
          console.log(`⚠️ Mention ${index + 1}: No URLs found`);
        } else {
          console.log(`✅ Mention ${index + 1}: Found ${urls.length} URLs`);
        }

        urls.forEach((url: string) => {
          try {
            const urlObj = new URL(url);
            const domain = urlObj.hostname.replace(/^www\./, "");

            if (!sourcesMap.has(domain)) {
              sourcesMap.set(domain, {
                count: 0,
                queries: new Set(),
                lastSeen: mention.created_at,
                mentions: [],
              });
            }

            const source = sourcesMap.get(domain)!;
            source.count += 1;
            if (mention.query) {
              source.queries.add(mention.query);
            }
            // Add individual mention detail
            source.mentions.push({
              url: url,
              brand: mention.brand || 'Unknown',
              query: mention.query || 'Unknown',
              timestamp: mention.created_at,
            });
            // Update lastSeen to most recent timestamp
            if (new Date(mention.created_at) > new Date(source.lastSeen)) {
              source.lastSeen = mention.created_at;
            }
          } catch (e) {
            console.log(`❌ Invalid URL: ${url}`);
          }
        });
      } catch (e) {
        console.error("❌ Error parsing raw_output:", e);
      }
    });

    const results = Array.from(sourcesMap.entries())
      .map(([domain, data]) => ({
        domain,
        count: data.count,
        queries: Array.from(data.queries),
        lastSeen: data.lastSeen,
        mentions: data.mentions,
      }))
      .sort((a, b) => b.count - a.count);
    // Don't limit to top 10, show all sources

    console.log("📊 Top sources found:", results.length);
    return results;
  };

  // Compute competitor visibility per-query: denominator is total searches for that exact query
  const processCompetitors = (mentions: any[]): CompetitorData[] => {
    console.log("🔍 Processing competitors from", mentions.length, "mentions");
    const competitorsMap = new Map<string, {
      name: string;
      domain: string;
      mentions: number;
      totalSearches: number;
      lastSeen: string;
    }>();
    // Build per-query denominators: how many times each query was searched
    const queryToTotalSearches = new Map<string, number>();
    mentions.forEach((m) => {
      const q = (m.query || '').trim();
      if (!q) return;
      queryToTotalSearches.set(q, (queryToTotalSearches.get(q) || 0) + 1);
    });

    const knownBrandNames = [
      'Sony', 'Samsung', 'Apple', 'Google', 'Microsoft', 'HP', 'Dell', 'Lenovo',
      'ASUS', 'Acer', 'MSI', 'Razer', 'Logitech', 'Corsair', 'HyperX', 'SteelSeries',
      'Bose', 'JBL', 'Audio-Technica', 'Sennheiser', 'AKG', 'Shure',
      'Zebronics', 'iBall', 'Boat', 'Realme', 'Xiaomi', 'OnePlus', 'Oppo', 'Vivo',
      'Nokia', 'Motorola', 'HTC', 'LG', 'TCL', 'Vizio', 'Philips', 'Panasonic',
      'Marshall', 'Skullcandy', 'Beats', 'Anker', 'Soundcore', 'Tribit', 'Taotronics'
    ];

    mentions.forEach((mention) => {
      try {
        const rawOutput = mention.raw_output || '';
        
        // Parse JSON if it's a JSON response
        let content = '';
        try {
          const parsed = JSON.parse(rawOutput);
          content = parsed.choices?.[0]?.message?.content || '';
        } catch {
          content = rawOutput;
        }
        
        // Extract ALL URLs from the content first
        const urlRegex = /https?:\/\/[^\s<>"{}|\\^`\[\]]+/g;
        const urls = content.match(urlRegex) || [];
        
        // Skip if no URLs - only process if there are source URLs
        if (urls.length === 0) {
          return;
        }
        
        // Extract domains from URLs
        const domains = new Set<string>();
        const domainToBrandMap = new Map<string, string>();
        
        urls.forEach((url: string) => {
          try {
            const urlObj = new URL(url);
            const domain = urlObj.hostname.replace(/^www\./, '');
            domains.add(domain);
            
            // Try to match domain to known brand
            const domainParts = domain.split('.');
            const domainName = domainParts[0];
            
            // Check if domain matches a known brand
            const matchingBrand = knownBrandNames.find(brand => 
              domain.toLowerCase().includes(brand.toLowerCase()) ||
              domainName.toLowerCase() === brand.toLowerCase()
            );
            
            if (matchingBrand && matchingBrand.toLowerCase() !== mention.brand?.toLowerCase()) {
              domainToBrandMap.set(matchingBrand, domain);
            }
          } catch (e) {
            // Invalid URL
          }
        });
        
        // Now find known brand names in content that have corresponding domains
        knownBrandNames.forEach(brand => {
          const regex = new RegExp(`\\b${brand}\\b`, 'gi');
          if (regex.test(content) && brand.toLowerCase() !== mention.brand?.toLowerCase()) {
            // Check if this brand has a domain in the URLs
            const domain = domainToBrandMap.get(brand) || brand.toLowerCase() + '.com';
            const key = brand;
            if (!competitorsMap.has(key)) {
              competitorsMap.set(key, {
                name: brand,
                domain: domain,
                mentions: 0,
                totalSearches: 0,
                lastSeen: mention.created_at,
              });
            }
            const competitor = competitorsMap.get(key)!;
            // Denominator: total searches for THIS query
            const q = (mention.query || '').trim();
            const querySearches = q ? (queryToTotalSearches.get(q) || 0) : 0;
            competitor.totalSearches += querySearches > 0 ? 1 : 0; // count this query once in denominator aggregation
            if (mention.mentioned) {
              competitor.mentions += 1;
            }
            // Update lastSeen
            if (new Date(mention.created_at) > new Date(competitor.lastSeen)) {
              competitor.lastSeen = mention.created_at;
            }
          }
        });
      } catch (e) {
        console.error("❌ Error processing competitor:", e);
      }
    });

    const results = Array.from(competitorsMap.values())
      .map(comp => ({
        competitorName: comp.name,
        domain: comp.domain,
        totalMentions: comp.mentions,
        totalSearches: comp.totalSearches,
        visibility: comp.totalSearches > 0 ? (comp.mentions / comp.totalSearches) * 100 : 0,
        lastSeen: comp.lastSeen,
      }))
      .filter(comp => comp.totalSearches > 0)
      .sort((a, b) => b.totalMentions - a.totalMentions);

    console.log("🎯 Competitors found:", results.length);
    return results;
  };



  // New derived metrics: unique sources, unique competitors, mention rate, query coverage
  const derivedKPIs = React.useMemo(() => {
    // derive in current time range
    const ref = new Date();
    const days = timeRange === "90d" ? 90 : timeRange === "7d" ? 7 : 30;
    const since = new Date(ref); since.setDate(ref.getDate() - days);

    // We will use existing lists already fetched: topSources, competitors and chartMentionsRaw
    const uniqueSources = new Set((topSources || [])
      .filter(s => new Date(s.lastSeen) >= since)
      .map(s => s.domain)).size;

    const uniqueCompetitors = new Set((competitors || [])
      .filter(c => c.lastSeen && new Date(c.lastSeen) >= since)
      .map(c => c.competitorName)).size;

    const searchesInRange = (chartMentionsRaw || [])
      .filter((m: any) => new Date(m.created_at) >= since).length;

    const mentionsInRange = (chartMentionsRaw || [])
      .filter((m: any) => new Date(m.created_at) >= since && m.mentioned === true).length;

    const mentionRate = searchesInRange > 0 ? (mentionsInRange / searchesInRange) * 100 : 0;

    // Query coverage: % of queries that had at least one mention in range
    // fetchMentions for range are not stored; approximate from brand_mentions used for chartMentionsRaw
    const queriesWithSearch = new Set((chartMentionsRaw || [])
      .filter((m: any) => new Date(m.created_at) >= since)
      .map((m: any) => (m.query || '').trim()).filter(Boolean));
    const queriesWithMention = new Set((chartMentionsRaw || [])
      .filter((m: any) => new Date(m.created_at) >= since && m.mentioned === true)
      .map((m: any) => (m.query || '').trim()).filter(Boolean));
    const coverage = queriesWithSearch.size > 0 ? (queriesWithMention.size / queriesWithSearch.size) * 100 : 0;

    return { uniqueSources, uniqueCompetitors, mentionRate, coverage };
  }, [timeRange, topSources, competitors, chartMentionsRaw]);

  // Mention rate trend data (daily line)
  const mentionRateTrend = React.useMemo(() => {
    if (!chartMentionsRaw || chartMentionsRaw.length === 0) return [] as { date: string; rate: number }[];
    const ref = new Date();
    const days = timeRange === "90d" ? 90 : timeRange === "7d" ? 7 : 30;
    const since = new Date(ref); since.setDate(ref.getDate() - days);
    const dayMap = new Map<string, { s: number; m: number }>();
    chartMentionsRaw.forEach((r: any) => {
      const d = new Date(r.created_at);
      if (d < since) return;
      const key = d.toISOString().split('T')[0];
      const entry = dayMap.get(key) || { s: 0, m: 0 };
      entry.s += 1; if (r.mentioned) entry.m += 1; dayMap.set(key, entry);
    });
    const arr = Array.from(dayMap.entries()).map(([date, v]) => ({ date, rate: v.s > 0 ? (v.m / v.s) * 100 : 0 }));
    arr.sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    return arr;
  }, [chartMentionsRaw, timeRange]);

  // Best performing queries table (top by mention rate)
  // Query performance over time range (brand+query)
  const queryPerformance = React.useMemo(() => {
    if (!chartMentionsRaw || chartMentionsRaw.length === 0) return [] as { brand: string; query: string; searches: number; mentions: number; rate: number }[];
    const ref = new Date();
    const days = timeRange === "90d" ? 90 : timeRange === "7d" ? 7 : 30;
    const since = new Date(ref); since.setDate(ref.getDate() - days);
    const qMap = new Map<string, { s: number; m: number; b: string; q: string }>();
    chartMentionsRaw.forEach((r: any) => {
      const d = new Date(r.created_at);
      if (d < since) return;
      const q = (r.query || '').trim();
      const b = (r.brand || '').trim();
      if (!q) return;
      const key = `${b}|||${q}`;
      const entry = qMap.get(key) || { s: 0, m: 0, b, q };
      entry.s += 1; if (r.mentioned) entry.m += 1; qMap.set(key, entry);
    });
    const arr = Array.from(qMap.values()).map((v) => ({ brand: v.b || '-', query: v.q, searches: v.s, mentions: v.m, rate: v.s > 0 ? (v.m / v.s) * 100 : 0 }));
    arr.sort((a,b) => b.mentions - a.mentions || b.rate - a.rate);
    return arr;
  }, [chartMentionsRaw, timeRange]);

  // DataTable states for Query Performance
  const [qpSearch, setQpSearch] = useState("");
  const [qpPage, setQpPage] = useState(1);
  const qpPageSize = 10;
  const qpFiltered = useMemo(() => {
    const s = qpSearch.trim().toLowerCase();
    const base = queryPerformance;
    const filtered = s
      ? base.filter(r => r.query.toLowerCase().includes(s) || r.brand.toLowerCase().includes(s))
      : base;
    return filtered;
  }, [queryPerformance, qpSearch]);
  const qpTotalPages = Math.max(1, Math.ceil(qpFiltered.length / qpPageSize));
  const qpPageData = useMemo(() => qpFiltered.slice((qpPage-1)*qpPageSize, qpPage*qpPageSize), [qpFiltered, qpPage]);

  // New domains discovered in range (not seen before range)
  const newDomains = React.useMemo(() => {
    const ref = new Date();
    const days = timeRange === "90d" ? 90 : timeRange === "7d" ? 7 : 30;
    const since = new Date(ref); since.setDate(ref.getDate() - days);
    const prior = (topSources || []).filter(s => new Date(s.lastSeen) < since).map(s => s.domain);
    const priorSet = new Set(prior);
    const inRange = (topSources || []).filter(s => new Date(s.lastSeen) >= since).map(s => s.domain);
    const uniq = Array.from(new Set(inRange)).filter(d => !priorSet.has(d));
    return uniq.slice(0, 8);
  }, [topSources, timeRange]);

  // Share of Voice (stacked) for top competitors by visibility
  const shareOfVoice = React.useMemo(() => {
    if (!chartMentionsRaw || chartMentionsRaw.length === 0 || !trackedCompetitors || trackedCompetitors.length === 0) return { data: [], fields: [] as string[] };
    const ref = new Date();
    const days = timeRange === "90d" ? 90 : timeRange === "7d" ? 7 : 30;
    const since = new Date(ref); since.setDate(ref.getDate() - days);
    // Use only user-tracked competitors (name + domain) and cap at 5
    const top = trackedCompetitors.slice(0, 5);
    const names = top.map(c => c.name);
    const nameToDomain = new Map<string, string>(top.map(c => [c.name, (c.domain || '').toLowerCase()]));
    const dayMap = new Map<string, { total: number; counts: Record<string, number> }>();
    const urlRegex = /https?:\/\/[^\s<>"{}|\\^`\[\]]+/g;
    const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    chartMentionsRaw.forEach((r: any) => {
      const d = new Date(r.created_at);
      if (d < since) return;
      const key = d.toISOString().split('T')[0];
      const entry = dayMap.get(key) || { total: 0, counts: {} };
      entry.total += 1;
      const content = r.raw_output || '';
      const urls = (content.match(urlRegex) || []);
      const domains = new Set<string>();
      urls.forEach((u: string) => { try { domains.add(new URL(u).hostname.replace(/^www\./,'').toLowerCase()); } catch{} });
      names.forEach((n) => {
        const domain = nameToDomain.get(n) || '';
        const brandRegex = new RegExp(`\\b${escapeRegExp(n)}\\b`, 'i');
        const present = brandRegex.test(content) || (domain && domains.has(domain));
        if (present) entry.counts[n] = (entry.counts[n] || 0) + 1;
      });
      dayMap.set(key, entry);
    });
    const data = Array.from(dayMap.entries()).map(([date, v]) => {
      const row: any = { date };
      names.forEach((n) => { row[n] = v.total > 0 ? +(100 * (v.counts[n] || 0) / v.total).toFixed(2) : 0; });
      return row;
    }).sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    return { data, fields: names };
  }, [chartMentionsRaw, trackedCompetitors, timeRange]);

  // Diagnostics
  const diagnostics = React.useMemo(() => {
    if (!chartMentionsRaw || chartMentionsRaw.length === 0) return { errorRate: 0, throughput: [] as { date: string; searches: number }[] };
    const ref = new Date();
    const days = timeRange === "90d" ? 90 : timeRange === "7d" ? 7 : 30;
    const since = new Date(ref); since.setDate(ref.getDate() - days);
    let total = 0; let error = 0;
    const dayMap = new Map<string, number>();
    chartMentionsRaw.forEach((r: any) => {
      const d = new Date(r.created_at);
      if (d < since) return;
      total += 1;
      const eo = (r.evidence || '').toString().toLowerCase();
      const ro = (r.raw_output || '').toString().toLowerCase();
      if (eo.includes('search failed') || ro.includes('unexpected error') || ro.includes('openai api error')) error += 1;
      const key = d.toISOString().split('T')[0];
      dayMap.set(key, (dayMap.get(key) || 0) + 1);
    });
    const errorRate = total > 0 ? (error / total) * 100 : 0;
    const throughput = Array.from(dayMap.entries()).map(([date, searches]) => ({ date, searches })).sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    return { errorRate, throughput };
  }, [chartMentionsRaw, timeRange]);

  // Pagination for sources
  const totalSourcesPages = Math.ceil(topSources.length / sourcesPerPage);
  const paginatedSources = topSources.slice(
    (currentSourcesPage - 1) * sourcesPerPage,
    currentSourcesPage * sourcesPerPage
  );

  const StatCard = ({ title, value, icon: Icon, trend, color, description }: any) => (
    <Card className="relative overflow-hidden">
      <div className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <div className="flex items-baseline gap-2">
              <p className="text-2xl font-bold tracking-tight">{value}</p>
          {trend && (
                <span className={`text-xs font-medium inline-flex items-center gap-0.5 ${
                  trend > 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {trend > 0 ? (
                    <ArrowUpRight className="w-3 h-3" />
                  ) : (
                    <ArrowDownRight className="w-3 h-3" />
                  )}
                  {Math.abs(trend)}%
                </span>
              )}
            </div>
            {description && (
              <p className="text-xs text-muted-foreground">{description}</p>
          )}
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
            <Icon className="h-5 w-5 text-white" />
        </div>
      </div>
      </div>
      <div className={`h-1 w-full ${color} opacity-20`}></div>
    </Card>
  );

  if (loading) {
  return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Monitor your brand mentions and tracking performance</p>
        </div>
        <Button onClick={fetchDashboardData} className="gap-2" size="sm">
          <Activity className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Query Performance + New Domains */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Query Performance Table */}
        <Card>
          <div className="border-b p-6 pb-4">
            <h3 className="text-base font-semibold">Query Performance</h3>
            <p className="text-sm text-muted-foreground">Brand + query performance across the selected time range</p>
          </div>
          <div className="p-6 pt-4">
            {queryPerformance.length > 0 ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <Input placeholder="Search brand or query" value={qpSearch} onChange={(e) => { setQpSearch(e.target.value); setQpPage(1); }} className="max-w-sm" />
                  <div className="text-xs text-muted-foreground">{qpFiltered.length} rows</div>
                </div>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[160px]">Brand</TableHead>
                        <TableHead>Query</TableHead>
                        <TableHead className="w-[120px] text-center">Mentions</TableHead>
                        <TableHead className="w-[120px] text-center">Searches</TableHead>
                        <TableHead className="w-[120px] text-center">Rate</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {qpPageData.map((row, idx) => (
                        <TableRow key={`${row.brand}-${row.query}-${idx}`}>
                          <TableCell className="font-medium">{row.brand || '-'}</TableCell>
                          <TableCell className="truncate max-w-[360px]">{row.query}</TableCell>
                          <TableCell className="text-center">{row.mentions}</TableCell>
                          <TableCell className="text-center">{row.searches}</TableCell>
                          <TableCell className="text-center">{row.rate.toFixed(1)}%</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                <div className="flex items-center justify-between pt-2">
                  <div className="text-xs text-muted-foreground">Page {qpPage} of {qpTotalPages}</div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => setQpPage(p => Math.max(1, p-1))} disabled={qpPage===1}>Previous</Button>
                    <Button variant="outline" size="sm" onClick={() => setQpPage(p => Math.min(qpTotalPages, p+1))} disabled={qpPage===qpTotalPages}>Next</Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">No query data</div>
            )}
          </div>
        </Card>
        {/* New Domains */}
        <Card>
          <div className="border-b p-6 pb-4">
            <h3 className="text-base font-semibold">New Domains This Period</h3>
            <p className="text-sm text-muted-foreground">Sources not seen before the selected window</p>
          </div>
          <div className="p-6 pt-4">
            {newDomains.length > 0 ? (
              <div className="grid grid-cols-1 gap-2">
                {newDomains.map((d) => (
                  <a key={d} href={`https://${d}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm hover:text-primary">
                    <span className="flex h-5 w-5 items-center justify-center rounded border bg-background">
                      <img src={`https://www.google.com/s2/favicons?domain=${d}&sz=32`} alt="favicon" className="h-4 w-4" onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
                    </span>
                    {d}
                  </a>
                ))}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">No new domains detected</div>
            )}
          </div>
        </Card>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Trackers"
          value={stats.totalTrackers}
          icon={Target}
          color="bg-blue-600"
          description={`${stats.activeTrackers} active now`}
        />
        <StatCard
          title="Active Trackers"
          value={stats.activeTrackers}
          icon={Activity}
          color="bg-green-600"
          trend={+12}
          description="Running smoothly"
        />
        <StatCard
          title="Total Mentions"
          value={stats.totalMentions}
          icon={BarChart3}
          color="bg-purple-600"
          trend={+8}
        />
        <StatCard
          title="Recent Activity"
          value={stats.recentMentions}
          icon={Clock}
          color="bg-orange-600"
          description="Last 24 hours"
        />
      </div>

      {/* New KPI row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Unique Sources"
          value={derivedKPIs.uniqueSources}
          icon={Globe}
          color="bg-blue-600"
          description={`Last ${timeRange}`}
        />
        <StatCard
          title="Unique Competitors"
          value={derivedKPIs.uniqueCompetitors}
          icon={Target}
          color="bg-green-600"
          description={`Last ${timeRange}`}
        />
        <StatCard
          title="Mention Rate"
          value={`${derivedKPIs.mentionRate.toFixed(1)}%`}
          icon={BarChart3}
          color="bg-purple-600"
          description={`Mentions / Searches`}
        />
        <StatCard
          title="Query Coverage"
          value={`${derivedKPIs.coverage.toFixed(1)}%`}
          icon={Activity}
          color="bg-orange-600"
          description={`Queries with ≥ 1 mention`}
        />
          </div>


        {/* Recent Mentions */}
        <Card>
          <div className="border-b p-6 pb-4">
            <h3 className="text-base font-semibold">Recent Activity</h3>
            <p className="text-sm text-muted-foreground">Latest brand mentions</p>
          </div>
          <div className="p-6 pt-4">
            <div className="space-y-3">
            {recentMentions.length > 0 ? (
              recentMentions.map((mention) => (
                <div key={mention.id} className="p-4 bg-muted/50 rounded-lg border border-border hover:bg-muted transition-colors">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1">
                  {mention.mentioned ? (
                        <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm truncate">{mention.brand}</p>
                        <p className="text-xs text-muted-foreground truncate">{mention.query}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(mention.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
                    <Badge variant={mention.mentioned ? "default" : "secondary"} className="flex-shrink-0">
                      {mention.mentioned ? "Found" : "None"}
                    </Badge>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No recent activity</p>
              </div>
            )}
            </div>
          </div>
        </Card>

      {/* Top Sources - Full Width */}
      {/* Top Sources - Full Width Data Table */}
      <Card>
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Globe className="w-5 h-5" />
              <CardTitle>Top Sources</CardTitle>
            </div>
            <Badge variant="secondary" className="ml-auto">
              {topSources.length} {topSources.length === 1 ? 'domain' : 'domains'}
            </Badge>
          </div>
          <CardDescription>
            Most referenced domains from brand mentions
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {topSources.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[60px]">Rank</TableHead>
                    <TableHead className="w-[80px]"></TableHead>
                    <TableHead className="min-w-[200px]">Domain</TableHead>
                    <TableHead className="w-[100px] text-center">Mentions</TableHead>
                    <TableHead className="hidden lg:table-cell">Related Queries</TableHead>
                    <TableHead className="w-[140px]">Last Seen</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedSources.map((source, index) => (
                    <TableRow key={index} className="group">
                      <TableCell>
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                          {(currentSourcesPage - 1) * sourcesPerPage + index + 1}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg border bg-background">
                          <img 
                            src={`https://www.google.com/s2/favicons?domain=${source.domain}&sz=64`}
                            alt={`${source.domain} logo`}
                            className="h-6 w-6 rounded"
                            onError={(e) => {
                              const target = e.currentTarget as HTMLImageElement;
                              target.style.display = 'none';
                              const parent = target.parentElement;
                              if (parent && !parent.querySelector('svg')) {
                                const globe = document.createElement('div');
                                globe.innerHTML = '<svg class="h-5 w-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke-width="2"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" stroke-width="2"/></svg>';
                                parent.appendChild(globe.firstChild!);
                              }
                            }}
                          />
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4 text-muted-foreground" />
                          <span>{source.domain}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge 
                          variant="secondary" 
                          className="font-mono cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                          onClick={() => {
                            setSelectedSource(source);
                            setIsSheetOpen(true);
                          }}
                        >
                          {source.count}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <div className="flex flex-wrap gap-1.5">
                          {source.queries.slice(0, 2).map((query, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs font-normal">
                              {query.length > 30 ? query.substring(0, 30) + '...' : query}
                            </Badge>
                          ))}
                          {source.queries.length > 2 && (
                            <Badge variant="outline" className="text-xs font-normal text-muted-foreground">
                              +{source.queries.length - 2}
                            </Badge>
                          )}
          </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3 h-3" />
                          {new Date(source.lastSeen).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Globe className="w-12 h-12 mb-4 opacity-50" />
              <p className="font-medium">No source data available yet</p>
              <p className="text-sm mt-1">Sources will appear after brand mentions are found</p>
            </div>
          )}
          
          {/* Pagination Controls */}
          {topSources.length > sourcesPerPage && (
            <div className="flex items-center justify-between border-t px-6 py-4">
              <div className="text-sm text-muted-foreground">
                Showing {((currentSourcesPage - 1) * sourcesPerPage) + 1} to {Math.min(currentSourcesPage * sourcesPerPage, topSources.length)} of {topSources.length} sources
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentSourcesPage(p => Math.max(1, p - 1))}
                  disabled={currentSourcesPage === 1}
                >
                  Previous
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalSourcesPages }, (_, i) => i + 1).map(page => (
                    <Button
                      key={page}
                      variant={currentSourcesPage === page ? "default" : "outline"}
                      size="sm"
                      className="w-10"
                      onClick={() => setCurrentSourcesPage(page)}
                    >
                      {page}
                    </Button>
                  ))}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentSourcesPage(p => Math.min(totalSourcesPages, p + 1))}
                  disabled={currentSourcesPage === totalSourcesPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
        </Card>


      {/* Competitor Analysis */}
      <Card>
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              <CardTitle>Competitor Analysis</CardTitle>
            </div>
            <Badge variant="secondary" className="ml-auto">
              {competitors.length} {competitors.length === 1 ? 'competitor' : 'competitors'}
            </Badge>
          </div>
          <CardDescription>
            Domains from source URLs in raw_output (competitors mentioned in search results)
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {competitors.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[200px]">Competitor Name</TableHead>
                    <TableHead className="min-w-[180px]">Domain</TableHead>
                    <TableHead className="w-[100px] text-center">Visibility</TableHead>
                    <TableHead className="w-[120px] text-center">Mentions</TableHead>
                    <TableHead className="w-[100px] text-center">Searches</TableHead>
                    <TableHead className="w-[140px]">Last Seen</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {competitors.map((competitor, index) => (
                    <TableRow key={index} className="group">
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <Target className="h-4 w-4 text-muted-foreground" />
                          <span>{competitor.competitorName}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <a
                          href={`https://${competitor.domain}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                        >
                          <span className="flex h-5 w-5 items-center justify-center rounded border bg-background">
                            <img
                              src={`https://www.google.com/s2/favicons?domain=${competitor.domain}&sz=32`}
                              alt={`${competitor.competitorName} favicon`}
                              className="h-4 w-4"
                              onError={(e) => {
                                const target = e.currentTarget as HTMLImageElement;
                                target.style.display = 'none';
                              }}
                            />
                          </span>
                          <span>{competitor.domain}</span>
                        </a>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant={competitor.visibility > 50 ? "default" : competitor.visibility > 25 ? "secondary" : "outline"}>
                          {competitor.visibility.toFixed(1)}%
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="secondary" className="font-mono">
                          {competitor.totalMentions}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline" className="font-mono">
                          {competitor.totalSearches}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3 h-3" />
                          {new Date(competitor.lastSeen).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Target className="w-12 h-12 mb-4 opacity-50" />
              <p className="font-medium">No competitor data available yet</p>
              <p className="text-sm mt-1">Competitors will appear as searches are performed</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="relative overflow-hidden">
          <div className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 rounded-lg bg-blue-600/10">
                <Target className="h-5 w-5 text-blue-600" />
              </div>
              <Badge variant="outline" className="bg-white">Daily</Badge>
            </div>
            <h3 className="text-base font-semibold mb-2">Check Frequency</h3>
            <p className="text-sm text-muted-foreground mb-4">Automated checks run daily at 9 AM UTC</p>
            <Button variant="outline" size="sm" className="w-full">
              Configure Schedule
            </Button>
          </div>
          <div className="h-1 bg-blue-600/20"></div>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 rounded-lg bg-green-600/10">
                <Activity className="h-5 w-5 text-green-600" />
              </div>
              <Badge variant="outline" className="bg-white">Active</Badge>
            </div>
            <h3 className="text-base font-semibold mb-2">System Status</h3>
            <p className="text-sm text-muted-foreground mb-4">All systems operational</p>
            <Button variant="outline" size="sm" className="w-full">
              View Logs
            </Button>
          </div>
          <div className="h-1 bg-green-600/20"></div>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 rounded-lg bg-purple-600/10">
                <BarChart3 className="h-5 w-5 text-purple-600" />
              </div>
              <Badge variant="outline" className="bg-white">View</Badge>
            </div>
            <h3 className="text-base font-semibold mb-2">Analytics</h3>
            <p className="text-sm text-muted-foreground mb-4">Detailed insights and reports</p>
            <Button variant="outline" size="sm" className="w-full">
              Explore Analytics
            </Button>
          </div>
          <div className="h-1 bg-purple-600/20"></div>
        </Card>
      </div>

      {/* Mention Details Sheet */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              {selectedSource?.domain}
            </SheetTitle>
            <SheetDescription>
              {selectedSource?.count} {selectedSource?.count === 1 ? 'mention' : 'mentions'} from this source
            </SheetDescription>
          </SheetHeader>
          
          <div className="mt-6 space-y-6">
            {selectedSource && (() => {
              // Group mentions by brand + query
              const grouped = selectedSource.mentions.reduce((acc, mention) => {
                const key = `${mention.brand}|||${mention.query}`;
                if (!acc[key]) {
                  acc[key] = {
                    brand: mention.brand,
                    query: mention.query,
                    urls: []
                  };
                }
                acc[key].urls.push({
                  url: mention.url,
                  timestamp: mention.timestamp
                });
                return acc;
              }, {} as Record<string, { brand: string; query: string; urls: { url: string; timestamp: string }[] }>);

              return Object.values(grouped).map((group, idx) => (
                <Card key={idx}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1">
                        <CardTitle className="text-base">{group.brand}</CardTitle>
                        <CardDescription className="text-sm">
                          {group.query}
                        </CardDescription>
                      </div>
                      <Badge variant="secondary">{group.urls.length}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {group.urls.map((item, urlIdx) => (
                        <div key={urlIdx} className="flex items-start gap-3 p-3 rounded-lg border bg-muted/30 hover:bg-muted/50 transition-colors">
                          <ExternalLink className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                          <div className="flex-1 min-w-0 space-y-1">
                            <a
                              href={item.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm font-medium hover:text-primary transition-colors break-all"
                            >
                              {item.url}
                            </a>
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              {new Date(item.timestamp).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ));
            })()}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}