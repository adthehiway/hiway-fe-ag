"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "../ui/button";
import { BoxWidget } from "./box.widget";
import { Loader } from "../ui/loader";
import AuthService from "@/services/auth";
import { OtpInput } from "./otp-input.component";

interface TwoFactorValidationWidgetProps {
  email: string;
  redirectTo?: string;
  isModal?: boolean;
  onBack?: () => void;
}

export function TwoFactorValidationWidget({
  email,
  redirectTo = "/dashboard",
  isModal = false,
  onBack,
}: TwoFactorValidationWidgetProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [useBackupCode, setUseBackupCode] = useState(false);

  const handleValidate = async () => {
    if (!code || (useBackupCode ? code.length !== 8 : code.length !== 6)) {
      setError(
        useBackupCode
          ? "Please enter a valid 8-character backup code"
          : "Please enter a valid 6-digit code"
      );
      return;
    }

    setLoading(true);
    setError("");

    try {
      await AuthService.validate2FA(email, code);

      // Check for pending invitation token first
      const invitationToken = localStorage.getItem("pendingInvitationToken");
      if (invitationToken) {
        localStorage.removeItem("pendingInvitationToken");
        localStorage.removeItem("redirectTo");
        router.push(`/invite/${invitationToken}`);
        return;
      }

      // Check for saved redirect path
      const savedRedirect = localStorage.getItem("redirectTo");
      if (savedRedirect) {
        localStorage.removeItem("redirectTo");
        router.push(savedRedirect);
      } else {
        router.push(redirectTo);
      }
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          "Invalid code. Please check and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCodeChange = (value: string) => {
    setCode(value);
    setError("");
  };

  return (
    <BoxWidget
      title="Two-Factor Authentication"
      isModal={isModal}
      fullWidth={isModal}
    >
      {loading && <Loader />}

      <div className="w-full space-y-6">
        <div className="text-center space-y-2">
          <p className="text-sm text-muted-foreground">
            {useBackupCode
              ? "Enter one of your backup codes"
              : "Enter the 6-digit code from your authenticator app"}
          </p>
        </div>

        <div className="flex flex-col items-center gap-4">
          {useBackupCode ? (
            <input
              type="text"
              value={code}
              onChange={(e) => handleCodeChange(e.target.value.toUpperCase())}
              placeholder="A1B2C3D4"
              className="w-full max-w-[200px] px-4 py-2 text-center text-lg font-mono uppercase tracking-wider border rounded-md bg-background"
              maxLength={8}
            />
          ) : (
            <OtpInput emit={handleCodeChange} />
          )}

          {error && (
            <p className="text-sm text-destructive text-center">{error}</p>
          )}
        </div>

        <div className="space-y-3">
          <Button onClick={handleValidate} className="w-full">
            Verify
          </Button>

          <Button
            variant="ghost"
            onClick={() => {
              setUseBackupCode(!useBackupCode);
              setCode("");
              setError("");
            }}
            className="w-full text-sm"
          >
            {useBackupCode
              ? "Use authenticator app instead"
              : "Use backup code instead"}
          </Button>

          {onBack && (
            <Button
              variant="outline"
              onClick={onBack}
              className="w-full text-sm"
            >
              Back to login
            </Button>
          )}
        </div>

        <div className="text-xs text-center text-muted-foreground space-y-1">
          <p>Lost access to your authenticator app?</p>
          <p>Use one of your backup codes to log in.</p>
        </div>
      </div>
    </BoxWidget>
  );
}
