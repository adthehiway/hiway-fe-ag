import { useQuery } from "@tanstack/react-query";
import SmartRoomService from "@/services/smartrooms";
import { SmartRoomsAnalytics } from "@/types";
import { MOCK_MODE, mockSmartRoomsAnalytics } from "@/lib/mock-data";

export function useSmartRoomsAnalytics() {
  const { data, isLoading, isError, error, refetch } = useQuery<
    SmartRoomsAnalytics,
    Error
  >({
    queryKey: ["smartrooms-analytics"],
    queryFn: () => MOCK_MODE ? Promise.resolve(mockSmartRoomsAnalytics as SmartRoomsAnalytics) : SmartRoomService.getAnalytics(),
    staleTime: MOCK_MODE ? Infinity : 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000, // 5 minutes cache time
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  return { data, isLoading, isError, error, refetch };
}
