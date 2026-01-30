"use client";

import { useState, useMemo, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  IPackage,
  IPackageGrouped,
  PackageType,
  BillingType,
  Feature,
  IFeatureUsage,
} from "@/types";
import { getFeatureValue, formatBytes, getErrorMessage } from "@/lib/utils";
// @ts-expect-error - Package is not typed
import { getCurrencySymbol } from "@brixtol/currency-symbols";
import {
  AlertCircle,
  Check,
  Loader2,
  ArrowUp,
  ArrowDown,
  Mail,
} from "lucide-react";
import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import PackageService from "@/services/packages";
import BillingService from "@/services/billing";
import { toast } from "react-toastify";

interface PlanSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPackageId?: string | null;
  storageUsage?: {
    videoStorage?: IFeatureUsage;
    assetStorage?: IFeatureUsage;
  };
}

export function PlanSelectionModal({
  isOpen,
  onClose,
  currentPackageId,
  storageUsage,
}: PlanSelectionModalProps) {
  const [billingType, setBillingType] = useState<BillingType>(
    BillingType.MONTHLY
  );
  const [selectedPackage, setSelectedPackage] = useState<IPackage | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const queryClient = useQueryClient();

  const { data: packages, isLoading } = useQuery({
    queryKey: ["packages"],
    queryFn: () => PackageService.getAll(),
    enabled: isOpen,
  });

  const currentPlan = useMemo<IPackage | null>(() => {
    if (!packages || !currentPackageId) return null;

    let foundPackage: IPackage | null = null;
    Object.values(packages).forEach((packageList: IPackage[]) => {
      const pkg = packageList.find((p) => p.id === currentPackageId);
      if (pkg) {
        foundPackage = pkg;
      }
    });

    return foundPackage;
  }, [packages, currentPackageId]);

  // Update billing type when current plan changes
  useEffect(() => {
    if (currentPlan?.billingType) {
      setBillingType(currentPlan.billingType);
    }
  }, [currentPlan?.billingType]);

  // Get all available packages for the selected billing type
  const availablePackages = useMemo(() => {
    if (!packages) return [];
    const allPackages: IPackage[] = [];
    Object.values(packages).forEach((packageList: IPackage[]) => {
      packageList.forEach((pkg) => {
        if (pkg.billingType === billingType) {
          allPackages.push(pkg);
        }
      });
    });
    return allPackages.sort((a, b) => {
      const order = [PackageType.LITE, PackageType.CORE, PackageType.ADVANCED];
      return order.indexOf(a.type) - order.indexOf(b.type);
    });
  }, [packages, billingType]);

  // Check if downgrading and validate storage
  const canDowngrade = useMemo(() => {
    if (!selectedPackage || !currentPlan?.type || !storageUsage) return true;

    const currentTypeOrder = [
      PackageType.LITE,
      PackageType.CORE,
      PackageType.ADVANCED,
    ];
    const currentIndex = currentTypeOrder.indexOf(currentPlan.type);
    const selectedIndex = currentTypeOrder.indexOf(selectedPackage.type);

    // If upgrading or same tier, allow
    if (selectedIndex >= currentIndex) return true;

    // If downgrading, check storage limits
    const videoStorageLimit = selectedPackage.features.find(
      (f) => f.feature === Feature.VIDEO_STORAGE
    )?.value;
    const assetStorageLimit = selectedPackage.features.find(
      (f) => f.feature === Feature.ASSET_STORAGE
    )?.value;

    const videoStorageUsed = storageUsage.videoStorage?.used || 0;
    const assetStorageUsed = storageUsage.assetStorage?.used || 0;

    if (videoStorageLimit && videoStorageUsed > videoStorageLimit) {
      return false;
    }
    if (assetStorageLimit && assetStorageUsed > assetStorageLimit) {
      return false;
    }

    return true;
  }, [selectedPackage, currentPlan, storageUsage]);

  const storageErrors = useMemo(() => {
    if (!selectedPackage || !storageUsage || canDowngrade) return [];

    const errors: string[] = [];
    const videoStorageLimit = selectedPackage.features.find(
      (f) => f.feature === Feature.VIDEO_STORAGE
    )?.value;
    const assetStorageLimit = selectedPackage.features.find(
      (f) => f.feature === Feature.ASSET_STORAGE
    )?.value;

    const videoStorageUsed = storageUsage.videoStorage?.used || 0;
    const assetStorageUsed = storageUsage.assetStorage?.used || 0;

    if (videoStorageLimit && videoStorageUsed > videoStorageLimit) {
      errors.push(
        `Video storage (${formatBytes(videoStorageUsed)}) exceeds the ${
          selectedPackage.name
        } limit (${formatBytes(
          videoStorageLimit
        )}). Please delete content before downgrading.`
      );
    }
    if (assetStorageLimit && assetStorageUsed > assetStorageLimit) {
      errors.push(
        `Asset storage (${formatBytes(assetStorageUsed)}) exceeds the ${
          selectedPackage.name
        } limit (${formatBytes(
          assetStorageLimit
        )}). Please delete content before downgrading.`
      );
    }

    return errors;
  }, [selectedPackage, storageUsage, canDowngrade]);

  const handlePlanSelect = async () => {
    if (!selectedPackage) return;

    setIsProcessing(true);
    try {
      // Check if only billing type is changing
      const isOnlyBillingTypeChange =
        currentPlan?.type === selectedPackage.type &&
        currentPlan?.billingType !== selectedPackage.billingType;

      if (isOnlyBillingTypeChange) {
        const { message } = await BillingService.switchBillingType(
          selectedPackage.billingType
        );
        toast.success(message);
      } else {
        const { message } = await BillingService.changePlan(selectedPackage.id);
        toast.success(message);
      }
      // Invalidate queries to refetch plan data
      queryClient.invalidateQueries({ queryKey: ["billing-plan"] });
      queryClient.invalidateQueries({ queryKey: ["billing-storage-usage"] });
      // Close modal after success
      onClose();
    } catch (error: any) {
      toast.error(getErrorMessage(error, "Failed to change plan"));
    } finally {
      setIsProcessing(false);
    }
  };

  const isCurrentPlan = (pkg: IPackage) => {
    return (
      currentPlan?.id === pkg.id ||
      (currentPlan?.type === pkg.type &&
        currentPlan?.billingType === pkg.billingType)
    );
  };

  const isUpgrade = (pkg: IPackage) => {
    if (!currentPlan?.type) return false;
    const order = [PackageType.LITE, PackageType.CORE, PackageType.ADVANCED];
    const currentIndex = order.indexOf(currentPlan.type);
    const selectedIndex = order.indexOf(pkg.type);
    return selectedIndex > currentIndex;
  };

  const isDowngrade = (pkg: IPackage) => {
    if (!currentPlan?.type) return false;
    const order = [PackageType.LITE, PackageType.CORE, PackageType.ADVANCED];
    const currentIndex = order.indexOf(currentPlan.type);
    const selectedIndex = order.indexOf(pkg.type);
    return selectedIndex < currentIndex;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl! max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Change Plan</DialogTitle>
          <DialogDescription>
            Select a new plan or switch between monthly and annual billing
          </DialogDescription>
        </DialogHeader>

        {/* Billing Type Toggle */}
        <div className="flex items-center justify-center gap-4 p-4 bg-muted/40 rounded-lg">
          <Button
            variant={
              billingType === BillingType.MONTHLY ? "default" : "outline"
            }
            onClick={() => setBillingType(BillingType.MONTHLY)}
            className="flex-1"
          >
            Monthly
          </Button>
          <Button
            variant={billingType === BillingType.ANNUAL ? "default" : "outline"}
            onClick={() => setBillingType(BillingType.ANNUAL)}
            className="flex-1"
          >
            Annual
          </Button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            {availablePackages.map((pkg) => {
              const isCurrent = isCurrentPlan(pkg);
              const isSelected = selectedPackage?.id === pkg.id;
              const upgrade = isUpgrade(pkg);
              const downgrade = isDowngrade(pkg);

              return (
                <div
                  key={pkg.id}
                  className={`relative border-2 rounded-lg p-6 cursor-pointer transition-all ${
                    isCurrent
                      ? "border-accent bg-accent/10"
                      : isSelected
                      ? "border-accent bg-muted/60"
                      : "border-muted-foreground/20 bg-muted/40 hover:border-muted-foreground/40"
                  }`}
                  onClick={() => setSelectedPackage(pkg)}
                >
                  {isCurrent && (
                    <div className="absolute top-2 right-2 bg-accent text-black px-2 py-1 rounded text-xs font-semibold">
                      Current
                    </div>
                  )}
                  {(upgrade || downgrade) && (
                    <div className="absolute top-2 left-2 flex items-center gap-1 text-xs font-semibold">
                      {upgrade ? (
                        <>
                          <ArrowUp className="w-3 h-3 text-green-500" />
                          <span className="text-green-500">Upgrade</span>
                        </>
                      ) : (
                        <>
                          <ArrowDown className="w-3 h-3 text-yellow-500" />
                          <span className="text-yellow-500">Downgrade</span>
                        </>
                      )}
                    </div>
                  )}

                  <div className="mt-6">
                    <h3 className="text-xl font-bold mb-2">{pkg.name}</h3>
                    <p className="text-muted-foreground text-sm mb-4">
                      {pkg.description}
                    </p>
                    <div className="text-3xl font-bold mb-1">
                      {getCurrencySymbol(pkg.currency || "USD")}
                      {pkg.price}
                    </div>
                    <div className="text-muted-foreground text-sm mb-4">
                      per{" "}
                      {pkg.billingType === BillingType.MONTHLY
                        ? "month"
                        : "year"}
                    </div>

                    <div className="space-y-2 mt-4">
                      {pkg.features.map((feature, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-2 text-sm"
                        >
                          <Check className="w-4 h-4 text-accent flex-shrink-0" />
                          <span>
                            {getFeatureValue(feature.feature, feature.value)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-4 border-2 rounded-lg p-4 bg-gradient-to-br from-accent/5 to-accent/10 border-accent/30">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-lg font-bold">Enterprise</h3>
                <span className="bg-accent text-black px-2 py-0.5 rounded text-xs font-semibold">
                  Custom
                </span>
              </div>
              <p className="text-muted-foreground text-xs mb-2">
                Need a customized solution? Our Enterprise plan offers tailored
                features, dedicated support, and flexible pricing to meet your
                specific requirements.
              </p>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2">
                <div className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-accent flex-shrink-0" />
                  <span className="text-xs">Custom storage limits</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-accent flex-shrink-0" />
                  <span className="text-xs">Custom streamig limits</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-accent flex-shrink-0" />
                  <span className="text-xs">Dedicated support</span>
                </div>
              </div>
            </div>
            <div className="flex-shrink-0">
              <Button
                className="bg-accent text-black hover:bg-accent/90"
                asChild
              >
                <Link href="https://www.onthehiway.com/contact" target="_blank">
                  <Mail className="w-4 h-4 mr-2" />
                  Contact Us
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {storageErrors.length > 0 && (
          <div className="mt-4 p-4 bg-destructive/10 border border-destructive/50 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-destructive flex-shrink-0 mt-0.5" />
              <div className="space-y-1 text-sm text-destructive">
                {storageErrors.map((error, index) => (
                  <div key={index}>{error}</div>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-end gap-2 mt-6">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handlePlanSelect}
            disabled={!selectedPackage || isProcessing || !canDowngrade}
            className="bg-accent text-black"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              "Change Plan"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
