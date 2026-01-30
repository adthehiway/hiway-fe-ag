"use client";

import { useState } from "react";
import Image from "next/image";
import { ProfileWidget } from "../auth/profile.widget";
import { Button } from "../ui/button";
import { Icon } from "../ui/icons";
import { AuthenticationModalWidget } from "../auth/authentication-modal.widget";
import { useUser } from "@/hooks/useUser";

export function NavBarWatchWidget({
  isPlayerVisible = false,
  isEmbedded = false,
}: {
  isPlayerVisible?: boolean;
  isEmbedded?: boolean;
}) {
  const { data: user } = useUser();
  const [authenticationModal, setAuthenticationModal] = useState(false);

  return (
    <nav className="h-[75px] w-full z-30">
      <div className="bg-black xl:bg-transparent flex flex-wrap h-full items-center justify-between px-5">
        <div className="w-[128px] xl:w-[172px] h-6 xl:h-8">
          {/* {!isPlayerVisible && (
            <div className="h-full w-full">
              <Image
                src="/images/logo-with-text-hiway.svg"
                alt="HiWay"
                height={40}
                width={130}
              />
            </div>
          )} */}
        </div>

        {user && <ProfileWidget />}
        {!user && !isEmbedded && (
          <Button onClick={() => setAuthenticationModal(true)}>
            Join
            <Icon name="wallet" className="pl-[8px]" />
          </Button>
        )}

        {authenticationModal && (
          <AuthenticationModalWidget
            isOpen={authenticationModal}
            handleClose={() => setAuthenticationModal(false)}
          ></AuthenticationModalWidget>
        )}
      </div>
    </nav>
  );
}
