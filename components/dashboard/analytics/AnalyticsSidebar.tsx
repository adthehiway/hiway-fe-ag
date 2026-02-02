"use client";

import { cn } from "@/lib/utils";
import {
  BarChart3,
  Eye,
  TrendingUp,
  Globe,
  Share2,
  Film,
  DollarSign,
  Unlock,
  Users,
  Building2,
  FileText,
  ChevronDown,
  ChevronRight,
  Play,
  Target,
  Megaphone,
} from "lucide-react";
import { useState } from "react";
import { LucideIcon } from "lucide-react";

interface AnalyticsMenuItem {
  id: string;
  label: string;
  icon: LucideIcon;
  children?: { id: string; label: string }[];
}

const analyticsMenu: AnalyticsMenuItem[] = [
  {
    id: "overview",
    label: "Overview",
    icon: BarChart3,
    children: [
      { id: "analytics-overview", label: "Analytics Overview" },
    ],
  },
  {
    id: "core-video",
    label: "Core Video",
    icon: Play,
    children: [
      { id: "views-engagement", label: "Views & Engagement" },
      { id: "engagement-analysis", label: "Engagement Analysis" },
      { id: "geographic", label: "Geographic" },
      { id: "traffic-sources", label: "Traffic Sources" },
    ],
  },
  {
    id: "content-types",
    label: "Content Types",
    icon: Film,
    children: [
      { id: "free-content", label: "Free Content" },
      { id: "paid-content", label: "Paid Content" },
    ],
  },
  {
    id: "distribution",
    label: "Distribution",
    icon: Share2,
    children: [
      { id: "social-external", label: "Social & External" },
      { id: "b2b-screeners", label: "B2B Screeners" },
      { id: "syndicated", label: "Syndicated" },
    ],
  },
  {
    id: "reports",
    label: "Reports",
    icon: FileText,
    children: [
      { id: "reports-hub", label: "Reports Hub" },
    ],
  },
];

interface AnalyticsSidebarProps {
  activeSection: string;
  onSectionChange: (sectionId: string) => void;
}

export function AnalyticsSidebar({ activeSection, onSectionChange }: AnalyticsSidebarProps) {
  const [expandedSections, setExpandedSections] = useState<string[]>(["overview", "core-video", "content-types", "distribution", "reports"]);

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) =>
      prev.includes(sectionId)
        ? prev.filter((id) => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const isChildActive = (item: AnalyticsMenuItem) => {
    return item.children?.some((child) => child.id === activeSection);
  };

  return (
    <div className="w-56 shrink-0 bg-white dark:bg-card rounded-2xl border border-slate-200/60 dark:border-border p-3 h-fit sticky top-0">
      <div className="text-xs font-semibold text-slate-400 dark:text-muted-foreground uppercase tracking-wider px-3 mb-3">
        Analytics
      </div>
      <nav className="space-y-1">
        {analyticsMenu.map((item) => {
          const Icon = item.icon;
          const isExpanded = expandedSections.includes(item.id);
          const hasActiveChild = isChildActive(item);

          return (
            <div key={item.id}>
              <button
                onClick={() => toggleSection(item.id)}
                className={cn(
                  "flex items-center justify-between w-full px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200",
                  hasActiveChild
                    ? "text-[#00B4B4] bg-[#00B4B4]/5"
                    : "text-slate-600 dark:text-muted-foreground hover:bg-slate-50 dark:hover:bg-muted hover:text-slate-900 dark:hover:text-foreground"
                )}
              >
                <span className="flex items-center gap-2">
                  <Icon className="h-4 w-4" />
                  {item.label}
                </span>
                {item.children && (
                  isExpanded ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )
                )}
              </button>

              {item.children && isExpanded && (
                <div className="ml-4 mt-1 space-y-1 border-l-2 border-slate-100 dark:border-border pl-3">
                  {item.children.map((child) => (
                    <button
                      key={child.id}
                      onClick={() => onSectionChange(child.id)}
                      className={cn(
                        "block w-full text-left px-3 py-1.5 rounded-lg text-sm transition-all duration-200",
                        activeSection === child.id
                          ? "bg-[#00B4B4] text-white font-medium"
                          : "text-slate-500 dark:text-muted-foreground hover:bg-slate-50 dark:hover:bg-muted hover:text-slate-900 dark:hover:text-foreground"
                      )}
                    >
                      {child.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>
    </div>
  );
}
