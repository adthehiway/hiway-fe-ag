"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { QuickStatsGrid } from "@/components/dashboard/flux/KPICard";
import { Badge } from "@/components/ui/badge";
import { Share2, DollarSign, Play, Building2, TrendingUp, Globe, CheckCircle } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from "recharts";

const syndicationPartners = [
  { partner: "Netflix", content: 3, views: 245000, revenue: 48500, status: "active" },
  { partner: "Amazon Prime", content: 2, views: 182000, revenue: 32400, status: "active" },
  { partner: "Mubi", content: 4, views: 89000, revenue: 18200, status: "active" },
  { partner: "Criterion Channel", content: 1, views: 45000, revenue: 12800, status: "pending" },
  { partner: "Apple TV+", content: 2, views: 0, revenue: 0, status: "negotiating" },
];

const revenueTrend = [
  { month: "Oct", revenue: 28500 },
  { month: "Nov", revenue: 34200 },
  { month: "Dec", revenue: 42800 },
  { month: "Jan", revenue: 52400 },
];

const contentByPlatform = [
  { platform: "Netflix", feature: 2, documentary: 1, short: 0 },
  { platform: "Amazon", feature: 1, documentary: 1, short: 0 },
  { platform: "Mubi", feature: 1, documentary: 2, short: 1 },
  { platform: "Criterion", feature: 1, documentary: 0, short: 0 },
];

const statusColors: Record<string, string> = {
  active: "bg-green-500/20 text-green-600",
  pending: "bg-yellow-500/20 text-yellow-600",
  negotiating: "bg-blue-500/20 text-blue-600",
};

export function SyndicatedSection() {
  return (
    <div className="space-y-6">
      <QuickStatsGrid
        stats={[
          { title: "Active Partners", value: "12", icon: Building2, trend: 3, trendLabel: "new this quarter" },
          { title: "Syndication Revenue", value: "$111.9K", icon: DollarSign, trend: 28, trendLabel: "vs last quarter", iconColor: "text-[#00B4B4]" },
          { title: "Total Plays", value: "561K", icon: Play, trend: 42, trendLabel: "vs last quarter" },
          { title: "Content Licensed", value: "12", icon: Share2 },
        ]}
      />

      {/* Revenue Trend */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-[#00B4B4]" />
            Syndication Revenue Trend
          </CardTitle>
          <CardDescription>Monthly revenue from distribution partners</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueTrend}>
                <defs>
                  <linearGradient id="colorSyndRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00B4B4" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#00B4B4" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" tickFormatter={(v) => `$${v / 1000}k`} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1e293b",
                    border: "none",
                    borderRadius: "8px",
                    color: "#fff",
                  }}
                  formatter={(value: number) => [`$${value.toLocaleString()}`, 'Revenue']}
                />
                <Area type="monotone" dataKey="revenue" stroke="#00B4B4" strokeWidth={2} fillOpacity={1} fill="url(#colorSyndRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Partners Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-[#00B4B4]" />
            Distribution Partners
          </CardTitle>
          <CardDescription>Performance by syndication partner</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 dark:bg-muted">
                <tr>
                  <th className="text-left p-4 text-sm font-semibold text-slate-600 dark:text-muted-foreground">Partner</th>
                  <th className="text-left p-4 text-sm font-semibold text-slate-600 dark:text-muted-foreground">Content</th>
                  <th className="text-left p-4 text-sm font-semibold text-slate-600 dark:text-muted-foreground">Views</th>
                  <th className="text-left p-4 text-sm font-semibold text-slate-600 dark:text-muted-foreground">Revenue</th>
                  <th className="text-left p-4 text-sm font-semibold text-slate-600 dark:text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody>
                {syndicationPartners.map((item, idx) => (
                  <tr key={idx} className="border-t border-slate-100 dark:border-border">
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-lg bg-slate-100 dark:bg-muted flex items-center justify-center">
                          <Building2 className="h-4 w-4 text-slate-500" />
                        </div>
                        <span className="font-medium text-slate-900 dark:text-foreground">{item.partner}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <Badge variant="secondary">{item.content} titles</Badge>
                    </td>
                    <td className="p-4 text-slate-600 dark:text-muted-foreground">
                      {item.views > 0 ? item.views.toLocaleString() : "-"}
                    </td>
                    <td className="p-4 font-bold text-[#00B4B4]">
                      {item.revenue > 0 ? `$${item.revenue.toLocaleString()}` : "-"}
                    </td>
                    <td className="p-4">
                      <Badge className={statusColors[item.status]}>
                        <CheckCircle className="h-3 w-3 mr-1" />
                        {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                      </Badge>
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
