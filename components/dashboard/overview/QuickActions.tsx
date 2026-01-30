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
          <CardContent>
            <div className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-3">
              {[...Array(3)].map((_, index) => (
                <div
                  key={index}
                  className="flex flex-col items-center text-center px-4 py-6 rounded-lg bg-muted/50 border "
                >
                  <Skeleton className="h-12 w-12 rounded-lg mb-3" />
                  <Skeleton className="h-5 w-32 mb-2" />
                  <Skeleton className="h-4 w-40" />
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
          <CardContent>
            <div className="grid gap-3 grid-cols-[repeat(auto-fit,minmax(250px,1fr))]">
              {quickActions.map((action, index) => (
                <div
                  key={index}
                  className="flex flex-col items-center text-center px-4 py-6 rounded-lg bg-muted/50 border cursor-pointer"
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
                  <div className="h-12 w-12 rounded-lg text-accent flex items-center justify-center mb-3">
                    <action.icon />
                  </div>
                  <h3 className=" font-medium mb-2">
                    {index + 1}. {action.title}
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    {action.description}
                  </p>
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
