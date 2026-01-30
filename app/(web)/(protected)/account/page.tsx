"use client";

import { CollectionCard } from "@/components/account/CollectionCard";
import { PurchaseCard } from "@/components/account/PurchaseCard";
import {
  RecommendationCard,
  RecommendationItem,
} from "@/components/account/RecommendationCard";
import { Skeleton } from "@/components/ui/skeleton";
import {
  usePurchases,
  useRecommendations,
  useRoomPurchases,
} from "@/hooks/useAccount";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useDebounce } from "use-debounce";

const page = () => {
  const searchParams = useSearchParams();

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch] = useDebounce(searchTerm, 500);

  // Sync search term with URL
  useEffect(() => {
    const urlSearch = searchParams.get("search") || "";
    if (urlSearch !== searchTerm) {
      setSearchTerm(urlSearch);
    }
  }, [searchParams, searchTerm]);

  // Fetch recommendations
  // const { recommendations, isLoading: recommendationsLoading } =
  //   useRecommendations();

  // Fetch all purchases (no filter)
  const { purchases, isLoading: purchasesLoading } = usePurchases({
    search: debouncedSearch,
    filter: "purchases",
    perPage: 3,
  });

  const { purchases: rentals, isLoading: rentalsLoading } = usePurchases({
    search: debouncedSearch,
    filter: "rentals",
    perPage: 3,
  });

  // Fetch Room Purchases (Collections)
  const { roomPurchases, isLoading: collectionsLoading } = useRoomPurchases({
    perPage: 3,
  });

  const recentlyPurchased = useMemo(() => {
    return [...purchases, ...rentals]
      .sort(
        (a, b) =>
          new Date(b.datePurchased).getTime() -
          new Date(a.datePurchased).getTime()
      )
      .slice(0, 3);
  }, [purchases, rentals]);

  // Process recommendations - extract recommendations array from API response
  // const recommendationItems = useMemo(() => {
  //   if (!recommendations) return [];

  //   // API returns { recommendations: [...], total: number, preferences: {...} }
  //   if (
  //     recommendations.recommendations &&
  //     Array.isArray(recommendations.recommendations)
  //   ) {
  //     return recommendations.recommendations as RecommendationItem[];
  //   }

  //   // Fallback: if it's directly an array
  //   if (Array.isArray(recommendations)) {
  //     return recommendations as RecommendationItem[];
  //   }

  //   return [];
  // }, [recommendations]);

  return (
    <div className="space-y-8 pb-8">
      {/* Header with Search */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl sm:text-3xl font-bold">My Library</h1>
      </div>

      {/* Recently Purchased Section */}
      {recentlyPurchased.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-xl sm:text-2xl font-semibold">
            Recently Purchased
          </h2>
          {purchasesLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => (
                <div key={i}>
                  <Skeleton className="aspect-video w-full rounded-lg" />
                  <Skeleton className="h-4 w-3/4 mt-3" />
                  <Skeleton className="h-3 w-1/2 mt-2" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {recentlyPurchased.map((purchase) => (
                <PurchaseCard key={purchase.id} purchase={purchase} />
              ))}
            </div>
          )}
        </section>
      )}

      {/* Purchases Section */}
      <section className="space-y-4">
        <div className="flex items-center gap-4">
          <h2 className="text-xl sm:text-2xl font-semibold">Purchases</h2>
          <div className="flex-1 h-px bg-border" />
          <Link
            href="/account/purchases"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            See all
          </Link>
        </div>
        {purchasesLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i}>
                <Skeleton className="aspect-video w-full rounded-lg" />
                <Skeleton className="h-4 w-3/4 mt-3" />
                <Skeleton className="h-3 w-1/2 mt-2" />
              </div>
            ))}
          </div>
        ) : purchases.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {purchases.map((purchase) => (
              <PurchaseCard key={purchase.id} purchase={purchase} />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground text-sm">
            No purchases yet
          </div>
        )}
      </section>

      {/* Rentals Section */}
      <section className="space-y-4">
        <div className="flex items-center gap-4">
          <h2 className="text-xl sm:text-2xl font-semibold">Rentals</h2>
          <div className="flex-1 h-px bg-border" />
          <Link
            href="/account/rentals"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            See all
          </Link>
        </div>
        {rentalsLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(2)].map((_, i) => (
              <div key={i}>
                <Skeleton className="aspect-video w-full rounded-lg" />
                <Skeleton className="h-4 w-3/4 mt-3" />
                <Skeleton className="h-3 w-1/2 mt-2" />
              </div>
            ))}
          </div>
        ) : rentals.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {rentals.map((purchase) => (
              <PurchaseCard key={purchase.id} purchase={purchase} showExpiry />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground text-sm">
            No rentals yet
          </div>
        )}
      </section>

      {/* Collections Section (SmartRooms) */}
      <section className="space-y-4">
        <div className="flex items-center gap-4">
          <h2 className="text-xl sm:text-2xl font-semibold">Collections</h2>
          <div className="flex-1 h-px bg-border" />
          <Link
            href="/account/collections"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            See all
          </Link>
        </div>
        {collectionsLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(2)].map((_, i) => (
              <div key={i}>
                <Skeleton className="aspect-video w-full rounded-lg" />
                <Skeleton className="h-4 w-3/4 mt-3" />
                <Skeleton className="h-3 w-1/2 mt-2" />
              </div>
            ))}
          </div>
        ) : roomPurchases.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {roomPurchases.map((roomPurchase) => (
              <CollectionCard
                key={roomPurchase.id}
                roomPurchase={roomPurchase}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground text-sm">
            No collections yet
          </div>
        )}
      </section>

      {/* Recommendations Section */}
      {/* {recommendationItems.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-xl sm:text-2xl font-semibold">
            You May Also Like
          </h2>
          {recommendationsLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => (
                <div key={i}>
                  <Skeleton className="aspect-video w-full rounded-lg" />
                  <Skeleton className="h-4 w-3/4 mt-3" />
                  <Skeleton className="h-3 w-1/2 mt-2" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {recommendationItems
                .slice(0, 3)
                .map((recommendation: RecommendationItem) => (
                  <RecommendationCard
                    key={recommendation.id}
                    recommendation={recommendation}
                  />
                ))}
            </div>
          )}
        </section>
      )} */}
    </div>
  );
};

export default page;
