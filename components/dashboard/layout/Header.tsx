"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSidebar } from "@/contexts/sidebar";
import { Bell, Check, Menu, Moon, Palette, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { TopNavigation } from "./TopNavigation";

const THEMES = [
  { id: "light", label: "Light", icon: Sun },
  { id: "light-v1-1", label: "Light V1.1", icon: Sun },
  { id: "dark", label: "Dark V1", icon: Moon },
  { id: "dark-v1-1", label: "Dark V1.1", icon: Moon },
  { id: "dark-v1-2", label: "Dark V1.2", icon: Moon },
  { id: "dark-v2", label: "Dark V2", icon: Palette },
  { id: "dark-v3", label: "Dark V3", icon: Palette },
];

const Header = () => {
  const { toggleSidebar } = useSidebar();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const currentTheme = THEMES.find((t) => t.id === theme) || THEMES[0];
  const CurrentIcon = currentTheme.icon;

  return (
    <header className="sticky top-0 z-10 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="iconSm"
            onClick={toggleSidebar}
            className="text-white/70 hover:text-white hover:bg-white/10 lg:hidden rounded-lg"
          >
            <Menu className="h-5 w-5" />
          </Button>

          {/* Top Navigation - left aligned */}
          <TopNavigation />
        </div>

        {/* Right side icons */}
        <div className="flex items-center gap-1">
          {/* Notifications */}
          <Button
            variant="ghost"
            size="iconSm"
            className="text-white/70 hover:text-white hover:bg-white/10 rounded-lg relative"
          >
            <Bell className="h-5 w-5" />
            {/* Notification badge */}
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
          </Button>

          {/* Theme dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="iconSm"
                className="text-white/70 hover:text-white hover:bg-white/10 rounded-lg"
              >
                {mounted && <CurrentIcon className="h-5 w-5" />}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              {THEMES.map((t) => {
                const Icon = t.icon;
                return (
                  <DropdownMenuItem
                    key={t.id}
                    onClick={() => setTheme(t.id)}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4" />
                      <span>{t.label}</span>
                    </div>
                    {theme === t.id && <Check className="h-4 w-4" />}
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default Header;
