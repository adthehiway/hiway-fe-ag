import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TabsContent } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import {
  AlertCircle,
  Bell,
  CreditCard,
  Crown,
  DollarSign,
  Download as DownloadIcon,
  FileText,
  FileText as FileTextIcon,
  Loader2,
  ArrowUpDown,
  Settings,
} from "lucide-react";
import {
  formatCurrencyAmount,
  getErrorMessage,
  getFeatureValue,
} from "@/lib/utils";
import BillingService from "@/services/billing";
import PackageService from "@/services/packages";
// @ts-expect-error - Package is not typed
import { getCurrencySymbol } from "@brixtol/currency-symbols";
import moment from "moment";
import { useState, useMemo } from "react";
import { TopUpModal } from "../topup/TopUpModal";
import { BillingType, PackageType } from "@/types";
import { PlanSelectionModal } from "./PlanSelectionModal";
import { toast } from "react-toastify";

const BillingTab = () => {
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [isManagingSubscription, setIsManagingSubscription] = useState(false);

  const { data: plan, isLoading: isPlanLoading } = useQuery({
    queryKey: ["billing-plan"],
    queryFn: () => BillingService.getPlanDetails(),
    refetchInterval: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });

  const { data: storageUsage } = useQuery({
    queryKey: ["billing-storage-usage"],
    queryFn: () => BillingService.getStorageUsage(),
    enabled: isPlanModalOpen,
    refetchOnWindowFocus: false,
  });

  const { data: usage, isLoading: isUsageLoading } = useQuery({
    queryKey: ["billing-usage"],
    queryFn: () => BillingService.getStreamHoursUsage(),
    refetchInterval: 1000 * 60 * 5,
  });

  // Memoized usage calculations
  const usageCalculations = useMemo(() => {
    const monthlyCredit = usage?.package || 0; // hours
    const additionalUsage = usage?.topUps || 0; // hours
    const totalUsage = monthlyCredit + additionalUsage;
    const used = usage?.used || 0; // hours

    // Calculate percentages
    const monthlyCreditPercent =
      totalUsage > 0 ? (monthlyCredit / totalUsage) * 100 : 0;
    const additionalUsagePercent =
      totalUsage > 0 ? (additionalUsage / totalUsage) * 100 : 0;

    // Alert and budget positions (as percentages of total usage)
    const usageAlertPercent = 70; // 75% of total usage
    const usageBudgetPercent = 90; // 90% of total usage
    return {
      monthlyCredit,
      additionalUsage,
      totalUsage,
      used,
      monthlyCreditPercent,
      additionalUsagePercent,
      usageAlertPercent,
      usageBudgetPercent,
    };
  }, [usage]);

  // Destructure the memoized values
  const {
    monthlyCredit,
    additionalUsage,
    totalUsage,
    used,
    monthlyCreditPercent,
    additionalUsagePercent,
    usageAlertPercent,
    usageBudgetPercent,
  } = usageCalculations;

  const [isAddingPayment, setIsAddingPayment] = useState(false);

  const handleAddPaymentMethod = async () => {
    setIsAddingPayment(true);
    try {
      const { url } = await PackageService.createManageLink();
      window.open(url, "_blank");
    } catch (e) {
      // Optionally show a toast or error
    } finally {
      setIsAddingPayment(false);
    }
  };

  const handleManageSubscription = async () => {
    setIsManagingSubscription(true);
    try {
      const { url } = await PackageService.createManageLink();
      window.open(url, "_blank");
    } catch (e) {
      toast.error(getErrorMessage(e, "Failed to manage subscription"));
    } finally {
      setIsManagingSubscription(false);
    }
  };

  const { data: invoices, isLoading: isInvoicesLoading } = useQuery({
    queryKey: ["billing-invoices"],
    queryFn: () => BillingService.getInvoices(),
    refetchInterval: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });

  return (
    <TabsContent value="billing" className="space-y-6">
      <Card className="bg-muted/80">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <Crown className="w-6 h-6 text-accent" />
            Current Plan
          </CardTitle>
          <p className="text-muted-foreground text-sm mt-1">
            You're currently on the {plan?.plan?.name}
          </p>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-muted-foreground/10 bg-muted/40 p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-bold text-lg">{plan?.plan?.name}</span>
                <span className="bg-accent/20 text-accent px-3 py-1 rounded-full text-xs font-semibold">
                  Current
                </span>
              </div>
              <div className="text-muted-foreground text-sm mb-2">
                Advanced features for growing creators
              </div>
              <div className="flex flex-wrap gap-4 text-white text-base font-medium mb-2">
                {plan?.plan?.features?.map((feature, index) => (
                  <span key={index}>
                    •{getFeatureValue(feature.feature, feature.value)}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex flex-col items-end min-w-[160px]">
              <div className="text-3xl font-bold">
                {getCurrencySymbol(plan?.plan?.currency || "USD")}
                {plan?.plan?.price}
              </div>
              <div className="text-muted-foreground text-sm">
                per{" "}
                {plan?.plan?.billingType === BillingType.MONTHLY
                  ? "month"
                  : "year"}
              </div>
              <div className="text-muted-foreground text-xs mt-1">
                Next billing:{" "}
                {moment(plan?.plan?.nextBillingDate).format("MMM D, YYYY")}
              </div>
            </div>
          </div>

          <div className="flex gap-2 mt-4">
            <Button
              className="bg-accent text-black flex items-center gap-2 hover:bg-accent/90"
              onClick={() => setIsPlanModalOpen(true)}
            >
              <ArrowUpDown className="w-4 h-4" /> Change Plan
            </Button>
            {/* <Button
              variant="outline"
              className="flex items-center gap-2"
              onClick={handleManageSubscription}
              disabled={isManagingSubscription}
            >
              {isManagingSubscription ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Loading...
                </>
              ) : (
                <>
                  <Settings className="w-4 h-4" /> Manage Subscription
                </>
              )}
            </Button> */}
          </div>
        </CardContent>
      </Card>
      {/* <Card className="bg-muted/80">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <DollarSign className="w-6 h-6 text-accent" />
            Additional Topups
          </CardTitle>
          <p className="text-muted-foreground text-sm mt-1">
            You are using {plan?.topUps?.length || 0} top-ups.
          </p>
        </CardHeader>
        <CardContent>
          {plan?.topUps?.length ? (
            plan.topUps.map((topUp, index) => (
              <div
                key={index}
                className="rounded-lg border border-muted-foreground/10 bg-muted/40 p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-3"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold  capitalize">{topUp?.name}</span>
                    <span className="bg-accent/20 text-accent px-3 py-1 rounded-full text-xs font-semibold">
                      Active
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-4 text-white text-sm font-medium ">
                    {topUp?.features?.map((feature, index) => (
                      <span key={index}>
                        +{getFeatureValue(feature.feature, feature.value)}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col items-end min-w-[160px]">
                  <div className="text-3xl font-bold">
                    {getCurrencySymbol(topUp?.currency || "USD")}
                    {topUp?.price}
                  </div>
                  <div className="text-muted-foreground text-xs mt-1">
                    Expiration :{" "}
                    {moment(
                      addDaysToDate(new Date(topUp?.purchaseDate), 30)
                    ).format("MMM D, YYYY")}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div>You dont have any top-ups purchased yet. </div>
          )}
        </CardContent>
      </Card> */}

      {/* Monthly Spending Management Card */}
      <Card className="bg-muted/80">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <DollarSign className="w-6 h-6 text-accent" />
            Manage your monthly spending
          </CardTitle>
          <p className="text-muted-foreground text-sm mt-1">
            Usage alerts and budgets can help you control spending on additional
            usage beyond the monthly credit included with your plan
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Progress Bar Section */}
            <div className="space-y-4">
              {/* Monthly Credit and Additional Usage Labels */}
              <div className="flex items-center text-sm relative">
                <span className="text-white font-medium">
                 Monthly hours
                </span>
                {additionalUsagePercent > 0 && (
                  <span
                    className="text-white font-medium absolute"
                    style={{
                      left: `${
                        monthlyCreditPercent + additionalUsagePercent / 2
                      }%`,
                      transform: "translateX(-50%)",
                    }}
                  >
                    Additional hours
                  </span>
                )}
              </div>

              {/* Progress Bar */}
              <div className="relative  rounded-full">
                <div className="w-full bg-muted-foreground/20  h-3 overflow-hidden relative rounded-full">
                  {/* used  progress bar */}
                  <div
                    className="bg-accent absolute top-0 h-full rounded-full"
                    style={{ width: `${(used / totalUsage) * 100}%` }}
                  ></div>

                  {/* Monthly Credit Progress */}
                  <div
                    className="bg-accent/30 h-full rounded-l-full"
                    style={{ width: `${monthlyCreditPercent}%` }}
                  ></div>
                  {/* Additional Usage Progress */}
                  <div
                    className="bg-accent/20 h-full absolute top-0 rounded-r-full"
                    style={{
                      left: `${monthlyCreditPercent}%`,
                      width: `${additionalUsagePercent}%`,
                    }}
                  ></div>
                </div>

                {/* Usage Alert Marker */}
                <div
                  className="absolute top-1/2 -translate-y-1/2 h-8 border-l-2 border-dashed border-white/50"
                  style={{ left: `${usageAlertPercent}%` }}
                ></div>

                {/* Usage Budget Marker */}
                <div
                  className="absolute top-1/2 -translate-y-1/2 h-6 border-l-2 border-dashed border-white/50"
                  style={{ left: `${usageBudgetPercent}%` }}
                ></div>
              </div>

              {/* Labels below progress bar */}
              <div className="flex items-center text-sm relative pt-4">
                <div
                  className="absolute flex items-center gap-2"
                  style={{
                    left: `${usageAlertPercent}%`,
                    transform: "translateX(-50%)",
                  }}
                >
                  <Bell className="w-4 h-4 text-yellow-500" />
                  <span className="text-sm">Usage alert</span>
                </div>
                <div
                  className="absolute flex items-center gap-2"
                  style={{
                    left: `${usageBudgetPercent}%`,
                    transform: "translateX(-50%)",
                  }}
                >
                  <AlertCircle className="w-4 h-4 text-red-500" />
                  <span className="text-sm ">Usage budget</span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-end mt-8">
            <TopUpModal />
          </div>
        </CardContent>
      </Card>

      {/* Payment Methods Card */}
      <Card className="bg-muted/80">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <CreditCard className="w-5 h-5" />
            Payment Methods
          </CardTitle>
          <p className="text-muted-foreground text-sm mt-1">
            Manage your payment methods and billing information
          </p>
        </CardHeader>
        <CardContent>
          {plan?.paymentMethods.map((paymentMethod, index) => (
            <div
              key={index}
              className="rounded-lg border border-muted-foreground/10 bg-muted/40 p-6 flex flex-col gap-4 mb-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="bg-blue-600 text-white px-3 py-1 rounded font-bold text-xs">
                    {paymentMethod.brand.toUpperCase()}
                  </span>
                  <span className="tracking-widest font-semibold text-lg">
                    **** **** **** {paymentMethod.last4}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-muted-foreground text-sm">
                    Expires {paymentMethod.expMonth}/{paymentMethod.expYear}
                  </span>
                  {index === 0 && (
                    <span className="bg-accent/20 text-accent px-3 py-1 rounded-full text-xs font-semibold">
                      Default
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
          {/* <Button
            className="w-full bg-white text-black font-semibold border border-muted-foreground/10 shadow-none hover:bg-muted/60"
            onClick={handleAddPaymentMethod}
            disabled={isAddingPayment}
          >
            {isAddingPayment ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Loading...
              </span>
            ) : (
              "Add Payment Method"
            )}
          </Button> */}
        </CardContent>
      </Card>
      {/* Billing History Card */}
      <Card className="bg-muted/80">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <FileText className="w-5 h-5" />
            Billing History
          </CardTitle>
          <p className="text-muted-foreground text-sm mt-1">
            View and download your past invoices
          </p>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left">
              <thead>
                <tr className="border-b border-muted-foreground/10">
                  <th className="py-3 px-4 font-semibold">Invoice</th>
                  <th className="py-3 px-4 font-semibold">Date</th>
                  <th className="py-3 px-4 font-semibold">Plan</th>
                  <th className="py-3 px-4 font-semibold">Amount</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold"></th>
                </tr>
              </thead>
              <tbody className="text-base">
                {isInvoicesLoading ? (
                  <tr>
                    <td colSpan={6} className="py-6 text-center">
                      <Loader2 className="w-5 h-5 animate-spin inline-block mr-2" />
                      Loading invoices...
                    </td>
                  </tr>
                ) : invoices && invoices.length > 0 ? (
                  invoices?.map((invoice) => (
                    <tr
                      key={invoice.invoiceNumber}
                      className="border-b border-muted-foreground/10 hover:bg-muted/30 transition"
                    >
                      <td className="py-3 px-4">
                        {invoice.invoiceNumber?.slice(0, 13) || "-"}
                      </td>
                      <td className="py-3 px-4">
                        {invoice.date
                          ? new Date(invoice.date).toLocaleDateString()
                          : "-"}
                      </td>
                      <td className="py-3 px-4">{invoice.plan || "-"}</td>
                      <td className="py-3 px-4">
                        {typeof invoice.amount === "number"
                          ? formatCurrencyAmount(
                              invoice.amount,
                              invoice.currency || "USD"
                            )
                          : "-"}
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center px-4 py-1 rounded-full text-xs font-semibold bg-accent/20 text-accent border border-accent/30">
                          {invoice.status || "-"}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        {invoice.downloadUrl ? (
                          <a
                            href={invoice.downloadUrl}
                            className="p-2 rounded hover:bg-muted/40 transition"
                            title="Download Invoice"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <DownloadIcon className="w-5 h-5" />
                          </a>
                        ) : null}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={6}
                      className="py-12 text-center text-muted-foreground"
                    >
                      <div className="flex flex-col items-center justify-center gap-2">
                        <FileTextIcon className="w-8 h-8 mb-2 opacity-40" />
                        <div className="font-semibold text-lg">
                          No invoices found
                        </div>
                        <div className="text-sm">
                          You have not been billed yet. Your invoices will
                          appear here once available.
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <PlanSelectionModal
        isOpen={isPlanModalOpen}
        onClose={() => setIsPlanModalOpen(false)}
        currentPackageId={plan?.plan?.packageId}
        storageUsage={storageUsage}
      />
    </TabsContent>
  );
};

export default BillingTab;
