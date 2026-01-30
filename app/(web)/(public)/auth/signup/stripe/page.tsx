"use client";

import { BoxWidget } from "@/components/auth/box.widget";
import { ProfileWidget } from "@/components/auth/profile.widget";
import { Button } from "@/components/ui/button";
import { Loader } from "@/components/ui/loader";
import { useDla } from "@/contexts/dla";
import { useCompany } from "@/hooks/useCompanies";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function CompanyStripePage() {
  const { data: company } = useCompany();
  const [showError, setShowError] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { CompanyService } = useDla();

  function generateStripeLink() {
    setLoading(true);

    CompanyService.createOnboardingLink(company?.id ?? "")
      .then((data: { url: string }) => {
        window.open(data.url, "_blank");
        router.push("/dashboard", { scroll: false });
      })
      .catch(() => setShowError(true));
  }

  return (
    <>
      {/* {showError && (
				<ErrorModelWidget
					isOpen={showError}
					handleAction={() => router.push('/dashboard', { scroll: false })}
					handleClose={() => router.push('/dashboard', { scroll: false })}
					action="Try again later"
					description="Sorry, there was an error creating your account."
				/>
			)} */}

      {loading && (
        <div className="relative w-full h-full">
          <Loader backdrop={false} />
        </div>
      )}

      {!loading && (
        <BoxWidget title="Stripe account">
          <div className="p-2" />
          <div className="text-white-100">
            A Stripe account is required to publish paid content and receive
            revenue from Hiway. Please follow the steps on the Stripe website
            and once it’s finished, you’ll be redirected to Hiway.
          </div>
          <div className="p-2" />
          <Button className="w-full" onClick={generateStripeLink}>
            Connect Stripe
          </Button>
          <div className="p-2" />
          <Button
            variant="secondary"
            className="w-full"
            onClick={() => router.push("/dashboard", { scroll: false })}
          >
            Setup later
          </Button>
        </BoxWidget>
      )}

      <div className="absolute top-[11px] right-[24px]">
        <ProfileWidget />
      </div>
    </>
  );
}
