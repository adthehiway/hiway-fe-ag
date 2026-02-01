"use client";

import { Button } from "@/components/ui/button";
import { useDla } from "@/contexts/dla";
import { ProcessingItem, useMediaManager } from "@/contexts/media-manager";
import { IMedia, IPaginationResult, MediaStatus } from "@/types";
import { ChevronDown, ChevronUp, GripVertical, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { ProgressItem } from "./progress-item.component";
import { getErrorMessage } from "@/lib/utils";

export function UploadProgressWidget() {
  const { MediaService } = useDla();
  const { processingList, monitorStatus, clear } = useMediaManager();
  const [isExpanded, setIsExpanded] = useState(false);
  const [showCloseButton, setShowCloseButton] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [translateX, setTranslateX] = useState(0);
  const dragStartX = useRef<number | null>(null);
  const dragStartTranslate = useRef(0);
  const widgetRef = useRef<HTMLDivElement | null>(null);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  useEffect(() => {
    let totalFinished = 0;
    let totalUploading = 0;

    processingList.forEach((item) => {
      if (
        item.status === MediaStatus.ERROR ||
        item.status === MediaStatus.READY
      ) {
        totalFinished++;
      }
      if (item.status === MediaStatus.UPLOAD_IN_PROGRESS) {
        totalUploading++;
      }
    });

    setIsExpanded(true);
    setShowCloseButton(processingList.length === totalFinished);
    setShowWarning(totalUploading > 0);
  }, [processingList]);

  useEffect(() => {
    MediaService.getByStatus({
      status: [
        MediaStatus.WAITING_TRANSCODING_START,
        MediaStatus.UPLOADING_TO_ELUVIO,
        MediaStatus.TRANSCODING_IN_PROGRESS,
        MediaStatus.WAITING_FINALIZE_ABR_MEZZANINE_START,
        MediaStatus.FINALIZE_ABR_MEZZANINE_IN_PROGRESS,
        MediaStatus.MODERATION_IN_PROGRESS,
      ],
      perPage: 100,
    }).then((data: IPaginationResult<IMedia>) => {
      // Handle case where data or items might be undefined (e.g., in mock mode)
      if (!data?.items) return;

      const items: ProcessingItem[] = data.items.map((item) => ({
        id: item.id,
        name: item.metadata?.title || item.name,
        status: item.status,
        mediaId: item.id,
        errorMessage: getErrorMessage(item.error) || undefined,
      }));

      monitorStatus(items);
    }).catch(() => {
      // Silently handle errors in mock mode
    });
  }, []);

  const clampTranslateX = (nextTranslate: number) => {
    const width = widgetRef.current?.getBoundingClientRect().width || 0;
    const minTranslate = width + 40 - window.innerWidth;
    const clampedMin = Math.min(0, minTranslate);
    return Math.max(clampedMin, Math.min(0, nextTranslate));
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement | null;
    if (target?.closest("button")) {
      return;
    }
    dragStartX.current = event.clientX;
    dragStartTranslate.current = translateX;
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (dragStartX.current === null) return;
    const delta = event.clientX - dragStartX.current;
    const nextTranslate = dragStartTranslate.current + delta;
    setTranslateX(clampTranslateX(nextTranslate));
  };

  const handlePointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    dragStartX.current = null;
    try {
      event.currentTarget.releasePointerCapture(event.pointerId);
    } catch {
      // no-op
    }
  };

  return (
    <>
      {processingList.length > 0 && (
        <div
          ref={widgetRef}
          className="fixed bottom-[20px] right-[20px] z-50 max-w-[348px] flex flex-col gap-2 p-2 rounded-[8px] bg-muted shadow-lg cursor-grab active:cursor-grabbing select-none"
          style={{ transform: `translateX(${translateX}px)` }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
        >
          <div
            className={`flex flex-row justify-between h-[56px]  w-full p-2.5 items-center bg-muted border-b`}
          >
            <label className="block m-2 text-[14px] font-light text-muted-foreground uppercase overflow-hidden">
              <span className="line-clamp-1">Media Status</span>
            </label>
            <div className="p-2" />
            <div className={`flex flex-row items-center`}>
              <GripVertical size={16} className="text-muted-foreground mr-1" />
              <Button size="iconSm" variant={"ghost"} onClick={toggleExpand}>
                {isExpanded ? (
                  <ChevronDown size={16} />
                ) : (
                  <ChevronUp size={16} />
                )}
              </Button>
              {showCloseButton && (
                <Button size="iconSm" variant={"ghost"} onClick={clear}>
                  <X size={16} />
                </Button>
              )}
            </div>
          </div>

          {showWarning && (
            <div
              className={`flex rounded-lg w-full items-center bg-yellow-200/30 text-yellow-400`}
            >
              <label className="block m-2 text-[14px] font-light">
                Please keep the application open during the uploading process.
              </label>
              <div className="p-2" />
            </div>
          )}

          {isExpanded && (
            <div className="flex flex-col gap-2 divide-y">
              {processingList.map((item, index) => (
                <ProgressItem key={index} item={item}></ProgressItem>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}
