import React from "react";
import { Play } from "lucide-react";
import { cn } from "@/lib/utils";

interface PlayOverlayProps {
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
}

const PlayOverlay: React.FC<PlayOverlayProps> = ({
  onClick,
  className = "",
  disabled = false,
}) => {
  return (
    <div
      className={cn(
        "absolute inset-0 flex items-center justify-center bg-black/40 transition-opacity duration-200",
        !disabled
          ? "hover:bg-black/50 cursor-pointer group"
          : "opacity-60",
        className
      )}
      onClick={!disabled ? onClick : undefined}
    >
      <div className="relative">
        {/* Outer circle with gradient effect */}
        <div
          className={cn(
            "w-16 h-16 rounded-full bg-gradient-to-br from-gray-600 to-gray-700 shadow-lg flex items-center justify-center transition-transform duration-200",
            !disabled && "group-hover:scale-110"
          )}
        >
          {/* Inner circle for depth */}
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-gray-500 to-gray-600 flex items-center justify-center">
            {/* Play icon */}
            <Play className="w-6 h-6 text-white fill-white ml-1" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlayOverlay;
