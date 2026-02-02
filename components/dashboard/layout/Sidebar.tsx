"use client";
import { Button } from "@/components/ui/button";
import { bottomItems, navItems } from "@/config/dashboard/sidebar";
import { categoryItemsMap } from "@/config/dashboard/navigation";
import { useSidebar } from "@/contexts/sidebar";
import { useNavigation } from "@/contexts/navigation";
import { useCompany } from "@/hooks/useCompanies";
import { useUser } from "@/hooks/useUser";
import { useEffectiveRole } from "@/hooks/useUserRole";
import { useCompanySwitcher } from "@/hooks/useCompanySwitcher";
import { cn, getActiveHref } from "@/lib/utils";
import { hasAnyPermission, hasPermission } from "@/lib/permissions";
import { Menu, X, User, DollarSign, LogOut, ChevronUp, ChevronDown, Check, Loader2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import React, { useMemo, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { LogoutWidget } from "@/components/auth/logout.widget";
import { CompanyRole } from "@/types";

const roleLabels: Record<CompanyRole, string> = {
  [CompanyRole.OWNER]: "Owner",
  [CompanyRole.ADMIN]: "Admin",
  [CompanyRole.MEMBER]: "Member",
  [CompanyRole.COLLABORATOR]: "Collaborator",
};

const roleColors: Record<CompanyRole, string> = {
  [CompanyRole.OWNER]: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  [CompanyRole.ADMIN]: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  [CompanyRole.MEMBER]: "bg-gray-500/20 text-gray-400 border-gray-500/30",
  [CompanyRole.COLLABORATOR]: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
};

// Helper function to get company initials (e.g., "Demo Productions" -> "DP")
const getCompanyInitials = (name: string | undefined): string => {
  if (!name) return "H";
  const words = name.split(" ").filter(word => word.length > 0);
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};

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
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentSection = searchParams.get("section");
  const { data: company } = useCompany();
  const { data: user } = useUser();
  const effectiveRole = useEffectiveRole();
  const [logoutModal, setLogoutModal] = useState(false);
  const { activeCategory } = useNavigation();

  // Company switcher
  const {
    companies,
    activeCompanyId,
    activeCompany,
    switchCompany,
    isLoadingCompanies,
    isSwitching,
  } = useCompanySwitcher();

  // Get items for the active category
  const categoryItems = categoryItemsMap[activeCategory] || [];

  // Filter nav items based on permissions and active category
  const filteredNavItems = useMemo(() => {
    // First filter by category
    const categoryFiltered = navItems.filter((item) =>
      categoryItems.includes(item.label)
    );

    if (!effectiveRole) return categoryFiltered;
    return categoryFiltered.filter((item) => {
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
  }, [effectiveRole, user, categoryItems]);

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
          "fixed lg:relative z-40 top-0 left-0 h-full flex flex-col transition-all duration-300",
          "bg-transparent",
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
        {/* Header - Company Switcher */}
        <div className={cn("px-3 py-4", isCollapsed && "px-2")}>
          {isLoadingCompanies ? (
            <div className="flex items-center justify-center p-2">
              <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
            </div>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className={cn(
                    "w-full flex items-center gap-3 rounded-xl p-2 hover:bg-white/10 transition-colors",
                    isCollapsed && "justify-center"
                  )}
                >
                  <div className="w-[38px] h-[38px] rounded-xl bg-gradient-to-br from-[#00B4B4] to-[#00a0a0] flex items-center justify-center text-sm font-bold text-white shrink-0">
                    {getCompanyInitials(activeCompany?.companyName || company?.name)}
                  </div>
                  {!isCollapsed && (
                    <div className="flex-1 min-w-0 text-left">
                      <h3 className="text-white text-sm font-semibold truncate">
                        {activeCompany?.companyName || company?.name || "Hiway"}
                      </h3>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        {activeCompany?.role && (
                          <Badge
                            className={cn(
                              roleColors[activeCompany.role],
                              "border text-[10px] px-1.5 py-0"
                            )}
                          >
                            {roleLabels[activeCompany.role]}
                          </Badge>
                        )}
                        <ChevronDown size={14} className="text-gray-400 shrink-0" />
                      </div>
                    </div>
                  )}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" side="bottom" sideOffset={5} className="w-64 z-[100]">
                <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                  Switch Company
                </div>
                {companies.length === 0 ? (
                  <div className="px-2 py-3 text-sm text-muted-foreground">
                    No companies available
                  </div>
                ) : null}
                {companies.map((comp) => (
                  <DropdownMenuItem
                    key={comp.companyId}
                    onClick={() => switchCompany(comp.companyId)}
                    disabled={isSwitching || activeCompanyId === comp.companyId}
                    className="flex items-center gap-3 cursor-pointer"
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      {comp.companyLogo ? (
                        <Image
                          src={comp.companyLogo}
                          alt={comp.companyName}
                          width={32}
                          height={32}
                          className="rounded-lg object-cover shrink-0"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#00B4B4] to-[#00a0a0] flex items-center justify-center text-sm font-bold text-white shrink-0">
                          {comp.companyName[0]}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate">
                          {comp.companyName}
                        </div>
                        <Badge
                          className={cn(
                            roleColors[comp.role],
                            "border text-[10px] px-1.5 py-0 mt-0.5"
                          )}
                        >
                          {roleLabels[comp.role]}
                        </Badge>
                      </div>
                    </div>
                    {activeCompanyId === comp.companyId && (
                      <Check className="w-4 h-4 text-[#00B4B4] shrink-0" />
                    )}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* Collapse/Expand button */}
          {!isCollapsed && (
            <button
              onClick={collapseSidebar}
              className="absolute top-4 right-3 p-2 rounded-lg hover:bg-white/10 transition-colors text-gray-400 hover:text-white"
              aria-label="Collapse sidebar"
            >
              <Menu size={20} />
            </button>
          )}
        </div>

        {/* Collapse toggle when sidebar is collapsed - appears above nav */}
        {isCollapsed && (
          <div className="flex justify-center px-3 pb-2">
            <button
              onClick={expandSidebar}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors text-gray-400 hover:text-white"
              aria-label="Expand sidebar"
            >
              <Menu size={20} />
            </button>
          </div>
        )}
        {/* Navigation */}
        <nav
          className={cn(
            "flex-1 px-3 py-2 space-y-1 overflow-y-auto flex flex-col",
            isCollapsed ? "items-center" : "items-start w-full"
          )}
        >
          {filteredNavItems.map(({ label, icon: Icon, comingSoon, href, childGroups }) => {
            const hasChildGroups = childGroups && childGroups.length > 0;

            // For items with child groups (like Analytics), render the grouped list
            if (hasChildGroups && !isCollapsed) {
              return (
                <div key={label} className="w-full space-y-3">
                  {childGroups.map((group) => (
                    <div key={group.groupLabel}>
                      <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider px-3 mb-1">
                        {group.groupLabel}
                      </div>
                      <div className="space-y-0.5">
                        {group.items.map((child) => {
                          const childPath = child.href.split("?")[0];
                          const childSection = new URLSearchParams(child.href.split("?")[1] || "").get("section");
                          const isChildItemActive = pathname.startsWith(childPath) && (!childSection || childSection === currentSection || (!currentSection && childSection === "analytics-overview"));
                          const ChildIcon = child.icon;

                          return (
                            <Link
                              key={child.label}
                              href={child.href}
                              onClick={() => {
                                if (window.innerWidth < 1024) {
                                  closeSidebar();
                                }
                              }}
                              className={cn(
                                "flex items-center gap-2 rounded-xl px-3 py-2 text-sm transition-all duration-200",
                                isChildItemActive
                                  ? "bg-[#00B4B4] text-white"
                                  : "text-gray-400 hover:bg-white/10 hover:text-white"
                              )}
                            >
                              {ChildIcon && <ChildIcon size={16} className="shrink-0" />}
                              <span>{child.label}</span>
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              );
            }

            // For collapsed sidebar with child groups, show all child icons
            if (hasChildGroups && isCollapsed) {
              // Flatten all items from all groups
              const allItems = childGroups.flatMap(group => group.items);
              return (
                <div key={label} className="flex flex-col items-center gap-1">
                  {allItems.map((child) => {
                    const childPath = child.href.split("?")[0];
                    const childSection = new URLSearchParams(child.href.split("?")[1] || "").get("section");
                    const isChildItemActive = pathname.startsWith(childPath) && (!childSection || childSection === currentSection || (!currentSection && childSection === "analytics-overview"));
                    const ChildIcon = child.icon;

                    return (
                      <Link
                        key={child.label}
                        href={child.href}
                        title={child.label}
                        className={cn(
                          "flex items-center justify-center rounded-xl transition-all duration-200 size-10",
                          isChildItemActive
                            ? "bg-[#00B4B4] text-white"
                            : "text-gray-400 hover:bg-white/10 hover:text-white"
                        )}
                      >
                        {ChildIcon && <ChildIcon size={18} className="shrink-0" />}
                      </Link>
                    );
                  })}
                </div>
              );
            }

            return (
              <Link
                href={comingSoon ? "#" : href || ""}
                key={label}
                onClick={() => {
                  if (window.innerWidth < 1024) {
                    closeSidebar();
                  }
                }}
                className={cn(
                  "flex items-center gap-3 rounded-2xl transition-all duration-200 whitespace-nowrap",
                  isActive(href || "") && !comingSoon
                    ? "bg-[#00B4B4] text-white shadow-lg shadow-[#00B4B4]/20"
                    : "text-gray-400",
                  !comingSoon && !isActive(href || "") && "hover:bg-white/10 hover:text-white",
                  isCollapsed
                    ? "justify-center size-10"
                    : "px-3 py-2.5 w-full justify-start",
                  comingSoon &&
                    "opacity-40 cursor-not-allowed pointer-events-none"
                )}
              >
                <Icon size={20} className="shrink-0" />
                {!isCollapsed && (
                  <span className="flex flex-col">
                    <span className="font-medium text-sm">{label}</span>
                    {comingSoon && (
                      <span className="text-xs text-gray-500 leading-tight">
                        Coming Soon
                      </span>
                    )}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
        {/* Bottom actions (optional) */}
        <div
          className={cn(
            "flex items-center justify-between py-3 border-t border-white/10 px-3",
            isCollapsed && "flex-col gap-2"
          )}
        >
          {filteredBottomItems.map(
            ({ label, icon: Icon, comingSoon, href }) => (
              <Link
                href={comingSoon ? "#" : href || ""}
                key={label}
                className={cn(
                  "flex rounded-xl transition-all duration-200 size-10 justify-center items-center text-gray-400",
                  href === pathname && !comingSoon
                    ? "bg-[#00B4B4] text-white"
                    : "hover:bg-white/10 hover:text-white",
                  comingSoon &&
                    "opacity-40 cursor-not-allowed pointer-events-none"
                )}
              >
                <Icon size={20} />
              </Link>
            )
          )}
        </div>
        {/* User Info with Dropdown */}
        <div className="px-3 py-3 border-t border-white/10">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className={cn(
                  "w-full flex items-center gap-3 rounded-xl p-2 hover:bg-white/10 transition-colors",
                  isCollapsed && "justify-center"
                )}
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#00B4B4] to-[#00a0a0] flex items-center justify-center text-sm font-bold text-white shrink-0">
                  {user?.firstName?.[0] || "A"}{user?.lastName?.[0] || "G"}
                </div>
                {!isCollapsed && (
                  <>
                    <div className="flex flex-col text-left flex-1 min-w-0">
                      <span className="text-white text-sm font-medium truncate">
                        {user?.firstName && user?.lastName
                          ? `${user.firstName} ${user.lastName}`
                          : "Adam Greenwood"}
                      </span>
                      <span className="text-gray-500 text-xs truncate">
                        {user?.email || "adam@example.com"}
                      </span>
                    </div>
                    <ChevronUp size={16} className="text-gray-400 shrink-0" />
                  </>
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" side="top" className="w-56 mb-2">
              <DropdownMenuItem onClick={() => router.push("/dashboard/settings")}>
                <User className="w-4 h-4 mr-2" />
                Profile Settings
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push("/account")}>
                <DollarSign className="w-4 h-4 mr-2" />
                Media Purchases
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => setLogoutModal(true)}
                className="text-destructive focus:text-destructive"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Log Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <LogoutWidget
          isOpen={logoutModal}
          handleClose={() => setLogoutModal(false)}
        />
        {/* Credits */}
        <div
          className={cn(
            "text-xs py-4 border-t border-white/10 text-center text-gray-500",
            isCollapsed && "flex flex-col gap-2 items-center justify-center"
          )}
        >
          Powered by{" "}
          <img
            src="/images/hiway-logo-light.png"
            alt="Hiway"
            width={50}
            height={16}
            className="inline-block ml-1"
          />
        </div>
      </aside>
    </>
  );
};
