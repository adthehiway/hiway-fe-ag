"use client";

import React, { useState, useEffect } from "react";
import { CollectionCard } from "@/components/account/CollectionCard";
import { useRoomPurchases } from "@/hooks/useAccount";
import { useDebounce } from "use-debounce";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSearchParams } from "next/navigation";

type SortOption = "newest" | "oldest" | "title-asc" | "title-desc";

const CollectionsPage = () => {
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(
    searchParams.get("search") || ""
  );
  const [debouncedSearch] = useDebounce(searchTerm, 500);
  const [sortBy, setSortBy] = useState<SortOption>("newest");

  // Sync search term with URL
  useEffect(() => {
    const urlSearch = searchParams.get("search") || "";
    if (urlSearch !== searchTerm) {
      setSearchTerm(urlSearch);
    }
  }, [searchParams, searchTerm]);

  const { roomPurchases, isLoading } = useRoomPurchases({
    perPage: 100,
    search: debouncedSearch || undefined,
    sortBy,
  });

  return (
    <div className="min-h-screen relative">
      {/* Cinema seats background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background" />
        <div
          className="absolute bottom-0 left-0 right-0 h-1/2 bg-cover bg-center opacity-10 blur-sm"
          style={{
            backgroundImage: "url('/images/cinema-seats.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "bottom",
          }}
        />
      </div>

      <div className="space-y-6 relative z-10">
        {/* Title and Sort */}
        <div className="flex items-center gap-4">
          <h1 className="text-2xl sm:text-3xl font-bold">Collections</h1>
          <div className="flex-1 h-px bg-border" />
          <Select
            value={sortBy}
            onValueChange={(v) => setSortBy(v as SortOption)}
          >
            <SelectTrigger className="w-40 bg-secondary">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="oldest">Oldest</SelectItem>
              <SelectItem value="title-asc">Title A-Z</SelectItem>
              <SelectItem value="title-desc">Title Z-A</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Content Grid */}
        {isLoading && roomPurchases.length === 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(9)].map((_, i) => (
              <div key={i}>
                <Skeleton className="aspect-video w-full rounded-lg" />
                <Skeleton className="h-4 w-3/4 mt-3" />
                <Skeleton className="h-3 w-1/2 mt-2" />
              </div>
            ))}
          </div>
        ) : roomPurchases.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            {debouncedSearch
              ? "No collections found matching your search"
              : "No collections found"}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {roomPurchases.map((collection) => (
              <CollectionCard key={collection.id} roomPurchase={collection} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CollectionsPage;
