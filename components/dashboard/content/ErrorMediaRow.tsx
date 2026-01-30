import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getErrorMessage } from "@/lib/utils";
import { IMedia } from "@/types";
import { AlertTriangle, Trash2, X } from "lucide-react";
import moment from "moment";
import React, { useState } from "react";
import DeleteMediaModal from "@/components/dashboard/common/DeleteMediaModal";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import mediaService from "@/services/media";
import { toast } from "react-toastify";

interface ErrorMediaRowProps {
  media: IMedia;
}

const ErrorMediaRow: React.FC<ErrorMediaRowProps> = ({ media }) => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const queryClient = useQueryClient();

  // Fetch full media data only when delete modal is open
  const { data: fullMediaData, isLoading: mediaLoading } = useQuery({
    queryKey: ["media", media.id],
    queryFn: () => mediaService.getById(media.id),
    enabled: showDeleteModal,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  // Fetch smartlinks only when delete modal is open
  const { data: smartlinks, isLoading: smartlinksLoading } = useQuery({
    queryKey: ["smartlinks", media.id],
    queryFn: () => mediaService.getAllSmartlinks(media.id),
    enabled: showDeleteModal,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });

  const handleDeleteMedia = async () => {
    try {
      await mediaService.deleteById(media.id);

      queryClient.invalidateQueries({
        queryKey: ["content-library-overview"],
        exact: false,
      });
      queryClient.invalidateQueries({
        queryKey: ["media-list-infinite"],
        exact: false,
      });

      toast.success("Media deleted successfully");
      setShowDeleteModal(false);
    } catch (error) {
      console.error("Failed to delete media:", error);
      toast.error("Failed to delete media. Please try again.");
      throw error;
    }
  };

  const errorMessage = getErrorMessage(media.error);

  return (
    <>
      {/* Mobile Layout */}
      <div className="md:hidden p-4 border-b border-border hover:bg-muted/50 transition-colors">
        <div className="flex items-start gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-red-950/20 text-red-400 shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm break-words">
                  {media.metadata?.title &&
                  media.metadata.title.trim().length > 0
                    ? media.metadata.title
                    : media.name}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {moment(media.createdAt).format("MMM DD, YYYY HH:mm")}
                </div>
              </div>
              <Button
                variant="ghost"
                size="iconSm"
                onClick={() => setShowDeleteModal(true)}
                className="text-muted-foreground hover:text-destructive shrink-0"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
            <div className="space-y-2">
              <div className="text-sm text-red-400 break-words">
                {errorMessage}
              </div>
              <Badge variant="destructive" className="text-xs w-fit">
                Error
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:grid grid-cols-12 gap-4 items-center p-4 border-b border-border hover:bg-muted/50 transition-colors">
        <div className="col-span-4 flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-red-950/20 text-red-400 shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="font-semibold text-sm truncate">
              {media.metadata?.title && media.metadata.title.trim().length > 0
                ? media.metadata.title
                : media.name}
            </div>
            <div className="text-xs text-muted-foreground">
              {moment(media.createdAt).format("MMM DD, YYYY HH:mm")}
            </div>
          </div>
        </div>
        <div className="col-span-5">
          <div className="text-sm text-red-400 break-words">{errorMessage}</div>
        </div>
        <div className="col-span-2 flex items-center gap-2">
          <Badge variant="destructive" className="text-xs">
            Error
          </Badge>
        </div>
        <div className="col-span-1 flex items-center justify-end gap-2">
          <Button
            variant="ghost"
            size="iconSm"
            onClick={() => setShowDeleteModal(true)}
            className="text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <DeleteMediaModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteMedia}
        media={fullMediaData || media}
        smartlinks={smartlinks || []}
        isLoading={isDeleting || mediaLoading || smartlinksLoading}
      />
    </>
  );
};

export default ErrorMediaRow;
