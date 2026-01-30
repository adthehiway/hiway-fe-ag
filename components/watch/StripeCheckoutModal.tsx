"use client";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { loadStripe } from "@stripe/stripe-js";
import {
  EmbeddedCheckoutProvider,
  EmbeddedCheckout,
} from "@stripe/react-stripe-js";
import { useEffect, useState } from "react";
import { Loader } from "@/components/ui/loader";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ""
);

interface StripeCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  clientSecret: string;
  onSuccess: () => void;
}

export function StripeCheckoutModal({
  isOpen,
  onClose,
  clientSecret,
  onSuccess,
}: StripeCheckoutModalProps) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isOpen && clientSecret) {
      setIsLoading(true);
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isOpen, clientSecret]);

  if (!clientSecret) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose} modal>
      <DialogContent className="sm:max-w-5xl w-full  max-h-[95vh] p-0 bg-background border-border overflow-hidden flex flex-col">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader />
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto">
            <EmbeddedCheckoutProvider
              stripe={stripePromise}
              options={{
                clientSecret,
              }}
            >
              <EmbeddedCheckout />
            </EmbeddedCheckoutProvider>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
