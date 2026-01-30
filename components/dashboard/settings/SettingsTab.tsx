import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import InputEnhanced from "@/components/ui/input-enhanced";
import { TabsContent } from "@/components/ui/tabs";
import { useUpload } from "@/contexts/upload";
import { useCompany, useUpdateCompany } from "@/hooks/useCompanies";
import {
  cn,
  getErrorMessage,
  handleFileSelection,
  valueToLabel,
} from "@/lib/utils";
import { CompanyType, ICompany } from "@/types";
import { Building2, Loader2 } from "lucide-react";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";

interface SettingsTabProps {
  canEdit?: boolean;
}

const SettingsTab = ({ canEdit = true }: SettingsTabProps) => {
  const [formData, setFormData] = useState<Partial<ICompany>>({
    name: "",
    type: CompanyType.PRODUCTION_COMPANY,
    email: "",
    phone: "",
    address: "",
    website: "",
    logo: "",
    description: "",
  });
  const { uploadS3 } = useUpload();

  const [image, setImage] = useState<File | null>(null);
  const { data: company, refetch: refetchCompany } = useCompany();
  const [imageErrors, setImageErrors] = useState<string | string[]>([]);
  const { mutate: updateCompany, isPending: isUpdating } = useUpdateCompany();
  useEffect(() => {
    if (company) {
      setFormData(company);
    }
  }, [company]);

  const handleChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSave = async () => {
    if (!company?.id) return;
    const data: Partial<ICompany> = {
      ...formData,
    };
    if (image) {
      const url = await uploadS3(image);
      if (url) {
        data.logo = url;
      }
    }
    updateCompany(
      {
        id: company.id,
        ...data,
      },
      {
        onSuccess: () => {
          refetchCompany();
          setImageErrors([]);
          toast.success("Business information updated successfully");
        },
        onError: (error) => {
          toast.error(getErrorMessage(error));
        },
      }
    );
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    handleFileSelection({
      files,
      allowedFormats: [".png", ".jpg", ".jpeg"],
      maxSize: 1024 * 1024 * 2, // 2MB
      onSuccess: (files) => {
        setImage(files[0]);
        setImageErrors([]);
      },
      onError: (error) => setImageErrors(error),
    });
  };

  return (
    <TabsContent value="settings" className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <span className="inline-flex items-center gap-2">
              <Building2 className="w-5 h-5 " /> Business Information
            </span>
            {/* <Badge variant="warning">
              <AlertCircle className="w-4 h-4" />
              Unverified
            </Badge> */}
          </CardTitle>
          <CardDescription className="text-muted-foreground text-sm mt-1">
            {canEdit
              ? "Update your business details and settings"
              : "View your business details and settings (read-only)"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-6 mb-6">
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center text-3xl font-bold text-white overflow-hidden">
              {company?.logo || image ? (
                <Image
                  src={
                    image
                      ? URL.createObjectURL(image)
                      : company?.logo || "/images/default.png"
                  }
                  alt="Profile"
                  width={80}
                  height={80}
                  className="rounded-full object-cover size-full"
                />
              ) : (
                <>
                  {company?.name?.charAt(0)}
                  {company?.name?.charAt(1)}
                </>
              )}
            </div>
            {canEdit && (
              <div>
                <label
                  htmlFor="image-input"
                  className={cn(
                    buttonVariants({ variant: "secondary" }),
                    "mb-1",
                    "cursor-pointer"
                  )}
                >
                  Change Photo
                </label>
                <input
                  id="image-input"
                  type="file"
                  className="hidden"
                  onChange={handleImageChange}
                  accept="image/*"
                  disabled={!canEdit}
                />
                <div className="text-xs text-muted-foreground">
                  JPG, PNG or JPEG. Max size 2MB.
                </div>
                {imageErrors && (
                  <div className="text-xs text-red-500">
                    {Array.isArray(imageErrors)
                      ? imageErrors.join(", ")
                      : imageErrors}
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
            <InputEnhanced
              label="Business Name"
              placeholder="Business Name"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              disabled={!canEdit}
            />
            <InputEnhanced
              label="Business Type"
              placeholder="Select Business Type"
              onSelectChange={(value) => handleChange("type", value)}
              select
              value={formData.type}
              options={Object.values(CompanyType).map((type) => ({
                label: valueToLabel(type),
                value: type,
              }))}
              disabled={!canEdit}
            />

            <InputEnhanced
              label="Business Email"
              placeholder="Business Email"
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
              disabled={!canEdit}
            />
            <InputEnhanced
              label="Business Phone"
              placeholder="Business Phone"
              value={formData.phone}
              onChange={(e) => handleChange("phone", e.target.value)}
              disabled={!canEdit}
            />
            <InputEnhanced
              label="Business Website"
              placeholder="Business Website"
              value={formData.website}
              onChange={(e) => handleChange("website", e.target.value)}
              disabled={!canEdit}
            />
            <InputEnhanced
              label="Business Address"
              placeholder="Business Address"
              value={formData.address}
              onChange={(e) => handleChange("address", e.target.value)}
              disabled={!canEdit}
            />
          </div>
          <InputEnhanced
            label="Business Description"
            placeholder="Business Description"
            value={formData.description}
            onChange={(e) => handleChange("description", e.target.value)}
            textarea
            disabled={!canEdit}
          />
          {canEdit && (
            <div className="flex gap-2 mt-4">
              <Button
                variant="default"
                onClick={handleSave}
                disabled={isUpdating}
              >
                {isUpdating ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : null}
                Save Business Information
              </Button>
              {/* <Button variant="outline">Get Verified</Button> */}
            </div>
          )}
        </CardContent>
      </Card>
      {/* User Management Card */}
      {/* <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <span className="inline-flex items-center gap-2">
              <svg
                width="22"
                height="22"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path d="M17 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
              User Management
            </span>
          </CardTitle>
          <p className="text-muted-foreground text-sm mt-1">
            Manage team members and their access permissions
          </p>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-2">
              <div>
                <div className="font-semibold">Team Members (4)</div>
                <div className="text-muted-foreground text-sm">
                  Manage who has access to your business account
                </div>
              </div>
              <div className="flex gap-2 items-center mt-2 md:mt-0">
                <span className="bg-muted px-3 py-1 rounded-full text-xs font-semibold">
                  4/5 seats used
                </span>
                <Button variant="outline">Upgrade Account</Button>
                <Button className="bg-accent text-black flex items-center gap-2">
                  <Plus className="w-4 h-4" /> Add User
                </Button>
              </div>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between bg-muted/40 rounded-lg p-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-lg font-bold text-white">
                  SJ
                </div>
                <div>
                  <div className="font-semibold">Sarah Johnson</div>
                  <div className="text-sm text-muted-foreground">
                    sarah@hiway.com
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Last login: 1 day ago
                  </div>
                </div>
              </div>
              <div className="flex gap-2 items-center">
                <span className="bg-muted/60 text-xs px-3 py-1 rounded-full border border-muted-foreground/20 text-blue-300">
                  Standard
                </span>
                <span className="bg-accent text-xs px-3 py-1 rounded-full text-black">
                  active
                </span>
                <button className="ml-2 text-muted-foreground hover:text-red-500">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card> */}
      {/* Security & Preferences Card */}
      {/* <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <span className="inline-flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Security & Preferences
            </span>
          </CardTitle>
          <p className="text-muted-foreground text-sm mt-1">
            Configure security settings for your business account
          </p>
        </CardHeader>
        <CardContent>
          <div className="divide-y divide-muted-foreground/10">
            <div className="flex items-center justify-between py-4">
              <div>
                <div className="font-semibold">Two-Factor Authentication</div>
                <div className="text-muted-foreground text-sm">
                  Require 2FA for all admin users
                </div>
              </div>
              <div>
                <Switch checked disabled />
              </div>
            </div>
            <div className="flex items-center justify-between py-4">
              <div>
                <div className="font-semibold">Auto Logout</div>
                <div className="text-muted-foreground text-sm">
                  Automatically log out inactive users
                </div>
              </div>
              <div>
                <Switch checked disabled />
              </div>
            </div>
            <div className="flex items-center justify-between py-4">
              <div>
                <div className="font-semibold">Audit Logging</div>
                <div className="text-muted-foreground text-sm">
                  Track user actions and changes
                </div>
              </div>
              <div>
                <Switch checked disabled />
              </div>
            </div>
          </div>
        </CardContent>
      </Card> */}
    </TabsContent>
  );
};

export default SettingsTab;
