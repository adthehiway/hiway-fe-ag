import { useQuery } from "@tanstack/react-query";
import SmartLinkService from "@/services/smartlinks";
import { SmartlinksAnalytics } from "@/types";

export function useSmartLinksAnalytics() {
  const { data, isLoading, isError, error, refetch } = useQuery<
    SmartlinksAnalytics,
    Error
  >({
    queryKey: ["smartlinks-analytics"],
    queryFn: () => SmartLinkService.getAnalytics(),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes cache time
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  return { data, isLoading, isError, error, refetch };
}
