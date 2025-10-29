"use client";

import * as React from "react";
import { useState, useEffect, useMemo, useCallback, useRef } from "react";
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
  citationLinks: Array<{ url: string; title?: string }>;
  searchAppearances: number; // How many unique searches this competitor appeared in
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
  const [currentMentionsPage, setCurrentMentionsPage] = useState(1);
  const mentionsPerPage = 10;
  const hasFetchedRef = useRef(false);

  useEffect(() => {
    console.log("🚀 Dashboard mount - initializing fetch...");
    fetchDashboardData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchDashboardData = useCallback(async () => {
    try {
      console.log("📊 Starting dashboard data fetch...");
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

      // Fetch recent mentions for display (filtered by user, all data)
      const { data: recentData } = await supabase
        .from("brand_mentions")
        .select("*")
        .eq("user_email", userEmail)
        .order("created_at", { ascending: false });

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

      // Fetch ALL mentions for analysis (no time limit)
      const { data: allMentions, error: mentionsError } = await supabase
        .from("brand_mentions")
        .select("*")
        .eq("user_email", userEmail)
        .order("created_at", { ascending: false });

      if (mentionsError) {
        console.error("❌ Error fetching mentions:", mentionsError);
      }

      console.log("🔍 Fetched mentions for analysis:", allMentions?.length);

      // Process top sources (only where brand was mentioned)
      const mentionedOnly = (allMentions || []).filter(m => m.mentioned === true);
      const sources = processTopSources(mentionedOnly);
      setTopSources(sources);

      // Process competitors
      const competitorData = processCompetitors(allMentions || []);
      setCompetitors(competitorData);

      // Store chart mentions for other components
      if (allMentions && allMentions.length > 0) {
        setChartMentionsRaw(allMentions);
      } else {
        console.log("⚠️ No chart data available");
      }

      // Load tracked competitors for this user
      const { data: tc } = await supabase
        .from("tracked_competitors")
        .select("name, domain")
        .eq("user_email", userEmail)
        .order("created_at", { ascending: false });
      setTrackedCompetitors((tc || []).map((r: any) => ({ name: r.name, domain: (r.domain || '').toLowerCase() })));

      // Fetch mentions for chart (last 90 days)
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
      console.log("✅ Dashboard fetch complete");
      hasFetchedRef.current = true;
    }
  }, []);

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
        // Use source_urls if available first
        let urls: string[] = mention.source_urls || [];
        
        // If no source_urls, extract from raw_output (find message item)
        if (urls.length === 0 && mention.raw_output) {
          try {
            const parsed = typeof mention.raw_output === 'string' 
              ? JSON.parse(mention.raw_output) 
              : mention.raw_output;
            
            if (parsed?.output && Array.isArray(parsed.output)) {
              // Find message item
              const messageItem = parsed.output.find((item: any) => item.type === "message" && item.content);
              
              // Extract from annotations (url_citation)
              if (messageItem?.content?.[0]?.annotations) {
                const annotations = messageItem.content[0].annotations;
                annotations.forEach((ann: any) => {
                  if (ann.type === 'url_citation' && ann.url) {
                    urls.push(ann.url);
                  }
                });
              }
              
              // Also check web_search_call.action.sources
              for (const item of parsed.output) {
                if (item?.type === 'web_search_call' && item?.action?.sources) {
                  const sources = item.action.sources;
                  sources.forEach((source: any) => {
                    if (source?.url) {
                      urls.push(source.url);
                    }
                  });
                }
              }
              
              // Fallback: regex from text
              if (urls.length === 0 && messageItem?.content?.[0]?.text) {
                const text = messageItem.content[0].text;
                const urlRegex = /https?:\/\/[^\s<>"{}|\\^`\[\]]+/g;
                urls = text.match(urlRegex) || [];
              }
            } else {
              // Fallback: try regex on raw string if not v1/responses format
              const urlRegex = /https?:\/\/[^\s<>"{}|\\^`\[\]]+/g;
              urls = (typeof mention.raw_output === 'string' ? mention.raw_output : '').match(urlRegex) || [];
            }
          } catch (e) {
            // If parsing fails, try regex on raw string
            const urlRegex = /https?:\/\/[^\s<>"{}|\\^`\[\]]+/g;
            urls = (typeof mention.raw_output === 'string' ? mention.raw_output : '').match(urlRegex) || [];
          }
        }

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

  // Extract competitors from **brand name** patterns and track citation links
  const processCompetitors = (mentions: any[]): CompetitorData[] => {
    console.log("🔍 Processing competitors from", mentions.length, "mentions");
    const competitorsMap = new Map<string, {
      name: string;
      citationLinks: Map<string, { url: string; title?: string }>; // Use Map to deduplicate URLs
      searchQueries: Set<string>; // Track unique search queries this competitor appeared in
    }>();

    mentions.forEach((mention) => {
      try {
        // Parse raw_output to extract text and citations
        let responseText = '';
        let citations: Array<{ url: string; title?: string }> = [];
        let parsedRawOutput: any = null;

        // Try to parse raw_output as JSON
        if (mention.raw_output) {
          try {
            parsedRawOutput = typeof mention.raw_output === 'string' 
              ? JSON.parse(mention.raw_output) 
              : mention.raw_output;
            
            // Extract text from /v1/responses format - find message item
            if (parsedRawOutput?.output && Array.isArray(parsedRawOutput.output)) {
              const messageItem = parsedRawOutput.output.find((item: any) => item.type === "message" && item.content);
              if (messageItem?.content?.[0]?.text) {
                responseText = messageItem.content[0].text;
              }
              
              // Extract citations from annotations (url_citation)
              if (messageItem?.content?.[0]?.annotations) {
                const annotations = messageItem.content[0].annotations;
                annotations.forEach((ann: any) => {
                  if (ann.type === 'url_citation' && ann.url) {
                    citations.push({
                      url: ann.url,
                      title: ann.title
                    });
                  }
                });
              }
            } else if (typeof parsedRawOutput === 'string') {
              responseText = parsedRawOutput;
            }
          } catch (e) {
            // If parsing fails, treat as plain text
            responseText = typeof mention.raw_output === 'string' ? mention.raw_output : '';
          }
        }

        // Use source_urls if available, otherwise extract from citations
        let urls: Array<{ url: string; title?: string }> = [];
        if (mention.source_urls && Array.isArray(mention.source_urls)) {
          urls = mention.source_urls.map((url: string) => ({ url }));
        } else if (citations.length > 0) {
          urls = citations;
        } else if (responseText) {
          // Fallback: extract URLs from raw_output text
          const urlRegex = /https?:\/\/[^\s<>"{}|\\^`\[\]]+/g;
          const urlMatches = responseText.match(urlRegex) || [];
          urls = urlMatches.map((url: string) => ({ url }));
        }

        // Generic words to exclude from competitor detection
        const genericWords = new Set([
          'summary', 'overview', 'introduction', 'conclusion', 'product', 'products',
          'description', 'details', 'information', 'about', 'features', 'specifications',
          'review', 'reviews', 'comparison', 'guide', 'tips', 'faq', 'faqs',
          'benefits', 'advantages', 'disadvantages', 'pros', 'cons', 'pricing',
          'price', 'cost', 'buy', 'purchase', 'order', 'shipping', 'delivery',
          'contact', 'email', 'phone', 'address', 'location', 'hours', 'store',
          'shop', 'website', 'home', 'page', 'blog', 'news', 'article', 'post',
          'read more', 'learn more', 'see more', 'click here', 'here', 'there',
          'best', 'top', 'featured', 'popular', 'new', 'latest', 'trending',
          'more', 'less', 'all', 'none', 'some', 'many', 'few', 'other', 'others',
          'also', 'additionally', 'furthermore', 'however', 'therefore', 'thus',
          'note', 'important', 'warning', 'caution', 'example', 'examples',
          'section', 'chapter', 'part', 'step', 'steps', 'item', 'items',
          'list', 'lists', 'table', 'tables', 'image', 'images', 'picture', 'pictures',
          'when', 'where', 'why', 'how', 'what', 'which', 'who', 'whom', 'whose',
          'and', 'or', 'but', 'if', 'then', 'else', 'because', 'since', 'until',
          'next', 'previous', 'first', 'last', 'back', 'forward', 'up', 'down',
          'left', 'right', 'start', 'end', 'begin', 'finish', 'complete', 'done'
        ]);

        // Extract brand names from **brand name** patterns
        const brandPattern = /\*\*([^*]+)\*\*/g;
        const extractedBrands = new Set<string>();
        let match;
        
        while ((match = brandPattern.exec(responseText)) !== null) {
          const brandName = match[1].trim();
          const brandLower = brandName.toLowerCase().trim();
          
          // Skip if empty or the tracked brand
          if (brandName.length === 0 || brandLower === mention.brand?.toLowerCase()) {
            continue;
          }
          
          // Check if it's a generic word (case-insensitive)
          if (genericWords.has(brandLower)) {
            console.log(`🚫 Skipped generic word: "${brandName}"`);
            continue;
          }
          
          // Skip single words that are too short (likely not brand names)
          const words = brandName.split(/\s+/).filter(w => w.length > 0);
          if (words.length === 1 && brandName.length < 4) {
            console.log(`🚫 Skipped too short: "${brandName}"`);
            continue;
          }
          
          // Skip common sentence fragments/formatting
          if (/^(the|a|an)\s+/i.test(brandName) && words.length <= 2) {
            console.log(`🚫 Skipped article phrase: "${brandName}"`);
            continue;
          }
          
          extractedBrands.add(brandName);
          console.log(`🏷️  Extracted brand from **: ${brandName}`);
        }

        // Process each extracted brand as a competitor
        extractedBrands.forEach(brand => {
          // Skip if it's the tracked brand
          if (brand.toLowerCase() === mention.brand?.toLowerCase()) {
            return;
          }

          const key = brand.toLowerCase();
          if (!competitorsMap.has(key)) {
            competitorsMap.set(key, {
              name: brand,
              citationLinks: new Map(),
              searchQueries: new Set(),
            });
          }

          const competitor = competitorsMap.get(key)!;
          
          // Add this search query to the set (tracks unique searches)
          const query = (mention.query || '').trim();
          if (query) {
            competitor.searchQueries.add(query);
          }
          
          // Add citation links (deduplicated by URL)
          urls.forEach(link => {
            if (link.url) {
              competitor.citationLinks.set(link.url, {
                url: link.url,
                title: link.title
              });
            }
          });
        });
      } catch (e) {
        console.error("❌ Error processing competitor:", e);
      }
    });

    const results = Array.from(competitorsMap.values())
      .map(comp => ({
        competitorName: comp.name,
        citationLinks: Array.from(comp.citationLinks.values()),
        searchAppearances: comp.searchQueries.size, // Count of unique searches
      }))
      .filter(comp => comp.searchAppearances > 0) // Only show competitors that appeared in at least one search
      .sort((a, b) => b.searchAppearances - a.searchAppearances); // Sort by search appearances

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

    // Count unique competitors (no time filtering since we don't track lastSeen per competitor)
    const uniqueCompetitors = new Set((competitors || [])
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

  // New domains discovered in range (not seen before range) - extracted from citations in all mentions
  const newDomains = React.useMemo(() => {
    if (!chartMentionsRaw || chartMentionsRaw.length === 0) return [];
    
    const ref = new Date();
    const days = timeRange === "90d" ? 90 : timeRange === "7d" ? 7 : 30;
    const since = new Date(ref); 
    since.setDate(ref.getDate() - days);
    
    // Extract all domains from citations in mentions before the time range (prior domains)
    const priorDomains = new Set<string>();
    chartMentionsRaw.forEach((mention: any) => {
      const mentionDate = new Date(mention.created_at);
      if (mentionDate < since) {
        // Extract domains from citations in this mention
        let urls: string[] = [];
        
        // Try source_urls first
        if (mention.source_urls && Array.isArray(mention.source_urls)) {
          urls = mention.source_urls;
        } else if (mention.raw_output) {
          // Extract from raw_output citations
          try {
            const parsed = typeof mention.raw_output === 'string' 
              ? JSON.parse(mention.raw_output) 
              : mention.raw_output;
            
            // Extract from annotations - find message item in output array
            if (parsed?.output && Array.isArray(parsed.output)) {
              const messageItem = parsed.output.find((item: any) => item.type === "message" && item.content);
              
              if (messageItem?.content?.[0]?.annotations) {
                const annotations = messageItem.content[0].annotations;
                annotations.forEach((ann: any) => {
                  if (ann.type === 'url_citation' && ann.url) {
                    urls.push(ann.url);
                  }
                });
              }
              
              // Fallback: regex from text
              if (urls.length === 0 && messageItem?.content?.[0]?.text) {
                const text = messageItem.content[0].text;
                const urlRegex = /https?:\/\/[^\s<>"{}|\\^`\[\]]+/g;
                urls = text.match(urlRegex) || [];
              }
            }
          } catch (e) {
            // If parsing fails, try regex on raw string
            const urlRegex = /https?:\/\/[^\s<>"{}|\\^`\[\]]+/g;
            urls = (typeof mention.raw_output === 'string' ? mention.raw_output : '').match(urlRegex) || [];
          }
        }
        
        // Extract domains from URLs
        urls.forEach((url: string) => {
          try {
            const urlObj = new URL(url);
            const domain = urlObj.hostname.replace(/^www\./, '').toLowerCase();
            if (domain) {
              priorDomains.add(domain);
            }
          } catch (e) {
            // Invalid URL, skip
          }
        });
      }
    });
    
    // Extract domains from citations in mentions within the time range
    const inRangeDomains = new Set<string>();
    chartMentionsRaw.forEach((mention: any) => {
      const mentionDate = new Date(mention.created_at);
      if (mentionDate >= since) {
        // Extract domains from citations in this mention
        let urls: string[] = [];
        
        // Try source_urls first
        if (mention.source_urls && Array.isArray(mention.source_urls)) {
          urls = mention.source_urls;
        } else if (mention.raw_output) {
          // Extract from raw_output citations
          try {
            const parsed = typeof mention.raw_output === 'string' 
              ? JSON.parse(mention.raw_output) 
              : mention.raw_output;
            
            // Extract from annotations - find message item in output array
            if (parsed?.output && Array.isArray(parsed.output)) {
              const messageItem = parsed.output.find((item: any) => item.type === "message" && item.content);
              
              if (messageItem?.content?.[0]?.annotations) {
                const annotations = messageItem.content[0].annotations;
                annotations.forEach((ann: any) => {
                  if (ann.type === 'url_citation' && ann.url) {
                    urls.push(ann.url);
                  }
                });
              }
              
              // Fallback: regex from text
              if (urls.length === 0 && messageItem?.content?.[0]?.text) {
                const text = messageItem.content[0].text;
                const urlRegex = /https?:\/\/[^\s<>"{}|\\^`\[\]]+/g;
                urls = text.match(urlRegex) || [];
              }
            }
          } catch (e) {
            // If parsing fails, try regex on raw string
            const urlRegex = /https?:\/\/[^\s<>"{}|\\^`\[\]]+/g;
            urls = (typeof mention.raw_output === 'string' ? mention.raw_output : '').match(urlRegex) || [];
          }
        }
        
        // Extract domains from URLs
        urls.forEach((url: string) => {
          try {
            const urlObj = new URL(url);
            const domain = urlObj.hostname.replace(/^www\./, '').toLowerCase();
            if (domain) {
              inRangeDomains.add(domain);
            }
          } catch (e) {
            // Invalid URL, skip
          }
        });
      }
    });
    
    // Find domains that appear in range but not in prior (new domains)
    const newDomainsList = Array.from(inRangeDomains).filter(d => !priorDomains.has(d));
    
    console.log(`🔍 New domains found: ${newDomainsList.length} (prior: ${priorDomains.size}, in range: ${inRangeDomains.size})`);
    
    return newDomainsList.slice(0, 8);
  }, [chartMentionsRaw, timeRange]);

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

  // Pagination for recent mentions
  const totalMentionsPages = Math.ceil(recentMentions.length / mentionsPerPage);
  const paginatedMentions = recentMentions.slice(
    (currentMentionsPage - 1) * mentionsPerPage,
    currentMentionsPage * mentionsPerPage
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


        {/* Recent Activity - Source Links Table */}
        <Card>
          <CardHeader className="border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                <CardTitle>Recent Activity</CardTitle>
              </div>
              <Badge variant="secondary" className="ml-auto">
                {recentMentions.length} {recentMentions.length === 1 ? 'search' : 'searches'}
              </Badge>
            </div>
            <CardDescription>
              Latest brand mentions with source links
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {recentMentions.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[100px]">Status</TableHead>
                      <TableHead className="min-w-[120px]">Brand</TableHead>
                      <TableHead className="min-w-[200px]">Query</TableHead>
                      <TableHead>Source Links</TableHead>
                      <TableHead className="w-[140px]">Timestamp</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedMentions.map((mention) => {
                      // Use source_urls if available, otherwise extract from raw_output for backward compatibility
                      let urls: string[] = mention.source_urls || [];
                      
                      // Fallback: extract from raw_output for older records
                      if (urls.length === 0 && mention.raw_output) {
                        const urlRegex = /https?:\/\/[^\s<>"{}|\\^`\[\]]+/g;
                        urls = mention.raw_output.match(urlRegex) || [];
                      }
                      
                      return (
                        <TableRow key={mention.id}>
                          <TableCell>
                  {mention.mentioned ? (
                              <Badge variant="default" className="gap-1">
                                <CheckCircle className="w-3 h-3" />
                                Found
                              </Badge>
                            ) : (
                              <Badge variant="secondary" className="gap-1">
                                <XCircle className="w-3 h-3" />
                                None
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="font-medium">{mention.brand}</TableCell>
                          <TableCell className="truncate max-w-[200px]">{mention.query}</TableCell>
                          <TableCell>
                            {urls.length > 0 ? (
                              <div className="flex flex-wrap gap-1.5">
                                {urls.slice(0, 3).map((url, idx) => (
                                  <a
                                    key={idx}
                                    href={url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-primary hover:underline inline-flex items-center gap-1"
                                  >
                                    <ExternalLink className="w-3 h-3" />
                                    {new URL(url).hostname}
                                  </a>
                                ))}
                                {urls.length > 3 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{urls.length - 3} more
                                  </Badge>
                                )}
                              </div>
                            ) : (
                              <span className="text-xs text-muted-foreground">No links found</span>
                            )}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            <div className="flex items-center gap-1.5">
                              <Calendar className="w-3 h-3" />
                              {new Date(mention.created_at).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <Clock className="w-12 h-12 mb-4 opacity-50" />
                <p className="font-medium">No recent activity</p>
                <p className="text-sm mt-1">Activity will appear here after brand searches</p>
                  </div>
            )}
            
            {/* Pagination Controls for Recent Mentions */}
            {recentMentions.length > mentionsPerPage && (
              <div className="flex items-center justify-between border-t px-6 py-4">
                <div className="text-sm text-muted-foreground">
                  Showing {((currentMentionsPage - 1) * mentionsPerPage) + 1} to {Math.min(currentMentionsPage * mentionsPerPage, recentMentions.length)} of {recentMentions.length} mentions
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentMentionsPage(p => Math.max(1, p - 1))}
                    disabled={currentMentionsPage === 1}
                  >
                    Previous
                  </Button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalMentionsPages) }, (_, i) => {
                      let pageNum;
                      if (totalMentionsPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentMentionsPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentMentionsPage >= totalMentionsPages - 2) {
                        pageNum = totalMentionsPages - 4 + i;
                      } else {
                        pageNum = currentMentionsPage - 2 + i;
                      }
                      return (
                        <Button
                          key={pageNum}
                          variant={currentMentionsPage === pageNum ? "default" : "outline"}
                          size="sm"
                          className="w-10"
                          onClick={() => setCurrentMentionsPage(pageNum)}
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentMentionsPage(p => Math.min(totalMentionsPages, p + 1))}
                    disabled={currentMentionsPage === totalMentionsPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
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
            Brands extracted from search results (detected from **brand name** patterns with citation links)
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {competitors.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[200px]">Competitor Name</TableHead>
                    <TableHead>Citation Links</TableHead>
                    <TableHead className="w-[150px] text-center">Search Appearances</TableHead>
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
                        {competitor.citationLinks.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {competitor.citationLinks.slice(0, 5).map((link, linkIdx) => {
                              try {
                                const urlObj = new URL(link.url);
                                const domain = urlObj.hostname.replace(/^www\./, '');
                                return (
                                  <a
                                    key={linkIdx}
                                    href={link.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline"
                                    title={link.title || link.url}
                                  >
                                    <ExternalLink className="w-3 h-3" />
                                    <span className="truncate max-w-[200px]">{link.title || domain}</span>
                                  </a>
                                );
                              } catch (e) {
                                return (
                                  <a
                                    key={linkIdx}
                                    href={link.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline"
                                    title={link.url}
                                  >
                                    <ExternalLink className="w-3 h-3" />
                                    <span className="truncate max-w-[200px]">{link.url}</span>
                                  </a>
                                );
                              }
                            })}
                            {competitor.citationLinks.length > 5 && (
                              <Badge variant="outline" className="text-xs">
                                +{competitor.citationLinks.length - 5} more
                              </Badge>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">No citation links</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="secondary" className="font-mono">
                          {competitor.searchAppearances}
                        </Badge>
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