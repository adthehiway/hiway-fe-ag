"use client";

import { AuthenticationWidget } from "@/components/auth/authentication.widget";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

export default function SignInPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Extract invitation token from redirect URL if present
    const redirect = searchParams.get("redirect");
    if (redirect && redirect.startsWith("/invite/")) {
      const token = redirect.split("/invite/")[1];
      if (token) {
        localStorage.setItem("pendingInvitationToken", token);
      }
    }
  }, [searchParams]);

  function redirectAfterLogin() {
    router.push("/auth/signup/otp", { scroll: false });
  }

  return (
    <>
      <AuthenticationWidget
        redirectTo={searchParams.get("redirect") || "/auth/signup/package"}
        isSignup={true}
        title="Create your account"
        text="Already have an account?"
        button="Sign Up"
        link={
          <Link href={"/auth/signin"} className="text-accent font-medium">
            Sign In
          </Link>
        }
        emit={() => redirectAfterLogin()}
      />
    </>
  );
}
