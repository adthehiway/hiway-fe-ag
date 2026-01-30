"use client";

import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { IMediaUploadTokenResponse } from "@/types";

interface DirectUploadTokenModalProps {
  isOpen: boolean;
  onClose: () => void;
  credentials: IMediaUploadTokenResponse | null;
}

export default function DirectUploadTokenModal({
  isOpen,
  onClose,
  credentials,
}: DirectUploadTokenModalProps) {
  const handleDownloadJson = () => {
    if (!credentials) return;
    const blob = new Blob([JSON.stringify(credentials, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `hiway-upload-credentials.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (!credentials) return null;

  return (
    <Modal
      title="S3 Upload Credentials"
      description="Download your credentials to upload videos directly to the storage bucket."
      isOpen={isOpen}
      onClose={onClose}
      className="w-[min(90vw,720px)]"
    >
      <div className="rounded-lg border border-border bg-muted px-4 py-4">
        <div className="flex flex-col gap-4">
          <div>
            <p className="text-sm font-semibold text-white mb-2">
              Credentials Expiration
            </p>
            <p className="text-sm text-muted-foreground">
              These credentials expire on{" "}
              <span className="text-white font-medium">
                {new Date(credentials.credentials.expiration).toLocaleString()}
              </span>
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <p className="text-xs text-warning">
              These credentials can only be downloaded once. Make sure to save
              them securely before closing this window.
            </p>
            <Button onClick={handleDownloadJson} className="w-full">
              Download Credentials
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
