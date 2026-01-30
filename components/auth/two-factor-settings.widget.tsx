"use client";

import { useState } from "react";
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Badge } from "../ui/badge";
import { Loader } from "../ui/loader";
import { Icon } from "../ui/icons";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../ui/dialog";
import {
  use2FAStatus,
  useEnable2FA,
  useVerify2FASetup,
  useDisable2FA,
  useRegenerateBackupCodes,
} from "@/hooks/use2FA";
import { OtpInput } from "./otp-input.component";
import AuthService from "@/services/auth";
import { cn } from "@/lib/utils";
import { Shield } from "lucide-react";

export function TwoFactorSettingsWidget() {
  const { data: status, isLoading: statusLoading } = use2FAStatus();
  const enable2FA = useEnable2FA();
  const verify2FASetup = useVerify2FASetup();
  const disable2FA = useDisable2FA();
  const regenerateBackupCodes = useRegenerateBackupCodes();

  const [showEnableModal, setShowEnableModal] = useState(false);
  const [showDisableModal, setShowDisableModal] = useState(false);
  const [showRegenerateModal, setShowRegenerateModal] = useState(false);
  const [setupStep, setSetupStep] = useState<
    "otp" | "qr" | "verify" | "success"
  >("otp");
  const [otp, setOtp] = useState("");
  const [verifyCode, setVerifyCode] = useState("");
  const [disableCode, setDisableCode] = useState("");
  const [regenerateCode, setRegenerateCode] = useState("");
  const [qrCode, setQrCode] = useState("");
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [otpRequested, setOtpRequested] = useState(false);

  const handleRequestOTP = async () => {
    try {
      await AuthService.request2FAOTP();
      setOtpRequested(true);
    } catch (err) {
      console.error("Failed to request OTP:", err);
    }
  };

  const handleEnable2FA = async () => {
    try {
      const response = await enable2FA.mutateAsync(otp);
      setQrCode(response.qrCode);
      setBackupCodes(response.backupCodes);
      setSetupStep("qr");
    } catch (err) {
      console.error("Failed to enable 2FA:", err);
    }
  };

  const handleVerifySetup = async () => {
    try {
      await verify2FASetup.mutateAsync(verifyCode);
      setSetupStep("success");
    } catch (err) {
      console.error("Failed to verify 2FA setup:", err);
    }
  };

  const handleDisable = async () => {
    try {
      await disable2FA.mutateAsync(disableCode);
      setShowDisableModal(false);
      setDisableCode("");
    } catch (err) {
      console.error("Failed to disable 2FA:", err);
    }
  };

  const handleRegenerateBackupCodes = async () => {
    try {
      const response = await regenerateBackupCodes.mutateAsync(regenerateCode);
      setBackupCodes(response.backupCodes);
      setRegenerateCode("");
    } catch (err) {
      console.error("Failed to regenerate backup codes:", err);
    }
  };

  const resetEnableForm = () => {
    setSetupStep("otp");
    setOtp("");
    setVerifyCode("");
    setQrCode("");
    setBackupCodes([]);
    setOtpRequested(false);
  };

  const downloadBackupCodes = () => {
    const text = backupCodes.join("\n");
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "2fa-backup-codes.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  const copyBackupCodes = async () => {
    await navigator.clipboard.writeText(backupCodes.join("\n"));
  };

  if (statusLoading) {
    return <Loader />;
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div className="flex-1">
              <CardTitle className="flex flex-col sm:flex-row sm:items-center gap-2">
                <span>Two-Factor Authentication</span>
                {status?.enabled && (
                  <Badge variant="default" className="w-fit">
                    Enabled
                  </Badge>
                )}
              </CardTitle>
              <CardDescription className="mt-2">
                Add an extra layer of security to your account using an
                authenticator app
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {status?.enabled ? (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 border rounded-lg">
                <div className="space-y-1">
                  <p className="font-medium">2FA is enabled</p>
                  <p className="text-sm text-muted-foreground">
                    Backup codes remaining: {status.backupCodesRemaining}
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowRegenerateModal(true)}
                    className="w-full sm:w-auto"
                  >
                    Regenerate Codes
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => setShowDisableModal(true)}
                    className="w-full sm:w-auto"
                  >
                    Disable 2FA
                  </Button>
                </div>
              </div>

              {status.backupCodesRemaining < 3 && (
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 p-4 border border-yellow-500/50 bg-yellow-500/10 rounded-lg">
                  <Icon
                    name="alert-triangle"
                    className="size-5 text-yellow-500 flex-shrink-0"
                  />
                  <p className="text-sm text-yellow-500">
                    You're running low on backup codes. Consider regenerating
                    them.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-start gap-3 p-4 border rounded-lg">
                <Shield className="size-5 mt-0.5 flex-shrink-0" />
                <div className="space-y-1 flex-1">
                  <p className="font-medium">Secure your account</p>
                  <p className="text-sm text-muted-foreground">
                    Two-factor authentication adds an additional layer of
                    security by requiring a code from your phone in addition to
                    your password.
                  </p>
                </div>
              </div>
              <Button
                onClick={() => setShowEnableModal(true)}
                className="w-full sm:w-auto"
              >
                Enable 2FA
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Enable 2FA Modal */}
      <Dialog open={showEnableModal} onOpenChange={setShowEnableModal}>
        <DialogContent className="max-w-md mx-4">
          <DialogHeader>
            <DialogTitle>Enable Two-Factor Authentication</DialogTitle>
            <DialogDescription>
              {setupStep === "otp" && "First, verify your identity with an OTP"}
              {setupStep === "qr" &&
                "Scan the QR code with your authenticator app"}
              {setupStep === "verify" &&
                "Verify the setup with your authenticator"}
              {setupStep === "success" && "Save your backup codes securely"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {setupStep === "otp" && (
              <>
                {!otpRequested ? (
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      We'll send a one-time password to your email to verify
                      it's you.
                    </p>
                    <Button onClick={handleRequestOTP} className="w-full">
                      Send OTP to Email
                    </Button>
                  </div>
                ) : (
                  <>
                    <p className="text-sm text-muted-foreground">
                      Enter the OTP sent to your email
                    </p>
                    <OtpInput emit={(value) => setOtp(value)} />
                    <Button
                      onClick={handleEnable2FA}
                      disabled={otp.length !== 6 || enable2FA.isPending}
                      className="w-full"
                    >
                      {enable2FA.isPending ? "Verifying..." : "Continue"}
                    </Button>
                  </>
                )}
              </>
            )}

            {setupStep === "qr" && (
              <>
                <div className="flex flex-col items-center gap-4">
                  {qrCode && (
                    <img
                      src={qrCode}
                      alt="QR Code"
                      className="w-48 h-48 sm:w-56 sm:h-56 border rounded-lg"
                    />
                  )}
                  <p className="text-sm text-center text-muted-foreground">
                    Scan this QR code with Google Authenticator, Authy, or any
                    other authenticator app
                  </p>
                </div>

                <Button
                  onClick={() => setSetupStep("verify")}
                  className="w-full"
                >
                  Continue
                </Button>
              </>
            )}

            {setupStep === "verify" && (
              <>
                <p className="text-sm text-muted-foreground">
                  Enter the 6-digit code from your authenticator app to confirm
                  setup
                </p>
                <OtpInput emit={(value) => setVerifyCode(value)} />
                <Button
                  onClick={handleVerifySetup}
                  disabled={verifyCode.length !== 6 || verify2FASetup.isPending}
                  className="w-full"
                >
                  {verify2FASetup.isPending ? "Verifying..." : "Enable 2FA"}
                </Button>
              </>
            )}

            {setupStep === "success" && (
              <>
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">
                    Backup Codes (Save These!)
                  </h4>
                  <p className="text-xs text-destructive">
                    These codes are shown only once. Save them securely.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-3 bg-muted rounded-md font-mono text-sm">
                    {backupCodes.map((code, i) => (
                      <div key={i} className="break-all">
                        {code}
                      </div>
                    ))}
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button
                      variant="outline"
                      onClick={copyBackupCodes}
                      className="flex-1"
                      size="sm"
                    >
                      Copy
                    </Button>
                    <Button
                      variant="outline"
                      onClick={downloadBackupCodes}
                      className="flex-1"
                      size="sm"
                    >
                      Download
                    </Button>
                  </div>
                </div>
                <Button
                  onClick={() => {
                    setShowEnableModal(false);
                    resetEnableForm();
                  }}
                  className="w-full"
                >
                  Done
                </Button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Disable 2FA Modal */}
      <Dialog open={showDisableModal} onOpenChange={setShowDisableModal}>
        <DialogContent className="max-w-md mx-4">
          <DialogHeader>
            <DialogTitle>Disable Two-Factor Authentication</DialogTitle>
            <DialogDescription>
              Enter your 2FA code or a backup code to disable two-factor
              authentication
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <OtpInput emit={(value) => setDisableCode(value)} />
            <p className="text-xs text-muted-foreground text-center">
              You can also use an 8-character backup code
            </p>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowDisableModal(false);
                setDisableCode("");
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDisable}
              disabled={
                (disableCode.length !== 6 && disableCode.length !== 8) ||
                disable2FA.isPending
              }
            >
              {disable2FA.isPending ? "Disabling..." : "Disable 2FA"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Regenerate Backup Codes Modal */}
      <Dialog open={showRegenerateModal} onOpenChange={setShowRegenerateModal}>
        <DialogContent className="max-w-md mx-4">
          <DialogHeader>
            <DialogTitle>Regenerate Backup Codes</DialogTitle>
            <DialogDescription>
              Enter your 2FA code from your authenticator app to generate new
              backup codes
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {backupCodes.length === 0 ? (
              <>
                <OtpInput emit={(value) => setRegenerateCode(value)} />
                <Button
                  onClick={handleRegenerateBackupCodes}
                  disabled={
                    regenerateCode.length !== 6 ||
                    regenerateBackupCodes.isPending
                  }
                  className="w-full"
                >
                  {regenerateBackupCodes.isPending
                    ? "Generating..."
                    : "Generate New Codes"}
                </Button>
              </>
            ) : (
              <>
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">
                    New Backup Codes (Save These!)
                  </h4>
                  <p className="text-xs text-destructive">
                    Your old backup codes are now invalid. Save these new codes
                    securely.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-3 bg-muted rounded-md font-mono text-sm">
                    {backupCodes.map((code, i) => (
                      <div key={i} className="break-all">
                        {code}
                      </div>
                    ))}
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button
                      variant="outline"
                      onClick={copyBackupCodes}
                      className="flex-1"
                      size="sm"
                    >
                      Copy
                    </Button>
                    <Button
                      variant="outline"
                      onClick={downloadBackupCodes}
                      className="flex-1"
                      size="sm"
                    >
                      Download
                    </Button>
                  </div>
                </div>
                <Button
                  onClick={() => {
                    setShowRegenerateModal(false);
                    setBackupCodes([]);
                    setRegenerateCode("");
                  }}
                  className="w-full"
                >
                  Done
                </Button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
