"use client";

import { useState, useMemo, useEffect } from "react";
import { IPackage, IPackageGrouped, PackageType, BillingType } from "@/types";
import { Button } from "../../ui/button";
import { Loader } from "../../ui/loader";
import { getFeatureValue } from "@/lib/utils";
// @ts-expect-error - Package is not typed
import { getCurrencySymbol } from "@brixtol/currency-symbols";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Props {
  packages: IPackageGrouped;
  onPackageSelect: (packageId: string) => void;
  checkoutInProgress: boolean;
}

export function PackageSlider({
  packages,
  onPackageSelect,
  checkoutInProgress,
}: Props) {
  const [billingType, setBillingType] = useState<BillingType>(
    BillingType.MONTHLY
  );

  // Dynamically extract available package types from the packages object
  const packageTypes = useMemo(() => {
    return Object.keys(packages).filter(
      (key) => packages[key as PackageType]?.length > 0
    ) as PackageType[];
  }, [packages]);

  // Set initial package type to the first available one
  const [currentPackageType, setCurrentPackageType] =
    useState<PackageType | null>(packageTypes[0] || null);

  // Update current package type when packageTypes change
  useEffect(() => {
    if (
      packageTypes.length > 0 &&
      (!currentPackageType || !packageTypes.includes(currentPackageType))
    ) {
      setCurrentPackageType(packageTypes[0]);
    }
  }, [packageTypes, currentPackageType]);

  const currentIndex = currentPackageType
    ? packageTypes.indexOf(currentPackageType)
    : -1;

  const goToPrevious = () => {
    if (packageTypes.length <= 1) return;
    const newIndex =
      currentIndex > 0 ? currentIndex - 1 : packageTypes.length - 1;
    setCurrentPackageType(packageTypes[newIndex]);
  };

  const goToNext = () => {
    if (packageTypes.length <= 1) return;
    const newIndex =
      currentIndex < packageTypes.length - 1 ? currentIndex + 1 : 0;
    setCurrentPackageType(packageTypes[newIndex]);
  };

  const getCurrentPackage = (): IPackage | null => {
    if (!currentPackageType) return null;
    const typePackages = packages[currentPackageType];
    return (
      typePackages?.find((pkg) => pkg.billingType === billingType) ||
      typePackages?.[0] ||
      null
    );
  };

  const currentPackage = getCurrentPackage();
  const hasMultiplePackages = packageTypes.length > 1;

  if (!currentPackage || packageTypes.length === 0) {
    return <div className="text-white text-center">No packages available</div>;
  }

  return (
    <div className="relative w-full max-w-md mx-auto">
      {hasMultiplePackages && (
        <>
          <ArrowButton
            onClick={goToPrevious}
            ariaLabel="Previous package"
            className="hidden lg:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-12 z-10 w-10 h-10 rounded-full bg-[#171717] border border-zinc-800 items-center justify-center transition-colors"
            direction="left"
          />

          <ArrowButton
            onClick={goToNext}
            ariaLabel="Next package"
            className="hidden lg:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-12 z-10 w-10 h-10 rounded-full bg-[#171717] border border-zinc-800 items-center justify-center transition-colors"
            direction="right"
          />
        </>
      )}
      {/* Package Card */}
      <div className="bg-[#171717] border border-zinc-800 rounded-xl p-8 text-center">
        {/* Logo */}
        <div className="mb-16 w-full flex items-center justify-center">
          <Image
            src="/icons/new-logo.svg"
            alt="Hiway Logo"
            width={80}
            height={80}
          />
        </div>

        {/* Billing Toggle */}
        <div className="flex items-center justify-center mb-6">
          <div className="border border-zinc-800 rounded-lg p-1 flex">
            <button
              onClick={() => setBillingType(BillingType.MONTHLY)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                billingType === BillingType.MONTHLY
                  ? "bg-accent text-black"
                  : "text-muted-foreground hover:text-white"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingType(BillingType.ANNUAL)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                billingType === BillingType.ANNUAL
                  ? "bg-accent text-black"
                  : "text-muted-foreground hover:text-white"
              }`}
            >
              Annual
            </button>
          </div>
        </div>

        {/* Package Name */}
        <h2 className="text-3xl font-bold text-white uppercase mb-2">
          {currentPackage.name}
        </h2>

        {/* Tagline */}
        <p className="text-sm text-muted-foreground uppercase mb-8">
          {currentPackage.description}
        </p>

        {/* Content Box */}
        <div className="border border-zinc-800 rounded-lg p-6 mb-6">
          {/* Price */}
          <div className="mb-4">
            <span className="text-4xl font-bold text-accent">
              {getCurrencySymbol(currentPackage.currency)}
              {currentPackage.price}
            </span>
            <span className="text-lg text-white uppercase ml-2">
              / {billingType === BillingType.MONTHLY ? "MONTH" : "YEAR"}
            </span>
          </div>

          {/* Storage Label */}
          <div className="text-xs text-muted-foreground uppercase mb-4 text-left">
            Features
          </div>

          {/* Features */}
          <div className="space-y-3">
            {currentPackage.features.map((feature, index) => (
              <div key={index} className="flex items-center  gap-3">
                <svg
                  className="w-5 h-5 text-accent flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-white text-sm">
                  {getFeatureValue(feature.feature, feature.value)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Button */}
        {!checkoutInProgress ? (
          <Button
            onClick={() => onPackageSelect(currentPackage.id)}
            className="w-full "
          >
            Continue to checkout
          </Button>
        ) : (
          <Button
            disabled
            className="w-full bg-accent text-white font-medium py-3 rounded-lg"
          >
            <Loader />
          </Button>
        )}
      </div>

      {/* Package Type Indicators */}
      {hasMultiplePackages && (
        <div className="flex justify-center mt-6 space-x-2">
          {packageTypes.map((type) => (
            <button
              key={type}
              onClick={() => setCurrentPackageType(type)}
              className={`w-2 h-2 rounded-full transition-colors ${
                currentPackageType === type ? "bg-accent" : "bg-gray-600"
              }`}
              aria-label={`Switch to ${type} package`}
            />
          ))}
        </div>
      )}

      {/* Navigation Arrows - Visible only on mobile screens */}
      {hasMultiplePackages && (
        <div className="flex lg:hidden justify-center items-center mt-6 space-x-4">
          <ArrowButton
            onClick={goToPrevious}
            ariaLabel="Previous package"
            className="w-10 h-10 rounded-full bg-[#171717] border border-zinc-800 hover:bg-gray-600 flex items-center justify-center transition-colors"
            direction="left"
          />
          <ArrowButton
            onClick={goToNext}
            ariaLabel="Next package"
            className="w-10 h-10 rounded-full bg-[#171717] border border-zinc-800 hover:bg-gray-600 flex items-center justify-center transition-colors"
            direction="right"
          />
        </div>
      )}
    </div>
  );
}

export const ArrowButton = ({
  onClick,
  ariaLabel,
  className,
  direction,
}: {
  onClick: () => void;
  ariaLabel: string;
  className: string;
  direction: string;
}) => {
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={onClick}
      className={className}
      aria-label={ariaLabel}
    >
      {direction === "left" ? <ChevronLeft /> : <ChevronRight />}
    </Button>
  );
};
