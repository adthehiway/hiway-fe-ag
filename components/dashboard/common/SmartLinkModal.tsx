import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, X, Search, Copy } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import {
  IMedia,
  ISmartLink,
  MediaStatus,
  SmartLinkAccess,
  SmartLinkType,
} from "@/types";
import { useRouter } from "next/navigation";
import { useCreateSmartLink } from "@/hooks/useSmartLinks";
import { useMediaByStatus } from "@/hooks/useMedia";
import { useUser } from "@/hooks/useUser";

import { toast } from "react-toastify";
import { AxiosError } from "axios";
import { Modal } from "@/components/ui/modal";
import { Label } from "@/components/ui/label";
import { smartLinkAccessOptions } from "@/config/dashboard/smartlink";
import { smartLinkTypeOfAccessOptions } from "@/config/dashboard/smartlink";
import InputEnhanced from "@/components/ui/input-enhanced";
import { validateEmail } from "@/lib/utils";
import Link from "next/link";
import { useCompany } from "@/hooks/useCompanies";
import { currencyOptions } from "@/config";
import SearchMediaInput from "./SearchMediaInput";

interface SmartLinkModalProps {
  media?: IMedia;
  isOpen: boolean;
  onClose: () => void;
  clipStart?: number;
  clipEnd?: number;
}

const initialFormData = {
  name: "",
  mediaId: "",
  description: "",
  contentType: "",
  access: SmartLinkAccess.PUBLIC,
  typeOfAccess: SmartLinkType.VIEW,
  privateEmailList: [],
  price: "",
  rentalPrice: "",
  rentalMaxViews: "",
  currency: currencyOptions[0].value,
  collectEmail: false,
  collectName: false,
  collectPhone: false,
};

const SmartLinkModal: React.FC<SmartLinkModalProps> = ({
  isOpen,
  onClose,
  media: mediaProp,
  clipStart,
  clipEnd,
}) => {
  const createSmartLinkMutation = useCreateSmartLink();
  const { data: user, isLoading: userLoading } = useUser();
  const { data: company, isLoading: companyLoading } = useCompany();
  const [search, setSearch] = useState("");
  const { mediaList, isLoading: mediaLoading } = useMediaByStatus(
    [MediaStatus.READY],
    100,
    search,
  );
  const [formData, setFormData] = useState(initialFormData);
  const [maxViewsEnabled, setMaxViewsEnabled] = useState(false);
  const [maxViews, setMaxViews] = useState("");
  const [expireDateEnabled, setExpireDateEnabled] = useState(false);
  const [expireDate, setExpireDate] = useState("");
  const [slug, setSlug] = useState("");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const router = useRouter();
  const [selectedMedia, setSelectedMedia] = useState<IMedia | undefined>();

  const handleSelectMedia = (media: IMedia) => {
    setFormData((prev) => ({
      ...prev,
      name: media.metadata?.title || media.name,
      mediaId: media.id,
    }));
  };

  const handleChange = (field: keyof typeof initialFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  function validate() {
    const errs: { [key: string]: string } = {};
    if (!formData.name) errs.name = "Name is required";
    if (!formData.mediaId) errs.mediaId = "Content is required";
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
    if (expireDateEnabled && expireDate && new Date(expireDate) < new Date()) {
      errs.expiresAt = "Expire date must be in the future";
    }
    if (formData.access === SmartLinkAccess.PRIVATE) {
      const emails = formData.privateEmailList;
      if (!emails.length)
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
    if (clipStart !== undefined && clipEnd !== undefined) {
      if (clipStart < 0) {
        errs.submit = "Slice start time cannot be negative";
      }
      if (clipEnd <= clipStart) {
        errs.submit = "Slice end time must be after start time";
      }
      if (clipEnd - clipStart < 5) {
        errs.submit = "Slice duration must be at least 5 seconds";
      }
    }
    return errs;
  }

  async function handleSubmit() {
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    const emails =
      formData.access === SmartLinkAccess.PRIVATE
        ? formData.privateEmailList
        : undefined;
    const payload: Partial<ISmartLink> = {
      name: formData.name,
      description: formData.description || undefined,
      mediaId: formData.mediaId,
      access: formData.access as SmartLinkAccess,
      typeOfAccess: formData.typeOfAccess as SmartLinkType,
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
      rentalPrice:
        formData.access === SmartLinkAccess.PAYWALL && formData.rentalPrice
          ? Number(formData.rentalPrice)
          : undefined,
      rentalMaxViews:
        formData.access === SmartLinkAccess.PAYWALL &&
        formData.rentalPrice &&
        formData.rentalMaxViews &&
        formData.rentalMaxViews !== "unlimited"
          ? Number(formData.rentalMaxViews)
          : undefined,
      globalSettingsOverride:
        formData.access === SmartLinkAccess.PAYWALL && formData.rentalPrice
          ? true
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
      clipStart: clipStart,
      clipEnd: clipEnd,
    };

    try {
      const res = await createSmartLinkMutation.mutateAsync(payload);
      if (res) {
        setSlug(res.slug);
        router.push(`/dashboard/smartlinks/${res.id}/edit`);
        toast.success("SmartLink created successfully!");
      }
      onClose();
    } catch (e) {
      toast.error(
        e instanceof AxiosError
          ? e.response?.data.message
          : "Failed to create SmartLink",
      );
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <p className="text-xl font-bold  flex items-center gap-2">
          <span className="inline-flex items-center justify-center w-7 h-7 rounded-md bg-accent text-accent-foreground font-bold text-lg">
            <Plus size={16} />
          </span>
          Create SmartLink
        </p>
      }
      description="Create a SmartLink to share your content with specific access controls"
    >
      <>
        <div className="space-y-4">
          <SearchMediaInput
            onSelectMedia={handleSelectMedia}
            error={errors.mediaId}
            setSelectedMedia={setSelectedMedia}
            selectedMedia={selectedMedia}
            mediaProp={mediaProp}
          />
          <div className="mb-4">
            <InputEnhanced
              label="Name"
              placeholder="Enter name"
              value={formData.name}
              className="w-full"
              onChange={(e) => handleChange("name", e.target.value)}
              error={errors.name}
            />
          </div>

          <div className="mb-4">
            <InputEnhanced
              label="Description"
              placeholder="Enter description (optional)"
              value={formData.description}
              className="w-full"
              onChange={(e) => handleChange("description", e.target.value)}
            />
          </div>
          <div className="flex  gap-2">
            <div className="flex-1 flex flex-col gap-2">
              {/* Max views switch and input */}
              <div className="flex items-center gap-2 justify-between">
                <Label htmlFor="maxViews">Max views</Label>
                <Switch
                  id="maxViews"
                  checked={maxViewsEnabled}
                  onCheckedChange={setMaxViewsEnabled}
                />
              </div>
              {maxViewsEnabled && (
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min="1"
                    value={maxViews}
                    onChange={(e) => setMaxViews(e.target.value)}
                    className="w-full "
                    placeholder="100"
                  />
                </div>
              )}
              {errors.maxViews && (
                <div className="text-red-500 text-xs mt-1">
                  {errors.maxViews}
                </div>
              )}
            </div>
            <div className="flex-1 flex flex-col gap-2 ">
              {/* Expire link switch and date input */}
              <div className="flex items-center gap-2 justify-between">
                <Label htmlFor="expireDate">Expire link</Label>
                <Switch
                  id="expireDate"
                  checked={expireDateEnabled}
                  onCheckedChange={setExpireDateEnabled}
                />
              </div>
              {expireDateEnabled && (
                <div className="flex items-center gap-2">
                  <Input
                    type="date"
                    value={expireDate}
                    onChange={(e) => setExpireDate(e.target.value)}
                    className="w-full"
                  />
                </div>
              )}
              {errors.expiresAt && (
                <div className="text-red-500 text-xs mt-1">
                  {errors.expiresAt}
                </div>
              )}
            </div>
          </div>
          {/* Access Control - Who can access & Type of access in a row */}
          <div className="flex gap-4">
            <div className="flex-1">
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
            <div className="flex-1">
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
          </div>
          {/* Conditional Fields */}
          {formData.access === SmartLinkAccess.SHARED && (
            <div>
              <Label className="mb-2">Data to collect</Label>
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 justify-between">
                  <Label htmlFor="collectEmail">Email address</Label>
                  <Switch
                    id="collectEmail"
                    checked={formData.collectEmail}
                    onCheckedChange={(val) => handleChange("collectEmail", val)}
                  />
                </div>
                <div className="flex items-center gap-2 justify-between">
                  <Label htmlFor="collectName">Name</Label>
                  <Switch
                    id="collectName"
                    checked={formData.collectName}
                    onCheckedChange={(val) => handleChange("collectName", val)}
                  />
                </div>
                <div className="flex items-center gap-2 justify-between">
                  <Label htmlFor="collectPhone">Phone number</Label>
                  <Switch
                    id="collectPhone"
                    checked={formData.collectPhone}
                    onCheckedChange={(val) => handleChange("collectPhone", val)}
                  />
                </div>
              </div>
            </div>
          )}
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
          {formData.access === SmartLinkAccess.PAYWALL && (
            <>
              <div className="flex gap-2">
                <div>
                  <Label className="mb-2">Currency</Label>
                  <Select
                    value={formData.currency}
                    onValueChange={(val) => handleChange("currency", val)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="w-full">
                      {currencyOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.currency && (
                    <div className="text-destructive text-xs mt-1">
                      {errors.currency}
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <Label className="mb-2">Rental Price</Label>
                  <InputEnhanced
                    type="number"
                    placeholder="0.00"
                    value={formData.rentalPrice}
                    error={errors.rentalPrice}
                    onChange={(e) =>
                      handleChange("rentalPrice", e.target.value)
                    }
                  />
                </div>
                <div className="flex-1">
                  <Label className="mb-2">Purchase Price</Label>
                  <InputEnhanced
                    type="number"
                    placeholder="0.00"
                    value={formData.price}
                    error={errors.price}
                    onChange={(e) => handleChange("price", e.target.value)}
                  />
                </div>
              </div>
              {formData.rentalPrice && (
                <div>
                  <Label className="mb-2">Rental Max Views</Label>
                  <Select
                    value={formData.rentalMaxViews}
                    onValueChange={(val) => handleChange("rentalMaxViews", val)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select max views" />
                    </SelectTrigger>
                    <SelectContent className="w-full">
                      <SelectItem value="unlimited">Unlimited</SelectItem>
                      <SelectItem value="1">1 View</SelectItem>
                      <SelectItem value="3">3 Views</SelectItem>
                      <SelectItem value="5">5 Views</SelectItem>
                      <SelectItem value="10">10 Views</SelectItem>
                      <SelectItem value="25">25 Views</SelectItem>
                      <SelectItem value="50">50 Views</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </>
          )}
          {/* Stripe onboarding warning for paywall */}
          {formData.access === SmartLinkAccess.PAYWALL &&
            !userLoading &&
            user &&
            company?.stripeOnboarding === false && (
              <div className="text-destructive text-sm mt-2">
                Complete stripe onboarding to create paywalled smartlinks,{" "}
                <Link
                  href="/auth/signup/stripe"
                  className="underline text-accent"
                >
                  Complete onboarding
                </Link>
              </div>
            )}

          <div className="pt-2">
            {errors.submit && (
              <div className="text-destructive mb-2">{errors.submit}</div>
            )}
            <Button
              className="w-full"
              disabled={
                createSmartLinkMutation.isPending ||
                (formData.access === SmartLinkAccess.PAYWALL &&
                  !userLoading &&
                  user &&
                  company?.stripeOnboarding === false)
              }
              onClick={handleSubmit}
            >
              {createSmartLinkMutation.isPending
                ? "Creating..."
                : "Create SmartLink"}
            </Button>
          </div>
        </div>
      </>
    </Modal>
  );
};

export default SmartLinkModal;
