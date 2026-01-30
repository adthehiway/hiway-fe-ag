"use client";

import { useDla } from "@/contexts/dla";
import { useDto } from "@/contexts/dto";
import { IUser } from "@/types";
import { useEffect, useState } from "react";
import { Modal } from "../ui/modal";
import { AuthenticationWidget } from "./authentication.widget";
import Link from "next/link";
import { OtpWidget } from "./otp.widget";
import { TwoFactorValidationWidget } from "./two-factor-validation.widget";
import { Button } from "../ui/button";
import { useRouter } from "next/navigation";

interface Props {
  isOpen: boolean;
  handleClose: (reload: boolean) => void;
  loginUI?: boolean;
  setIsRedirecting?: (value: boolean) => void; // Receive it
  redirectTo?: string;
}

export function AuthenticationModalWidget(props: Props) {
  const { data } = useDto();

  const [isOtpUI, setIsOtpUI] = useState(false);
  const [is2FAUI, setIs2FAUI] = useState(false);
  const [isLoginUI, setLoginUI] = useState(props.loginUI ?? true);
  const router = useRouter();

  // Sync state with props when modal opens
  useEffect(() => {
    setLoginUI(props.loginUI ?? true);
  }, [props.loginUI]);

  function createUser() {
    // refresh the page
    window.location.reload();
    props.handleClose(true);
  }

  return (
    <Modal
      isOpen={props.isOpen}
      onClose={() => {
        props.setIsRedirecting?.(true); // Only calls if it exists
        props.handleClose(false);
      }}
      className=""
    >
      {is2FAUI ? (
        <TwoFactorValidationWidget
          email={data?.email || ""}
          redirectTo={props.redirectTo}
          isModal={true}
          onBack={() => {
            setIs2FAUI(false);
            setIsOtpUI(false);
          }}
        />
      ) : isOtpUI ? (
        <OtpWidget
          emit={() => createUser()}
          isModal={true}
          onRequires2FA={() => setIs2FAUI(true)}
        />
      ) : isLoginUI ? (
        <AuthenticationWidget
          isSignup={false}
          title="Log in"
          text="Don't have an account yet?"
          button="Sign In"
          link={
            <Button
              variant={"link"}
              onClick={() => setLoginUI(false)}
              className="text-accent font-medium h-0 px-1 text-sm"
            >
              Sign Up
            </Button>
          }
          emit={() => setIsOtpUI(true)}
          redirectTo={props.redirectTo ?? ""}
          isModal={true}
        />
      ) : (
        <AuthenticationWidget
          title="Create your account"
          text="Already have an account?"
          button="Sign Up"
          link={
            <Button
              variant={"link"}
              onClick={() => setLoginUI(true)}
              className="text-accent font-medium h-0 px-1 text-sm"
            >
              Sign In
            </Button>
          }
          emit={() => setIsOtpUI(true)}
          isSignup={true}
          redirectTo={props.redirectTo ?? ""}
          isModal={true}
        />
      )}
    </Modal>
  );
}
