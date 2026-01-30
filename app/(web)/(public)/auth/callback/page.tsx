"use client";

import { Loader } from "@/components/ui/loader";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";

const CallBackComponent = () => {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const handleCallback = async () => {
      const redirectTo = localStorage.getItem("redirectTo");
      const invitationToken = localStorage.getItem("pendingInvitationToken");

      // Prioritize invitation acceptance over other redirects
      if (invitationToken) {
        localStorage.removeItem("pendingInvitationToken");
        localStorage.removeItem("redirectTo");
        router.push(`/invite/${invitationToken}`);
        return;
      }

      if (redirectTo) {
        localStorage.removeItem("redirectTo");
        router.push(redirectTo);
        return;
      }

      router.push("/account");
    };

    handleCallback();
  }, [router, searchParams]);
  return (
    <main className="relative h-full flex items-center justify-center">
      <Loader backdrop={false} />
    </main>
  );
};

export default function AuthCallback() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CallBackComponent />
    </Suspense>
  );
}
