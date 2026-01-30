import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import {
  ISmartRoom,
  SmartLinkAccess,
  SmartLinkType,
} from "@/types";
import { useRouter } from "next/navigation";
import { useCreateSmartRoom } from "@/hooks/useSmartRooms";
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

interface SmartRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const initialFormData = {
  name: "",
  description: "",
  access: SmartLinkAccess.PUBLIC,
  typeOfAccess: SmartLinkType.VIEW,
  privateEmailList: [],
  price: "",
  currency: currencyOptions[0].value,
  collectEmail: false,
  collectName: false,
  collectPhone: false,
};

const SmartRoomModal: React.FC<SmartRoomModalProps> = ({
  isOpen,
  onClose,
}) => {
  const createSmartRoomMutation = useCreateSmartRoom();
  const { data: user, isLoading: userLoading } = useUser();
  const { data: company, isLoading: companyLoading } = useCompany();
  const [formData, setFormData] = useState(initialFormData);
  const [maxViewsEnabled, setMaxViewsEnabled] = useState(false);
  const [maxViews, setMaxViews] = useState("");
  const [expireDateEnabled, setExpireDateEnabled] = useState(false);
  const [expireDate, setExpireDate] = useState("");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const router = useRouter();

  const handleChange = (field: keyof typeof initialFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
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
    const payload: Partial<ISmartRoom> = {
      name: formData.name,
      description: formData.description,
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
      currency:
        formData.access === SmartLinkAccess.PAYWALL
          ? formData.currency
          : undefined,
      maxViews: maxViewsEnabled ? Number(maxViews) : undefined,
      expiresAt:
        expireDateEnabled && expireDate
          ? new Date(expireDate).toISOString()
          : undefined,
      // Media can be added later in the edit page
      mediaIds: [],
    };

    try {
      const res = await createSmartRoomMutation.mutateAsync(payload);
      if (res) {
        router.push(`/dashboard/smartrooms/${res.id}/edit`);
        toast.success("Smart Room created successfully!");
      }
      onClose();
    } catch (e) {
      toast.error(
        e instanceof AxiosError
          ? e.response?.data.message
          : "Failed to create Smart Room"
      );
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <p className="text-xl font-bold flex items-center gap-2">
          <span className="inline-flex items-center justify-center w-7 h-7 rounded-md bg-accent text-accent-foreground font-bold text-lg">
            <Plus size={16} />
          </span>
          Create Smart Room
        </p>
      }
      description="Create a Smart Room. You can add media items after creation."
    >
      <>
        <div className="space-y-4">
          <div className="mb-4">
            <InputEnhanced
              label="Name"
              placeholder="Enter room name"
              value={formData.name}
              className="w-full"
              onChange={(e) => handleChange("name", e.target.value)}
              error={errors.name}
            />
          </div>

          <div className="mb-4">
            <InputEnhanced
              label="Description"
              placeholder="Enter room description (optional)"
              value={formData.description}
              className="w-full"
              onChange={(e) => handleChange("description", e.target.value)}
            />
          </div>

          <div className="flex gap-2">
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
                    className="w-full"
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
            <div className="flex-1 flex flex-col gap-2">
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
          {formData.access === SmartLinkAccess.PAYWALL && (
            <div className="flex gap-2 items-end">
              <div>
                <Label className="mb-2">Price</Label>
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
              <div className="w-full">
                <InputEnhanced
                  type="number"
                  placeholder="0.00"
                  value={formData.price}
                  error={errors.price}
                  onChange={(e) => handleChange("price", e.target.value)}
                />
              </div>
            </div>
          )}
          {/* Stripe onboarding warning for paywall */}
          {formData.access === SmartLinkAccess.PAYWALL &&
            !userLoading &&
            user &&
            company?.stripeOnboarding === false && (
              <div className="text-destructive text-sm mt-2">
                Complete stripe onboarding to create paywalled smart rooms,{" "}
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
                createSmartRoomMutation.isPending ||
                (formData.access === SmartLinkAccess.PAYWALL &&
                  !userLoading &&
                  user &&
                  company?.stripeOnboarding === false)
              }
              onClick={handleSubmit}
            >
              {createSmartRoomMutation.isPending
                ? "Creating..."
                : "Create Smart Room"}
            </Button>
          </div>
        </div>
      </>
    </Modal>
  );
};

export default SmartRoomModal;

