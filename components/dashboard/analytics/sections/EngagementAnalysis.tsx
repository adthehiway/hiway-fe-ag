"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { QuickStatsGrid } from "@/components/dashboard/flux/KPICard";
import { Badge } from "@/components/ui/badge";
import { Target, TrendingUp, Users, Clock, Film, Link as LinkIcon, MonitorPlay, CheckCircle } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { AnalyticsFilterSidebar, ViewSection } from "../AnalyticsFilterSidebar";

const engagementFunnelData = [
  { stage: "Page Visit", count: 50000, percent: 100 },
  { stage: "Play Started", count: 38500, percent: 77 },
  { stage: "25% Watched", count: 32000, percent: 64 },
  { stage: "50% Watched", count: 25000, percent: 50 },
  { stage: "75% Watched", count: 18000, percent: 36 },
  { stage: "Completed", count: 14500, percent: 29 },
];

const watchTimeDistribution = [
  { name: "< 1 min", value: 15 },
  { name: "1-5 min", value: 25 },
  { name: "5-15 min", value: 30 },
  { name: "15-30 min", value: 18 },
  { name: "> 30 min", value: 12 },
];

const contentEngagement = [
  { name: "Midnight Chronicles", sessions: 4500, avgDuration: "32:15", completionRate: 78, bounceRate: 12 },
  { name: "Ocean Depths", sessions: 3200, avgDuration: "28:40", completionRate: 82, bounceRate: 8 },
  { name: "Urban Stories", sessions: 2100, avgDuration: "18:30", completionRate: 65, bounceRate: 22 },
  { name: "Festival Highlights", sessions: 1800, avgDuration: "24:10", completionRate: 71, bounceRate: 15 },
  { name: "Behind the Lens", sessions: 950, avgDuration: "42:50", completionRate: 88, bounceRate: 5 },
];

const smartlinkEngagement = [
  { name: "Press Screener Link", sessions: 890, avgDuration: "38:20", completionRate: 72, ctr: 8.2 },
  { name: "Festival Submission", sessions: 450, avgDuration: "52:10", completionRate: 85, ctr: 12.5 },
  { name: "Public Trailer Link", sessions: 8200, avgDuration: "01:45", completionRate: 45, ctr: 3.8 },
  { name: "Investor Preview", sessions: 120, avgDuration: "58:30", completionRate: 92, ctr: 25.4 },
  { name: "Marketing Campaign", sessions: 3400, avgDuration: "04:20", completionRate: 38, ctr: 6.1 },
];

const smartroomEngagement = [
  { name: "Q1 2026 Slate", sessions: 340, avgDuration: "42:15", assetsViewed: 8.2, returnRate: 45 },
  { name: "Festival Collection", sessions: 220, avgDuration: "35:40", assetsViewed: 5.8, returnRate: 52 },
  { name: "Investor Data Room", sessions: 85, avgDuration: "68:20", assetsViewed: 12.4, returnRate: 78 },
  { name: "Press Kit 2026", sessions: 580, avgDuration: "15:10", assetsViewed: 3.2, returnRate: 28 },
];

const COLORS = ["#00B4B4", "#10b981", "#f59e0b", "#6366f1", "#ec4899"];

export function EngagementAnalysisSection() {
  const [activeSection, setActiveSection] = useState<ViewSection>("overview");
  const [searchFilter, setSearchFilter] = useState("");
  const [dateRange, setDateRange] = useState("28");
  const [accessModel, setAccessModel] = useState("all");

  // Filter data based on search
  const filteredContent = useMemo(() => {
    if (!searchFilter) return contentEngagement;
    return contentEngagement.filter(item =>
      item.name.toLowerCase().includes(searchFilter.toLowerCase())
    );
  }, [searchFilter]);

  const filteredSmartlinks = useMemo(() => {
    if (!searchFilter) return smartlinkEngagement;
    return smartlinkEngagement.filter(item =>
      item.name.toLowerCase().includes(searchFilter.toLowerCase())
    );
  }, [searchFilter]);

  const filteredSmartrooms = useMemo(() => {
    if (!searchFilter) return smartroomEngagement;
    return smartroomEngagement.filter(item =>
      item.name.toLowerCase().includes(searchFilter.toLowerCase())
    );
  }, [searchFilter]);

  const resultsCount = useMemo(() => {
    switch (activeSection) {
      case "content": return filteredContent.length;
      case "smartlinks": return filteredSmartlinks.length;
      case "smartrooms": return filteredSmartrooms.length;
      default: return engagementFunnelData.length;
    }
  }, [activeSection, filteredContent, filteredSmartlinks, filteredSmartrooms]);

  return (
    <div className="flex gap-6">
      {/* Left Sidebar */}
      <AnalyticsFilterSidebar
        activeSection={activeSection}
        onSectionChange={(section) => {
          setActiveSection(section);
          setSearchFilter("");
        }}
        searchFilter={searchFilter}
        onSearchChange={setSearchFilter}
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        accessModel={accessModel}
        onAccessModelChange={setAccessModel}
        resultsCount={resultsCount}
        showAccessModel={true}
      />

      {/* Main Content */}
      <div className="flex-1 min-w-0 space-y-6">
        {/* Overview Section */}
        {activeSection === "overview" && (
          <>
            <QuickStatsGrid
              stats={[
                { title: "Avg Session Duration", value: "8:42", icon: Clock, trend: 12, trendLabel: "vs last month" },
                { title: "Completion Rate", value: "29%", icon: Target, trend: 5, trendLabel: "vs last month" },
                { title: "Return Viewers", value: "42%", icon: Users, trend: 8, trendLabel: "vs last month" },
                { title: "Engagement Score", value: "7.8/10", icon: TrendingUp, trend: 3, trendLabel: "vs last month", iconColor: "text-[#00B4B4]" },
              ]}
            />

            {/* Conversion Funnel */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-[#00B4B4]" />
                  Engagement Funnel
                </CardTitle>
                <CardDescription>Viewer journey from page visit to completion</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {engagementFunnelData.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-4">
                      <div className="w-32 text-sm font-medium text-slate-600 dark:text-muted-foreground">
                        {item.stage}
                      </div>
                      <div className="flex-1">
                        <div className="h-8 bg-slate-100 dark:bg-muted rounded-lg overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-[#00B4B4] to-[#00d4d4] rounded-lg flex items-center justify-end pr-3"
                            style={{ width: `${item.percent}%` }}
                          >
                            <span className="text-xs font-bold text-white">{item.percent}%</span>
                          </div>
                        </div>
                      </div>
                      <div className="w-20 text-right text-sm text-slate-500 dark:text-muted-foreground">
                        {item.count.toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-2 gap-6">
              {/* Watch Time Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Watch Time Distribution</CardTitle>
                  <CardDescription>How long viewers watch content</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={watchTimeDistribution}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {watchTimeDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex flex-wrap justify-center gap-4 mt-4">
                    {watchTimeDistribution.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[idx] }} />
                        <span className="text-xs text-slate-600 dark:text-muted-foreground">{item.name}: {item.value}%</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Engagement Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Top Engagement Actions</CardTitle>
                  <CardDescription>User interactions with content</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { action: "Play Video", count: 38500, icon: "▶️" },
                      { action: "Share Content", count: 4200, icon: "🔗" },
                      { action: "Add to Watchlist", count: 2800, icon: "📋" },
                      { action: "Download", count: 1500, icon: "⬇️" },
                      { action: "Leave Review", count: 890, icon: "⭐" },
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-muted rounded-xl">
                        <div className="flex items-center gap-3">
                          <span className="text-lg">{item.icon}</span>
                          <span className="font-medium text-slate-700 dark:text-foreground">{item.action}</span>
                        </div>
                        <Badge variant="secondary">{item.count.toLocaleString()}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}

        {/* Content Section */}
        {activeSection === "content" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Film className="h-5 w-5 text-[#00B4B4]" />
                Content Engagement
              </CardTitle>
              <CardDescription>Session and engagement metrics by content</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 dark:bg-muted">
                    <tr>
                      <th className="text-left p-4 text-sm font-semibold text-slate-600 dark:text-muted-foreground">Content</th>
                      <th className="text-left p-4 text-sm font-semibold text-slate-600 dark:text-muted-foreground">Sessions</th>
                      <th className="text-left p-4 text-sm font-semibold text-slate-600 dark:text-muted-foreground">Avg Duration</th>
                      <th className="text-left p-4 text-sm font-semibold text-slate-600 dark:text-muted-foreground">Completion</th>
                      <th className="text-left p-4 text-sm font-semibold text-slate-600 dark:text-muted-foreground">Bounce Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredContent.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-muted-foreground">
                          No content found matching your search
                        </td>
                      </tr>
                    ) : (
                      filteredContent.map((item, idx) => (
                        <tr key={idx} className="border-t border-slate-100 dark:border-border hover:bg-muted/50">
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <Film className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium text-slate-900 dark:text-foreground">{item.name}</span>
                            </div>
                          </td>
                          <td className="p-4 text-slate-600 dark:text-muted-foreground font-mono">{item.sessions.toLocaleString()}</td>
                          <td className="p-4 text-slate-600 dark:text-muted-foreground font-mono">{item.avgDuration}</td>
                          <td className="p-4">
                            <Badge className={item.completionRate >= 75 ? "bg-green-500/20 text-green-600" : item.completionRate >= 50 ? "bg-yellow-500/20 text-yellow-600" : "bg-red-500/20 text-red-600"}>
                              {item.completionRate}%
                            </Badge>
                          </td>
                          <td className="p-4">
                            <span className={`font-mono ${item.bounceRate <= 10 ? "text-green-500" : item.bounceRate <= 20 ? "text-amber-500" : "text-red-500"}`}>
                              {item.bounceRate}%
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* SmartLinks Section */}
        {activeSection === "smartlinks" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LinkIcon className="h-5 w-5 text-[#00B4B4]" />
                SmartLink Engagement
              </CardTitle>
              <CardDescription>Session and engagement metrics by SmartLink</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 dark:bg-muted">
                    <tr>
                      <th className="text-left p-4 text-sm font-semibold text-slate-600 dark:text-muted-foreground">SmartLink</th>
                      <th className="text-left p-4 text-sm font-semibold text-slate-600 dark:text-muted-foreground">Sessions</th>
                      <th className="text-left p-4 text-sm font-semibold text-slate-600 dark:text-muted-foreground">Avg Duration</th>
                      <th className="text-left p-4 text-sm font-semibold text-slate-600 dark:text-muted-foreground">Completion</th>
                      <th className="text-left p-4 text-sm font-semibold text-slate-600 dark:text-muted-foreground">CTR</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSmartlinks.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-muted-foreground">
                          No SmartLinks found matching your search
                        </td>
                      </tr>
                    ) : (
                      filteredSmartlinks.map((item, idx) => (
                        <tr key={idx} className="border-t border-slate-100 dark:border-border hover:bg-muted/50">
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <LinkIcon className="h-4 w-4 text-[#00B4B4]" />
                              <span className="font-medium text-slate-900 dark:text-foreground">{item.name}</span>
                            </div>
                          </td>
                          <td className="p-4 text-slate-600 dark:text-muted-foreground font-mono">{item.sessions.toLocaleString()}</td>
                          <td className="p-4 text-slate-600 dark:text-muted-foreground font-mono">{item.avgDuration}</td>
                          <td className="p-4">
                            <Badge className={item.completionRate >= 75 ? "bg-green-500/20 text-green-600" : item.completionRate >= 50 ? "bg-yellow-500/20 text-yellow-600" : "bg-red-500/20 text-red-600"}>
                              {item.completionRate}%
                            </Badge>
                          </td>
                          <td className="p-4">
                            <span className={`font-mono ${item.ctr >= 10 ? "text-green-500" : item.ctr >= 5 ? "text-amber-500" : "text-slate-600 dark:text-muted-foreground"}`}>
                              {item.ctr}%
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* SmartRooms Section */}
        {activeSection === "smartrooms" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MonitorPlay className="h-5 w-5 text-[#00B4B4]" />
                SmartRoom Engagement
              </CardTitle>
              <CardDescription>Session and engagement metrics by SmartRoom</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 dark:bg-muted">
                    <tr>
                      <th className="text-left p-4 text-sm font-semibold text-slate-600 dark:text-muted-foreground">SmartRoom</th>
                      <th className="text-left p-4 text-sm font-semibold text-slate-600 dark:text-muted-foreground">Sessions</th>
                      <th className="text-left p-4 text-sm font-semibold text-slate-600 dark:text-muted-foreground">Avg Duration</th>
                      <th className="text-left p-4 text-sm font-semibold text-slate-600 dark:text-muted-foreground">Assets Viewed</th>
                      <th className="text-left p-4 text-sm font-semibold text-slate-600 dark:text-muted-foreground">Return Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSmartrooms.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-muted-foreground">
                          No SmartRooms found matching your search
                        </td>
                      </tr>
                    ) : (
                      filteredSmartrooms.map((item, idx) => (
                        <tr key={idx} className="border-t border-slate-100 dark:border-border hover:bg-muted/50">
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <MonitorPlay className="h-4 w-4 text-[#00B4B4]" />
                              <span className="font-medium text-slate-900 dark:text-foreground">{item.name}</span>
                            </div>
                          </td>
                          <td className="p-4 text-slate-600 dark:text-muted-foreground font-mono">{item.sessions.toLocaleString()}</td>
                          <td className="p-4 text-slate-600 dark:text-muted-foreground font-mono">{item.avgDuration}</td>
                          <td className="p-4 text-slate-600 dark:text-muted-foreground font-mono">{item.assetsViewed}</td>
                          <td className="p-4">
                            <Badge className={item.returnRate >= 50 ? "bg-green-500/20 text-green-600" : item.returnRate >= 30 ? "bg-yellow-500/20 text-yellow-600" : "bg-red-500/20 text-red-600"}>
                              {item.returnRate}%
                            </Badge>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
