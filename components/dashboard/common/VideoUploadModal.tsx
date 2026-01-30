import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import InputEnhanced from "@/components/ui/input-enhanced";
import { Modal } from "@/components/ui/modal";
import { contentTypeOptions } from "@/config/media";
import { MediaFile, useMediaManager } from "@/contexts/media-manager";
import {
  formatBytes,
  slugifyFilename,
} from "@/lib/utils";
import { ContentType } from "@/types";
import { FileVideo, Upload, X } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";

interface VideoUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  parentFiles?: File[];
}

const VideoUploadModal: React.FC<VideoUploadModalProps> = ({
  isOpen,
  onClose,
  parentFiles,
}) => {
  const [step, setStep] = useState<number>(1);
  const [files, setFiles] = useState<File[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [contentType, setContentType] = useState<ContentType | undefined>(
    undefined
  );
  const [confirmations, setConfirmations] = useState({
    ownsRights: false,
    notPirated: false,
    noExplicitContent: false,
    compliesWithLaws: false,
    understandsConsequences: false,
  });

  const onDrop = (acceptedFiles: File[]) => {
    setFiles((prev) => [...acceptedFiles]);
  };

  useEffect(() => {
    if (parentFiles) {
      setFiles((prev) => [...prev, ...parentFiles]);
    }
  }, [parentFiles]);

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleNext = () => setStep((s) => s + 1);
  const handleBack = () => setStep((s) => s - 1);

  const handleConfirmationChange = (key: keyof typeof confirmations) => {
    setConfirmations((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const allConfirmationsChecked = Object.values(confirmations).every(Boolean);

  const { upload } = useMediaManager();

  const resetForm = () => {
    setFiles([]);
    setName("");
    setDescription("");
    setContentType(undefined);
    setStep(1);
    setConfirmations({
      ownsRights: false,
      notPirated: false,
      noExplicitContent: false,
      compliesWithLaws: false,
      understandsConsequences: false,
    });
  };

  const handleUpload = async () => {
    const mappedItems: MediaFile[] = [];
    for (const file of files) {
      mappedItems.push({
        video: {
          path: slugifyFilename(file.name),
          mime_type: file.type,
          size: file.size,
          data: file,
        },
        title: name,
        description,
        contentType,
      });
    }
    upload(mappedItems);
    resetForm();
    onClose();
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "video/*": [] },
    multiple: false,
  });

  return (
    <Modal
      title={
        step === 1
          ? "Upload Content to Library"
          : step === 2
          ? "Add Content Details"
          : "Content Confirmation"
      }
      description={
        step === 1
          ? "Upload your video content to the secure library"
          : step === 2
          ? "Provide information about your uploaded content"
          : "Please confirm that your content meets our guidelines"
      }
      isOpen={isOpen}
      onClose={() => {
        resetForm();
        onClose();
      }}
    >
      {step === 1 && (
        <>
          <div
            {...getRootProps()}
            className={`border-2 border-dashed hover:border-accent transition-all duration-300 rounded-lg p-8 text-center cursor-pointer mb-4  ${
              isDragActive ? "border-accent bg-accent/5" : " bg-muted"
            }`}
          >
            <input {...getInputProps()} />
            <div className="flex flex-col items-center">
              <Upload size={48} className="text-accent mb-4" />
              <p className="mb-1 text-muted-foreground">
                Drag and drop your video files here
              </p>
              <p className="text-muted-foreground text-sm">
                or click to browse
              </p>

              <Button className="mt-4">Choose Files</Button>
            </div>
          </div>
          {files.length > 0 && (
            <div className="mb-4">
              <div className="text-muted-foreground mb-2">Selected Files:</div>
              <ul className="flex flex-col gap-1 max-h-[200px] overflow-y-auto scrollbar-custom pr-2 rounded">
                {files.map((fileObj, idx) => (
                  <li
                    key={idx}
                    className="flex items-center justify-between gap-2 bg-muted rounded px-2 py-2 "
                  >
                    <div className="flex items-center gap-2">
                      <FileVideo size={24} className="text-accent" />
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
          <Button
            onClick={handleNext}
            disabled={files.length === 0}
            className="w-full"
          >
            Upload {files.length} files
          </Button>
        </>
      )}
      {step === 2 && (
        <>
          <div className="mb-3">
            <InputEnhanced
              placeholder="Enter name"
              label="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="mb-3">
            <InputEnhanced
              placeholder="Enter description"
              label="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              textarea
            />
          </div>
          <div className="mb-4">
            <InputEnhanced
              placeholder="Content Type"
              label="Content Type"
              value={contentType}
              onSelectChange={(value) => setContentType(value as ContentType)}
              required
              select
              options={contentTypeOptions}
            />
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" className="flex-1" onClick={handleBack}>
              Back
            </Button>
            <Button
              // disabled={!name || !description || !contentType}
              onClick={handleNext}
              className="flex-1"
            >
              Next
            </Button>
          </div>
        </>
      )}
      {step === 3 && (
        <>
          <div className="mb-6">
            <p className="text-sm text-muted-foreground mb-4">
              By uploading this content, I confirm that:
            </p>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Checkbox
                  id="ownsRights"
                  checked={confirmations.ownsRights}
                  onCheckedChange={() => handleConfirmationChange("ownsRights")}
                  className="mt-1"
                />
                <label
                  htmlFor="ownsRights"
                  className="text-sm text-white cursor-pointer"
                >
                  I own the rights to this content or have permission to
                  distribute it
                </label>
              </div>

              <div className="flex items-start gap-3">
                <Checkbox
                  id="notPirated"
                  checked={confirmations.notPirated}
                  onCheckedChange={() => handleConfirmationChange("notPirated")}
                  className="mt-1"
                />
                <label
                  htmlFor="notPirated"
                  className="text-sm text-white cursor-pointer"
                >
                  This content is not pirated, stolen, or infringing on any
                  copyrights
                </label>
              </div>

              <div className="flex items-start gap-3">
                <Checkbox
                  id="noExplicitContent"
                  checked={confirmations.noExplicitContent}
                  onCheckedChange={() =>
                    handleConfirmationChange("noExplicitContent")
                  }
                  className="mt-1"
                />
                <label
                  htmlFor="noExplicitContent"
                  className="text-sm text-white cursor-pointer"
                >
                  This content does not contain explicit, harmful, or illegal
                  material
                </label>
              </div>

              <div className="flex items-start gap-3">
                <Checkbox
                  id="compliesWithLaws"
                  checked={confirmations.compliesWithLaws}
                  onCheckedChange={() =>
                    handleConfirmationChange("compliesWithLaws")
                  }
                  className="mt-1"
                />
                <label
                  htmlFor="compliesWithLaws"
                  className="text-sm text-white cursor-pointer"
                >
                  This content complies with all applicable laws and platform
                  guidelines
                </label>
              </div>

              <div className="flex items-start gap-3">
                <Checkbox
                  id="understandsConsequences"
                  checked={confirmations.understandsConsequences}
                  onCheckedChange={() =>
                    handleConfirmationChange("understandsConsequences")
                  }
                  className="mt-1"
                />
                <label
                  htmlFor="understandsConsequences"
                  className="text-sm text-white cursor-pointer"
                >
                  I understand that false declarations may result in account
                  suspension
                </label>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="secondary" className="flex-1" onClick={handleBack}>
              Back
            </Button>
            <Button
              disabled={!allConfirmationsChecked}
              onClick={handleUpload}
              className="flex-1"
            >
              Confirm & Upload
            </Button>
          </div>
        </>
      )}
    </Modal>
  );
};

export default VideoUploadModal;
