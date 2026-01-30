import {
  useQuery,
  useMutation,
  useQueryClient,
  useInfiniteQuery,
} from "@tanstack/react-query";
import MediaService from "@/services/media";
import {
  IMedia,
  MediaStatus,
  IMediaAnalytics,
  ISmartLink,
  SmartLinkType,
  IMediaAsset,
  IFeatureUsage,
  MediaStats,
  IPaginationResult,
  IMediaRelationship,
  ContentRelationshipType,
} from "@/types";
import { toast } from "react-toastify";

export function useMedia(id: string, token: boolean = false) {
  const { data, isLoading, isError, error, refetch } = useQuery<IMedia, Error>({
    queryKey: ["media", id],
    queryFn: () => MediaService.getById(id, token),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  const isEmpty = !isLoading && !isError && !data;

  return { data, isLoading, isError, isEmpty, error, refetch };
}

export function useUpdateMedia() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<IMedia> }) =>
      MediaService.update(id, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["media", variables.id] });
      toast.success("Media updated successfully");
    },
    onError: (error: any) => {
      // Handle validation errors with array messages
      const errorResponse = error?.response?.data;
      if (errorResponse?.message) {
        // If message is an array, join them
        if (Array.isArray(errorResponse.message)) {
          const errorMessages = errorResponse.message.join(", ");
          toast.error(errorMessages);
        } else {
          toast.error(errorResponse.message);
        }
      } else {
        toast.error(error?.message || "Failed to update media");
      }
    },
  });
}

export function useMediaByStatus(
  status: MediaStatus[],
  perPage: number = 100,
  search?: string
) {
  const { data, isLoading, isError, error, refetch } = useQuery<
    { items: IMedia[] },
    Error
  >({
    queryKey: ["media-by-status", status, perPage, search],
    queryFn: () => MediaService.getByStatus({ status, perPage, search }),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  const mediaList = data?.items || [];
  const isEmpty = !isLoading && !isError && mediaList.length === 0;

  return {
    mediaList,
    isLoading,
    isError,
    isEmpty,
    error,
    refetch,
  };
}

// Hook for fetching media analytics
export function useMediaAnalytics(mediaId: string) {
  const { data, isLoading, isError, error, refetch } = useQuery<
    IMediaAnalytics,
    Error
  >({
    queryKey: ["media-analytics", mediaId],
    queryFn: () => MediaService.getAnalyticsByMediaId(mediaId),
    enabled: !!mediaId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });

  return {
    data,
    isLoading,
    isError,
    error,
    refetch,
  };
}

export function useSmartlinksForMedia(mediaId: string) {
  const { data, isLoading, isError, error, refetch } = useQuery<
    ISmartLink[],
    Error
  >({
    queryKey: ["media-smartlinks", mediaId],
    queryFn: () => MediaService.getAllSmartlinks(mediaId),
    enabled: !!mediaId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });

  const smartlinks = data || [];
  const isEmpty = !isLoading && !isError && smartlinks.length === 0;

  return {
    data: smartlinks,
    isLoading,
    isError,
    isEmpty,
    error,
    refetch,
  };
}

export function useMediaAssets(mediaId: string) {
  const { data, isLoading, isError, error, refetch } = useQuery<
    { assets: IMediaAsset[]; storageUsage: IFeatureUsage },
    Error
  >({
    queryKey: ["media-assets", mediaId],
    queryFn: () => MediaService.getAssets(mediaId),
    enabled: !!mediaId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });

  const assets = data?.assets || [];
  const isEmpty = !isLoading && !isError && assets.length === 0;

  return {
    assets,
    storageUsage: data?.storageUsage,
    isLoading,
    isError,
    isEmpty,
    error,
    refetch,
  };
}

export function useAddSubtitle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      mediaId,
      data,
    }: {
      mediaId: string;
      data: {
        url: string;
        filename: string;
        filesize?: number;
        language: string;
        label: string;
        isDefault?: boolean;
      };
    }) => MediaService.addSubtitle(mediaId, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["media", variables.mediaId] });
      queryClient.invalidateQueries({
        queryKey: ["media-assets", variables.mediaId],
      });
      toast.success("Subtitle added successfully");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to add subtitle");
    },
  });
}

export function useAddAsset() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      mediaId,
      data,
    }: {
      mediaId: string;
      data: {
        url: string;
        filename: string;
        filesize?: number;
        assetType: string;
      };
    }) => MediaService.addAsset(mediaId, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["media", variables.mediaId] });
      queryClient.invalidateQueries({
        queryKey: ["media-assets", variables.mediaId],
      });
      toast.success("Asset added successfully");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to add asset");
    },
  });
}

export function useUpdateAsset() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      mediaId,
      assetId,
      data,
    }: {
      mediaId: string;
      assetId: string;
      data: {
        assetType: string;
      };
    }) => MediaService.updateAsset(mediaId, assetId, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["media", variables.mediaId] });
      queryClient.invalidateQueries({
        queryKey: ["media-assets", variables.mediaId],
      });
      toast.success("Asset type updated successfully");
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || "Failed to update asset type"
      );
    },
  });
}

export function useDeleteAsset() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ mediaId, assetId }: { mediaId: string; assetId: string }) =>
      MediaService.deleteAsset(mediaId, assetId),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["media", variables.mediaId] });
      queryClient.invalidateQueries({
        queryKey: ["media-assets", variables.mediaId],
      });
      toast.success("Asset deleted successfully");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to delete asset");
    },
  });
}

// Hook for fetching media statistics
export function useMediaStats() {
  const { data, isLoading, isError, error, refetch } = useQuery<
    MediaStats,
    Error
  >({
    queryKey: ["media-stats"],
    queryFn: () => MediaService.getStats(),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });

  return {
    data,
    isLoading,
    isError,
    error,
    refetch,
  };
}

// Hook for fetching paginated media list with filters
export function useMediaList({
  search,
  status,
  contentType,
  continuationToken,
  perPage,
}: {
  search?: string;
  status?: MediaStatus;
  contentType?: string;
  continuationToken?: number;
  perPage?: number;
} = {}) {
  const { data, isLoading, isError, error, refetch } = useQuery<
    IPaginationResult<IMedia>,
    Error
  >({
    queryKey: [
      "media-list",
      search,
      status,
      contentType,
      continuationToken,
      perPage,
    ],
    queryFn: () =>
      MediaService.getMediaList({
        search,
        status,
        contentType,
        continuationToken,
        perPage,
      }),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });

  const items = data?.items || [];
  const isEmpty = !isLoading && !isError && items.length === 0;

  return {
    data,
    items,
    isLoading,
    isError,
    isEmpty,
    error,
    refetch,
  };
}

// Hook for infinite scrolling media list with filters
export function useMediaListInfinite({
  search,
  status,
  contentType,
  perPage = 12,
}: {
  search?: string;
  status?: MediaStatus;
  contentType?: string;
  perPage?: number;
} = {}) {
  const {
    data,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  } = useInfiniteQuery<IPaginationResult<IMedia>, Error>({
    queryKey: ["media-list-infinite", search, status, contentType, perPage],
    queryFn: ({ pageParam }) =>
      MediaService.getMediaList({
        search,
        status,
        contentType,
        continuationToken: pageParam as number | undefined,
        perPage,
      }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      // If continuationToken is 0, null, or undefined, we don't have more data
      if (!lastPage.continuationToken || lastPage.continuationToken === 0) {
        return undefined;
      }
      return lastPage.continuationToken;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });

  // Flatten all pages into a single array and deduplicate by id
  const allItems = data?.pages.flatMap((page) => page.items || []) || [];
  // Deduplicate items by id to prevent duplicate keys
  const itemsMap = new Map<string, IMedia>();
  allItems.forEach((item) => {
    if (item.id && !itemsMap.has(item.id)) {
      itemsMap.set(item.id, item);
    }
  });
  const items = Array.from(itemsMap.values());
  const isEmpty = !isLoading && !isError && items.length === 0;

  return {
    items,
    isLoading,
    isError,
    isEmpty,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  };
}

// Hook for fetching content relationships
export function useContentRelationships(
  mediaId: string,
  relationshipType: ContentRelationshipType
) {
  const { data, isLoading, isError, error, refetch } = useQuery<
    IMediaRelationship[],
    Error
  >({
    queryKey: ["media-relationships", mediaId, relationshipType],
    queryFn: () =>
      MediaService.getContentRelationships(mediaId, relationshipType),
    enabled: !!mediaId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });

  return {
    relationships: data || [],
    isLoading,
    isError,
    error,
    refetch,
  };
}

// Hook for adding content relationship
export function useAddContentRelationship() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      mediaId,
      targetSmartLinkId,
      relationshipType,
      associatedType,
    }: {
      mediaId: string;
      targetSmartLinkId: string;
      relationshipType: ContentRelationshipType;
      associatedType?:
        | "PROMO"
        | "COMMERCIAL"
        | "TRAILER"
        | "BONUS_CLIP"
        | "BTS";
    }) =>
      MediaService.addContentRelationship(mediaId, {
        targetSmartLinkId,
        relationshipType,
        associatedType,
      }),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["media-relationships", variables.mediaId],
      });
      queryClient.invalidateQueries({
        queryKey: ["media", variables.mediaId],
      });
      toast.success("Content relationship added successfully");
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || "Failed to add content relationship"
      );
    },
  });
}

// Hook for deleting content relationship
export function useDeleteContentRelationship() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      mediaId,
      relationshipId,
    }: {
      mediaId: string;
      relationshipId: string;
    }) => MediaService.deleteContentRelationship(mediaId, relationshipId),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["media-relationships", variables.mediaId],
      });
      queryClient.invalidateQueries({
        queryKey: ["media", variables.mediaId],
      });
      toast.success("Content relationship removed successfully");
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message ||
          "Failed to remove content relationship"
      );
    },
  });
}

// Hook for fetching storage details
export function useStorageDetails() {
  const { data, isLoading, isError, error, refetch } = useQuery<
    {
      total: number;
      used: number;
      remaining: number;
      inProgress: number;
      usedPercentage: number;
    },
    Error
  >({
    queryKey: ["storage-details"],
    queryFn: () => MediaService.getStorageDetails(),
    staleTime: 5 * 60 * 1000,
    
    refetchOnWindowFocus: true,
  });

  return {
    storage: data,
    isLoading,
    isError,
    error,
    refetch,
  };
}
