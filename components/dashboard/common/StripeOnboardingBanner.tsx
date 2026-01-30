"use client";

import { Button } from "@/components/ui/button";
import { useCompany } from "@/hooks/useCompanies";
import { useDla } from "@/contexts/dla";
import { useUser } from "@/hooks/useUser";
import { useEffectiveRole } from "@/hooks/useUserRole";
import { hasPermission } from "@/lib/permissions";
import { X, CreditCard } from "lucide-react";
import { useState, useEffect } from "react";
import { getFromLocalStorage, saveToLocalStorage } from "@/lib/utils";

export function StripeOnboardingBanner() {
  const { data: company, isLoading: isCompanyLoading } = useCompany();
  const { data: user, isLoading: isUserLoading } = useUser();
  const effectiveRole = useEffectiveRole();
  const { CompanyService } = useDla();
  const [isDismissed, setIsDismissed] = useState(false);
  const [isGeneratingLink, setIsGeneratingLink] = useState(false);

  // Check if user has monetization permission
  const hasMonetizationPermission =
    effectiveRole &&
    hasPermission(effectiveRole, "monetization:*", user || undefined);

  useEffect(() => {
    if (!company?.id) return;

    const dismissedKey = `stripe-onboarding-banner-dismissed-${company.id}`;
    const dismissed = getFromLocalStorage<boolean>(dismissedKey);

    if (company.stripeOnboarding === true) {
      if (dismissed) {
        localStorage.removeItem(dismissedKey);
      }
      setIsDismissed(false);
    } else {
      setIsDismissed(dismissed === true);
    }
  }, [company?.id, company?.stripeOnboarding]);

  if (
    isCompanyLoading ||
    isUserLoading ||
    isDismissed ||
    company?.stripeOnboarding === true ||
    !company ||
    !hasMonetizationPermission
  ) {
    return null;
  }

  const handleCompleteOnboarding = async () => {
    if (!company?.id) return;

    setIsGeneratingLink(true);
    try {
      const data = await CompanyService.createOnboardingLink(company.id);
      window.open(data.url, "_blank");
    } catch (error) {
      console.error("Failed to create onboarding link:", error);
    } finally {
      setIsGeneratingLink(false);
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    if (company?.id) {
      const dismissedKey = `stripe-onboarding-banner-dismissed-${company.id}`;
      saveToLocalStorage(dismissedKey, true);
    }
  };

  return (
    <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 flex  justify-between gap-4 flex-col lg:flex-row">
      <div className="flex items-start gap-3 flex-1">
        <CreditCard className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-white mb-1">
            Complete Stripe Onboarding
          </h3>
          <p className="text-sm text-white/70">
            You need to complete onboarding in Stripe to take card payments and
            receive revenue from Hiway.
          </p>
        </div>
      </div>
      <Button
        size="sm"
        onClick={handleCompleteOnboarding}
        disabled={isGeneratingLink}
      >
        {isGeneratingLink ? "Loading..." : "Complete Onboarding"}
      </Button>
      {/* <div className="flex items-center gap-2 shrink-0"> */}
      {/* <Button
          variant="ghost"
          size="icon"
          onClick={handleDismiss}
          className="h-8 w-8"
        >
          <X className="w-4 h-4" />
        </Button> */}
      {/* </div> */}
    </div>
  );
}
