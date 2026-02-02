"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { QuickStatsGrid } from "@/components/dashboard/flux/KPICard";
import { Badge } from "@/components/ui/badge";
import { Globe, MapPin, TrendingUp, Users, Film, Link as LinkIcon, MonitorPlay } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { AnalyticsFilterSidebar, ViewSection } from "../AnalyticsFilterSidebar";

const countryData = [
  { country: "United States", code: "US", views: 45200, percent: 36 },
  { country: "United Kingdom", code: "UK", views: 22100, percent: 18 },
  { country: "Canada", code: "CA", views: 15800, percent: 13 },
  { country: "Australia", code: "AU", views: 12400, percent: 10 },
  { country: "Germany", code: "DE", views: 9200, percent: 7 },
  { country: "France", code: "FR", views: 7800, percent: 6 },
  { country: "Netherlands", code: "NL", views: 5200, percent: 4 },
  { country: "Other", code: "OT", views: 7300, percent: 6 },
];

const regionData = [
  { name: "North America", value: 49 },
  { name: "Europe", value: 31 },
  { name: "Asia Pacific", value: 12 },
  { name: "Rest of World", value: 8 },
];

const contentGeoData = [
  { name: "Midnight Chronicles", us: 4200, uk: 1800, ca: 1200, other: 2100 },
  { name: "Ocean Depths", us: 3100, uk: 1400, ca: 800, other: 1500 },
  { name: "Urban Stories", us: 2200, uk: 900, ca: 600, other: 1100 },
  { name: "Festival Highlights", us: 1500, uk: 700, ca: 400, other: 800 },
];

const smartlinkGeoData = [
  { name: "Press Screener Link", us: 2800, uk: 1200, eu: 900, other: 700 },
  { name: "Festival Submission", us: 1500, uk: 800, eu: 600, other: 300 },
  { name: "Public Trailer", us: 8200, uk: 3400, eu: 2100, other: 1700 },
  { name: "Marketing Campaign", us: 4500, uk: 1800, eu: 1400, other: 1000 },
];

const smartroomGeoData = [
  { name: "Q1 2026 Slate", us: 890, uk: 420, eu: 380, other: 310 },
  { name: "Festival Collection", us: 620, uk: 380, eu: 290, other: 190 },
  { name: "Investor Data Room", us: 280, uk: 95, eu: 45, other: 30 },
  { name: "Press Kit 2026", us: 1200, uk: 580, eu: 420, other: 380 },
];

const COLORS = ["#00B4B4", "#10b981", "#f59e0b", "#6366f1"];

// Helper function for flag emojis
function getFlagEmoji(countryCode: string): string {
  const flags: Record<string, string> = {
    US: "🇺🇸",
    UK: "🇬🇧",
    CA: "🇨🇦",
    AU: "🇦🇺",
    DE: "🇩🇪",
    FR: "🇫🇷",
    NL: "🇳🇱",
    OT: "🌍",
  };
  return flags[countryCode] || "🌍";
}

export function GeographicSection() {
  const [activeSection, setActiveSection] = useState<ViewSection>("overview");
  const [searchFilter, setSearchFilter] = useState("");
  const [dateRange, setDateRange] = useState("28");

  // Filter data based on search
  const filteredContentGeo = useMemo(() => {
    if (!searchFilter) return contentGeoData;
    return contentGeoData.filter(item =>
      item.name.toLowerCase().includes(searchFilter.toLowerCase())
    );
  }, [searchFilter]);

  const filteredSmartlinkGeo = useMemo(() => {
    if (!searchFilter) return smartlinkGeoData;
    return smartlinkGeoData.filter(item =>
      item.name.toLowerCase().includes(searchFilter.toLowerCase())
    );
  }, [searchFilter]);

  const filteredSmartroomGeo = useMemo(() => {
    if (!searchFilter) return smartroomGeoData;
    return smartroomGeoData.filter(item =>
      item.name.toLowerCase().includes(searchFilter.toLowerCase())
    );
  }, [searchFilter]);

  const resultsCount = useMemo(() => {
    switch (activeSection) {
      case "content": return filteredContentGeo.length;
      case "smartlinks": return filteredSmartlinkGeo.length;
      case "smartrooms": return filteredSmartroomGeo.length;
      default: return countryData.length;
    }
  }, [activeSection, filteredContentGeo, filteredSmartlinkGeo, filteredSmartroomGeo]);

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
        resultsCount={resultsCount}
      />

      {/* Main Content */}
      <div className="flex-1 min-w-0 space-y-6">
        {/* Overview Section */}
        {activeSection === "overview" && (
          <>
            <QuickStatsGrid
              stats={[
                { title: "Countries Reached", value: "48", icon: Globe, trend: 12, trendLabel: "new this month" },
                { title: "Top Region", value: "N. America", icon: MapPin },
                { title: "International Views", value: "64%", icon: TrendingUp, trend: 8, trendLabel: "vs last month" },
                { title: "Global Viewers", value: "78.2K", icon: Users, trend: 15, trendLabel: "vs last month", iconColor: "text-[#00B4B4]" },
              ]}
            />

            <div className="grid grid-cols-3 gap-6">
              {/* Countries Table */}
              <Card className="col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5 text-[#00B4B4]" />
                    Views by Country
                  </CardTitle>
                  <CardDescription>Geographic distribution of your audience</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-slate-50 dark:bg-muted">
                        <tr>
                          <th className="text-left p-4 text-sm font-semibold text-slate-600 dark:text-muted-foreground">Country</th>
                          <th className="text-left p-4 text-sm font-semibold text-slate-600 dark:text-muted-foreground">Views</th>
                          <th className="text-left p-4 text-sm font-semibold text-slate-600 dark:text-muted-foreground">Share</th>
                        </tr>
                      </thead>
                      <tbody>
                        {countryData.map((item, idx) => (
                          <tr key={idx} className="border-t border-slate-100 dark:border-border hover:bg-muted/50">
                            <td className="p-4">
                              <div className="flex items-center gap-2">
                                <span className="text-lg">{getFlagEmoji(item.code)}</span>
                                <span className="font-medium text-slate-900 dark:text-foreground">{item.country}</span>
                              </div>
                            </td>
                            <td className="p-4 text-slate-600 dark:text-muted-foreground font-mono">{item.views.toLocaleString()}</td>
                            <td className="p-4">
                              <div className="flex items-center gap-2">
                                <div className="w-16 h-2 bg-slate-100 dark:bg-muted rounded-full overflow-hidden">
                                  <div className="h-full bg-[#00B4B4] rounded-full" style={{ width: `${item.percent}%` }} />
                                </div>
                                <span className="text-sm text-slate-500">{item.percent}%</span>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              {/* Region Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>By Region</CardTitle>
                  <CardDescription>Continental breakdown</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={regionData}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={70}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {regionData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="space-y-2 mt-4">
                    {regionData.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[idx] }} />
                          <span className="text-sm text-slate-600 dark:text-muted-foreground">{item.name}</span>
                        </div>
                        <span className="text-sm font-medium text-slate-900 dark:text-foreground">{item.value}%</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}

        {/* Content Geographic Section */}
        {activeSection === "content" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Film className="h-5 w-5 text-[#00B4B4]" />
                Geographic by Content
              </CardTitle>
              <CardDescription>Views by region for each content item</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 dark:bg-muted">
                    <tr>
                      <th className="text-left p-4 text-sm font-semibold text-slate-600 dark:text-muted-foreground">Content</th>
                      <th className="text-left p-4 text-sm font-semibold text-slate-600 dark:text-muted-foreground">🇺🇸 US</th>
                      <th className="text-left p-4 text-sm font-semibold text-slate-600 dark:text-muted-foreground">🇬🇧 UK</th>
                      <th className="text-left p-4 text-sm font-semibold text-slate-600 dark:text-muted-foreground">🇨🇦 Canada</th>
                      <th className="text-left p-4 text-sm font-semibold text-slate-600 dark:text-muted-foreground">🌍 Other</th>
                      <th className="text-left p-4 text-sm font-semibold text-slate-600 dark:text-muted-foreground">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredContentGeo.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-muted-foreground">
                          No content found matching your search
                        </td>
                      </tr>
                    ) : (
                      filteredContentGeo.map((item, idx) => (
                        <tr key={idx} className="border-t border-slate-100 dark:border-border hover:bg-muted/50">
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <Film className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium text-slate-900 dark:text-foreground">{item.name}</span>
                            </div>
                          </td>
                          <td className="p-4 text-slate-600 dark:text-muted-foreground font-mono">{item.us.toLocaleString()}</td>
                          <td className="p-4 text-slate-600 dark:text-muted-foreground font-mono">{item.uk.toLocaleString()}</td>
                          <td className="p-4 text-slate-600 dark:text-muted-foreground font-mono">{item.ca.toLocaleString()}</td>
                          <td className="p-4 text-slate-600 dark:text-muted-foreground font-mono">{item.other.toLocaleString()}</td>
                          <td className="p-4 font-medium text-[#00B4B4]">{(item.us + item.uk + item.ca + item.other).toLocaleString()}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* SmartLinks Geographic Section */}
        {activeSection === "smartlinks" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LinkIcon className="h-5 w-5 text-[#00B4B4]" />
                Geographic by SmartLink
              </CardTitle>
              <CardDescription>Views by region for each SmartLink</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 dark:bg-muted">
                    <tr>
                      <th className="text-left p-4 text-sm font-semibold text-slate-600 dark:text-muted-foreground">SmartLink</th>
                      <th className="text-left p-4 text-sm font-semibold text-slate-600 dark:text-muted-foreground">🇺🇸 US</th>
                      <th className="text-left p-4 text-sm font-semibold text-slate-600 dark:text-muted-foreground">🇬🇧 UK</th>
                      <th className="text-left p-4 text-sm font-semibold text-slate-600 dark:text-muted-foreground">🇪🇺 EU</th>
                      <th className="text-left p-4 text-sm font-semibold text-slate-600 dark:text-muted-foreground">🌍 Other</th>
                      <th className="text-left p-4 text-sm font-semibold text-slate-600 dark:text-muted-foreground">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSmartlinkGeo.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-muted-foreground">
                          No SmartLinks found matching your search
                        </td>
                      </tr>
                    ) : (
                      filteredSmartlinkGeo.map((item, idx) => (
                        <tr key={idx} className="border-t border-slate-100 dark:border-border hover:bg-muted/50">
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <LinkIcon className="h-4 w-4 text-[#00B4B4]" />
                              <span className="font-medium text-slate-900 dark:text-foreground">{item.name}</span>
                            </div>
                          </td>
                          <td className="p-4 text-slate-600 dark:text-muted-foreground font-mono">{item.us.toLocaleString()}</td>
                          <td className="p-4 text-slate-600 dark:text-muted-foreground font-mono">{item.uk.toLocaleString()}</td>
                          <td className="p-4 text-slate-600 dark:text-muted-foreground font-mono">{item.eu.toLocaleString()}</td>
                          <td className="p-4 text-slate-600 dark:text-muted-foreground font-mono">{item.other.toLocaleString()}</td>
                          <td className="p-4 font-medium text-[#00B4B4]">{(item.us + item.uk + item.eu + item.other).toLocaleString()}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* SmartRooms Geographic Section */}
        {activeSection === "smartrooms" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MonitorPlay className="h-5 w-5 text-[#00B4B4]" />
                Geographic by SmartRoom
              </CardTitle>
              <CardDescription>Views by region for each SmartRoom</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 dark:bg-muted">
                    <tr>
                      <th className="text-left p-4 text-sm font-semibold text-slate-600 dark:text-muted-foreground">SmartRoom</th>
                      <th className="text-left p-4 text-sm font-semibold text-slate-600 dark:text-muted-foreground">🇺🇸 US</th>
                      <th className="text-left p-4 text-sm font-semibold text-slate-600 dark:text-muted-foreground">🇬🇧 UK</th>
                      <th className="text-left p-4 text-sm font-semibold text-slate-600 dark:text-muted-foreground">🇪🇺 EU</th>
                      <th className="text-left p-4 text-sm font-semibold text-slate-600 dark:text-muted-foreground">🌍 Other</th>
                      <th className="text-left p-4 text-sm font-semibold text-slate-600 dark:text-muted-foreground">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSmartroomGeo.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-muted-foreground">
                          No SmartRooms found matching your search
                        </td>
                      </tr>
                    ) : (
                      filteredSmartroomGeo.map((item, idx) => (
                        <tr key={idx} className="border-t border-slate-100 dark:border-border hover:bg-muted/50">
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <MonitorPlay className="h-4 w-4 text-[#00B4B4]" />
                              <span className="font-medium text-slate-900 dark:text-foreground">{item.name}</span>
                            </div>
                          </td>
                          <td className="p-4 text-slate-600 dark:text-muted-foreground font-mono">{item.us.toLocaleString()}</td>
                          <td className="p-4 text-slate-600 dark:text-muted-foreground font-mono">{item.uk.toLocaleString()}</td>
                          <td className="p-4 text-slate-600 dark:text-muted-foreground font-mono">{item.eu.toLocaleString()}</td>
                          <td className="p-4 text-slate-600 dark:text-muted-foreground font-mono">{item.other.toLocaleString()}</td>
                          <td className="p-4 font-medium text-[#00B4B4]">{(item.us + item.uk + item.eu + item.other).toLocaleString()}</td>
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
