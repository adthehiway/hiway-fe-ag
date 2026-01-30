import { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import InputEnhanced from "@/components/ui/input-enhanced";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { languages } from "countries-list";
import { Loader2 } from "lucide-react";

interface SubtitleUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (data: {
    file: File;
    language: string;
    label: string;
    isDefault: boolean;
  }) => void;
  file: File | null;
  isUploading?: boolean;
}

export default function SubtitleUploadModal({
  isOpen,
  onClose,
  onUpload,
  file,
  isUploading = false,
}: SubtitleUploadModalProps) {
  const [language, setLanguage] = useState("");
  const [label, setLabel] = useState("");
  const [isDefault, setIsDefault] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Sort languages with priority languages first, then alphabetically
  const sortedLanguages = useMemo(() => {
    const priorityLanguages = ["en", "es", "fr"];

    return Object.entries(languages).sort((a, b) => {
      const codeA = a[0];
      const codeB = b[0];
      const nameA = a[1].name;
      const nameB = b[1].name;

      // Check if either is a priority language
      const isPriorityA = priorityLanguages.indexOf(codeA);
      const isPriorityB = priorityLanguages.indexOf(codeB);

      // Both are priority - sort by priority order
      if (isPriorityA !== -1 && isPriorityB !== -1) {
        return isPriorityA - isPriorityB;
      }

      // Only A is priority
      if (isPriorityA !== -1) return -1;

      // Only B is priority
      if (isPriorityB !== -1) return 1;

      // Neither are priority - sort alphabetically
      return nameA.localeCompare(nameB);
    });
  }, []);

  const handleSubmit = () => {
    const newErrors: { [key: string]: string } = {};

    if (!language) {
      newErrors.language = "Language is required";
    }
    if (!label) {
      newErrors.label = "Label is required";
    }
    if (!file) {
      newErrors.file = "File is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onUpload({
      file: file!,
      language,
      label,
      isDefault,
    });

    // Reset form
    setLanguage("");
    setLabel("");
    setIsDefault(false);
    setErrors({});
  };

  const handleLanguageChange = (value: string) => {
    setLanguage(value);
    // Auto-fill label if empty
    const selectedLanguage = languages[value as keyof typeof languages];
    if (selectedLanguage && !label) {
      setLabel(selectedLanguage.name);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Upload Subtitle</DialogTitle>
          <DialogDescription>
            Add subtitle details before uploading to the media library
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* File Info */}
          {file && (
            <div className="rounded-lg border border-border bg-secondary/30 p-3">
              <p className="text-sm font-medium text-white mb-1">File:</p>
              <p className="text-sm text-muted-foreground">{file.name}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {(file.size / 1024).toFixed(0)} KB
              </p>
            </div>
          )}

          {/* Language Select */}
          <div className="space-y-2">
            <Label htmlFor="language">
              Language <span className="text-destructive">*</span>
            </Label>
            <Select
              value={language}
              onValueChange={handleLanguageChange}
              disabled={isUploading}
            >
              <SelectTrigger id="language">
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                {sortedLanguages.map(([code, lang]) => (
                  <SelectItem key={code} value={code}>
                    {lang.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.language && (
              <p className="text-xs text-destructive">{errors.language}</p>
            )}
          </div>

          {/* Label Input */}
          <div className="space-y-2">
            <Label htmlFor="label">
              Label <span className="text-destructive">*</span>
            </Label>
            <InputEnhanced
              id="label"
              placeholder="e.g., English (SDH), Spanish (Latin America)"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              error={errors.label}
              disabled={isUploading}
            />
            <p className="text-xs text-muted-foreground">
              Display name for the subtitle track
            </p>
          </div>

          {/* Default Switch */}
          <div className="flex items-center justify-between space-x-2">
            <div className="space-y-0.5">
              <Label htmlFor="default-subtitle">Set as default subtitle</Label>
              <p className="text-xs text-muted-foreground">
                This subtitle will be selected by default
              </p>
            </div>
            <Switch
              id="default-subtitle"
              checked={isDefault}
              onCheckedChange={setIsDefault}
              disabled={isUploading}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isUploading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isUploading}>
            {isUploading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              "Upload Subtitle"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
