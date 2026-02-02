"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { QuickStatsGrid } from "@/components/dashboard/flux/KPICard";
import { Badge } from "@/components/ui/badge";
import { Eye, Play, Clock, Target, TrendingUp, Film, Link as LinkIcon, MonitorPlay } from "lucide-react";
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
  Legend,
} from "recharts";
import { AnalyticsFilterSidebar, ViewSection } from "../AnalyticsFilterSidebar";

const viewsData = [
  { date: "Week 1", total: 8500, completed: 5200, dropped: 3300 },
  { date: "Week 2", total: 9200, completed: 5800, dropped: 3400 },
  { date: "Week 3", total: 11000, completed: 7200, dropped: 3800 },
  { date: "Week 4", total: 12500, completed: 8500, dropped: 4000 },
];

const contentPerformance = [
  { name: "Midnight Chronicles", views: 12400, completion: 78, avgWatch: "45:20", type: "content" },
  { name: "Ocean Depths", views: 8900, completion: 82, avgWatch: "38:15", type: "content" },
  { name: "Urban Stories", views: 6500, completion: 65, avgWatch: "22:40", type: "content" },
  { name: "Festival Highlights", views: 4200, completion: 71, avgWatch: "31:10", type: "content" },
  { name: "Behind the Lens", views: 3100, completion: 88, avgWatch: "52:30", type: "content" },
];

const smartlinkPerformance = [
  { name: "Press Screener Link", views: 5600, completion: 72, avgWatch: "32:10", ctr: 8.2, access: "Private" },
  { name: "Festival Submission", views: 3200, completion: 85, avgWatch: "48:30", ctr: 12.5, access: "Private" },
  { name: "Public Trailer Link", views: 15400, completion: 45, avgWatch: "02:15", ctr: 3.8, access: "Public" },
  { name: "Investor Preview", views: 890, completion: 92, avgWatch: "55:20", ctr: 25.4, access: "Private" },
  { name: "Marketing Campaign", views: 8700, completion: 38, avgWatch: "05:40", ctr: 6.1, access: "Public" },
];

const smartroomPerformance = [
  { name: "Q1 2026 Slate", views: 2400, completion: 68, avgWatch: "28:10", assets: 12, status: "Active" },
  { name: "Festival Collection", views: 1800, completion: 75, avgWatch: "35:20", assets: 8, status: "Active" },
  { name: "Investor Data Room", views: 450, completion: 88, avgWatch: "52:40", assets: 24, status: "Active" },
  { name: "Press Kit 2026", views: 3200, completion: 42, avgWatch: "12:15", assets: 6, status: "Active" },
];

export function ViewsEngagementSection() {
  const [activeSection, setActiveSection] = useState<ViewSection>("overview");
  const [searchFilter, setSearchFilter] = useState("");
  const [dateRange, setDateRange] = useState("28");
  const [accessModel, setAccessModel] = useState("all");

  // Filter data based on search
  const filteredContent = useMemo(() => {
    if (!searchFilter) return contentPerformance;
    return contentPerformance.filter(item =>
      item.name.toLowerCase().includes(searchFilter.toLowerCase())
    );
  }, [searchFilter]);

  const filteredSmartlinks = useMemo(() => {
    let data = smartlinkPerformance;
    if (searchFilter) {
      data = data.filter(item =>
        item.name.toLowerCase().includes(searchFilter.toLowerCase())
      );
    }
    if (accessModel !== "all") {
      data = data.filter(item => item.access === accessModel);
    }
    return data;
  }, [searchFilter, accessModel]);

  const filteredSmartrooms = useMemo(() => {
    if (!searchFilter) return smartroomPerformance;
    return smartroomPerformance.filter(item =>
      item.name.toLowerCase().includes(searchFilter.toLowerCase())
    );
  }, [searchFilter]);

  // Calculate results count based on active section
  const resultsCount = useMemo(() => {
    switch (activeSection) {
      case "content": return filteredContent.length;
      case "smartlinks": return filteredSmartlinks.length;
      case "smartrooms": return filteredSmartrooms.length;
      default: return contentPerformance.length + smartlinkPerformance.length + smartroomPerformance.length;
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
                { title: "Total Views", value: "41.2K", icon: Eye, trend: 18, trendLabel: "this month" },
                { title: "Plays Started", value: "38.5K", icon: Play, trend: 15, trendLabel: "this month" },
                { title: "Avg Watch Time", value: "12:45", icon: Clock, trend: 8, trendLabel: "vs avg" },
                { title: "Completion Rate", value: "72%", icon: Target, trend: 5, trendLabel: "vs avg", iconColor: "text-[#00B4B4]" },
              ]}
            />

            {/* Views Over Time */}
            <Card>
              <CardHeader>
                <CardTitle>Views & Completion Trend</CardTitle>
                <CardDescription>Weekly breakdown of total views vs completed views</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={viewsData}>
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
                      <Legend />
                      <Bar dataKey="completed" name="Completed" fill="#00B4B4" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="dropped" name="Dropped Off" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {/* Content Section */}
        {activeSection === "content" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Film className="h-5 w-5 text-[#00B4B4]" />
                Content Performance
              </CardTitle>
              <CardDescription>View metrics by individual content items</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 dark:bg-muted">
                    <tr>
                      <th className="text-left p-4 text-sm font-semibold text-slate-600 dark:text-muted-foreground">Content</th>
                      <th className="text-left p-4 text-sm font-semibold text-slate-600 dark:text-muted-foreground">Views</th>
                      <th className="text-left p-4 text-sm font-semibold text-slate-600 dark:text-muted-foreground">Completion Rate</th>
                      <th className="text-left p-4 text-sm font-semibold text-slate-600 dark:text-muted-foreground">Avg Watch Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredContent.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="p-8 text-center text-muted-foreground">
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
                          <td className="p-4 text-slate-600 dark:text-muted-foreground font-mono">{item.views.toLocaleString()}</td>
                          <td className="p-4">
                            <Badge className={item.completion >= 75 ? "bg-green-500/20 text-green-600" : item.completion >= 50 ? "bg-yellow-500/20 text-yellow-600" : "bg-red-500/20 text-red-600"}>
                              {item.completion}%
                            </Badge>
                          </td>
                          <td className="p-4 text-slate-600 dark:text-muted-foreground font-mono">{item.avgWatch}</td>
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
                SmartLink Performance
              </CardTitle>
              <CardDescription>CTR and watch time metrics by SmartLink</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 dark:bg-muted">
                    <tr>
                      <th className="text-left p-4 text-sm font-semibold text-slate-600 dark:text-muted-foreground">SmartLink</th>
                      <th className="text-left p-4 text-sm font-semibold text-slate-600 dark:text-muted-foreground">Access</th>
                      <th className="text-left p-4 text-sm font-semibold text-slate-600 dark:text-muted-foreground">Views</th>
                      <th className="text-left p-4 text-sm font-semibold text-slate-600 dark:text-muted-foreground">CTR</th>
                      <th className="text-left p-4 text-sm font-semibold text-slate-600 dark:text-muted-foreground">Completion</th>
                      <th className="text-left p-4 text-sm font-semibold text-slate-600 dark:text-muted-foreground">Avg Watch</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSmartlinks.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-muted-foreground">
                          No SmartLinks found matching your filters
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
                          <td className="p-4">
                            <Badge className={item.access === "Private" ? "bg-orange-500/20 text-orange-600" : "bg-green-500/20 text-green-600"}>
                              {item.access}
                            </Badge>
                          </td>
                          <td className="p-4 text-slate-600 dark:text-muted-foreground font-mono">{item.views.toLocaleString()}</td>
                          <td className="p-4">
                            <span className={`font-mono ${item.ctr >= 10 ? "text-green-500" : item.ctr >= 5 ? "text-amber-500" : "text-slate-600 dark:text-muted-foreground"}`}>
                              {item.ctr}%
                            </span>
                          </td>
                          <td className="p-4">
                            <Badge className={item.completion >= 75 ? "bg-green-500/20 text-green-600" : item.completion >= 50 ? "bg-yellow-500/20 text-yellow-600" : "bg-red-500/20 text-red-600"}>
                              {item.completion}%
                            </Badge>
                          </td>
                          <td className="p-4 text-slate-600 dark:text-muted-foreground font-mono">{item.avgWatch}</td>
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
                SmartRoom Performance
              </CardTitle>
              <CardDescription>Engagement metrics by SmartRoom</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 dark:bg-muted">
                    <tr>
                      <th className="text-left p-4 text-sm font-semibold text-slate-600 dark:text-muted-foreground">SmartRoom</th>
                      <th className="text-left p-4 text-sm font-semibold text-slate-600 dark:text-muted-foreground">Status</th>
                      <th className="text-left p-4 text-sm font-semibold text-slate-600 dark:text-muted-foreground">Assets</th>
                      <th className="text-left p-4 text-sm font-semibold text-slate-600 dark:text-muted-foreground">Views</th>
                      <th className="text-left p-4 text-sm font-semibold text-slate-600 dark:text-muted-foreground">Completion</th>
                      <th className="text-left p-4 text-sm font-semibold text-slate-600 dark:text-muted-foreground">Avg Watch</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSmartrooms.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-muted-foreground">
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
                          <td className="p-4">
                            <Badge className="bg-[#00B4B4] text-white">{item.status}</Badge>
                          </td>
                          <td className="p-4 text-slate-600 dark:text-muted-foreground font-mono">{item.assets}</td>
                          <td className="p-4 text-slate-600 dark:text-muted-foreground font-mono">{item.views.toLocaleString()}</td>
                          <td className="p-4">
                            <Badge className={item.completion >= 75 ? "bg-green-500/20 text-green-600" : item.completion >= 50 ? "bg-yellow-500/20 text-yellow-600" : "bg-red-500/20 text-red-600"}>
                              {item.completion}%
                            </Badge>
                          </td>
                          <td className="p-4 text-slate-600 dark:text-muted-foreground font-mono">{item.avgWatch}</td>
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
