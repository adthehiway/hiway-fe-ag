"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { QuickStatsGrid } from "@/components/dashboard/flux/KPICard";
import { Eye, Users, Clock, DollarSign, TrendingUp, Play } from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";

// Mock data for overview
const viewsTrendData = [
  { date: "Jan 1", views: 1200, uniqueViewers: 800 },
  { date: "Jan 5", views: 1800, uniqueViewers: 1100 },
  { date: "Jan 10", views: 2400, uniqueViewers: 1500 },
  { date: "Jan 15", views: 2100, uniqueViewers: 1300 },
  { date: "Jan 20", views: 3200, uniqueViewers: 2000 },
  { date: "Jan 25", views: 2800, uniqueViewers: 1700 },
  { date: "Jan 30", views: 3500, uniqueViewers: 2200 },
];

const topContentData = [
  { name: "Midnight Chronicles", views: 12400 },
  { name: "Ocean Depths", views: 8900 },
  { name: "Urban Stories", views: 6500 },
  { name: "Festival Highlights", views: 4200 },
  { name: "Behind the Lens", views: 3100 },
];

export function AnalyticsOverviewSection() {
  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <QuickStatsGrid
        stats={[
          { title: "Total Views", value: "124.5K", icon: Eye, trend: 12, trendLabel: "vs last month" },
          { title: "Unique Viewers", value: "45.2K", icon: Users, trend: 8, trendLabel: "vs last month" },
          { title: "Avg Watch Time", value: "4:32", icon: Clock, trend: 5, trendLabel: "vs last month" },
          { title: "Total Revenue", value: "$12,450", icon: DollarSign, trend: 15, trendLabel: "vs last month", iconColor: "text-[#00B4B4]" },
        ]}
      />

      {/* Views Trend Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-[#00B4B4]" />
            Views Trend
          </CardTitle>
          <CardDescription>Daily views over the last 30 days</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={viewsTrendData}>
                <defs>
                  <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00B4B4" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#00B4B4" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1e293b",
                    border: "none",
                    borderRadius: "8px",
                    color: "#fff",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="views"
                  stroke="#00B4B4"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorViews)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Top Content */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Play className="h-5 w-5 text-[#00B4B4]" />
            Top Performing Content
          </CardTitle>
          <CardDescription>Most viewed content this month</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topContentData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ fontSize: 12 }}
                  stroke="#94a3b8"
                  width={120}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1e293b",
                    border: "none",
                    borderRadius: "8px",
                    color: "#fff",
                  }}
                />
                <Bar dataKey="views" fill="#00B4B4" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
