"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  Activity,
  Target,
  Calendar,
  MapPin,
  Clock,
  Loader2,
  RefreshCw
} from "lucide-react";
import { supabase } from "@/app/lib/supabaseClient";

interface AnalyticsData {
  totalChecks: number;
  mentionsFound: number;
  mentionRate: number;
  activeTrackers: number;
  topBrands: Array<{
    name: string;
    mentions: number;
    checks: number;
    rate: number;
  }>;
  weeklyTrend: Array<{
    day: string;
    checks: number;
    mentions: number;
  }>;
  mentionPositions: Array<{
    brand: string;
    position: number;
    totalLength: number;
    percentage: number;
  }>;
}

export default function AnalyticsPage() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      
      // Fetch all brand mentions
      const { data: mentions, error: mentionsError } = await supabase
        .from("brand_mentions")
        .select("*")
        .order("created_at", { ascending: false });

      if (mentionsError) throw mentionsError;

      // Fetch all tracked brands
      const { data: trackers, error: trackersError } = await supabase
        .from("tracked_brands")
        .select("*");

      if (trackersError) throw trackersError;

      // Process the data
      const totalChecks = mentions?.length || 0;
      const mentionsFound = mentions?.filter(m => m.mentioned).length || 0;
      const mentionRate = totalChecks > 0 ? (mentionsFound / totalChecks) * 100 : 0;
      const activeTrackers = trackers?.filter(t => t.active).length || 0;

      // Calculate top brands
      const brandStats = new Map();
      mentions?.forEach(mention => {
        const brand = mention.brand;
        if (!brandStats.has(brand)) {
          brandStats.set(brand, { mentions: 0, checks: 0 });
        }
        const stats = brandStats.get(brand);
        stats.checks++;
        if (mention.mentioned) {
          stats.mentions++;
        }
      });

      const topBrands = Array.from(brandStats.entries())
        .map(([name, stats]) => ({
          name,
          mentions: stats.mentions,
          checks: stats.checks,
          rate: stats.checks > 0 ? (stats.mentions / stats.checks) * 100 : 0
        }))
        .sort((a, b) => b.mentions - a.mentions)
        .slice(0, 5);

      // Calculate weekly trend (last 7 days)
      const weeklyTrend = [];
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const now = new Date();
      
      for (let i = 6; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        const dayStart = new Date(date);
        dayStart.setHours(0, 0, 0, 0);
        const dayEnd = new Date(date);
        dayEnd.setHours(23, 59, 59, 999);

        const dayMentions = mentions?.filter(m => {
          const mentionDate = new Date(m.created_at);
          return mentionDate >= dayStart && mentionDate <= dayEnd;
        }) || [];

        const dayChecks = dayMentions.length;
        const dayMentionsFound = dayMentions.filter(m => m.mentioned).length;

        weeklyTrend.push({
          day: days[date.getDay()],
          checks: dayChecks,
          mentions: dayMentionsFound
        });
      }

      // Calculate mention positions in OpenAI responses
      const mentionPositions = [];
      mentions?.filter(m => m.mentioned && m.evidence && m.evidence !== "No mention found").forEach(mention => {
        if (mention.raw_output) {
          const brandLower = mention.brand.toLowerCase();
          const responseLower = mention.raw_output.toLowerCase();
          const position = responseLower.indexOf(brandLower);
          
          if (position !== -1) {
            const totalLength = mention.raw_output.length;
            const percentage = (position / totalLength) * 100;
            
            mentionPositions.push({
              brand: mention.brand,
              position,
              totalLength,
              percentage
            });
          }
        }
      });

      setAnalyticsData({
        totalChecks,
        mentionsFound,
        mentionRate,
        activeTrackers,
        topBrands,
        weeklyTrend,
        mentionPositions: mentionPositions.slice(0, 10) // Show top 10
      });

    } catch (error) {
      console.error("Error fetching analytics data:", error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon: Icon, trend, color }: any) => (
    <Card className="p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {trend && (
            <div className="flex items-center mt-1">
              {trend > 0 ? (
                <TrendingUp className="w-3 h-3 text-green-500 mr-1" />
              ) : (
                <TrendingDown className="w-3 h-3 text-red-500 mr-1" />
              )}
              <span className={`text-xs ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {Math.abs(trend)}%
              </span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </Card>
  );

  if (loading) {
    return (
      <div className="p-8 max-w-7xl mx-auto">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-gray-600" />
            <p className="text-gray-600">Loading analytics data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="p-8 max-w-7xl mx-auto">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics</h1>
          <p className="text-gray-600">No data available yet. Create some trackers to see analytics!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics</h1>
            <p className="text-gray-600">Real-time brand mention performance and trends</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm text-gray-500">Last updated</p>
              <p className="text-xs text-gray-400">{lastRefresh.toLocaleTimeString()}</p>
            </div>
            <button
              onClick={async () => {
                console.log("🔄 Manual refresh triggered");
                await fetchAnalyticsData();
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

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Checks"
          value={analyticsData.totalChecks}
          icon={Activity}
          color="bg-blue-500"
        />
        <StatCard
          title="Mentions Found"
          value={analyticsData.mentionsFound}
          icon={Target}
          color="bg-green-500"
        />
        <StatCard
          title="Mention Rate"
          value={`${analyticsData.mentionRate.toFixed(1)}%`}
          icon={BarChart3}
          color="bg-purple-500"
        />
        <StatCard
          title="Active Trackers"
          value={analyticsData.activeTrackers}
          icon={Calendar}
          color="bg-orange-500"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Weekly Trend */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-6">
            <BarChart3 className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">Weekly Activity</h2>
          </div>
          
          <div className="space-y-4">
            {analyticsData.weeklyTrend.map((day) => {
              const maxChecks = Math.max(...analyticsData.weeklyTrend.map(d => d.checks), 1);
              const maxMentions = Math.max(...analyticsData.weeklyTrend.map(d => d.mentions), 1);
              
              return (
                <div key={day.day} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 text-sm font-medium text-gray-600">{day.day}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="h-2 bg-gray-200 rounded-full flex-1">
                          <div 
                            className="h-2 bg-blue-500 rounded-full" 
                            style={{ width: `${(day.checks / maxChecks) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-xs text-gray-500">{day.checks}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="h-1 bg-gray-200 rounded-full flex-1">
                          <div 
                            className="h-1 bg-green-500 rounded-full" 
                            style={{ width: `${(day.mentions / maxMentions) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-xs text-gray-500">{day.mentions}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className="flex items-center gap-4 mt-4 text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              Checks
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              Mentions
            </div>
          </div>
        </Card>

        {/* Top Brands */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-6">
            <Target className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">Top Performing Brands</h2>
          </div>
          
          <div className="space-y-4">
            {analyticsData.topBrands.length > 0 ? (
              analyticsData.topBrands.map((brand, index) => (
                <div key={brand.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-xs font-medium text-gray-600">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{brand.name}</p>
                      <p className="text-xs text-gray-500">{brand.checks} checks</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant="default">{brand.mentions} mentions</Badge>
                    <p className="text-xs text-gray-500 mt-1">
                      {brand.rate.toFixed(1)}% rate
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Target className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No brand data yet</p>
                <p className="text-sm">Create trackers to see brand performance</p>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Mention Positions */}
      <Card className="p-6 mt-8">
        <div className="flex items-center gap-2 mb-6">
          <MapPin className="w-5 h-5 text-gray-600" />
          <h2 className="text-lg font-semibold text-gray-900">Mention Positions in OpenAI Responses</h2>
        </div>
        
        <div className="space-y-4">
          {analyticsData.mentionPositions.length > 0 ? (
            analyticsData.mentionPositions.map((mention, index) => (
              <div key={index} className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-gray-900">{mention.brand}</h3>
                  <Badge variant="secondary">
                    Position {mention.position} of {mention.totalLength}
                  </Badge>
                </div>
                
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-2 bg-gray-200 rounded-full flex-1">
                    <div 
                      className="h-2 bg-green-500 rounded-full" 
                      style={{ width: `${mention.percentage}%` }}
                    ></div>
                  </div>
                  <span className="text-xs text-gray-500">{mention.percentage.toFixed(1)}%</span>
                </div>
                
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Early in response
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    Character {mention.position}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              <MapPin className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No mention position data yet</p>
              <p className="text-sm">Mentions will show their position in OpenAI responses</p>
            </div>
          )}
        </div>
      </Card>

      {/* Insights */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-gray-600" />
          <h2 className="text-lg font-semibold text-gray-900">Insights</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {analyticsData.weeklyTrend.length > 0 && (() => {
            const bestDay = analyticsData.weeklyTrend.reduce((best, day) => {
              const dayRate = day.checks > 0 ? (day.mentions / day.checks) * 100 : 0;
              const bestRate = best.checks > 0 ? (best.mentions / best.checks) * 100 : 0;
              return dayRate > bestRate ? day : best;
            });
            const bestDayRate = bestDay.checks > 0 ? (bestDay.mentions / bestDay.checks) * 100 : 0;
            
            return (
              <div className="p-4 bg-green-50 rounded-lg">
                <h3 className="font-medium text-green-900 mb-2">Best Performing Day</h3>
                <p className="text-sm text-green-700">
                  {bestDay.day} shows the highest mention rate with {bestDayRate.toFixed(1)}% success rate
                </p>
              </div>
            );
          })()}
          
          {analyticsData.topBrands.length > 0 && (
            <div className="p-4 bg-blue-50 rounded-lg">
              <h3 className="font-medium text-blue-900 mb-2">Top Brand</h3>
              <p className="text-sm text-blue-700">
                {analyticsData.topBrands[0].name} has the highest mention rate at {analyticsData.topBrands[0].rate.toFixed(1)}%
              </p>
            </div>
          )}
          
          {analyticsData.mentionPositions.length > 0 && (() => {
            const avgPosition = analyticsData.mentionPositions.reduce((sum, pos) => sum + pos.percentage, 0) / analyticsData.mentionPositions.length;
            
            return (
              <div className="p-4 bg-purple-50 rounded-lg">
                <h3 className="font-medium text-purple-900 mb-2">Mention Positioning</h3>
                <p className="text-sm text-purple-700">
                  Brands are mentioned on average at {avgPosition.toFixed(1)}% through the response
                </p>
              </div>
            );
          })()}
          
          {analyticsData.totalChecks === 0 && (
            <div className="p-4 bg-gray-50 rounded-lg col-span-2">
              <h3 className="font-medium text-gray-900 mb-2">Get Started</h3>
              <p className="text-sm text-gray-700">
                Create your first brand tracker to start seeing analytics and insights!
              </p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
