"use client";

import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface KPICardProps {
  title: string;
  value: string | number;
  trend?: number;
  trendLabel?: string;
  icon: LucideIcon;
  iconColor?: string;
  className?: string;
}

export function KPICard({
  title,
  value,
  trend,
  trendLabel,
  icon: Icon,
  iconColor = "text-emerald-600",
  className,
}: KPICardProps) {
  return (
    <div
      className={cn(
        "bg-white dark:bg-card rounded-2xl p-5 shadow-sm border border-slate-200/60 dark:border-border",
        className
      )}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-slate-500 dark:text-muted-foreground">
          {title}
        </span>
        <div className="h-9 w-9 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center">
          <Icon className={cn("h-5 w-5", iconColor)} />
        </div>
      </div>
      <div className="text-3xl font-bold text-slate-900 dark:text-foreground tracking-tight">
        {typeof value === "number" ? value.toLocaleString() : value}
      </div>
      {trend !== undefined && (
        <div className="mt-2 flex items-center gap-2">
          <span
            className={cn(
              "text-xs font-semibold px-2 py-0.5 rounded-full",
              trend >= 0
                ? "text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10"
                : "text-rose-600 bg-rose-50 dark:bg-rose-500/10"
            )}
          >
            {trend >= 0 ? "+" : ""}
            {trend}%
          </span>
          {trendLabel && (
            <span className="text-xs text-slate-400 dark:text-muted-foreground">
              {trendLabel}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

interface QuickStatsGridProps {
  stats: Array<{
    title: string;
    value: string | number;
    icon: LucideIcon;
    trend?: number;
    trendLabel?: string;
    iconColor?: string;
  }>;
  className?: string;
}

export function QuickStatsGrid({ stats, className }: QuickStatsGridProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-2 md:grid-cols-4 gap-4",
        className
      )}
    >
      {stats.map((stat, i) => (
        <KPICard
          key={i}
          title={stat.title}
          value={stat.value}
          icon={stat.icon}
          trend={stat.trend}
          trendLabel={stat.trendLabel}
          iconColor={stat.iconColor}
        />
      ))}
    </div>
  );
}
