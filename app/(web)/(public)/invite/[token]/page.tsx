"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  useInvitationPreview,
  useAcceptInvitation,
} from "@/hooks/useInvitations";
import { useUser } from "@/hooks/useUser";
import { Loader } from "@/components/ui/loader";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Building2, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import Link from "next/link";
import { AuthenticationWidget } from "@/components/auth/authentication.widget";
import { CompanyRole } from "@/types";
import moment from "moment";

const roleLabels: Record<CompanyRole, string> = {
  [CompanyRole.OWNER]: "Owner",
  [CompanyRole.ADMIN]: "Admin",
  [CompanyRole.MEMBER]: "Member",
  [CompanyRole.COLLABORATOR]: "Collaborator",
};

export default function InviteAcceptancePage() {
  const params = useParams();
  const router = useRouter();
  const token = params?.token as string;
  const { data: user, isLoading: userLoading } = useUser();
  const {
    data: preview,
    isLoading: previewLoading,
    error: previewError,
  } = useInvitationPreview(token);
  const { mutate: acceptInvitation, isPending: isAccepting } =
    useAcceptInvitation();
  const [showAuth, setShowAuth] = useState(false);

  useEffect(() => {
    // Store invitation token in localStorage for later use
    if (token && !user) {
      localStorage.setItem("pendingInvitationToken", token);
    }

    // If user is not logged in and preview is valid, show auth
    if (!userLoading && !user && preview && preview.isValid) {
      setShowAuth(true);
    }
  }, [user, userLoading, preview, token]);

  // Clean up token when user is logged in and viewing the page
  useEffect(() => {
    if (user && token) {
      // Keep token in localStorage until invitation is accepted/declined
      // It will be cleaned up in handleAccept or when user declines
    }
  }, [user, token]);

  const handleAccept = () => {
    if (!token) return;
    acceptInvitation(token, {
      onSuccess: () => {
        // Clean up invitation token
        localStorage.removeItem("pendingInvitationToken");
        // Redirect to dashboard after a short delay
        setTimeout(() => {
          router.push("/dashboard");
        }, 500);
      },
    });
  };

  // Show loader while checking preview
  if (previewLoading || userLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  // Show error if invitation is invalid
  if (previewError || (preview && !preview.isValid)) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center">
                <XCircle className="w-8 h-8 text-red-500" />
              </div>
            </div>
            <CardTitle>Invalid Invitation</CardTitle>
            <CardDescription>
              This invitation link is invalid, expired, or has already been
              used.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/auth/signin">Go to Sign In</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show auth widget if user is not logged in
  if (showAuth && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <AuthenticationWidget
            isSignup={false}
            redirectTo={`/invite/${token}`}
            title="Welcome back!"
            text="Don't have an account yet?"
            button="Sign In"
            link={
              <Link
                href={`/auth/signup?redirect=/invite/${token}`}
                className="text-accent font-medium"
              >
                Sign Up
              </Link>
            }
            invitationInfo={
              preview
                ? {
                    companyName: preview.companyName,
                    role: roleLabels[preview.role],
                    expiresAt: moment(preview.expiresAt).format("MMM DD, YYYY"),
                  }
                : undefined
            }
            emit={() => {
              // Redirect to OTP page after requesting OTP
              router.push("/auth/signin/otp", { scroll: false });
            }}
          />
        </div>
      </div>
    );
  }

  // Show acceptance UI if user is logged in
  if (user && preview) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center">
                <Building2 className="w-8 h-8 text-accent" />
              </div>
            </div>
            <CardTitle>Accept Invitation</CardTitle>
            <CardDescription>
              {preview.companyName} has invited you to join as{" "}
              {roleLabels[preview.role]}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 mb-6">
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <span className="text-sm text-muted-foreground">Company</span>
                <span className="text-sm font-medium">
                  {preview.companyName}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <span className="text-sm text-muted-foreground">Role</span>
                <Badge variant="outline">{roleLabels[preview.role]}</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <span className="text-sm text-muted-foreground">Expires</span>
                <span className="text-sm font-medium">
                  {moment(preview.expiresAt).format("MMM DD, YYYY")}
                </span>
              </div>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  localStorage.removeItem("pendingInvitationToken");
                  router.push("/dashboard");
                }}
                disabled={isAccepting}
              >
                Decline
              </Button>
              <Button
                className="flex-1"
                onClick={handleAccept}
                disabled={isAccepting}
              >
                {isAccepting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Accepting...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Accept Invitation
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
}
