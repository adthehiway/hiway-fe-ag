"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  TrendingUp,
  Film,
  Link as LinkIcon,
  MonitorPlay,
  Search,
  SlidersHorizontal,
  Calendar,
  Building2,
  RotateCcw,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type ViewSection = "overview" | "content" | "smartlinks" | "smartrooms";

interface SectionItemProps {
  icon: React.ElementType;
  title: string;
  description: string;
  isActive: boolean;
  onClick: () => void;
}

function SectionItem({ icon: Icon, title, description, isActive, onClick }: SectionItemProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors",
        isActive
          ? "bg-[#00B4B4]/10 border border-[#00B4B4]/20"
          : "hover:bg-muted"
      )}
    >
      <div className={cn(
        "p-2 rounded-lg",
        isActive ? "bg-[#00B4B4]/20" : "bg-muted"
      )}>
        <Icon className={cn("h-5 w-5", isActive ? "text-[#00B4B4]" : "text-muted-foreground")} />
      </div>
      <div>
        <p className={cn("font-medium text-sm", isActive ? "text-[#00B4B4]" : "")}>{title}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
    </button>
  );
}

interface AnalyticsFilterSidebarProps {
  activeSection: ViewSection;
  onSectionChange: (section: ViewSection) => void;
  searchFilter: string;
  onSearchChange: (search: string) => void;
  dateRange: string;
  onDateRangeChange: (range: string) => void;
  accessModel?: string;
  onAccessModelChange?: (model: string) => void;
  selectedCompany?: string;
  onCompanyChange?: (company: string) => void;
  companies?: { id: string; name: string }[];
  resultsCount?: number;
  showAccessModel?: boolean;
}

export function AnalyticsFilterSidebar({
  activeSection,
  onSectionChange,
  searchFilter,
  onSearchChange,
  dateRange,
  onDateRangeChange,
  accessModel = "all",
  onAccessModelChange,
  selectedCompany = "all",
  onCompanyChange,
  companies = [],
  resultsCount = 0,
  showAccessModel = false,
}: AnalyticsFilterSidebarProps) {
  const resetFilters = () => {
    onSearchChange("");
    onDateRangeChange("28");
    if (onAccessModelChange) onAccessModelChange("all");
    if (onCompanyChange) onCompanyChange("all");
  };

  return (
    <Card className="w-72 shrink-0 h-fit sticky top-6">
      <CardContent className="p-4 space-y-6">
        {/* Header with Period Badge */}
        <div className="flex items-center justify-between border-b border-border pb-4">
          <h3 className="font-semibold">Sections</h3>
          <Badge variant="secondary" className="font-mono">{dateRange}D</Badge>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search across this section..."
            className="pl-9 bg-muted/30"
            value={searchFilter}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>

        {/* Analytics Views Section */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Analytics views</p>
          <div className="space-y-1">
            <SectionItem
              icon={TrendingUp}
              title="Overview"
              description="Engagement trends & funnel"
              isActive={activeSection === "overview"}
              onClick={() => onSectionChange("overview")}
            />
            <SectionItem
              icon={Film}
              title="By Content"
              description="Engagement by media"
              isActive={activeSection === "content"}
              onClick={() => onSectionChange("content")}
            />
            <SectionItem
              icon={LinkIcon}
              title="By SmartLink"
              description="CTR & watch time by link"
              isActive={activeSection === "smartlinks"}
              onClick={() => onSectionChange("smartlinks")}
            />
            <SectionItem
              icon={MonitorPlay}
              title="By SmartRoom"
              description="Room engagement metrics"
              isActive={activeSection === "smartrooms"}
              onClick={() => onSectionChange("smartrooms")}
            />
          </div>
        </div>

        {/* Filters Section */}
        <div className="space-y-4 pt-4 border-t border-border">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
            <SlidersHorizontal className="h-3 w-3" />
            Filters
          </p>

          {/* Access Model Filter - Only show for smartlinks */}
          {showAccessModel && activeSection === "smartlinks" && onAccessModelChange && (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">Access model</p>
              <Select value={accessModel} onValueChange={onAccessModelChange}>
                <SelectTrigger className="bg-muted/30">
                  <SelectValue placeholder="All models" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All models</SelectItem>
                  <SelectItem value="FREE">Free</SelectItem>
                  <SelectItem value="PAID">Paid</SelectItem>
                  <SelectItem value="RENTAL">Rental</SelectItem>
                  <SelectItem value="SUBSCRIPTION">Subscription</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Period Filter */}
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              Period
            </p>
            <Select value={dateRange} onValueChange={onDateRangeChange}>
              <SelectTrigger className="bg-muted/30">
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="14">Last 14 days</SelectItem>
                <SelectItem value="28">Last 28 days</SelectItem>
                <SelectItem value="90">Last 90 days</SelectItem>
                <SelectItem value="365">Last year</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Publisher Filter */}
          {companies.length > 0 && onCompanyChange && (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Building2 className="h-3 w-3" />
                Publisher
              </p>
              <Select value={selectedCompany} onValueChange={onCompanyChange}>
                <SelectTrigger className="bg-muted/30">
                  <SelectValue placeholder="All publishers" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All publishers</SelectItem>
                  {companies.map((company) => (
                    <SelectItem key={company.id} value={company.id}>
                      {company.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Reset & Results */}
          <div className="flex items-center justify-between pt-2">
            <Button variant="ghost" size="sm" onClick={resetFilters} className="gap-1 text-xs">
              <RotateCcw className="h-3 w-3" />
              Reset
            </Button>
            <span className="text-xs text-muted-foreground">
              {resultsCount} results
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
