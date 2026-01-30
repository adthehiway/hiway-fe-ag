import { useQuery } from "@tanstack/react-query";
import SmartRoomService from "@/services/smartrooms";
import { SmartRoomsAnalytics } from "@/types";

export function useSmartRoomsAnalytics() {
  const { data, isLoading, isError, error, refetch } = useQuery<
    SmartRoomsAnalytics,
    Error
  >({
    queryKey: ["smartrooms-analytics"],
    queryFn: () => SmartRoomService.getAnalytics(),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes cache time
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  return { data, isLoading, isError, error, refetch };
}
