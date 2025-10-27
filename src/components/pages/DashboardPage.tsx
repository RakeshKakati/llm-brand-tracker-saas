"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  AlertCircle
} from "lucide-react";
import { supabase } from "@/app/lib/supabaseClient";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart-config";
import { AreaChart as RechartsAreaChart, Area, CartesianGrid, XAxis } from "recharts";

interface SourceData {
  domain: string;
  url: string;
  count: number;
  queries: string[];
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
  const [loading, setLoading] = useState(true);

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

    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const processTopSources = (mentions: any[]): SourceData[] => {
    console.log("🔍 Processing top sources from", mentions.length, "mentions");
    const sourcesMap = new Map<string, { url: string; count: number; queries: Set<string> }>();

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
                url: url,
                count: 0,
                queries: new Set(),
              });
            }

            const source = sourcesMap.get(domain)!;
            source.count += 1;
            if (mention.query) {
              source.queries.add(mention.query);
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
        url: data.url,
        count: data.count,
        queries: Array.from(data.queries),
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10); // Top 10 sources

    console.log("📊 Top sources found:", results.length);
    return results;
  };

  const chartConfig = {
    value: {
      label: "Mentions",
      color: "hsl(var(--chart-1))",
    },
  };

  const StatCard = ({ title, value, icon: Icon, trend, color, description }: any) => (
    <Card className="p-6 hover:shadow-lg transition-shadow border-2 hover:border-primary/20">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <div className="flex items-baseline gap-2 mt-2">
            <p className="text-3xl font-bold">{value}</p>
            {trend && (
              <div className={`flex items-center gap-1 ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {trend > 0 ? (
                  <ArrowUpRight className="w-4 h-4" />
                ) : (
                  <ArrowDownRight className="w-4 h-4" />
                )}
                <span className="text-sm font-medium">{Math.abs(trend)}%</span>
              </div>
            )}
          </div>
          {description && (
            <p className="text-xs text-muted-foreground mt-2">{description}</p>
          )}
        </div>
        <div className={`p-4 rounded-xl ${color} shadow-sm`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
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
    <div className="p-8 max-w-[1400px] mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight mb-2">Dashboard</h1>
          <p className="text-muted-foreground">Monitor your brand mentions and tracking performance</p>
        </div>
        <Button className="gap-2">
          <Activity className="w-4 h-4" />
          Refresh Data
        </Button>
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

      {/* Charts and Data */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Mention Trend Chart */}
        <Card className="lg:col-span-2 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold mb-1">Mention Trends</h2>
              <p className="text-sm text-muted-foreground">Activity over the last 7 days</p>
            </div>
            <Badge variant="outline" className="gap-2">
              <TrendingUp className="w-3 h-3" />
              +12% this week
            </Badge>
          </div>
          
          {mentionTrend.length > 0 ? (
            <div className="h-[300px]">
              <RechartsAreaChart data={mentionTrend}>
                <defs>
                  <linearGradient id="fillValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tickLine={false} axisLine={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area
                  dataKey="value"
                  type="natural"
                  fill="url(#fillValue)"
                  fillOpacity={0.4}
                  stroke="#3b82f6"
                  strokeWidth={2}
                />
              </RechartsAreaChart>
            </div>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <AlertCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No data available yet</p>
              </div>
            </div>
          )}
        </Card>

        {/* Recent Mentions */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold mb-1">Recent Activity</h2>
              <p className="text-sm text-muted-foreground">Latest brand mentions</p>
            </div>
          </div>
          
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
        </Card>

        {/* Top Sources */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold mb-1">Top Sources</h2>
              <p className="text-sm text-muted-foreground">Most referenced domains</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            {topSources.length > 0 ? (
              <table className="w-full table-fixed">
                <thead>
                  <tr className="border-b">
                    <th className="w-1/3 text-left py-3 px-4 text-sm font-medium text-muted-foreground">Source Domain</th>
                    <th className="w-24 text-center py-3 px-4 text-sm font-medium text-muted-foreground">Mentions</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Queries</th>
                  </tr>
                </thead>
                <tbody>
                  {topSources.map((source, index) => (
                    <tr key={index} className="border-b last:border-b-0 hover:bg-muted/50 transition-colors">
                      <td className="py-4 px-4 w-1/3">
                        <a 
                          href={source.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 hover:underline inline-flex items-center gap-2"
                        >
                          <span className="font-medium truncate">{source.domain}</span>
                          <ArrowUpRight className="w-4 h-4 flex-shrink-0" />
                        </a>
                      </td>
                      <td className="py-4 px-4 text-center w-24">
                        <Badge variant="outline" className="font-mono">
                          {source.count}
                        </Badge>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex flex-wrap gap-2">
                          {source.queries.slice(0, 3).map((query, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              {query.length > 30 ? query.substring(0, 30) + '...' : query}
                            </Badge>
                          ))}
                          {source.queries.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{source.queries.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <BarChart3 className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No source data available yet</p>
                <p className="text-xs mt-1">Sources will appear after brand mentions are found</p>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100/50 border-blue-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-600 rounded-lg">
              <Target className="w-6 h-6 text-white" />
            </div>
            <Badge variant="outline">Daily</Badge>
          </div>
          <h3 className="text-lg font-semibold mb-1">Check Frequency</h3>
          <p className="text-sm text-muted-foreground mb-4">Automated checks run daily at 9 AM UTC</p>
          <Button variant="outline" size="sm" className="w-full">
            Configure Schedule
          </Button>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100/50 border-green-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-600 rounded-lg">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <Badge variant="outline">Active</Badge>
          </div>
          <h3 className="text-lg font-semibold mb-1">System Status</h3>
          <p className="text-sm text-muted-foreground mb-4">All systems operational</p>
          <Button variant="outline" size="sm" className="w-full">
            View Logs
          </Button>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-purple-50 to-purple-100/50 border-purple-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-600 rounded-lg">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <Badge variant="outline">View</Badge>
          </div>
          <h3 className="text-lg font-semibold mb-1">Analytics</h3>
          <p className="text-sm text-muted-foreground mb-4">Detailed insights and reports</p>
          <Button variant="outline" size="sm" className="w-full">
            Explore Analytics
          </Button>
        </Card>
      </div>
    </div>
  );
}