import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { IMedia } from "@/types";

interface TechnicalInfoSectionProps {
  media: IMedia | undefined;
}

export function TechnicalInfoSection({ media }: TechnicalInfoSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Technical Information</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <div className="font-semibold">File Format</div>
            <div>{media?.source?.mimeType || "MP4"}</div>
          </div>
          <div>
            <div className="font-semibold">Resolution</div>
            <div>
              {media?.source?.width && media?.source?.height
                ? `${media.source.width}x${media.source.height}`
                : "4K (3840×2160)"}
            </div>
          </div>
          <div>
            <div className="font-semibold">Frame Rate</div>
            <div>24 fps</div>
          </div>
          <div>
            <div className="font-semibold">Aspect Ratio</div>
            <div>{media?.source?.aspectRatio || "16:9"}</div>
          </div>
          <div>
            <div className="font-semibold">Audio Format</div>
            <div>{media?.source?.codecName || "AAC, 48kHz"}</div>
          </div>
          <div>
            <div className="font-semibold">File Size</div>
            <div>
              {media?.source?.size
                ? `${(media.source.size / (1024 * 1024 * 1024)).toFixed(2)} GB`
                : "2.4 GB"}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

