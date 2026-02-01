import { useQuery } from "@tanstack/react-query";
import { getOverview } from "@/lib/api";
import { OverviewType } from "@/types";
import { MOCK_MODE, mockDashboardOverview } from "@/lib/mock-data";

export function useDashboardOverview() {
  const { data, isLoading, isError, error, refetch } = useQuery<
    OverviewType,
    Error
  >({
    queryKey: ["dashboard-overview"],
    queryFn: () => MOCK_MODE ? Promise.resolve(mockDashboardOverview as OverviewType) : getOverview(),
    staleTime: MOCK_MODE ? Infinity : 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000, // 10 minutes - cache time (formerly cacheTime)
    refetchOnWindowFocus: false, // Don't refetch when window regains focus
    refetchOnMount: false, // Don't refetch on component mount if data exists
  });

  const isEmpty =
    !isLoading && !isError && (!data || Object.keys(data).length === 0);

  return { data, isLoading, isError, isEmpty, error, refetch };
}
