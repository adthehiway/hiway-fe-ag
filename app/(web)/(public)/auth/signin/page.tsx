"use client";

import { AuthenticationWidget } from "@/components/auth/authentication.widget";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SignInPage() {
  const router = useRouter();

  function redirectAfterLogin() {
    router.push("/auth/signin/otp", { scroll: false });
  }

  return (
    <>
      <AuthenticationWidget
        isSignup={false}
        redirectTo="/auth/signup/package"
        title="Welcome back!"
        text="Don't have an account yet?"
        button="Sign In"
        link={
          <Link href={"/auth/signup"} className="text-[#00B4B4] font-medium hover:text-[#00d4d4] transition-colors">
            Sign Up
          </Link>
        }
        emit={() => redirectAfterLogin()}
      />
    </>
  );
}
