"use client";

import PageTitle from "@/components/dashboard/layout/PageTitle";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeftIcon,
  BarChart3,
  Calendar,
  Clock,
  Copy,
  Eye,
  ExternalLink,
  FileText as FileIcon,
  FileText,
  GlobeIcon,
  PlayCircle,
  Trash2,
  Users,
  Video,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { use } from "react";
import {
  useMedia,
  useMediaAnalytics,
  useSmartlinksForMedia,
} from "@/hooks/useMedia";
import { notFound } from "next/navigation";
import moment from "moment";
import {
  formatBytes,
  formateSeconds,
  formatNumber,
  getSmartLinkUrl,
  secondsToHHMMSS,
} from "@/lib/utils";
import { VideoPlayer } from "@/components/common/video-player.component";
import { Skeleton } from "@/components/ui/skeleton";
import { RefreshCcw } from "lucide-react";
import DeleteMediaModal from "@/components/dashboard/common/DeleteMediaModal";
import { useState } from "react";
import { useRouter } from "next/navigation";
import mediaService from "@/services/media";
import { toast } from "react-toastify";
import { useQueryClient } from "@tanstack/react-query";

const TABS = [
  { key: "editorial", label: "Editorial Metadata", icon: FileText },
  { key: "specs", label: "Asset Specifications", icon: BarChart3 },
  { key: "versions", label: "Versions", icon: GlobeIcon },
  { key: "smartlinks", label: "Smartlinks", icon: Eye },
  { key: "analytics", label: "Analytics", icon: BarChart3 },
];

export default function MediaDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const {
    data: media,
    isLoading,
    isError,
    isEmpty,
    error,
  } = useMedia(id, true);
  const {
    data: analytics,
    isLoading: analyticsLoading,
    isError: analyticsError,
  } = useMediaAnalytics(id);
  const {
    data: smartlinks,
    isLoading: smartlinksLoading,
    isError: smartlinksError,
    isEmpty: smartlinksEmpty,
  } = useSmartlinksForMedia(id);

  const handleDeleteMedia = async () => {
    if (!media) return;

    try {
      await mediaService.deleteById(id);

      // Invalidate content library queries to force refetch when page loads
      queryClient.invalidateQueries({
        queryKey: ["content-library-overview"],
        exact: false,
      });

      toast.success("Media deleted successfully");
      setShowDeleteModal(false);
      router.push("/dashboard/content-library");
    } catch (error) {
      console.error("Failed to delete media:", error);
      toast.error("Failed to delete media. Please try again.");
      throw error; // Re-throw to let the modal handle the error state
    }
  };

  const handleCopyUrl = async (slug: string) => {
    const url = getSmartLinkUrl({ slug: slug });
    try {
      await navigator.clipboard.writeText(url);
      toast.success("URL copied to clipboard!");
    } catch (error) {
      console.error("Failed to copy URL:", error);
      toast.error("Failed to copy URL");
    }
  };

  const handleOpenUrl = (slug: string) => {
    const url = getSmartLinkUrl({ slug: slug });
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const getThumbnailUrl = (smartlink: any) => {
    if (smartlink.thumbnail) {
      return smartlink.thumbnail;
    }
    if (media?.cfThumbnail) {
      return `${process.env.NEXT_PUBLIC_CONTENT_FABRIC_BASE_URL_STATICS}${media.cfThumbnail}?width=200`;
    }
    return null;
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-10 w-20" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>

        {/* Video Player Skeleton */}
        <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
          <Skeleton className="h-12 w-12 rounded-full" />
        </div>

        {/* Details Card Skeleton */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-6 w-48" />
                  <Skeleton className="h-6 w-16" />
                </div>
                <div className="flex flex-wrap items-center gap-4 mt-2">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <div key={index} className="flex items-center gap-1">
                      <Skeleton className="h-4 w-4" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs Skeleton */}
        <div className="space-y-4">
          <div className="flex gap-2">
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} className="h-10 w-32" />
            ))}
          </div>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-6">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div key={index}>
                    <Skeleton className="h-4 w-16 mb-2" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                ))}
              </div>
              <div className="mt-2">
                <Skeleton className="h-4 w-20 mb-2" />
                <Skeleton className="h-4 w-full" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }
  if (isError) {
    // If error is 404, show notFound
    if (error?.message?.includes("404")) {
      notFound();
    }
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="text-center">
          <div className="mb-4">
            <Video className="h-16 w-16 mx-auto text-muted-foreground opacity-50" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">
            Failed to load media
          </h3>
          <p className="text-muted-foreground mb-4 max-w-md">
            {error?.message ||
              "Something went wrong while loading the media. Please try again."}
          </p>
          <div className="flex gap-2 justify-center">
            <Button variant="outline" onClick={() => window.location.reload()}>
              <RefreshCcw className="h-4 w-4 mr-2" />
              Retry
            </Button>
            <Link href="/dashboard/content-library">
              <Button variant="secondary">Back to Library</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }
  if (isEmpty || !media) {
    notFound();
  }

  // Analytics data from the hook
  const analyticsData = [
    {
      icon: <Eye className="w-4 h-4" />,
      title: "Total Views",
      value: analytics?.totalViews || 0,
      change: analytics?.viewsChange
        ? `${analytics.viewsChange > 0 ? "+" : ""}${analytics.viewsChange}%`
        : "N/A",
      changeFrom: "previous month",
    },
    {
      icon: <Clock className="w-4 h-4" />,
      title: "Average View Duration",
      value: formateSeconds(analytics?.averageViewDuration || 0),
      change: analytics?.viewDurationChange
        ? `${analytics.viewDurationChange > 0 ? "+" : ""}${
            analytics.viewDurationChange
          }%`
        : "N/A",
      changeFrom: "previous month",
    },
    {
      icon: <PlayCircle className="w-4 h-4" />,
      title: "Total Watch Time, H:M:S",
      value: secondsToHHMMSS(analytics?.totalWatchTime || 0),
      change: analytics?.watchTimeChange
        ? `${analytics.watchTimeChange > 0 ? "+" : ""}${
            analytics.watchTimeChange
          }%`
        : "N/A",
      changeFrom: "previous month",
    },
    {
      icon: <Users className="w-4 h-4" />,
      title: "Unique Viewers",
      value: analytics?.uniqueViewers || 0,
      change: analytics?.uniqueViewersChange
        ? `${analytics.uniqueViewersChange > 0 ? "+" : ""}${
            analytics.uniqueViewersChange
          }%`
        : "N/A",
      changeFrom: "previous month",
    },
  ];

  return (
    <>
      <PageTitle
        title={media.metadata?.title || media.name}
        description="Film details and specifications"
        content={
          <div className="flex gap-2">
            <Button variant="default" className="font-semibold px-4" asChild>
              <Link href={`/dashboard/media/${id}/edit`}>
                <FileIcon className="w-4 h-4 mr-2" /> Edit
              </Link>
            </Button>
            <Button
              variant="destructive"
              className="font-semibold px-4"
              onClick={() => setShowDeleteModal(true)}
              disabled={isDeleting}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
            <Link href="/dashboard/content-library">
              <Button variant="secondary" className="font-semibold px-4">
                <ArrowLeftIcon className="w-4 h-4 mr-2" /> Back to Library
              </Button>
            </Link>
          </div>
        }
      />

      {/* Video Preview */}
      <VideoPlayer
        showShareButton={false}
        token={media.signedToken || ""}
        versionHash={media.cfMezzanineHash as string}
        offering={""}
        autoplay={false}
        controls={{
          markInOut: false,
          previewMode: false,
        }}
      />
      {/* Details Card */}
      <Card>
        <CardContent>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold">
                  {media.metadata?.title || media.name}
                </span>
                {media.status && (
                  <span className="bg-accent text-black text-xs font-semibold px-3 py-1 rounded ml-2">
                    {media.status}
                  </span>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-white/80">
                <span className="flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  {formatNumber(media.totalViews || 0)} views
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {secondsToHHMMSS(media.source?.duration || 0)}
                </span>
                <span className="flex items-center gap-1">
                  <Video className="w-4 h-4" />
                  Video
                </span>
                <span className="flex items-center gap-1">
                  <FileIcon className="w-4 h-4" />
                  {formatBytes(media.source?.size || 0)}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  Uploaded {moment(media.createdAt).fromNow()}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      {/* Tabs */}
      <Tabs defaultValue={TABS[0].key} className="w-full">
        <TabsList className="flex w-full  rounded-lg overflow-hidden">
          {TABS.map((tab, idx) => {
            const Icon = tab.icon;
            return (
              <TabsTrigger key={tab.key} value={tab.key} title={tab.label}>
                <Icon size={20} />
                <span className="hidden md:block">{tab.label}</span>
              </TabsTrigger>
            );
          })}
        </TabsList>
        <TabsContent value="editorial">
          <Card>
            <CardHeader>
              <CardTitle>Editorial Metadata</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-6">
                <div>
                  <div className="font-semibold mb-1">Title</div>
                  <div>{media.metadata?.title || media.name}</div>
                </div>
                <div>
                  <div className="font-semibold mb-1">Type</div>
                  <div>Video</div>
                </div>
                <div>
                  <div className="font-semibold mb-1">Duration</div>
                  <div>{secondsToHHMMSS(media.source?.duration || 0)}</div>
                </div>
              </div>
              <div className="mt-2">
                <div className="font-semibold mb-1">Description</div>
                <div>{media.metadata?.description || "No description"}</div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="specs">
          <Card>
            <CardHeader>
              <CardTitle>Asset Specifications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="divide-y ">
                <div className="flex items-center justify-between py-4">
                  <span className="uppercase font-bold text-sm text-muted-foreground">
                    File Type
                  </span>
                  <span className="text-base">Video</span>
                </div>
                <div className="flex items-center justify-between py-4">
                  <span className="uppercase font-bold text-sm text-muted-foreground">
                    Format
                  </span>
                  <span className="text-base">mp4</span>
                </div>
                <div className="flex items-center justify-between py-4">
                  <span className="uppercase font-bold text-sm text-muted-foreground">
                    Video Size
                  </span>
                  <span className="text-base">
                    {media.source?.width}x{media.source?.height}
                  </span>
                </div>
                <div className="flex items-center justify-between py-4">
                  <span className="uppercase font-bold text-sm text-muted-foreground">
                    Library
                  </span>
                  <span className="text-base">
                    {media.company?.name || "Unknown"}
                  </span>
                </div>
                <div className="flex items-center justify-between py-4">
                  <span className="uppercase font-bold text-sm text-muted-foreground">
                    Original Language
                  </span>
                  <span className="flex gap-2">
                    <span className="bg-muted rounded-full px-3 py-1 text-xs font-semibold">
                      {media.metadata?.originalLanguage || "Unknown"}
                    </span>
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        {/* Versions Section */}
        <TabsContent value="versions">
          <Card>
            <CardHeader>
              <CardTitle>Versions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4">
                {/* Version Card - Current */}
                {media.versions.map((version) => (
                  <Card key={version.id}>
                    <CardContent className="flex-col md:flex-row md:items-center justify-between">
                      <div className="flex items-start gap-4">
                        <div className="relative">
                          <div className="w-12 h-12 rounded-lg bg-accent flex items-center justify-center font-bold text-lg text-black">
                            h:way
                          </div>
                        </div>
                        <div>
                          <div className="mb-1 text-sm">
                            <span className="text-muted-foreground">
                              Replaced by:
                            </span>
                            <span className="font-bold ml-1">
                              {version.user.username}
                            </span>
                            <span className="ml-2 text-muted-foreground">
                              {moment(version.createdAt).fromNow()}
                            </span>
                          </div>
                          {/* <div className="text-muted-foreground text-sm">
                            Some random details here | Hash:vjbef8qhvy...AaeKfg
                          </div>
                          <div className="text-muted-foreground text-xs mt-1">
                            File name.mov | Datestamp | Some other details | 512
                            MB
                          </div> */}
                        </div>
                      </div>
                      <div className="flex items-center mt-4 md:mt-0">
                        <span className="bg-accent text-black rounded-full px-4 py-1 text-sm font-semibold">
                          Current Version
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="smartlinks">
          <Card>
            <CardHeader>
              <CardTitle>Smartlinks</CardTitle>
            </CardHeader>
            <CardContent>
              {smartlinksLoading ? (
                // Loading skeleton for smartlinks
                <div className="flex flex-col gap-4">
                  {Array.from({ length: 3 }).map((_, idx) => (
                    <div
                      key={idx}
                      className="rounded-xl border bg-secondary p-4 flex flex-col md:flex-row md:items-center justify-between"
                    >
                      <div className="flex items-start gap-4">
                        <Skeleton className="w-12 h-12 rounded-lg" />
                        <div className="flex-1">
                          <Skeleton className="h-4 w-32 mb-2" />
                          <Skeleton className="h-5 w-48 mb-2" />
                          <Skeleton className="h-3 w-24 mb-2" />
                          <div className="flex gap-8">
                            <Skeleton className="h-3 w-16" />
                            <Skeleton className="h-3 w-16" />
                            <Skeleton className="h-3 w-16" />
                          </div>
                        </div>
                      </div>
                      <div className="mt-4 md:mt-0">
                        <Skeleton className="h-4 w-20" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : smartlinksError ? (
                // Error state for smartlinks
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="text-muted-foreground mb-4">
                    <Eye className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <h3 className="text-lg font-semibold mb-2">
                      Failed to load smartlinks
                    </h3>
                    <p className="text-sm">
                      Unable to load smartlinks data. Please try again later.
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => window.location.reload()}
                  >
                    <RefreshCcw className="h-4 w-4 mr-2" />
                    Retry
                  </Button>
                </div>
              ) : smartlinksEmpty ? (
                // Empty state for smartlinks
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="text-muted-foreground mb-4">
                    <Eye className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <h3 className="text-lg font-semibold mb-2">
                      No smartlinks found
                    </h3>
                    <p className="text-sm">
                      This media doesn't have any smartlinks yet.
                    </p>
                  </div>
                  <Link href="/dashboard/smartlinks">
                    <Button variant="outline">Create Smartlink</Button>
                  </Link>
                </div>
              ) : (
                // Smartlinks data
                <div className="flex flex-col gap-4">
                  {smartlinks.map((smartlink) => {
                    const thumbnailUrl = getThumbnailUrl(smartlink);
                    return (
                      <div
                        key={smartlink.id}
                        className="rounded-xl border bg-secondary p-4 flex flex-col md:flex-row md:items-center justify-between gap-4"
                      >
                        <div className="flex items-start gap-4 flex-1">
                          <div className="relative w-16 h-16 rounded-lg bg-accent flex items-center justify-center font-bold text-lg text-black overflow-hidden flex-shrink-0">
                            {thumbnailUrl ? (
                              <Image
                                src={thumbnailUrl}
                                alt={smartlink.name}
                                fill
                                className="object-cover"
                                unoptimized
                              />
                            ) : (
                              <span>h:way</span>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="uppercase text-xs font-bold text-muted-foreground mb-1">
                              {smartlink.access}
                            </div>
                            <div className="font-bold text-base leading-tight mb-1">
                              {smartlink.name}
                            </div>
                            {media && (
                              <div className="text-sm text-muted-foreground mb-2">
                                <div className="font-medium">
                                  {media.metadata?.title || media.name}
                                </div>
                                {(media.metadata?.productionCompany ||
                                  media.company?.name) && (
                                  <div className="text-xs">
                                    {media.metadata?.productionCompany ||
                                      media.company?.name}
                                  </div>
                                )}
                              </div>
                            )}
                            <div className="text-xs text-muted-foreground mb-2">
                              Created{" "}
                              {moment(smartlink.createdAt).format("MM.DD.YYYY")}
                              <br />
                            </div>
                            <div className="flex gap-8 text-xs">
                              <div>
                                <span className="text-muted-foreground">
                                  Total Clicks
                                </span>
                                <br />
                                <span className="text-muted-foreground font-semibold">
                                  {smartlink.totalClicks || 0}
                                </span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">
                                  Total Views
                                </span>
                                <br />
                                <span className="text-muted-foreground font-semibold">
                                  {smartlink.totalViews || 0}
                                </span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">
                                  30 day views
                                </span>
                                <br />
                                <span className="text-muted-foreground font-semibold">
                                  {smartlink.views30d}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2 mt-4 md:mt-0 md:ml-8">
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleCopyUrl(smartlink.slug)}
                              className="flex items-center gap-2"
                            >
                              <Copy className="w-4 h-4" />
                              Copy
                            </Button>
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => handleOpenUrl(smartlink.slug)}
                              className="flex items-center gap-2"
                            >
                              <ExternalLink className="w-4 h-4" />
                              Open
                            </Button>
                          </div>

                          <div className="text-xs text-muted-foreground">
                            ID # {smartlink.id.slice(-6)}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              {analyticsLoading ? (
                // Loading skeleton for analytics
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {Array.from({ length: 4 }).map((_, idx) => (
                    <Card key={idx} className="bg-secondary p-4">
                      <CardContent>
                        <div className="flex items-center gap-2 mb-2">
                          <Skeleton className="h-4 w-4" />
                          <Skeleton className="h-3 w-24" />
                        </div>
                        <Skeleton className="h-8 w-16 mb-2" />
                        <div className="flex items-center gap-2 mt-2">
                          <Skeleton className="h-5 w-12 rounded-full" />
                          <Skeleton className="h-3 w-20" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : analyticsError ? (
                // Error state for analytics
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="text-muted-foreground mb-4">
                    <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <h3 className="text-lg font-semibold mb-2">
                      Failed to load analytics
                    </h3>
                    <p className="text-sm">
                      Unable to load analytics data. Please try again later.
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => window.location.reload()}
                  >
                    <RefreshCcw className="h-4 w-4 mr-2" />
                    Retry
                  </Button>
                </div>
              ) : (
                // Analytics data
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {analyticsData.map((item, idx) => (
                    <Card key={idx} className="bg-secondary p-4">
                      <CardContent>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xl">{item.icon}</span>
                          <span className="uppercase text-xs font-bold text-muted-foreground">
                            {item.title}
                          </span>
                        </div>
                        <div className="text-3xl font-bold">{item.value}</div>
                        <div className="flex items-center gap-2 mt-2">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${
                              item.change === "N/A"
                                ? "bg-muted text-muted-foreground"
                                : item.change.startsWith("+")
                                  ? "bg-green-500 text-black"
                                  : "bg-red-500 text-black"
                            }`}
                          >
                            {item.change}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {item.changeFrom}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Delete Media Modal */}
      <DeleteMediaModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteMedia}
        media={media}
        smartlinks={smartlinks || []}
        isLoading={isDeleting}
      />
    </>
  );
}
