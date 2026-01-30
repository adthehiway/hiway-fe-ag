"use client";
import { Button } from "@/components/ui/button";
import { bottomItems, navItems } from "@/config/dashboard/sidebar";
import { useSidebar } from "@/contexts/sidebar";
import { useCompany } from "@/hooks/useCompanies";
import { useUser } from "@/hooks/useUser";
import { useEffectiveRole } from "@/hooks/useUserRole";
import { cn, getActiveHref } from "@/lib/utils";
import { hasAnyPermission, hasPermission } from "@/lib/permissions";
import { X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useMemo } from "react";
import { CompanySwitcher } from "./CompanySwitcher";

export const Sidebar: React.FC = () => {
  const {
    isOpen,
    isCollapsed,
    collapseSidebar,
    expandSidebar,
    toggleSidebar,
    closeSidebar,
  } = useSidebar();
  const pathname = usePathname();
  const { data: company } = useCompany();
  const { data: user } = useUser();
  const effectiveRole = useEffectiveRole();

  // Filter nav items based on permissions
  const filteredNavItems = useMemo(() => {
    if (!effectiveRole) return navItems;
    return navItems.filter((item) => {
      // Show coming soon items (they'll be disabled anyway)
      if (item.comingSoon) return true;
      // If no permission required, show it
      if (!item.requiredPermission) return true;
      // Check if user has required permission
      return hasAnyPermission(
        effectiveRole,
        item.requiredPermission,
        user || undefined
      );
    });
  }, [effectiveRole, user]);

  // Filter bottom items based on permissions
  const filteredBottomItems = useMemo(() => {
    if (!effectiveRole) return bottomItems;
    return bottomItems.filter((item) => {
      // Show coming soon items (they'll be disabled anyway)
      if (item.comingSoon) return true;
      // If no permission required, show it
      if (!item.requiredPermission) return true;
      // Check if user has required permission
      return hasAnyPermission(
        effectiveRole,
        item.requiredPermission,
        user || undefined
      );
    });
  }, [effectiveRole, user]);

  const navHrefs = filteredNavItems
    .map((item) => item.href || "")
    .filter(Boolean);
  const bottomHrefs = filteredBottomItems
    .map((item) => item.href || "")
    .filter(Boolean);

  const activeHref = getActiveHref(pathname, [...navHrefs, ...bottomHrefs]);
  const isActive = (href: string) => href === activeHref;

  return (
    <>
      {/* Overlay for mobile */}
      <div
        className={cn(
          "fixed inset-0 z-30 bg-black/40 transition-opacity lg:hidden",
          isOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        )}
        onClick={closeSidebar}
        aria-hidden="true"
      />

      <aside
        className={cn(
          "fixed z-40 top-0 left-0 h-full flex flex-col bg-sidebar text-sidebar-foreground transition-all duration-300 border-r ",
          "shadow-lg",
          isOpen ? "translate-x-0" : "-translate-x-full",
          isCollapsed ? "w-20" : "w-64",
          "lg:translate-x-0"
        )}
      >
        {isOpen && (
          <Button
            size="iconSm"
            variant="secondary"
            className="lg:hidden z-50 fixed -right-12 top-4 "
            onClick={toggleSidebar}
            aria-label="Close sidebar "
          >
            <X className="size-6" />
          </Button>
        )}
        {/* Header */}
        <div
          className={cn(
            "flex items-center  px-4 h-16 border-b gap-3 ",
            isCollapsed ? "justify-center" : "justify-start"
          )}
        >
          {company?.logo ? (
            <Image
              src={company.logo}
              alt={company?.name || ""}
              width={38}
              height={38}
              className="rounded object-cover shrink-0"
            />
          ) : (
            <div className="w-[38px] h-[38px] rounded bg-muted flex items-center justify-center text-lg font-bold text-white">
              {company?.name?.[0] || "?"}
            </div>
          )}
          {!isCollapsed && (
            <h3 className="text-sidebar-primary-foreground text-sm font-medium whitespace-nowrap line-clamp-1 truncate">
              {company?.name}
            </h3>
          )}
        </div>
        {/* Navigation */}
        <nav
          className={cn(
            "flex-1 px-2 py-4 space-y-1 overflow-y-auto flex flex-col",
            isCollapsed ? "items-center" : "items-start w-full"
          )}
        >
          {filteredNavItems.map(({ label, icon: Icon, comingSoon, href }) => (
            <Link
              href={comingSoon ? "#" : href || ""}
              key={label}
              onClick={() => {
                // Close sidebar on mobile when link is clicked
                if (window.innerWidth < 1024) {
                  closeSidebar();
                }
              }}
              className={cn(
                "flex items-center gap-3 rounded-md transition-colors overflow-hidden whitespace-nowrap",
                isActive(href || "") && !comingSoon
                  ? "bg-accent text-accent-foreground"
                  : "",
                !comingSoon && !isActive(href || "") && "hover:bg-secondary",
                isCollapsed
                  ? "justify-center size-10"
                  : "px-3 py-2.5 w-full justify-start",
                comingSoon &&
                  "opacity-50 cursor-not-allowed pointer-events-none"
              )}
            >
              <Icon size={22} className="shrink-0" />
              {!isCollapsed && (
                <span className="flex flex-col">
                  <span className="font-semibold text-sm">{label}</span>
                  {comingSoon && (
                    <span className="text-xs text-muted-foreground leading-tight">
                      Coming Soon
                    </span>
                  )}
                </span>
              )}
            </Link>
          ))}
        </nav>
        {/* Bottom actions (optional) */}
        <div
          className={cn(
            "flex items-center justify-between py-4 border-t px-2",
            isCollapsed && "flex-col gap-2"
          )}
        >
          {filteredBottomItems.map(
            ({ label, icon: Icon, comingSoon, href }) => (
              <Link
                href={comingSoon ? "#" : href || ""}
                key={label}
                className={cn(
                  "flex rounded-md transition-colors size-10 justify-center items-center ",
                  href === pathname && !comingSoon
                    ? "bg-accent text-accent-foreground "
                    : "hover:bg-secondary",
                  comingSoon &&
                    "opacity-50 cursor-not-allowed pointer-events-none"
                )}
              >
                <Icon size={22} />
              </Link>
            )
          )}
        </div>
        {/* Company Switcher */}
        <div className="px-2 py-3 border-t">
          <CompanySwitcher isCollapsed={isCollapsed} />
        </div>
        {/* Credits */}
        <div
          className={cn(
            "text-xs  py-5 border-t text-center",
            isCollapsed && "flex flex-col gap-2 items-center justify-center"
          )}
        >
          Powered by{" "}
          <img
            src="/images/logo.png"
            alt="Hiway"
            width={50}
            height={50}
            className="text-accent inline-block"
          />
        </div>
      </aside>
    </>
  );
};
