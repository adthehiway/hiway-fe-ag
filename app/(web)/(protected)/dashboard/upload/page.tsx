"use client";

import DirectUploadTokenModal from "@/components/dashboard/common/DirectUploadTokenModal";
import { RoleGuard } from "@/components/dashboard/common/RoleGuard";
import VideoUploadModal from "@/components/dashboard/common/VideoUploadModal";
import PageTitle from "@/components/dashboard/layout/PageTitle";
import UploadVideo from "@/components/dashboard/overview/uploadVideo";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import InputEnhanced from "@/components/ui/input-enhanced";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useDla } from "@/contexts/dla";
import { useStorageDetails } from "@/hooks/useMedia";
import { useUploadQueue } from "@/hooks/useUploadQueue";
import { useUser } from "@/hooks/useUser";
import { useEffectiveRole } from "@/hooks/useUserRole";
import {
  formatBytes,
  getErrorMessage,
  getProcessingPercentage,
} from "@/lib/utils";
import {
  CompanyRole,
  IMedia,
  IMediaUploadTokenResponse,
  IUploadQueueItem,
  MediaStatus,
} from "@/types";
import { format } from "date-fns";
import {
  AlertCircle,
  CheckCircle2,
  EyeOff,
  HardDrive,
  Loader2,
  RefreshCw,
  Search,
  Upload,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { useDebounce } from "use-debounce";

function UploadPageContent() {
  const [parentFiles, setParentFiles] = useState<File[]>([]);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [isDirectUploadModalOpen, setIsDirectUploadModalOpen] = useState(false);
  const [credentials, setCredentials] =
    useState<IMediaUploadTokenResponse | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const { MediaService } = useDla();

  const handleFilesSelected = useCallback((files: File[]) => {
    if (!files.length) return;
    setParentFiles(files);
    setIsVideoModalOpen(true);
  }, []);

  const handleCloseVideoModal = useCallback(() => {
    setIsVideoModalOpen(false);
    setParentFiles([]);
  }, []);

  const handleGenerateCredentials = useCallback(async () => {
    try {
      setIsGenerating(true);
      const response = await MediaService.requestUploadToken();
      setCredentials(response);
      setIsDirectUploadModalOpen(true);
      toast.success("Upload credentials generated successfully.");
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsGenerating(false);
    }
  }, [MediaService]);

  const handleCloseCredentialsModal = useCallback(() => {
    setIsDirectUploadModalOpen(false);
    setCredentials(null);
  }, []);

  return (
    <>
      <PageTitle
        title="Upload Content"
        description="Upload your media directly through the browser, or use Hiway Sync for large files and background uploads."
      />
      <div className="space-y-8">
        <div className="grid gap-6 lg:grid-cols-2">
          <UploadVideo
            setParentFiles={handleFilesSelected}
            className="h-full"
            title="Upload Via Browser"
            description="Drag and drop your video files here or click to browse."
            additionalInfo="This option is ideal for files under 40 GB."
          />

          <Card className="h-full">
            <CardHeader>
              <CardTitle>Upload with Hiway Sync</CardTitle>
              <CardDescription>
                For files over 40 GB, or when you prefer uninterrupted uploads,
                use Hiway Sync.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex h-full flex-col justify-between gap-6">
              <div className="space-y-4 text-sm text-muted-foreground">
                <p>
                  Hiway Sync lets you upload content from your desktop in the
                  background - simply drag and drop your Hiway credentials into
                  the app, then drop your media files.
                </p>
                <div className="space-y-2">
                  <p className="font-semibold text-white">Steps:</p>
                  <ol className="list-decimal list-inside space-y-1 ml-2">
                    <li>Download Hiway Sync</li>
                    <li>Create and download your credentials</li>
                    <li>Drag your credentials into Hiway Sync</li>
                    <li>Drag your video files into Hiway Sync</li>
                  </ol>
                </div>
                <p>
                  The upload will continue automatically even if you close your
                  browser.
                </p>
                <p>
                  Once complete, your files will appear in your Hiway account,
                  ready for processing.
                </p>
              </div>
              <div className="flex flex-col gap-3">
                <div className="flex gap-3 flex-wrap">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      window.open(
                        "https://github.com/HiwayDev/hiway-sync-releases/releases/latest/download/hiway-sync.exe",
                        "_blank"
                      );
                    }}
                  >
                    Download for Windows
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      window.open(
                        "https://github.com/HiwayDev/hiway-sync-releases/releases/latest/download/hiway-sync.dmg",
                        "_blank"
                      );
                    }}
                  >
                    Download for Mac
                  </Button>
                </div>
                <Button
                  className="w-full"
                  onClick={handleGenerateCredentials}
                  disabled={isGenerating}
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    "Generate credentials"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <VideoUploadModal
          isOpen={isVideoModalOpen}
          onClose={handleCloseVideoModal}
          parentFiles={parentFiles}
        />

        <DirectUploadTokenModal
          isOpen={isDirectUploadModalOpen}
          onClose={handleCloseCredentialsModal}
          credentials={credentials}
        />
      </div>

      {/* Upload Queue Section */}
      <div className="mt-10">
        <UploadQueueSection />
      </div>
    </>
  );
}

// Storage Summary Component
function StorageSummary({
  showHidden,
  onToggleShowHidden,
}: {
  showHidden: boolean;
  onToggleShowHidden: () => void;
}) {
  const { storage, isLoading } = useStorageDetails();

  return (
    <Card>
      <CardContent>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          {/* Left Section - Storage Details */}
          <div className="flex-1 flex gap-2 items-center">
            <div className="flex items-center gap-2">
              <HardDrive className="w-5 h-5 text-muted-foreground" />
              <h3 className="text-base font-semibold">Storage</h3>
            </div>
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-32" />
              </div>
            ) : (
              <div className=" text-sm flex flex-wrap gap-5 items-center">
                <div>
                  <span className="text-muted-foreground">Total: </span>
                  <span className="font-medium">
                    {storage?.total.toFixed(2)} GB
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Used: </span>
                  <span className="font-medium">
                    {storage?.used.toFixed(2)} GB
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Remaining: </span>
                  <span className="font-medium text-accent">
                    {storage?.remaining.toFixed(2)} GB
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">In Queue: </span>
                  <span className="font-medium text-muted-foreground/60">
                    {storage?.inProgress.toFixed(2)} GB
                  </span>
                </div>
              </div>
            )}
          </div>
          <div className="flex items-center gap-4 w-full md:w-auto">
            {isLoading ? (
              <Skeleton className="w-64 h-8" />
            ) : (
              <div className="w-full md:w-64 flex   items-center gap-3">
                <Progress
                  value={storage?.usedPercentage || 0}
                  className="h-2 "
                />
                <div className="text-xs text-muted-foreground mt-1 shrink-0">
                  {storage?.usedPercentage.toFixed(2)}% used
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Error Detail Modal
function ErrorDetailModal({
  isOpen,
  onClose,
  error,
  item,
  onRetry,
}: {
  isOpen: boolean;
  onClose: () => void;
  error?: {
    type?: string;
    message?: string;
    details?: {
      stack?: string;
      taskType?: string;
      originalMessage?: string;
      [key: string]: any;
    };
  };
  item?: {
    title: string;
    date: Date | string;
    size: number;
  };
  onRetry?: () => void;
}) {
  const errorCode = error?.type || "UNKNOWN_ERROR";
  const errorMessage = error?.message || "No error details available";
  const errorDetails = error?.details;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-destructive/20 flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-destructive" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold">
                Upload Error
              </DialogTitle>
              <DialogDescription className="mt-1">
                An error occurred while processing your file
              </DialogDescription>
            </div>
          </div>
        </div>

        <div className="space-y-4 bg-muted/40 border border-border rounded-lg p-6">
          {/* File Name */}
          <div>
            <label className="text-sm font-medium text-muted-foreground">
              File Name
            </label>
            <div className="mt-1 text-base font-semibold">
              {item?.title || "Unknown file"}
            </div>
          </div>

          {/* Error Code */}
          <div>
            <label className="text-sm font-medium text-muted-foreground">
              Error Code
            </label>
            <div className="mt-1 text-base font-semibold text-destructive">
              {errorCode}
            </div>
          </div>

          {/* Error Details */}
          <div>
            <label className="text-sm font-medium text-muted-foreground">
              Error Details
            </label>
            <div className="mt-1 text-sm text-destructive">{errorMessage}</div>
            {errorDetails && Object.keys(errorDetails).length > 0 && (
              <div className="mt-2 p-3 bg-destructive/10 border border-destructive/20 rounded text-xs">
                <pre className="whitespace-pre-wrap break-words">
                  {JSON.stringify(errorDetails, null, 2)}
                </pre>
              </div>
            )}
          </div>

          {/* Upload Information */}
          {item && (
            <div className="pt-2 border-t border-border">
              <div className="text-xs text-muted-foreground">
                Uploaded: {format(new Date(item.date), "yyyy-MM-dd HH:mm:ss")} |
                Size: {formatBytes(item.size)}
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 mt-6">
          {onRetry && (
            <Button
              onClick={() => {
                onRetry();
                onClose();
              }}
              className="bg-accent text-black hover:bg-accent/90"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry Upload
            </Button>
          )}
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Status Badge Component - matches ProgressItem behavior
function StatusBadge({
  status,
  errorMessage,
  onErrorClick,
}: {
  status: MediaStatus;
  errorMessage?: string;
  onErrorClick?: () => void;
}) {
  // Get description matching ProgressItem logic
  const getDescription = () => {
    switch (status) {
      case MediaStatus.MODERATION_IN_PROGRESS:
      case MediaStatus.UPLOADING_TO_ELUVIO:
      case MediaStatus.FINALIZE_ABR_MEZZANINE_IN_PROGRESS:
      case MediaStatus.TRANSCODING_IN_PROGRESS:
      case MediaStatus.WAITING_FINALIZE_ABR_MEZZANINE_START:
      case MediaStatus.WAITING_TRANSCODING_START:
        return "Processing";
      case MediaStatus.ERROR:
        return "error";
      case MediaStatus.READY:
        return "Uploaded";
      case MediaStatus.UPLOAD_IN_PROGRESS:
      default:
        return "Uploading";
    }
  };

  const description = getDescription();

  if (status === MediaStatus.READY) {
    return (
      <div className="flex items-center gap-2 text-green-500">
        <CheckCircle2 className="w-4 h-4" />
        <span className="text-sm font-medium uppercase">{description}</span>
      </div>
    );
  }

  if (status === MediaStatus.ERROR) {
    return (
      <button
        onClick={onErrorClick}
        className="flex items-center gap-2 text-destructive hover:text-destructive/80 transition-colors cursor-pointer"
      >
        <AlertCircle className="w-4 h-4" />
        <span className="text-sm font-medium uppercase underline">
          {description}
        </span>
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2 text-accent">
      <Loader2 className="w-4 h-4 animate-spin" />
      <span className="text-xs font-light uppercase">{description}</span>
    </div>
  );
}

// Format file name from media
function getFileName(media: IMedia): string {
  return media.metadata?.title || media.name || "Untitled";
}

// Get format from source
function getFormat(media: IMedia): string {
  if (media.source?.mimeType) {
    const mimeParts = media.source.mimeType.split("/");
    return mimeParts[mimeParts.length - 1].toUpperCase();
  }
  return "N/A";
}

// Get source (Browser or Hiway Sync) - TODO: Add source field to IMedia
function getSource(media: IMedia): string {
  // This would come from the API - for now defaulting to Browser
  return "Browser";
}

// Upload Queue Section Component
function UploadQueueSection() {
  const { data: user } = useUser();
  const effectiveRole = useEffectiveRole();
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch] = useDebounce(searchTerm, 500);
  const [selectedError, setSelectedError] = useState<{
    error: {
      type?: string;
      message?: string;
      details?: {
        stack?: string;
        taskType?: string;
        originalMessage?: string;
        [key: string]: any;
      };
    };
    item: {
      title: string;
      date: Date | string;
      size: number;
      id?: string;
    };
  } | null>(null);
  const [hiddenItems, setHiddenItems] = useState<Set<string>>(new Set());
  const [showHidden, setShowHidden] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [retryingIds, setRetryingIds] = useState<Set<string>>(new Set());
  const { MediaService } = useDla();

  const canRetry = effectiveRole === CompanyRole.OWNER;

  // Determine if user should see all uploads or just their own
  const canSeeAll =
    effectiveRole === CompanyRole.OWNER ||
    effectiveRole === CompanyRole.ADMIN ||
    effectiveRole === CompanyRole.MEMBER;

  const { items, isLoading, refetch } = useUploadQueue({
    userId: canSeeAll ? undefined : user?.id,
  });

  // Filter by search term and hidden items
  const filteredItems = useMemo(() => {
    return items
      .filter((item) => {
        if (item.id && hiddenItems.has(item.id) && !showHidden) return false;
        if (debouncedSearch) {
          const searchLower = debouncedSearch.toLowerCase();
          return item.title.toLowerCase().includes(searchLower);
        }
        return true;
      })
      .sort((a, b) => {
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        if (Math.abs(dateA - dateB) < 1000) {
          return (a.id || "").localeCompare(b.id || "");
        }
        return dateB - dateA;
      });
  }, [items, debouncedSearch, hiddenItems, showHidden]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedItems = filteredItems.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, showHidden]);

  const handleHide = (itemId: string) => {
    setHiddenItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  const handleRetry = async (mediaId: string) => {
    if (!mediaId) {
      toast.error("Media ID is required to retry upload");
      return;
    }

    try {
      setRetryingIds((prev) => new Set(prev).add(mediaId));
      const response = await MediaService.retryMedia(mediaId);

      if (response.success) {
        toast.success(
          response.message || "Media processing restarted successfully"
        );
        refetch();
      } else {
        toast.error(response.message || "Failed to restart media processing");
      }
    } catch (error) {
      console.error("Failed to retry upload:", error);
      const errorMessage = getErrorMessage(error);
      toast.error(errorMessage || "Failed to retry upload. Please try again.");
    } finally {
      setRetryingIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(mediaId);
        return newSet;
      });
    }
  };

  const handleErrorClick = (item: IUploadQueueItem) => {
    // Parse error if it's a string, otherwise use the error object
    let errorObj: {
      type?: string;
      message?: string;
      details?: any;
    } = {};

    if (item.error) {
      if (typeof item.error === "string") {
        errorObj = { message: item.error };
      } else if (typeof item.error === "object") {
        errorObj = {
          type: (item.error as any).type,
          message: item.error.message || (item.error as any).message,
          details: (item.error as any).details,
        };
      }
    }

    setSelectedError({
      error: errorObj,
      item: {
        title: item.title,
        date: item.date,
        size: item.size,
        id: item.id,
      },
    });
  };

  return (
    <div className="space-y-3">
      {/* Storage Summary */}
      <StorageSummary
        showHidden={showHidden}
        onToggleShowHidden={() => setShowHidden(!showHidden)}
      />

      {/* Search and Filters Card */}
      <Card>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 md:items-end">
            <InputEnhanced
              placeholder="Search by file name..."
              label="Search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              iconLeft={<Search className="w-4 h-4" />}
              className="w-full"
            />
            <Button
              variant="outline"
              onClick={() => setShowHidden(!showHidden)}
            >
              {showHidden ? (
                <>
                  <EyeOff className="w-4 h-4 mr-2" />
                  Hide Hidden
                </>
              ) : (
                <>
                  <Search className="w-4 h-4 mr-2" />
                  Show Hidden
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Upload Queue Card */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-2">
            <CardTitle>Upload Queue</CardTitle>
            <CardDescription>
              Track the progress of your file uploads and processing
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>File Name</TableHead>
                  <TableHead>Date/Time</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Uploaded</TableHead>
                  <TableHead>Format</TableHead>
                  <TableHead>Uploaded By</TableHead>
                  <TableHead>Source</TableHead>
                  {/* <TableHead>Processing</TableHead> */}
                  <TableHead>Status</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      {Array.from({ length: 10 }).map((_, j) => (
                        <TableCell key={j}>
                          <Skeleton className="h-4 w-full" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : filteredItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-12">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Upload className="w-8 h-8 mb-2 opacity-40" />
                        <div className="font-semibold text-lg">
                          No uploads found
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {debouncedSearch
                            ? "Try adjusting your search terms"
                            : "Your upload queue is empty"}
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedItems.map((item) => {
                    const progress = getProcessingPercentage(item.status);
                    const isHidden = item.id ? hiddenItems.has(item.id) : false;

                    return (
                      <TableRow key={item.id || item.title}>
                        <TableCell className="font-medium">
                          {item.title}
                        </TableCell>
                        <TableCell>
                          {format(new Date(item.date), "yyyy-MM-dd HH:mm:ss")}
                        </TableCell>
                        <TableCell>
                          {item.size ? formatBytes(item.size) : "-"}
                        </TableCell>
                        <TableCell>
                          {item.uploadedSize
                            ? formatBytes(item.uploadedSize)
                            : item.status !== MediaStatus.UPLOAD_IN_PROGRESS
                            ? formatBytes(item.size)
                            : "-"}
                        </TableCell>
                        <TableCell>{item.format}</TableCell>
                        <TableCell>{item.uploadedBy}</TableCell>
                        <TableCell>{item.source}</TableCell>
                        {/* <TableCell>
                          {item.status !== MediaStatus.UPLOAD_IN_PROGRESS &&
                          item.status !== MediaStatus.ERROR &&
                          item.status !== MediaStatus.READY ? (
                            <div className="space-y-1">
                              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                                <span>{progress}%</span>
                              </div>
                              <div className="w-full bg-muted-foreground/20 rounded-full h-1.5">
                                <div
                                  className="bg-accent h-1.5 rounded-full transition-all duration-300"
                                  style={{ width: `${progress}%` }}
                                />
                              </div>
                            </div>
                          ) : null}
                        </TableCell> */}
                        <TableCell>
                          <StatusBadge
                            status={item.status}
                            errorMessage={
                              typeof item.error === "string"
                                ? item.error
                                : item.error?.message || undefined
                            }
                            onErrorClick={() => handleErrorClick(item)}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {item.status === MediaStatus.ERROR &&
                              item.id &&
                              canRetry && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleRetry(item.id!)}
                                  disabled={retryingIds.has(item.id)}
                                  title="Retry failed upload"
                                >
                                  {retryingIds.has(item.id) ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                  ) : (
                                    <RefreshCw className="w-4 h-4" />
                                  )}
                                </Button>
                              )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleHide(item.id!)}
                              title={isHidden ? "Unhide" : "Hide"}
                            >
                              {isHidden ? (
                                <Search className="w-4 h-4" />
                              ) : (
                                <EyeOff className="w-4 h-4" />
                              )}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Pagination Controls */}
      {filteredItems.length > itemsPerPage && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {startIndex + 1} to{" "}
            {Math.min(endIndex, filteredItems.length)} of {filteredItems.length}{" "}
            results
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => {
                  // Show first page, last page, current page, and pages around current
                  if (
                    page === 1 ||
                    page === totalPages ||
                    (page >= currentPage - 1 && page <= currentPage + 1)
                  ) {
                    return (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(page)}
                        className="min-w-[2.5rem]"
                      >
                        {page}
                      </Button>
                    );
                  } else if (
                    page === currentPage - 2 ||
                    page === currentPage + 2
                  ) {
                    return (
                      <span key={page} className="px-2 text-muted-foreground">
                        ...
                      </span>
                    );
                  }
                  return null;
                }
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setCurrentPage((prev) => Math.min(totalPages, prev + 1))
              }
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Error Detail Modal */}
      <ErrorDetailModal
        isOpen={!!selectedError}
        onClose={() => setSelectedError(null)}
        error={selectedError?.error}
        item={selectedError?.item}
        onRetry={
          selectedError?.item?.id && canRetry
            ? () => handleRetry(selectedError.item.id!)
            : undefined
        }
      />
    </div>
  );
}

export default function UploadPage() {
  return (
    <RoleGuard requiredPermission="media:write">
      <UploadPageContent />
    </RoleGuard>
  );
}
