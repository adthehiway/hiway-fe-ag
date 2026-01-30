"use client";

import { useState, useEffect, useRef } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { VideoPlayer } from "@/components/common/video-player.component";
import SmartLinkModal from "@/components/dashboard/common/SmartLinkModal";
import { IMedia } from "@/types";
import { Link2 } from "lucide-react";

interface SliceTabProps {
  media: IMedia;
}

function secondsToHHMMSSMillisecond(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
      2,
      "0",
    )}:${String(secs).padStart(2, "0")}`;
  }
  return `${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

export function SliceTab({ media }: SliceTabProps) {
  const [segmentStartSeconds, setSegmentStartSeconds] = useState<number>(0);
  const [segmentEndSeconds, setSegmentEndSeconds] = useState<number>(0);
  const [segmentError, setSegmentError] = useState<string>();
  const [smartLinkModalOpen, setSmartLinkModalOpen] = useState(false);
  const [mediaDuration, setMediaDuration] = useState<number>();
  const hasManualSelection = useRef(false);

  const segmentStart = secondsToHHMMSSMillisecond(segmentStartSeconds);
  const segmentEnd = secondsToHHMMSSMillisecond(segmentEndSeconds);

  useEffect(() => {
    const start = segmentStartSeconds;
    const end = segmentEndSeconds;
    const diffInSeconds = end - start;

    if (start >= end) {
      setSegmentError("Start time must be before end time");
    } else if (diffInSeconds <= 4) {
      setSegmentError("The slice must be longer than 5 seconds");
    } else {
      setSegmentError(undefined);
    }
  }, [segmentStartSeconds, segmentEndSeconds]);

  useEffect(() => {
    if (!mediaDuration) return;
    setSegmentStartSeconds(0);
    setSegmentEndSeconds(Math.floor(mediaDuration));
  }, [mediaDuration]);

  const handleMarkInOut = (values: { in: number; out: number }) => {
    hasManualSelection.current = true;
    setSegmentStartSeconds(Math.floor(values.in));
    setSegmentEndSeconds(Math.floor(values.out));
  };

  const handleCreateSmartLink = () => {
    console.log("Creating SmartLink with segment times (seconds):", {
      start: segmentStartSeconds,
      end: segmentEndSeconds,
    });
    setSmartLinkModalOpen(true);
  };

  return (
    <div className="space-y-3">
      <Card>
        <CardHeader>
          <CardTitle>Playable Slice</CardTitle>
          <CardDescription>
            Customize the playable segment of your video. Use the video player
            controls to mark the start and end points.
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-3">
        <Card>
          <CardHeader>
            <CardTitle>Time Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Start Time</Label>
              <span className="text-sm font-mono bg-muted px-3 py-1.5 rounded">
                {segmentStart}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <Label>End Time</Label>
              <span className="text-sm font-mono bg-muted px-3 py-1.5 rounded">
                {segmentEnd}
              </span>
            </div>
            {segmentError && (
              <p className="text-sm text-destructive">{segmentError}</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Video Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="w-full aspect-video bg-black rounded-lg overflow-hidden">
              <VideoPlayer
                token={media.signedToken || ""}
                versionHash={media.cfMezzanineHash as string}
                offering={""}
                autoplay={false}
                controls={{
                  markInOut: true,
                  previewMode: true,
                  markInOutCallback: handleMarkInOut,
                }}
                showShareButton={false}
                onDuration={(duration) => setMediaDuration(duration)}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button
          onClick={handleCreateSmartLink}
          className="bg-accent hover:bg-accent/90"
        >
          <Link2 size={16} className="mr-2" />
          Create SmartLink
        </Button>
      </div>

      <SmartLinkModal
        isOpen={smartLinkModalOpen}
        onClose={() => setSmartLinkModalOpen(false)}
        media={media}
        clipStart={hasManualSelection.current ? segmentStartSeconds : 0}
        clipEnd={
          hasManualSelection.current && mediaDuration
            ? segmentEndSeconds
            : mediaDuration
        }
      />
    </div>
  );
}
