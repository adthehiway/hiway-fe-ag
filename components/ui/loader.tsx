"use client";

import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

type Props = {
  backdrop?: boolean;
  fullScreen?: boolean;
};

export function Loader({ backdrop = true, fullScreen = false }: Props) {
  return (
    <div
      className={cn(
        "absolute flex inset-0   justify-center items-center text-accent w-full h-full z-50",
        backdrop || fullScreen ? "bg-muted/50  " : "",
        fullScreen ? "fixed inset-0" : "rounded-[8px]"
      )}
    >
      <Loader2 size={32} className="animate-spin" />
    </div>
  );
}
