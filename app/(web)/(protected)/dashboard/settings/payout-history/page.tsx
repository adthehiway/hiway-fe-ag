"use client";

import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Check,
  Download,
  ArrowUpRight,
  RefreshCcw,
  Clock,
  X,
  AlertCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter } from "next/navigation";
import PageTitle from "@/components/dashboard/layout/PageTitle";
import { usePayoutHistory } from "@/hooks/useMonetization";
import { PayoutHistory, PayoutStatus } from "@/types";
import { useState, useMemo } from "react";

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const formatShortDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
};

const formatCurrency = (amount: number, currency: string = "USD"): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 2,
  }).format(amount);
};

const getStatusBadge = (status: PayoutStatus) => {
  const statusConfig = {
    paid: {
      label: "Paid",
      variant: "success" as const,
      icon: Check,
    },
    pending: {
      label: "Pending",
      variant: "warning" as const,
      icon: Clock,
    },
    in_transit: {
      label: "In Transit",
      variant: "info" as const,
      icon: ArrowUpRight,
    },
    canceled: {
      label: "Canceled",
      variant: "outline" as const,
      icon: X,
    },
    failed: {
      label: "Failed",
      variant: "error" as const,
      icon: AlertCircle,
    },
  };

  return statusConfig[status] || statusConfig.pending;
};

const exportToCSV = (payouts: PayoutHistory[]) => {
  const headers = [
    "Amount",
    "Status",
    "Destination",
    "Initiated",
    "Estimated Arrival",
  ];
  const rows = payouts.map((payout) => [
    formatCurrency(payout.amount, payout.currency),
    payout.status,
    payout.destination,
    formatDate(payout.initiated),
    formatShortDate(payout.estimatedArrival),
  ]);

  const csvContent = [
    headers.join(","),
    ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute(
    "download",
    `payout-history-${new Date().toISOString().split("T")[0]}.csv`
  );
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const exportToExcel = (payouts: PayoutHistory[]) => {
  const headers = [
    "Amount",
    "Status",
    "Destination",
    "Initiated",
    "Estimated Arrival",
  ];
  const rows = payouts.map((payout) => [
    formatCurrency(payout.amount, payout.currency),
    payout.status,
    payout.destination,
    formatDate(payout.initiated),
    formatShortDate(payout.estimatedArrival),
  ]);

  let csvContent = headers.join("\t") + "\n";
  rows.forEach((row) => {
    csvContent += row.join("\t") + "\n";
  });

  const blob = new Blob([csvContent], {
    type: "application/vnd.ms-excel;charset=utf-8;",
  });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute(
    "download",
    `payout-history-${new Date().toISOString().split("T")[0]}.xls`
  );
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export default function PayoutHistoryPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const limit = 20;

  const handleBack = () => {
    localStorage.setItem("tabValue", "monetization");
    router.back();
  };

  const { data, isLoading, isError, error, refetch } = usePayoutHistory({
    page,
    limit,
  });

  const allPayouts = useMemo(() => {
    if (!data) return [];
    const payouts: PayoutHistory[] = [];
    for (let i = 1; i <= page; i++) {
      // This is a simplified approach - in a real app, you'd accumulate pages
      // For now, we'll just use the current page data
    }
    return data.data;
  }, [data, page]);

  const handleLoadMore = () => {
    if (data?.meta.hasMore) {
      setPage((prev) => prev + 1);
    }
  };

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-white mb-2">
            Failed to load payout history
          </h3>
          <p className="text-muted-foreground mb-4">
            {error?.message || "Something went wrong. Please try again."}
          </p>
          <Button onClick={() => refetch()}>
            <RefreshCcw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="">
      <PageTitle
        title="Payout History"
        description="View all your past settlements and bank transfers."
        showBack={true}
        onBack={handleBack}
        content={
          data &&
          data.data.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => exportToCSV(data.data)}>
                  Download as CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => exportToExcel(data.data)}>
                  Download as Excel
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )
        }
      />

      <Card className="overflow-x-auto">
        <CardContent>
          {isLoading && !data ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-4 p-4 border-b"
                >
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-24" />
                </div>
              ))}
            </div>
          ) : data && data.data.length > 0 ? (
            <>
              <table className="min-w-full text-left">
                <thead>
                  <tr className="border-b text-muted-foreground uppercase text-xs">
                    <th className="text-left py-3 px-6 font-semibold">
                      Amount
                    </th>
                    <th className="text-left py-3 px-6 font-semibold">
                      Status
                    </th>
                    <th className="text-left py-3 px-6 font-semibold">
                      Destination
                    </th>
                    <th className="text-left py-3 px-6 font-semibold">
                      Initiated
                    </th>
                    <th className="text-left py-3 px-6 font-semibold">
                      Estimated Arrival
                    </th>
                  </tr>
                </thead>
                <tbody className="text-white text-sm">
                  {data.data.map((payout) => {
                    const statusBadge = getStatusBadge(payout.status);
                    const StatusIcon = statusBadge.icon;
                    return (
                      <tr key={payout.id} className="border-b">
                        <td className="py-3 px-6 font-semibold text-accent">
                          {formatCurrency(payout.amount, payout.currency)}
                        </td>
                        <td className="py-3 px-6">
                          <Badge
                            variant={statusBadge.variant}
                            className="flex items-center gap-1.5 w-fit"
                          >
                            <StatusIcon className="w-3 h-3" />
                            {statusBadge.label}
                          </Badge>
                        </td>
                        <td className="py-3 px-6">
                          <div className="flex items-center gap-2">
                            <ArrowUpRight className="w-4 h-4 text-muted-foreground" />
                            <span>{payout.destination}</span>
                          </div>
                        </td>
                        <td className="py-3 px-6 text-muted-foreground">
                          {formatDate(payout.initiated)}
                        </td>
                        <td className="py-3 px-6 text-muted-foreground">
                          {formatShortDate(payout.estimatedArrival)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {data.meta.hasMore && (
                <div className="text-center pt-4">
                  <Button
                    variant="link"
                    onClick={handleLoadMore}
                    disabled={isLoading}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    {isLoading ? "Loading..." : "Load previous payouts"}
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="text-muted-foreground mb-4">
                <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-semibold mb-2">
                  No payout history found
                </h3>
                <p className="text-sm">
                  You don't have any payouts yet. Payouts will appear here once
                  they are processed.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
