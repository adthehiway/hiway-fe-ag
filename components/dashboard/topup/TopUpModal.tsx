"use client";

import { useUser } from "@/hooks/useUser";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { BoxWidget } from "../../auth/box.widget";
import TopUpService from "@/services/topups";
// @ts-expect-error - Package is not typed
import { getCurrencySymbol } from "@brixtol/currency-symbols";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export function TopUpModal() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const topupUnit = parseInt(process.env.NEXT_PUBLIC_TOPUP_UNIT || "100");
  const topupUnitPrice = parseFloat(
    process.env.NEXT_PUBLIC_TOPUP_UNIT_PRICE || "25"
  );
  const currency = process.env.NEXT_PUBLIC_TOPUP_PRICE_CURRENCY || "GBP";

  const [hours, setHours] = useState<number>(topupUnit);
  const [checkoutInProgress, setCheckoutInProgress] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);

  // Price calculation based on units
  const numberOfUnits = Math.ceil(hours / topupUnit);
  const totalPrice = numberOfUnits * topupUnitPrice;

  // Check for topupSuccess parameter on component mount
  useEffect(() => {
    const topupSuccess = searchParams.get("topupSuccess");
    if (topupSuccess === "true") {
      setShowSuccessModal(true);
      // Clean up URL by removing the parameter
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete("topupSuccess");
      router.replace(newUrl.pathname + newUrl.search, { scroll: false });
    } else if (topupSuccess === "false") {
      setShowErrorModal(true);
      // Clean up URL by removing the parameter
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete("topupSuccess");
      router.replace(newUrl.pathname + newUrl.search, { scroll: false });
    }
  }, [searchParams, router]);

  const handleHoursChange = (value: string) => {
    const numValue = parseInt(value);
    if (!isNaN(numValue) && numValue >= topupUnit) {
      // Round to nearest unit
      const roundedValue = Math.ceil(numValue / topupUnit) * topupUnit;
      setHours(roundedValue);
    } else if (value === "") {
      setHours(topupUnit);
    }
  };

  function createCheckoutLink() {
    setCheckoutInProgress(true);
    TopUpService.createCheckoutLink({
      hours: hours,
    })
      .then((data: { url: string }) => {
        localStorage.setItem("tabValue", "billing");
        window.open(data.url, "_self");
      })
      .catch((error) => {
        setCheckoutInProgress(false);
        setShowErrorModal(true);
      });
  }

  return (
    <>
      <Dialog>
        <DialogTrigger asChild>
          <Button>Get More Stream Hours</Button>
        </DialogTrigger>

        <DialogContent className="max-w-md">
          <BoxWidget title="Get More Stream Hours" fullWidth isModal>
            <div className="space-y-4">
              <div className="font-primary text-[12px] font-light text-muted-foreground uppercase">
                Purchase additional streaming hours for your account
              </div>

              <div className="space-y-2">
                <Label htmlFor="hours">Stream Hours</Label>
                <Input
                  id="hours"
                  type="number"
                  min={topupUnit}
                  step={topupUnit}
                  value={hours}
                  onChange={(e) => handleHoursChange(e.target.value)}
                  placeholder={`Enter hours (minimum ${topupUnit})`}
                />
                <div className="text-xs text-muted-foreground">
                  Minimum {topupUnit} hours, rounded to nearest {topupUnit}
                </div>
              </div>

              <div className="p-4 border border-gray-460 rounded-[8px] bg-muted/20">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Hours:</span>
                  <span className="text-sm">{hours.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Price:</span>
                  <span className="text-lg font-bold text-accent">
                    {getCurrencySymbol(currency)}
                    {totalPrice.toFixed(2)}
                  </span>
                </div>
                <div className="text-xs text-muted-foreground mt-2">
                  💡 These hours are valid for the next 30 days only
                </div>
              </div>

              <Button
                onClick={createCheckoutLink}
                disabled={checkoutInProgress || hours < topupUnit}
                className="w-full"
              >
                {checkoutInProgress ? "Processing..." : "Buy Topup"}
              </Button>
            </div>
          </BoxWidget>
        </DialogContent>
      </Dialog>

      {/* Success Modal */}
      <AlertDialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <AlertDialogContent className="bg-card">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-green-500">
              🎉 Purchase Successful!
            </AlertDialogTitle>
            <AlertDialogDescription>
              Your top-up has been successfully purchased and added to your
              account. You can now enjoy the additional features.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setShowSuccessModal(false)}>
              Great!
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Error Modal */}
      <AlertDialog open={showErrorModal} onOpenChange={setShowErrorModal}>
        <AlertDialogContent className="bg-card">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-500">
              ❌ Purchase Failed
            </AlertDialogTitle>
            <AlertDialogDescription>
              Unfortunately, there was an issue processing your payment. Please
              try again or contact support if the problem persists.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setShowErrorModal(false)}>
              Try Again
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
