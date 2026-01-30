"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDto } from "@/contexts/dto";
import { BoxWidget } from "./box.widget";
import { Loader } from "../ui/loader";
import Link from "next/link";
import { Button } from "../ui/button";
import { OtpInput } from "./otp-input.component";
import AuthService from "@/services/auth";

export function OtpWidget({
  emit,
  isModal = false,
  onRequires2FA,
}: {
  emit: (newUser: boolean) => void;
  isModal?: boolean;
  onRequires2FA?: () => void;
}) {
  const router = useRouter();
  const { data } = useDto();
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [resendError, setResendError] = useState("");
  const [resendSuccess, setResendSuccess] = useState(false);
  const [countdown, setCountdown] = useState(60);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [countdown]);

  async function submit(otp: string) {
    setLoading(true);
    setSubmitError("");

    try {
      const result = await AuthService.verifyOtp(data?.email, otp);
      console.log("OTP verification result:", result);

      // Check if 2FA is required
      if (result.requiresTwoFactor) {
        if (onRequires2FA) {
          onRequires2FA();
        }
      } else {
        // Normal login without 2FA
        // Check if there's a pending invitation token
        const invitationToken = localStorage.getItem("pendingInvitationToken");
        if (invitationToken) {
          // Redirect to accept invitation (works for both new and existing users)
          localStorage.removeItem("pendingInvitationToken");
          router.push(`/invite/${invitationToken}`);
        } else {
          // For new users, emit to go to package page
          // For existing users, the middleware will handle redirect
          emit(true);
        }
      }
    } catch (error) {
      console.error("Error verifying OTP:", error);
      setSubmitError("Invalid code, please try again.");
    } finally {
      setLoading(false);
    }
  }

  const handleResendOtp = async () => {
    setResendLoading(true);
    setResendError("");
    setResendSuccess(false);

    try {
      const result = await AuthService.resendOtp(data?.email);
      console.log("Resend OTP result:", result);
      if (result.success) {
        setResendSuccess(true);
        setCountdown(60); // Start countdown after successful resend
        setTimeout(() => setResendSuccess(false), 3000);
      } else {
        setResendError(result.message);
      }
    } catch (error) {
      console.error("Error resending OTP:", error);
      setResendError(
        error instanceof Error
          ? error.message
          : "Failed to resend OTP. Please try again."
      );
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <BoxWidget
      title="Please enter the code sent to your email"
      isModal={isModal}
      fullWidth={isModal}
    >
      {loading && <Loader />}
      <div className="flex flex-col">
        <div className="flex flex-row justify-between">
          <div className="text-[10px] font-medium uppercase text-white-100">
            {data?.email}
          </div>
          <Link
            href="/auth/signup"
            className="text-accent font-medium text-xs hover:underline cursor-pointer"
          >
            Change
          </Link>
        </div>
        <div className="text-[10px] pt-1 font-medium text-white-60">
          We&apos;ve sent a One Time Password (OTP) to your email address.
          Please enter it below.
        </div>
      </div>
      <div className="p-2" />
      <div>
        <OtpInput emit={submit} error={submitError} />
        <div className="flex justify-end mt-2">
          {countdown > 0 ? (
            <p className="text-[10px] text-muted-foreground">
              Resend code in {countdown}s
            </p>
          ) : (
            <button
              onClick={handleResendOtp}
              disabled={resendLoading}
              className="text-[10px] text-accent hover:underline cursor-pointer disabled:text-muted-foreground disabled:cursor-not-allowed"
            >
              {resendLoading ? "Resending..." : "Resend code"}
            </button>
          )}
        </div>
      </div>
      <div className="flex flex-col gap-2 w-full mt-4">
        {resendSuccess && (
          <p className="text-[10px] text-accent text-center">
            New code sent successfully!
          </p>
        )}
        {resendError && (
          <p className="text-[10px] text-destructive text-center">
            {resendError}
          </p>
        )}
        <Button
          variant="secondary"
          className="w-full"
          onClick={() => router.replace("/auth/signup")}
          disabled={resendLoading}
        >
          Cancel
        </Button>
      </div>
    </BoxWidget>
  );
}
