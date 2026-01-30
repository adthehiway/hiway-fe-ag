"use client";

import { IAccountRoomPurchase } from "@/types";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

interface CollectionCardProps {
  roomPurchase: IAccountRoomPurchase;
}

export function CollectionCard({ roomPurchase }: CollectionCardProps) {
  const viewUrl = `/room/${roomPurchase.slug}`;
  const totalVideos = roomPurchase.itemCount;

  const thumbnailUrl = roomPurchase.thumbnail
    ? `${process.env.NEXT_PUBLIC_CONTENT_FABRIC_BASE_URL_STATICS}${roomPurchase.thumbnail}?width=1920`
    : roomPurchase.backgroundUrl
    ? `${process.env.NEXT_PUBLIC_CONTENT_FABRIC_BASE_URL_STATICS}${roomPurchase.backgroundUrl}?width=1920`
    : "/images/default.png";

  return (
    <div className="group relative">
      {/* Thumbnail Container */}
      <div className="relative aspect-video overflow-hidden bg-muted rounded-lg">
        <img
          src={thumbnailUrl}
          alt={roomPurchase.name}
          className="w-full h-full object-cover transition-transform group-hover:scale-105"
          loading="lazy"
        />

        {/* View Now Button Overlay - Top Right */}
        <div className="absolute top-2 right-2">
          <Link href={viewUrl}>
            <Button
              size="sm"
              className="bg-yellow-500 hover:bg-yellow-600 text-black font-medium text-xs sm:text-sm"
            >
              View now
            </Button>
          </Link>
        </div>
      </div>

      {/* Card Info */}
      <div className="mt-3 space-y-1">
        {/* Title */}
        <h3 className="font-medium text-xs sm:text-sm text-foreground line-clamp-2">
          {roomPurchase.name}
        </h3>

        {/* Meta Info */}
        <div className="flex items-center gap-2 text-[10px] sm:text-xs text-muted-foreground flex-wrap">
          <span>
            Purchased{" "}
            {formatDistanceToNow(new Date(roomPurchase.datePurchased), {
              addSuffix: true,
            })}
          </span>
          {totalVideos > 0 && (
            <>
              <span>•</span>
              <span>
                {totalVideos} total video{totalVideos !== 1 ? "s" : ""}
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
