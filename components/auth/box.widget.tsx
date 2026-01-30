"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";

interface Props {
  title: string;
  children?: any;
  fullWidth?: boolean;
  className?: string;
  isModal?: boolean;
}

export function BoxWidget(props: Props) {
  return (
    <div
      className={cn(
        "relative w-full",
        props.isModal && "p-0",
        props.className
      )}
    >
      <div className="flex flex-col w-full">
        {/* Logo */}
        <div className="mb-10 flex justify-center">
          <Image
            src={"/images/hiway-logo.png"}
            alt="Hiway Logo"
            height={28}
            width={120}
            className="h-7 w-auto"
          />
        </div>

        {/* Title */}
        <h1 className="text-2xl font-medium text-gray-900 text-center tracking-tight">
          {props.title}
        </h1>

        {/* Content */}
        <div className="mt-4">
          {props.children}
        </div>
      </div>
    </div>
  );
}
