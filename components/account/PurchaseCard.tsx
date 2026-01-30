"use client";

import { AccountPurchase } from "@/types";
import { Button } from "@/components/ui/button";
import { getSmartLinkUrl } from "@/lib/utils";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

interface PurchaseCardProps {
  purchase: AccountPurchase;
  showExpiry?: boolean;
}

export function PurchaseCard({ purchase, showExpiry = false }: PurchaseCardProps) {
  const watchUrl = getSmartLinkUrl({ slug: purchase.slug });
  const isRental = purchase.type === "RENTAL";

  // Format expiry for rentals
  const formatExpiry = (seconds?: number): string => {
    if (!seconds) return "";
      const days = Math.floor(seconds / 86400);
    if (days <= 0) return "Expires today";
    return `Expires in ${days} day${days !== 1 ? "s" : ""}`;
  };

  const thumbnailUrl = purchase.media.cfThumbnail
    ? `${process.env.NEXT_PUBLIC_CONTENT_FABRIC_BASE_URL_STATICS}${purchase.media.cfThumbnail}?width=1920`
    : "/images/default.png";

  return (
    <div className="group relative">
      {/* Thumbnail Container */}
      <div className="relative aspect-video overflow-hidden bg-muted rounded-lg">
        <img
          src={thumbnailUrl}
          alt={purchase.media.name}
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
          {purchase.media.name}
        </h3>

        {/* Purchase Date */}
        <div className="flex items-center gap-2 text-[10px] sm:text-xs text-muted-foreground flex-wrap">
          <span>Purchased {formatDistanceToNow(new Date(purchase.datePurchased), { addSuffix: true })}</span>
          {isRental && showExpiry && purchase.timeRemainingSeconds && (
            <>
              <span>•</span>
              <span>{formatExpiry(purchase.timeRemainingSeconds)}</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

