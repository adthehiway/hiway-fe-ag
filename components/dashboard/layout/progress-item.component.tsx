"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ProcessingItem, useMediaManager } from "@/contexts/media-manager";
import { MediaStatus } from "@/types";
import { Check, FileUp, Loader2, X } from "lucide-react";
import {
  formatBytes,
  formatUploadSpeed,
  formatRemainingTime,
  getErrorMessage,
  getProcessingPercentage,
} from "@/lib/utils";

interface Props {
  item: ProcessingItem;
}

export function ProgressItem(props: Props) {
  const router = useRouter();
  const { processingList, clear, removeFromProcessingList } = useMediaManager();
  const [description, setDescription] = useState("");

  useEffect(() => {
    switch (props.item.status) {
      case MediaStatus.MODERATION_IN_PROGRESS:
      case MediaStatus.UPLOADING_TO_ELUVIO:
      case MediaStatus.FINALIZE_ABR_MEZZANINE_IN_PROGRESS:
      case MediaStatus.TRANSCODING_IN_PROGRESS:
      case MediaStatus.WAITING_FINALIZE_ABR_MEZZANINE_START:
      case MediaStatus.WAITING_TRANSCODING_START:
        setDescription("Processing");
        break;
      case MediaStatus.ERROR:
        setDescription("error");
        break;
      case MediaStatus.READY:
        setDescription("Uploaded");
        break;
      case MediaStatus.UPLOAD_IN_PROGRESS:
      default:
        setDescription("Uploading");
        break;
    }
  }, [props]);



  const removeItem = () => {
    removeFromProcessingList(props.item.id);
  };
  return (
    <div>
      <div
        className={`flex flex-col  w-full p-2.5
      ${
        props.item.status === MediaStatus.ERROR
          ? "fill-destructive  text-destructive bg-destructive/10"
          : "bg-muted"
      }
      ${
        props.item.status !== MediaStatus.ERROR &&
        props.item.status !== MediaStatus.READY &&
        "fill-muted-foreground text-muted-foreground"
      }
      ${
        props.item.status === MediaStatus.READY &&
        "fill-white-100 text-white-100 cursor-pointer hover:bg-muted"
      }`}
        onClick={() => {
          if (props.item.status === MediaStatus.READY) {
            router.push(`/dashboard/media/${props.item.mediaId}`, {
              scroll: false,
            });
          }
        }}
      >
        <div className="flex flex-row justify-between  rounded-lg w-full items-center">
          <div className={`flex flex-row items-center`}>
            <FileUp size={16} />
            <label className="block m-2 text-[14px] font-light  overflow-hidden w-[150px]">
              <span
                className={`block w-full truncate ${
                  props.item.status === MediaStatus.READY && "cursor-pointer "
                }`}
              >
                {props.item.name}
              </span>
            </label>
          </div>
          <div
            className={`flex flex-row items-center flex-shrink-0 pl-[10px]
        ${
          props.item.status !== MediaStatus.ERROR &&
          props.item.status !== MediaStatus.READY &&
          "fill-accent text-accent"
        }`}
          >
            <label
              className={`block text-[12px] font-light uppercase  overflow-hidden`}
            >
              <span
                className={`line-clamp-1 ${
                  props.item.status === MediaStatus.READY && "cursor-pointer "
                }`}
              >
                {description}
              </span>
            </label>

            {props.item.status !== MediaStatus.ERROR &&
              props.item.status !== MediaStatus.READY && (
                <div className="pl-[10px]">
                  <Loader2 size={16} className="animate-spin" />
                </div>
              )}

            {props.item.status === MediaStatus.ERROR && (
              <div
                className="pl-[10px] cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  removeItem();
                }}
              >
                <X className="flex h-[20px] w-[20px] items-center justify-center rounded-[2px] bg-red-20" />
              </div>
            )}

            {props.item.status === MediaStatus.READY && (
              <div className="pl-[10px]">
                <Check className="flex h-[20px] w-[20px] items-center justify-center rounded-[2px] bg-white-30" />
              </div>
            )}
          </div>
        </div>
        {props.item.uploadProgress &&
          props.item.status === MediaStatus.UPLOAD_IN_PROGRESS && (
            <div className="mt-2">
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>{props.item.uploadProgress.percentage}%</span>
                <span>
                  {formatBytes(props.item.uploadProgress.uploaded)} /{" "}
                  {formatBytes(props.item.uploadProgress.total)}
                </span>
              </div>
              <div className="w-full bg-muted-foreground/20 rounded-full h-1.5 mb-2">
                <div
                  className="bg-accent h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${props.item.uploadProgress.percentage}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>
                  {formatUploadSpeed(props.item.uploadProgress.speed)}
                </span>
                <span>
                  {formatRemainingTime(props.item.uploadProgress.remainingTime)}
                </span>
              </div>
            </div>
          )}
        {props.item.status !== MediaStatus.UPLOAD_IN_PROGRESS &&
          props.item.status !== MediaStatus.ERROR &&
          props.item.status !== MediaStatus.READY && (
            <div className="mt-2">
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>{getProcessingPercentage(props.item.status)}%</span>
              </div>
              <div className="w-full bg-muted-foreground/20 rounded-full h-1.5">
                <div
                  className="bg-accent h-1.5 rounded-full transition-all duration-300"
                  style={{
                    width: `${getProcessingPercentage(props.item.status)}%`,
                  }}
                />
              </div>
            </div>
          )}
        {props.item.errorMessage && (
          <div className="text-red-400 text-xs mt-1 ">
            {getErrorMessage(props.item.errorMessage)}
          </div>
        )}
      </div>
    </div>
  );
}
