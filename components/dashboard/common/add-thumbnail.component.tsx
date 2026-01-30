"use client";

import { useEffect, useState } from "react";

import { IMedia } from "@/types";
import { Icon } from "@/components/ui/icons";
import { useDla } from "@/contexts/dla";
import { useUpload } from "@/contexts/upload";
import { Button } from "@/components/ui/button";
import { Loader } from "@/components/ui/loader";
import { Plus, X } from "lucide-react";
import { UploadMediaWidget } from "./upload-media.widget";
interface Props {
  media: IMedia;
  title: string;
  buttonText: string;
  uploadModalTitle: string;
  selectedSrc?: string;
  onChange: (src: string) => void;
}

interface IThumbnails {
  src: string;
  default: boolean;
  name: string;
}

export function AddThumbnailItem(props: { onClick: () => void }) {
  const [isHovered, setIsHovered] = useState(false);
  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => setIsHovered(false);

  return (
    <div
      className={`group w-[266px] h-[157px]  bg-[url('/images/dragdrop-bg.svg')] bg-cover rounded-[8px] cursor-pointer`}
      onClick={() => props.onClick()}
    >
      <div
        className={`w-full h-full rounded-[8px] p-2 flex items-center justify-center group-hover:bg-accent group-hover:bg-opacity-15 transition-all duration-30
  ${isHovered ? "bg-accent/15" : "bg-gray-900/15"}`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <Plus size={32} />
      </div>
    </div>
  );
}

export function AddThumbnail(props: Props) {
  const upload = useUpload();
  const { MediaService } = useDla();
  const [showUploadMediaWidget, setShowUploadMediaWidget] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [thumbnails, setThumbnails] = useState<IThumbnails[]>([]);
  const [selectedSrc, setSelectedSrc] = useState(props.selectedSrc);
  const [fetchInProgress, setFetchInProgress] = useState(true);
  const [saveInProgress, setSaveInProgress] = useState(false);

  function handleAssetResponse(assetMetadata: any): void {
    const entries = Object.entries(assetMetadata);
    const thumbnails: IThumbnails[] = [];
    const defaultThumbnail: any = assetMetadata.default
      ? assetMetadata.default["/"]
      : undefined;

    if (assetMetadata) {
      entries.forEach(([key, value]: any) => {
        if (key !== "default") {
          thumbnails.push({
            src: `/q/${props.media.cfMasterObjectId}/meta/public/asset_metadata/thumbnails/${key}`,
            default: defaultThumbnail === value["/"],
            name: "",
          });
        }
      });
    }

    setThumbnails(thumbnails.reverse());
  }

  async function uploadThumbnails(files: File[]) {
    setSaveInProgress(true);

    const startIndex = thumbnails.length ? thumbnails.length + 1 : 1;
    const mappedFiles = files.map((file: File, index: number) => {
      const ext = file.name.split(".").pop();
      const number = startIndex + index;
      const mapped = {
        name: `thumbnail_${number}.${ext}`,
        path: `thumbnails/thumbnail_${number}.${ext}`,
        mime_type: file.type,
        size: file.size,
        data: file,
      };

      return mapped;
    });

    const assetMetadata = await upload.save({
      data: { mediaId: props.media.id },
      asset: "thumbnails",
      files: mappedFiles,
    });

    handleAssetResponse(assetMetadata.assets);
    setSaveInProgress(false);
  }

  useEffect(() => {
    if (showUploadModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  }, [showUploadModal]);

  useEffect(() => {
    MediaService.getAllThumbnails(props.media.id).then((assetMetadata: any) => {
      handleAssetResponse(assetMetadata);
      setFetchInProgress(false);
    });
  }, []);

  return (
    <div className="relative w-full flex flex-row gap-4">
      {!selectedSrc && (
        <div className="w-[266px] h-[157px]">
          <AddThumbnailItem onClick={() => setShowUploadModal(true)} />
        </div>
      )}

      {selectedSrc && (
        <div className="flex items-center w-full">
          <div
            className={`group w-[266px] h-[157px] rounded-[8px] flex justify-center items-center overflow-hidden border border-accent`}
          >
            <img
              src={`${process.env.NEXT_PUBLIC_CONTENT_FABRIC_BASE_URL_STATICS}${selectedSrc}?width=270`}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="h-full flex justify-center items-center pl-[25px]">
            <Button
              variant="secondary"
              onClick={() => setShowUploadModal(true)}
            >
              Change
            </Button>
          </div>
        </div>
      )}

      {showUploadModal && (
        <div
          className="fixed top-0 left-0 w-full h-full z-40 bg-black/50 flex justify-end"
          onClick={() => setSaveInProgress(false)}
        >
          <div className="relative w-[940px] h-full bg-card flex flex-col pl-[48px] pt-[48px]">
            {saveInProgress && (
              <div className="absolute w-full h-full top-0 left-0 right-0 z-50">
                <Loader backdrop={true} />
              </div>
            )}

            {fetchInProgress && (
              <div className="w-full h-full pr-[48px] pb-[48px] flex justify-center items-center">
                <Loader backdrop={false} />
              </div>
            )}

            {!fetchInProgress && (
              <>
                <div className="w-full flex items-center pb-[40px]">
                  <div className="bg-accent w-[32px] h-[32px] flex justify-center items-center rounded-[50%]">
                    <Plus className="w-4 h-4" />
                  </div>
                  <div className="pl-[15px] text-white-100 text-[16px] uppercase tracking-[0.4px] font-medium">
                    {props.title}
                  </div>
                  <div
                    className="flex-1 flex items-center justify-end mr-[48px] cursor-pointer group"
                    onClick={() => setShowUploadModal(false)}
                  >
                    <X className="w-4 h-4" />
                  </div>
                </div>
                <div className="w-full flex-1 align-middle overflow-x-auto pr-[48px]">
                  <div className="w-full grid grid-cols-3 gap-4">
                    <AddThumbnailItem
                      onClick={() => setShowUploadMediaWidget(true)}
                    />
                    {thumbnails.map((item: IThumbnails, index) => (
                      <div
                        key={index}
                        className={`
                      relative group w-[266px] h-[157px] rounded-[8px] flex justify-center items-center overflow-hidden border-2 border-transparent cursor-pointer
                      ${item.default && "border-yellow-900"}
                      ${!item.default && "hover:border-accent"}
                    `}
                        onClick={() => {
                          if (!item.default) {
                            props.onChange(item.src);
                            setSelectedSrc(item.src);
                            setShowUploadModal(false);
                          }
                        }}
                      >
                        <img
                          src={`${process.env.NEXT_PUBLIC_CONTENT_FABRIC_BASE_URL_STATICS}${item.src}?width=270`}
                          className="w-full h-full object-cover relative z-10"
                        />
                        {item.default && (
                          <div className="absolute z-20 top-[15px] right-[15px] uppercase bg-accent/90 h-[25px] text-[11px] flex items-center px-[15px] rounded-[5px] font-medium">
                            default
                          </div>
                        )}
                        {!item.default && (
                          <div className="absolute hidden group-hover:flex z-20 bottom-[15px] left-[50%] -translate-x-1/2 uppercase bg-accent/90 h-[25px] text-[11px] items-center px-[15px] rounded-[5px] font-medium whitespace-nowrap">
                            {props.buttonText}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="w-full h-[48px]"></div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <UploadMediaWidget
        title={props.uploadModalTitle}
        description={"Upload a media file (1920x1080px)"}
        isOpen={showUploadMediaWidget}
        handleClose={() => setShowUploadMediaWidget(false)}
        accept={["jpg", "jpeg", "png"]}
        filesSelected={(files: File[]) => uploadThumbnails(files)}
        multiple
        maxFileSize={5}
      ></UploadMediaWidget>
    </div>
  );
}
