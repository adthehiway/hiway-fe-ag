import React, { useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useEffectiveRole } from "@/hooks/useUserRole";
import { useUser } from "@/hooks/useUser";
import { canWriteMedia } from "@/lib/permissions";

interface UploadVideoProps extends React.HTMLAttributes<HTMLDivElement> {
  setParentFiles: (files: File[]) => void;
  title?: string;
  description?: string;
  additionalInfo?: string;
  disabled?: boolean;
}

const UploadVideo = ({
  setParentFiles,
  title = "Upload Media",
  description = "Drag and drop your video files here or click to browse",
  additionalInfo,
  disabled = false,
  ...props
}: UploadVideoProps) => {
  const onDrop = (acceptedFiles: File[]) => {
    setParentFiles(acceptedFiles);
  };
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "video/*": [] },
    multiple: true,
  });
  const effectiveRole = useEffectiveRole();
  const { data: user } = useUser();
  const iscanWriteMedia = canWriteMedia(effectiveRole, user);

  return (
    <Card {...props}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div
          {...getRootProps()}
          className={`border-2 border-dashed transition-all duration-300 rounded-lg p-4 text-center bg-muted/50 ${
            isDragActive ? "border-accent " : "border-muted/50 "
          } ${
            disabled || !iscanWriteMedia
              ? "cursor-not-allowed"
              : "hover:border-accent cursor-pointer"
          }`}
        >
          <input {...getInputProps()} disabled={disabled || !iscanWriteMedia} />
          <div className="flex flex-col items-center">
            <Upload size={32} className="text-accent mb-2" />
            <p className="mb-1 text-sm">Drag and drop your video files here</p>
            <p className="text-muted-foreground text-xs">or click to browse</p>
            <Button
              variant={"secondary"}
              className="mt-3"
              size="sm"
              disabled={disabled || !iscanWriteMedia}
            >
              Choose Files
            </Button>
          </div>
        </div>
        {additionalInfo && (
          <p className="text-sm text-muted-foreground text-center mt-4">
            {additionalInfo}
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default UploadVideo;
