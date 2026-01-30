"use client";

import { Button } from "@/components/ui/button";
import { getSmartLinkUrl } from "@/lib/utils";
import Link from "next/link";
import { formatCurrencyAmount } from "@/lib/utils";

export interface RecommendationItem {
  id: string;
  slug: string;
  name: string;
  cfThumbnail?: string;
  contentType?: string;
  genres?: string[];
  publisher: {
    id: string;
    name: string;
    logo?: string;
  };
  relevanceScore?: number;
  reason?: string;
  price?: number;
  currency?: string;
}

interface RecommendationCardProps {
  recommendation: RecommendationItem;
}

export function RecommendationCard({ recommendation }: RecommendationCardProps) {
  const watchUrl = getSmartLinkUrl({ slug: recommendation.slug });

  const thumbnailUrl = recommendation.cfThumbnail
    ? `${process.env.NEXT_PUBLIC_CONTENT_FABRIC_BASE_URL_STATICS}${recommendation.cfThumbnail}?width=1920`
    : "/images/default.png";

  const title = recommendation.name || "Untitled";
  const genre = recommendation.genres?.find((g) => g && g.trim()) || recommendation.contentType;

  return (
    <div className="group relative">
      {/* Thumbnail Container */}
      <div className="relative aspect-video overflow-hidden bg-muted rounded-lg">
        <img
          src={thumbnailUrl}
          alt={title}
          className="w-full h-full object-cover transition-transform group-hover:scale-105"
          loading="lazy"
        />

        {/* Watch Now Button Overlay - Top Right */}
        <div className="absolute top-2 right-2">
          <Link href={watchUrl}>
            <Button
              size="sm"
              className="bg-yellow-500 hover:bg-yellow-600 text-black font-medium text-xs sm:text-sm"
            >
              Watch now
            </Button>
          </Link>
        </div>
      </div>

      {/* Card Info */}
      <div className="mt-3 space-y-1">
        {/* Title */}
        <h3 className="font-medium text-xs sm:text-sm text-foreground line-clamp-2">
          {title}
        </h3>

        {/* Meta Info */}
        <div className="flex items-center gap-2 text-[10px] sm:text-xs text-muted-foreground flex-wrap">
          {genre && <span>{genre}</span>}
          {recommendation.price && recommendation.currency && (
            <>
              {genre && <span>•</span>}
              <span className="font-medium">
                {formatCurrencyAmount(recommendation.price, recommendation.currency)}
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

