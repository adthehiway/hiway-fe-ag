"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { LogoutWidget } from "./logout.widget";
import { Building2, DollarSign, User } from "lucide-react";
import { Icon } from "../ui/icons";
import { useUser } from "@/hooks/useUser";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { getInitials } from "@/lib/utils";

export function ProfileWidget({ emit }: any) {
  const router = useRouter();
  const currentPath = usePathname();
  const { data: user } = useUser();
  const [logoutModal, setLogoutModal] = useState(false);

  const isDashboard = currentPath.startsWith("/dashboard");
  if (!user) return null;

  const menuItems = [
    {
      icon: <User className="w-4 h-4 " />,
      name: "Dashboard",
      hidden: isDashboard || !user?.company?.id,
      onClick: () => router.push("/dashboard", { scroll: false }),
    },
    {
      icon: <User className="w-4 h-4 " />,
      name: "Profile Settings",
      hidden: !user?.company?.id,
      onClick: () => router.push("/dashboard/settings", { scroll: false }),
    },
    {
      icon: <DollarSign className="w-4 h-4" />,
      name: "Media Purchases",
      hidden: false,
      onClick: () => router.push("/account", { scroll: false }),
    },
    {
      icon: <Building2 className="w-4 h-4" />,
      name: "Create Publisher Account",
      hidden: user?.company?.id,
      onClick: () => router.push("/auth/signup/package", { scroll: false }),
    },
  ];

  return (
    <div className="relative">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Avatar className="cursor-pointer">
            <AvatarImage src={user.image} />
            <AvatarFallback>{getInitials(user)}</AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-[200px]">
          {menuItems
            .filter((item) => !item.hidden)
            .map((item) => (
              <DropdownMenuItem key={item.name} onClick={item.onClick}>
                {item.icon}
                {item.name}
              </DropdownMenuItem>
            ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => setLogoutModal(true)}
            className="text-destructive"
          >
            Log Out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <LogoutWidget
        isOpen={logoutModal}
        handleClose={() => setLogoutModal(false)}
      />
    </div>
  );
}
