"use client";
import { RoleGuard } from "@/components/dashboard/common/RoleGuard";
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
import { useMedia } from "@/hooks/useMedia";
import { useSmartLink, useUpdateSmartLink } from "@/hooks/useSmartLinks";
import {
  cn,
  copyToClipboard,
  getEmbedCode,
  getSmartLinkUrl,
  validateEmail,
  valueToLabel,
} from "@/lib/utils";
import {
  IRegionalPricing,
  ISmartLink,
  SmartLinkAccess,
  SmartLinkStatus,
} from "@/types";
import { AxiosError } from "axios";
import { ArrowLeft, Copy, ExternalLink } from "lucide-react";
import { useRouter } from "next/navigation";
import { use, useEffect, useState } from "react";
import { toast } from "react-toastify";

const EditSmartLinkPage = ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = use(params);
  const [formData, setFormData] = useState<
    Partial<ISmartLink & { privateEmailList: string[] }>
  >({
    privateEmailList: [],
  });
  const [maxViewsEnabled, setMaxViewsEnabled] = useState(false);
  const [expireDateEnabled, setExpireDateEnabled] = useState(false);
  const [maxViews, setMaxViews] = useState("");
  const [expireDate, setExpireDate] = useState("");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [backgroundImage, setBackgroundImage] = useState<File | null>(null);
  const { processingList } = useMediaManager();
  const [mode, setMode] = useState<"autoplay" | "skip" | undefined>(undefined);

  const router = useRouter();
  const { uploadS3 } = useUpload();
  const [regionalPriceErrors, setRegionalPriceErrors] = useState<{
    [key: string]: { [key: string]: string };
  }>({});

  // Use the new hooks
  const {
    data: smartLink,
    isLoading,
    isError,
    error: fetchError,
  } = useSmartLink(id);
  const { data: media, isLoading: mediaLoading } = useMedia(
    smartLink?.mediaId || "",
  );

  const updateSmartLinkMutation = useUpdateSmartLink();

  useEffect(() => {
    if (smartLink) {
      setFormData({
        ...smartLink,
        // Map autoPlayTrailer from API to trailerAutoplay for frontend
        trailerAutoplay:
          (smartLink as any).autoPlayTrailer ??
          smartLink.trailerAutoplay ??
          false,
        privateEmailList: smartLink.emails || [],
        price:
          smartLink.price !== undefined && smartLink.price !== null
            ? Number(smartLink.price)
            : undefined,
        maxViews:
          smartLink.maxViews !== undefined && smartLink.maxViews !== null
            ? Number(smartLink.maxViews)
            : undefined,
        expiresAt: smartLink.expiresAt || "",
        currency: smartLink.currency || currencyOptions[0].value,
      });
      setMaxViewsEnabled(!!smartLink.maxViews);
      setExpireDateEnabled(!!smartLink.expiresAtEnabled);
      setMaxViews(smartLink.maxViews ? String(smartLink.maxViews) : "");
      setExpireDate(
        smartLink.expiresAt
          ? new Date(smartLink.expiresAt).toISOString().slice(0, 16)
          : "",
      );

      // Initialize rental fields
      // setRentalEnabled(!!smartLink.rentalPrice && smartLink.rentalPrice > 0);
    }
  }, [smartLink]);

  useEffect(() => {
    if (media && !smartLink?.ageRating) {
      setFormData((prev) => ({
        ...prev,
        ageRating: (media?.metadata?.rating as any) || "",
      }));
    }
  }, [media]);

  const handleChange = (
    fieldOrUpdates:
      | keyof typeof formData
      | "embedStyle"
      | Partial<typeof formData>,
    value?: any,
  ) => {
    let updatedFormData: typeof formData;

    // Check if it's an object (array of updates) or a single field
    if (typeof fieldOrUpdates === "object" && fieldOrUpdates !== null) {
      // Handle multiple field updates
      updatedFormData = { ...formData, ...fieldOrUpdates };
      console.log("Multiple updates:", fieldOrUpdates);
    } else {
      // Handle single field update
      updatedFormData = { ...formData, [fieldOrUpdates]: value };
      console.log(value);
    }

    // Handle regional pricing validation
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
        errs.price = "Price is required and must be positive";
      }
      if (!formData.currency) errs.currency = "Currency is required";
    }
    return errs;
  }

  const handleSave = async () => {
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    const emails =
      formData.access === SmartLinkAccess.PRIVATE
        ? formData.privateEmailList
        : undefined;
    if (thumbnail) {
      const url = await uploadS3(thumbnail);
      setThumbnail(null);
      formData.thumbnail = url || "";
    }

    if (backgroundImage) {
      const url = await uploadS3(backgroundImage);
      setBackgroundImage(null);
      formData.backgroundUrl = url || "";
    }

    // Exclude trailerAutoplay from spread to avoid sending stale values
    const { trailerAutoplay: _, ...formDataWithoutTrailerAutoplay } = formData;

    const payload: Partial<ISmartLink> & { autoPlayTrailer?: boolean } = {
      ...formDataWithoutTrailerAutoplay,
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
      expiresAt:
        expireDateEnabled && expireDate
          ? new Date(expireDate).toISOString()
          : undefined,
      expiresAtEnabled: expireDateEnabled,
      // Rental fields (handled by RentalSettings component)
      rentalPrice: formData.rentalPrice,
      rentalPeriodDays: formData.rentalPeriodDays,
      rentalMaxViews: formData.rentalMaxViews,
      rentalViewingWindowHours: formData.rentalViewingWindowHours,
      globalSettingsOverride: formData.globalSettingsOverride,
      // Trailer autoplay - map to API field name (autoPlayTrailer)
      // Explicitly set to false if not true (handles undefined, null, false)
      autoPlayTrailer: formData.trailerAutoplay === true ? true : false,
      // Don't send trailerAutoplay if it's false (or explicitly set to false)
      ...(formData.trailerAutoplay === true ? { trailerAutoplay: true } : {}),
    };

    try {
      await updateSmartLinkMutation.mutateAsync({ id, data: payload });
      toast.success("SmartLink updated successfully");
    } catch (e) {
      toast.error(
        e instanceof AxiosError
          ? e.response?.data.message
          : "Failed to save changes",
      );
    }
  };

  if (isLoading)
    return (
      <div className="flex flex-col lg:flex-row gap-6 p-8">
        {/* Left: Main Form Skeleton */}
        <div className="flex-1 bg-muted rounded-2xl p-6 md:p-8 shadow-lg">
          <Skeleton className="h-8 w-1/3 mb-6" /> {/* Header */}
          <div className="space-y-5">
            <Skeleton className="h-5 w-1/2 mb-2" /> {/* Name label */}
            <Skeleton className="h-10 w-full mb-4" /> {/* Name input */}
            <Skeleton className="h-5 w-1/2 mb-2" /> {/* Who can access label */}
            <Skeleton className="h-10 w-full mb-4" />{" "}
            {/* Who can access select */}
            <Skeleton className="h-5 w-1/2 mb-2" /> {/* Type of access label */}
            <Skeleton className="h-10 w-full mb-4" />{" "}
            {/* Type of access select */}
            <Skeleton className="h-5 w-1/2 mb-2" /> {/* Max views label */}
            <Skeleton className="h-10 w-full mb-4" /> {/* Max views input */}
            <Skeleton className="h-5 w-1/2 mb-2" /> {/* Expire link label */}
            <Skeleton className="h-10 w-full mb-4" /> {/* Expire link input */}
            <Skeleton className="h-10 w-32 mt-6" /> {/* Save button */}
          </div>
        </div>
        {/* Right: URL Card Skeleton */}
        <div className="w-full lg:w-[360px] flex-shrink-0">
          <div className="bg-muted rounded-2xl p-6 shadow-lg mb-6">
            <Skeleton className="h-6 w-1/2 mb-2" /> {/* URL header */}
            <Skeleton className="h-4 w-1/3 mb-2" /> {/* URL subheader */}
            <Skeleton className="h-10 w-full mb-4" /> {/* URL input */}
            <div className="flex gap-2">
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-8 w-16" />
            </div>
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-10 w-1/2" />
            <Skeleton className="h-10 w-1/2" />
          </div>
        </div>
      </div>
    );
  if (isError)
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-white mb-2">
            Failed to load SmartLink
          </h3>
          <p className="text-muted-foreground mb-4">
            {fetchError?.message || "Something went wrong. Please try again."}
          </p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    );

  return (
    <RoleGuard
      requiredPermission={[
        "smartlink:update",
        "smartlink:write",
        "smartlink:*",
      ]}
    >
      <PageTitle
        title="Edit SmartLink"
        description="Manage your SmartLink settings and configuration."
        content={
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => router.push("/dashboard/smartlinks")}
            >
              <ArrowLeft size={18} className="shrink-0" /> Back to SmartLinks
            </Button>{" "}
            <Button
              onClick={handleSave}
              disabled={updateSmartLinkMutation.isPending}
            >
              {updateSmartLinkMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        }
      />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Left: Main Form */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>SmartLink Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* name */}
            <InputEnhanced
              label="Name"
              placeholder="Enter name"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              error={errors.name}
            />
            {/* description */}
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
                  {Object.values(SmartLinkStatus)
                    .filter((opt) => opt !== SmartLinkStatus.ALL)
                    .map((opt) => (
                      <SelectItem key={opt} value={opt}>
                        {valueToLabel(opt)}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              {errors.status && (
                <div className="text-destructive text-xs mt-1">
                  {errors.status}
                </div>
              )}
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
              {errors.access && (
                <div className="text-destructive text-xs mt-1">
                  {errors.access}
                </div>
              )}
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
              {errors.typeOfAccess && (
                <div className="text-destructive text-xs mt-1">
                  {errors.typeOfAccess}
                </div>
              )}
            </div>
            {/* Max views switch and input */}
            <div className="flex gap-2">
              <div className="flex-1 flex flex-col gap-2">
                <div className="flex items-center gap-2 justify-between ">
                  <Label>Max views</Label>
                  <Switch
                    checked={maxViewsEnabled}
                    onCheckedChange={(val) => setMaxViewsEnabled(val)}
                  />
                </div>
                {maxViewsEnabled && (
                  <div className="flex items-center gap-2">
                    <InputEnhanced
                      placeholder="100"
                      type="number"
                      min="1"
                      value={maxViews}
                      onChange={(e) => setMaxViews(e.target.value)}
                      error={errors.maxViews}
                    />
                  </div>
                )}
                {errors.maxViews && (
                  <div className="text-destructive text-xs mt-1">
                    {errors.maxViews}
                  </div>
                )}
              </div>
              <div className="flex-1 flex flex-col gap-2">
                <div className="flex items-center gap-2 justify-between ">
                  <Label>Expire link</Label>
                  <Switch
                    checked={expireDateEnabled}
                    onCheckedChange={(val) => setExpireDateEnabled(val)}
                  />
                </div>
                {expireDateEnabled && (
                  <div className="flex items-center gap-2">
                    <InputEnhanced
                      type="date"
                      value={expireDate.split("T")[0]}
                      onChange={(e) => setExpireDate(e.target.value)}
                      error={errors.expiresAt}
                    />
                  </div>
                )}
              </div>
            </div>
            {/* Data collection for SHARED */}
            {formData.access === SmartLinkAccess.SHARED && (
              <div>
                <Label className="mb-2">Data to collect</Label>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2 justify-between ">
                    <Label>Email</Label>
                    <Switch
                      checked={formData.collectEmail || false}
                      onCheckedChange={(val) =>
                        handleChange("collectEmail", val)
                      }
                    />
                  </div>
                  <div className="flex items-center gap-2 justify-between ">
                    <Label>Name</Label>
                    <Switch
                      checked={formData.collectName || false}
                      onCheckedChange={(val) =>
                        handleChange("collectName", val)
                      }
                    />
                  </div>
                  <div className="flex items-center gap-2 justify-between ">
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
            {/* Private email list for PRIVATE */}
            {formData.access === SmartLinkAccess.PRIVATE && (
              <div>
                <InputEnhanced
                  label="Private email list"
                  placeholder="Enter email addresses "
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
          {/* Right: URL Card */}
          <Card className="w-full flex-1 flex-shrink-0">
            <CardHeader>
              <CardTitle>SmartLink URL</CardTitle>
              <CardDescription>This URL cannot be changed</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-end gap-2 mb-4">
                <InputEnhanced
                  label="SmartLink URL"
                  onChange={() => {}}
                  value={
                    formData.slug
                      ? getSmartLinkUrl({
                          slug: formData.slug,
                          mode,
                        })
                      : ""
                  }
                  readOnly
                  placeholder={getSmartLinkUrl({
                    slug: formData.slug,
                    mode,
                  })}
                  error={errors.slug}
                />
                <Button
                  variant="secondary"
                  size="icon"
                  onClick={() =>
                    copyToClipboard(
                      formData.slug
                        ? getSmartLinkUrl({
                            slug: formData.slug,
                            mode,
                          })
                        : "",
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
                      formData.slug
                        ? getSmartLinkUrl({
                            slug: formData.slug,
                            mode,
                          })
                        : "",
                      "_blank",
                    )
                  }
                >
                  <ExternalLink size={18} />
                </Button>
              </div>
              <div className="flex items-end gap-2 mb-4">
                <InputEnhanced
                  label="SmartLink Embed Code"
                  onChange={() => {}}
                  value={
                    formData.slug
                      ? getEmbedCode({
                          slug: formData.slug,
                        })
                      : ""
                  }
                  readOnly
                  placeholder={getEmbedCode({
                    slug: formData.slug,
                  })}
                  error={errors.slug}
                />
                <Button
                  variant="secondary"
                  size="icon"
                  onClick={() =>
                    copyToClipboard(
                      formData.slug
                        ? getEmbedCode({
                            slug: formData.slug,
                          })
                        : "",
                    )
                  }
                >
                  <Copy size={18} />
                </Button>
              </div>
              <div>
                <Label className="mb-2">Mode</Label>
                <Select
                  value={mode ?? "disabled"}
                  onValueChange={(val) =>
                    setMode(
                      val === "disabled"
                        ? undefined
                        : (val as "skip" | "autoplay"),
                    )
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="disabled">Disabled</SelectItem>
                    <SelectItem value="skip">Skip Landing Page</SelectItem>
                    {/* <SelectItem value="autoplay">
                      Skip Landing Page and Autoplay
                    </SelectItem> */}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
          <Card className="w-full flex-1 flex-shrink-0">
            <CardHeader>
              <CardTitle>Link Status</CardTitle>
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
                  <div className="text-muted-foreground">Total Clicks:</div>
                  <div>{formData.totalClicks}</div>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <div className="text-muted-foreground">Total Views:</div>
                  <div>{formData.totalViews}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <div className="lg:col-span-2 flex flex-col gap-3">
          <PresentationSelect
            smartLink={formData}
            onChange={handleChange}
            setThumbnail={setThumbnail}
            setBackgroundImage={setBackgroundImage}
          />
          <PlayOutInstructions
            smartLink={formData}
            onChange={handleChange}
            media={media}
            mediaLoading={mediaLoading}
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
            />
          )}
        </div>
        <div>
          {/* Rental Settings Card */}
          {formData.access === SmartLinkAccess.PAYWALL && (
            <RentalSettings
              smartLink={formData}
              onChange={handleChange}
              errors={errors}
            />
          )}
        </div>
      </div>

      <div
        className={cn(
          "flex gap-2 border-t  pt-4 mt-4 justify-end",
          processingList.length > 0 ? "mb-24 lg:mb-20" : "",
        )}
      >
        <Button
          variant="secondary"
          onClick={() => router.push("/dashboard/smartlinks")}
        >
          <ArrowLeft size={18} className="shrink-0" /> Back to SmartLinks
        </Button>
        <Button
          onClick={handleSave}
          disabled={updateSmartLinkMutation.isPending}
        >
          {updateSmartLinkMutation.isPending ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </RoleGuard>
  );
};

export default EditSmartLinkPage;
