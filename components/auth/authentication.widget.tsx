"use client";

import { useDto } from "@/contexts/dto";
import { useReferral } from "@/contexts/referral";
import Link from "next/link";
import { useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import { Button } from "../ui/button";
import { Loader } from "../ui/loader";
import { BoxWidget } from "./box.widget";
import { Icon } from "../ui/icons";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../ui/dialog";
import { Checkbox } from "../ui/checkbox";
import AuthService from "@/services/auth";

function AuthenticationWidgetContent({
  title,
  text,
  button,
  link,
  emit,
  isSignup = false,
  redirectTo,
  isModal = false,
  invitationInfo,
}: {
  title: string;
  text: string;
  button: string;
  link: React.ReactNode;
  emit: () => void;
  isSignup: boolean;
  redirectTo: string;
  isModal?: boolean;
  invitationInfo?: {
    companyName: string;
    role: string;
    expiresAt: string;
  };
}) {
  const { setData } = useDto();
  const { referralCode } = useReferral();
  const router = useRouter();
  const [disabled, setDisabled] = useState(true);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState<string>("");
  const [submitError, setSubmitError] = useState("");
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [pendingAction, setPendingAction] = useState<"email" | "google" | null>(
    null
  );

  function checkEmail(event: string) {
    const regex = new RegExp(
      "^[a-zA-Z0-9._+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$"
    );
    setDisabled(!regex.test(event));
    setEmail(event);
  }

  function handleEmailLogin() {
    if (isSignup) {
      setAcceptedTerms(false);
      setPendingAction("email");
      setShowTermsModal(true);
    } else {
      signinByEmail();
    }
  }

  function handleGoogleLogin() {
    if (isSignup) {
      setAcceptedTerms(false);
      setPendingAction("google");
      setShowTermsModal(true);
    } else {
      signinByGoogle();
    }
  }

  function signinByEmail() {
    // Store invitation token if we're on an invitation page
    const invitationToken = localStorage.getItem("pendingInvitationToken");
    if (invitationToken && redirectTo?.includes("/invite/")) {
      // Token is already stored, just ensure redirectTo is set
      localStorage.setItem("redirectTo", redirectTo);
    }

    setLoading(true);
    setSubmitError("");
    AuthService.requestOtp(email, isSignup, referralCode).then(
      (response) => {
        setLoading(false);
        if (response.success) {
          setData((prev) => ({
            ...prev,
            email,
          }));
          emit();
        } else {
          setSubmitError(
            response.message ||
              "Failed to send OTP. Please check your email and try again."
          );
        }
      },
      () => {
        setLoading(false);
        setSubmitError("Unexpected error. Please try again.");
      }
    );
  }

  const getSmartlinkSlug = () => {
    if (typeof window === "undefined") return undefined;
    const url = new URL(window.location.href);
    return url.searchParams.get("s") || undefined;
  };

  function signinByGoogle() {
    // Store invitation token if we're on an invitation page
    const invitationToken = localStorage.getItem("pendingInvitationToken");

    const smartlinkSlug = getSmartlinkSlug();
    if (smartlinkSlug) {
      localStorage.setItem("redirectTo", `/watch?s=${smartlinkSlug}`);
    } else if (redirectTo) {
      localStorage.setItem("redirectTo", redirectTo);
    } else if (invitationToken) {
      // If we have an invitation token but no redirectTo, set it
      localStorage.setItem("redirectTo", `/invite/${invitationToken}`);
    }

    // Include referral code in Google auth URL if present
    const googleAuthUrl = referralCode
      ? `${process.env.NEXT_PUBLIC_API_URL}/auth/google/login?ref=${referralCode}`
      : `${process.env.NEXT_PUBLIC_API_URL}/auth/google/login`;

    window.location.href = googleAuthUrl;
  }

  function handleTermsAccept() {
    setAcceptedTerms(true);
    setShowTermsModal(false);

    // Execute the pending action
    if (pendingAction === "email") {
      signinByEmail();
    } else if (pendingAction === "google") {
      signinByGoogle();
    }
    setPendingAction(null);
  }

  function handleTermsDecline() {
    setShowTermsModal(false);
    setPendingAction(null);
  }

  return (
    <BoxWidget title={title} isModal={isModal} fullWidth={isModal}>
      {loading && <Loader />}

      {/* Subtitle */}
      <p className="text-slate-500 text-sm text-center mb-8">
        {text} {link}
      </p>

      {invitationInfo && (
        <div className="mb-6 p-4 bg-slate-50 rounded-2xl border border-slate-200">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-full bg-[#00B4B4]/10 flex items-center justify-center shrink-0">
              <svg
                className="w-4 h-4 text-[#00B4B4]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-slate-900">
                You've been invited!
              </p>
              <p className="text-xs text-slate-500">
                {invitationInfo.companyName} has invited you to join as{" "}
                {invitationInfo.role}
              </p>
            </div>
          </div>
          <p className="text-xs text-slate-500">
            Please sign in or create an account to accept this invitation.
          </p>
        </div>
      )}

      {/* Form */}
      <div className="w-full space-y-5">
        <div>
          <label className="block text-sm text-slate-600 mb-2">
            Email address
          </label>
          <input
            type="email"
            placeholder="johndoe@example.com"
            onChange={(e) => checkEmail(e.target.value)}
            value={email}
            className="w-full px-5 py-3.5 rounded-2xl border border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#00B4B4] focus:border-transparent focus:bg-white transition-all text-sm"
          />
          {submitError && (
            <p className="mt-2 text-sm text-rose-500">{submitError}</p>
          )}
        </div>

        {/* Submit Button */}
        <button
          disabled={disabled}
          onClick={handleEmailLogin}
          className="w-full py-3.5 px-6 rounded-2xl font-semibold transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed bg-[#0f172a] hover:bg-[#1e293b] active:scale-[0.98] text-white text-sm"
        >
          {button}
        </button>
      </div>

      {/* Divider */}
      <div className="flex items-center w-full my-8">
        <hr className="w-full h-px bg-slate-200 border-0" />
        <span className="px-4 text-xs text-slate-400 whitespace-nowrap uppercase tracking-wide">
          Or continue with
        </span>
        <hr className="w-full h-px bg-slate-200 border-0" />
      </div>

      {/* Social Login Buttons */}
      <div className="flex gap-3 w-full justify-center">
        <button
          onClick={handleGoogleLogin}
          className="w-12 h-12 flex items-center justify-center rounded-xl border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm"
        >
          <Icon name="google" className="size-5" />
        </button>
        <button
          className="w-12 h-12 flex items-center justify-center rounded-xl border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 transition-all text-slate-900 shadow-sm"
        >
          <svg className="size-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
          </svg>
        </button>
      </div>

      {/* Footer Links */}
      <div className="flex flex-row text-xs items-center justify-center gap-3 mt-10 text-slate-400">
        <Link
          href="https://www.onthehiway.com/privacy-policy"
          target="_blank"
          className="hover:text-[#00B4B4] transition-colors"
        >
          Privacy
        </Link>
        <span className="text-slate-300">•</span>
        <Link
          href="https://www.onthehiway.com/terms-and-conditions"
          target="_blank"
          className="hover:text-[#00B4B4] transition-colors"
        >
          Terms
        </Link>
      </div>

      {/* Terms and Conditions Modal */}
      <Dialog open={showTermsModal} onOpenChange={setShowTermsModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Terms and Conditions</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              By using this website, you agree to our Terms and Conditions.
              Please review them carefully before proceeding. To read our full
              terms and conditions, click here.
            </p>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="accept-terms"
                checked={acceptedTerms}
                onCheckedChange={(checked) =>
                  setAcceptedTerms(checked === true)
                }
              />
              <label
                htmlFor="accept-terms"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                I agree to the terms and conditions
              </label>
            </div>
          </div>

          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleTermsDecline}
              className="flex-1"
              asChild
            >
              <Link
                href="https://www.onthehiway.com/terms-and-conditions"
                target="_blank"
              >
                View Terms and Conditions
              </Link>
            </Button>
            <Button
              onClick={handleTermsAccept}
              disabled={!acceptedTerms}
              className="flex-1"
            >
              Accepts & Continue
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </BoxWidget>
  );
}

// Main export component
export function AuthenticationWidget(props: {
  title: string;
  text: string;
  button: string;
  link: React.ReactNode;
  emit: () => void;
  isSignup: boolean;
  redirectTo: string;
  isModal?: boolean;
  invitationInfo?: {
    companyName: string;
    role: string;
    expiresAt: string;
  };
}) {
  return <AuthenticationWidgetContent {...props} />;
}
