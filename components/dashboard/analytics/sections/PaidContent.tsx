"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DollarSign, ShoppingCart, CreditCard, Tv, Users, TrendingUp, TrendingDown,
  Film, Repeat, Play, Eye
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Legend, BarChart, Bar
} from "recharts";

// TVOD data
const tvodTopContent = [
  { title: "Midnight Chronicles - Full Film", price: 14.99, purchases: 2420, rentals: 1850, revenue: 54830 },
  { title: "Ocean Depths Premium", price: 9.99, purchases: 1850, rentals: 2200, revenue: 40282 },
  { title: "Festival Collection Pass", price: 24.99, purchases: 890, rentals: 450, revenue: 33479 },
  { title: "Director's Cut Edition", price: 19.99, purchases: 650, rentals: 380, revenue: 20581 },
  { title: "Behind the Lens - Extended", price: 7.99, purchases: 1200, rentals: 980, revenue: 17402 },
];

// SVOD data
const svodPlans = [
  { name: "Basic", price: 4.99, subscribers: 12500, mrr: 62375 },
  { name: "Standard", price: 9.99, subscribers: 8200, mrr: 81918 },
  { name: "Premium", price: 14.99, subscribers: 4500, mrr: 67455 },
  { name: "Family", price: 19.99, subscribers: 2100, mrr: 41979 },
];

// AVOD data
const avodAdTypes = [
  { type: "Pre-roll", impressions: 245000, cpm: 12.50, revenue: 3063 },
  { type: "Mid-roll", impressions: 180000, cpm: 18.75, revenue: 3375 },
  { type: "Banner Overlay", impressions: 420000, cpm: 4.25, revenue: 1785 },
  { type: "Sponsored Content", impressions: 85000, cpm: 35.00, revenue: 2975 },
];

const revenueTrend = [
  { label: "Week 1", tvod: 12500, svod: 58000, avod: 2400 },
  { label: "Week 2", tvod: 18400, svod: 61000, avod: 2800 },
  { label: "Week 3", tvod: 15800, svod: 62500, avod: 3100 },
  { label: "Week 4", tvod: 22200, svod: 65000, avod: 3500 },
];

type PaidTab = "tvod" | "svod" | "avod";

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toLocaleString();
}

export function PaidContentSection() {
  const [activeTab, setActiveTab] = useState<PaidTab>("tvod");

  const tabs = [
    { key: "tvod" as PaidTab, label: "TVOD (Purchase/Rental)", icon: ShoppingCart },
    { key: "svod" as PaidTab, label: "SVOD (Subscriptions)", icon: CreditCard },
    { key: "avod" as PaidTab, label: "AVOD (Ad-supported)", icon: Tv },
  ];

  const totalTvodRevenue = tvodTopContent.reduce((sum, item) => sum + item.revenue, 0);
  const totalSvodRevenue = svodPlans.reduce((sum, plan) => sum + plan.mrr, 0);
  const totalAvodRevenue = avodAdTypes.reduce((sum, ad) => sum + ad.revenue, 0);
  const totalRevenue = totalTvodRevenue + totalSvodRevenue + totalAvodRevenue;

  return (
    <div className="space-y-6">
      {/* Total Revenue Card */}
      <Card className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border-emerald-500/20">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Paid Content Revenue</p>
              <p className="text-4xl font-bold mt-2">{formatCurrency(totalRevenue)}</p>
              <p className="text-sm text-emerald-500 mt-1 flex items-center gap-1">
                <TrendingUp className="h-4 w-4" /> +18.2% vs previous period
              </p>
            </div>
            <div className="flex gap-4">
              <div className="text-center p-3 bg-background/50 rounded-lg">
                <p className="text-xs text-muted-foreground">TVOD</p>
                <p className="text-lg font-bold">{formatCurrency(totalTvodRevenue)}</p>
              </div>
              <div className="text-center p-3 bg-background/50 rounded-lg">
                <p className="text-xs text-muted-foreground">SVOD</p>
                <p className="text-lg font-bold">{formatCurrency(totalSvodRevenue)}</p>
              </div>
              <div className="text-center p-3 bg-background/50 rounded-lg">
                <p className="text-xs text-muted-foreground">AVOD</p>
                <p className="text-lg font-bold">{formatCurrency(totalAvodRevenue)}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

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

      {/* TVOD Tab */}
      {activeTab === "tvod" && (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            <Card className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">TVOD Revenue</span>
                <DollarSign className="h-4 w-4 text-[#00B4B4]" />
              </div>
              <div className="text-2xl font-bold">{formatCurrency(totalTvodRevenue)}</div>
              <p className="text-xs text-green-600">+22% vs last month</p>
            </Card>
            <Card className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Purchases</span>
                <ShoppingCart className="h-4 w-4 text-[#00B4B4]" />
              </div>
              <div className="text-2xl font-bold">{formatNumber(7010)}</div>
              <p className="text-xs text-muted-foreground">Buy to own</p>
            </Card>
            <Card className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Rentals</span>
                <Repeat className="h-4 w-4 text-[#00B4B4]" />
              </div>
              <div className="text-2xl font-bold">{formatNumber(5860)}</div>
              <p className="text-xs text-muted-foreground">Limited access</p>
            </Card>
            <Card className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Avg. Purchase</span>
                <CreditCard className="h-4 w-4 text-[#00B4B4]" />
              </div>
              <div className="text-2xl font-bold">$15.59</div>
              <p className="text-xs text-muted-foreground">Per transaction</p>
            </Card>
            <Card className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Avg. Rental</span>
                <Film className="h-4 w-4 text-[#00B4B4]" />
              </div>
              <div className="text-2xl font-bold">$5.99</div>
              <p className="text-xs text-muted-foreground">Per rental</p>
            </Card>
            <Card className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Conversion</span>
                <TrendingUp className="h-4 w-4 text-[#00B4B4]" />
              </div>
              <div className="text-2xl font-bold">4.2%</div>
              <p className="text-xs text-muted-foreground">View to purchase</p>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Film className="h-5 w-5 text-blue-500" />
                Top TVOD Content
              </CardTitle>
              <CardDescription>Best selling videos</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 dark:bg-muted">
                    <tr>
                      <th className="text-left p-4 text-sm font-semibold text-slate-600 dark:text-muted-foreground">Title</th>
                      <th className="text-right p-4 text-sm font-semibold text-slate-600 dark:text-muted-foreground">Price</th>
                      <th className="text-right p-4 text-sm font-semibold text-slate-600 dark:text-muted-foreground">Purchases</th>
                      <th className="text-right p-4 text-sm font-semibold text-slate-600 dark:text-muted-foreground">Rentals</th>
                      <th className="text-right p-4 text-sm font-semibold text-slate-600 dark:text-muted-foreground">Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tvodTopContent.map((item, idx) => (
                      <tr key={idx} className="border-t border-slate-100 dark:border-border hover:bg-muted/50">
                        <td className="p-4 font-medium text-slate-900 dark:text-foreground">
                          <div className="flex items-center gap-2">
                            <Film className="h-4 w-4 text-blue-500" />
                            {item.title}
                          </div>
                        </td>
                        <td className="p-4 text-right font-mono text-slate-600 dark:text-muted-foreground">${item.price}</td>
                        <td className="p-4 text-right font-mono text-slate-600 dark:text-muted-foreground">{item.purchases.toLocaleString()}</td>
                        <td className="p-4 text-right font-mono text-slate-600 dark:text-muted-foreground">{item.rentals.toLocaleString()}</td>
                        <td className="p-4 text-right font-mono font-bold text-emerald-500">{formatCurrency(item.revenue)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* SVOD Tab */}
      {activeTab === "svod" && (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            <Card className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">MRR</span>
                <DollarSign className="h-4 w-4 text-[#00B4B4]" />
              </div>
              <div className="text-2xl font-bold">{formatCurrency(totalSvodRevenue)}</div>
              <p className="text-xs text-green-600">+15% vs last month</p>
            </Card>
            <Card className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Active Subscribers</span>
                <Users className="h-4 w-4 text-[#00B4B4]" />
              </div>
              <div className="text-2xl font-bold">{formatNumber(27300)}</div>
              <p className="text-xs text-green-600">+8% vs last month</p>
            </Card>
            <Card className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">New Subscribers</span>
                <TrendingUp className="h-4 w-4 text-[#00B4B4]" />
              </div>
              <div className="text-2xl font-bold">{formatNumber(2450)}</div>
              <p className="text-xs text-muted-foreground">This period</p>
            </Card>
            <Card className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Churn Rate</span>
                <TrendingDown className="h-4 w-4 text-amber-500" />
              </div>
              <div className="text-2xl font-bold">3.2%</div>
              <p className="text-xs text-green-600">-0.5% vs last month</p>
            </Card>
            <Card className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Avg. LTV</span>
                <CreditCard className="h-4 w-4 text-[#00B4B4]" />
              </div>
              <div className="text-2xl font-bold">$142.50</div>
              <p className="text-xs text-muted-foreground">Lifetime value</p>
            </Card>
            <Card className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Plans</span>
                <Film className="h-4 w-4 text-[#00B4B4]" />
              </div>
              <div className="text-2xl font-bold">4</div>
              <p className="text-xs text-muted-foreground">Active tiers</p>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-[#00B4B4]" />
                Subscription Plans
              </CardTitle>
              <CardDescription>Revenue breakdown by tier</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={svodPlans}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                    <YAxis yAxisId="left" tick={{ fontSize: 12 }} stroke="#94a3b8" tickFormatter={(v) => `$${v / 1000}k`} />
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
                    <Bar yAxisId="left" dataKey="mrr" name="MRR" fill="#10b981" radius={[4, 4, 0, 0]} />
                    <Bar yAxisId="right" dataKey="subscribers" name="Subscribers" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* AVOD Tab */}
      {activeTab === "avod" && (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            <Card className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Ad Revenue</span>
                <DollarSign className="h-4 w-4 text-[#00B4B4]" />
              </div>
              <div className="text-2xl font-bold">{formatCurrency(totalAvodRevenue)}</div>
              <p className="text-xs text-green-600">+28% vs last month</p>
            </Card>
            <Card className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Impressions</span>
                <Eye className="h-4 w-4 text-[#00B4B4]" />
              </div>
              <div className="text-2xl font-bold">{formatNumber(930000)}</div>
              <p className="text-xs text-muted-foreground">Ads served</p>
            </Card>
            <Card className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Avg. CPM</span>
                <TrendingUp className="h-4 w-4 text-[#00B4B4]" />
              </div>
              <div className="text-2xl font-bold">$12.05</div>
              <p className="text-xs text-muted-foreground">Cost per mille</p>
            </Card>
            <Card className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Fill Rate</span>
                <Play className="h-4 w-4 text-[#00B4B4]" />
              </div>
              <div className="text-2xl font-bold">94.2%</div>
              <p className="text-xs text-muted-foreground">Inventory filled</p>
            </Card>
            <Card className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Avg. Watch Time</span>
                <Film className="h-4 w-4 text-[#00B4B4]" />
              </div>
              <div className="text-2xl font-bold">18:42</div>
              <p className="text-xs text-muted-foreground">Per session</p>
            </Card>
            <Card className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Ad Types</span>
                <Tv className="h-4 w-4 text-[#00B4B4]" />
              </div>
              <div className="text-2xl font-bold">4</div>
              <p className="text-xs text-muted-foreground">Active formats</p>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Tv className="h-5 w-5 text-purple-500" />
                Ad Format Performance
              </CardTitle>
              <CardDescription>Revenue by ad type</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 dark:bg-muted">
                    <tr>
                      <th className="text-left p-4 text-sm font-semibold text-slate-600 dark:text-muted-foreground">Ad Type</th>
                      <th className="text-right p-4 text-sm font-semibold text-slate-600 dark:text-muted-foreground">Impressions</th>
                      <th className="text-right p-4 text-sm font-semibold text-slate-600 dark:text-muted-foreground">CPM</th>
                      <th className="text-right p-4 text-sm font-semibold text-slate-600 dark:text-muted-foreground">Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {avodAdTypes.map((ad, idx) => (
                      <tr key={idx} className="border-t border-slate-100 dark:border-border hover:bg-muted/50">
                        <td className="p-4 font-medium text-slate-900 dark:text-foreground">
                          <div className="flex items-center gap-2">
                            <Tv className="h-4 w-4 text-purple-500" />
                            {ad.type}
                          </div>
                        </td>
                        <td className="p-4 text-right font-mono text-slate-600 dark:text-muted-foreground">{formatNumber(ad.impressions)}</td>
                        <td className="p-4 text-right font-mono text-slate-600 dark:text-muted-foreground">${ad.cpm.toFixed(2)}</td>
                        <td className="p-4 text-right font-mono font-bold text-emerald-500">{formatCurrency(ad.revenue)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Revenue Trend Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-[#00B4B4]" />
            Revenue Trend by Model
          </CardTitle>
          <CardDescription>TVOD, SVOD, and AVOD over time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="label" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" tickFormatter={(v) => `$${v / 1000}k`} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1e293b",
                    border: "none",
                    borderRadius: "8px",
                    color: "#fff",
                  }}
                  formatter={(value: number) => [formatCurrency(value), ""]}
                />
                <Legend />
                <Area type="monotone" dataKey="tvod" stackId="1" name="TVOD" stroke="#10b981" fill="#10b981" fillOpacity={0.6} />
                <Area type="monotone" dataKey="svod" stackId="1" name="SVOD" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
                <Area type="monotone" dataKey="avod" stackId="1" name="AVOD" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.6} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
