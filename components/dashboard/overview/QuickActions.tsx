import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { quickActions } from "@/config/dashboard/overview";
import { useState } from "react";
import { useRouter } from "next/navigation";
import VideoUploadModal from "../common/VideoUploadModal";
import SmartLinkModal from "../common/SmartLinkModal";
import SmartRoomModal from "../common/SmartRoomModal";

const QuickActions = ({
  isLoading,
  ...props
}: {
  isLoading: boolean;
  props?: React.HTMLAttributes<HTMLDivElement>;
}) => {
  const router = useRouter();
  const [uploadModelOpen, setUploadModelOpen] = useState(false);
  const [smartLinkModalOpen, setSmartLinkModalOpen] = useState(false);
  const [smartRoomModalOpen, setSmartRoomModalOpen] = useState(false);

  return (
    <Card {...props}>
      {isLoading ? (
        <>
          <CardHeader className="flex flex-row justify-between items-center">
            <div className="flex flex-col gap-2">
              <Skeleton className="h-6 w-40 mb-2" />
              <Skeleton className="h-4 w-64" />
            </div>
            <Skeleton className="h-8 w-8 rounded-full" />
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid gap-2 grid-cols-2">
              {[...Array(4)].map((_, index) => (
                <div
                  key={index}
                  className="flex flex-col items-center text-center p-2 rounded-lg bg-muted/50 border"
                >
                  <Skeleton className="h-8 w-8 rounded-lg mb-1" />
                  <Skeleton className="h-3 w-16" />
                </div>
              ))}
            </div>
          </CardContent>
        </>
      ) : (
        <>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Streamline your workflow with these shortcuts
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid gap-2 grid-cols-2">
              {quickActions.map((action, index) => (
                <div
                  key={index}
                  className="flex flex-col items-center text-center p-2 rounded-lg bg-muted/50 border cursor-pointer hover:bg-muted/80 transition-colors"
                  onClick={() => {
                    if (action.key === "uploadMedia") {
                      router.push("/dashboard/upload");
                    } else if (action.key === "createSmartLink") {
                      setSmartLinkModalOpen(true);
                    } else if (action.key === "shareLinks") {
                      router.push("/dashboard/smartlinks");
                    } else if (action.key === "createSmartRoom") {
                      setSmartRoomModalOpen(true);
                    }
                  }}
                >
                  <div className="h-8 w-8 rounded-lg text-accent flex items-center justify-center mb-1">
                    <action.icon size={20} />
                  </div>
                  <h3 className="font-medium text-xs">
                    {action.title}
                  </h3>
                </div>
              ))}
            </div>
          </CardContent>
        </>
      )}
      <VideoUploadModal
        isOpen={uploadModelOpen}
        onClose={() => setUploadModelOpen(false)}
      />
      <SmartLinkModal
        isOpen={smartLinkModalOpen}
        onClose={() => setSmartLinkModalOpen(false)}
      />
      <SmartRoomModal
        isOpen={smartRoomModalOpen}
        onClose={() => setSmartRoomModalOpen(false)}
      />
    </Card>
  );
};

export default QuickActions;
