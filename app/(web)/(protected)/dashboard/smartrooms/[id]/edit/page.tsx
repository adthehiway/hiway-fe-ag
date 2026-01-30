"use client";
import PageTitle from "@/components/dashboard/layout/PageTitle";
import GeographicPricing from "@/components/dashboard/smartlinks/GeographicPricing";
import PlayOutInstructions from "@/components/dashboard/smartlinks/PlayOutInstructions";
import PresentationSelect from "@/components/dashboard/smartlinks/PresentationSelect";
import RentalSettings from "@/components/dashboard/smartlinks/RentalSettings";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import InputEnhanced from "@/components/ui/input-enhanced";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { currencyOptions } from "@/config";
import {
  smartLinkAccessOptions,
  smartLinkTypeOfAccessOptions,
} from "@/config/dashboard/smartlink";
import { useMediaManager } from "@/contexts/media-manager";
import { useUpload } from "@/contexts/upload";
import { useMediaByStatus } from "@/hooks/useMedia";
import {
  useSmartRoom,
  useUpdateSmartRoom,
  useAddMediaToRoom,
} from "@/hooks/useSmartRooms";
import {
  cn,
  copyToClipboard,
  getSmartLinkUrl,
  validateEmail,
  valueToLabel,
} from "@/lib/utils";
import {
  IRegionalPricing,
  ISmartRoom,
  SmartLinkAccess,
  SmartRoomStatus,
  MediaStatus,
  IMedia,
} from "@/types";
import { AxiosError } from "axios";
import {
  ArrowLeft,
  Copy,
  ExternalLink,
  Plus,
  X,
  Search,
  Pencil,
  Trash2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { use, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Input } from "@/components/ui/input";
import Link from "next/link";
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
import {
  useDeleteSmartLinksFromRoom,
  useUpdateSmartLinkInRoom,
} from "@/hooks/useSmartRooms";
import { ISmartLink } from "@/types";

const getSmartRoomUrl = (slug: string) => {
  const baseUrl = process.env.NEXT_PUBLIC_WATCH_URL || window.location.origin;
  return `${baseUrl}/room/${slug}`;
};

const EditSmartRoomPage = ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = use(params);
  const [formData, setFormData] = useState<
    Partial<ISmartRoom & { privateEmailList: string[] }>
  >({
    privateEmailList: [],
  });
  const [maxViewsEnabled, setMaxViewsEnabled] = useState(false);
  const [expireDateEnabled, setExpireDateEnabled] = useState(false);
  const [maxViews, setMaxViews] = useState("");
  const [expireDate, setExpireDate] = useState("");
  const [isRecurring, setIsRecurring] = useState(false);
  const [subscriptionInterval, setSubscriptionInterval] = useState<
    "month" | "year"
  >("month");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [backgroundImage, setBackgroundImage] = useState<File | null>(null);
  const { processingList } = useMediaManager();
  const [mediaSearch, setMediaSearch] = useState("");
  const [mediaDropdownOpen, setMediaDropdownOpen] = useState(false);
  const [selectedMediaToAdd, setSelectedMediaToAdd] = useState<string[]>([]);

  const router = useRouter();
  const { uploadS3 } = useUpload();
  const [regionalPriceErrors, setRegionalPriceErrors] = useState<{
    [key: string]: { [key: string]: string };
  }>({});

  const {
    data: smartRoom,
    isLoading,
    isError,
    error: fetchError,
    refetch,
  } = useSmartRoom(id);

  const { mediaList, isLoading: mediaLoading } = useMediaByStatus(
    [MediaStatus.READY],
    100,
    mediaSearch
  );

  const updateSmartRoomMutation = useUpdateSmartRoom();
  const addMediaMutation = useAddMediaToRoom();
  const deleteSmartLinksMutation = useDeleteSmartLinksFromRoom();
  const updateSmartLinkMutation = useUpdateSmartLinkInRoom();

  // State for delete confirmation dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [smartLinkToDelete, setSmartLinkToDelete] = useState<ISmartLink | null>(
    null
  );

  // State for update dialog
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [smartLinkToUpdate, setSmartLinkToUpdate] = useState<ISmartLink | null>(
    null
  );
  const [updateName, setUpdateName] = useState("");
  const [updateDescription, setUpdateDescription] = useState("");

  useEffect(() => {
    if (smartRoom) {
      setFormData({
        ...smartRoom,
        privateEmailList: smartRoom.emails || [],
        price:
          smartRoom.price !== undefined && smartRoom.price !== null
            ? Number(smartRoom.price)
            : undefined,
        maxViews:
          smartRoom.maxViews !== undefined && smartRoom.maxViews !== null
            ? Number(smartRoom.maxViews)
            : undefined,
        expiresAt: smartRoom.expiresAt || "",
        currency: smartRoom.currency || currencyOptions[0].value,
      });
      setMaxViewsEnabled(!!smartRoom.maxViews);
      setExpireDateEnabled(!!smartRoom.expiresAtEnabled);
      setMaxViews(smartRoom.maxViews ? String(smartRoom.maxViews) : "");
      setExpireDate(
        smartRoom.expiresAt
          ? new Date(smartRoom.expiresAt).toISOString().slice(0, 16)
          : ""
      );
      setIsRecurring(smartRoom.isRecurring || false);
      setSubscriptionInterval(smartRoom.subscriptionInterval || "month");
    }
  }, [smartRoom]);

  const handleChange = (
    fieldOrUpdates:
      | keyof typeof formData
      | "embedStyle"
      | Partial<typeof formData>,
    value?: any
  ) => {
    let updatedFormData: typeof formData;

    if (typeof fieldOrUpdates === "object" && fieldOrUpdates !== null) {
      updatedFormData = { ...formData, ...fieldOrUpdates };
    } else {
      updatedFormData = { ...formData, [fieldOrUpdates]: value };
    }

    if (updatedFormData.regionalPricing !== formData.regionalPricing) {
      let errors: { [key: string]: { [key: string]: string } } = {};
      if (
        updatedFormData.regionalPricing &&
        updatedFormData.regionalPricing.length > 0
      ) {
        updatedFormData.regionalPricing.forEach((r) => {
          const errs = validateRegionalPricing([r]);
          if (Object.keys(errs).length > 0) {
            errors[r.continent] = errs;
          }
        });
      }
      setRegionalPriceErrors(errors);
    }

    setFormData(updatedFormData);
  };

  const validateRegionalPricing = (value: IRegionalPricing[]) => {
    const errs: { [key: string]: string } = {};
    value.forEach((r) => {
      if (!r.currency) errs.currency = "Currency is required";
    });
    value.forEach((r) => {
      if (!r.price) errs.price = "Price is required";
    });
    value.forEach((r) => {
      if (!r.continent) errs.continent = "Continent is required";
    });
    return errs;
  };

  function validate() {
    const errs: { [key: string]: string } = {};

    if (!formData.name) errs.name = "Name is required";
    if (!formData.access) errs.access = "Access type is required";
    if (!formData.typeOfAccess)
      errs.typeOfAccess = "Type of access is required";
    if (
      maxViewsEnabled &&
      (!maxViews || isNaN(Number(maxViews)) || Number(maxViews) < 1)
    ) {
      errs.maxViews = "Max views must be a positive number";
    }
    if (expireDateEnabled && !expireDate) {
      errs.expiresAt = "Expire date is required";
    }
    if (formData.access === SmartLinkAccess.PRIVATE) {
      const emails = formData.privateEmailList;
      if (!emails?.length)
        errs.emails = "At least one email is required for private access";
    }
    if (formData.access === SmartLinkAccess.PAYWALL) {
      if (
        !formData.price ||
        isNaN(Number(formData.price)) ||
        Number(formData.price) <= 0
      ) {
        errs.price = isRecurring
          ? "Subscription price is required and must be positive"
          : "Price is required and must be positive";
      }
      if (!formData.currency) errs.currency = "Currency is required";
      if (isRecurring && !subscriptionInterval) {
        errs.subscriptionInterval =
          "Billing interval is required for recurring payments";
      }
    }
    return errs;
  }

  const handleSave = async () => {
    console.log("Save button clicked");
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) {
      console.log("Validation errors:", errs);
      return;
    }

    const emails =
      formData.access === SmartLinkAccess.PRIVATE
        ? formData.privateEmailList
        : undefined;

    let thumbnailUrl = formData.thumbnail;
    if (thumbnail) {
      try {
        const url = await uploadS3(thumbnail);
        setThumbnail(null);
        thumbnailUrl = url || "";
      } catch (error) {
        console.error("Failed to upload thumbnail:", error);
        toast.error("Failed to upload thumbnail");
        return;
      }
    }

    let backgroundUrl = formData.backgroundUrl;
    if (backgroundImage) {
      try {
        const url = await uploadS3(backgroundImage);
        setBackgroundImage(null);
        backgroundUrl = url || "";
      } catch (error) {
        console.error("Failed to upload background image:", error);
        toast.error("Failed to upload background image");
        return;
      }
    }

    const payload: Partial<ISmartRoom> = {
      name: formData.name,
      description: formData.description,
      access: formData.access,
      typeOfAccess: formData.typeOfAccess,
      status: formData.status,
      collectEmail:
        formData.access === SmartLinkAccess.SHARED
          ? formData.collectEmail
          : undefined,
      collectName:
        formData.access === SmartLinkAccess.SHARED
          ? formData.collectName
          : undefined,
      collectPhone:
        formData.access === SmartLinkAccess.SHARED
          ? formData.collectPhone
          : undefined,
      emails,
      price:
        formData.access === SmartLinkAccess.PAYWALL
          ? Number(formData.price)
          : undefined,
      currency:
        formData.access === SmartLinkAccess.PAYWALL
          ? formData.currency
          : undefined,
      maxViews: maxViewsEnabled ? Number(maxViews) : undefined,
      maxViewsEnabled: maxViewsEnabled,
      expiresAt:
        expireDateEnabled && expireDate
          ? new Date(expireDate).toISOString()
          : undefined,
      expiresAtEnabled: expireDateEnabled,
      thumbnail: thumbnailUrl,
      backgroundUrl: backgroundUrl,
      backgroundColor: formData.backgroundColor,
      pricingName: formData.pricingName,
      subHeader: formData.subHeader,
      companyLogo: formData.companyLogo,
      playbookContent: formData.playbookContent,
      ageRating: formData.ageRating,
      embedStyle: formData.embedStyle,
      buttonText: formData.buttonText,
      showTrailerButton: formData.showTrailerButton,
      trailerLink: formData.trailerLink,
      showFilmButton: formData.showFilmButton,
      filmLink: formData.filmLink,
      rentalPrice: formData.rentalPrice,
      rentalPeriodDays: formData.rentalPeriodDays,
      rentalMaxViews: formData.rentalMaxViews,
      rentalViewingWindowHours: formData.rentalViewingWindowHours,
      globalSettingsOverride: formData.globalSettingsOverride,
      allowedCountries: formData.allowedCountries,
      regionalPricing: formData.regionalPricing,
      isRecurring:
        formData.access === SmartLinkAccess.PAYWALL ? isRecurring : undefined,
      subscriptionInterval:
        formData.access === SmartLinkAccess.PAYWALL && isRecurring
          ? subscriptionInterval
          : undefined,
    };

    console.log("Saving payload:", payload);

    try {
      // First, add any selected media items
      if (selectedMediaToAdd.length > 0) {
        console.log("Adding media items:", selectedMediaToAdd);
        try {
          const mediaResult = await addMediaMutation.mutateAsync({
            roomId: id,
            mediaIds: selectedMediaToAdd,
          });
          console.log("Media addition result:", mediaResult);
          toast.success(
            `Added ${selectedMediaToAdd.length} media item${
              selectedMediaToAdd.length !== 1 ? "s" : ""
            }`
          );
          setSelectedMediaToAdd([]);
          setMediaSearch("");
        } catch (mediaError) {
          console.error("Failed to add media:", mediaError);
          toast.error(
            mediaError instanceof AxiosError
              ? mediaError.response?.data?.message || "Failed to add media"
              : "Failed to add media"
          );
          // Continue with room update even if media addition fails
        }
      } else {
        console.log("No media items selected to add");
      }

      // Then update the room settings
      const result = await updateSmartRoomMutation.mutateAsync({
        id,
        data: payload,
      });
      console.log("Save successful:", result);
      toast.success("Smart Room updated successfully");

      // Refetch room data to get updated smart links
      refetch();
    } catch (e) {
      console.error("Save error:", e);
      toast.error(
        e instanceof AxiosError
          ? e.response?.data?.message || e.message
          : "Failed to save changes"
      );
    }
  };

  const handleAddMedia = async () => {
    console.log(
      "handleAddMedia called, selectedMediaToAdd:",
      selectedMediaToAdd
    );
    if (selectedMediaToAdd.length === 0) {
      toast.error("Please select at least one media item");
      return;
    }

    try {
      console.log("Calling addMediaMutation with:", {
        roomId: id,
        mediaIds: selectedMediaToAdd,
      });
      const result = await addMediaMutation.mutateAsync({
        roomId: id,
        mediaIds: selectedMediaToAdd,
      });
      console.log("Media addition successful:", result);
      toast.success("Media added successfully");
      setSelectedMediaToAdd([]);
      setMediaSearch("");
      refetch();
    } catch (e) {
      console.error("Media addition error:", e);
      toast.error(
        e instanceof AxiosError
          ? e.response?.data?.message || e.message
          : "Failed to add media"
      );
    }
  };

  const handleSelectMediaToAdd = (media: IMedia) => {
    if (!selectedMediaToAdd.includes(media.id)) {
      setSelectedMediaToAdd([...selectedMediaToAdd, media.id]);
      setMediaSearch("");
      setMediaDropdownOpen(false);
    }
  };

  const handleDeleteClick = (smartLink: ISmartLink) => {
    setSmartLinkToDelete(smartLink);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!smartLinkToDelete) return;

    try {
      await deleteSmartLinksMutation.mutateAsync({
        roomId: id,
        smartLinkIds: [smartLinkToDelete.id],
      });
      toast.success("Smart link removed successfully");
      setDeleteDialogOpen(false);
      setSmartLinkToDelete(null);
      refetch();
    } catch (error) {
      toast.error(
        error instanceof AxiosError
          ? error.response?.data?.message || "Failed to remove smart link"
          : "Failed to remove smart link"
      );
    }
  };

  const handleEditClick = (smartLink: ISmartLink) => {
    setSmartLinkToUpdate(smartLink);
    setUpdateName(smartLink.name);
    setUpdateDescription((smartLink as any).description || "");
    setUpdateDialogOpen(true);
  };

  const handleUpdateConfirm = async () => {
    if (!smartLinkToUpdate) return;

    if (!updateName.trim()) {
      toast.error("Name is required");
      return;
    }

    try {
      await updateSmartLinkMutation.mutateAsync({
        roomId: id,
        smartLinkId: smartLinkToUpdate.id,
        data: {
          name: updateName.trim(),
          description: updateDescription.trim() || undefined,
        },
      });
      toast.success("Smart link updated successfully");
      setUpdateDialogOpen(false);
      setSmartLinkToUpdate(null);
      setUpdateName("");
      setUpdateDescription("");
      refetch();
    } catch (error) {
      toast.error(
        error instanceof AxiosError
          ? error.response?.data?.message || "Failed to update smart link"
          : "Failed to update smart link"
      );
    }
  };

  const availableMedia = mediaList.filter(
    (m) =>
      !smartRoom?.smartLinks?.some((sl) => sl.mediaId === m.id) &&
      !selectedMediaToAdd.includes(m.id)
  );

  if (isLoading)
    return (
      <div className="flex flex-col lg:flex-row gap-6 p-8">
        <div className="flex-1 bg-muted rounded-2xl p-6 md:p-8 shadow-lg">
          <Skeleton className="h-8 w-1/3 mb-6" />
          <div className="space-y-5">
            <Skeleton className="h-10 w-full mb-4" />
            <Skeleton className="h-10 w-full mb-4" />
            <Skeleton className="h-10 w-full mb-4" />
          </div>
        </div>
      </div>
    );
  if (isError)
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-white mb-2">
            Failed to load Smart Room
          </h3>
          <p className="text-muted-foreground mb-4">
            {fetchError?.message || "Something went wrong. Please try again."}
          </p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    );

  return (
    <>
      <PageTitle
        title="Edit Smart Room"
        description="Manage your Smart Room settings and configuration."
        content={
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => router.push("/dashboard/smartrooms")}
            >
              <ArrowLeft size={18} className="shrink-0" /> Back to Smart Rooms
            </Button>
            <Button
              onClick={handleSave}
              disabled={updateSmartRoomMutation.isPending}
            >
              {updateSmartRoomMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Left: Main Form */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Smart Room Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <InputEnhanced
              label="Name"
              placeholder="Enter name"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              error={errors.name}
            />
            <InputEnhanced
              label="Description"
              placeholder="Enter description (optional)"
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
            />
            <div>
              <Label className="mb-2">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(val) => handleChange("status", val)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="w-full">
                  {Object.values(SmartRoomStatus).map((opt) => (
                    <SelectItem key={opt} value={opt}>
                      {valueToLabel(opt)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="mb-2">Who can access</Label>
              <Select
                value={formData.access}
                onValueChange={(val) => handleChange("access", val)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="w-full">
                  {smartLinkAccessOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="mb-2">Type of access</Label>
              <Select
                value={formData.typeOfAccess}
                onValueChange={(val) => handleChange("typeOfAccess", val)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="w-full">
                  {smartLinkTypeOfAccessOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <div className="flex-1 flex flex-col gap-2">
                <div className="flex items-center gap-2 justify-between">
                  <Label>Max views</Label>
                  <Switch
                    checked={maxViewsEnabled}
                    onCheckedChange={(val) => setMaxViewsEnabled(val)}
                  />
                </div>
                {maxViewsEnabled && (
                  <InputEnhanced
                    placeholder="100"
                    type="number"
                    min="1"
                    value={maxViews}
                    onChange={(e) => setMaxViews(e.target.value)}
                    error={errors.maxViews}
                  />
                )}
              </div>
              <div className="flex-1 flex flex-col gap-2">
                <div className="flex items-center gap-2 justify-between">
                  <Label>Expire link</Label>
                  <Switch
                    checked={expireDateEnabled}
                    onCheckedChange={(val) => setExpireDateEnabled(val)}
                  />
                </div>
                {expireDateEnabled && (
                  <InputEnhanced
                    type="date"
                    value={expireDate.split("T")[0]}
                    onChange={(e) => setExpireDate(e.target.value)}
                    error={errors.expiresAt}
                  />
                )}
              </div>
            </div>
            {formData.access === SmartLinkAccess.SHARED && (
              <div>
                <Label className="mb-2">Data to collect</Label>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2 justify-between">
                    <Label>Email</Label>
                    <Switch
                      checked={formData.collectEmail || false}
                      onCheckedChange={(val) =>
                        handleChange("collectEmail", val)
                      }
                    />
                  </div>
                  <div className="flex items-center gap-2 justify-between">
                    <Label>Name</Label>
                    <Switch
                      checked={formData.collectName || false}
                      onCheckedChange={(val) =>
                        handleChange("collectName", val)
                      }
                    />
                  </div>
                  <div className="flex items-center gap-2 justify-between">
                    <Label>Phone</Label>
                    <Switch
                      checked={formData.collectPhone || false}
                      onCheckedChange={(val) =>
                        handleChange("collectPhone", val)
                      }
                    />
                  </div>
                </div>
              </div>
            )}
            {formData.access === SmartLinkAccess.PRIVATE && (
              <div>
                <InputEnhanced
                  label="Private email list"
                  placeholder="Enter email addresses"
                  chip
                  chips={formData.privateEmailList}
                  onChipsChange={(chips) =>
                    handleChange("privateEmailList", chips)
                  }
                  error={errors.emails}
                  chipValidation={validateEmail}
                />
              </div>
            )}
          </CardContent>
        </Card>
        <div className="flex flex-col gap-3">
          <Card className="w-full flex-1 flex-shrink-0">
            <CardHeader>
              <CardTitle>Smart Room URL</CardTitle>
              <CardDescription>This URL cannot be changed</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-end gap-2 mb-4">
                <InputEnhanced
                  label="Smart Room URL"
                  onChange={() => {}}
                  value={formData.slug ? getSmartRoomUrl(formData.slug) : ""}
                  readOnly
                  placeholder={getSmartRoomUrl(formData.slug || "")}
                />
                <Button
                  variant="secondary"
                  size="icon"
                  onClick={() =>
                    copyToClipboard(
                      formData.slug ? getSmartRoomUrl(formData.slug) : ""
                    )
                  }
                >
                  <Copy size={18} />
                </Button>
                <Button
                  variant="secondary"
                  size="icon"
                  onClick={() =>
                    window.open(
                      formData.slug ? getSmartRoomUrl(formData.slug) : "",
                      "_blank"
                    )
                  }
                >
                  <ExternalLink size={18} />
                </Button>
              </div>
            </CardContent>
          </Card>
          <Card className="w-full flex-1 flex-shrink-0">
            <CardHeader>
              <CardTitle>Room Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-white space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="text-muted-foreground">Status:</div>
                  <span className="inline-block px-3 py-1 rounded-full bg-accent text-black text-xs font-semibold">
                    {formData.status}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <div className="text-muted-foreground">Type:</div>
                  <div>{formData.typeOfAccess}</div>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <div className="text-muted-foreground">Media Items:</div>
                  <div>{smartRoom?.smartLinks?.length || 0}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Media Management Section */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Media Items</CardTitle>
          <CardDescription>
            Manage media items in this Smart Room
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Add Media Section */}
          <div className="space-y-2">
            <Label>Add Media to Room</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                <Search size={18} />
              </span>
              <Input
                className="pl-10"
                placeholder="Search your library..."
                value={mediaSearch}
                onFocus={() => setMediaDropdownOpen(true)}
                onBlur={() =>
                  setTimeout(() => setMediaDropdownOpen(false), 150)
                }
                onChange={(e) => setMediaSearch(e.target.value)}
              />
              {mediaDropdownOpen && (
                <div className="absolute left-0 right-0 mt-1 max-h-60 overflow-y-auto bg-muted rounded shadow-lg z-10 border">
                  {mediaLoading ? (
                    <div className="p-4 text-muted-foreground text-center">
                      Loading...
                    </div>
                  ) : availableMedia.length === 0 ? (
                    <div className="p-4 text-muted-foreground text-center">
                      {mediaSearch
                        ? "No content found"
                        : "Start typing to search your library"}
                    </div>
                  ) : (
                    <ul className="divide-y">
                      {availableMedia.map((m) => (
                        <li
                          key={m.id}
                          className="px-4 py-2 cursor-pointer hover:bg-accent/10"
                          onMouseDown={() => handleSelectMediaToAdd(m)}
                        >
                          <div className="font-semibold">
                            {m.metadata?.title || m.name}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {m.metadata?.releaseDate
                              ? new Date(
                                  m.metadata?.releaseDate
                                ).toLocaleDateString()
                              : new Date(m.createdAt).toLocaleDateString()}
                            {m.metadata?.genre?.length && (
                              <> • {m.metadata?.genre?.join(", ")}</>
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
            {selectedMediaToAdd.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {mediaList
                  .filter((m) => selectedMediaToAdd.includes(m.id))
                  .map((media) => (
                    <div
                      key={media.id}
                      className="inline-flex items-center gap-2 px-3 py-1 bg-accent/20 rounded-full text-sm"
                    >
                      <span>{media.metadata?.title || media.name}</span>
                      <button
                        type="button"
                        onClick={() =>
                          setSelectedMediaToAdd(
                            selectedMediaToAdd.filter((id) => id !== media.id)
                          )
                        }
                        className="hover:text-destructive"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
              </div>
            )}
            {selectedMediaToAdd.length > 0 && (
              <Button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log("Add Media button clicked");
                  handleAddMedia();
                }}
                disabled={addMediaMutation.isPending}
                size="sm"
              >
                <Plus size={16} className="mr-2" />
                {addMediaMutation.isPending
                  ? "Adding..."
                  : `Add ${selectedMediaToAdd.length} Media Item${
                      selectedMediaToAdd.length !== 1 ? "s" : ""
                    }`}
              </Button>
            )}
          </div>

          {/* Current Media List */}
          <div className="space-y-2">
            <Label>
              Current Media Items ({smartRoom?.smartLinks?.length || 0})
            </Label>
            {smartRoom?.smartLinks && smartRoom.smartLinks.length > 0 ? (
              <div className="space-y-2">
                {smartRoom.smartLinks.map((sl) => (
                  <div
                    key={sl.id}
                    className="flex items-center justify-between p-3 bg-muted/20 rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{sl.name}</h3>
                        <Button
                          variant="secondary"
                          size="iconSm"
                          onClick={() => handleEditClick(sl)}
                        >
                          <Pencil size={16} />
                        </Button>
                        <Button
                          variant="secondary"
                          size="iconSm"
                          onClick={() => handleDeleteClick(sl)}
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Smart Link:{" "}
                        <Link
                          className="text-accent hover:underline font-medium"
                          href={`${process.env.NEXT_PUBLIC_APP_URL}/room/${formData.slug}?s=${sl.slug}`}
                          target="_blank"
                        >
                          {`${process.env.NEXT_PUBLIC_APP_URL}/room/${formData.slug}?s=${sl.slug}`}
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">
                No media items in this room yet. Add media using the search
                above.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Presentation, PlayOut, Pricing Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 mt-6">
        <div className="lg:col-span-2 flex flex-col gap-3">
          <PresentationSelect
            smartLink={formData as any}
            onChange={handleChange as any}
            setThumbnail={setThumbnail}
            setBackgroundImage={setBackgroundImage}
          />
          <PlayOutInstructions
            smartLink={formData as any}
            onChange={handleChange as any}
            media={undefined}
            mediaLoading={false}
            errors={errors}
          />
          {formData.access === SmartLinkAccess.PAYWALL && (
            <GeographicPricing
              allowedCountries={formData.allowedCountries || []}
              onCountriesChange={(val) => handleChange("allowedCountries", val)}
              regionalPricing={formData.regionalPricing || []}
              onRegionalPricingChange={(val: IRegionalPricing[]) =>
                handleChange("regionalPricing", val)
              }
              regionalPriceErrors={regionalPriceErrors}
              errors={errors}
              defaultCurrency={formData.currency}
              defaultPrice={formData.price || 0}
              setDefaultCurrency={(val: string) =>
                handleChange("currency", val)
              }
              setDefaultPrice={(val: number) => handleChange("price", val)}
              defaultRentalPrice={formData.rentalPrice ?? undefined}
              setDefaultRentalPrice={(val: number) =>
                handleChange("rentalPrice", val)
              }
              isRecurring={isRecurring}
              onRecurringChange={setIsRecurring}
              subscriptionInterval={subscriptionInterval}
              onSubscriptionIntervalChange={setSubscriptionInterval}
            />
          )}
        </div>
        <div>
          {formData.access === SmartLinkAccess.PAYWALL && (
            <RentalSettings
              smartLink={formData as any}
              onChange={handleChange as any}
              errors={errors}
            />
          )}
        </div>
      </div>

      <div
        className={cn(
          "flex gap-2 border-t pt-4 mt-4 justify-end",
          processingList.length > 0 ? "mb-24 lg:mb-20" : ""
        )}
      >
        <Button
          variant="secondary"
          onClick={() => router.push("/dashboard/smartrooms")}
        >
          <ArrowLeft size={18} className="shrink-0" /> Back to Smart Rooms
        </Button>
        <Button
          onClick={handleSave}
          disabled={updateSmartRoomMutation.isPending}
        >
          {updateSmartRoomMutation.isPending ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Smart Link</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove "{smartLinkToDelete?.name}" from
              this Smart Room? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={deleteSmartLinksMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteSmartLinksMutation.isPending ? "Removing..." : "Remove"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={updateDialogOpen} onOpenChange={setUpdateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Smart Link</DialogTitle>
            <DialogDescription>
              Update the name and description for this smart link.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="update-name">Name *</Label>
              <Input
                id="update-name"
                value={updateName}
                onChange={(e) => setUpdateName(e.target.value)}
                placeholder="Enter smart link name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="update-description">Description</Label>
              <InputEnhanced
                id="update-description"
                textarea
                value={updateDescription}
                onChange={(e) => setUpdateDescription(e.target.value)}
                placeholder="Enter description (optional)"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="secondary"
              onClick={() => {
                setUpdateDialogOpen(false);
                setSmartLinkToUpdate(null);
                setUpdateName("");
                setUpdateDescription("");
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateConfirm}
              disabled={updateSmartLinkMutation.isPending}
            >
              {updateSmartLinkMutation.isPending ? "Updating..." : "Update"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default EditSmartRoomPage;
