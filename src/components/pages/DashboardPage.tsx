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
  Calendar,
  RefreshCw,
  Zap,
  TrendingDown,
  Flame,
  AlertTriangle,
  Trash2
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
  category: string; // News, Blog, Forum, Social, E-commerce, Educational, Other
  count: number;
  queries: string[];
  lastSeen: string; // Timestamp of most recent mention
  mentions: MentionDetail[]; // All individual URLs from this domain
}

interface CompetitorData {
  competitorName: string;
  citationLinks: Array<{ url: string; title?: string }>;
  searchAppearances: number; // How many unique searches this competitor appeared in
  bestPosition: number | null; // Best (lowest) position achieved (1 = first, 2 = second, etc.)
}

interface DashboardPageProps {
  teamId?: string;
}

export default function DashboardPage({ teamId }: DashboardPageProps = {}) {
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
  const [realtimeChecking, setRealtimeChecking] = useState(false);
  const [realtimeResults, setRealtimeResults] = useState<any[]>([]);
  const [currentSourcesPage, setCurrentSourcesPage] = useState(1);
  const sourcesPerPage = 10;
  const [trackedCompetitors, setTrackedCompetitors] = useState<{ name: string; domain: string }[]>([]);
  const [currentMentionsPage, setCurrentMentionsPage] = useState(1);
  const mentionsPerPage = 10;
  const [currentCompetitorsPage, setCurrentCompetitorsPage] = useState(1);
  const competitorsPerPage = 10;
  const [selectedCategory, setSelectedCategory] = useState<string>("all"); // Filter by category
  const hasFetchedRef = useRef(false);
  
  // Track deleted competitors (persist in localStorage)
  const [deletedCompetitors, setDeletedCompetitors] = useState<Set<string>>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('deletedCompetitors');
      return stored ? new Set(JSON.parse(stored)) : new Set();
    }
    return new Set();
  });
  
  // Save deleted competitors to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('deletedCompetitors', JSON.stringify(Array.from(deletedCompetitors)));
    }
  }, [deletedCompetitors]);
  
  // Filter out deleted competitors
  const visibleCompetitors = useMemo(() => {
    return competitors.filter(c => !deletedCompetitors.has(c.competitorName.toLowerCase()));
  }, [competitors, deletedCompetitors]);
  
  const handleDeleteCompetitor = (competitorName: string) => {
    if (confirm(`Remove "${competitorName}" from competitor analysis?`)) {
      setDeletedCompetitors(prev => {
        const updated = new Set(prev);
        updated.add(competitorName.toLowerCase());
        return updated;
      });
      
      // Reset to page 1 if current page becomes empty after deletion
      const remainingAfterDeletion = visibleCompetitors.length - 1;
      const maxPageAfterDeletion = Math.ceil(remainingAfterDeletion / competitorsPerPage);
      if (currentCompetitorsPage > maxPageAfterDeletion && maxPageAfterDeletion > 0) {
        setCurrentCompetitorsPage(maxPageAfterDeletion);
      } else if (maxPageAfterDeletion === 0) {
        setCurrentCompetitorsPage(1);
      }
    }
  };

  // Source categorization utility function
  const categorizeDomain = (domain: string): string => {
    const domainLower = domain.toLowerCase();
    
    // Known platform mappings
    const platformMap: Record<string, string> = {
      // Social
      'twitter.com': 'Social',
      'x.com': 'Social',
      'linkedin.com': 'Social',
      'facebook.com': 'Social',
      'instagram.com': 'Social',
      'tiktok.com': 'Social',
      'youtube.com': 'Social',
      'reddit.com': 'Forum',
      'quora.com': 'Forum',
      'stackoverflow.com': 'Forum',
      'stackexchange.com': 'Forum',
      'medium.com': 'Blog',
      'substack.com': 'Blog',
      'wordpress.com': 'Blog',
      'blogger.com': 'Blog',
      'amazon.com': 'E-commerce',
      'amazon.in': 'E-commerce',
      'flipkart.com': 'E-commerce',
      'ebay.com': 'E-commerce',
      'etsy.com': 'E-commerce',
      'github.com': 'Tech',
      'techcrunch.com': 'News',
      'bbc.com': 'News',
      'cnn.com': 'News',
      'nytimes.com': 'News',
      'theguardian.com': 'News',
      'forbes.com': 'News',
      'reuters.com': 'News',
      'bloomberg.com': 'News',
      'wsj.com': 'News',
    };

    // Check known platforms first
    if (platformMap[domainLower]) {
      return platformMap[domainLower];
    }

    // Check subdomain patterns
    if (domainLower.includes('blog.') || domainLower.includes('.blog')) {
      return 'Blog';
    }
    if (domainLower.includes('news.') || domainLower.includes('.news')) {
      return 'News';
    }
    if (domainLower.includes('forum.') || domainLower.includes('.forum')) {
      return 'Forum';
    }
    if (domainLower.includes('shop.') || domainLower.includes('store.') || domainLower.includes('.shop')) {
      return 'E-commerce';
    }

    // Check domain keywords
    if (/news|press|media|journal|times|post|gazette|herald|tribune|chronicle|observer/i.test(domainLower)) {
      return 'News';
    }
    if (/blog|article|post|write|author|journal/i.test(domainLower)) {
      return 'Blog';
    }
    if (/forum|discussion|community|board|qa|question|answer|discuss/i.test(domainLower)) {
      return 'Forum';
    }
    if (/shop|store|cart|buy|purchase|marketplace|merchant|retail|commerce/i.test(domainLower)) {
      return 'E-commerce';
    }
    if (/social|share|connect|network|profile|feed/i.test(domainLower)) {
      return 'Social';
    }
    if (/tech|software|app|digital|innovation|startup|gadget/i.test(domainLower)) {
      return 'Tech';
    }

    // Check domain extensions
    if (domainLower.endsWith('.edu')) {
      return 'Educational';
    }
    if (domainLower.endsWith('.gov') || domainLower.endsWith('.gov.in')) {
      return 'Government';
    }

    // Default fallback
    return 'Other';
  };

  // Real-time check function using RAG endpoint
  const handleRealtimeCheck = useCallback(async () => {
    try {
      setRealtimeChecking(true);
      setRealtimeResults([]);

      // Get current user
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user?.email || !session?.user?.id) {
        alert('Please sign in to check real-time mentions');
        return;
      }

      const userEmail = session.user.email;
      const userId = session.user.id;

      console.log('🔍 Starting real-time check for:', userEmail);

      // Fetch active trackers
      let trackersQuery = supabase
        .from("tracked_brands")
        .select("*")
        .eq("active", true);
      
      if (teamId) {
        trackersQuery = trackersQuery.eq("team_id", teamId);
      } else {
        trackersQuery = trackersQuery.eq("user_email", userEmail).is("team_id", null);
      }

      const { data: trackers, error: trackersError } = await trackersQuery;

      if (trackersError) {
        throw trackersError;
      }

      if (!trackers || trackers.length === 0) {
        alert('No active trackers found. Add a tracker first!');
        return;
      }

      console.log(`📊 Found ${trackers.length} active trackers, checking in real-time...`);

      // Check each tracker using realtime endpoint
      const results = [];
      for (const tracker of trackers) {
        try {
          const response = await fetch('/api/trackBrand/realtime', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              brand: tracker.brand,
              query: tracker.query,
              user_email: userEmail,
              user_id: userId,
              team_id: teamId || null,
            }),
          });

          const result = await response.json();
          
          if (response.ok) {
            results.push({
              ...result,
              brand: tracker.brand,
              query: tracker.query,
              timestamp: new Date().toISOString(),
            });
            console.log(`✅ ${tracker.brand}: ${result.mentioned ? 'MENTIONED' : 'NOT FOUND'}`);
          } else {
            console.error(`❌ Error checking ${tracker.brand}:`, result.error);
            results.push({
              brand: tracker.brand,
              query: tracker.query,
              mentioned: false,
              error: result.error || 'Check failed',
              timestamp: new Date().toISOString(),
            });
          }

          // Small delay between checks
          await new Promise(resolve => setTimeout(resolve, 500));
        } catch (error: any) {
          console.error(`❌ Error checking ${tracker.brand}:`, error);
          results.push({
            brand: tracker.brand,
            query: tracker.query,
            mentioned: false,
            error: error.message || 'Check failed',
            timestamp: new Date().toISOString(),
          });
        }
      }

      setRealtimeResults(results);
      
      // Refresh dashboard to show new data
      setTimeout(() => {
        if (fetchDashboardDataRef.current) {
          fetchDashboardDataRef.current();
        }
      }, 500);

      // Show summary
      const mentioned = results.filter(r => r.mentioned).length;
      alert(`Real-time check complete!\n\n${mentioned} of ${results.length} brands mentioned\n\nResults refreshed in dashboard.`);
    } catch (error: any) {
      console.error('❌ Real-time check error:', error);
      alert(`Error: ${error.message || 'Failed to check real-time mentions'}`);
    } finally {
      setRealtimeChecking(false);
    }
  }, [teamId, supabase]);

  // Store fetchDashboardData in a ref to avoid dependency issues
  const fetchDashboardDataRef = useRef<(() => Promise<void>) | undefined>(undefined);

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
      
      // Fetch tracked brands count
      // Team workspace: Show all team members' trackers (RLS handles access)
      // Personal workspace: Show only current user's trackers
      let trackersQuery = supabase
        .from("tracked_brands")
        .select("*", { count: "exact", head: true });
      
      if (teamId) {
        trackersQuery = trackersQuery.eq("team_id", teamId);
      } else {
        trackersQuery = trackersQuery.eq("user_email", userEmail).is("team_id", null);
      }
      
      const { count: trackersCount } = await trackersQuery;

      // Fetch active trackers count
      // Team workspace: Show all team members' active trackers (RLS handles access)
      // Personal workspace: Show only current user's active trackers
      let activeTrackersQuery = supabase
        .from("tracked_brands")
        .select("*", { count: "exact", head: true })
        .eq("active", true);
      
      if (teamId) {
        activeTrackersQuery = activeTrackersQuery.eq("team_id", teamId);
      } else {
        activeTrackersQuery = activeTrackersQuery.eq("user_email", userEmail).is("team_id", null);
      }
      
      const { count: activeCount } = await activeTrackersQuery;

      // Fetch total mentions count
      // Team workspace: Show all team members' mentions (RLS handles access)
      // Personal workspace: Show only current user's mentions
      let mentionsCountQuery = supabase
        .from("brand_mentions")
        .select("*", { count: "exact", head: true });
      
      if (teamId) {
        mentionsCountQuery = mentionsCountQuery.eq("team_id", teamId);
      } else {
        mentionsCountQuery = mentionsCountQuery.eq("user_email", userEmail).is("team_id", null);
      }
      
      const { count: mentionsCount } = await mentionsCountQuery;

      // Fetch recent mentions (last 24 hours)
      // Team workspace: Show all team members' recent mentions (RLS handles access)
      // Personal workspace: Show only current user's recent mentions
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      let recentCountQuery = supabase
        .from("brand_mentions")
        .select("*", { count: "exact", head: true })
        .gte("created_at", yesterday.toISOString());
      
      if (teamId) {
        recentCountQuery = recentCountQuery.eq("team_id", teamId);
      } else {
        recentCountQuery = recentCountQuery.eq("user_email", userEmail).is("team_id", null);
      }
      
      const { count: recentCount } = await recentCountQuery;

      // Fetch recent mentions for display
      // Team workspace: Show all team members' recent mentions (RLS handles access)
      // Personal workspace: Show only current user's recent mentions
      let recentDataQuery = supabase
        .from("brand_mentions")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (teamId) {
        recentDataQuery = recentDataQuery.eq("team_id", teamId);
      } else {
        recentDataQuery = recentDataQuery.eq("user_email", userEmail).is("team_id", null);
      }
      
      const { data: recentData } = await recentDataQuery;

      // Fetch mentions for chart (last 7 days)
      // Team workspace: Show all team members' mentions (RLS handles access)
      // Personal workspace: Show only current user's mentions
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      let mentionsDataQuery = supabase
        .from("brand_mentions")
        .select("*")
        .gte("created_at", sevenDaysAgo.toISOString())
        .order("created_at", { ascending: true });
      
      if (teamId) {
        mentionsDataQuery = mentionsDataQuery.eq("team_id", teamId);
      } else {
        mentionsDataQuery = mentionsDataQuery.eq("user_email", userEmail).is("team_id", null);
      }
      
      const { data: mentionsData } = await mentionsDataQuery;

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
      // Team workspace: Show all team members' mentions (RLS handles access)
      // Personal workspace: Show only current user's mentions
      let allMentionsQuery = supabase
        .from("brand_mentions")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (teamId) {
        allMentionsQuery = allMentionsQuery.eq("team_id", teamId);
      } else {
        allMentionsQuery = allMentionsQuery.eq("user_email", userEmail).is("team_id", null);
      }
      
      const { data: allMentions, error: mentionsError } = await allMentionsQuery;

      if (mentionsError) {
        console.error("❌ Error fetching mentions:", mentionsError);
      }

      console.log("🔍 Fetched mentions for analysis:", allMentions?.length);
      console.log("📊 Sample mention:", allMentions && allMentions.length > 0 ? {
        mentioned: allMentions[0].mentioned,
        has_raw_output: !!allMentions[0].raw_output,
        has_source_urls: !!allMentions[0].source_urls,
        source_urls_count: Array.isArray(allMentions[0].source_urls) ? allMentions[0].source_urls.length : 0
      } : 'no mentions');

      // Process top sources from ALL mentions (includes citations from all searches)
      // Note: We include all mentions because citations are available even when brand wasn't mentioned
      console.log("✅ Processing all mentions for top sources:", allMentions?.length || 0);
      const sources = processTopSources(allMentions || []);
      console.log("📈 Top sources result:", sources.length, "domains");
      setTopSources(sources);

      // Load tracked competitors for this user FIRST (needed for competitor validation)
      const { data: tc } = await supabase
        .from("tracked_competitors")
        .select("name, domain")
        .eq("user_email", userEmail)
        .order("created_at", { ascending: false });
      const trackedCompetitorsList = (tc || []).map((r: any) => ({ name: r.name, domain: (r.domain || '').toLowerCase() }));
      setTrackedCompetitors(trackedCompetitorsList);

      // Process competitors (pass tracked competitors for validation)
      const competitorData = processCompetitors(allMentions || [], trackedCompetitorsList);
      setCompetitors(competitorData);

      // Store chart mentions for other components
      if (allMentions && allMentions.length > 0) {
        setChartMentionsRaw(allMentions);
      } else {
        console.log("⚠️ No chart data available");
      }

      // Fetch mentions for chart (last 90 days) - include source_urls and raw_output for domain extraction
      // Filtered by user and team_id if provided
      const ninetyDaysAgo = new Date();
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
      
      let chartMentionsQuery = supabase
        .from("brand_mentions")
        .select("created_at, mentioned, query, brand, source_urls, raw_output")
        .eq("user_email", userEmail)
        .gte("created_at", ninetyDaysAgo.toISOString())
        .order("created_at", { ascending: true });
      
      if (teamId) {
        chartMentionsQuery = chartMentionsQuery.eq("team_id", teamId);
      } else {
        chartMentionsQuery = chartMentionsQuery.is("team_id", null);
      }
      
      const { data: chartMentions } = await chartMentionsQuery;

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
  }, [teamId]);

  // Update ref when fetchDashboardData changes
  useEffect(() => {
    fetchDashboardDataRef.current = fetchDashboardData;
  }, [fetchDashboardData]);

  // Initial fetch on mount
  useEffect(() => {
    console.log("🚀 Dashboard mount - initializing fetch...");
    fetchDashboardData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Helper function to extract URLs from a mention (shared by processTopSources and newDomains)
  const extractUrlsFromMention = (mention: any): string[] => {
    let urls: string[] = [];
    
    // Priority 1: Use source_urls from database if available
    if (mention.source_urls) {
      if (Array.isArray(mention.source_urls)) {
        // Filter out any null/undefined/empty values
        urls = mention.source_urls.filter((url: any) => url && typeof url === 'string' && url.trim().length > 0);
      } else if (typeof mention.source_urls === 'string') {
        // Handle case where it might be a string representation of array
        try {
          const parsed = JSON.parse(mention.source_urls);
          if (Array.isArray(parsed)) {
            urls = parsed.filter((url: any) => url && typeof url === 'string' && url.trim().length > 0);
          }
        } catch (e) {
          // Not a JSON string, skip
        }
      }
    }
    
    // Priority 2: If no source_urls, extract from raw_output (find message item)
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
                  if (!urls.includes(source.url)) {
                    urls.push(source.url);
                  }
                }
              });
            }
          }
          
          // Fallback: regex from text
          if (urls.length === 0 && messageItem?.content?.[0]?.text) {
            const text = messageItem.content[0].text;
            const urlRegex = /https?:\/\/[^\s<>"{}|\\^`\[\]]+/g;
            const extracted = text.match(urlRegex) || [];
            urls = [...urls, ...extracted];
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
    
    // Deduplicate URLs
    return Array.from(new Set(urls));
  };

  const processTopSources = (mentions: any[]): SourceData[] => {
    console.log("🔍 Processing top sources from", mentions.length, "mentions");
    const sourcesMap = new Map<string, { count: number; queries: Set<string>; lastSeen: string; mentions: MentionDetail[] }>();

    if (mentions.length === 0) {
      console.log("⚠️ No mentions provided to processTopSources");
      return [];
    }

    mentions.forEach((mention, index) => {
      // Process all mentions - citations are available even when brand wasn't mentioned
      // Optional: You can filter by mentioned === true if you only want sources where brand was found
      // For now, we process all to show all citation sources

      try {
        // Use the shared helper function to extract URLs (same logic as newDomains)
        const urls = extractUrlsFromMention(mention);

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
        category: categorizeDomain(domain), // Add category
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

  // Category breakdown statistics
  const categoryBreakdown = React.useMemo(() => {
    const breakdown = new Map<string, { count: number; domains: number }>();
    
    topSources.forEach(source => {
      const current = breakdown.get(source.category) || { count: 0, domains: 0 };
      breakdown.set(source.category, {
        count: current.count + source.count,
        domains: current.domains + 1
      });
    });

    return Array.from(breakdown.entries())
      .map(([category, data]) => ({
        category,
        mentions: data.count,
        domains: data.domains
      }))
      .sort((a, b) => b.mentions - a.mentions);
  }, [topSources]);

  // Filtered sources based on selected category
  const filteredTopSources = React.useMemo(() => {
    if (selectedCategory === "all") {
      return topSources;
    }
    return topSources.filter(source => source.category === selectedCategory);
  }, [topSources, selectedCategory]);

  // Update pagination to use filtered sources
  const totalSourcesPages = Math.ceil(filteredTopSources.length / sourcesPerPage);
  const paginatedSources = filteredTopSources.slice(
    (currentSourcesPage - 1) * sourcesPerPage,
    currentSourcesPage * sourcesPerPage
  );

  // Extract competitors from **brand name** patterns and track citation links
  const processCompetitors = (mentions: any[], trackedCompetitorsList: Array<{ name: string; domain: string }> = []): CompetitorData[] => {
    console.log("🔍 Processing competitors from", mentions.length, "mentions");
    const competitorsMap = new Map<string, {
      name: string;
      citationLinks: Map<string, { url: string; title?: string }>; // Use Map to deduplicate URLs
      searchQueries: Set<string>; // Track unique search queries this competitor appeared in
      positions: number[]; // Track all positions this competitor achieved across searches
    }>();

    mentions.forEach((mention) => {
      try {
        // Parse raw_output to extract text and citations
        let responseText = '';
        let citations: Array<{ url: string; title?: string }> = [];
        let parsedRawOutput: any = null;
        let messageItem: any = null;

        // Try to parse raw_output as JSON
        if (mention.raw_output) {
          try {
            parsedRawOutput = typeof mention.raw_output === 'string' 
              ? JSON.parse(mention.raw_output) 
              : mention.raw_output;
            
            // Extract text from /v1/responses format - find message item
            if (parsedRawOutput?.output && Array.isArray(parsedRawOutput.output)) {
              messageItem = parsedRawOutput.output.find((item: any) => item.type === "message" && item.content);
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
          'left', 'right', 'start', 'end', 'begin', 'finish', 'complete', 'done',
          'closed', 'open', 'fresh', 'baked', 'goodness', 'bakery', 'sweets', 'snacks',
          'worst', 'better', 'offering', 'organic', 'healthy', 'natural', 'official',
          'line', 'indian', 'india', 'brands', 'brand', 'for', 'your', 'pets',
          'shop', 'store', 'website', 'online', 'treats', 'food', 'headphones', 'wireless',
          'lack', 'poor', 'limited', 'absence', 'missing', 'customization', 'integration',
          'interface', 'options', 'user', 'men', 'women', 'shoes', 'sneakers', 'running'
        ]);
        
        // Patterns that indicate complaint/feature descriptions (not brand names)
        const complaintPatterns = [
          /^(lack of|poor|limited|absence of|missing|no|weak|strong|excellent|great|good|bad)\s+/i,
          /^(lack|poor|limited|absence|missing|weak|strong|excellent|great|good|bad)\s+(of|in|with|for)\s+/i,
        ];
        
        // Patterns that indicate product names (model numbers, product types)
        const productPatterns = [
          /\b(men'?s|women'?s|kids'?|children'?s)\s+(shoes?|sneakers?|running|boots?|sandals?|slippers?)\b/i,
          /\b(shoes?|sneakers?|running|boots?|sandals?|slippers?)\s+(for|by|from)\s+/i,
          /\b(model|version)\s+\d+/i,
          /\d+\s*(st|nd|rd|th)\s+(generation|version|edition)/i,
        ];
        
        // Query-like patterns to exclude (common search query words)
        const queryPatterns = [
          /\b(best|worst|top|cheap|expensive|free|paid|premium|budget)\s+/i, // Rating/price indicators at start
          /\b(india|indian|usa|american|european|global|local|international)\s*$/i, // Location indicators at end
          /\b(for|with|without|including|offering|providing|featuring)\s+/i, // Prepositional phrases
        ];
        
        // Patterns that indicate metadata, not brand names
        const metadataPatterns = [
          /^(closed|open)\s*·/i, // Status indicators like "Closed ·" or "Open ·"
          /\d+\.\d+\s*\(\d+\s*reviews?\)/i, // Rating patterns like "4.4 (1482 reviews)"
          /[$₹€£¥]+\s*[-–—]/i, // Price ranges like "$$$" or "₹200–400"
          /^[·•]\s*[a-z]+\s*[·•]/i, // Bullet point metadata
          /\d+\s*reviews?/i, // Just review counts
          /^\d+\.\d+/i, // Starts with a rating number
          /^[·•]+\s*$/i, // Just bullet points or separators
        ];

        // Extract brand names from **brand name** patterns with their positions
        const brandPattern = /\*\*([^*]+)\*\*/g;
        const extractedBrands: Array<{ name: string; position: number; endPosition: number }> = [];
        let match;
        
        while ((match = brandPattern.exec(responseText)) !== null) {
          let brandName = match[1].trim();
          const fullMatch = match[0]; // includes the ** markers
          const position = match.index; // position of ** before brand name
          const endPosition = match.index + fullMatch.length; // position after closing **
          
          // Clean markdown link syntax: extract text from [text](url) patterns
          // Handle full markdown link: [text](url) -> text
          // Also handle multiple or partial markdown links within the name
          brandName = brandName.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').trim();
          
          // Remove any remaining URL patterns that might be in the name
          brandName = brandName.replace(/https?:\/\/[^\s<>"{}|\\^`\[\]]+/g, '').trim();
          
          // Clean up any extra spaces
          brandName = brandName.replace(/\s+/g, ' ').trim();
          
          const brandLower = brandName.toLowerCase().trim();
          
          // Skip if empty or the tracked brand
          if (brandName.length === 0 || brandLower === mention.brand?.toLowerCase()) {
            continue;
          }
          
          // Skip if it matches metadata patterns (status, ratings, prices, etc.)
          if (metadataPatterns.some(pattern => pattern.test(brandName))) {
            console.log(`🚫 Skipped metadata pattern: "${brandName}"`);
            continue;
          }
          
          // Skip if contains rating/review patterns anywhere in the string
          if (/\d+\.\d+\s*\(/.test(brandName) || /\d+\s*reviews?/i.test(brandName)) {
            console.log(`🚫 Skipped rating pattern: "${brandName}"`);
            continue;
          }
          
          // Skip if contains price indicators
          if (/[$₹€£¥]+/.test(brandName) || /\d+\s*[-–—]\s*\d+/.test(brandName)) {
            console.log(`🚫 Skipped price pattern: "${brandName}"`);
            continue;
          }
          
          // Skip if contains status indicators (closed, open) as standalone or with separators
          if (/^(closed|open)\s*(now|·|•)/i.test(brandName) || /(closed|open)\s*·/i.test(brandName)) {
            console.log(`🚫 Skipped status indicator: "${brandName}"`);
            continue;
          }
          
          // Skip if it contains too many separators (likely metadata, not a brand name)
          const separatorCount = (brandName.match(/[·•]/g) || []).length;
          if (separatorCount >= 2) {
            console.log(`🚫 Skipped too many separators: "${brandName}"`);
            continue;
          }
          
          // Skip if it looks like a search query (contains query patterns)
          if (queryPatterns.some(pattern => pattern.test(brandName))) {
            console.log(`🚫 Skipped query pattern: "${brandName}"`);
            continue;
          }
          
          // Skip if it starts with common query words followed by a brand-like word
          if (/^(best|worst|top|cheap|good|bad|new|old)\s+.+/i.test(brandName)) {
            console.log(`🚫 Skipped query-like phrase: "${brandName}"`);
            continue;
          }
          
          // Skip if it's too long (likely an article title or description, not a brand name)
          // Brand names are typically 2-5 words, max ~40 characters
          if (brandName.length > 40 || brandName.split(/\s+/).length > 5) {
            console.log(`🚫 Skipped too long (likely article title): "${brandName}"`);
            continue;
          }
          
          // Skip if it contains quoted text or article title markers
          if (/"|«|»|—|–/.test(brandName)) {
            console.log(`🚫 Skipped contains quotes/dashes (article title): "${brandName}"`);
            continue;
          }
          
          // Skip complaint/feature descriptive phrases (not brand names)
          if (complaintPatterns.some(pattern => pattern.test(brandName))) {
            console.log(`🚫 Skipped complaint/feature pattern: "${brandName}"`);
            continue;
          }
          
          // Skip product names (with model numbers, product types, etc.)
          if (productPatterns.some(pattern => pattern.test(brandName))) {
            console.log(`🚫 Skipped product name pattern: "${brandName}"`);
            continue;
          }
          
          // Skip if it starts with complaint adjectives followed by descriptive nouns
          if (/^(poor|limited|lack|weak|strong|excellent|great|good|bad|missing|absence)\s+(customization|integration|interface|ui|ux|options?|features?|support|quality|design|performance|functionality|speed|reliability)\s*/i.test(brandName)) {
            console.log(`🚫 Skipped complaint + feature phrase: "${brandName}"`);
            continue;
          }
          
          // Skip if it contains "for", "with", "offering", etc. in the middle (likely description)
          if (/\s+(for|with|without|offering|providing|including|featuring)\s+/i.test(brandName)) {
            console.log(`🚫 Skipped contains descriptive phrase: "${brandName}"`);
            continue;
          }
          
          // Skip if it ends with descriptive words like "Shop", "Store", "Official", "Line", etc.
          if (/\s+(shop|store|official|line|products?|services?|website|online|site)\s*$/i.test(brandName)) {
            console.log(`🚫 Skipped ends with descriptive word: "${brandName}"`);
            continue;
          }
          
          // Skip if it ends with product type words (likely product names, not brands)
          if (/\s+(shoes?|sneakers?|running|boots?|sandals?|slippers?|headphones?|earbuds?|earphones?|speakers?|devices?|products?|items?)\s*$/i.test(brandName)) {
            console.log(`🚫 Skipped ends with product type: "${brandName}"`);
            continue;
          }
          
          // Skip if it looks like a product model (contains numbers + product words)
          if (/\d+/.test(brandName) && /\b(shoes?|sneakers?|running|boots?|model|version|edition|gen|generation)\b/i.test(brandName)) {
            console.log(`🚫 Skipped product model pattern: "${brandName}"`);
            continue;
          }
          
          // Skip if it starts with "The" followed by an adjective and location (like "The Better India")
          // Actually, "The Better India" is a real brand, so we'll be more specific
          // Only skip if it's "The [generic adjective] [location]" and the middle word is generic
          if (/^the\s+(better|best|good|new|top|worst|local|national|international)\s+(india|indian|usa|american)\s*$/i.test(brandName)) {
            console.log(`🚫 Skipped generic "The [adj] [location]" pattern: "${brandName}"`);
            continue;
          }
          
          // Check if it's a generic word (case-insensitive)
          const words = brandName.split(/\s+/).filter(w => w.length > 0);
          if (words.length === 1 && genericWords.has(brandLower)) {
            console.log(`🚫 Skipped generic word: "${brandName}"`);
            continue;
          }
          
          // Skip if all words are generic
          if (words.length > 0 && words.every(word => genericWords.has(word.toLowerCase()))) {
            console.log(`🚫 Skipped all generic words: "${brandName}"`);
            continue;
          }
          
          // Skip if most words are generic (more than 50% generic words)
          const genericWordCount = words.filter(word => genericWords.has(word.toLowerCase())).length;
          if (words.length > 2 && genericWordCount / words.length > 0.5) {
            console.log(`🚫 Skipped mostly generic words: "${brandName}"`);
            continue;
          }
          
          // Skip single words that are too short (likely not brand names)
          if (words.length === 1 && brandName.length < 4) {
            console.log(`🚫 Skipped too short: "${brandName}"`);
            continue;
          }
          
          // Skip common sentence fragments/formatting
          if (/^(the|a|an)\s+/i.test(brandName) && words.length <= 2) {
            console.log(`🚫 Skipped article phrase: "${brandName}"`);
            continue;
          }
          
          // Skip if it contains location names as standalone words (not part of brand)
          // But allow if it's a proper compound like "The Better India" (which has "The" prefix)
          if (/^(indian|india|american|usa|european|global)\s*$/i.test(brandName)) {
            console.log(`🚫 Skipped location-only: "${brandName}"`);
            continue;
          }
          
          // NEW: Check if it matches tracked competitors (actual brand names)
          const isTrackedCompetitor = trackedCompetitorsList.some(tc => {
            const tcName = tc.name.toLowerCase();
            const tcDomain = (tc.domain || '').toLowerCase();
            return brandLower === tcName || 
                   brandLower.includes(tcName) || 
                   tcName.includes(brandLower) ||
                   (tcDomain && brandLower === tcDomain.replace(/^www\./, '').split('.')[0]);
          });
          
          // NEW: Additional validation - check if it looks like a real brand name
          // Real brand names typically:
          // 1. Start with a capital letter (proper noun)
          // 2. Have mixed case or all caps (for known brands)
          // 3. Don't start with common descriptive adjectives followed by nouns
          const descriptiveStarters = [
            /^(wide|narrow|broad|limited|extensive|comprehensive|vast|huge|small|large|big|tiny)\s+(range|variety|selection|collection|array|set|number|amount|quantity)\s+(of\s+)?/i,
            /^(high|low|poor|good|excellent|bad|great|best|worst|better|best)\s+(quality|complexity|performance|design|customization|integration|interface|options?|features?|support|speed|reliability)\s*/i,
            /^(uninspired|inspired|creative|innovative|unique|standard|basic|advanced|simple|complex|sophisticated)\s+(design|interface|ui|ux|style|approach|solution)\s*/i,
            /^(quality|design|performance|features?|options?|customization|integration)\s+(concerns?|issues?|problems?|improvements?|enhancements?)\s*/i,
            /^(the\s+)?(rise|fall|decline|growth|emergence|evolution|development|history)\s+(of|in)\s+/i,
            /^(smartwatches?|headphones?|earbuds?|speakers?|devices?|products?|items?|tools?)\s*$/i, // Just product type
            /^(cost-effective|cost effective|cost-efficient|budget-friendly|affordable|expensive|premium)\s*$/i, // Price descriptors
            /^(comfort|discomfort|quality|performance|durability|reliability)\s+(issues?|problems?|concerns?)\s*$/i, // Issue descriptors
            /^(customer|client|user)\s+(service|support|care|satisfaction|experience)\s+(issues?|problems?|concerns?)?\s*$/i, // Service descriptors
            /^(customer|client|user)\s+(service|support|care|satisfaction|experience)\s*$/i, // Service descriptors without issues
          ];
          
          const isDescriptivePhrase = descriptiveStarters.some(pattern => pattern.test(brandName));
          if (isDescriptivePhrase && !isTrackedCompetitor) {
            console.log(`🚫 Skipped descriptive phrase: "${brandName}"`);
            continue;
          }
          
          // NEW: Check if it ends with common non-brand suffixes
          const nonBrandSuffixes = [
            /\s+(issues?|problems?|concerns?|complaints?|reviews?|ratings?)\s*$/i,
            /\s+(support|service|care|help|assistance)\s*$/i,
            /\s+(effective|efficient|friendly|compatible|compatible)\s*$/i,
            /\s+(series|pro|max|plus|mini|air|regular)\s*$/i, // Product model suffixes
            /\s+(watch|phone|tablet|laptop|computer|device|product|item)\s*$/i,
          ];
          
          if (nonBrandSuffixes.some(pattern => pattern.test(brandName)) && !isTrackedCompetitor) {
            // Exception: Allow if it's a known brand pattern like "Apple Watch" (but "Apple Watch Series" should be filtered)
            const knownBrandWithProduct = /^(apple|samsung|google|microsoft|sony|nike|adidas)\s+(watch|phone|tablet|laptop)\s*$/i.test(brandName);
            if (!knownBrandWithProduct) {
              console.log(`🚫 Skipped ends with non-brand suffix: "${brandName}"`);
              continue;
            }
          }
          
          // NEW: Check capitalization - real brand names are usually Proper Case or ALL CAPS
          // Skip if it's all lowercase or doesn't start with capital (unless it's a tracked competitor)
          const hasProperCapitalization = /^[A-Z]/.test(brandName) || /^[A-Z]+$/.test(brandName);
          if (!hasProperCapitalization && !isTrackedCompetitor) {
            // For multi-word phrases, require proper capitalization
            if (words.length > 1) {
              console.log(`🚫 Skipped improper capitalization (multi-word): "${brandName}"`);
              continue;
            }
            // For single words, require at least 4 characters and be a known brand pattern
            if (words.length === 1 && brandName.length < 4) {
              console.log(`🚫 Skipped too short and improper capitalization: "${brandName}"`);
              continue;
            }
          }
          
          // NEW: Additional check - skip if it's title case with common descriptive words (like "Comfort Issues")
          const titleCaseWithDescriptive = /^[A-Z][a-z]+\s+[A-Z][a-z]+$/.test(brandName);
          if (titleCaseWithDescriptive && words.length === 2) {
            const firstWord = words[0].toLowerCase();
            const secondWord = words[1].toLowerCase();
            const descriptiveFirstWords = new Set(['comfort', 'discomfort', 'quality', 'customer', 'client', 'user', 'cost', 'budget']);
            const descriptiveSecondWords = new Set(['issues', 'problems', 'concerns', 'complaints', 'service', 'support', 'care', 'effective', 'efficient']);
            
            if ((descriptiveFirstWords.has(firstWord) || descriptiveSecondWords.has(firstWord)) &&
                (descriptiveSecondWords.has(secondWord) || descriptiveFirstWords.has(secondWord))) {
              if (!isTrackedCompetitor) {
                console.log(`🚫 Skipped title case descriptive phrase: "${brandName}"`);
                continue;
              }
            }
          }
          
          // NEW: Skip if it contains too many generic descriptive words together
          const descriptiveWords = new Set([
            'wide', 'range', 'tools', 'uninspired', 'design', 'quality', 'concerns',
            'high', 'low', 'complexity', 'smartwatches', 'offering', 'organic', 'healthy',
            'natural', 'official', 'line', 'indian', 'shop', 'store', 'website', 'online',
            'treats', 'food', 'headphones', 'wireless', 'lack', 'poor', 'limited', 'absence',
            'missing', 'customization', 'integration', 'interface', 'options', 'user', 'men',
            'women', 'shoes', 'sneakers', 'running', 'rise', 'sneaker', 'culture', 'streetwear',
            'hype', 'becoming', 'luxury', 'cost', 'effective', 'efficient', 'comfort', 'issues',
            'problems', 'customer', 'service', 'support', 'care', 'satisfaction', 'experience',
            'series', 'watch', 'phone', 'tablet', 'laptop', 'device', 'product', 'item',
            'friendly', 'affordable', 'premium', 'budget', 'discomfort', 'durability', 'reliability'
          ]);
          const descriptiveWordCount = words.filter(word => descriptiveWords.has(word.toLowerCase())).length;
          if (words.length >= 2 && descriptiveWordCount >= words.length / 2 && !isTrackedCompetitor) {
            console.log(`🚫 Skipped too many descriptive words: "${brandName}"`);
            continue;
          }
          
          // NEW: Strict check - if it contains hyphenated descriptive terms, it's likely not a brand
          // Check for hyphenated descriptive terms (case-insensitive)
          const hyphenatedDescriptiveTerms = [
            'cost-effective', 'cost-efficient', 'budget-friendly', 'user-friendly', 
            'eco-friendly', 'energy-efficient', 'time-efficient', 'space-efficient',
            'cost-effective', 'cost efficient', 'budget friendly', 'user friendly', 'Functionality', 'budget', 'Learning Curve'
          ];
          const brandLowerHyphenated = brandName.toLowerCase().replace(/\s+/g, '-');
          if (hyphenatedDescriptiveTerms.some(term => brandLowerHyphenated === term || brandName.toLowerCase() === term.replace(/-/g, ' '))) {
            console.log(`🚫 Skipped hyphenated descriptive term: "${brandName}"`);
            continue;
          }
          
          // NEW: Check if it's a common issue/support phrase
          const issuePhrases = [
            /^(comfort|discomfort|quality|performance|durability|reliability|customer|client|user)\s+(issues?|problems?|concerns?|complaints?)\s*$/i,
            /^(customer|client|user)\s+(service|support|care|satisfaction|experience)\s*$/i,
          ];
          if (issuePhrases.some(pattern => pattern.test(brandName)) && !isTrackedCompetitor) {
            console.log(`🚫 Skipped issue/support phrase: "${brandName}"`);
            continue;
          }
          
          // NEW: Check if it contains product model identifiers (Series, Pro, Max, etc.) as standalone or with generic words
          // Even known brands with product model suffixes should be filtered - we want brand names, not product models
          if (/\s+(series|pro|max|plus|mini|air|regular|standard|premium|basic)\s*$/i.test(brandName)) {
            // Only allow if it's a tracked competitor (user explicitly tracks this specific model)
            if (!isTrackedCompetitor) {
              console.log(`🚫 Skipped product model identifier: "${brandName}"`);
              continue;
            }
          }
          
          // NEW: Only allow if it's a tracked competitor OR passes brand name validation
          // Brand name validation: proper case, reasonable length, not all generic words
          if (!isTrackedCompetitor) {
            // Additional check: skip if it's clearly a descriptive phrase with article titles
            if (/\s+(and|or|the|of|in|on|at|for|with|from|to|by)\s+/i.test(brandName) && words.length >= 3) {
              // Allow if it's a known brand pattern (like "The New York Times")
              const knownBrandPatterns = [
                /^the\s+[a-z]+\s+[a-z]+$/i, // "The Something Something" - might be a brand
              ];
              const isKnownBrandPattern = knownBrandPatterns.some(p => p.test(brandName));
              if (!isKnownBrandPattern) {
                console.log(`🚫 Skipped article-like phrase: "${brandName}"`);
                continue;
              }
            }
          }
          
          extractedBrands.push({ name: brandName, position, endPosition });
          console.log(`🏷️  Extracted brand from **: ${brandName} at position ${position}`);
        }

        // Calculate position ranking for all brands in this response
        // Sort all extracted brands by their position to determine ranking (1st, 2nd, 3rd, etc.)
        const sortedBrands = [...extractedBrands].sort((a, b) => a.position - b.position);
        
        // Create a map of brand name to rank position
        const brandRankMap = new Map<string, number>();
        sortedBrands.forEach((brand, index) => {
          const brandKey = brand.name.toLowerCase();
          // Rank is 1-based (1 = first, 2 = second, etc.)
          brandRankMap.set(brandKey, index + 1);
        });

        // Process each extracted brand as a competitor
        extractedBrands.forEach(brandInfo => {
          // Skip if it's the tracked brand
          if (brandInfo.name.toLowerCase() === mention.brand?.toLowerCase()) {
            return;
          }

          const key = brandInfo.name.toLowerCase();
          if (!competitorsMap.has(key)) {
            competitorsMap.set(key, {
              name: brandInfo.name,
              citationLinks: new Map(),
              searchQueries: new Set(),
              positions: [],
            });
          }

          const competitor = competitorsMap.get(key)!;
          
          // Add this search query to the set (tracks unique searches)
          const query = (mention.query || '').trim();
          if (query) {
            competitor.searchQueries.add(query);
          }
          
          // Track the position/rank for this competitor in this search
          const brandRank = brandRankMap.get(key);
          if (brandRank) {
            competitor.positions.push(brandRank);
          }
          
          // Find citations that are near this competitor mention
          // Look for citations within 300 characters before or after the competitor mention
          const citationWindow = 300;
          const competitorStart = brandInfo.position;
          const competitorEnd = brandInfo.endPosition;
          
          // Extract citations with position info from annotations
          const citationsWithPosition: Array<{ url: string; title?: string }> = [];
          
          // If we have annotations with position info, use those
          if (messageItem?.content?.[0]?.annotations && Array.isArray(messageItem.content[0].annotations)) {
            messageItem.content[0].annotations.forEach((ann: any) => {
              if (ann.type === 'url_citation' && ann.url) {
                const citationStart = ann.start_index || 0;
                const citationEnd = ann.end_index || 0;
                
                // Check if citation overlaps with or is near the competitor mention
                // Citation is considered "near" if it's within the window
                const citationCenter = (citationStart + citationEnd) / 2;
                const competitorCenter = (competitorStart + competitorEnd) / 2;
                
                if (Math.abs(citationCenter - competitorCenter) <= citationWindow) {
                  citationsWithPosition.push({
                    url: ann.url,
                    title: ann.title
                  });
                }
              }
            });
          }
          
          // If no position-based citations found, fall back to all URLs (for backward compatibility)
          // But only if we're not using annotations with positions
          if (citationsWithPosition.length === 0 && (!messageItem?.content?.[0]?.annotations || messageItem.content[0].annotations.length === 0)) {
            // Fallback: use all URLs if no annotation position data available
            urls.forEach(link => {
              if (link.url) {
                citationsWithPosition.push({
                  url: link.url,
                  title: link.title
                });
              }
            });
          }
          
          // Add only the relevant citation links for this competitor
          citationsWithPosition.forEach(link => {
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
      .map(comp => {
        // Calculate best position (lowest number = highest rank = best)
        const bestPosition = comp.positions.length > 0 
          ? Math.min(...comp.positions) 
          : null;
        
        return {
          competitorName: comp.name,
          citationLinks: Array.from(comp.citationLinks.values()),
          searchAppearances: comp.searchQueries.size, // Count of unique searches
          bestPosition: bestPosition, // Best position achieved (1 = first, lower is better)
        };
      })
      .filter(comp => comp.searchAppearances > 0) // Only show competitors that appeared in at least one search
      .sort((a, b) => {
        // Sort by best position first (lower is better), then by search appearances
        if (a.bestPosition !== null && b.bestPosition !== null) {
          return a.bestPosition - b.bestPosition; // Lower position = better
        }
        if (a.bestPosition !== null) return -1; // Has position comes first
        if (b.bestPosition !== null) return 1;
        return b.searchAppearances - a.searchAppearances; // Then by search appearances
      });

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
    // Use visibleCompetitors (excluding deleted ones)
    const uniqueCompetitors = new Set((visibleCompetitors || [])
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
  }, [timeRange, topSources, visibleCompetitors, chartMentionsRaw]);

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
    if (!chartMentionsRaw || chartMentionsRaw.length === 0) {
      console.log("⚠️ No chart mentions data for new domains detection");
      return [];
    }
    
    const ref = new Date();
    const days = timeRange === "90d" ? 90 : timeRange === "7d" ? 7 : 30;
    const since = new Date(ref); 
    since.setDate(ref.getDate() - days);
    
    console.log(`📅 New domains check: timeRange=${timeRange}, days=${days}, since=${since.toISOString()}, total mentions=${chartMentionsRaw.length}`);
    
    // Extract all domains from citations in mentions before the time range (prior domains)
    const priorDomains = new Set<string>();
    let priorMentionCount = 0;
    chartMentionsRaw.forEach((mention: any) => {
      const mentionDate = new Date(mention.created_at);
      if (mentionDate < since) {
        priorMentionCount++;
        // Extract URLs using the helper function
        const urls = extractUrlsFromMention(mention);
        
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
    let inRangeMentionCount = 0;
    let inRangeMentionsWithUrls = 0;
    chartMentionsRaw.forEach((mention: any) => {
      const mentionDate = new Date(mention.created_at);
      if (mentionDate >= since) {
        inRangeMentionCount++;
        // Extract URLs using the helper function
        const urls = extractUrlsFromMention(mention);
        
        if (urls.length > 0) {
          inRangeMentionsWithUrls++;
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
    
    console.log(`🔍 New domains analysis:`, {
      priorMentions: priorMentionCount,
      priorDomains: priorDomains.size,
      inRangeMentions: inRangeMentionCount,
      inRangeMentionsWithUrls: inRangeMentionsWithUrls,
      inRangeDomains: inRangeDomains.size,
      newDomains: newDomainsList.length,
      newDomainsList: newDomainsList.slice(0, 5) // Show first 5 for debugging
    });
    
    return newDomainsList.slice(0, 8);
  }, [chartMentionsRaw, timeRange]);

  // Top Movers: Brands/Competitors with fastest growth (week-over-week comparison)
  const topMovers = React.useMemo(() => {
    if (!chartMentionsRaw || chartMentionsRaw.length === 0) return [] as { name: string; currentWeek: number; previousWeek: number; growth: number; trend: 'up' | 'down' }[];
    
    const ref = new Date();
    const currentWeekStart = new Date(ref);
    currentWeekStart.setDate(ref.getDate() - 7);
    const previousWeekStart = new Date(ref);
    previousWeekStart.setDate(ref.getDate() - 14);
    
    // Track mentions by brand name in current week and previous week
    const brandMentions = new Map<string, { current: number; previous: number }>();
    
    chartMentionsRaw.forEach((mention: any) => {
      const mentionDate = new Date(mention.created_at);
      const brand = (mention.brand || '').toLowerCase().trim();
      if (!brand) return;
      
      if (mentionDate >= currentWeekStart) {
        const entry = brandMentions.get(brand) || { current: 0, previous: 0 };
        entry.current += 1;
        brandMentions.set(brand, entry);
      } else if (mentionDate >= previousWeekStart && mentionDate < currentWeekStart) {
        const entry = brandMentions.get(brand) || { current: 0, previous: 0 };
        entry.previous += 1;
        brandMentions.set(brand, entry);
      }
    });
    
    // Calculate growth percentage and sort
    const movers = Array.from(brandMentions.entries())
      .filter(([_, counts]) => counts.current > 0 || counts.previous > 0)
      .map(([name, counts]) => {
        const growth = counts.previous > 0 
          ? ((counts.current - counts.previous) / counts.previous) * 100
          : counts.current > 0 ? 1000 : 0; // Infinite growth if no previous mentions
        
        return {
          name: name.charAt(0).toUpperCase() + name.slice(1), // Capitalize first letter
          currentWeek: counts.current,
          previousWeek: counts.previous,
          growth: growth,
          trend: counts.current >= counts.previous ? 'up' as const : 'down' as const
        };
      })
      .sort((a, b) => Math.abs(b.growth) - Math.abs(a.growth)) // Sort by absolute growth
      .slice(0, 10); // Top 10 movers
    
    return movers;
  }, [chartMentionsRaw]);

  // Spikes Detection: Days with unusual mention activity (detect significant increases)
  const mentionSpikes = React.useMemo(() => {
    if (!chartMentionsRaw || chartMentionsRaw.length === 0) return [] as { date: string; mentions: number; avgMentions: number; spikeRatio: number }[];
    
    // Calculate average mentions per day
    const ref = new Date();
    const days = timeRange === "90d" ? 90 : timeRange === "7d" ? 7 : 30;
    const since = new Date(ref);
    since.setDate(ref.getDate() - days);
    
    const dayMap = new Map<string, number>();
    let totalMentions = 0;
    
    chartMentionsRaw.forEach((mention: any) => {
      const d = new Date(mention.created_at);
      if (d < since) return;
      const key = d.toISOString().split('T')[0];
      const count = dayMap.get(key) || 0;
      dayMap.set(key, count + 1);
      totalMentions += 1;
    });
    
    const avgMentionsPerDay = totalMentions / Math.max(1, dayMap.size);
    const threshold = avgMentionsPerDay * 2; // Spike = 2x average
    
    const spikes = Array.from(dayMap.entries())
      .filter(([_, count]) => count >= threshold)
      .map(([date, mentions]) => ({
        date,
        mentions,
        avgMentions: avgMentionsPerDay,
        spikeRatio: mentions / avgMentionsPerDay
      }))
      .sort((a, b) => b.spikeRatio - a.spikeRatio) // Highest spike ratio first
      .slice(0, 5); // Top 5 spikes
    
    return spikes;
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

  // Reset page when category filter changes
  React.useEffect(() => {
    setCurrentSourcesPage(1);
  }, [selectedCategory]);

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
        <div className="flex items-center gap-2">
          <Button 
            onClick={handleRealtimeCheck} 
            disabled={realtimeChecking || loading}
            variant="default"
            size="sm"
            className="bg-primary hover:bg-primary/90"
          >
            <Zap className={`w-4 h-4 mr-2 ${realtimeChecking ? 'animate-pulse' : ''}`} />
            {realtimeChecking ? 'Checking...' : 'Check Now (Real-time)'}
          </Button>
          <Button 
            onClick={fetchDashboardData} 
            disabled={loading}
            variant="outline"
            size="sm"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Real-time Check Results */}
      {realtimeResults.length > 0 && (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-primary" />
                <CardTitle>Real-time Check Results</CardTitle>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setRealtimeResults([])}
              >
                Clear
              </Button>
            </div>
            <CardDescription>
              Latest real-time mentions check - {new Date(realtimeResults[0]?.timestamp).toLocaleString()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {realtimeResults.map((result, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 rounded-lg border bg-card"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{result.brand}</span>
                      <Badge variant={result.mentioned ? "default" : "secondary"}>
                        {result.mentioned ? "Mentioned" : "Not Found"}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{result.query}</p>
                    {result.evidence && (
                      <p className="text-xs text-muted-foreground mt-1 italic">
                        {result.evidence.slice(0, 100)}...
                      </p>
                    )}
                    {result.sources && result.sources.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {result.sources.slice(0, 3).map((source: any, idx: number) => (
                          <a
                            key={idx}
                            href={source.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-primary hover:underline flex items-center gap-1"
                          >
                            <ExternalLink className="w-3 h-3" />
                            {source.title || source.url.slice(0, 30)}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                  {result.mentioned ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <XCircle className="w-5 h-5 text-gray-400" />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

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

      {/* New Features Row: Top Movers & Spikes Detection */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Movers Widget */}
        <Card>
          <CardHeader className="border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-500" />
                <CardTitle>Top Movers</CardTitle>
              </div>
              <Badge variant="secondary" className="ml-auto">
                Week-over-week growth
              </Badge>
            </div>
            <CardDescription>
              Brands with fastest growth in mentions
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {topMovers.length > 0 ? (
              <div className="divide-y">
                {topMovers.slice(0, 5).map((mover, index) => (
                  <div key={index} className="p-4 hover:bg-muted/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
                          mover.trend === 'up' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {index + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm truncate">{mover.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {mover.currentWeek} this week vs {mover.previousWeek} last week
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {mover.trend === 'up' ? (
                          <TrendingUp className="w-4 h-4 text-green-600" />
                        ) : (
                          <TrendingDown className="w-4 h-4 text-red-600" />
                        )}
                        <span className={`text-sm font-bold ${
                          mover.trend === 'up' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {mover.growth > 1000 ? '∞' : mover.growth > 0 ? `+${mover.growth.toFixed(0)}%` : `${mover.growth.toFixed(0)}%`}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <Zap className="w-12 h-12 mb-4 opacity-50" />
                <p className="font-medium">No growth data yet</p>
                <p className="text-sm mt-1">Data will appear after tracking for 2+ weeks</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Spikes Detection Card */}
        <Card>
          <CardHeader className="border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-orange-500" />
                <CardTitle>Mention Spikes</CardTitle>
              </div>
              <Badge variant="secondary" className="ml-auto">
                Unusual activity
              </Badge>
            </div>
            <CardDescription>
              Days with significantly higher mention activity
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {mentionSpikes.length > 0 ? (
              <div className="divide-y">
                {mentionSpikes.map((spike, index) => (
                  <div key={index} className="p-4 hover:bg-muted/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-100 text-orange-700 text-xs font-bold">
                          <Flame className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm">
                            {new Date(spike.date).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {spike.mentions} mentions ({spike.spikeRatio.toFixed(1)}x average)
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-orange-600" />
                        <Badge variant="outline" className="border-orange-300 text-orange-700">
                          {spike.spikeRatio.toFixed(1)}x
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <Activity className="w-12 h-12 mb-4 opacity-50" />
                <p className="font-medium">No spikes detected</p>
                <p className="text-sm mt-1">Activity is within normal range</p>
              </div>
            )}
          </CardContent>
        </Card>
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

      {/* Source Categories Breakdown */}
      {categoryBreakdown.length > 0 && (
        <Card>
          <CardHeader className="border-b">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              <CardTitle>Source Categories</CardTitle>
            </div>
            <CardDescription>
              Distribution of mentions by source type
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {categoryBreakdown.map((cat) => {
                const categoryColors: Record<string, { bg: string; text: string; border: string }> = {
                  'News': { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
                  'Blog': { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
                  'Forum': { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
                  'Social': { bg: 'bg-pink-50', text: 'text-pink-700', border: 'border-pink-200' },
                  'E-commerce': { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
                  'Tech': { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200' },
                  'Educational': { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
                  'Government': { bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200' },
                  'Other': { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200' },
                };
                const colors = categoryColors[cat.category] || categoryColors['Other'];
                
                return (
                  <div 
                    key={cat.category}
                    className={`p-4 rounded-lg border-2 ${colors.border} ${colors.bg} cursor-pointer hover:scale-105 transition-transform ${
                      selectedCategory === cat.category ? 'ring-2 ring-primary ring-offset-2' : ''
                    }`}
                    onClick={() => setSelectedCategory(cat.category === selectedCategory ? 'all' : cat.category)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className={`font-semibold text-sm ${colors.text}`}>
                        {cat.category}
                      </span>
                      <Badge variant="outline" className={`${colors.border} ${colors.text}`}>
                        {cat.domains}
                      </Badge>
                    </div>
                    <p className={`text-2xl font-bold ${colors.text}`}>
                      {cat.mentions}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">mentions</p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Top Sources - Full Width */}
      {/* Top Sources - Full Width Data Table */}
      <Card>
        <CardHeader className="border-b">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <Globe className="w-5 h-5" />
              <CardTitle>Top Sources</CardTitle>
            </div>
            <div className="flex items-center gap-3">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categoryBreakdown.map((cat) => (
                    <SelectItem key={cat.category} value={cat.category}>
                      {cat.category} ({cat.domains})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Badge variant="secondary" className="ml-auto">
                {filteredTopSources.length} {filteredTopSources.length === 1 ? 'domain' : 'domains'}
                {selectedCategory !== "all" && ` (${topSources.length} total)`}
              </Badge>
            </div>
          </div>
          <CardDescription>
            Most referenced domains from brand mentions
            {selectedCategory !== "all" && ` - Filtered by: ${selectedCategory}`}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {filteredTopSources.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[60px]">Rank</TableHead>
                    <TableHead className="w-[80px]"></TableHead>
                    <TableHead className="min-w-[250px]">Domain & Category</TableHead>
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
                        <div className="flex items-center gap-2 flex-wrap">
                          <Globe className="h-4 w-4 text-muted-foreground" />
                          <span>{source.domain}</span>
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${
                              source.category === 'News' ? 'border-blue-300 text-blue-700 bg-blue-50' :
                              source.category === 'Blog' ? 'border-purple-300 text-purple-700 bg-purple-50' :
                              source.category === 'Forum' ? 'border-orange-300 text-orange-700 bg-orange-50' :
                              source.category === 'Social' ? 'border-pink-300 text-pink-700 bg-pink-50' :
                              source.category === 'E-commerce' ? 'border-green-300 text-green-700 bg-green-50' :
                              source.category === 'Tech' ? 'border-indigo-300 text-indigo-700 bg-indigo-50' :
                              source.category === 'Educational' ? 'border-amber-300 text-amber-700 bg-amber-50' :
                              source.category === 'Government' ? 'border-slate-300 text-slate-700 bg-slate-50' :
                              'border-gray-300 text-gray-700 bg-gray-50'
                            }`}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedCategory(source.category === selectedCategory ? 'all' : source.category);
                            }}
                          >
                            {source.category}
                          </Badge>
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
                <p className="font-medium">
                  {selectedCategory !== "all" 
                    ? `No ${selectedCategory} sources found` 
                    : "No source data available yet"}
                </p>
                <p className="text-sm mt-1">
                  {selectedCategory !== "all"
                    ? `Try selecting a different category or view all sources`
                    : "Sources will appear after brand mentions are found"}
                </p>
              </div>
            )}
          
          {/* Pagination Controls */}
          {filteredTopSources.length > sourcesPerPage && (
            <div className="flex items-center justify-between border-t px-6 py-4">
              <div className="text-sm text-muted-foreground">
                Showing {((currentSourcesPage - 1) * sourcesPerPage) + 1} to {Math.min(currentSourcesPage * sourcesPerPage, filteredTopSources.length)} of {filteredTopSources.length} sources
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
              {visibleCompetitors.length} {visibleCompetitors.length === 1 ? 'competitor' : 'competitors'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {visibleCompetitors.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-[200px]">Competitor Name</TableHead>
                      <TableHead>Citation Links</TableHead>
                      <TableHead className="w-[120px] text-center">Best Position</TableHead>
                      <TableHead className="w-[150px] text-center">Search Appearances</TableHead>
                      <TableHead className="w-[60px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {visibleCompetitors
                      .slice((currentCompetitorsPage - 1) * competitorsPerPage, currentCompetitorsPage * competitorsPerPage)
                      .map((competitor, index) => (
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
                        {competitor.bestPosition !== null ? (
                          <Badge 
                            variant={competitor.bestPosition <= 3 ? "default" : "secondary"} 
                            className="font-mono"
                          >
                            #{competitor.bestPosition}
                          </Badge>
                        ) : (
                          <span className="text-xs text-muted-foreground">N/A</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="secondary" className="font-mono">
                          {competitor.searchAppearances}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => handleDeleteCompetitor(competitor.competitorName)}
                          title="Remove competitor"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              </div>
              
              {/* Pagination Controls */}
              {visibleCompetitors.length > competitorsPerPage && (
                <div className="flex items-center justify-between border-t px-6 py-4">
                  <div className="text-sm text-muted-foreground">
                    Showing {((currentCompetitorsPage - 1) * competitorsPerPage) + 1} to {Math.min(currentCompetitorsPage * competitorsPerPage, visibleCompetitors.length)} of {visibleCompetitors.length} competitors
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentCompetitorsPage(p => Math.max(1, p - 1))}
                      disabled={currentCompetitorsPage === 1}
                    >
                      Previous
                    </Button>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(5, Math.ceil(visibleCompetitors.length / competitorsPerPage)) }, (_, i) => {
                        const totalCompetitorsPages = Math.ceil(visibleCompetitors.length / competitorsPerPage);
                        let pageNum;
                        if (totalCompetitorsPages <= 5) {
                          pageNum = i + 1;
                        } else if (currentCompetitorsPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentCompetitorsPage >= totalCompetitorsPages - 2) {
                          pageNum = totalCompetitorsPages - 4 + i;
                        } else {
                          pageNum = currentCompetitorsPage - 2 + i;
                        }
                        return (
                          <Button
                            key={pageNum}
                            variant={currentCompetitorsPage === pageNum ? "default" : "outline"}
                            size="sm"
                            className="w-10"
                            onClick={() => setCurrentCompetitorsPage(pageNum)}
                          >
                            {pageNum}
                          </Button>
                        );
                      })}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentCompetitorsPage(p => Math.min(Math.ceil(visibleCompetitors.length / competitorsPerPage), p + 1))}
                      disabled={currentCompetitorsPage === Math.ceil(visibleCompetitors.length / competitorsPerPage)}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Target className="w-12 h-12 mb-4 opacity-50" />
              <p className="font-medium">
                {competitors.length > 0 
                  ? "All competitors have been removed" 
                  : "No competitor data available yet"}
              </p>
              <p className="text-sm mt-1">
                {competitors.length > 0 
                  ? "Refresh the page to see all competitors again" 
                  : "Competitors will appear as searches are performed"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

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