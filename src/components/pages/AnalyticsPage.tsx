"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  Activity,
  Target,
  Calendar
} from "lucide-react";

export default function AnalyticsPage() {
  // Mock data for analytics - in a real app, this would come from your database
  const analyticsData = {
    totalChecks: 156,
    mentionsFound: 23,
    mentionRate: 14.7,
    topBrands: [
      { name: "Muttleycrew", mentions: 8, checks: 45 },
      { name: "BrandX", mentions: 6, checks: 32 },
      { name: "BrandY", mentions: 4, checks: 28 },
      { name: "BrandZ", mentions: 3, checks: 25 },
      { name: "BrandA", mentions: 2, checks: 26 }
    ],
    weeklyTrend: [
      { day: "Mon", checks: 12, mentions: 2 },
      { day: "Tue", checks: 18, mentions: 3 },
      { day: "Wed", checks: 15, mentions: 1 },
      { day: "Thu", checks: 22, mentions: 4 },
      { day: "Fri", checks: 19, mentions: 3 },
      { day: "Sat", checks: 8, mentions: 1 },
      { day: "Sun", checks: 6, mentions: 0 }
    ]
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

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics</h1>
        <p className="text-gray-600">Track your brand mention performance and trends</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Checks"
          value={analyticsData.totalChecks}
          icon={Activity}
          color="bg-blue-500"
          trend={12}
        />
        <StatCard
          title="Mentions Found"
          value={analyticsData.mentionsFound}
          icon={Target}
          color="bg-green-500"
          trend={8}
        />
        <StatCard
          title="Mention Rate"
          value={`${analyticsData.mentionRate}%`}
          icon={BarChart3}
          color="bg-purple-500"
          trend={-2}
        />
        <StatCard
          title="Active Trackers"
          value="5"
          icon={Calendar}
          color="bg-orange-500"
          trend={0}
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
            {analyticsData.weeklyTrend.map((day) => (
              <div key={day.day} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 text-sm font-medium text-gray-600">{day.day}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="h-2 bg-gray-200 rounded-full flex-1">
                        <div 
                          className="h-2 bg-blue-500 rounded-full" 
                          style={{ width: `${(day.checks / 25) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-gray-500">{day.checks}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-1 bg-gray-200 rounded-full flex-1">
                        <div 
                          className="h-1 bg-green-500 rounded-full" 
                          style={{ width: `${(day.mentions / 5) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-gray-500">{day.mentions}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
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
            {analyticsData.topBrands.map((brand, index) => (
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
                    {((brand.mentions / brand.checks) * 100).toFixed(1)}% rate
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Insights */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-gray-600" />
          <h2 className="text-lg font-semibold text-gray-900">Insights</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-4 bg-green-50 rounded-lg">
            <h3 className="font-medium text-green-900 mb-2">Best Performing Day</h3>
            <p className="text-sm text-green-700">Thursday shows the highest mention rate with 18.2% success rate</p>
          </div>
          <div className="p-4 bg-blue-50 rounded-lg">
            <h3 className="font-medium text-blue-900 mb-2">Top Brand</h3>
            <p className="text-sm text-blue-700">Muttleycrew has the highest mention rate at 17.8%</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
