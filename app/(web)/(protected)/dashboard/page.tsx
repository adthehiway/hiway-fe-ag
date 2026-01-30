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
    return overviewData?.analytics.find(
      (item: { key: string }) => item.key === key
    );
  };

  return (
    <div className="">
      <PageTitle
        title="Dashboard"
        description="Welcome back. Congratulations. You’re on the Hiway"
        content={
          editMode ? (
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  saveToLocalStorage("dashboard-layouts", layouts);
                  setEditMode((v) => !v);
                }}
              >
                <Save className="h-4 w-4" />
                Save Layout
              </Button>
              <Button variant="outline" onClick={handleResetLayout}>
                <RefreshCcw className="h-4 w-4" />
                Reset Layout
              </Button>
            </div>
          ) : (
            <Button variant="outline" onClick={() => setEditMode((v) => !v)}>
              <Move className="h-4 w-4" />
              Customize Layout
            </Button>
          )
        }
      />

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
            <Card key={`analytics-${index}`} className="gap-3  ">
              <CardHeader>
                <Skeleton className="h-6 w-32 mb-2" />
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-10 w-24 mb-2" />
              </CardContent>
            </Card>
          ) : (
            <Card key={`analytics-${index}`} className="gap-3  ">
              <CardHeader>
                <CardTitle className="flex flex-row items-center gap-2 justify-between">
                  {item.title}
                  <item.icon className={`h-4 w-4 ${item.iconColor}`} />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold ">
                  {formatNumber(getAnalyticsData(item.key)?.value ?? 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  <span className={`text-accent`}>
                    {getAnalyticsData(item.key)?.change ?? 0}%
                  </span>{" "}
                  from last month
                </p>
              </CardContent>
            </Card>
          )
        )}
        {isLoading ? (
          <Card key="revenueOverview">
            <CardHeader>
              <Skeleton className="h-6 w-40 mb-2" />
              <Skeleton className="h-4 w-64" />
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Skeleton className="h-8 w-24 mb-2" />
                  <Skeleton className="h-4 w-16" />
                </div>
                <Skeleton className="h-6 w-16" />
              </div>
              <div className="space-y-2">
                {[...Array(12)].map((_, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <Skeleton className="h-4 w-8" />
                    <Skeleton className="h-2 w-full rounded-full" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-3 gap-4 pt-4 border-t ">
                {[...Array(3)].map((_, index) => (
                  <div key={index} className="text-center">
                    <Skeleton className="h-6 w-16 mb-2" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card key="revenueOverview">
            <CardHeader>
              <CardTitle>Revenue Overview</CardTitle>
              <CardDescription>
                Monthly revenue from premium content
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold ">
                    ${formatNumber(overviewData?.revenueOverview.currentMonth.value ?? 0)}
                  </p>
                  <p className="text-sm text-muted-foreground">This month</p>
                </div>
                <div className="flex items-center gap-1 text-accent">
                  {overviewData?.revenueOverview.currentMonth.change &&
                  overviewData?.revenueOverview.currentMonth.change > 0 ? (
                    <TrendingUp size={16} />
                  ) : (
                    <TrendingDown size={16} />
                  )}
                  <span className="text-sm font-medium">
                    {overviewData?.revenueOverview.currentMonth.change &&
                    overviewData?.revenueOverview.currentMonth.change > 0
                      ? "+"
                      : ""}
                    {overviewData?.revenueOverview.currentMonth.change ?? 0}%
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                {overviewData?.revenueOverview.monthly.map(
                  (item: { label: string; value: number }, index: number) => (
                    <div key={index} className="flex items-center gap-3">
                      <span className="text-sm text-muted-foreground w-8">
                        {item.label}
                      </span>
                      <div className="flex-1 bg-muted/50 rounded-full h-2 relative overflow-hidden">
                        <div
                          className="bg-accent h-full rounded-full transition-all duration-500"
                          style={{ width: `${item.value * 100}%` }}
                        />
                      </div>
                      <span className="text-sm text-white w-16 text-right">
                        ${formatNumber(item.value)}
                      </span>
                    </div>
                  )
                )}
              </div>
              <div className="grid grid-cols-3 gap-4 pt-4 border-t ">
                <div className="text-center">
                  <p className="text-lg font-semibold text-white">
                    ${formatNumber(overviewData?.revenueOverview.projectedAnnual ?? 0)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Projected Annual
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-semibold text-white">
                    ${formatNumber(overviewData?.revenueOverview.avgMonthly ?? 0)}
                  </p>
                  <p className="text-xs text-muted-foreground">Avg Monthly</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-semibold text-accent">
                    +{overviewData?.revenueOverview.avgGrowth ?? 0}%
                  </p>
                  <p className="text-xs text-muted-foreground">Avg Growth</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card key="topContent">
          {isLoading ? (
            <CardHeader>
              <Skeleton className="h-6 w-40 mb-2" />
              <Skeleton className="h-4 w-64" />
            </CardHeader>
          ) : (
            <CardHeader>
              <CardTitle>Top Performing Content</CardTitle>
              <CardDescription>
                Your highest engagement and revenue generating content
              </CardDescription>
            </CardHeader>
          )}
          <CardContent className="space-y-4">
            {isLoading ? (
              <>
                {[...Array(3)].map((_, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-4 p-4 rounded-lg bg-muted/50 border "
                  >
                    <Skeleton className="w-8 h-8 rounded-full" />
                    <Skeleton className="w-8 h-8 rounded-full" />
                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <Skeleton className="h-5 w-32 mb-1" />
                          <div className="flex items-center gap-3">
                            <Skeleton className="h-4 w-12" />
                          </div>
                        </div>
                        <div className="flex-shrink-0 text-right">
                          <Skeleton className="h-5 w-16 mb-1" />
                          <Skeleton className="h-3 w-12" />
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Skeleton className="h-5 w-16 rounded-full" />
                          <Skeleton className="h-5 w-12 rounded-full" />
                        </div>
                        <Skeleton className="w-8 h-8 rounded-full" />
                      </div>
                    </div>
                  </div>
                ))}
                <Skeleton className="h-10 w-full mt-3" />
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
                        className="flex items-center gap-4 p-4 rounded-lg bg-muted/50 border "
                      >
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-accent flex items-center justify-center text-sm font-bold text-accent-foreground">
                          {index + 1}
                        </div>
                        <button className="flex-shrink-0 w-8 h-8 rounded-full border-2 border-accent flex items-center justify-center text-accent transition-colors">
                          <Play size={14} />
                        </button>
                        <div className="flex-1 min-w-0 space-y-2">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium  truncate text-sm mb-1">
                                {item.title}
                              </h4>
                              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Eye size={12} />
                                  {formatNumber(item.views)}
                                </span>
                              </div>
                            </div>
                            <div className="flex-shrink-0 text-right">
                              <div className="text-accent font-bold text-sm">
                                ${formatNumber(item.revenue)}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                revenue
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {item.genre && (
                                <div className=" text-xs px-2 py-1 bg-blue-400 rounded-full ">
                                  {item.genre}
                                </div>
                              )}
                              {item.rating && (
                                <div className="text-xs px-3 py-1 border border-accent rounded-full text-accent">
                                  {item.rating}
                                </div>
                              )}
                            </div>
                            <Button size="iconSm" variant={"ghost"}>
                              <Ellipsis size={16} />
                            </Button>
                          </div>
                        </div>
                      </div>
                    )
                  )
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                    You top performing content will appear here
                  </div>
                )}
                <Button
                  className="w-full mt-3"
                  onClick={() => router.push("/dashboard/content-library")}
                >
                  View All Content Analytics
                </Button>
              </>
            )}
          </CardContent>
        </Card>
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
