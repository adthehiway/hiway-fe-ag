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
          <Link href={"/auth/signup"} className="text-indigo-600 font-medium hover:text-indigo-700">
            Sign Up
          </Link>
        }
        emit={() => redirectAfterLogin()}
      />
    </>
  );
}
