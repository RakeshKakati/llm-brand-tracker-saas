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
  BarChart3
} from "lucide-react";
import { supabase } from "@/app/lib/supabaseClient";

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalTrackers: 0,
    activeTrackers: 0,
    totalMentions: 0,
    recentMentions: 0
  });
  const [recentMentions, setRecentMentions] = useState<any[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch tracked brands count
      const { count: trackersCount } = await supabase
        .from("tracked_brands")
        .select("*", { count: "exact", head: true });

      // Fetch active trackers count
      const { count: activeCount } = await supabase
        .from("tracked_brands")
        .select("*", { count: "exact", head: true })
        .eq("active", true);

      // Fetch total mentions count
      const { count: mentionsCount } = await supabase
        .from("brand_mentions")
        .select("*", { count: "exact", head: true });

      // Fetch recent mentions (last 24 hours)
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      const { count: recentCount } = await supabase
        .from("brand_mentions")
        .select("*", { count: "exact", head: true })
        .gte("created_at", yesterday.toISOString());

      // Fetch recent mentions for display
      const { data: recentData } = await supabase
        .from("brand_mentions")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(5);

      setStats({
        totalTrackers: trackersCount || 0,
        activeTrackers: activeCount || 0,
        totalMentions: mentionsCount || 0,
        recentMentions: recentCount || 0
      });

      setRecentMentions(recentData || []);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
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
              <TrendingUp className="w-3 h-3 text-green-500 mr-1" />
              <span className="text-xs text-green-600">{trend}</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </Card>
  );

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">Monitor your brand mentions and tracking performance</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Trackers"
          value={stats.totalTrackers}
          icon={Activity}
          color="bg-blue-500"
        />
        <StatCard
          title="Active Trackers"
          value={stats.activeTrackers}
          icon={Eye}
          color="bg-green-500"
        />
        <StatCard
          title="Total Mentions"
          value={stats.totalMentions}
          icon={BarChart3}
          color="bg-purple-500"
        />
        <StatCard
          title="Recent Mentions"
          value={stats.recentMentions}
          icon={Clock}
          color="bg-orange-500"
          trend="+12% this week"
        />
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Mentions</h2>
            <Button variant="outline" size="sm">View All</Button>
          </div>
          <div className="space-y-4">
            {recentMentions.map((mention) => (
              <div key={mention.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  {mention.mentioned ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-500" />
                  )}
                  <div>
                    <p className="font-medium text-gray-900">{mention.brand}</p>
                    <p className="text-sm text-gray-600">{mention.query}</p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant={mention.mentioned ? "default" : "secondary"}>
                    {mention.mentioned ? "Mentioned" : "Not Found"}
                  </Badge>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(mention.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
          </div>
          <div className="space-y-3">
            <Button className="w-full justify-start" variant="outline">
              <Activity className="w-4 h-4 mr-2" />
              Create New Tracker
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <BarChart3 className="w-4 h-4 mr-2" />
              View Analytics
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <Clock className="w-4 h-4 mr-2" />
              Check All Trackers
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
