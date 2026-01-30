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
        <Card {...props}>
          <CardHeader>
            <CardTitle>Latest Upload</CardTitle>
            <CardDescription>Your most recent video content</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="relative aspect-video bg-muted/50 rounded-lg overflow-hidden">
                <img
                  src={`${process.env.NEXT_PUBLIC_CONTENT_FABRIC_BASE_URL_STATICS}${overviewData?.recentMedia.cfThumbnail}?width=270`}
                  alt={overviewData?.recentMedia.metadata?.title}
                  className="w-full h-full object-cover absolute inset-0 "
                />
                <button className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-20 flex items-center justify-center rounded-full bg-muted">
                  <Play />
                </button>
                <div className="absolute bottom-2 right-2">
                  <div className="inline-flex items-center rounded-full  px-2 py-0.5 text-xs font-semibold  bg-muted text-white">
                    <Clock size={12} className="mr-2" />
                    {secondsToHHMMSS(
                      overviewData?.recentMedia.source?.duration ?? 0
                    )}
                  </div>
                </div>
                <div className="absolute top-2 left-2">
                  <div className="inline-flex items-center rounded-full  px-2 py-0.5 text-xs font-semibold  bg-yellow-500 text-accent-foreground">
                    {overviewData?.recentMedia.status}
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="font-medium text-white line-clamp-2">
                  {overviewData?.recentMedia.metadata?.title}
                </h3>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {overviewData?.recentMedia.metadata?.description}
                </p>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>
                    Uploaded{" "}
                    {new Date(
                      overviewData?.recentMedia.createdAt
                    ).toLocaleDateString()}
                  </span>
                  <div className="flex items-center gap-1">
                    <Eye size={12} />
                    {overviewData?.recentMedia.totalViews} views
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant={"secondary"}
                  className="flex-1"
                  onClick={() =>
                    router.push(
                      `/dashboard/media/${overviewData?.recentMedia.id}/edit`
                    )
                  }
                >
                  Edit Details
                </Button>
                <Button
                  className="flex-1"
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
          <CardContent className="text-center text-muted-foreground flex items-center justify-center h-full">
            You have no recent uploads, upload a video to get started
          </CardContent>
        </Card>
      )}
    </>
  );
};

export default LatestUpload;
