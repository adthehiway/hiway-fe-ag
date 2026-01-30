"use client";

import { Button } from "@/components/ui/button";
import DragAndDropUploader from "@/components/ui/drag-and-drop-uploader";
import { Modal } from "@/components/ui/modal";
import { useState } from "react";
import { FileVideo, X, File } from "lucide-react";
import { formatBytes } from "@/lib/utils";

interface Props {
  title?: string;
  isOpen: boolean;
  multiple?: boolean;
  accept?: string[];
  description?: string;
  handleClose: () => void;
  filesSelected: (files: File[]) => void;
  maxFileSize?: number;
}

export function UploadMediaWidget(props: Props) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const handlePaste = (e: any) => {
    if (e) {
      const items = e.clipboardData?.items;
      if (items) {
        const files = Array.from(items).map((item: any) => item.getAsFile());
        const videoFiles = files.filter(
          (file) => file && file.type && file.type.startsWith("video/")
        );
        setSelectedFiles(videoFiles as File[]);
      }
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith("image/")) {
      return (
        <img
          src={URL.createObjectURL(file)}
          alt={file.name}
          className="w-6 h-6 object-cover rounded"
        />
      );
    } else if (file.type.startsWith("video/")) {
      return <FileVideo size={24} className="text-accent" />;
    } else {
      return <File size={24} className="text-muted-foreground" />;
    }
  };

  return (
    <Modal isOpen={props.isOpen} onClose={props.handleClose}>
      <div>
        <DragAndDropUploader
          label={props.title}
          description={props.description || "Upload a media file"}
          value={selectedFiles}
          multiple
          onDropMultiple={(files) => {
            setSelectedFiles(files);
          }}
          maxFileSize={props.maxFileSize}
          allowedFormats={props.accept}
        />
      </div>

      {selectedFiles.length > 0 && (
        <div className="mb-4">
          <div className="text-muted-foreground mb-2">Selected Files:</div>
          <ul className="flex flex-col gap-1 max-h-[200px] overflow-y-auto scrollbar-custom pr-2 rounded">
            {selectedFiles.map((fileObj, idx) => (
              <li
                key={idx}
                className="flex items-center justify-between gap-2 bg-muted rounded px-2 py-2"
              >
                <div className="flex items-center gap-2">
                  {getFileIcon(fileObj)}
                  <span className="truncate text-muted-foreground text-sm line-clamp-1 text-ellipsis overflow-hidden max-w-[100px]">
                    {fileObj.name}
                  </span>
                  <span className="whitespace-nowrap text-muted-foreground text-xs">
                    ({formatBytes(fileObj.size, 2)})
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="iconSm"
                  onClick={() => removeFile(idx)}
                >
                  <X size={16} />
                </Button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="w-full">
        <Button
          className="w-full"
          disabled={selectedFiles.length == 0}
          onClick={() => {
            props.filesSelected(selectedFiles);
            props.handleClose();
            setSelectedFiles([]);
          }}
        >
          Continue
        </Button>
      </div>
    </Modal>
  );
}
