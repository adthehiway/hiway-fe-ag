import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { secondsToHHMMSS } from "@/lib/utils";
import { OverviewType } from "@/types";
import { Clock, Eye, Play } from "lucide-react";
import { useRouter } from "next/navigation";

const LatestUpload = ({
  overviewData,
  isLoading,
  ...props
}: {
  overviewData: OverviewType | null;
  isLoading: boolean;
  props?: React.HTMLAttributes<HTMLDivElement>;
}) => {
  const router = useRouter();

  return (
    <>
      {isLoading ? (
        <Card {...props}>
          <CardHeader>
            <Skeleton className="h-6 w-40 mb-2" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className=" aspect-video " />
            <div className="space-y-2">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-4 w-1/4" />
              </div>
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </CardContent>
        </Card>
      ) : overviewData?.recentMedia ? (
        <Card {...props} className="h-full flex flex-col overflow-hidden">
          <CardHeader className="flex-shrink-0 pb-2">
            <CardTitle className="text-base">Latest Upload</CardTitle>
            <CardDescription className="text-xs">Your most recent video content</CardDescription>
          </CardHeader>
          <CardContent className="pt-0 flex-1 flex flex-col min-h-0 overflow-hidden">
            <div className="flex flex-col h-full gap-2">
              {/* Thumbnail - takes available space but can shrink */}
              <div className="relative flex-1 min-h-[80px] bg-muted/50 rounded-lg overflow-hidden">
                {overviewData?.recentMedia.cfThumbnail && process.env.NEXT_PUBLIC_CONTENT_FABRIC_BASE_URL_STATICS ? (
                  <img
                    src={`${process.env.NEXT_PUBLIC_CONTENT_FABRIC_BASE_URL_STATICS}${overviewData?.recentMedia.cfThumbnail}?width=270`}
                    alt={overviewData?.recentMedia.metadata?.title}
                    className="w-full h-full object-cover absolute inset-0"
                  />
                ) : (
                  <div className="w-full h-full absolute inset-0 bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center">
                    <Play className="size-10 text-slate-400" />
                  </div>
                )}
                <button className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-10 flex items-center justify-center rounded-full bg-muted/90">
                  <Play size={16} />
                </button>
                <div className="absolute bottom-1.5 right-1.5">
                  <div className="inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-semibold bg-muted text-white">
                    <Clock size={10} className="mr-1" />
                    {secondsToHHMMSS(
                      overviewData?.recentMedia.source?.duration ?? 0
                    )}
                  </div>
                </div>
                <div className="absolute top-1.5 left-1.5">
                  <div className="inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-semibold bg-yellow-500 text-accent-foreground">
                    {overviewData?.recentMedia.status}
                  </div>
                </div>
              </div>

              {/* Info section - fixed height */}
              <div className="flex-shrink-0 space-y-0.5">
                <h3 className="font-medium text-foreground line-clamp-1 text-sm">
                  {overviewData?.recentMedia.metadata?.title}
                </h3>
                <p className="text-xs text-slate-500 line-clamp-1">
                  {overviewData?.recentMedia.metadata?.description}
                </p>
                <div className="flex items-center justify-between text-[10px] text-slate-500">
                  <span>
                    Uploaded{" "}
                    {new Date(
                      overviewData?.recentMedia.createdAt
                    ).toLocaleDateString()}
                  </span>
                  <div className="flex items-center gap-1">
                    <Eye size={10} />
                    {overviewData?.recentMedia.totalViews} views
                  </div>
                </div>
              </div>

              {/* Buttons - fixed height */}
              <div className="flex-shrink-0 flex gap-2">
                <Button
                  variant={"secondary"}
                  className="flex-1 text-xs h-8"
                  size="sm"
                  onClick={() =>
                    router.push(
                      `/dashboard/media/${overviewData?.recentMedia.id}/edit`
                    )
                  }
                >
                  Edit
                </Button>
                <Button
                  className="flex-1 text-xs h-8"
                  size="sm"
                  onClick={() =>
                    router.push(
                      `/dashboard/media/${overviewData?.recentMedia.id}`
                    )
                  }
                >
                  Share
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card {...props}>
          <CardHeader>
            <CardTitle>Latest Upload</CardTitle>
            <CardDescription>Your most recent video content</CardDescription>
          </CardHeader>
          <CardContent className="text-center text-muted-foreground flex items-center justify-center py-6 text-sm">
            You have no recent uploads, upload a video to get started
          </CardContent>
        </Card>
      )}
    </>
  );
};

export default LatestUpload;
