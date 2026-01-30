import { AuthResponse } from "@/types";
import { api } from "./api";
import { removeCookie } from "@/lib/cookie";

export interface TwoFactorSetupResponse {
  secret: string;
  qrCode: string;
  backupCodes: string[];
}

export interface TwoFactorStatusResponse {
  enabled: boolean;
  backupCodesRemaining: number;
}

export interface VerifyOtpResponse extends AuthResponse {
  requiresTwoFactor?: boolean;
}

export class AuthService {
  private domain = "auth";

  async requestOtp(
    email: string,
    isSignup: boolean = false,
    referralCode?: string | null
  ): Promise<{ success: boolean; message: string }> {
    return api.post<{ success: boolean; message: string }>(
      `${this.domain}/authenticate`,
      {
        email : email.toLowerCase(),
        referralCode,
        isSignup,
      }
    );
  }

  async resendOtp(
    email: string
  ): Promise<{ success: boolean; message: string }> {
    return api.post<{ success: boolean; message: string }>(
      `${this.domain}/resend-otp`,
      {
        email : email.toLowerCase(),
      }
    );
  }

  async verifyOtp(email: string, otp: string): Promise<VerifyOtpResponse> {
    try {
      const data = await api.post<VerifyOtpResponse>(
        `${this.domain}/verify-otp`,
        {
          email : email.toLowerCase(),
          otp,
        }
      );

      return data;
    } catch (error) {
      console.error("OTP verification failed:", error);
      throw error;
    }
  }

  async refreshAccessToken(refreshToken: string): Promise<AuthResponse> {
    return api.post<AuthResponse>(`${this.domain}/refresh`, {
      refreshToken,
    });
  }

  async logout(): Promise<void> {
    return api.post<void>(`${this.domain}/logout`, {});
  }

  // ============ 2FA Methods ============

  /**
   * Request OTP for 2FA setup
   */
  async request2FAOTP(): Promise<{ success: boolean; message: string }> {
    return api.post<{ success: boolean; message: string }>(
      `${this.domain}/2fa/request-otp`,
      {}
    );
  }

  /**
   * Enable 2FA - Step 1: Generate secret and QR code
   * Requires valid OTP from email
   */
  async enable2FA(otp: string): Promise<TwoFactorSetupResponse> {
    return api.post<TwoFactorSetupResponse>(`${this.domain}/2fa/enable`, {
      otp,
    });
  }

  /**
   * Enable 2FA - Step 2: Verify setup with authenticator app code
   */
  async verify2FASetup(
    token: string
  ): Promise<{ success: boolean; message: string }> {
    return api.post<{ success: boolean; message: string }>(
      `${this.domain}/2fa/verify-setup`,
      {
        token,
      }
    );
  }

  /**
   * Validate 2FA during login
   * Called after verifyOtp returns requiresTwoFactor: true
   */
  async validate2FA(email: string, token: string): Promise<AuthResponse> {
    try {
      const data = await api.post<AuthResponse>(`${this.domain}/2fa/validate`, {
        email : email.toLowerCase(),
        token,
      });

      // Backend sets httpOnly cookies automatically, no need to set them client-side
      return data;
    } catch (error) {
      console.error("2FA validation failed:", error);
      throw error;
    }
  }

  /**
   * Disable 2FA
   * Requires valid 2FA code or backup code
   */
  async disable2FA(
    token: string
  ): Promise<{ success: boolean; message: string }> {
    return api.post<{ success: boolean; message: string }>(
      `${this.domain}/2fa/disable`,
      {
        token,
      }
    );
  }

  /**
   * Get 2FA status
   */
  async get2FAStatus(): Promise<TwoFactorStatusResponse> {
    return api.get<TwoFactorStatusResponse>(`${this.domain}/2fa/status`);
  }

  /**
   * Regenerate backup codes
   * Requires valid 2FA code from authenticator app
   */
  async regenerateBackupCodes(
    token: string
  ): Promise<{ backupCodes: string[] }> {
    return api.post<{ backupCodes: string[] }>(
      `${this.domain}/2fa/regenerate-backup-codes`,
      {
        token,
      }
    );
  }
}

export default new AuthService();
