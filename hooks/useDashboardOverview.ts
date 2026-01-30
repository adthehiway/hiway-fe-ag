import { useQuery } from "@tanstack/react-query";
import { getOverview } from "@/lib/api";
import { OverviewType } from "@/types";

export function useDashboardOverview() {
  const { data, isLoading, isError, error, refetch } = useQuery<
    OverviewType,
    Error
  >({
    queryKey: ["dashboard-overview"],
    queryFn: getOverview,
    staleTime: 5 * 60 * 1000, // 5 minutes - data stays fresh for 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes - cache time (formerly cacheTime)
    refetchOnWindowFocus: false, // Don't refetch when window regains focus
    refetchOnMount: false, // Don't refetch on component mount if data exists
  });

  const isEmpty =
    !isLoading && !isError && (!data || Object.keys(data).length === 0);

  return { data, isLoading, isError, isEmpty, error, refetch };
}
