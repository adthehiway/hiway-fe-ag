"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { QuickStatsGrid } from "@/components/dashboard/flux/KPICard";
import { Badge } from "@/components/ui/badge";
import { Unlock, Eye, Users, Clock, Play, TrendingUp, Lock, Mail, FileText, UserPlus } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

// Free to Watch content data
const freeToWatchData = [
  { name: "Behind the Scenes: Midnight Chronicles", views: 8400, watchTime: "12:30", type: "BTS" },
  { name: "Trailer: Ocean Depths", views: 12200, watchTime: "2:15", type: "Trailer" },
  { name: "Teaser: Urban Stories", views: 9800, watchTime: "1:30", type: "Teaser" },
  { name: "Movie Clips Compilation", views: 6500, watchTime: "8:45", type: "Clips" },
  { name: "Cast Interviews", views: 5200, watchTime: "15:20", type: "Interview" },
];

// Gated (Lead Capture) content data
const gatedContentData = [
  { name: "Director Interview - Extended", views: 5600, leads: 2840, conversion: 50.7, type: "Interview" },
  { name: "Making Of Documentary", views: 4200, leads: 1890, conversion: 45.0, type: "BTS" },
  { name: "Exclusive Q&A Session", views: 3200, leads: 1680, conversion: 52.5, type: "Interview" },
  { name: "Early Access Screener", views: 2800, leads: 2450, conversion: 87.5, type: "Screener" },
  { name: "Festival Submission Preview", views: 1950, leads: 1720, conversion: 88.2, type: "Screener" },
];

const trendData = [
  { label: "Week 1", freeViews: 18500, gatedViews: 8200, leads: 4100 },
  { label: "Week 2", freeViews: 22400, gatedViews: 9800, leads: 5200 },
  { label: "Week 3", freeViews: 19800, gatedViews: 11200, leads: 6100 },
  { label: "Week 4", freeViews: 28200, gatedViews: 14500, leads: 8400 },
];

type ContentTab = "free" | "gated";

export function FreeContentSection() {
  const [activeTab, setActiveTab] = useState<ContentTab>("free");

  const tabs = [
    { key: "free" as ContentTab, label: "Free to Watch", icon: Unlock },
    { key: "gated" as ContentTab, label: "Gated (Lead Capture)", icon: Lock },
  ];

  return (
    <div className="space-y-6">
      {/* Tab Switcher */}
      <div className="flex items-center gap-1 p-1 bg-muted rounded-full w-fit">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                activeTab === tab.key
                  ? "bg-[#00B4B4] text-white shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Free to Watch Tab */}
      {activeTab === "free" && (
        <>
          <QuickStatsGrid
            stats={[
              { title: "Total Views", value: "42.1K", icon: Eye, trend: 18, trendLabel: "vs last month" },
              { title: "Unique Viewers", value: "28.5K", icon: Users, trend: 12, trendLabel: "vs last month" },
              { title: "Avg. Watch Time", value: "8:45", icon: Clock, trend: 5, trendLabel: "vs last month" },
              { title: "Content Items", value: "18", icon: FileText, iconColor: "text-[#00B4B4]" },
            ]}
          />

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Unlock className="h-5 w-5 text-emerald-500" />
                Top Free Content
              </CardTitle>
              <CardDescription>Most viewed free videos</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 dark:bg-muted">
                    <tr>
                      <th className="text-left p-4 text-sm font-semibold text-slate-600 dark:text-muted-foreground">Title</th>
                      <th className="text-left p-4 text-sm font-semibold text-slate-600 dark:text-muted-foreground">Type</th>
                      <th className="text-right p-4 text-sm font-semibold text-slate-600 dark:text-muted-foreground">Views</th>
                      <th className="text-right p-4 text-sm font-semibold text-slate-600 dark:text-muted-foreground">Watch Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {freeToWatchData.map((item, idx) => (
                      <tr key={idx} className="border-t border-slate-100 dark:border-border hover:bg-muted/50">
                        <td className="p-4 font-medium text-slate-900 dark:text-foreground">
                          <div className="flex items-center gap-2">
                            <Unlock className="h-4 w-4 text-emerald-500" />
                            {item.name}
                          </div>
                        </td>
                        <td className="p-4"><Badge variant="secondary">{item.type}</Badge></td>
                        <td className="p-4 text-right font-mono text-slate-600 dark:text-muted-foreground">{item.views.toLocaleString()}</td>
                        <td className="p-4 text-right font-mono text-slate-600 dark:text-muted-foreground">{item.watchTime}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Gated (Lead Capture) Tab */}
      {activeTab === "gated" && (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            <Card className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Total Views</span>
                <Eye className="h-4 w-4 text-[#00B4B4]" />
              </div>
              <div className="text-2xl font-bold">17.7K</div>
              <p className="text-xs text-green-600">+24% vs last month</p>
            </Card>
            <Card className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Leads Generated</span>
                <UserPlus className="h-4 w-4 text-[#00B4B4]" />
              </div>
              <div className="text-2xl font-bold">10.6K</div>
              <p className="text-xs text-green-600">+32% vs last month</p>
            </Card>
            <Card className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Conversion Rate</span>
                <TrendingUp className="h-4 w-4 text-[#00B4B4]" />
              </div>
              <div className="text-2xl font-bold">59.8%</div>
              <p className="text-xs text-green-600">+8% vs last month</p>
            </Card>
            <Card className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Emails Captured</span>
                <Mail className="h-4 w-4 text-[#00B4B4]" />
              </div>
              <div className="text-2xl font-bold">9.8K</div>
              <p className="text-xs text-muted-foreground">Valid emails</p>
            </Card>
            <Card className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Form Completion</span>
                <FileText className="h-4 w-4 text-[#00B4B4]" />
              </div>
              <div className="text-2xl font-bold">78%</div>
              <p className="text-xs text-muted-foreground">Started to submitted</p>
            </Card>
            <Card className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Content Items</span>
                <Lock className="h-4 w-4 text-[#00B4B4]" />
              </div>
              <div className="text-2xl font-bold">6</div>
              <p className="text-xs text-muted-foreground">Active gated content</p>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5 text-amber-500" />
                Lead Generation Performance
              </CardTitle>
              <CardDescription>Gated content conversion metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 dark:bg-muted">
                    <tr>
                      <th className="text-left p-4 text-sm font-semibold text-slate-600 dark:text-muted-foreground">Title</th>
                      <th className="text-left p-4 text-sm font-semibold text-slate-600 dark:text-muted-foreground">Type</th>
                      <th className="text-right p-4 text-sm font-semibold text-slate-600 dark:text-muted-foreground">Views</th>
                      <th className="text-right p-4 text-sm font-semibold text-slate-600 dark:text-muted-foreground">Leads</th>
                      <th className="text-right p-4 text-sm font-semibold text-slate-600 dark:text-muted-foreground">Conversion</th>
                    </tr>
                  </thead>
                  <tbody>
                    {gatedContentData.map((item, idx) => (
                      <tr key={idx} className="border-t border-slate-100 dark:border-border hover:bg-muted/50">
                        <td className="p-4 font-medium text-slate-900 dark:text-foreground">
                          <div className="flex items-center gap-2">
                            <Lock className="h-4 w-4 text-amber-500" />
                            {item.name}
                          </div>
                        </td>
                        <td className="p-4"><Badge variant="secondary">{item.type}</Badge></td>
                        <td className="p-4 text-right font-mono text-slate-600 dark:text-muted-foreground">{item.views.toLocaleString()}</td>
                        <td className="p-4 text-right font-mono text-emerald-500">{item.leads.toLocaleString()}</td>
                        <td className="p-4 text-right">
                          <Badge className={item.conversion >= 50 ? "bg-green-500/20 text-green-600" : "bg-yellow-500/20 text-yellow-600"}>
                            {item.conversion}%
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Combined Trend Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-[#00B4B4]" />
            Free vs Gated Content Trend
          </CardTitle>
          <CardDescription>Views and lead generation over time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="colorFreeViews" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorGatedViews" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="label" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <YAxis yAxisId="left" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1e293b",
                    border: "none",
                    borderRadius: "8px",
                    color: "#fff",
                  }}
                />
                <Legend />
                <Area yAxisId="left" type="monotone" dataKey="freeViews" name="Free Views" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorFreeViews)" />
                <Area yAxisId="left" type="monotone" dataKey="gatedViews" name="Gated Views" stroke="#f59e0b" strokeWidth={2} fillOpacity={1} fill="url(#colorGatedViews)" />
                <Area yAxisId="right" type="monotone" dataKey="leads" name="Leads" stroke="#3b82f6" strokeWidth={2} strokeDasharray="5 5" fill="transparent" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Lead Quality Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Lead Quality Insights</CardTitle>
          <CardDescription>Understanding your captured leads</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="p-4 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
              <h4 className="font-medium text-emerald-600 dark:text-emerald-400">High Intent</h4>
              <p className="text-2xl font-bold mt-2">34%</p>
              <p className="text-sm text-muted-foreground mt-1">
                Leads who watched 75%+ of gated content
              </p>
            </div>
            <div className="p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
              <h4 className="font-medium text-blue-600 dark:text-blue-400">Business Emails</h4>
              <p className="text-2xl font-bold mt-2">78%</p>
              <p className="text-sm text-muted-foreground mt-1">
                Work emails vs personal emails
              </p>
            </div>
            <div className="p-4 bg-amber-500/10 rounded-lg border border-amber-500/20">
              <h4 className="font-medium text-amber-600 dark:text-amber-400">Form Drop-off</h4>
              <p className="text-2xl font-bold mt-2">22%</p>
              <p className="text-sm text-muted-foreground mt-1">
                Started but didn't complete form
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
