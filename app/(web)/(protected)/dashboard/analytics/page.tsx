"use client";

import { RoleGuard } from "@/components/dashboard/common/RoleGuard";
import SearchMediaInput from "@/components/dashboard/common/SearchMediaInput";
import PageTitle from "@/components/dashboard/layout/PageTitle";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import InputEnhanced from "@/components/ui/input-enhanced";
import { Skeleton } from "@/components/ui/skeleton";
import {
  contentTypeOptions,
  countryOptions,
  dateRangeOptions,
  deviceOptions,
  sourceOptions,
} from "@/config/analytics";
import { useCompany, useCompanyAnalytics } from "@/hooks/useCompanies";
import {
  cn,
  formateSeconds,
  formatNumber,
  getChartInterval,
} from "@/lib/utils";
import { ICompanyAnalyticsFilters, IMedia } from "@/types";
import { Clock, DollarSign, Eye, Funnel, User, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Label,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const AnalyticsPageContent = () => {
  const [filters, setFilters] = useState<ICompanyAnalyticsFilters>({
    dateRange: "30d",
    contentType: "",
    source: "",
    device: "",
    type: "",
    country: "",
    mediaId: "",
  });

  const [inputValue, setInputValue] = useState("");

  const [selectedMedia, setSelectedMedia] = useState<IMedia | undefined>(
    undefined
  );

  const handleChange = (key: keyof typeof filters, value: string) => {
    setFilters({ ...filters, [key]: value });
  };

  const clearFilter = (key: keyof typeof filters) => {
    if (key === "mediaId") {
      setSelectedMedia(undefined);
    }
    setFilters((prev) => ({
      ...prev,
      [key]: key === "dateRange" ? "30d" : "",
    }));
  };
  const clearAllFilters = () => {
    setFilters({
      dateRange: "30d",
      contentType: "",
      source: "",
      device: "",
      type: "",
      country: "",
      mediaId: "",
    });
    setSelectedMedia(undefined);
    setInputValue("empty");
  };

  // Map filter keys to labels and value display
  const filterLabels: Record<string, string> = {
    dateRange: "Date Range",
    contentType: "Content Type",
    source: "Source",
    device: "Device",
    type: "Type",
    country: "Country",
    mediaId: "Media",
  };
  // Optionally, map values to display labels if needed
  const getFilterValueLabel = (key: keyof typeof filters, value: string) => {
    if (key === "dateRange") {
      const opt = dateRangeOptions.find((o) => o.value === value);
      return opt ? opt.label : value;
    }
    if (key === "contentType") {
      const opt = contentTypeOptions.find((o) => o.value === value);
      return opt ? opt.label : value;
    }
    if (key === "source") {
      const opt = sourceOptions.find((o) => o.value === value);
      return opt ? opt.label : value;
    }
    if (key === "device") {
      const opt = deviceOptions.find((o) => o.value === value);
      return opt ? opt.label : value;
    }
    if (key === "mediaId") {
      return selectedMedia?.metadata?.title || selectedMedia?.name || value;
    }
    // Add more mappings as needed
    return value;
  };
  const activeFilters = Object.entries(filters).filter(([key, value]) =>
    key === "dateRange" ? value !== "30d" : value
  );

  const { data: company } = useCompany();
  const {
    data: analytics,
    isLoading,
    isError,
    error,
    refetch,
  } = useCompanyAnalytics(company?.id ?? "", filters);

  const getViewsChartData = () => {
    if (!analytics?.viewsChart) return [];

    return analytics.viewsChart.map((v) => ({
      day: v.date,
      views: v.views,
      public: v.public ?? 0,
      shared: v.shared ?? 0,
      private: v.private ?? 0,
      paywall: v.paywall ?? 0,
    }));
  };

  const viewsChartData = getViewsChartData();

  return (
    <>
      <PageTitle
        title="Analytics"
        description="Track your content performance and audience insights"
        content={null}
      />

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Funnel size={16} />
              Analytics
            </div>
            {/* <Button variant="secondary" onClick={() => refetch()}>
              <Download className="w-4 h-4" /> Download
            </Button> */}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <SearchMediaInput
            onSelectMedia={(media) => {
              setSelectedMedia(media);
              handleChange("mediaId", media.id);
              setInputValue("");
            }}
            setSelectedMedia={setSelectedMedia}
            selectedMedia={selectedMedia}
          />
          <div className="grid grid-cols-[repeat(auto-fit,minmax(100px,1fr))] gap-4 items-center">
            <InputEnhanced
              select
              options={dateRangeOptions}
              label="Date Range"
              placeholder="Select a date range"
              onSelectChange={(value) => handleChange("dateRange", value)}
              value={filters.dateRange}
            />
            {/* <InputEnhanced
              select
              options={sourceOptions}
              label="Source"
              placeholder="Select a source"
              onSelectChange={(value) => handleChange("source", value)}
              value={filters.source}
            /> */}
            <InputEnhanced
              select
              options={deviceOptions}
              label="Device"
              placeholder="Select a device"
              onSelectChange={(value) => handleChange("device", value)}
              value={filters.device}
            />
            <InputEnhanced
              select
              options={contentTypeOptions}
              label="Content Type"
              placeholder="Select a content type"
              onSelectChange={(value) => handleChange("contentType", value)}
              value={filters.contentType}
            />
            <InputEnhanced
              select
              options={countryOptions}
              label="Country"
              placeholder="Select a country"
              onSelectChange={(value) => handleChange("country", value)}
              value={filters.country}
            />
          </div>
          {/* Active filter pills */}
          {activeFilters.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {activeFilters.map(([key, value]) => (
                <Badge
                  key={key}
                  variant="secondary"
                  onClick={() => clearFilter(key as keyof typeof filters)}
                  className="rounded-full cursor-pointer"
                >
                  {filterLabels[key]}:{" "}
                  {getFilterValueLabel(key as keyof typeof filters, value)}
                  <X size={14} className="ml-1" />
                </Badge>
              ))}
              <Badge
                variant="outline"
                className="rounded-full cursor-pointer"
                onClick={clearAllFilters}
              >
                Clear All
                <X size={14} className="ml-1" />
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>

      {isError && (
        <div className="w-full flex justify-center items-center py-12">
          <span className="text-red-500">
            Error loading analytics: {error?.message}
          </span>
        </div>
      )}

      {/* Stats Cards */}
      {isLoading ? (
        <div className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-3 ">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-32 mb-2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-10 w-24 mb-2" />
                <Skeleton className="h-4 w-20" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        analytics &&
        !isError && (
          <div className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-3 ">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  Total Earnings <DollarSign size={16} />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${formatNumber(analytics.totalEarnings ?? 0)}
                </div>
                <div
                  className={cn(
                    "text-xs font-semibold mt-1",
                    analytics.earningsChange > 0
                      ? "text-green-400"
                      : "text-red-400"
                  )}
                >
                  {analytics.earningsChange > 0
                    ? `+${analytics.earningsChange}%`
                    : `${analytics.earningsChange}%`}{" "}
                  from last month
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  Total Time Viewed <Clock size={16} />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formateSeconds(analytics.totalWatchTime ?? 0)}
                </div>
                <div
                  className={cn(
                    "text-xs font-semibold mt-1",
                    analytics.watchTimeChange > 0
                      ? "text-green-400"
                      : "text-red-400"
                  )}
                >
                  {analytics.watchTimeChange > 0
                    ? `+${analytics.watchTimeChange}%`
                    : `${analytics.watchTimeChange}%`}{" "}
                  from last month
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  Unique Viewers <User size={16} />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatNumber(analytics.uniqueViewers ?? 0)}
                </div>
                <div
                  className={cn(
                    "text-xs font-semibold mt-1",
                    analytics.uniqueViewersChange > 0
                      ? "text-green-400"
                      : "text-red-400"
                  )}
                >
                  {analytics.uniqueViewersChange > 0
                    ? `+${analytics.uniqueViewersChange}%`
                    : `${analytics.uniqueViewersChange}%`}{" "}
                  from last month
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  Total Views <Eye size={16} />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatNumber(analytics.totalViews ?? 0)}
                </div>
                <div
                  className={cn(
                    "text-xs font-semibold mt-1",
                    analytics.viewsChange > 0
                      ? "text-green-400"
                      : "text-red-400"
                  )}
                >
                  {analytics.viewsChange > 0
                    ? `+${analytics.viewsChange}%`
                    : `${analytics.viewsChange}%`}{" "}
                  from last month
                </div>
              </CardContent>
            </Card>
          </div>
        )
      )}

      {/* Main Content: Views Over Time & Top Countries */}
      {isLoading ? (
        <div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-3">
          {/* Views Over Time Skeleton */}
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32 mb-2" />
              <Skeleton className="h-4 w-40" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-56 w-full mb-4" />
              <div className="flex justify-between text-xs text-muted-foreground mt-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-16" />
              </div>
            </CardContent>
          </Card>
          {/* Top Countries Skeleton */}
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32 mb-2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-40 w-full" />
            </CardContent>
          </Card>
        </div>
      ) : (
        analytics &&
        !isError && (
          <div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-3">
            {/* Views Over Time */}
            <Card>
              <CardHeader>
                <CardTitle>Views Over Time</CardTitle>
                <CardDescription>
                  Daily views for the selected period
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={viewsChartData}
                      margin={{ top: 10, right: 20, left: 0, bottom: 30 }}
                    >
                      <CartesianGrid
                        stroke="#333"
                        strokeDasharray="3 3"
                        vertical={false}
                      />
                      <XAxis
                        dataKey="day"
                        tick={{ fill: "#fff", fontSize: 10 }}
                        axisLine={{ stroke: "#444" }}
                        tickLine={false}
                        interval={getChartInterval(analytics.viewsChart ?? [])}
                        angle={-35}
                        textAnchor="end"
                        height={50}
                      />
                      <YAxis
                        tick={{ fill: "#fff", fontSize: 12 }}
                        axisLine={{ stroke: "#444" }}
                        tickLine={false}
                        width={40}
                          domain={[0, Math.max(...(viewsChartData.map((v) => v.views ?? 0) ?? [0]))]}
                          tickFormatter={(value) => formatNumber(value)}
                      />
                      <Tooltip
                        contentStyle={{
                          background: "#18181b",
                          border: "none",
                          borderRadius: 8,
                          color: "#fff",
                        }}
                        labelStyle={{ color: "#fff" }}
                        cursor={{ fill: "rgba(34,211,238,0.15)" }}
                        formatter={(value: number, name: string) => [
                          formatNumber(value),
                          name.charAt(0).toUpperCase() + name.slice(1),
                        ]}
                      />
                      <Legend
                        wrapperStyle={{ paddingTop: "20px" }}
                        iconType="rect"
                        formatter={(value) =>
                          value.charAt(0).toUpperCase() + value.slice(1)
                        }
                      />
                      <Bar
                        dataKey="public"
                        stackId="views"
                        fill="#10b981"
                        radius={[0, 0, 0, 0]}
                      />
                      <Bar
                        dataKey="shared"
                        stackId="views"
                        fill="#3b82f6"
                        radius={[0, 0, 0, 0]}
                      />
                      <Bar
                        dataKey="private"
                        stackId="views"
                        fill="#f59e0b"
                        radius={[0, 0, 0, 0]}
                      />
                      <Bar
                        dataKey="paywall"
                        stackId="views"
                        fill="#22d3ee"
                        radius={[6, 6, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex flex-wrap justify-between gap-2 text-xs text-muted-foreground mt-2">
                  <div className="flex flex-wrap gap-4">
                    <span>
                      Peak:{" "}
                      {formatNumber(Math.max(
                        ...(viewsChartData.map((v) => v.views ?? 0) ?? [0])
                      ))}{" "}
                      views
                    </span>
                    <span>
                      Average:{" "}
                      {viewsChartData.length > 0
                        ? formatNumber(Math.round(
                            viewsChartData.reduce((sum, v) => sum + (v.views ?? 0)  , 0) /
                              viewsChartData.length
                          ))
                        : 0}{" "}
                      views
                    </span>
                    <span>
                      Total:{" "}
                      {formatNumber(viewsChartData.reduce((sum, v) => sum + (v.views ?? 0), 0))}{" "}
                      views
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-4 text-xs">
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-[#10b981]"></span>
                      Public:{" "}
                      {formatNumber(
                        viewsChartData.reduce((sum, v) => sum + (v.public ?? 0), 0)
                      )}
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-[#3b82f6]"></span>
                      Shared:{" "}
                      {formatNumber(
                        viewsChartData.reduce((sum, v) => sum + (v.shared ?? 0), 0)
                      )}
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-[#f59e0b]"></span>
                      Private:{" "}
                      {formatNumber(
                        viewsChartData.reduce((sum, v) => sum + (v.private ?? 0), 0)
                      )}
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-[#22d3ee]"></span>
                      Paywall:{" "}
                      {formatNumber(
                        viewsChartData.reduce((sum, v) => sum + (v.paywall ?? 0), 0)
                      )}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
            {/* Top Countries */}
            <Card>
              <CardHeader>
                <CardTitle>Top Countries</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="text-left text-muted-foreground border-b border-muted-foreground/10">
                        <th className="py-2 pr-4">COUNTRY</th>
                        <th className="py-2 pr-4">VIEW DURATION</th>
                        <th className="py-2 pr-4">TOTAL VIEWS</th>
                        <th className="py-2">UNIQUE VIEWERS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analytics.countriesData?.map((c) => (
                        <tr
                          key={c.country}
                          className="border-b border-muted-foreground/5"
                        >
                          <td className="py-2 pr-4">{c.country}</td>
                          <td className="py-2 pr-4">{formateSeconds(c.viewDuration)}</td>
                          <td className="py-2 pr-4">{formatNumber(c.totalViews)}</td>
                          <td className="py-2">{formatNumber(c.uniqueViews)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        )
      )}

      {/* Device Breakdown & Top Performing SmartLinks */}
      {isLoading ? (
        <div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-3">
          {/* Device Breakdown Skeleton */}
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32 mb-2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-32 w-full mb-4" />
              <Skeleton className="h-40 w-full" />
            </CardContent>
          </Card>
        </div>
      ) : (
        analytics &&
        !isError && (
          <div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-3">
            {/* Device Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Device Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="w-full">
                  <table className="min-w-full text-sm mb-4">
                    <thead>
                      <tr className="text-left text-muted-foreground border-b border-muted-foreground/10">
                        <th className="py-2 pr-4">DEVICE</th>
                        <th className="py-2 pr-4">VIEWS</th>
                        <th className="py-2">PERCENTAGE</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analytics?.devicesData?.map((device) => {
                        return (
                          <tr key={device.name}>
                            <td className="py-2 pr-4 flex items-center gap-2 capitalize">
                              <span
                                className={`inline-block w-3 h-3 rounded-full`}
                                style={{ background: device?.fill || "#888" }}
                              ></span>
                              {device.name}
                            </td>
                            <td className="py-2 pr-4">{formatNumber(device.views ?? 0)}</td>
                            <td className="py-2">{device.value}%</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  <div className="flex justify-center items-center mt-2">
                    <PieChart width={150} height={150}>
                      <Pie
                        data={analytics.devicesData ?? []}
                        dataKey="views"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={48}
                        outerRadius={65}
                        paddingAngle={2}
                        startAngle={90}
                        endAngle={-270}
                      >
                        {(analytics.devicesData ?? []).map((entry, idx) => (
                          <Cell
                            key={`cell-${idx}`}
                            fill={entry.fill || "#888"}
                          />
                        ))}
                        <Label
                          value={(
                            formatNumber(analytics.devicesData?.reduce(
                              (sum, d) => sum + (d.views ?? 0),
                              0
                            ) ?? 0)
                          )}
                          position="center"
                          style={{
                            fill: "#fff",
                            fontWeight: "bold",
                            fontSize: 22,
                            dominantBaseline: "middle",
                          }}
                        />
                      </Pie>
                      <text
                        x={75}
                        y={100}
                        textAnchor="middle"
                        fontSize={13}
                        fill="#fff"
                      >
                        Total Views
                      </text>
                    </PieChart>
                  </div>
                </div>
              </CardContent>
            </Card>
            {/* Top Performing SmartLinks */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path
                      d="M10 2L12.4721 7.52786L18.541 8.1459L13.7705 12.2221L15.1803 18.1041L10 15L4.81966 18.1041L6.22948 12.2221L1.45898 8.1459L7.52786 7.52786L10 2Z"
                      fill="#22d3ee"
                    />
                  </svg>
                  Top Performing SmartLinks
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm mb-4">
                    <thead>
                      <tr className="text-left text-muted-foreground border-b border-muted-foreground/10">
                        <th className="py-2 pr-4">NAME</th>
                        <th className="py-2 pr-4">CLICKS</th>
                        <th className="py-2 pr-4">TYPE</th>
                        <th className="py-2">REVENUE</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analytics.topSmartLinks?.map((sl, index) => {
                        // Color for type pill
                        const typeColor =
                          sl.type === "PAYWALL"
                            ? "border-accent text-accent"
                            : sl.type === "SHARED"
                            ? "border-blue-400 text-blue-300"
                            : sl.type === "PRIVATE"
                            ? "border-white text-white"
                            : "border-neutral-500 text-neutral-500";
                        return (
                          <tr key={sl.id}>
                            <td className="py-2 pr-4 flex items-center gap-2 max-w-[180px] truncate">
                              <span
                                className={`inline-flex items-center justify-center w-6 h-6 rounded-full font-bold text-xs bg-accent text-black shrink-0`}
                              >
                                {index + 1}
                              </span>
                              <span className="truncate" title={sl.name}>
                                {sl.name}
                              </span>
                            </td>
                            <td className="py-2 pr-4 font-semibold">
                              {formatNumber(sl.clicks ?? 0)}
                            </td>
                            <td className="py-2 pr-4">
                              <Badge
                                variant="outline"
                                className={cn(typeColor)}
                              >
                                {sl.type}
                              </Badge>
                            </td>
                            <td className="py-2 text-accent font-semibold">
                              ${formatNumber(sl.revenue ?? 0)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  <Button variant="outline" className="w-full mt-2" asChild>
                    <Link href="/dashboard/analytics">
                      View All SmartLinks
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )
      )}
    </>
  );
};

const AnalyticsPage = () => {
  return (
    <RoleGuard requiredPermission="analytics:read">
      <AnalyticsPageContent />
    </RoleGuard>
  );
};

export default AnalyticsPage;
