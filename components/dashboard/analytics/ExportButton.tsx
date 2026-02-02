"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Download, FileSpreadsheet, FileText, ChevronDown } from "lucide-react";
import { toast } from "react-toastify";

interface ExportButtonProps {
  onExport?: (format: string, timeframe: string) => void;
  className?: string;
}

const timeframeOptions = [
  { label: "Last 7 days", value: "7" },
  { label: "Last 14 days", value: "14" },
  { label: "Last 28 days", value: "28" },
  { label: "Last 90 days", value: "90" },
  { label: "Last 365 days", value: "365" },
  { label: "All time", value: "all" },
];

export function ExportButton({ onExport, className }: ExportButtonProps) {
  const [selectedTimeframe, setSelectedTimeframe] = useState("28");
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async (format: string) => {
    setIsExporting(true);

    // Simulate export process
    await new Promise(resolve => setTimeout(resolve, 1000));

    if (onExport) {
      onExport(format, selectedTimeframe);
    }

    const timeframeLabel = timeframeOptions.find(t => t.value === selectedTimeframe)?.label || selectedTimeframe;
    toast.success(`Exporting ${format.toUpperCase()} for ${timeframeLabel}...`);

    setIsExporting(false);
  };

  const selectedTimeframeLabel = timeframeOptions.find(t => t.value === selectedTimeframe)?.label || "Last 28 days";

  return (
    <div className={className}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="gap-2" disabled={isExporting}>
            <Download className="h-4 w-4" />
            Export
            <ChevronDown className="h-3 w-3 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <div className="px-2 py-1.5">
            <p className="text-xs font-medium text-muted-foreground mb-2">Time Frame</p>
            <div className="grid grid-cols-2 gap-1">
              {timeframeOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setSelectedTimeframe(option.value)}
                  className={`px-2 py-1.5 text-xs rounded-md transition-colors ${
                    selectedTimeframe === option.value
                      ? "bg-[#00B4B4] text-white"
                      : "bg-muted hover:bg-muted/80 text-foreground"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
          <DropdownMenuSeparator />
          <div className="px-2 py-1.5">
            <p className="text-xs font-medium text-muted-foreground mb-2">Export Format</p>
          </div>
          <DropdownMenuItem onClick={() => handleExport("csv")} className="gap-2">
            <FileSpreadsheet className="h-4 w-4" />
            <div className="flex flex-col">
              <span>Export as CSV</span>
              <span className="text-xs text-muted-foreground">{selectedTimeframeLabel}</span>
            </div>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleExport("xlsx")} className="gap-2">
            <FileSpreadsheet className="h-4 w-4" />
            <div className="flex flex-col">
              <span>Export as Excel</span>
              <span className="text-xs text-muted-foreground">{selectedTimeframeLabel}</span>
            </div>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleExport("pdf")} className="gap-2">
            <FileText className="h-4 w-4" />
            <div className="flex flex-col">
              <span>Export as PDF</span>
              <span className="text-xs text-muted-foreground">{selectedTimeframeLabel}</span>
            </div>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
