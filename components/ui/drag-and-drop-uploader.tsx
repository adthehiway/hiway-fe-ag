import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, Loader2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Button } from "./button";

interface DragAndDropUploaderProps {
  label?: string;
  description?: string;
  value?: File | File[] | string | null;
  onDrop?: (file: File) => void;
  onDropMultiple?: (files: File[]) => void;
  height?: string;
  allowedFormats?: string[];
  multiple?: boolean;
  minWidth?: number;
  minHeight?: number;
  maxFileSize?: number;
  descriptionInside?: boolean;
  showButton?: boolean;
  isUploading?: boolean;
}

export default function DragAndDropUploader({
  label,
  description,
  value,
  onDrop,
  onDropMultiple,
  height = "h-40",
  allowedFormats = ["png", "jpg", "jpeg"],
  multiple = false,
  minWidth,
  minHeight,
  maxFileSize,
  descriptionInside = false,
  showButton = true,
  isUploading = false,
}: DragAndDropUploaderProps) {
  const [validationError, setValidationError] = useState<string | null>(null);

  const validateImageDimensions = useCallback(
    (file: File): Promise<boolean> => {
      return new Promise((resolve) => {
        if (!minWidth && !minHeight) {
          resolve(true);
          return;
        }

        const img = new Image();
        const url = URL.createObjectURL(file);

        img.onload = () => {
          URL.revokeObjectURL(url);
          const isValid =
            (!minWidth || img.width >= minWidth) &&
            (!minHeight || img.height >= minHeight);
          resolve(isValid);
        };

        img.onerror = () => {
          URL.revokeObjectURL(url);
          resolve(false);
        };

        img.src = url;
      });
    },
    [minWidth, minHeight]
  );

  const handleDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles && acceptedFiles[0]) {
        setValidationError(null);

        // Validate file format if constraint is set
        if (allowedFormats) {
          const fileFormat = acceptedFiles[0].name
            .split(".")
            .pop()
            ?.toLowerCase();
          if (
            !fileFormat ||
            !allowedFormats.map((f) => f.toLowerCase()).includes(fileFormat)
          ) {
            setValidationError(
              `File format must be ${allowedFormats.join(", ")}`
            );
            return;
          }
        }

        // Validate file size if constraint is set
        if (maxFileSize) {
          const fileSizeMB = acceptedFiles[0].size / (1024 * 1024);
          if (fileSizeMB > maxFileSize) {
            setValidationError(`File size must be less than ${maxFileSize}MB`);
            return;
          }
        }

        // Validate image dimensions if constraints are set
        if (minWidth || minHeight) {
          const isValid = await validateImageDimensions(acceptedFiles[0]);
          if (!isValid) {
            const errorMessage = `Image dimensions must be at least ${
              minWidth || 0
            }x${minHeight || 0} pixels`;
            setValidationError(errorMessage);
            return;
          }
        }

        if (multiple) {
          onDropMultiple?.(acceptedFiles);
        } else {
          onDrop?.(acceptedFiles[0]);
        }
      }
    },
    [
      onDrop,
      onDropMultiple,
      validateImageDimensions,
      minWidth,
      minHeight,
      maxFileSize,
    ]
  );
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: handleDrop,
    multiple,
    disabled: isUploading,
  });
  return (
    <div>
      {label && <Label className="mb-2 text-white text-sm">{label}</Label>}
      {description && !descriptionInside && (
        <p className="text-muted-foreground text-sm mb-2">{description}</p>
      )}
      <div
        {...getRootProps()}
        className={`border border-dashed rounded-lg flex flex-col items-center justify-center mb-2 transition-colors bg-secondary/30 px-2 py-6 ${
          isUploading
            ? "cursor-not-allowed opacity-50"
            : "cursor-pointer hover:border-accent"
        }`}
        style={{
          minHeight: height ? height : "auto",
        }}
      >
        <input {...getInputProps()} />
        {value && !Array.isArray(value) ? (
          <img
            src={
              typeof value === "string"
                ? value
                : URL.createObjectURL(value as File)
            }
            alt="Preview"
            className="h-full object-contain rounded-2xl "
          />
        ) : (
          <>
            <Upload className="text-muted-foreground mb-2" />
            <span className="text-muted-foreground">
              Upload or drag file here
            </span>
            {descriptionInside && (
              <p className="text-muted-foreground text-sm mb-2">
                {description}
              </p>
            )}
            {showButton && (
              <Button variant="secondary" disabled={isUploading}>
                {isUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  "Choose Files"
                )}
              </Button>
            )}
            <p className="text-muted-foreground text-sm mt-2">
              Supported formats: {allowedFormats.join(", ").toUpperCase()} (Max{" "}
              {maxFileSize}MB each)
            </p>
          </>
        )}
      </div>
      {validationError && (
        <p className="text-red-500 text-sm mt-1">{validationError}</p>
      )}
    </div>
  );
}
