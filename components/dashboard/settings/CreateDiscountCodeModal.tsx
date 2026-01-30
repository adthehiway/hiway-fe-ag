"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { X } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import InputEnhanced from "@/components/ui/input-enhanced";
import { useCreateCoupon } from "@/hooks/useMonetization";
import {
  DiscountType,
  AppliesToType,
  CreateCouponDto,
  ISmartLink,
  ISmartRoom,
} from "@/types";
import SearchProductInput from "@/components/dashboard/common/SearchProductInput";

interface CreateDiscountCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateDiscountCodeModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateDiscountCodeModalProps) {
  const createCouponMutation = useCreateCoupon();
  const [productType, setProductType] = useState<"smartlink" | "smartroom">(
    "smartlink"
  );

  const [formData, setFormData] = useState({
    discountCode: "",
    name: "",
    description: "",
    discountType: DiscountType.PERCENTAGE,
    percentageOff: "",
    amountOff: "",
    currency: "USD",
    appliesTo: AppliesToType.ALL,
    productType: "smartlink" as "smartlink" | "smartroom",
    selectedProduct: "",
    maxRedemptions: "",
    maxViewsPerUse: "",
    expirationDate: "",
    active: true,
  });

  useEffect(() => {
    if (!isOpen) {
      setFormData({
        discountCode: "",
        name: "",
        description: "",
        discountType: DiscountType.PERCENTAGE,
        percentageOff: "",
        amountOff: "",
        currency: "USD",
        appliesTo: AppliesToType.ALL,
        productType: "smartlink",
        selectedProduct: "",
        maxRedemptions: "",
        maxViewsPerUse: "",
        expirationDate: "",
        active: true,
      });
      setProductType("smartlink");
    }
  }, [isOpen]);

  const handleSelectProduct = (
    productId: string,
    product: ISmartLink | ISmartRoom
  ) => {
    handleChange("selectedProduct", productId);
  };

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (field === "appliesTo" && value === AppliesToType.ALL) {
      setFormData((prev) => ({
        ...prev,
        selectedProduct: "",
      }));
    }
  };

  const handleSubmit = async () => {
    if (!formData.discountCode || !formData.name) {
      return;
    }

    if (
      formData.discountType === DiscountType.PERCENTAGE &&
      !formData.percentageOff
    ) {
      return;
    }

    if (
      formData.discountType === DiscountType.FIXED_AMOUNT &&
      !formData.amountOff
    ) {
      return;
    }

    if (
      formData.appliesTo === AppliesToType.SPECIFIC_PRODUCT &&
      !formData.selectedProduct
    ) {
      return;
    }

    const payload: CreateCouponDto = {
      code: formData.discountCode.toUpperCase(),
      name: formData.name,
      description: formData.description || undefined,
      discountType: formData.discountType,
      appliesTo: formData.appliesTo,
      isActive: formData.active,
    };

    if (formData.discountType === DiscountType.PERCENTAGE) {
      payload.percentOff = parseFloat(formData.percentageOff);
    } else {
      payload.amountOff = Math.round(parseFloat(formData.amountOff) * 100);
      payload.currency = formData.currency;
    }

    if (formData.appliesTo === AppliesToType.SPECIFIC_PRODUCT) {
      if (productType === "smartlink") {
        payload.smartLinkId = formData.selectedProduct;
      } else {
        payload.smartRoomId = formData.selectedProduct;
      }
    }

    if (formData.maxRedemptions && formData.maxRedemptions.trim() !== "") {
      payload.maxRedemptions = parseInt(formData.maxRedemptions);
    }

    if (formData.maxViewsPerUse && formData.maxViewsPerUse.trim() !== "") {
      payload.maxViewsPerUse = parseInt(formData.maxViewsPerUse);
    }

    if (formData.expirationDate) {
      const date = new Date(formData.expirationDate);
      date.setHours(23, 59, 59, 999);
      payload.expiresAt = date.toISOString();
    }

    try {
      await createCouponMutation.mutateAsync(payload);
      onSuccess();
    } catch (error) {
      // Error is handled by the mutation hook
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle className="text-2xl">
                Create Discount Code
              </DialogTitle>
              <DialogDescription className="mt-2">
                Create a new discount code for your products. Fill in the
                details below.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputEnhanced
              label="Discount Code *"
              value={formData.discountCode}
              onChange={(e) => handleChange("discountCode", e.target.value)}
              placeholder="e.g., SUMMER25"
            />
            <InputEnhanced
              label="Name *"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              placeholder="e.g., Summer Sale 25% Off"
            />
          </div>

          <InputEnhanced
            label="Description"
            value={formData.description}
            onChange={(e) => handleChange("description", e.target.value)}
            placeholder="Special discount for summer campaign"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputEnhanced
              label="Discount Type"
              select
              value={formData.discountType}
              onSelectChange={(value) =>
                handleChange("discountType", value as DiscountType)
              }
              options={[
                { label: "Percentage (%)", value: DiscountType.PERCENTAGE },
                { label: "Fixed Amount", value: DiscountType.FIXED_AMOUNT },
              ]}
            />

            {formData.discountType === DiscountType.PERCENTAGE && (
              <InputEnhanced
                label="Percentage Off"
                type="number"
                min="1"
                max="100"
                value={formData.percentageOff}
                onChange={(e) => handleChange("percentageOff", e.target.value)}
                placeholder="10"
                iconRight={<span className="text-muted-foreground">%</span>}
              />
            )}

            {formData.discountType === DiscountType.FIXED_AMOUNT && (
              <InputEnhanced
                label="Fixed Amount Off"
                type="number"
                min="0"
                step="0.01"
                value={formData.amountOff}
                onChange={(e) => handleChange("amountOff", e.target.value)}
                placeholder="5.00"
              />
            )}
          </div>

          <InputEnhanced
            label="Applies To"
            select
            value={formData.appliesTo}
            onSelectChange={(value) =>
              handleChange("appliesTo", value as AppliesToType)
            }
            options={[
              { label: "All Products", value: AppliesToType.ALL },
              {
                label: "Specific Product",
                value: AppliesToType.SPECIFIC_PRODUCT,
              },
            ]}
          />

          {formData.appliesTo === AppliesToType.SPECIFIC_PRODUCT && (
            <>
              <InputEnhanced
                label="Product Type"
                select
                value={productType}
                onSelectChange={(value) => {
                  setProductType(value as "smartlink" | "smartroom");
                  handleChange("selectedProduct", "");
                }}
                options={[
                  { label: "SmartLink", value: "smartlink" },
                  { label: "SmartRoom", value: "smartroom" },
                ]}
              />
              <SearchProductInput
                productType={productType}
                selectedProductId={formData.selectedProduct}
                onSelectProduct={handleSelectProduct}
                label="Select Product"
                placeholder={`Search ${
                  productType === "smartlink" ? "SmartLinks" : "SmartRooms"
                }...`}
              />
            </>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputEnhanced
              label="Max Redemptions"
              type="number"
              min="1"
              value={formData.maxRedemptions}
              onChange={(e) => handleChange("maxRedemptions", e.target.value)}
              placeholder="Unlimited"
            />

            <InputEnhanced
              label="Max Views Per Use"
              type="number"
              min="1"
              value={formData.maxViewsPerUse}
              onChange={(e) => handleChange("maxViewsPerUse", e.target.value)}
              placeholder="Unlimited"
            />
          </div>

          <InputEnhanced
            label="Expiration Date"
            type="date"
            value={formData.expirationDate}
            onChange={(e) => handleChange("expirationDate", e.target.value)}
            placeholder="dd/mm/yyyy"
          />

          <div className="flex items-center justify-between">
            <label htmlFor="active" className="text-sm font-medium">
              Active
            </label>
            <Switch
              id="active"
              checked={formData.active}
              onCheckedChange={(checked) => handleChange("active", checked)}
              className="data-[state=checked]:bg-accent"
            />
          </div>

          <div className="flex gap-2 justify-end pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={createCouponMutation.isPending}
              className="bg-accent hover:bg-accent/90"
            >
              {createCouponMutation.isPending ? "Creating..." : "Create Code"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
