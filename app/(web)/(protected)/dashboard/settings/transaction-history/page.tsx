"use client";

import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Search,
  Filter,
  MoreHorizontal,
  RefreshCcw,
  Clock,
  AlertCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import InputEnhanced from "@/components/ui/input-enhanced";
import { useRouter } from "next/navigation";
import PageTitle from "@/components/dashboard/layout/PageTitle";
import { useState, useEffect, useMemo } from "react";
import {
  useTransactionHistory,
  useRefundTransaction,
} from "@/hooks/useMonetization";
import {
  TransactionHistory,
  TransactionStatus,
  TransactionType,
} from "@/types";

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const formatCurrency = (amount: number, currency: string = "USD"): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 2,
  }).format(amount);
};

const getStatusBadge = (status: TransactionStatus) => {
  const statusConfig = {
    succeeded: {
      label: "Succeeded",
      variant: "success" as const,
    },
    refunded: {
      label: "Refunded",
      variant: "outline" as const,
    },
    failed: {
      label: "Failed",
      variant: "error" as const,
    },
    pending: {
      label: "Pending",
      variant: "warning" as const,
    },
    cancelled: {
      label: "Cancelled",
      variant: "outline" as const,
    },
  };

  return statusConfig[status] || statusConfig.succeeded;
};

export default function TransactionHistoryPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    TransactionStatus | undefined
  >();
  const [typeFilter, setTypeFilter] = useState<TransactionType | undefined>();
  const [page, setPage] = useState(1);
  const [refundDialogOpen, setRefundDialogOpen] = useState(false);
  const [transactionToRefund, setTransactionToRefund] =
    useState<TransactionHistory | null>(null);
  const limit = 10;

  const handleBack = () => {
    localStorage.setItem("tabValue", "monetization");
    router.back();
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  const { data, isLoading, isError, error, refetch } = useTransactionHistory({
    page,
    limit,
    search: debouncedSearch || undefined,
    status: statusFilter,
    type: typeFilter,
  });

  const refundMutation = useRefundTransaction();

  const handleRefundClick = (transaction: TransactionHistory) => {
    setTransactionToRefund(transaction);
    setRefundDialogOpen(true);
  };

  const handleRefundConfirm = async () => {
    if (!transactionToRefund) return;

    try {
      await refundMutation.mutateAsync({
        id: transactionToRefund.id,
      });
      setRefundDialogOpen(false);
      setTransactionToRefund(null);
    } catch (error) {
      // Error is handled by the mutation hook
    }
  };

  const statusOptions = [
    { label: "All Statuses", value: "" },
    { label: "Succeeded", value: "succeeded" },
    { label: "Refunded", value: "refunded" },
    { label: "Failed", value: "failed" },
    { label: "Pending", value: "pending" },
    { label: "Cancelled", value: "cancelled" },
  ];

  const typeOptions = [
    { label: "All Types", value: "" },
    { label: "Purchase", value: "Purchase" },
    { label: "Rental", value: "Rental" },
    { label: "Subscription", value: "Subscription" },
  ];

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-white mb-2">
            Failed to load transaction history
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
        title="Transaction History"
        description="View and manage all customer payments and refunds."
        showBack={true}
        onBack={handleBack}
      />

      <Card className="overflow-x-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Transactions</CardTitle>
            <div className="flex items-center gap-3">
              <div className="relative w-full md:w-auto max-w-xs">
                <InputEnhanced
                  iconLeft={<Search size={16} />}
                  placeholder="Search transactions..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="bg-muted"
                />
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="secondary">
                    <Filter size={16} className="mr-2" />
                    Filter
                    {(statusFilter || typeFilter) && (
                      <span className="ml-2 px-1.5 py-0.5 rounded-full text-xs bg-accent text-accent-foreground">
                        {[statusFilter, typeFilter].filter(Boolean).length}
                      </span>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="p-2">
                    <div className="mb-3">
                      <div className="text-xs font-medium text-muted-foreground mb-2 px-2">
                        Status
                      </div>
                      {statusOptions.map((option) => (
                        <DropdownMenuItem
                          key={option.value}
                          onClick={() => {
                            setStatusFilter(
                              option.value
                                ? (option.value as TransactionStatus)
                                : undefined
                            );
                            setPage(1);
                          }}
                          className={
                            statusFilter === option.value ||
                            (!statusFilter && !option.value)
                              ? "bg-accent/10"
                              : ""
                          }
                        >
                          {option.label}
                        </DropdownMenuItem>
                      ))}
                    </div>
                    <div className="border-t pt-3">
                      <div className="text-xs font-medium text-muted-foreground mb-2 px-2">
                        Type
                      </div>
                      {typeOptions.map((option) => (
                        <DropdownMenuItem
                          key={option.value}
                          onClick={() => {
                            setTypeFilter(
                              option.value
                                ? (option.value as TransactionType)
                                : undefined
                            );
                            setPage(1);
                          }}
                          className={
                            typeFilter === option.value ||
                            (!typeFilter && !option.value)
                              ? "bg-accent/10"
                              : ""
                          }
                        >
                          {option.label}
                        </DropdownMenuItem>
                      ))}
                    </div>
                    {(statusFilter || typeFilter) && (
                      <div className="border-t pt-2 mt-2">
                        <DropdownMenuItem
                          onClick={() => {
                            setStatusFilter(undefined);
                            setTypeFilter(undefined);
                            setPage(1);
                          }}
                          className="text-destructive focus:text-destructive"
                        >
                          Clear Filters
                        </DropdownMenuItem>
                      </div>
                    )}
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>
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
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-16" />
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
                    <th className="text-left py-3 px-6 font-semibold">Type</th>
                    <th className="text-left py-3 px-6 font-semibold">
                      Customer
                    </th>
                    <th className="text-left py-3 px-6 font-semibold">Date</th>
                    <th className="text-left py-3 px-6 font-semibold">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="text-white text-sm">
                  {data.data.map((transaction) => {
                    const statusBadge = getStatusBadge(transaction.status);
                    return (
                      <tr key={transaction.id} className="border-b">
                        <td className="py-3 px-6 font-semibold text-accent">
                          {formatCurrency(
                            transaction.amount,
                            transaction.currency
                          )}
                        </td>
                        <td className="py-3 px-6">
                          <Badge
                            variant={statusBadge.variant}
                            className="flex items-center gap-1.5 w-fit"
                          >
                            {statusBadge.label}
                          </Badge>
                        </td>
                        <td className="py-3 px-6">{transaction.type}</td>
                        <td className="py-3 px-6">{transaction.customer}</td>
                        <td className="py-3 px-6 text-muted-foreground">
                          {formatDate(transaction.date)}
                        </td>
                        <td className="py-3 px-6">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="iconSm">
                                <MoreHorizontal size={16} />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>View Details</DropdownMenuItem>
                              {transaction.status === "succeeded" && (
                                <DropdownMenuItem
                                  onClick={() => handleRefundClick(transaction)}
                                >
                                  Refund
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem>
                                Download Receipt
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              <div className="flex items-center justify-between pt-4 mt-4 border-t">
                <div className="text-sm text-muted-foreground">
                  Showing{" "}
                  {data.meta.page * data.meta.limit - data.meta.limit + 1}-
                  {Math.min(data.meta.page * data.meta.limit, data.meta.total)}{" "}
                  of {data.meta.total} transactions
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                    disabled={page === 1 || isLoading}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => setPage((prev) => prev + 1)}
                    disabled={!data.meta.hasMore || isLoading}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="text-muted-foreground mb-4">
                <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-semibold mb-2">
                  No transactions found
                </h3>
                <p className="text-sm">
                  {search || statusFilter || typeFilter
                    ? "No transactions match your search criteria."
                    : "You don't have any transactions yet. Transactions will appear here once customers make purchases."}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={refundDialogOpen} onOpenChange={setRefundDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Refund Transaction</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to refund this transaction? This action
              cannot be undone.
              {transactionToRefund && (
                <div className="mt-2 p-2 bg-muted rounded">
                  <div className="text-sm">
                    <strong>Amount:</strong>{" "}
                    {formatCurrency(
                      transactionToRefund.amount,
                      transactionToRefund.currency
                    )}
                  </div>
                  <div className="text-sm">
                    <strong>Customer:</strong> {transactionToRefund.customer}
                  </div>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setRefundDialogOpen(false);
                setTransactionToRefund(null);
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRefundConfirm}
              disabled={refundMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {refundMutation.isPending ? "Processing..." : "Refund"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
