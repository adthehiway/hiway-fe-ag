"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { QuickStatsGrid } from "@/components/dashboard/flux/KPICard";
import { Badge } from "@/components/ui/badge";
import { Building2, Eye, Clock, Target, Users, TrendingUp, Mail, CheckCircle } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";

const screenerData = [
  {
    company: "Netflix Acquisitions",
    contact: "Sarah Chen",
    content: "Midnight Chronicles",
    views: 4,
    watchTime: "1:45:20",
    completion: 95,
    lastViewed: "2 hours ago",
    status: "interested"
  },
  {
    company: "Amazon Studios",
    contact: "Michael Roberts",
    content: "Ocean Depths",
    views: 2,
    watchTime: "0:52:10",
    completion: 65,
    lastViewed: "1 day ago",
    status: "viewing"
  },
  {
    company: "A24 Films",
    contact: "Jessica Park",
    content: "Urban Stories",
    views: 5,
    watchTime: "2:10:45",
    completion: 100,
    lastViewed: "3 days ago",
    status: "interested"
  },
  {
    company: "Mubi",
    contact: "David Miller",
    content: "Festival Collection",
    views: 1,
    watchTime: "0:15:30",
    completion: 20,
    lastViewed: "5 days ago",
    status: "pending"
  },
  {
    company: "Criterion",
    contact: "Emma Thompson",
    content: "Behind the Lens",
    views: 3,
    watchTime: "1:28:00",
    completion: 88,
    lastViewed: "1 week ago",
    status: "follow-up"
  },
];

const engagementTrend = [
  { date: "Jan 1", views: 8, avgTime: 45 },
  { date: "Jan 8", views: 12, avgTime: 52 },
  { date: "Jan 15", views: 15, avgTime: 48 },
  { date: "Jan 22", views: 18, avgTime: 58 },
  { date: "Jan 29", views: 22, avgTime: 62 },
];

const statusColors: Record<string, string> = {
  interested: "bg-green-500/20 text-green-600",
  viewing: "bg-blue-500/20 text-blue-600",
  pending: "bg-yellow-500/20 text-yellow-600",
  "follow-up": "bg-purple-500/20 text-purple-600",
};

export function B2BScreenersSection() {
  return (
    <div className="space-y-6">
      <QuickStatsGrid
        stats={[
          { title: "Active Screeners", value: "24", icon: Building2, trend: 6, trendLabel: "new this month" },
          { title: "Total Views", value: "156", icon: Eye, trend: 32, trendLabel: "vs last month" },
          { title: "Avg Watch Time", value: "48 min", icon: Clock, trend: 15, trendLabel: "vs last month" },
          { title: "Hot Leads", value: "8", icon: Target, iconColor: "text-[#00B4B4]" },
        ]}
      />

      {/* Engagement Trend */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-[#00B4B4]" />
            Screener Engagement Trend
          </CardTitle>
          <CardDescription>Weekly B2B viewing activity</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={engagementTrend}>
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
                <Line type="monotone" dataKey="views" stroke="#00B4B4" strokeWidth={2} dot={{ fill: "#00B4B4" }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Screener Activity Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-[#00B4B4]" />
            B2B Screener Activity
          </CardTitle>
          <CardDescription>Deal intelligence from screener engagement</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 dark:bg-muted">
                <tr>
                  <th className="text-left p-4 text-sm font-semibold text-slate-600 dark:text-muted-foreground">Company</th>
                  <th className="text-left p-4 text-sm font-semibold text-slate-600 dark:text-muted-foreground">Content</th>
                  <th className="text-left p-4 text-sm font-semibold text-slate-600 dark:text-muted-foreground">Views</th>
                  <th className="text-left p-4 text-sm font-semibold text-slate-600 dark:text-muted-foreground">Watch Time</th>
                  <th className="text-left p-4 text-sm font-semibold text-slate-600 dark:text-muted-foreground">Completion</th>
                  <th className="text-left p-4 text-sm font-semibold text-slate-600 dark:text-muted-foreground">Status</th>
                  <th className="text-left p-4 text-sm font-semibold text-slate-600 dark:text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {screenerData.map((item, idx) => (
                  <tr key={idx} className="border-t border-slate-100 dark:border-border">
                    <td className="p-4">
                      <div>
                        <div className="font-medium text-slate-900 dark:text-foreground">{item.company}</div>
                        <div className="text-xs text-slate-500">{item.contact}</div>
                      </div>
                    </td>
                    <td className="p-4 text-slate-600 dark:text-muted-foreground">{item.content}</td>
                    <td className="p-4 text-slate-600 dark:text-muted-foreground">{item.views}</td>
                    <td className="p-4 text-slate-600 dark:text-muted-foreground">{item.watchTime}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 bg-slate-100 dark:bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#00B4B4] rounded-full"
                            style={{ width: `${item.completion}%` }}
                          />
                        </div>
                        <span className="text-sm">{item.completion}%</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <Badge className={statusColors[item.status]}>
                        {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <button className="p-2 hover:bg-slate-100 dark:hover:bg-muted rounded-lg">
                        <Mail className="h-4 w-4 text-slate-500" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
