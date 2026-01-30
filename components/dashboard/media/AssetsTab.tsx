"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUpload } from "@/contexts/upload";
import {
  useAddAsset,
  useAddSubtitle,
  useDeleteAsset,
  useMediaAssets,
  useUpdateAsset,
  useContentRelationships,
  useAddContentRelationship,
  useDeleteContentRelationship,
} from "@/hooks/useMedia";
import { useSmartLinks } from "@/hooks/useSmartLinks";
import { formatBytes, slugifyFilename, secondsToHHMMSS } from "@/lib/utils";
import {
  IMediaAsset,
  MediaAssetType,
  OtherAssetType,
  ContentRelationshipType,
  IMediaRelationship,
  IMedia,
  MediaStatus,
  ISmartLink,
  SmartLinkAccess,
} from "@/types";
import { saveAs } from "file-saver";
import {
  Download,
  Edit,
  Eye,
  FileText,
  Music,
  Trash2,
  Loader2,
  Upload,
  X,
  Link2,
  Plus,
  Search,
  Film,
  Clock,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "react-toastify";
import SubtitleUploadModal from "./SubtitleUploadModal";
import { Input } from "@/components/ui/input";
import DragAndDropUploader from "@/components/ui/drag-and-drop-uploader";

interface AssetsTabProps {
  mediaId: string;
}

// Asset type options for posters
const POSTER_ASSET_TYPES = [
  "Main Poster",
  "Landscape Banner",
  "DVD Cover",
  "Blu-ray Cover",
  "Digital Cover",
  "Promotional Art",
  "Background Art",
  "Character Poster",
  "Logo",
];

// Map asset type labels to API format
const mapAssetTypeToAPI = (label: string): string => {
  const mapping: { [key: string]: string } = {
    "Main Poster": "MAIN_POSTER",
    "Landscape Banner": "LANDSCAPE_BANNER",
    "DVD Cover": "DVD_COVER",
    "Blu-ray Cover": "BLU_RAY_COVER",
    "Digital Cover": "DIGITAL_COVER",
    "Promotional Art": "PROMOTIONAL_ART",
    "Background Art": "BACKGROUND_ART",
    "Character Poster": "CHARACTER_POSTER",
    Logo: "LOGO",
  };
  return mapping[label] || "MAIN_POSTER";
};

// Map API asset type back to display label
const mapAPITypeToLabel = (apiType: string): string => {
  const mapping: { [key: string]: string } = {
    MAIN_POSTER: "Main Poster",
    LANDSCAPE_BANNER: "Landscape Banner",
    DVD_COVER: "DVD Cover",
    BLU_RAY_COVER: "Blu-ray Cover",
    DIGITAL_COVER: "Digital Cover",
    PROMOTIONAL_ART: "Promotional Art",
    BACKGROUND_ART: "Background Art",
    CHARACTER_POSTER: "Character Poster",
    LOGO: "Logo",
  };
  return mapping[apiType] || "Main Poster";
};

// Check if an asset type is a poster type (excludes OTHER type)
const isPosterType = (type: string): boolean => {
  const posterTypes = [
    "MAIN_POSTER",
    "LANDSCAPE_BANNER",
    "DVD_COVER",
    "BLU_RAY_COVER",
    "DIGITAL_COVER",
    "PROMOTIONAL_ART",
    "BACKGROUND_ART",
    "CHARACTER_POSTER",
    "LOGO",
  ];
  return posterTypes.includes(type);
};

// Other Asset Type options
const OTHER_ASSET_TYPES = [
  "Press Kit",
  "Behind the Scenes",
  "PDF",
  "EPK",
  "Stills",
  "Other",
];

// Map other asset type labels to API format
const mapOtherAssetTypeToAPI = (label: string): string => {
  const mapping: { [key: string]: string } = {
    "Press Kit": "PRESS_KIT",
    "Behind the Scenes": "BEHIND_THE_SCENES",
    PDF: "PDF",
    EPK: "EPK",
    Stills: "STILLS",
    Other: "OTHER",
  };
  return mapping[label] || "OTHER";
};

// Map API asset type back to display label
const mapAPIOtherAssetTypeToLabel = (apiType: string): string => {
  const mapping: { [key: string]: string } = {
    PRESS_KIT: "Press Kit",
    BEHIND_THE_SCENES: "Behind the Scenes",
    PDF: "PDF",
    EPK: "EPK",
    STILLS: "Stills",
    OTHER: "Other",
  };
  return mapping[apiType] || "Other";
};

// Content Search List Component
interface ContentSearchListProps {
  searchTerm: string;
  mediaId: string;
  existingRelationships: IMediaRelationship[];
  onAdd: (smartlink: ISmartLink) => void;
  contentType: "associated" | "related";
}

function ContentSearchList({
  searchTerm,
  mediaId,
  existingRelationships,
  onAdd,
  contentType,
  isFocused = false,
}: ContentSearchListProps & { isFocused?: boolean }) {
  // Trigger search when focused (even with empty string) or when searchTerm exists
  const shouldSearch = isFocused || !!searchTerm;

  // Search all SmartLink access types: PRIVATE, PUBLIC, PAYWALL, and SHARED
  const { smartLinks: privateSmartLinks, isLoading: isLoadingPrivate } =
    useSmartLinks({
      access: SmartLinkAccess.PRIVATE,
      search: shouldSearch ? searchTerm || "" : undefined,
      perPage: 100,
      enabled: shouldSearch,
    });

  const { smartLinks: publicSmartLinks, isLoading: isLoadingPublic } =
    useSmartLinks({
      access: SmartLinkAccess.PUBLIC,
      search: shouldSearch ? searchTerm || "" : undefined,
      perPage: 100,
      enabled: shouldSearch,
    });

  const { smartLinks: paywallSmartLinks, isLoading: isLoadingPaywall } =
    useSmartLinks({
      access: SmartLinkAccess.PAYWALL,
      search: shouldSearch ? searchTerm || "" : undefined,
      perPage: 100,
      enabled: shouldSearch,
    });

  const { smartLinks: sharedSmartLinks, isLoading: isLoadingShared } =
    useSmartLinks({
      access: SmartLinkAccess.SHARED,
      search: shouldSearch ? searchTerm || "" : undefined,
      perPage: 100,
      enabled: shouldSearch,
    });

  // Combine all results and deduplicate by ID
  const smartLinks = useMemo(() => {
    const allLinks = [
      ...privateSmartLinks,
      ...publicSmartLinks,
      ...paywallSmartLinks,
      ...sharedSmartLinks,
    ];
    const uniqueLinks = new Map<string, ISmartLink>();
    allLinks.forEach((link) => {
      if (!uniqueLinks.has(link.id)) {
        uniqueLinks.set(link.id, link);
      }
    });
    return Array.from(uniqueLinks.values());
  }, [
    privateSmartLinks,
    publicSmartLinks,
    paywallSmartLinks,
    sharedSmartLinks,
  ]);

  const isLoading =
    isLoadingPrivate || isLoadingPublic || isLoadingPaywall || isLoadingShared;

  // Filter out smartlinks that are already linked (by checking their SmartLink ID)
  const filteredResults = useMemo(() => {
    const existingSmartLinkIds = new Set(
      existingRelationships.map((rel) => rel.targetSmartLinkId)
    );

    return smartLinks.filter((smartlink) => {
      // Check if SmartLink is not already linked and not the same media
      return (
        smartlink.id &&
        !existingSmartLinkIds.has(smartlink.id) &&
        smartlink.mediaId !== mediaId // Prevent linking to own media
      );
    });
  }, [smartLinks, mediaId, existingRelationships]);

  const getContentTypeLabel = (smartlink: ISmartLink): string => {
    return smartlink.media?.metadata?.contentType || "Content";
  };

  if (!shouldSearch) {
    return (
      <div className="text-center py-8 text-muted-foreground text-sm">
        Click to search for SmartLinks...
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="text-center py-8 text-muted-foreground text-sm">
        Loading...
      </div>
    );
  }

  if (filteredResults.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground text-sm">
        No SmartLinks found
      </div>
    );
  }

  return (
    <div className="space-y-2 max-h-[400px] overflow-y-auto">
      {filteredResults.map((smartlink) => {
        const media = smartlink.media;
        return (
          <div
            key={smartlink.id}
            className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg border border-border hover:bg-secondary/50 transition-colors"
          >
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <Film className="w-5 h-5 text-muted-foreground flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">
                  {smartlink.name ||
                    media?.metadata?.title ||
                    media?.name ||
                    "Untitled SmartLink"}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="text-xs">
                    {getContentTypeLabel(smartlink)}
                  </Badge>
                  {media?.source?.duration && (
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {secondsToHHMMSS(media.source.duration)}
                    </span>
                  )}
                  {contentType === "related" &&
                    media?.metadata?.genre &&
                    media.metadata.genre.length > 0 && (
                      <>
                        <span className="text-xs text-muted-foreground">•</span>
                        <span className="text-xs text-muted-foreground">
                          {media.metadata.genre[0]}
                        </span>
                        {media.metadata.releaseDate && (
                          <>
                            <span className="text-xs text-muted-foreground">
                              •
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {new Date(
                                media.metadata.releaseDate
                              ).getFullYear()}
                            </span>
                          </>
                        )}
                      </>
                    )}
                </div>
              </div>
            </div>
            <Button
              variant="default"
              size="sm"
              className="ml-3 flex-shrink-0 bg-teal-500 hover:bg-teal-600"
              onClick={() => onAdd(smartlink)}
            >
              {contentType === "associated" ? "+ Add" : "+ Link"}
            </Button>
          </div>
        );
      })}
    </div>
  );
}

export default function AssetsTab({ mediaId }: AssetsTabProps) {
  const [isSubtitleModalOpen, setIsSubtitleModalOpen] = useState(false);
  const [pendingSubtitleFile, setPendingSubtitleFile] = useState<File | null>(
    null
  );
  const [isUploadingPoster, setIsUploadingPoster] = useState(false);
  const [isUploadingSubtitle, setIsUploadingSubtitle] = useState(false);
  const [isUploadingAudio, setIsUploadingAudio] = useState(false);
  const [isUploadingOtherAsset, setIsUploadingOtherAsset] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [assetToDelete, setAssetToDelete] = useState<IMediaAsset | null>(null);
  const [deletingAssetIds, setDeletingAssetIds] = useState<Set<string>>(
    new Set()
  );
  const [updatingAssetTypes, setUpdatingAssetTypes] = useState<Set<string>>(
    new Set()
  );
  const [selectedPosterType, setSelectedPosterType] =
    useState<string>("Main Poster");
  const [selectedOtherAssetType, setSelectedOtherAssetType] =
    useState<string>("Press Kit");
  const [associatedSearchTerm, setAssociatedSearchTerm] = useState("");
  const [relatedSearchTerm, setRelatedSearchTerm] = useState("");
  const [associatedSearchFocused, setAssociatedSearchFocused] = useState(false);
  const [relatedSearchFocused, setRelatedSearchFocused] = useState(false);
  const [showAssociatedTypeDialog, setShowAssociatedTypeDialog] =
    useState(false);
  const [pendingSmartLink, setPendingSmartLink] = useState<ISmartLink | null>(
    null
  );
  const [selectedAssociatedType, setSelectedAssociatedType] = useState<
    "PROMO" | "COMMERCIAL" | "TRAILER" | "BONUS_CLIP" | "BTS"
  >("TRAILER");

  const { uploadS3 } = useUpload();
  const addAssetMutation = useAddAsset();
  const updateAssetMutation = useUpdateAsset();
  const addSubtitleMutation = useAddSubtitle();
  const deleteAssetMutation = useDeleteAsset();
  const addContentRelationshipMutation = useAddContentRelationship();
  const deleteContentRelationshipMutation = useDeleteContentRelationship();
  const {
    assets: mediaAssets = [],
    storageUsage,
    isLoading: assetsLoading,
    refetch: refetchAssets,
  } = useMediaAssets(mediaId);

  // Fetch content relationships
  const {
    relationships: associatedContent,
    isLoading: associatedLoading,
    refetch: refetchAssociated,
  } = useContentRelationships(mediaId, ContentRelationshipType.ASSOCIATED);

  const {
    relationships: relatedContent,
    isLoading: relatedLoading,
    refetch: refetchRelated,
  } = useContentRelationships(mediaId, ContentRelationshipType.RELATED);

  // Filter assets by type using useMemo for performance
  const subtitleFiles = useMemo(
    () =>
      mediaAssets.filter(
        (asset) =>
          asset.type === MediaAssetType.SUBTITLE ||
          (typeof asset.type === "string" &&
            asset.type.toUpperCase().includes("SUBTITLE"))
      ),
    [mediaAssets]
  );

  const posterFiles = useMemo(
    () =>
      mediaAssets.filter((asset) => {
        // Exclude OTHER type assets (they're shown in Other Assets section)
        if (typeof asset.type === "string" && asset.type === "OTHER") {
          return false;
        }
        // Handle both enum type and API string type
        if (asset.type === MediaAssetType.POSTER) return true;
        if (typeof asset.type === "string") {
          return isPosterType(asset.type);
        }
        return false;
      }),
    [mediaAssets]
  );

  const audioFiles = useMemo(
    () =>
      mediaAssets.filter(
        (asset) =>
          asset.type === MediaAssetType.AUDIO ||
          (typeof asset.type === "string" &&
            asset.type.toUpperCase().includes("AUDIO"))
      ),
    [mediaAssets]
  );

  const otherAssets = useMemo(
    () =>
      mediaAssets.filter(
        (asset) =>
          asset.type === MediaAssetType.DOCUMENT ||
          asset.type === MediaAssetType.OTHER ||
          (typeof asset.type === "string" &&
            (asset.type.includes("PRESS_KIT") ||
              asset.type.includes("BEHIND_THE_SCENES") ||
              asset.type.includes("EPK") ||
              asset.type.includes("STILLS") ||
              asset.type.includes("PDF")))
      ),
    [mediaAssets]
  );

  const handlePosterDrop = (file: File) => {
    handlePosterUpload(file);
  };

  const handlePosterDropMultiple = (files: File[]) => {
    files.forEach((file) => handlePosterUpload(file));
  };

  const handlePosterUpload = async (file: File) => {
    // Validate file type
    const validTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/svg+xml",
      "image/webp",
    ];
    if (!validTypes.includes(file.type)) {
      toast.error(
        "Invalid file type. Please upload JPG, PNG, SVG, or WebP files."
      );
      return;
    }

    // Validate file size (10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      toast.error("File size exceeds 10MB limit.");
      return;
    }

    setIsUploadingPoster(true);
    try {
      const slugifiedFilename = slugifyFilename(file.name);
      const renamedFile = Object.defineProperty(file, "name", {
        writable: true,
        value: slugifiedFilename,
      });

      const s3Url = await uploadS3(renamedFile);
      if (!s3Url) {
        throw new Error("Failed to upload file to S3");
      }

      // Call API to add poster asset
      await addAssetMutation.mutateAsync({
        mediaId,
        data: {
          url: s3Url,
          filename: slugifiedFilename,
          filesize: file.size,
          assetType: mapAssetTypeToAPI(selectedPosterType),
        },
      });

      refetchAssets();
    } catch (error: any) {
      console.error("Poster upload error:", error);
      toast.error(error?.message || "Failed to upload poster");
    } finally {
      setIsUploadingPoster(false);
    }
  };

  const handleSubtitleUpload = (file: File) => {
    if (isUploadingSubtitle) return;
    setPendingSubtitleFile(file);
    setIsSubtitleModalOpen(true);
  };

  const handleSubtitleDrop = (file: File) => {
    handleSubtitleUpload(file);
  };

  const handleSubtitleModalUpload = async (data: {
    file: File;
    language: string;
    label: string;
    isDefault: boolean;
  }) => {
    setIsUploadingSubtitle(true);
    try {
      const slugifiedFilename = slugifyFilename(data.file.name);
      const renamedFile = Object.defineProperty(data.file, "name", {
        writable: true,
        value: slugifiedFilename,
      });

      const s3Url = await uploadS3(renamedFile);
      if (!s3Url) {
        throw new Error("Failed to upload file to S3");
      }

      await addSubtitleMutation.mutateAsync({
        mediaId,
        data: {
          url: s3Url,
          filename: slugifiedFilename,
          filesize: data.file.size,
          language: data.language,
          label: data.label,
          isDefault: data.isDefault,
        },
      });

      refetchAssets();
      setIsSubtitleModalOpen(false);
      setPendingSubtitleFile(null);
    } catch (error: any) {
      console.error("Subtitle upload error:", error);
      toast.error(error?.message || "Failed to upload subtitle");
    } finally {
      setIsUploadingSubtitle(false);
    }
  };

  const handleAudioDrop = (file: File) => {
    handleAudioUpload(file);
  };

  const handleAudioUpload = async (file: File) => {
    // Validate file type
    const validTypes = [
      "audio/mpeg",
      "audio/wav",
      "audio/aac",
      "audio/flac",
      "audio/mp3",
    ];
    if (!validTypes.includes(file.type)) {
      toast.error(
        "Invalid file type. Please upload MP3, WAV, AAC, or FLAC files."
      );
      return;
    }

    // Validate file size (500MB)
    const maxSize = 500 * 1024 * 1024; // 500MB
    if (file.size > maxSize) {
      toast.error("File size exceeds 500MB limit.");
      return;
    }

    setIsUploadingAudio(true);
    try {
      const slugifiedFilename = slugifyFilename(file.name);
      const renamedFile = Object.defineProperty(file, "name", {
        writable: true,
        value: slugifiedFilename,
      });

      const s3Url = await uploadS3(renamedFile);
      if (!s3Url) {
        throw new Error("Failed to upload file to S3");
      }

      // Use generic addAsset endpoint with AUDIO type
      await addAssetMutation.mutateAsync({
        mediaId,
        data: {
          url: s3Url,
          filename: slugifiedFilename,
          filesize: file.size,
          assetType: "AUDIO",
        },
      });

      toast.success("Audio file uploaded successfully");
      refetchAssets();
    } catch (error: any) {
      console.error("Audio upload error:", error);
      toast.error(error?.message || "Failed to upload audio file");
    } finally {
      setIsUploadingAudio(false);
    }
  };

  const handleDeleteClick = (asset: IMediaAsset) => {
    setAssetToDelete(asset);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!assetToDelete) return;

    const assetId = assetToDelete.id;
    setDeletingAssetIds((prev) => new Set(prev).add(assetId));
    setIsDeleteDialogOpen(false);
    setAssetToDelete(null);

    try {
      await deleteAssetMutation.mutateAsync({
        mediaId,
        assetId,
      });
    } finally {
      setDeletingAssetIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(assetId);
        return newSet;
      });
    }
  };

  const handleAssetTypeChange = async (asset: IMediaAsset, newType: string) => {
    setUpdatingAssetTypes((prev) => new Set(prev).add(asset.id));
    try {
      // Convert display label to API format
      const assetType = mapAssetTypeToAPI(newType);

      await updateAssetMutation.mutateAsync({
        mediaId,
        assetId: asset.id,
        data: { assetType },
      });

      refetchAssets();
    } catch (error: any) {
      console.error("Asset type update error:", error);
      toast.error(
        error?.response?.data?.message || "Failed to update asset type"
      );
    } finally {
      setUpdatingAssetTypes((prev) => {
        const newSet = new Set(prev);
        newSet.delete(asset.id);
        return newSet;
      });
    }
  };

  const downloadAsset = async (asset: IMediaAsset) => {
    const downloadPromise = async () => {
      const response = await fetch(asset.url);
      if (!response.ok) {
        throw new Error("Failed to fetch file");
      }
      const blob = await response.blob();
      saveAs(blob, asset.filename);
      return asset.filename;
    };

    toast.promise(downloadPromise(), {
      pending: `Downloading ${asset.filename}...`,
      success: `Downloaded ${asset.filename}`,
      error: "Failed to download file",
    });
  };

  const getLanguageCode = (language?: string): string => {
    if (!language) return "EN";
    return language.toUpperCase().slice(0, 2);
  };

  const getLanguageName = (language?: string): string => {
    if (!language) return "Unknown";
    // Map common language codes to names
    const langMap: { [key: string]: string } = {
      en: "English",
      es: "Spanish",
      fr: "French",
      de: "German",
      it: "Italian",
      pt: "Portuguese",
      ja: "Japanese",
      ko: "Korean",
      zh: "Chinese",
    };
    return langMap[language.toLowerCase()] || language;
  };

  // Other Assets handlers
  const handleOtherAssetDrop = (file: File) => {
    handleOtherAssetUpload(file);
  };

  const handleOtherAssetDropMultiple = (files: File[]) => {
    files.forEach((file) => handleOtherAssetUpload(file));
  };

  const handleOtherAssetUpload = async (file: File) => {
    // Validate file size (50MB for other assets)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      toast.error("File size exceeds 50MB limit.");
      return;
    }

    setIsUploadingOtherAsset(true);
    try {
      const slugifiedFilename = slugifyFilename(file.name);
      const renamedFile = Object.defineProperty(file, "name", {
        writable: true,
        value: slugifiedFilename,
      });

      const s3Url = await uploadS3(renamedFile);
      if (!s3Url) {
        throw new Error("Failed to upload file to S3");
      }

      await addAssetMutation.mutateAsync({
        mediaId,
        data: {
          url: s3Url,
          filename: slugifiedFilename,
          filesize: file.size,
          assetType: "OTHER",
        },
      });

      refetchAssets();
      toast.success("Asset uploaded successfully");
    } catch (error: any) {
      console.error("Other asset upload error:", error);
      toast.error(error?.message || "Failed to upload asset");
    } finally {
      setIsUploadingOtherAsset(false);
    }
  };

  // Associated Content handlers
  const handleAddAssociatedContent = (smartlink: ISmartLink) => {
    // Check if already associated
    const isAlreadyAssociated = associatedContent.some(
      (rel) => rel.targetSmartLinkId === smartlink.id
    );
    if (isAlreadyAssociated) {
      toast.info("This SmartLink is already associated");
      return;
    }

    // Show dialog to select associated type
    setPendingSmartLink(smartlink);
    setShowAssociatedTypeDialog(true);
  };

  const handleConfirmAssociatedType = async () => {
    if (!pendingSmartLink) return;

    try {
      await addContentRelationshipMutation.mutateAsync({
        mediaId,
        targetSmartLinkId: pendingSmartLink.id,
        relationshipType: ContentRelationshipType.ASSOCIATED,
        associatedType: selectedAssociatedType,
      });
      refetchAssociated();
      setShowAssociatedTypeDialog(false);
      setPendingSmartLink(null);
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleRemoveAssociatedContent = async (relationshipId: string) => {
    try {
      await deleteContentRelationshipMutation.mutateAsync({
        mediaId,
        relationshipId,
      });
      refetchAssociated();
    } catch (error) {
      // Error handled by mutation
    }
  };

  // Related Content handlers
  const handleAddRelatedContent = async (smartlink: ISmartLink) => {
    // Check if already related
    const isAlreadyRelated = relatedContent.some(
      (rel) => rel.targetSmartLinkId === smartlink.id
    );
    if (isAlreadyRelated) {
      toast.info("This SmartLink is already related");
      return;
    }

    try {
      await addContentRelationshipMutation.mutateAsync({
        mediaId,
        targetSmartLinkId: smartlink.id,
        relationshipType: ContentRelationshipType.RELATED,
      });
      refetchRelated();
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleRemoveRelatedContent = async (relationshipId: string) => {
    try {
      await deleteContentRelationshipMutation.mutateAsync({
        mediaId,
        relationshipId,
      });
      refetchRelated();
    } catch (error) {
      // Error handled by mutation
    }
  };

  return (
    <div className="space-y-6">
      {/* Posters & Artwork Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">
            Upload Posters & Artwork
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Upload Area */}
          <DragAndDropUploader
            description="Upload movie posters, promotional artwork, and other visual assets."
            onDrop={handlePosterDrop}
            onDropMultiple={handlePosterDropMultiple}
            allowedFormats={["jpg", "jpeg", "png", "svg", "webp"]}
            maxFileSize={10}
            multiple={true}
            height="h-40"
            descriptionInside={true}
            isUploading={isUploadingPoster}
          />

          {/* Uploaded Assets */}
          {posterFiles.length > 0 && (
            <div className="space-y-4">
              <h4 className="font-medium text-sm">Uploaded Assets</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {posterFiles.map((asset) => {
                  // Get the display label from API type or use label if available
                  const assetType =
                    typeof asset.type === "string" ? asset.type : "";
                  const displayLabel =
                    asset.label || mapAPITypeToLabel(assetType) || "Other";

                  return (
                    <div
                      key={asset.id}
                      className="bg-secondary/30 rounded-lg p-4 border border-border space-y-3"
                    >
                      {/* Image/Placeholder */}
                      <div className="relative w-full aspect-[4/3] bg-muted rounded-md overflow-hidden">
                        {asset.url ? (
                          <img
                            src={asset.url}
                            alt={displayLabel || asset.filename}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm font-medium">
                            {displayLabel || "Background Art"}
                          </div>
                        )}
                      </div>

                      {/* Filename */}
                      <p className="text-xs text-muted-foreground truncate">
                        {asset.filename}
                      </p>

                      {/* Asset Type Dropdown */}
                      <Select
                        value={displayLabel}
                        onValueChange={(value) =>
                          handleAssetTypeChange(asset, value)
                        }
                        disabled={updatingAssetTypes.has(asset.id)}
                      >
                        <SelectTrigger className="w-full h-9 text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {POSTER_ASSET_TYPES.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      {/* Remove Button */}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => handleDeleteClick(asset)}
                        disabled={deletingAssetIds.has(asset.id)}
                      >
                        {deletingAssetIds.has(asset.id) ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <X className="w-4 h-4 mr-2" />
                            Remove
                          </>
                        )}
                      </Button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Subtitle Files Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">
            Subtitle Files
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Upload Area */}
          <DragAndDropUploader
            description="Add subtitle files in different languages."
            onDrop={handleSubtitleDrop}
            allowedFormats={["srt", "vtt", "ass", "ssa"]}
            maxFileSize={5}
            height="h-40"
            descriptionInside={true}
            isUploading={isUploadingSubtitle}
          />

          {/* Uploaded Subtitle Files */}
          {subtitleFiles.length > 0 && (
            <div className="space-y-3">
              {subtitleFiles.map((asset) => {
                const isDeleting = deletingAssetIds.has(asset.id);
                const langCode = getLanguageCode(asset.language);
                const langName = getLanguageName(asset.language);

                return (
                  <div
                    key={asset.id}
                    className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg border border-border"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded flex items-center justify-center text-white font-semibold text-sm ${
                          langCode === "EN" ? "bg-teal-500" : "bg-gray-500"
                        }`}
                      >
                        {langCode}
                      </div>
                      <div>
                        <p className="font-medium text-sm">
                          {asset.label || `${langName} Subtitles`}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {asset.filename} •{" "}
                          {asset.filesize
                            ? formatBytes(asset.filesize)
                            : "Unknown"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2"
                        onClick={() => downloadAsset(asset)}
                        disabled={isDeleting}
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2"
                        onClick={() => {
                          // TODO: Implement edit functionality
                          toast.info("Edit functionality coming soon");
                        }}
                        disabled={isDeleting}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Audio Files Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Audio Files</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Upload Area */}
          <DragAndDropUploader
            description="Additional audio tracks, commentary, or alternate audio versions."
            onDrop={handleAudioDrop}
            allowedFormats={["mp3", "wav", "aac", "flac", "mpeg"]}
            maxFileSize={500}
            height="h-40"
            descriptionInside={true}
            isUploading={isUploadingAudio}
          />

          {/* Uploaded Audio Files */}
          {audioFiles.length > 0 && (
            <div className="space-y-3">
              {audioFiles.map((asset) => {
                const isDeleting = deletingAssetIds.has(asset.id);
                const langCode = getLanguageCode(asset.language);
                const langName = getLanguageName(asset.language);

                return (
                  <div
                    key={asset.id}
                    className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg border border-border"
                  >
                    <div className="flex items-center gap-3">
                      <Music
                        className={`w-5 h-5 ${
                          langCode === "ES"
                            ? "text-blue-500"
                            : "text-purple-500"
                        }`}
                      />
                      <Badge
                        variant="secondary"
                        className="bg-teal-500/20 text-teal-500 border-teal-500/30"
                      >
                        {langName}
                      </Badge>
                      <div>
                        <p className="font-medium text-sm">
                          {asset.label || `${langName} Audio Track`}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {asset.filename} •{" "}
                          {asset.filesize
                            ? formatBytes(asset.filesize)
                            : "Unknown"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2"
                        onClick={() => downloadAsset(asset)}
                        disabled={isDeleting}
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2"
                        onClick={() => {
                          // TODO: Implement preview functionality
                          toast.info("Preview functionality coming soon");
                        }}
                        disabled={isDeleting}
                      >
                        Preview
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2"
                        onClick={() => {
                          // TODO: Implement edit functionality
                          toast.info("Edit functionality coming soon");
                        }}
                        disabled={isDeleting}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Other Assets Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Other Assets</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Upload Area */}
          <DragAndDropUploader
            description="Scripts, press kits, behind-the-scenes materials, or any other related files."
            onDrop={handleOtherAssetDrop}
            onDropMultiple={handleOtherAssetDropMultiple}
            allowedFormats={["pdf", "doc", "docx", "txt", "zip"]}
            maxFileSize={100}
            multiple={true}
            height="h-40"
            descriptionInside={true}
            isUploading={isUploadingOtherAsset}
          />

          {/* Uploaded Other Assets */}
          {otherAssets.length > 0 && (
            <div className="space-y-3">
              {otherAssets.map((asset) => {
                const isDeleting = deletingAssetIds.has(asset.id);
                const assetType =
                  typeof asset.type === "string" ? asset.type : "";
                const displayLabel =
                  asset.label ||
                  mapAPIOtherAssetTypeToLabel(assetType) ||
                  "Other";

                return (
                  <div
                    key={asset.id}
                    className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg border border-border"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex flex-col">
                        <Badge variant="outline" className="w-fit mb-2">
                          {displayLabel}
                        </Badge>
                        <p className="font-medium text-sm">{asset.filename}</p>
                        <p className="text-xs text-muted-foreground">
                          {asset.filesize
                            ? formatBytes(asset.filesize)
                            : "Unknown"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2"
                        onClick={() => downloadAsset(asset)}
                        disabled={isDeleting}
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2"
                        onClick={() => {
                          // TODO: Implement edit functionality
                          toast.info("Edit functionality coming soon");
                        }}
                        disabled={isDeleting}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Associated Content Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Film className="w-5 h-5" />
            <CardTitle className="text-lg font-semibold">
              Associated Content
            </CardTitle>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Link teasers, trailers, promotional content, and bonus materials to
            this film.
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: Search Content Library */}
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium mb-3">Search SmartLinks</h3>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    className="pl-10"
                    placeholder="Search for SmartLinks..."
                    value={associatedSearchTerm}
                    onChange={(e) => setAssociatedSearchTerm(e.target.value)}
                    onFocus={() => setAssociatedSearchFocused(true)}
                    onBlur={() =>
                      setTimeout(() => setAssociatedSearchFocused(false), 200)
                    }
                  />
                </div>
              </div>
              <ContentSearchList
                searchTerm={associatedSearchTerm}
                mediaId={mediaId}
                existingRelationships={associatedContent}
                onAdd={handleAddAssociatedContent}
                contentType="associated"
                isFocused={associatedSearchFocused}
              />
            </div>

            {/* Right: Associated Content List */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium">
                Associated Content ({associatedContent.length})
              </h3>
              {associatedLoading ? (
                <div className="text-center py-8 text-muted-foreground">
                  Loading...
                </div>
              ) : associatedContent.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-border rounded-lg bg-secondary/30">
                  <Film className="w-12 h-12 text-muted-foreground mb-4" />
                  <p className="text-sm text-muted-foreground">
                    No associated content added
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {associatedContent.map((relationship) => {
                    const smartLink = relationship.targetSmartLink;
                    const media = smartLink?.media;
                    return (
                      <div
                        key={relationship.id}
                        className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg border border-border"
                      >
                        <div className="flex items-center gap-3">
                          <Film className="w-5 h-5 text-muted-foreground" />
                          <div>
                            <p className="font-medium text-sm">
                              {smartLink?.name ||
                                media?.metadata?.title ||
                                media?.name ||
                                "Unknown"}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              {relationship.associatedType && (
                                <Badge variant="outline" className="text-xs">
                                  {relationship.associatedType}
                                </Badge>
                              )}
                              <Badge variant="outline" className="text-xs">
                                {media?.metadata?.contentType || "Content"}
                              </Badge>
                              {media?.source?.duration && (
                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {secondsToHHMMSS(media.source.duration)}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 px-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() =>
                            handleRemoveAssociatedContent(relationship.id)
                          }
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Related Content Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Link2 className="w-5 h-5" />
            <CardTitle className="text-lg font-semibold">
              Related Films
            </CardTitle>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Select other films from your library to promote and upsell to
            viewers.
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: Search Film Library */}
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium mb-3">Search SmartLinks</h3>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    className="pl-10"
                    placeholder="Search for SmartLinks..."
                    value={relatedSearchTerm}
                    onChange={(e) => setRelatedSearchTerm(e.target.value)}
                    onFocus={() => setRelatedSearchFocused(true)}
                    onBlur={() =>
                      setTimeout(() => setRelatedSearchFocused(false), 200)
                    }
                  />
                </div>
              </div>
              <ContentSearchList
                searchTerm={relatedSearchTerm}
                mediaId={mediaId}
                existingRelationships={relatedContent}
                onAdd={handleAddRelatedContent}
                contentType="related"
                isFocused={relatedSearchFocused}
              />
            </div>

            {/* Right: Related Films List */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium">
                Related Films ({relatedContent.length})
              </h3>
              {relatedLoading ? (
                <div className="text-center py-8 text-muted-foreground">
                  Loading...
                </div>
              ) : relatedContent.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-border rounded-lg bg-secondary/30">
                  <Film className="w-12 h-12 text-muted-foreground mb-4" />
                  <p className="text-sm text-muted-foreground">
                    No related films added
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {relatedContent.map((relationship) => {
                    const smartLink = relationship.targetSmartLink;
                    const media = smartLink?.media;
                    return (
                      <div
                        key={relationship.id}
                        className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg border border-border"
                      >
                        <div className="flex items-center gap-3">
                          <Film className="w-5 h-5 text-muted-foreground" />
                          <div>
                            <p className="font-medium text-sm">
                              {smartLink?.name ||
                                media?.metadata?.title ||
                                media?.name ||
                                "Unknown"}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              {media?.metadata?.genre &&
                                media.metadata.genre.length > 0 && (
                                  <span className="text-xs text-muted-foreground">
                                    {media.metadata.genre[0]}
                                  </span>
                                )}
                              {media?.metadata?.releaseDate && (
                                <>
                                  <span className="text-xs text-muted-foreground">
                                    •
                                  </span>
                                  <span className="text-xs text-muted-foreground">
                                    {new Date(
                                      media.metadata.releaseDate
                                    ).getFullYear()}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 px-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() =>
                            handleRemoveRelatedContent(relationship.id)
                          }
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Subtitle Upload Modal */}
      <SubtitleUploadModal
        isOpen={isSubtitleModalOpen}
        onClose={() => {
          setIsSubtitleModalOpen(false);
          setPendingSubtitleFile(null);
        }}
        onUpload={handleSubtitleModalUpload}
        file={pendingSubtitleFile}
        isUploading={isUploadingSubtitle}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Asset</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "
              {assetToDelete?.label || assetToDelete?.filename}"? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setAssetToDelete(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Associated Type Selection Dialog */}
      <Dialog
        open={showAssociatedTypeDialog}
        onOpenChange={setShowAssociatedTypeDialog}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Select Associated Type</DialogTitle>
            <DialogDescription>
              Choose the type of associated content for this SmartLink
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Associated Type
              </label>
              <Select
                value={selectedAssociatedType}
                onValueChange={(value) =>
                  setSelectedAssociatedType(
                    value as
                      | "PROMO"
                      | "COMMERCIAL"
                      | "TRAILER"
                      | "BONUS_CLIP"
                      | "BTS"
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PROMO">Promo</SelectItem>
                  <SelectItem value="COMMERCIAL">Commercial</SelectItem>
                  <SelectItem value="TRAILER">Trailer</SelectItem>
                  <SelectItem value="BONUS_CLIP">Bonus Clip</SelectItem>
                  <SelectItem value="BTS">Behind the Scenes</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {pendingSmartLink && (
              <div className="text-sm text-muted-foreground">
                SmartLink: {pendingSmartLink.name || "Untitled"}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowAssociatedTypeDialog(false);
                setPendingSmartLink(null);
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleConfirmAssociatedType}>
              Add Associated Content
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
