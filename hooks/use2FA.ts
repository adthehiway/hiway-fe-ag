import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AuthService, {
  TwoFactorSetupResponse,
  TwoFactorStatusResponse,
} from "@/services/auth";
import { toast } from "react-toastify";

/**
 * Hook to get 2FA status for the current user
 */
export function use2FAStatus() {
  return useQuery<TwoFactorStatusResponse, Error>({
    queryKey: ["2fa", "status"],
    queryFn: () => AuthService.get2FAStatus(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: false,
  });
}

/**
 * Hook to enable 2FA - Step 1: Generate secret and QR code
 */
export function useEnable2FA() {
  return useMutation<TwoFactorSetupResponse, Error, string>({
    mutationFn: (otp: string) => AuthService.enable2FA(otp),
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message ||
          "Failed to enable 2FA. Please try again."
      );
    },
  });
}

/**
 * Hook to verify 2FA setup - Step 2: Confirm with authenticator app code
 */
export function useVerify2FASetup() {
  const queryClient = useQueryClient();

  return useMutation<{ success: boolean; message: string }, Error, string>({
    mutationFn: (token: string) => AuthService.verify2FASetup(token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["2fa", "status"] });
      queryClient.invalidateQueries({ queryKey: ["user", "me"] });
      toast.success("2FA enabled successfully!");
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message ||
          "Invalid code. Please check and try again."
      );
    },
  });
}

/**
 * Hook to disable 2FA
 */
export function useDisable2FA() {
  const queryClient = useQueryClient();

  return useMutation<{ success: boolean; message: string }, Error, string>({
    mutationFn: (token: string) => AuthService.disable2FA(token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["2fa", "status"] });
      queryClient.invalidateQueries({ queryKey: ["user", "me"] });
      toast.success("2FA disabled successfully");
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message ||
          "Failed to disable 2FA. Please try again."
      );
    },
  });
}

/**
 * Hook to regenerate backup codes
 */
export function useRegenerateBackupCodes() {
  return useMutation<{ backupCodes: string[] }, Error, string>({
    mutationFn: (token: string) => AuthService.regenerateBackupCodes(token),
    onSuccess: () => {
      toast.success("Backup codes regenerated successfully");
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message ||
          "Failed to regenerate backup codes. Please try again."
      );
    },
  });
}
