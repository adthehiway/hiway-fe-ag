import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AddThumbnail } from "@/components/dashboard/common/add-thumbnail.component";
import { IMedia } from "@/types";
import { MediaFormData } from "./hooks/useMediaForm";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Info } from "lucide-react";

interface ThumbnailSectionProps {
  media: IMedia | undefined;
  form: MediaFormData;
  onThumbnailChange: (src: string) => void;
}

export function ThumbnailSection({
  media,
  form,
  onThumbnailChange,
}: ThumbnailSectionProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <CardTitle>Add Thumbnail</CardTitle>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <Info className="w-4 h-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent
              side="right"
              className="max-w-sm p-4 text-sm bg-card border  text-popover-foreground"
            >
              <div className="space-y-3">
                <p className="font-semibold">TIP:</p>
                <p>
                  For the best quality background image on your smartlink landing
                  page follow the below guidelines:
                </p>
                <div className="space-y-2">
                  <div>
                    <p className="font-medium mb-1">Image Dimensions:</p>
                    <ul className="list-disc list-inside space-y-1 text-xs">
                      <li>
                        Minimum: <strong>1920 x 1080 pixels</strong> (Full HD)
                      </li>
                      <li>
                        Recommended: <strong>2560 x 1440 pixels</strong> or{" "}
                        <strong>3840 x 2160 pixels</strong> (4K)
                      </li>
                      <li>
                        Aspect Ratio: <strong>16:9</strong> is ideal for landscape
                        backgrounds
                      </li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-medium mb-1">File Format & Quality:</p>
                    <ul className="list-disc list-inside space-y-1 text-xs">
                      <li>
                        Format: <strong>JPEG</strong> or <strong>WebP</strong>
                      </li>
                      <li>
                        JPEG Quality: <strong>85-95%</strong> (higher quality for
                        hero/background images)
                      </li>
                      <li>
                        WebP: Provides better compression with same visual quality
                      </li>
                      <li>
                        File Size: Aim for under <strong>500KB-1MB</strong> even at
                        high resolution (balance quality vs. load time)
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </TooltipContent>
          </Tooltip>
        </div>
      </CardHeader>
      <CardContent>
        <AddThumbnail
          media={media as IMedia}
          title="Thumbnails"
          uploadModalTitle="Upload thumbnail"
          buttonText="Set as default"
          selectedSrc={media?.cfThumbnail || ""}
          onChange={onThumbnailChange}
        />
      </CardContent>
    </Card>
  );
}
