"use client";

import { OtpWidget } from "@/components/auth/otp.widget";
import { TwoFactorValidationWidget } from "@/components/auth/two-factor-validation.widget";
import { Loader } from "@/components/ui/loader";
import { useDto } from "@/contexts/dto";
import { redirectTo } from "@/lib/utils";
import { redirect } from "next/dist/server/api-utils";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function OtpPage() {
  const { data } = useDto();
  const router = useRouter();
  const [requires2FA, setRequires2FA] = useState(false);

  function createUser() {
    // Check if there's a pending invitation token
    const invitationToken = localStorage.getItem("pendingInvitationToken");
    if (invitationToken) {
      // Redirect to accept invitation instead of package page
      redirectTo(`/invite/${invitationToken}`);
    } else {
      redirectTo("/auth/signup/package");
    }
  }

  useEffect(() => {
    if (!data || !data.email) {
      router.push("/auth/signin", { scroll: false });
    }
  }, []);

  return (
    <>
      {data && data.email && (
        <>
          {requires2FA ? (
            <TwoFactorValidationWidget
              email={data.email}
              redirectTo="/dashboard"
              onBack={() => {
                setRequires2FA(false);
                router.push("/auth/signin", { scroll: false });
              }}
            />
          ) : (
            <OtpWidget
              emit={() => createUser()}
              onRequires2FA={() => setRequires2FA(true)}
            />
          )}
        </>
      )}
      {(!data || !data.email) && (
        <div className="relative flex flex-col h-[610px] w-[90%] md:w-[90%] md:max-w-[348px] lg:w-[75%] lg:max-w-[520px] bg-muted p-9 rounded-[8px] justify-center items-center">
          <Loader />
        </div>
      )}
    </>
  );
}
