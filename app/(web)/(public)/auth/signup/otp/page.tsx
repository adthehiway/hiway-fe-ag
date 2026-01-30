"use client";

import { OtpWidget } from "@/components/auth/otp.widget";
import { Loader } from "@/components/ui/loader";
import { useDto } from "@/contexts/dto";
import { redirectTo } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function OtpPage() {
  const { data } = useDto();
  const router = useRouter();

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
      router.push("/auth/signup", { scroll: false });
    }
  }, []);

  return (
    <>
      {data && data.email && (
        <>
          <OtpWidget emit={() => createUser()} />
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
