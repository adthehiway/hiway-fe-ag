"use client";
import VideoUploadModal from "@/components/dashboard/common/VideoUploadModal";
import PageTitle from "@/components/dashboard/layout/PageTitle";
import GettingStarted from "@/components/dashboard/overview/GettingStarted";
import LatestUpload from "@/components/dashboard/overview/LatestUpload";
import QuickActions from "@/components/dashboard/overview/QuickActions";
import UploadVideo from "@/components/dashboard/overview/uploadVideo";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { defaultLayouts } from "@/config/dashboard/layout";
import { analytics } from "@/config/dashboard/overview";
import { useDashboardOverview } from "@/hooks/useDashboardOverview";
import { useEffect, useState } from "react";
import { Layout, Responsive, WidthProvider } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import {
  Ellipsis,
  Eye,
  Move,
  Play,
  RefreshCcw,
  Save,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { formatNumber, getFromLocalStorage, saveToLocalStorage } from "@/lib/utils";
import { RoleGuard } from "@/components/dashboard/common/RoleGuard";
import { getFirstAccessibleRoute } from "@/lib/getAccessibleRoute";
import { useUser } from "@/hooks/useUser";
import { useEffectiveRole } from "@/hooks/useUserRole";
import { hasPermission } from "@/lib/permissions";
import { Loader } from "@/components/ui/loader";

const ResponsiveReactGridLayout = WidthProvider(Responsive);

const DashboardPageContent = () => {
  const router = useRouter();
  const { data: user } = useUser();
  const { data, isLoading, isError, isEmpty, error, refetch } =
    useDashboardOverview();
  const overviewData = data ?? null;
  const [editMode, setEditMode] = useState(false);
  const [layouts, setLayouts] = useState<Record<string, Layout[]>>(
    () => getFromLocalStorage("dashboard-layouts") || defaultLayouts
  );
  const [currentBreakpoint, setCurrentBreakpoint] = useState("lg");
  const [uploadModelOpen, setUploadModelOpen] = useState(false);
  const [parentFiles, setParentFiles] = useState<File[]>([]);
  const [getStartedClosed, setGetStartedClosed] = useState(false);

  useEffect(() => {
    const getStartedClosed = getFromLocalStorage("get-started-closed");
    if (getStartedClosed) {
      setGetStartedClosed(true);
    } else {
      setGetStartedClosed(false);
    }
  }, []);

  const handleGetStartedClosed = () => {
    saveToLocalStorage("get-started-closed", "true");
    setGetStartedClosed(true);
  };

  const handleBreakpointChange = (breakpoint: string) => {
    setCurrentBreakpoint(breakpoint);
  };

  const handleLayoutChange = (layout: Layout[]) => {
    const newLayouts = { ...layouts, [currentBreakpoint]: layout };
    setLayouts(newLayouts);
  };

  const handleResetLayout = () => {
    setLayouts(defaultLayouts);
    saveToLocalStorage("dashboard-layouts", defaultLayouts);
  };

  const getAnalyticsData = (key: string) => {
    return overviewData?.analytics?.find(
      (item: { key: string }) => item.key === key
    );
  };

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
            Welcome back, {user?.firstName || 'Creator'}
          </h1>
          <p className="text-slate-500 mt-1 text-sm">
            Here's what's happening with your content today
          </p>
        </div>
        <div className="flex gap-2">
          {editMode ? (
            <>
              <button
                onClick={() => {
                  saveToLocalStorage("dashboard-layouts", layouts);
                  setEditMode((v) => !v);
                }}
                className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-2xl bg-[#00B4B4] text-white hover:bg-[#00a0a0] transition-all duration-200"
              >
                <Save className="h-4 w-4" />
                Save Layout
              </button>
              <button
                onClick={handleResetLayout}
                className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-2xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all duration-200"
              >
                <RefreshCcw className="h-4 w-4" />
                Reset
              </button>
            </>
          ) : (
            <button
              onClick={() => setEditMode((v) => !v)}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-2xl bg-white text-slate-700 hover:bg-slate-50 transition-all duration-200 border border-slate-200 shadow-sm"
            >
              <Move className="h-4 w-4" />
              Customize
            </button>
          )}
        </div>
      </div>

      <ResponsiveReactGridLayout
        layouts={layouts}
        onBreakpointChange={handleBreakpointChange}
        onLayoutChange={handleLayoutChange}
        autoSize
        breakpoints={{ lg: 1200, md: 996, sm: 768 }}
        cols={{ lg: 12, md: 10, sm: 6 }}
        rowHeight={42}
        isDraggable={editMode}
        isResizable={editMode}
        measureBeforeMount={false}
        useCSSTransforms={false}
        compactType="vertical"
        preventCollision={!editMode}
      >
        {!getStartedClosed && (
          <GettingStarted
            isLoading={isLoading}
            key="getStarted"
            getStartedClosed={getStartedClosed}
            handleGetStartedClosed={handleGetStartedClosed}
          />
        )}
        <QuickActions isLoading={isLoading} key="quickActions" />
        <UploadVideo
          key="uploadMedia"
          setParentFiles={(files) => {
            if (files.length) {
              setParentFiles(files);
              setUploadModelOpen(true);
            }
          }}
        />
        <LatestUpload
          key="latestUpload"
          overviewData={overviewData}
          isLoading={isLoading}
        />
        {analytics.map((item, index) =>
          isLoading ? (
            <div key={`analytics-${index}`} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <Skeleton className="h-5 w-24 mb-4" />
              <Skeleton className="h-8 w-20 mb-2" />
              <Skeleton className="h-4 w-32" />
            </div>
          ) : (
            <div key={`analytics-${index}`} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-all duration-300">
              <div className="flex items-center justify-between mb-3">
                <span className="text-slate-500 text-sm font-medium">{item.title}</span>
                <div className="w-8 h-8 rounded-lg bg-[#00B4B4]/10 flex items-center justify-center">
                  <item.icon className="h-4 w-4 text-[#00B4B4]" />
                </div>
              </div>
              <div className="text-3xl font-bold text-slate-900 mb-1">
                {formatNumber(getAnalyticsData(item.key)?.value ?? 0)}
              </div>
              <div className="flex items-center gap-1 text-sm">
                {(getAnalyticsData(item.key)?.change ?? 0) >= 0 ? (
                  <TrendingUp className="h-3 w-3 text-emerald-500" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-rose-500" />
                )}
                <span className={(getAnalyticsData(item.key)?.change ?? 0) >= 0 ? "text-emerald-600 font-medium" : "text-rose-600 font-medium"}>
                  {(getAnalyticsData(item.key)?.change ?? 0) >= 0 ? "+" : ""}
                  {getAnalyticsData(item.key)?.change ?? 0}%
                </span>
                <span className="text-slate-400">from last month</span>
              </div>
            </div>
          )
        )}
        {isLoading ? (
          <div key="revenueOverview" className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <Skeleton className="h-6 w-40 mb-2" />
            <Skeleton className="h-4 w-64 mb-6" />
            <div className="space-y-4">
              {[...Array(6)].map((_, index) => (
                <div key={index} className="flex items-center gap-3">
                  <Skeleton className="h-4 w-8" />
                  <Skeleton className="h-2 w-full rounded-full" />
                  <Skeleton className="h-4 w-16" />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div key="revenueOverview" className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Revenue Overview</h3>
                <p className="text-sm text-slate-500">Monthly revenue from premium content</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-slate-900">
                  ${formatNumber(overviewData?.revenueOverview?.currentMonth?.value ?? 0)}
                </p>
                <div className="flex items-center justify-end gap-1 mt-1">
                  {(overviewData?.revenueOverview?.currentMonth?.change ?? 0) > 0 ? (
                    <TrendingUp size={14} className="text-emerald-500" />
                  ) : (
                    <TrendingDown size={14} className="text-rose-500" />
                  )}
                  <span className={(overviewData?.revenueOverview?.currentMonth?.change ?? 0) > 0 ? "text-emerald-600 text-sm font-medium" : "text-rose-600 text-sm font-medium"}>
                    {(overviewData?.revenueOverview?.currentMonth?.change ?? 0) > 0 ? "+" : ""}
                    {overviewData?.revenueOverview?.currentMonth?.change ?? 0}%
                  </span>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              {overviewData?.revenueOverview?.monthly?.map(
                (item: { label: string; value: number }, index: number) => (
                  <div key={index} className="flex items-center gap-3">
                    <span className="text-sm text-slate-500 w-10">
                      {item.label}
                    </span>
                    <div className="flex-1 bg-slate-100 rounded-full h-2 relative overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-[#00B4B4] to-[#00d4d4] h-full rounded-full transition-all duration-500"
                        style={{ width: `${Math.min((item.value / 3000) * 100, 100)}%` }}
                      />
                    </div>
                    <span className="text-sm text-slate-900 w-16 text-right font-medium">
                      ${formatNumber(item.value)}
                    </span>
                  </div>
                )
              )}
            </div>
            <div className="grid grid-cols-3 gap-4 pt-5 mt-5 border-t border-slate-100">
              <div className="text-center">
                <p className="text-xl font-bold text-slate-900">
                  ${formatNumber(overviewData?.revenueOverview?.projectedAnnual ?? 0)}
                </p>
                <p className="text-xs text-slate-500 mt-1">Projected Annual</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-bold text-slate-900">
                  ${formatNumber(overviewData?.revenueOverview?.avgMonthly ?? 0)}
                </p>
                <p className="text-xs text-slate-500 mt-1">Avg Monthly</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-bold text-emerald-600">
                  +{overviewData?.revenueOverview?.avgGrowth ?? 0}%
                </p>
                <p className="text-xs text-slate-500 mt-1">Avg Growth</p>
              </div>
            </div>
          </div>
        )}

        <div key="topContent" className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="mb-5">
            <h3 className="text-lg font-semibold text-slate-900">Top Performing Content</h3>
            <p className="text-sm text-slate-500">Your highest engagement and revenue generating content</p>
          </div>
          <div className="space-y-3">
            {isLoading ? (
              <>
                {[...Array(3)].map((_, index) => (
                  <div key={index} className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
                    <Skeleton className="w-8 h-8 rounded-full" />
                    <Skeleton className="w-8 h-8 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-5 w-32" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  </div>
                ))}
              </>
            ) : (
              <>
                {overviewData?.topPerformingContent &&
                overviewData?.topPerformingContent.length > 0 ? (
                  overviewData?.topPerformingContent.map(
                    (
                      item: {
                        id: string;
                        title: string;
                        views: number;
                        revenue: number;
                        genre?: string;
                        rating?: string;
                      },
                      index: number
                    ) => (
                      <div
                        key={index}
                        className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100 hover:bg-slate-100 transition-all duration-200"
                      >
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#0f172a] flex items-center justify-center text-sm font-bold text-white">
                          {index + 1}
                        </div>
                        <button className="flex-shrink-0 w-8 h-8 rounded-full border-2 border-[#00B4B4] flex items-center justify-center text-[#00B4B4] hover:bg-[#00B4B4]/10 transition-colors">
                          <Play size={14} />
                        </button>
                        <div className="flex-1 min-w-0 space-y-2">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-slate-900 truncate text-sm mb-1">
                                {item.title}
                              </h4>
                              <div className="flex items-center gap-3 text-sm text-slate-500">
                                <span className="flex items-center gap-1">
                                  <Eye size={12} />
                                  {formatNumber(item.views)}
                                </span>
                              </div>
                            </div>
                            <div className="flex-shrink-0 text-right">
                              <div className="text-emerald-600 font-bold text-sm">
                                ${formatNumber(item.revenue)}
                              </div>
                              <div className="text-xs text-slate-400">
                                revenue
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {item.genre && (
                                <div className="text-xs px-2 py-1 bg-[#0f172a]/10 text-[#0f172a] rounded-full font-medium">
                                  {item.genre}
                                </div>
                              )}
                              {item.rating && (
                                <div className="text-xs px-3 py-1 border border-amber-300 bg-amber-50 rounded-full text-amber-700 font-medium">
                                  {item.rating}
                                </div>
                              )}
                            </div>
                            <Button size="iconSm" variant={"ghost"} className="text-slate-400 hover:text-slate-900 hover:bg-slate-200">
                              <Ellipsis size={16} />
                            </Button>
                          </div>
                        </div>
                      </div>
                    )
                  )
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-slate-400">
                    Your top performing content will appear here
                  </div>
                )}
                <button
                  className="w-full mt-4 py-3 rounded-xl bg-[#0f172a] hover:bg-[#1e293b] text-white font-semibold text-sm transition-all duration-200"
                  onClick={() => router.push("/dashboard/content-library")}
                >
                  View All Content Analytics
                </button>
              </>
            )}
          </div>
        </div>
      </ResponsiveReactGridLayout>
      <VideoUploadModal
        isOpen={uploadModelOpen}
        onClose={() => setUploadModelOpen(false)}
        parentFiles={parentFiles}
      />
    </div>
  );
};

export default function DashboardPage() {
  const { data: user, isLoading: userLoading } = useUser();
  const effectiveRole = useEffectiveRole();
  const router = useRouter();

  useEffect(() => {
    // Wait for user and role to load
    if (userLoading || !effectiveRole || !user) return;

    // Check if user has dashboard access
    const hasDashboardAccess =
      hasPermission(effectiveRole, "dashboard:read", user) ||
      hasPermission(effectiveRole, "dashboard:*", user);

    // If no dashboard access, redirect to first accessible route
    if (!hasDashboardAccess) {
      const accessibleRoute = getFirstAccessibleRoute(effectiveRole, user);
      if (accessibleRoute && accessibleRoute !== "/dashboard") {
        router.replace(accessibleRoute);
        return;
      }
    }
  }, [userLoading, effectiveRole, user, router]);

  // Show loader while checking or redirecting
  if (userLoading || !effectiveRole || !user) {
    return <Loader fullScreen />;
  }

  // Check if user has dashboard access (after loading)
  const hasDashboardAccess =
    hasPermission(effectiveRole, "dashboard:read", user) ||
    hasPermission(effectiveRole, "dashboard:*", user);

  // If no dashboard access, show loader while redirecting
  if (!hasDashboardAccess) {
    const accessibleRoute = getFirstAccessibleRoute(effectiveRole, user);
    if (accessibleRoute && accessibleRoute !== "/dashboard") {
      // Redirect is handled in useEffect, show loader
      return <Loader fullScreen />;
    }
  }

  return (
    <RoleGuard requiredPermission={["dashboard:read", "dashboard:*"]}>
      <DashboardPageContent />
    </RoleGuard>
  );
}
