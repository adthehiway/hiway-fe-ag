import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import SmartRoomService from "@/services/smartrooms";
import {
  SmartLinkAccess,
  ISmartRoom,
} from "@/types";

interface UseSmartRoomsParams {
  access?: SmartLinkAccess;
  search?: string;
  perPage?: number;
}

// Hook for fetching paginated smart rooms
export function useSmartRooms({
  access,
  search,
  perPage = 50,
}: UseSmartRoomsParams = {}) {
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
    queryKey: ["smartrooms", access, search],
    queryFn: ({ pageParam }) =>
      SmartRoomService.getAll({
        perPage,
        access,
        q: search,
        continuationToken: pageParam,
      }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      // If continuationToken is 0, null, or undefined, we don't have more data
      if (!lastPage.continuationToken || lastPage.continuationToken === 0) {
        return undefined;
      }
      return lastPage.continuationToken;
    },
    staleTime: 1 * 60 * 1000, // 1 minute
    gcTime: 3 * 60 * 1000, // 3 minutes cache time
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  // Flatten all pages into a single array
  const smartRooms = data?.pages.flatMap((page) => page.items || []) || [];

  return {
    smartRooms,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  };
}

// Hook for fetching a single smart room by ID
export function useSmartRoom(id: string) {
  return useQuery({
    queryKey: ["smartroom", id],
    queryFn: () => SmartRoomService.getById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
  });
}

// Hook for creating a new smart room
export function useCreateSmartRoom() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<ISmartRoom>) => SmartRoomService.create(data),
    onSuccess: (newSmartRoom) => {
      // Add the new smart room to the cache
      queryClient.setQueryData(["smartroom", newSmartRoom.id], newSmartRoom);

      // Invalidate all smart room-related queries to ensure fresh data
      queryClient.invalidateQueries({
        predicate: (query) => {
          const queryKey = query.queryKey;
          return (
            (Array.isArray(queryKey) && queryKey[0] === "smartrooms") ||
            (Array.isArray(queryKey) && queryKey[0] === "smartrooms-analytics")
          );
        },
      });

      // Force refetch the smart rooms list immediately
      queryClient.refetchQueries({
        predicate: (query) => {
          const queryKey = query.queryKey;
          return Array.isArray(queryKey) && queryKey[0] === "smartrooms";
        },
      });
    },
    onError: (error) => {
      console.error("Failed to create smart room:", error);
    },
  });
}

// Hook for updating a smart room
export function useUpdateSmartRoom() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ISmartRoom> }) =>
      SmartRoomService.update(id, data),
    onSuccess: (updatedSmartRoom, variables) => {
      // Update the specific smart room in cache
      queryClient.setQueryData(["smartroom", variables.id], updatedSmartRoom);

      // Invalidate all smart room-related queries to ensure fresh data
      queryClient.invalidateQueries({
        predicate: (query) => {
          const queryKey = query.queryKey;
          return (
            (Array.isArray(queryKey) && queryKey[0] === "smartrooms") ||
            (Array.isArray(queryKey) && queryKey[0] === "smartrooms-analytics")
          );
        },
      });

      // Force refetch the smart rooms list immediately
      queryClient.refetchQueries({
        predicate: (query) => {
          const queryKey = query.queryKey;
          return Array.isArray(queryKey) && queryKey[0] === "smartrooms";
        },
      });
    },
    onError: (error) => {
      console.error("Failed to update smart room:", error);
    },
  });
}

// Hook for deleting a smart room
export function useDeleteSmartRoom() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => SmartRoomService.deleteById(id),
    onSuccess: (_, deletedId) => {
      // Remove the deleted smart room from cache
      queryClient.removeQueries({ queryKey: ["smartroom", deletedId] });

      // Invalidate all smart room-related queries to ensure fresh data
      queryClient.invalidateQueries({
        predicate: (query) => {
          const queryKey = query.queryKey;
          return (
            (Array.isArray(queryKey) && queryKey[0] === "smartrooms") ||
            (Array.isArray(queryKey) && queryKey[0] === "smartrooms-analytics")
          );
        },
      });

      // Force refetch the smart rooms list immediately
      queryClient.refetchQueries({
        predicate: (query) => {
          const queryKey = query.queryKey;
          return Array.isArray(queryKey) && queryKey[0] === "smartrooms";
        },
      });
    },
    onError: (error) => {
      console.error("Failed to delete smart room:", error);
    },
  });
}

// Hook for adding media to a smart room
export function useAddMediaToRoom() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ roomId, mediaIds }: { roomId: string; mediaIds: string[] }) =>
      SmartRoomService.addMedia(roomId, mediaIds),
    onSuccess: (_, variables) => {
      // Invalidate the specific room to refetch with new media
      queryClient.invalidateQueries({
        queryKey: ["smartroom", variables.roomId],
      });

      // Invalidate all smart room-related queries
      queryClient.invalidateQueries({
        predicate: (query) => {
          const queryKey = query.queryKey;
          return (
            Array.isArray(queryKey) && queryKey[0] === "smartrooms"
          );
        },
      });
    },
    onError: (error) => {
      console.error("Failed to add media to room:", error);
    },
  });
}

// Hook for deleting smart links from a room
export function useDeleteSmartLinksFromRoom() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      roomId,
      smartLinkIds,
    }: {
      roomId: string;
      smartLinkIds: string[];
    }) => SmartRoomService.deleteSmartLinks(roomId, smartLinkIds),
    onSuccess: (_, variables) => {
      // Invalidate the specific room to refetch without deleted smart links
      queryClient.invalidateQueries({
        queryKey: ["smartroom", variables.roomId],
      });

      // Invalidate all smart room-related queries
      queryClient.invalidateQueries({
        predicate: (query) => {
          const queryKey = query.queryKey;
          return Array.isArray(queryKey) && queryKey[0] === "smartrooms";
        },
      });
    },
    onError: (error) => {
      console.error("Failed to delete smart links from room:", error);
    },
  });
}

// Hook for updating a smart link in a room
export function useUpdateSmartLinkInRoom() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      roomId,
      smartLinkId,
      data,
    }: {
      roomId: string;
      smartLinkId: string;
      data: { name?: string; description?: string };
    }) => SmartRoomService.updateSmartLink(roomId, smartLinkId, data),
    onSuccess: (_, variables) => {
      // Invalidate the specific room to refetch with updated smart link
      queryClient.invalidateQueries({
        queryKey: ["smartroom", variables.roomId],
      });

      // Invalidate all smart room-related queries
      queryClient.invalidateQueries({
        predicate: (query) => {
          const queryKey = query.queryKey;
          return Array.isArray(queryKey) && queryKey[0] === "smartrooms";
        },
      });
    },
    onError: (error) => {
      console.error("Failed to update smart link in room:", error);
    },
  });
}

