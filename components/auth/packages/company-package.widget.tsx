"use client";

import { useDla } from "@/contexts/dla";
import { useUser } from "@/hooks/useUser";
import { IPackageGrouped } from "@/types";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader } from "../../ui/loader";
import { PackageSlider } from "./package-slider.component";

interface Props {
  cancel?: boolean;
}

export function CompanyPackageWidget(props: Props) {
  const router = useRouter();
  const { PackageService } = useDla();
  const [starterPackage, setStarterPackage] = useState(true);
  const [showError, setShowError] = useState(false);
  const [fetchInProgress, setFetchInProgress] = useState(true);
  const [checkoutInProgress, setCheckoutInProgress] = useState(false);
  const [packages, setPackages] = useState<IPackageGrouped>();
  const { data: user } = useUser();

  useEffect(() => {
    PackageService.getAll()
      .then((data: IPackageGrouped) => {
        setFetchInProgress(false);
        setPackages(data);
      })
      .catch((error) => {
        setFetchInProgress(false);
        setShowError(true);
      });
  }, []);

  function createCheckoutLink(packageId: string) {
    setCheckoutInProgress(true);
    PackageService.createCheckoutLink({
      packageId: packageId,
    })
      .then((data: { url: string }) => {
        window.open(data.url, "_self");
      })
      .catch((error) => {
        setCheckoutInProgress(false);
        setShowError(true);
      });
  }

  return (
    <>
      {fetchInProgress && (
        <div className="relative w-full h-full">
          <Loader backdrop={false} />
        </div>
      )}

      {!fetchInProgress && starterPackage && packages && (
        <div className="w-full">
          <PackageSlider
            packages={packages}
            onPackageSelect={createCheckoutLink}
            checkoutInProgress={checkoutInProgress}
          />

          {props.cancel && (
            <div className="text-center mt-6">
              <div className="text-[12px] text-red-200">
                To proceed with the registration, please subscribe to a Package.
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}
