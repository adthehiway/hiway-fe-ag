"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { QuickStatsGrid } from "@/components/dashboard/flux/KPICard";
import { Badge } from "@/components/ui/badge";
import { Share2, Globe, Code, ExternalLink, TrendingUp, Play } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const platformData = [
  { platform: "YouTube", plays: 45200, embeds: 320, color: "#FF0000" },
  { platform: "Facebook", plays: 28400, embeds: 185, color: "#4267B2" },
  { platform: "Twitter/X", plays: 18500, embeds: 95, color: "#1DA1F2" },
  { platform: "LinkedIn", plays: 12200, embeds: 78, color: "#0077B5" },
  { platform: "Instagram", plays: 8900, embeds: 0, color: "#E4405F" },
];

const embedSites = [
  { site: "filmreviews.com", views: 12400, pages: 8 },
  { site: "indiefilmblog.net", views: 8200, pages: 5 },
  { site: "moviemagazine.co", views: 6800, pages: 12 },
  { site: "entertainment.org", views: 4500, pages: 3 },
  { site: "cinephile.io", views: 3200, pages: 4 },
];

const COLORS = ["#FF0000", "#4267B2", "#1DA1F2", "#0077B5", "#E4405F"];

export function SocialExternalSection() {
  return (
    <div className="space-y-6">
      <QuickStatsGrid
        stats={[
          { title: "Social Plays", value: "113.2K", icon: Share2, trend: 28, trendLabel: "vs last month" },
          { title: "External Embeds", value: "678", icon: Code, trend: 15, trendLabel: "vs last month" },
          { title: "Embed Views", value: "35.1K", icon: Play, trend: 22, trendLabel: "vs last month" },
          { title: "Referral Sites", value: "42", icon: Globe, iconColor: "text-[#00B4B4]" },
        ]}
      />

      <div className="grid grid-cols-2 gap-6">
        {/* Platform Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Share2 className="h-5 w-5 text-[#00B4B4]" />
              Social Platform Performance
            </CardTitle>
            <CardDescription>Plays across social platforms</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={platformData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="platform" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                  <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1e293b",
                      border: "none",
                      borderRadius: "8px",
                      color: "#fff",
                    }}
                  />
                  <Bar dataKey="plays" radius={[4, 4, 0, 0]}>
                    {platformData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Embed Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code className="h-5 w-5 text-[#00B4B4]" />
              Embed Distribution
            </CardTitle>
            <CardDescription>Where your content is embedded</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={platformData.filter(p => p.embeds > 0)}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={5}
                    dataKey="embeds"
                  >
                    {platformData.filter(p => p.embeds > 0).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap justify-center gap-4 mt-2">
              {platformData.filter(p => p.embeds > 0).map((item, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-xs text-slate-600 dark:text-muted-foreground">{item.platform}: {item.embeds}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* External Embed Sites */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ExternalLink className="h-5 w-5 text-[#00B4B4]" />
            Top Embed Sites
          </CardTitle>
          <CardDescription>External websites embedding your content</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 dark:bg-muted">
                <tr>
                  <th className="text-left p-4 text-sm font-semibold text-slate-600 dark:text-muted-foreground">Website</th>
                  <th className="text-left p-4 text-sm font-semibold text-slate-600 dark:text-muted-foreground">Views</th>
                  <th className="text-left p-4 text-sm font-semibold text-slate-600 dark:text-muted-foreground">Pages</th>
                  <th className="text-left p-4 text-sm font-semibold text-slate-600 dark:text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {embedSites.map((item, idx) => (
                  <tr key={idx} className="border-t border-slate-100 dark:border-border">
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4 text-slate-400" />
                        <span className="font-medium text-slate-900 dark:text-foreground">{item.site}</span>
                      </div>
                    </td>
                    <td className="p-4 text-slate-600 dark:text-muted-foreground">{item.views.toLocaleString()}</td>
                    <td className="p-4"><Badge variant="secondary">{item.pages} pages</Badge></td>
                    <td className="p-4">
                      <button className="text-[#00B4B4] hover:underline text-sm flex items-center gap-1">
                        <ExternalLink className="h-3 w-3" /> Visit
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
