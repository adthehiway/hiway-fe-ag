import DeleteMediaModal from "@/components/dashboard/common/DeleteMediaModal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useUser } from "@/hooks/useUser";
import { useEffectiveRole } from "@/hooks/useUserRole";
import { hasPermission } from "@/lib/permissions";
import {
  formatBytes,
  formatNumber,
  getErrorMessage,
  mapMediaStatus,
  secondsToHHMMSS,
} from "@/lib/utils";
import mediaService from "@/services/media";
import { IMedia, MediaStatus } from "@/types";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Edit2,
  EyeIcon,
  Play,
  Video
} from "lucide-react";
import moment from "moment";
import Link from "next/link";
import { useState } from "react";
import { toast } from "react-toastify";

const MediaCard = ({
  media,
  isLoading,
  selectedStatus,
}: {
  media: IMedia;
  isLoading?: boolean;
  selectedStatus?: MediaStatus;
}) => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const queryClient = useQueryClient();
  const effectiveRole = useEffectiveRole();
  const { data: user } = useUser();
  // Check if user has permission to write media
  const canUpdateMedia =
    effectiveRole && user && hasPermission(effectiveRole, "media:update", user);

  // Fetch full media data only when delete modal is open
  const { data: fullMediaData, isLoading: mediaLoading } = useQuery({
    queryKey: ["media", media.id],
    queryFn: () => mediaService.getById(media.id),
    enabled: showDeleteModal, // Only fetch when modal is open
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  // Fetch smartlinks only when delete modal is open
  const { data: smartlinks, isLoading: smartlinksLoading } = useQuery({
    queryKey: ["smartlinks", media.id],
    queryFn: () => mediaService.getAllSmartlinks(media.id),
    enabled: showDeleteModal, // Only fetch when modal is open
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });

  const handleDeleteMedia = async () => {
    try {
      await mediaService.deleteById(media.id);

      // Invalidate content library queries to force refetch when page loads
      queryClient.invalidateQueries({
        queryKey: ["content-library-overview"],
        exact: false,
      });

      toast.success("Media deleted successfully");
      setShowDeleteModal(false);
    } catch (error) {
      console.error("Failed to delete media:", error);
      toast.error("Failed to delete media. Please try again.");
      throw error; // Re-throw to let the modal handle the error state
    }
  };
  return isLoading ? (
    <MediaCardSkeleton />
  ) : (
    <div className="bg-muted rounded-xl overflow-hidden shadow-lg flex flex-col border ">
      <div className="relative group aspect-video w-full overflow-hidden">
        <img
          src={
            media.cfThumbnail
              ? `${process.env.NEXT_PUBLIC_CONTENT_FABRIC_BASE_URL_STATICS}${media.cfThumbnail}?width=1920`
              : "/images/default.png"
          }
          alt={media.metadata?.title ?? media.name}
          className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-200"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
        <div className="absolute top-3 right-3 flex items-center gap-2 z-10">
          <Badge variant={"secondary"}>{mapMediaStatus(media.status)}</Badge>
        </div>
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
          <button className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-14 flex items-center justify-center rounded-full bg-muted/30">
            <Play />
          </button>
          {/* <span className="mt-2 text-xs text-white-100 font-semibold tracking-wide">
                      Film Cover
                    </span> */}
          <span className="absolute bottom-3 right-3 text-xs text-white-100 font-semibold">
            {secondsToHHMMSS(media?.source?.duration ?? 0)}
          </span>
        </div>
      </div>
      <div className="flex flex-col gap-2 p-4">
        <div className="font-bold text-base truncate">
          {media.metadata?.title ?? media.name}
        </div>
        <div className="flex items-center gap-2 text-xs text-white-60">
          <Badge
            variant={"outline"}
            className="flex items-center  px-2 py-1 rounded-full font-semibold"
          >
            <Video />
            Video
          </Badge>
          <span className="ml-2">{formatBytes(media?.source?.size ?? 0)}</span>
        </div>
        <div className="flex items-center gap-4 text-xs text-white-60 mt-1 justify-between">
          <span className="flex items-center">
            <EyeIcon className="w-4 h-4 mr-1" />
            {formatNumber(media?.totalViews ?? 0)} views
          </span>
          <span>{moment(media?.createdAt).fromNow()}</span>
        </div>
        {selectedStatus === MediaStatus.READY && (
          <div className="flex items-center gap-2 mt-2">
            <Button variant={"outline"} className="flex-1" asChild>
              <Link href={`/dashboard/media/${media.id}`}>
                <EyeIcon className="w-4 h-4" />
                View
              </Link>
            </Button>
            {canUpdateMedia && (
              <Button variant={"outline"} className="flex-1" asChild>
                <Link href={`/dashboard/media/${media.id}/edit`}>
                  <Edit2 className="w-4 h-4" />
                  Edit
                </Link>
              </Button>
            )}
            {/* <Button
            variant={"destructive"}
            size="icon"
            onClick={() => setShowDeleteModal(true)}
            disabled={isDeleting}
            className="shrink-0"
          >
            <Trash2 className="w-4 h-4" />
          </Button> */}
          </div>
        )}
        {selectedStatus === MediaStatus.ERROR && (
          <div className="text-red-500 text-sm">
            {getErrorMessage(media.error)}
          </div>
        )}
      </div>

      {/* Delete Media Modal */}
      <DeleteMediaModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteMedia}
        media={fullMediaData || media} // Use full media data if available, fallback to card media
        smartlinks={smartlinks || []} // Use fetched smartlinks data
        isLoading={isDeleting || mediaLoading || smartlinksLoading}
      />
    </div>
  );
};

export const MediaCardSkeleton = () => {
  return (
    <div className="bg-muted rounded-xl overflow-hidden shadow-lg flex flex-col border">
      <div className="relative aspect-video w-full overflow-hidden">
        <Skeleton className="w-full h-full" />
        <div className="absolute top-3 right-3">
          <Skeleton className="w-16 h-6 rounded-full" />
        </div>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <Skeleton className="w-14 h-14 rounded-full" />
          <Skeleton className="w-12 h-3 mt-2" />
        </div>
      </div>
      <div className="flex flex-col gap-2 p-4">
        <Skeleton className="h-5 w-3/4" />
        <div className="flex items-center gap-2">
          <Skeleton className="w-16 h-5 rounded-full" />
          <Skeleton className="w-12 h-3" />
        </div>
        <div className="flex items-center gap-4 mt-1">
          <Skeleton className="w-20 h-3" />
          <Skeleton className="w-16 h-3" />
        </div>
        <div className="flex items-center gap-2 mt-2">
          <Skeleton className="flex-1 h-9" />
          <Skeleton className="flex-1 h-9" />
          <Skeleton className="w-9 h-9" />
        </div>
      </div>
    </div>
  );
};

export default MediaCard;
