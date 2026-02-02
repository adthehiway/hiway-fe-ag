"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { QuickStatsGrid } from "@/components/dashboard/flux/KPICard";
import { Badge } from "@/components/ui/badge";
import { Link2, Share2, Search, Mail, Globe, TrendingUp, Film, Link as LinkIcon, MonitorPlay } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { AnalyticsFilterSidebar, ViewSection } from "../AnalyticsFilterSidebar";

const sourceData = [
  { source: "Direct", visits: 28500, percent: 35, icon: "🔗" },
  { source: "Organic Search", visits: 22400, percent: 28, icon: "🔍" },
  { source: "Social Media", visits: 15200, percent: 19, icon: "📱" },
  { source: "Email", visits: 8900, percent: 11, icon: "✉️" },
  { source: "Referral", visits: 5600, percent: 7, icon: "🌐" },
];

const socialBreakdown = [
  { platform: "Twitter/X", visits: 5800, color: "#1DA1F2" },
  { platform: "Facebook", visits: 4200, color: "#4267B2" },
  { platform: "LinkedIn", visits: 2800, color: "#0077B5" },
  { platform: "Instagram", visits: 1900, color: "#E4405F" },
  { platform: "YouTube", visits: 500, color: "#FF0000" },
];

const contentTrafficData = [
  { name: "Midnight Chronicles", direct: 4200, organic: 3100, social: 2800, email: 1500, referral: 800 },
  { name: "Ocean Depths", direct: 3100, organic: 2400, social: 1900, email: 1100, referral: 400 },
  { name: "Urban Stories", direct: 2200, organic: 1600, social: 1400, email: 800, referral: 500 },
  { name: "Festival Highlights", direct: 1500, organic: 1100, social: 900, email: 500, referral: 200 },
];

const smartlinkTrafficData = [
  { name: "Press Screener Link", direct: 1200, organic: 800, social: 2100, email: 1200, referral: 300 },
  { name: "Festival Submission", direct: 800, organic: 400, social: 1500, email: 400, referral: 100 },
  { name: "Public Trailer Link", direct: 5200, organic: 4800, social: 3200, email: 1500, referral: 700 },
  { name: "Marketing Campaign", direct: 2100, organic: 1200, social: 3800, email: 1200, referral: 400 },
];

const smartroomTrafficData = [
  { name: "Q1 2026 Slate", direct: 420, organic: 180, social: 380, email: 620, referral: 200 },
  { name: "Festival Collection", direct: 280, organic: 120, social: 290, email: 390, referral: 100 },
  { name: "Investor Data Room", direct: 180, organic: 20, social: 15, email: 210, referral: 25 },
  { name: "Press Kit 2026", direct: 890, organic: 420, social: 580, email: 380, referral: 310 },
];

const utmCampaigns = [
  { campaign: "summer_release_2025", source: "email", medium: "newsletter", visits: 4200, conversions: 320 },
  { campaign: "film_festival", source: "social", medium: "paid", visits: 3800, conversions: 280 },
  { campaign: "premiere_announce", source: "twitter", medium: "organic", visits: 2900, conversions: 195 },
  { campaign: "partner_collab", source: "referral", medium: "partner", visits: 2100, conversions: 156 },
];

export function TrafficSourcesSection() {
  const [activeSection, setActiveSection] = useState<ViewSection>("overview");
  const [searchFilter, setSearchFilter] = useState("");
  const [dateRange, setDateRange] = useState("28");

  // Filter data based on search
  const filteredContentTraffic = useMemo(() => {
    if (!searchFilter) return contentTrafficData;
    return contentTrafficData.filter(item =>
      item.name.toLowerCase().includes(searchFilter.toLowerCase())
    );
  }, [searchFilter]);

  const filteredSmartlinkTraffic = useMemo(() => {
    if (!searchFilter) return smartlinkTrafficData;
    return smartlinkTrafficData.filter(item =>
      item.name.toLowerCase().includes(searchFilter.toLowerCase())
    );
  }, [searchFilter]);

  const filteredSmartroomTraffic = useMemo(() => {
    if (!searchFilter) return smartroomTrafficData;
    return smartroomTrafficData.filter(item =>
      item.name.toLowerCase().includes(searchFilter.toLowerCase())
    );
  }, [searchFilter]);

  const resultsCount = useMemo(() => {
    switch (activeSection) {
      case "content": return filteredContentTraffic.length;
      case "smartlinks": return filteredSmartlinkTraffic.length;
      case "smartrooms": return filteredSmartroomTraffic.length;
      default: return sourceData.length;
    }
  }, [activeSection, filteredContentTraffic, filteredSmartlinkTraffic, filteredSmartroomTraffic]);

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
                { title: "Total Visits", value: "80.6K", icon: Globe, trend: 22, trendLabel: "vs last month" },
                { title: "Direct Traffic", value: "35%", icon: Link2 },
                { title: "Organic Search", value: "28%", icon: Search, trend: 15, trendLabel: "vs last month" },
                { title: "Social Traffic", value: "19%", icon: Share2, trend: 8, trendLabel: "vs last month", iconColor: "text-[#00B4B4]" },
              ]}
            />

            <div className="grid grid-cols-2 gap-6">
              {/* Traffic Sources */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-[#00B4B4]" />
                    Traffic Sources
                  </CardTitle>
                  <CardDescription>Where your visitors come from</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {sourceData.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-4">
                        <span className="text-xl w-8">{item.icon}</span>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium text-slate-700 dark:text-foreground">{item.source}</span>
                            <span className="text-sm text-slate-500">{item.visits.toLocaleString()} visits</span>
                          </div>
                          <div className="h-2 bg-slate-100 dark:bg-muted rounded-full overflow-hidden">
                            <div className="h-full bg-[#00B4B4] rounded-full" style={{ width: `${item.percent}%` }} />
                          </div>
                        </div>
                        <span className="text-sm font-medium text-slate-600 w-12 text-right">{item.percent}%</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Social Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Share2 className="h-5 w-5 text-[#00B4B4]" />
                    Social Media Breakdown
                  </CardTitle>
                  <CardDescription>Traffic from social platforms</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={socialBreakdown} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
                        <XAxis type="number" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                        <YAxis type="category" dataKey="platform" tick={{ fontSize: 12 }} stroke="#94a3b8" width={80} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#1e293b",
                            border: "none",
                            borderRadius: "8px",
                            color: "#fff",
                          }}
                        />
                        <Bar dataKey="visits" radius={[0, 4, 4, 0]}>
                          {socialBreakdown.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* UTM Campaigns */}
            <Card>
              <CardHeader>
                <CardTitle>Campaign Performance</CardTitle>
                <CardDescription>UTM-tracked marketing campaigns</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50 dark:bg-muted">
                      <tr>
                        <th className="text-left p-4 text-sm font-semibold text-slate-600 dark:text-muted-foreground">Campaign</th>
                        <th className="text-left p-4 text-sm font-semibold text-slate-600 dark:text-muted-foreground">Source</th>
                        <th className="text-left p-4 text-sm font-semibold text-slate-600 dark:text-muted-foreground">Medium</th>
                        <th className="text-left p-4 text-sm font-semibold text-slate-600 dark:text-muted-foreground">Visits</th>
                        <th className="text-left p-4 text-sm font-semibold text-slate-600 dark:text-muted-foreground">Conversions</th>
                        <th className="text-left p-4 text-sm font-semibold text-slate-600 dark:text-muted-foreground">Conv Rate</th>
                      </tr>
                    </thead>
                    <tbody>
                      {utmCampaigns.map((item, idx) => (
                        <tr key={idx} className="border-t border-slate-100 dark:border-border hover:bg-muted/50">
                          <td className="p-4 font-mono text-sm text-slate-900 dark:text-foreground">{item.campaign}</td>
                          <td className="p-4"><Badge variant="secondary">{item.source}</Badge></td>
                          <td className="p-4"><Badge variant="outline">{item.medium}</Badge></td>
                          <td className="p-4 text-slate-600 dark:text-muted-foreground font-mono">{item.visits.toLocaleString()}</td>
                          <td className="p-4 text-slate-600 dark:text-muted-foreground font-mono">{item.conversions.toLocaleString()}</td>
                          <td className="p-4 font-medium text-[#00B4B4]">{((item.conversions / item.visits) * 100).toFixed(1)}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {/* Content Traffic Section */}
        {activeSection === "content" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Film className="h-5 w-5 text-[#00B4B4]" />
                Traffic Sources by Content
              </CardTitle>
              <CardDescription>Where traffic comes from for each content item</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 dark:bg-muted">
                    <tr>
                      <th className="text-left p-4 text-sm font-semibold text-slate-600 dark:text-muted-foreground">Content</th>
                      <th className="text-left p-4 text-sm font-semibold text-slate-600 dark:text-muted-foreground">Direct</th>
                      <th className="text-left p-4 text-sm font-semibold text-slate-600 dark:text-muted-foreground">Organic</th>
                      <th className="text-left p-4 text-sm font-semibold text-slate-600 dark:text-muted-foreground">Social</th>
                      <th className="text-left p-4 text-sm font-semibold text-slate-600 dark:text-muted-foreground">Email</th>
                      <th className="text-left p-4 text-sm font-semibold text-slate-600 dark:text-muted-foreground">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredContentTraffic.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-muted-foreground">
                          No content found matching your search
                        </td>
                      </tr>
                    ) : (
                      filteredContentTraffic.map((item, idx) => (
                        <tr key={idx} className="border-t border-slate-100 dark:border-border hover:bg-muted/50">
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <Film className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium text-slate-900 dark:text-foreground">{item.name}</span>
                            </div>
                          </td>
                          <td className="p-4 text-slate-600 dark:text-muted-foreground font-mono">{item.direct.toLocaleString()}</td>
                          <td className="p-4 text-slate-600 dark:text-muted-foreground font-mono">{item.organic.toLocaleString()}</td>
                          <td className="p-4 text-slate-600 dark:text-muted-foreground font-mono">{item.social.toLocaleString()}</td>
                          <td className="p-4 text-slate-600 dark:text-muted-foreground font-mono">{item.email.toLocaleString()}</td>
                          <td className="p-4 font-medium text-[#00B4B4]">{(item.direct + item.organic + item.social + item.email + item.referral).toLocaleString()}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* SmartLinks Traffic Section */}
        {activeSection === "smartlinks" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LinkIcon className="h-5 w-5 text-[#00B4B4]" />
                Traffic Sources by SmartLink
              </CardTitle>
              <CardDescription>Where traffic comes from for each SmartLink</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 dark:bg-muted">
                    <tr>
                      <th className="text-left p-4 text-sm font-semibold text-slate-600 dark:text-muted-foreground">SmartLink</th>
                      <th className="text-left p-4 text-sm font-semibold text-slate-600 dark:text-muted-foreground">Direct</th>
                      <th className="text-left p-4 text-sm font-semibold text-slate-600 dark:text-muted-foreground">Organic</th>
                      <th className="text-left p-4 text-sm font-semibold text-slate-600 dark:text-muted-foreground">Social</th>
                      <th className="text-left p-4 text-sm font-semibold text-slate-600 dark:text-muted-foreground">Email</th>
                      <th className="text-left p-4 text-sm font-semibold text-slate-600 dark:text-muted-foreground">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSmartlinkTraffic.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-muted-foreground">
                          No SmartLinks found matching your search
                        </td>
                      </tr>
                    ) : (
                      filteredSmartlinkTraffic.map((item, idx) => (
                        <tr key={idx} className="border-t border-slate-100 dark:border-border hover:bg-muted/50">
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <LinkIcon className="h-4 w-4 text-[#00B4B4]" />
                              <span className="font-medium text-slate-900 dark:text-foreground">{item.name}</span>
                            </div>
                          </td>
                          <td className="p-4 text-slate-600 dark:text-muted-foreground font-mono">{item.direct.toLocaleString()}</td>
                          <td className="p-4 text-slate-600 dark:text-muted-foreground font-mono">{item.organic.toLocaleString()}</td>
                          <td className="p-4 text-slate-600 dark:text-muted-foreground font-mono">{item.social.toLocaleString()}</td>
                          <td className="p-4 text-slate-600 dark:text-muted-foreground font-mono">{item.email.toLocaleString()}</td>
                          <td className="p-4 font-medium text-[#00B4B4]">{(item.direct + item.organic + item.social + item.email + item.referral).toLocaleString()}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* SmartRooms Traffic Section */}
        {activeSection === "smartrooms" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MonitorPlay className="h-5 w-5 text-[#00B4B4]" />
                Traffic Sources by SmartRoom
              </CardTitle>
              <CardDescription>Where traffic comes from for each SmartRoom</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 dark:bg-muted">
                    <tr>
                      <th className="text-left p-4 text-sm font-semibold text-slate-600 dark:text-muted-foreground">SmartRoom</th>
                      <th className="text-left p-4 text-sm font-semibold text-slate-600 dark:text-muted-foreground">Direct</th>
                      <th className="text-left p-4 text-sm font-semibold text-slate-600 dark:text-muted-foreground">Organic</th>
                      <th className="text-left p-4 text-sm font-semibold text-slate-600 dark:text-muted-foreground">Social</th>
                      <th className="text-left p-4 text-sm font-semibold text-slate-600 dark:text-muted-foreground">Email</th>
                      <th className="text-left p-4 text-sm font-semibold text-slate-600 dark:text-muted-foreground">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSmartroomTraffic.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-muted-foreground">
                          No SmartRooms found matching your search
                        </td>
                      </tr>
                    ) : (
                      filteredSmartroomTraffic.map((item, idx) => (
                        <tr key={idx} className="border-t border-slate-100 dark:border-border hover:bg-muted/50">
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <MonitorPlay className="h-4 w-4 text-[#00B4B4]" />
                              <span className="font-medium text-slate-900 dark:text-foreground">{item.name}</span>
                            </div>
                          </td>
                          <td className="p-4 text-slate-600 dark:text-muted-foreground font-mono">{item.direct.toLocaleString()}</td>
                          <td className="p-4 text-slate-600 dark:text-muted-foreground font-mono">{item.organic.toLocaleString()}</td>
                          <td className="p-4 text-slate-600 dark:text-muted-foreground font-mono">{item.social.toLocaleString()}</td>
                          <td className="p-4 text-slate-600 dark:text-muted-foreground font-mono">{item.email.toLocaleString()}</td>
                          <td className="p-4 font-medium text-[#00B4B4]">{(item.direct + item.organic + item.social + item.email + item.referral).toLocaleString()}</td>
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
