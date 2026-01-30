"use client";

import { useCompanySwitcher } from "@/hooks/useCompanySwitcher";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { CompanyRole } from "@/types";
import { ChevronDown, Building2, Loader2, Check } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/contexts/sidebar";

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
  [CompanyRole.COLLABORATOR]:
    "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
};

interface CompanySwitcherProps {
  isCollapsed?: boolean;
}

export function CompanySwitcher({ isCollapsed = false }: CompanySwitcherProps) {
  const {
    companies,
    activeCompanyId,
    activeCompany,
    switchCompany,
    isLoadingCompanies,
    isSwitching,
  } = useCompanySwitcher();
  const { isCollapsed: sidebarCollapsed } = useSidebar();

  if (isLoadingCompanies) {
    return (
      <div
        className={cn(
          "flex items-center justify-center p-2",
          sidebarCollapsed && "p-1"
        )}
      >
        <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // If no companies, don't show switcher
  if (companies.length === 0) {
    return null;
  }

  if (sidebarCollapsed || isCollapsed) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="w-full h-10 rounded-md hover:bg-secondary"
          >
            <Building2 className="w-5 h-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-64">
          <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
            Switch Company
          </div>
          {companies.map((company) => (
            <DropdownMenuItem
              key={company.companyId}
              onClick={() => switchCompany(company.companyId)}
              disabled={isSwitching}
              className="flex items-center gap-3 cursor-pointer"
            >
              <div className="flex items-center gap-2 flex-1 min-w-0">
                {company.companyLogo ? (
                  <Image
                    src={company.companyLogo}
                    alt={company.companyName}
                    width={24}
                    height={24}
                    className="rounded object-cover shrink-0"
                  />
                ) : (
                  <div className="w-6 h-6 rounded bg-muted flex items-center justify-center text-xs font-bold text-white shrink-0">
                    {company.companyName[0]}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate">
                    {company.companyName}
                  </div>
                  <Badge
                    className={cn(
                      roleColors[company.role],
                      "border text-xs px-2 py-0.5 mt-0.5"
                    )}
                  >
                    {roleLabels[company.role]}
                  </Badge>
                </div>
              </div>
              {activeCompanyId === company.companyId && (
                <Check className="w-4 h-4 text-accent shrink-0" />
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="w-full justify-between px-3 py-2.5 h-auto hover:bg-secondary"
        >
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {activeCompany?.companyLogo ? (
              <Image
                src={activeCompany.companyLogo}
                alt={activeCompany.companyName}
                width={32}
                height={32}
                className="rounded object-cover shrink-0"
              />
            ) : (
              <div className="w-8 h-8 rounded bg-muted flex items-center justify-center text-sm font-bold text-white shrink-0">
                {activeCompany?.companyName[0] || "?"}
              </div>
            )}
            <div className="flex-1 min-w-0 text-left">
              <div className="font-semibold text-sm truncate">
                {activeCompany?.companyName || "Select Company"}
              </div>
              {activeCompany && (
                <Badge
                  className={cn(
                    roleColors[activeCompany.role],
                    "border text-xs px-2 py-0.5 mt-0.5"
                  )}
                >
                  {roleLabels[activeCompany.role]}
                </Badge>
              )}
            </div>
          </div>
          <ChevronDown className="w-4 h-4 shrink-0 ml-2" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64">
        <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
          Switch Company
        </div>
        {companies.map((company) => (
          <DropdownMenuItem
            key={company.companyId}
            onClick={() => switchCompany(company.companyId)}
            disabled={isSwitching || activeCompanyId === company.companyId}
            className="flex items-center gap-3 cursor-pointer"
          >
            <div className="flex items-center gap-2 flex-1 min-w-0">
              {company.companyLogo ? (
                <Image
                  src={company.companyLogo}
                  alt={company.companyName}
                  width={32}
                  height={32}
                  className="rounded object-cover shrink-0"
                />
              ) : (
                <div className="w-8 h-8 rounded bg-muted flex items-center justify-center text-sm font-bold text-white shrink-0">
                  {company.companyName[0]}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm truncate">
                  {company.companyName}
                </div>
                <Badge
                  className={cn(
                    roleColors[company.role],
                    "border text-xs px-2 py-0.5 mt-0.5"
                  )}
                >
                  {roleLabels[company.role]}
                </Badge>
              </div>
            </div>
            {activeCompanyId === company.companyId && (
              <Check className="w-4 h-4 text-accent shrink-0" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
