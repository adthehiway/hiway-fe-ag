import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import SmartLinkService from "@/services/smartlinks";
import SettingsService from "@/services/settings";
import {
  SmartLinkAccess,
  SmartLinkStatus,
  ISmartLink,
  ISettings,
} from "@/types";

interface UseSmartLinksParams {
  access?: SmartLinkAccess;
  search?: string;
  status?: SmartLinkStatus;
  perPage?: number;
}

// Hook for fetching paginated smartlinks
export function useSmartLinks({
  access,
  search,
  status,
  perPage = 50,
  enabled = true,
}: UseSmartLinksParams & { enabled?: boolean } = {}) {
  const {
    data,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  } = useInfiniteQuery({
    queryKey: ["smartlinks", access, search, status],
    queryFn: ({ pageParam }) =>
      SmartLinkService.getAll({
        perPage,
        access,
        q: search,
        continuationToken: pageParam,
        status: status !== SmartLinkStatus.ALL ? status : undefined,
      }),
    enabled: enabled && !!access, // Only run if enabled and access is provided
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      // If continuationToken is 0, null, or undefined, we don't have more data
      if (!lastPage.continuationToken || lastPage.continuationToken === 0) {
        return undefined;
      }
      return lastPage.continuationToken;
    },
    staleTime: 1 * 60 * 1000, // 1 minute - shorter cache since it's filterable
    gcTime: 3 * 60 * 1000, // 3 minutes cache time
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  // Flatten all pages into a single array
  const smartLinks = data?.pages.flatMap((page) => page.items || []) || [];

  return {
    smartLinks,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  };
}

// Hook for fetching a single smartlink by ID
export function useSmartLink(id: string) {
  return useQuery({
    queryKey: ["smartlink", id],
    queryFn: () => SmartLinkService.getById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
  });
}

// Hook for creating a new smartlink
export function useCreateSmartLink() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<ISmartLink>) => SmartLinkService.create(data),
    onSuccess: (newSmartLink) => {
      // Add the new smartlink to the cache
      queryClient.setQueryData(["smartlink", newSmartLink.id], newSmartLink);

      // Invalidate all smartlink-related queries to ensure fresh data
      queryClient.invalidateQueries({
        predicate: (query) => {
          const queryKey = query.queryKey;
          return (
            (Array.isArray(queryKey) && queryKey[0] === "smartlinks") ||
            (Array.isArray(queryKey) && queryKey[0] === "smartlinks-analytics")
          );
        },
      });

      // Force refetch the smartlinks list immediately
      queryClient.refetchQueries({
        predicate: (query) => {
          const queryKey = query.queryKey;
          return Array.isArray(queryKey) && queryKey[0] === "smartlinks";
        },
      });
    },
    onError: (error) => {
      console.error("Failed to create smartlink:", error);
    },
  });
}

// Hook for updating a smartlink
export function useUpdateSmartLink() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ISmartLink> }) =>
      SmartLinkService.update(id, data),
    onSuccess: (updatedSmartLink, variables) => {
      // Update the specific smartlink in cache
      queryClient.setQueryData(["smartlink", variables.id], updatedSmartLink);

      // Invalidate all smartlink-related queries to ensure fresh data
      queryClient.invalidateQueries({
        predicate: (query) => {
          const queryKey = query.queryKey;
          return (
            (Array.isArray(queryKey) && queryKey[0] === "smartlinks") ||
            (Array.isArray(queryKey) && queryKey[0] === "smartlinks-analytics")
          );
        },
      });

      // Force refetch the smartlinks list immediately
      queryClient.refetchQueries({
        predicate: (query) => {
          const queryKey = query.queryKey;
          return Array.isArray(queryKey) && queryKey[0] === "smartlinks";
        },
      });
    },
    onError: (error) => {
      console.error("Failed to update smartlink:", error);
    },
  });
}

// Hook for deleting a smartlink
export function useDeleteSmartLink() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => SmartLinkService.deleteById(id),
    onSuccess: (_, deletedId) => {
      // Remove the deleted smartlink from cache
      queryClient.removeQueries({ queryKey: ["smartlink", deletedId] });

      // Invalidate all smartlink-related queries to ensure fresh data
      queryClient.invalidateQueries({
        predicate: (query) => {
          const queryKey = query.queryKey;
          return (
            (Array.isArray(queryKey) && queryKey[0] === "smartlinks") ||
            (Array.isArray(queryKey) && queryKey[0] === "smartlinks-analytics")
          );
        },
      });

      // Force refetch the smartlinks list immediately
      queryClient.refetchQueries({
        predicate: (query) => {
          const queryKey = query.queryKey;
          return Array.isArray(queryKey) && queryKey[0] === "smartlinks";
        },
      });
    },
    onError: (error) => {
      console.error("Failed to delete smartlink:", error);
    },
  });
}

// Hook for smartlinks analytics
export function useSmartLinksAnalytics() {
  return useQuery({
    queryKey: ["smartlinks-analytics"],
    queryFn: () => SmartLinkService.getAnalytics(),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
}

// Hook for fetching  settings
export function useSettings() {
  return useQuery({
    queryKey: ["settings"],
    queryFn: () => SettingsService.get(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
  });
}

// Hook for updating  settings
export function useUpdateSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<ISettings>) => SettingsService.update(data),
    onSuccess: (updatedSettings) => {
      // Update the settings in cache
      queryClient.setQueryData(["settings"], updatedSettings);

      // Invalidate related queries
      queryClient.invalidateQueries({
        queryKey: ["settings"],
      });
    },
    onError: (error) => {
      console.error("Failed to update settings:", error);
    },
  });
}
