import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import AccountService from "@/services/account";
import {
  WalletSummary,
  AccountPurchase,
  IAccountRoomPurchase,
  PaginatedRoomPurchasesResponse,
} from "@/types";

interface UsePurchasesParams {
  perPage?: number;
  search?: string;
  filter?: "all" | "purchases" | "rentals";
  sortBy?: "newest" | "oldest" | "expiring-soon" | "title-asc" | "title-desc";
}

// Hook for fetching wallet summary
export function useWalletSummary() {
  const { data, isLoading, isError, error, refetch } = useQuery<
    WalletSummary,
    Error
  >({
    queryKey: ["wallet-summary"],
    queryFn: () => AccountService.getWalletSummary(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
  });

  return {
    summary: data,
    isLoading,
    isError,
    error,
    refetch,
  };
}

// Hook for fetching paginated purchases with enhanced features
export function usePurchases({
  perPage = 50,
  search,
  filter = "all",
  sortBy,
}: UsePurchasesParams = {}) {
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
    queryKey: ["purchases", search, filter, sortBy],
    queryFn: ({ pageParam }) =>
      AccountService.getPurchases({
        perPage,
        continuationToken: pageParam,
        search,
        filter,
        sortBy,
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

  // Flatten the paginated data and deduplicate by id
  const allPurchases = data?.pages.flatMap((page) => page.items) || [];
  const purchasesMap = new Map<string, AccountPurchase>();
  allPurchases.forEach((purchase) => {
    if (purchase.id && !purchasesMap.has(purchase.id)) {
      purchasesMap.set(purchase.id, purchase);
    }
  });
  const purchases = Array.from(purchasesMap.values());

  return {
    purchases,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
    isEmpty: !isLoading && purchases.length === 0,
    continuationToken: data?.pages[data.pages.length - 1]?.continuationToken,
  };
}

// Hook for fetching recommendations
export function useRecommendations() {
  const { data, isLoading, isError, error, refetch } = useQuery<any, Error>({
    queryKey: ["recommendations"],
    queryFn: () => AccountService.getRecommendations(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
  });

  return {
    recommendations: data,
    isLoading,
    isError,
    error,
    refetch,
  };
}

// Hook for fetching room purchases (collections)
export function useRoomPurchases(
  params: {
    perPage?: number;
    search?: string;
    sortBy?: "newest" | "oldest" | "title-asc" | "title-desc";
  } = {}
) {
  const { data, isLoading, isError, error, refetch } = useQuery<
    PaginatedRoomPurchasesResponse,
    Error
  >({
    queryKey: ["room-purchases", params.perPage, params.search, params.sortBy],
    queryFn: () => AccountService.getRoomPurchases(params),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });

  return {
    roomPurchases: data?.items || [],
    isLoading,
    isError,
    error,
    refetch,
  };
}
