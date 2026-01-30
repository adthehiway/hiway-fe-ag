import { useQuery } from "@tanstack/react-query";
import MediaService from "@/services/media";
import { IUploadQueueResponse, IUploadQueueItem } from "@/types";

interface UseUploadQueueParams {
  userId?: string; // For filtering by user (collaborators) - handled by backend
  perPage?: number;
  continuationToken?: number;
}

export function useUploadQueue({
  userId,
  perPage = 100,
  continuationToken,
}: UseUploadQueueParams = {}) {
  const { data, isLoading, isError, error, refetch } = useQuery<
    IUploadQueueResponse,
    Error
  >({
    queryKey: ["upload-queue", userId, perPage, continuationToken],
    queryFn: () =>
      MediaService.getUploadQueue({
        perPage,
        continuationToken,
      }),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
    refetchInterval: 10000,
  });

  return {
    items: data?.items || [],
    isLoading,
    isError,
    error,
    refetch,
    continuationToken: data?.continuationToken,
    total: data?.items?.length || 0,
  };
}
