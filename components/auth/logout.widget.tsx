"use client";

import { useState } from "react";
import { Modal } from "../ui/modal";
import { Loader } from "../ui/loader";
import { Icon } from "../ui/icons";
import { X } from "lucide-react";
import { Button } from "../ui/button";
import AuthService from "@/services/auth";

interface Props {
  isOpen: boolean;
  handleClose: () => void;
}

export function LogoutWidget(props: Props) {
  const [signoutInProgress, setSignoutInProgress] = useState(false);

  async function signout(): Promise<void> {
    setSignoutInProgress(true);
    await AuthService.logout();
    window.location.replace("/");
  }

  return (
    <Modal
      isOpen={props.isOpen}
      onClose={props.handleClose}
      title={
        <div className="flex flex-row items-center gap-2">
          <Icon name="logout" className="mr-[8px] fill-white size-4 " />
          <span className="line-clamp-2">Log Out</span>
        </div>
      }
    >
      {signoutInProgress && <Loader />}
      <div className="flex flex-row justify-between w-full items-center"></div>
      <p className="font-primary   text-[16px] text-white-100 font-normal uppercase text-center mt-5">
        Are you sure you want to log out?
      </p>
      <hr className="w-full h-px bg-border border-0 rounded my-5" />
      <div className="flex flex-col gap-4  ">
        <Button onClick={signout}>Continue</Button>
        <Button variant="secondary" onClick={props.handleClose}>
          Cancel
        </Button>
      </div>
    </Modal>
  );
}
