"use client";

import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface FluxTab {
  id: string;
  label: string;
  icon?: LucideIcon;
  count?: number;
}

interface FluxTabsProps {
  tabs: FluxTab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  className?: string;
}

export function FluxTabs({ tabs, activeTab, onTabChange, className }: FluxTabsProps) {
  return (
    <div className={cn("flex gap-1 p-1 bg-slate-100 dark:bg-muted rounded-2xl w-fit", className)}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const Icon = tab.icon;

        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200",
              isActive
                ? "bg-[#00B4B4] text-white shadow-sm"
                : "text-slate-600 dark:text-muted-foreground hover:bg-white/60 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-foreground"
            )}
          >
            {Icon && <Icon className="h-4 w-4" />}
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span
                className={cn(
                  "ml-1 px-2 py-0.5 rounded-full text-xs font-bold",
                  isActive
                    ? "bg-white/20 text-white"
                    : "bg-slate-200 dark:bg-secondary text-slate-600 dark:text-secondary-foreground"
                )}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

interface FluxPillNavProps {
  items: Array<{
    id: string;
    label: string;
    href?: string;
  }>;
  activeId: string;
  onSelect?: (id: string) => void;
  className?: string;
}

export function FluxPillNav({ items, activeId, onSelect, className }: FluxPillNavProps) {
  return (
    <nav className={cn("flex gap-2", className)}>
      {items.map((item) => {
        const isActive = activeId === item.id;

        return (
          <button
            key={item.id}
            onClick={() => onSelect?.(item.id)}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-medium transition-all duration-200",
              isActive
                ? "bg-[#00B4B4] text-white"
                : "bg-slate-100 dark:bg-muted text-slate-600 dark:text-muted-foreground hover:bg-slate-200 dark:hover:bg-muted/80"
            )}
          >
            {item.label}
          </button>
        );
      })}
    </nav>
  );
}
