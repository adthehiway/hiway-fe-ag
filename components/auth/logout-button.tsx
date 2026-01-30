"use client";

import { Loader } from "@/components/ui/loader";
import { useState } from "react";
import { Button } from "../ui/button";
import AuthService from "@/services/auth";

export default function LogoutButton() {
  const [signoutInProgress, setSignoutInProgress] = useState(false);

  async function signout(): Promise<void> {
    setSignoutInProgress(true);
    await AuthService.logout();
    window.location.replace("/");
  }

  return (
    <>
      {signoutInProgress && (
        <div className="fixed w-full h-full top-0 left-0 z-50">
          <Loader />
        </div>
      )}
      <div className="absolute top-[20px] right-[20px]">
        <Button onClick={() => signout()}>Logout</Button>
      </div>
    </>
  );
}
