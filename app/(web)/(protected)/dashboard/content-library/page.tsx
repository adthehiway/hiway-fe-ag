"use client";

import { RoleGuard } from "@/components/dashboard/common/RoleGuard";
import ErrorMediaRow from "@/components/dashboard/content/ErrorMediaRow";
import MediaCard from "@/components/dashboard/content/MediaCard";
import PageTitle from "@/components/dashboard/layout/PageTitle";
import { useUser } from "@/hooks/useUser";
import { useEffectiveRole } from "@/hooks/useUserRole";
import { hasPermission } from "@/lib/permissions";
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
import { Loader } from "@/components/ui/loader";
import { Skeleton } from "@/components/ui/skeleton";
import { contentTypeOptions, mediaStatusOptions } from "@/config/media";

// Format content type label
const formatContentTypeLabel = (type: string): string => {
  if (!type) return "Unknown";
  return type
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};
import { useMediaListInfinite, useMediaStats } from "@/hooks/useMedia";
import {
  formatBytes,
  formatNumber,
  mapMediaStatus,
  secondsToHHMMSS,
} from "@/lib/utils";
import { ContentType, IMedia, MediaStatus } from "@/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Edit2, EyeIcon, Play, Video } from "lucide-react";
import moment from "moment";
import {
  CheckCircle,
  Eye,
  Grid3x3,
  List,
  Search,
  Table as TableIcon,
  Upload,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const stats = [
  {
    key: "totalFiles",
    label: "Total Files",
    sub: "% from last month",
    subColor: "text-green-400",
    icon: <Upload className="w-5 h-5 text-blue-400" />,
    iconBg: "bg-blue-950",
  },
  {
    key: "totalViews",
    label: "Total Views",
    sub: "% from last month",
    subColor: "text-green-400",
    icon: <Eye className="w-5 h-5 text-green-400" />,
    iconBg: "bg-green-950",
  },
  // {
  //   key: "storageUsed",
  //   label: "Storage Used",
  //   sub: "GB of 10 GB plan",
  //   subColor: "text-white-60",
  //   icon: <Database className="w-5 h-5 text-yellow-400" />,
  //   iconBg: "bg-yellow-950",
  // },
  {
    key: "published",
    label: "Published",
    sub: "% of total files",
    subColor: "text-blue-400",
    icon: <CheckCircle className="w-5 h-5 text-green-400" />,
    iconBg: "bg-green-950",
  },
];

const ContentLibraryPageContent = () => {
  const { data: user } = useUser();
  const effectiveRole = useEffectiveRole();
  const [search, setSearch] = useState("");
  const [contentType, setContentType] = useState<string>("");
  const [status, setStatus] = useState<MediaStatus | undefined>(
    MediaStatus.READY
  );
  const [perPage] = useState(12);
  const [viewMode, setViewMode] = useState<"grid" | "list" | "table">("grid");

  // Check if user has permission to write media
  const canWriteMedia =
    effectiveRole && user && hasPermission(effectiveRole, "media:write", user);

  // Get media statistics
  const {
    data: statsData,
    isLoading: statsLoading,
    isError: statsError,
    error: statsErrorObj,
    refetch: refetchStats,
  } = useMediaStats();

  // Get media list with infinite scroll
  const {
    items: mediaItems,
    isLoading: mediaLoading,
    isError: mediaError,
    isEmpty: mediaEmpty,
    error: mediaErrorObj,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch: refetchMedia,
  } = useMediaListInfinite({
    search: search || undefined,
    status: status || undefined,
    contentType: contentType && contentType !== "all" ? contentType : undefined,
    perPage,
  });

  // Intersection observer for infinite scroll
  const { ref, inView } = useInView({
    threshold: 0.1,
  });

  // Load more when the observer element comes into view
  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const isLoading = statsLoading || mediaLoading;
  const isError = statsError || mediaError;
  const error = statsErrorObj || mediaErrorObj;

  const refetch = () => {
    refetchStats();
    refetchMedia();
  };

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <p className="text-red-500 mb-4">
          Error loading content library: {error?.message}
        </p>
        <Button onClick={() => refetch()}>Retry</Button>
      </div>
    );
  }

  return (
    <>
      <PageTitle
        title="Content Library"
        description="Manage and organize your media files"
        content={
          canWriteMedia ? (
            <Button variant="outline" asChild>
              <Link href="/dashboard/upload">
                <Upload className="h-4 w-4" />
                Upload Media
              </Link>
            </Button>
          ) : null
        }
      />

      {/* Filter Content */}
      <Card>
        <CardHeader>
          <CardTitle>Filter Content</CardTitle>
          <CardDescription>Refine your search results</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row md:items-end gap-4 w-full">
            <div className="flex-1">
              <InputEnhanced
                placeholder="Search files..."
                label="Search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                iconLeft={<Search className="size-4" />}
              />
            </div>
            <div className="flex gap-2 w-full md:w-auto">
              <InputEnhanced
                placeholder="Select content type"
                label="Content Type"
                value={contentType}
                onSelectChange={(value) => setContentType(value)}
                options={[
                  { label: "All", value: "all" },
                  ...contentTypeOptions,
                ]}
                select
                className="w-full md:w-[200px]"
              />
              <InputEnhanced
                placeholder="Select status"
                label="Status"
                value={status}
                onSelectChange={(value) => setStatus(value as MediaStatus)}
                options={mediaStatusOptions}
                select
                className="w-full md:w-[200px]"
              />
            </div>
            <div className="flex items-end gap-1 border rounded-lg p-1 bg-muted/50">
              <Button
                variant={viewMode === "grid" ? "secondary" : "ghost"}
                size="icon"
                onClick={() => setViewMode("grid")}
                className="h-9 w-9"
              >
                <Grid3x3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "secondary" : "ghost"}
                size="icon"
                onClick={() => setViewMode("list")}
                className="h-9 w-9"
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "table" ? "secondary" : "ghost"}
                size="icon"
                onClick={() => setViewMode("table")}
                className="h-9 w-9"
              >
                <TableIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-3 ">
        {stats.map((stat) =>
          isLoading ? (
            <Card key={stat.label} className="gap-0">
              <CardHeader>
                <Skeleton className="h-6 w-32 mb-2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-10 w-24 mb-2" />
                <Skeleton className="h-4 w-20" />
              </CardContent>
            </Card>
          ) : (
            <Card key={stat.label} className="gap-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 justify-between">
                  {stat.label}
                  <div
                    className={`flex items-center justify-center w-8 h-8 rounded-full ${stat.iconBg}`}
                  >
                    {stat.icon}
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatNumber(
                    statsData?.[stat.key as keyof typeof statsData]?.value ?? 0
                  )}
                </div>
                <div className={`text-xs font-semibold ${stat.subColor}`}>
                  {statsData?.[stat.key as keyof typeof statsData]?.change ?? 0}
                  {stat.sub}
                </div>
              </CardContent>
            </Card>
          )
        )}
      </div>

      {/* Film Library */}
      <Card>
        <CardHeader className="flex items-center justify-between">
          <div className="flex flex-col gap-2">
            <CardTitle>
              {status === MediaStatus.ERROR ? "Failed Uploads" : "Film Library"}
            </CardTitle>
            <CardDescription>
              {status === MediaStatus.ERROR
                ? "Files that failed to upload or process"
                : "Your film collection with cover art and details"}
            </CardDescription>
          </div>
          {/* <Button>View Full Library</Button> */}
        </CardHeader>
        <CardContent>
          {mediaLoading ? (
            status === MediaStatus.ERROR ? (
              <div className="space-y-0 border border-border rounded-lg overflow-hidden">
                {Array.from({ length: 6 }).map((_, idx) => (
                  <div key={idx}>
                    {/* Mobile Skeleton */}
                    <div className="md:hidden p-4 border-b border-border">
                      <div className="flex items-start gap-3">
                        <Skeleton className="w-10 h-10 rounded-full shrink-0" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-5 w-3/4" />
                          <Skeleton className="h-4 w-1/2" />
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-6 w-16" />
                        </div>
                      </div>
                    </div>
                    {/* Desktop Skeleton */}
                    <div className="hidden md:grid grid-cols-12 gap-4 p-4 border-b border-border">
                      <div className="col-span-4">
                        <Skeleton className="h-5 w-3/4 mb-2" />
                        <Skeleton className="h-4 w-1/2" />
                      </div>
                      <div className="col-span-5">
                        <Skeleton className="h-4 w-full" />
                      </div>
                      <div className="col-span-2">
                        <Skeleton className="h-6 w-16" />
                      </div>
                      <div className="col-span-1">
                        <Skeleton className="h-8 w-8" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : viewMode === "grid" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, idx) => (
                  <div key={idx} className="space-y-2">
                    <Skeleton className="h-48 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                ))}
              </div>
            ) : viewMode === "list" ? (
              <div className="space-y-3">
                {Array.from({ length: 6 }).map((_, idx) => (
                  <div key={idx} className="flex gap-4 p-4 border rounded-lg">
                    <Skeleton className="w-32 h-20 rounded" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-5 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                      <Skeleton className="h-4 w-full" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Thumbnail</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Content Type</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Views</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Array.from({ length: 6 }).map((_, idx) => (
                    <TableRow key={idx}>
                      <TableCell>
                        <Skeleton className="w-16 h-10 rounded" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-32" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-20" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-16" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-16" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-12" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-5 w-16 rounded-full" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-20" />
                      </TableCell>
                      <TableCell className="text-right">
                        <Skeleton className="h-8 w-16 ml-auto" />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )
          ) : mediaItems.length > 0 ? (
            <>
              {status === MediaStatus.ERROR ? (
                <div className="space-y-0 border border-border rounded-lg overflow-hidden">
                  {/* Table Header - Desktop Only */}
                  <div className="hidden md:grid grid-cols-12 gap-4 p-4 bg-muted/50 border-b border-border font-semibold text-sm">
                    <div className="col-span-4">File Name</div>
                    <div className="col-span-5">Error</div>
                    <div className="col-span-2">Status</div>
                    <div className="col-span-1"></div>
                  </div>
                  {/* Error Rows */}
                  {mediaItems.map((media, index) => (
                    <ErrorMediaRow
                      key={media.id || `error-${index}`}
                      media={media}
                    />
                  ))}
                  {/* Show skeleton loaders when fetching next page */}
                  {isFetchingNextPage &&
                    Array.from({ length: perPage }).map((_, idx) => (
                      <div key={idx}>
                        {/* Mobile Skeleton */}
                        <div className="md:hidden p-4 border-b border-border">
                          <div className="flex items-start gap-3">
                            <Skeleton className="w-10 h-10 rounded-full shrink-0" />
                            <div className="flex-1 space-y-2">
                              <Skeleton className="h-5 w-3/4" />
                              <Skeleton className="h-4 w-1/2" />
                              <Skeleton className="h-4 w-full" />
                              <Skeleton className="h-6 w-16" />
                            </div>
                          </div>
                        </div>
                        {/* Desktop Skeleton */}
                        <div className="hidden md:grid grid-cols-12 gap-4 p-4 border-b border-border">
                          <div className="col-span-4">
                            <Skeleton className="h-5 w-3/4 mb-2" />
                            <Skeleton className="h-4 w-1/2" />
                          </div>
                          <div className="col-span-5">
                            <Skeleton className="h-4 w-full" />
                          </div>
                          <div className="col-span-2">
                            <Skeleton className="h-6 w-16" />
                          </div>
                          <div className="col-span-1">
                            <Skeleton className="h-8 w-8" />
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              ) : viewMode === "grid" ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {mediaItems.map((media, index) => (
                    <MediaCard
                      key={media.id || `media-${index}`}
                      media={media}
                      isLoading={false}
                      selectedStatus={status}
                    />
                  ))}
                  {/* Show skeleton loaders when fetching next page */}
                  {isFetchingNextPage &&
                    Array.from({ length: perPage }).map((_, idx) => (
                      <div key={`skeleton-${idx}`} className="space-y-2">
                        <Skeleton className="h-48 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                      </div>
                    ))}
                </div>
              ) : viewMode === "list" ? (
                <div className="space-y-3">
                  {mediaItems.map((media, index) => (
                    <MediaListItem
                      key={media.id || `media-${index}`}
                      media={media}
                      selectedStatus={status}
                    />
                  ))}
                  {isFetchingNextPage &&
                    Array.from({ length: perPage }).map((_, idx) => (
                      <div
                        key={`skeleton-${idx}`}
                        className="flex gap-4 p-4 border rounded-lg"
                      >
                        <Skeleton className="w-32 h-20 rounded" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-5 w-3/4" />
                          <Skeleton className="h-4 w-1/2" />
                          <Skeleton className="h-4 w-full" />
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Thumbnail</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Content Type</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Size</TableHead>
                      <TableHead>Views</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mediaItems.map((media, index) => (
                      <MediaTableRow
                        key={media.id || `media-${index}`}
                        media={media}
                        selectedStatus={status}
                      />
                    ))}
                    {isFetchingNextPage &&
                      Array.from({ length: perPage }).map((_, idx) => (
                        <TableRow key={`skeleton-${idx}`}>
                          <TableCell>
                            <Skeleton className="w-16 h-10 rounded" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-4 w-32" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-4 w-20" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-4 w-16" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-4 w-16" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-4 w-12" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-5 w-16 rounded-full" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-4 w-20" />
                          </TableCell>
                          <TableCell className="text-right">
                            <Skeleton className="h-8 w-16 ml-auto" />
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              )}
              {/* Intersection observer trigger for infinite scroll */}
              <div ref={ref} className="w-full h-1" />
              {/* Loading indicator when fetching next page (fallback) */}
              {isFetchingNextPage && (
                <div className="flex justify-center items-center py-4">
                  <Loader backdrop={false} />
                </div>
              )}
              {/* No more items message */}
              {!hasNextPage && mediaItems.length > 0 && !isFetchingNextPage && (
                <div className="text-sm text-muted-foreground text-center py-4 mt-4">
                  No more media to load
                </div>
              )}
            </>
          ) : (
            <div className=" text-sm text-muted-foreground text-center w-full">
              No media found
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
};

// List View Component
const MediaListItem = ({
  media,
  selectedStatus,
}: {
  media: IMedia;
  selectedStatus?: MediaStatus;
}) => {
  const effectiveRole = useEffectiveRole();
  const { data: user } = useUser();
  const canUpdateMedia =
    effectiveRole && user && hasPermission(effectiveRole, "media:update", user);

  return (
    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 p-3 sm:p-4 border rounded-lg hover:bg-muted/50 transition-colors">
      {/* Thumbnail */}
      <div className="relative w-full sm:w-32 h-40 sm:h-20 rounded overflow-hidden flex-shrink-0">
        <img
          src={
            media.cfThumbnail
              ? `${process.env.NEXT_PUBLIC_CONTENT_FABRIC_BASE_URL_STATICS}${media.cfThumbnail}?width=320`
              : "/images/default.png"
          }
          alt={media.metadata?.title ?? media.name}
          className="object-cover w-full h-full"
        />
        <div className="absolute bottom-1 right-1 text-xs text-white font-semibold bg-black/70 px-1 rounded">
          {secondsToHHMMSS(media?.source?.duration ?? 0)}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-base sm:text-base truncate">
              {media.metadata?.title ?? media.name}
            </h3>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-2 text-sm text-muted-foreground">
              <Badge variant="outline" className="text-xs">
                {formatContentTypeLabel(media.metadata?.contentType || "")}
              </Badge>
              <span className="flex items-center gap-1 whitespace-nowrap">
                <Video className="w-3 h-3" />
                {formatBytes(media?.source?.size ?? 0)}
              </span>
              <span className="flex items-center gap-1 whitespace-nowrap">
                <EyeIcon className="w-3 h-3" />
                {formatNumber(media?.totalViews ?? 0)} views
              </span>
              <span className="whitespace-nowrap">
                {moment(media?.createdAt).fromNow()}
              </span>
            </div>
          </div>
          {selectedStatus === MediaStatus.READY && (
            <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 sm:flex-initial"
                asChild
              >
                <Link href={`/dashboard/media/${media.id}`}>
                  <EyeIcon className="w-4 h-4" />
                  View
                </Link>
              </Button>
              {canUpdateMedia && (
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 sm:flex-initial"
                  asChild
                >
                  <Link href={`/dashboard/media/${media.id}/edit`}>
                    <Edit2 className="w-4 h-4" />
                    Edit
                  </Link>
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Table View Component
const MediaTableRow = ({
  media,
  selectedStatus,
}: {
  media: IMedia;
  selectedStatus?: MediaStatus;
}) => {
  const effectiveRole = useEffectiveRole();
  const { data: user } = useUser();
  const canUpdateMedia =
    effectiveRole && user && hasPermission(effectiveRole, "media:update", user);

  return (
    <TableRow>
      <TableCell>
        <div className="relative w-16 h-10 rounded overflow-hidden">
          <img
            src={
              media.cfThumbnail
                ? `${process.env.NEXT_PUBLIC_CONTENT_FABRIC_BASE_URL_STATICS}${media.cfThumbnail}?width=128`
                : "/images/default.png"
            }
            alt={media.metadata?.title ?? media.name}
            className="object-cover w-full h-full"
          />
        </div>
      </TableCell>
      <TableCell>
        <div className="font-medium">{media.metadata?.title ?? media.name}</div>
      </TableCell>
      <TableCell>
        <Badge variant="outline" className="text-xs">
          {media.metadata?.contentType || "Unknown"}
        </Badge>
      </TableCell>
      <TableCell className="text-muted-foreground">
        {secondsToHHMMSS(media?.source?.duration ?? 0)}
      </TableCell>
      <TableCell className="text-muted-foreground">
        {formatBytes(media?.source?.size ?? 0)}
      </TableCell>
      <TableCell className="text-muted-foreground">
        {formatNumber(media?.totalViews ?? 0)}
      </TableCell>
      <TableCell>
        <Badge variant="secondary" className="text-xs">
          {mapMediaStatus(media.status)}
        </Badge>
      </TableCell>
      <TableCell className="text-muted-foreground text-sm">
        {moment(media?.createdAt).format("MMM DD, YYYY")}
      </TableCell>
      <TableCell className="text-right">
        {selectedStatus === MediaStatus.READY && (
          <div className="flex items-center justify-end gap-2">
            <Button variant="ghost" size="icon" asChild>
              <Link href={`/dashboard/media/${media.id}`}>
                <EyeIcon className="w-4 h-4" />
              </Link>
            </Button>
            {canUpdateMedia && (
              <Button variant="ghost" size="icon" asChild>
                <Link href={`/dashboard/media/${media.id}/edit`}>
                  <Edit2 className="w-4 h-4" />
                </Link>
              </Button>
            )}
          </div>
        )}
      </TableCell>
    </TableRow>
  );
};

const ContentLibraryPage = () => {
  return (
    <RoleGuard requiredPermission="media:read">
      <ContentLibraryPageContent />
    </RoleGuard>
  );
};

export default ContentLibraryPage;
