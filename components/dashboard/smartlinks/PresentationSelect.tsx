import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Icon } from "@/components/ui/icons";
import { EmbedStyle, ISmartLink } from "@/types";
import { Play, Upload } from "lucide-react";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import DragAndDropUploader from "@/components/ui/drag-and-drop-uploader";
import PlayOverlay from "../common/play-overlay";

const COLOR_OPTIONS = [
  {
    label: "Dark Slate",
    value: "dark-slate",
    gradient: "bg-gradient-to-b from-[#374151] to-[#1e293b]",
  },
  {
    label: "Purple",
    value: "purple",
    gradient: "bg-gradient-to-b from-purple-700 to-purple-900",
  },
  {
    label: "Emerald",
    value: "emerald",
    gradient: "bg-gradient-to-b from-emerald-700 to-emerald-900",
  },
];

const EMBED_STYLE_OPTIONS = [
  { label: "Default", value: EmbedStyle.DEFAULT },
  { label: "Play Button Only", value: EmbedStyle.PLAY_BUTTON_ONLY },
];

type ISmartLinkWithEmbed = ISmartLink & { embedStyle?: EmbedStyle };

const PresentationSelect = ({
  smartLink,
  onChange,
  setThumbnail,
  setBackgroundImage,
}: {
  smartLink: Partial<ISmartLinkWithEmbed>;
  onChange: (field: keyof ISmartLinkWithEmbed, value: any) => void;
  setThumbnail: (file: File) => void;
  setBackgroundImage: (file: File) => void;
}) => {
  const [color, setColor] = useState(
    smartLink.backgroundColor || COLOR_OPTIONS[0].value
  );
  const [localThumbnail, setLocalThumbnail] = useState<File | null>(null);
  const [localBackgroundImage, setLocalBackgroundImage] = useState<File | null>(
    null
  );

  const selectedColor = COLOR_OPTIONS.find((c) => c.value === color);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Presentation</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* <DragAndDropUploader
          label="Video Thumbnail"
          description="Choose from video thumbnails or upload your own"
          value={localThumbnail}
          onDrop={(file) => {
            setLocalThumbnail(file);
            setThumbnail(file);
          }}
        /> */}
        <DragAndDropUploader
          label="Background Image"
          description="Upload a background image for your presentation (1920x1080)"
          minWidth={1920}
          minHeight={1080}
          value={localBackgroundImage}
          onDrop={(file) => {
            setLocalBackgroundImage(file);
            setBackgroundImage(file);
          }}
        />
        <div className="text-center text-muted-foreground my-4 flex items-center justify-center gap-2">
          <Separator className="flex-1" />
          <span className="text-muted-foreground text-sm">OR</span>
          <Separator className="flex-1" />
        </div>
        <div>
          <Label className="mb-2 text-white text-sm">
            Choose Color Background
          </Label>
          <p className="text-muted-foreground text-sm mb-2">
            Select from preset color options
          </p>
          <Select
            value={color}
            onValueChange={(val) => {
              setColor(val);
              onChange("backgroundColor", val);
            }}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="w-full">
              {COLOR_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Embed Style Select */}
        <div>
          <Label className="mb-2 text-white text-sm">Embed Style</Label>
          <p className="text-muted-foreground text-sm mb-2">
            Choose how the SmartLink will be embedded
          </p>
          <Select
            value={smartLink.embedStyle || "DEFAULT"}
            onValueChange={(val) => onChange("embedStyle", val)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="w-full">
              {EMBED_STYLE_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="mb-2 text-white text-sm">Background Preview</Label>
          <div
            className={`rounded-lg overflow-hidden h-32 flex flex-col items-center justify-center relative ${
              selectedColor?.gradient || ""
            }`}
          >
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10 flex-col">
              <PlayOverlay disabled />
              {!smartLink.backgroundUrl && !localBackgroundImage && (
                <span className="text-white mt-2">Video Preview</span>
              )}
            </div>
            {smartLink.backgroundUrl || localBackgroundImage ? (
              <img
                src={
                  localBackgroundImage
                    ? URL.createObjectURL(localBackgroundImage)
                    : smartLink.backgroundUrl
                }
                alt="Thumbnail Preview"
                className=" object-cover w-full h-full object-center"
              />
            ) : (
              <></>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PresentationSelect;
