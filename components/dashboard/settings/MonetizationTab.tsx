import InputEnhanced from "@/components/ui/input-enhanced";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { TabsContent } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Eye,
  Download,
  Plus,
  DollarSign,
  Percent,
  Building2,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useUser } from "@/hooks/useUser";
import { useCompany } from "@/hooks/useCompanies";
import CompanyService from "@/services/company";
import { toast } from "react-toastify";
import {
  useMonetizationStats,
  usePayoutSchedule,
  useUpdatePayoutSchedule,
} from "@/hooks/useMonetization";
import { PayoutSchedule, ISettings } from "@/types";
import { formatNumber } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { useSettings, useUpdateSettings } from "@/hooks/useSmartLinks";
import { DiscountCodesCard } from "./DiscountCodesCard";
import { useRouter } from "next/navigation";

const MonetizationTab = () => {
  const router = useRouter();
  const { data: user, isLoading, refetch } = useUser();
  const { data: company, refetch: refetchCompany } = useCompany();
  const [showDiscountForm, setShowDiscountForm] = useState(false);
  const [discountType, setDiscountType] = useState("percentage");
  const [discountValue, setDiscountValue] = useState("");
  const [discountCode, setDiscountCode] = useState("");
  const [discountExpiry, setDiscountExpiry] = useState("");
  const [showPayoutSettingsModal, setShowPayoutSettingsModal] = useState(false);
  const [selectedSchedule, setSelectedSchedule] =
    useState<PayoutSchedule | null>(null);

  // Rental settings state
  const { data: settings, isLoading: settingsLoading } = useSettings();
  const updateSettingsMutation = useUpdateSettings();
  const [rentalSettings, setRentalSettings] = useState({
    defaultRentalPeriodDays: 7,
    defaultRentalMaxViews: null as number | null,
    defaultRentalViewingWindowHours: 48,
  });

  // Monetization hooks
  const { data: stats, isLoading: statsLoading } = useMonetizationStats();
  const { data: payoutSchedule, isLoading: payoutScheduleLoading } =
    usePayoutSchedule();
  const updatePayoutScheduleMutation = useUpdatePayoutSchedule();

  function generateStripeLink() {
    CompanyService.createOnboardingLink(company?.id ?? "")
      .then((data: { url: string }) => {
        window.open(data.url, "_blank");
      })
      .catch(() => toast.error("Something went wrong, please try again later"));
  }

  // Initialize selected schedule when payout schedule data loads
  useEffect(() => {
    if (payoutSchedule?.schedule && payoutSchedule.schedule !== "manual") {
      setSelectedSchedule(payoutSchedule.schedule as PayoutSchedule);
    }
  }, [payoutSchedule]);

  const handleSavePayoutSchedule = async () => {
    if (!selectedSchedule) {
      toast.error("Please select a payout schedule");
      return;
    }

    try {
      await updatePayoutScheduleMutation.mutateAsync({
        schedule: selectedSchedule,
      });
      setShowPayoutSettingsModal(false);
    } catch (error) {
      // Error is handled by the mutation hook
    }
  };

  // Initialize rental settings from API
  useEffect(() => {
    if (settings) {
      setRentalSettings({
        defaultRentalPeriodDays: settings.defaultRentalPeriodDays,
        defaultRentalMaxViews: settings.defaultRentalMaxViews ?? null,
        defaultRentalViewingWindowHours:
          settings.defaultRentalViewingWindowHours,
      });
    }
  }, [settings]);

  const handleRentalSettingsChange = (field: string, value: any) => {
    setRentalSettings((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSaveRentalSettings = async () => {
    try {
      await updateSettingsMutation.mutateAsync(rentalSettings);
      toast.success("Rental settings saved successfully");
    } catch (error) {
      toast.error("Failed to save rental settings");
    }
  };
  return (
    <TabsContent value="monetization" className="space-y-3">
      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2 w-full justify-between">
              <CardTitle>Total Revenue</CardTitle>
              <span className=" text-muted-foreground text-lg">
                <DollarSign className="w-4 h-4" />
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              ${formatNumber(stats?.totalRevenue.value ?? 0)}
            </div>
            <div
              className={cn(
                "text-sm mt-1",
                stats?.totalRevenue.change && stats?.totalRevenue.change > 0
                  ? "text-green-400"
                  : "text-red-400"
              )}
            >
              {stats?.totalRevenue.change && stats?.totalRevenue.change > 0
                ? `+${stats?.totalRevenue.change}%`
                : "0%"}{" "}
              from last month
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2 w-full justify-between">
              <CardTitle>Active Subscribers</CardTitle>
              <span className="text-muted-foreground">
                <Eye className="w-4 h-4" />
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {stats?.activeSubscribers.value}
            </div>
            <div
              className={cn(
                "text-sm mt-1",
                stats?.activeSubscribers.change &&
                  stats?.activeSubscribers.change > 0
                  ? "text-green-400"
                  : "text-red-400"
              )}
            >
              {stats?.activeSubscribers.change &&
              stats?.activeSubscribers.change > 0
                ? `+${stats?.activeSubscribers.change}`
                : "0"}{" "}
              this month
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2 w-full justify-between">
              <CardTitle>Conversion Rate</CardTitle>
              <span className="text-muted-foreground">
                <Download className="w-4 h-4" />
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {stats?.conversionRate.value}%
            </div>
            <div
              className={cn(
                "text-sm mt-1",
                stats?.conversionRate.change && stats?.conversionRate.change > 0
                  ? "text-green-400"
                  : "text-red-400"
              )}
            >
              {stats?.conversionRate.change && stats?.conversionRate.change > 0
                ? `+${stats?.conversionRate.change}%`
                : "0%"}{" "}
              this week
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Payout Settings */}
        <div className="col-span-2 flex flex-col gap-3">
          <Card>
            <CardHeader>
              <CardTitle>Payout Settings</CardTitle>
              <p className="text-muted-foreground text-sm mt-1">
                Configure how you get paid
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted/40 rounded-lg p-4 flex items-center justify-between">
                <div>
                  <div className="font-semibold">Stripe</div>
                  <div className="text-muted-foreground text-sm">
                    Credit card processing
                  </div>
                </div>
                {company?.stripeOnboarding ? (
                  <Button className="w-20">Connected</Button>
                ) : (
                  <Button
                    className="w-20"
                    variant="outline"
                    onClick={generateStripeLink}
                  >
                    Setup
                  </Button>
                )}
              </div>
              {/* <Button variant="outline" className="w-full">
                    <Plus className="w-4 h-4" /> Add New Payout Method
                  </Button> */}
            </CardContent>
          </Card>

          {/* Default Rental Settings Card */}
          <Card>
            <CardHeader>
              <CardTitle>Default Rental Settings</CardTitle>
              <p className="text-muted-foreground text-sm mt-1">
                Set default rental terms that apply to all content unless
                overridden
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Rental Period */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Rental Period (Days)
                </label>
                <Select
                  value={rentalSettings.defaultRentalPeriodDays?.toString()}
                  onValueChange={(value) =>
                    handleRentalSettingsChange(
                      "defaultRentalPeriodDays",
                      parseInt(value)
                    )
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select rental period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 Day</SelectItem>
                    <SelectItem value="3">3 Days</SelectItem>
                    <SelectItem value="7">7 Days</SelectItem>
                    <SelectItem value="14">14 Days</SelectItem>
                    <SelectItem value="30">30 Days</SelectItem>
                    <SelectItem value="90">90 Days</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  How many days a rental can be kept before expiring
                </p>
              </div>

              {/* Maximum Views */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Maximum Views</label>
                <Select
                  value={
                    rentalSettings.defaultRentalMaxViews?.toString() ||
                    "unlimited"
                  }
                  onValueChange={(value) =>
                    handleRentalSettingsChange(
                      "defaultRentalMaxViews",
                      value === "unlimited" ? null : parseInt(value)
                    )
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select maximum views" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unlimited">Unlimited</SelectItem>
                    <SelectItem value="1">1 View</SelectItem>
                    <SelectItem value="3">3 Views</SelectItem>
                    <SelectItem value="5">5 Views</SelectItem>
                    <SelectItem value="10">10 Views</SelectItem>
                    <SelectItem value="25">25 Views</SelectItem>
                    <SelectItem value="50">50 Views</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  How many times a rental can be watched
                </p>
              </div>

              {/* Viewing Window */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Viewing Window (Hours)
                </label>
                <Select
                  value={rentalSettings.defaultRentalViewingWindowHours?.toString()}
                  onValueChange={(value) =>
                    handleRentalSettingsChange(
                      "defaultRentalViewingWindowHours",
                      parseInt(value)
                    )
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select viewing window" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 Hour</SelectItem>
                    <SelectItem value="6">6 Hours</SelectItem>
                    <SelectItem value="12">12 Hours</SelectItem>
                    <SelectItem value="24">24 Hours</SelectItem>
                    <SelectItem value="48">48 Hours</SelectItem>
                    <SelectItem value="72">72 Hours</SelectItem>
                    <SelectItem value="168">168 Hours (1 Week)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  How long a rental stays in account after starting playback
                </p>
              </div>

              {/* Save Button */}
              <Button
                onClick={handleSaveRentalSettings}
                disabled={updateSettingsMutation.isPending}
                className="w-full bg-accent hover:bg-accent/90"
              >
                {updateSettingsMutation.isPending
                  ? "Saving..."
                  : "Save Rental Settings"}
              </Button>
            </CardContent>
          </Card>

          {/* Monetization Methods Card */}
          {/* <Card>
            <CardHeader>
              <CardTitle>Monetisation Methods</CardTitle>
              <p className="text-muted-foreground text-sm mt-1">
                Configure your revenue streams
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted/40 rounded-lg p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-center gap-4">
                  <span className="text-2xl text-accent font-bold">$</span>
                  <div>
                    <div className="font-semibold">Pay-Per-View</div>
                    <div className="text-muted-foreground text-sm">
                      Charge viewers for each video view
                    </div>
                    <div className="text-xs text-muted-foreground">
                      $0.10 per view
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="font-semibold text-lg">$2,450</div>
                    <div className="text-xs text-muted-foreground">
                      This month
                    </div>
                  </div>
                  <Switch
                    checked
                    disabled
                    className="data-[state=checked]:bg-accent"
                  />
                  <Button variant="ghost" size="icon">
                    <span className="sr-only">Settings</span>
                    <svg
                      width="18"
                      height="18"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <circle cx="12" cy="12" r="1.5" />
                      <circle cx="19.5" cy="12" r="1.5" />
                      <circle cx="4.5" cy="12" r="1.5" />
                    </svg>
                  </Button>
                </div>
              </div>
              <div className="bg-muted/40 rounded-lg p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-center gap-4">
                  <span className="text-2xl text-accent font-bold">$</span>
                  <div>
                    <div className="font-semibold">Subscription Model</div>
                    <div className="text-muted-foreground text-sm">
                      Monthly recurring revenue from subscribers
                    </div>
                    <div className="text-xs text-muted-foreground">
                      $9.99/month
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="font-semibold text-lg">$1,250</div>
                    <div className="text-xs text-muted-foreground">
                      This month
                    </div>
                  </div>
                  <Switch
                    checked
                    disabled
                    className="data-[state=checked]:bg-accent"
                  />
                  <Button variant="ghost" size="icon">
                    <span className="sr-only">Settings</span>
                    <svg
                      width="18"
                      height="18"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <circle cx="12" cy="12" r="1.5" />
                      <circle cx="19.5" cy="12" r="1.5" />
                      <circle cx="4.5" cy="12" r="1.5" />
                    </svg>
                  </Button>
                </div>
              </div>
              <div className="bg-muted/40 rounded-lg p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4 opacity-60">
                <div className="flex items-center gap-4">
                  <span className="text-2xl text-accent font-bold">$</span>
                  <div>
                    <div className="font-semibold flex items-center gap-2">
                      Advertising Model{" "}
                      <span className="bg-muted text-xs px-2 py-0.5 rounded-full ml-2">
                        Coming Soon
                      </span>
                    </div>
                    <div className="text-muted-foreground text-sm">
                      Revenue from targeted advertisements
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Coming soon
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="font-semibold text-lg">$0</div>
                    <div className="text-xs text-muted-foreground">
                      This month
                    </div>
                  </div>
                  <Switch
                    checked={false}
                    disabled
                    className="data-[state=checked]:bg-accent"
                  />
                  <Button variant="ghost" size="icon" disabled>
                    <span className="sr-only">Settings</span>
                    <svg
                      width="18"
                      height="18"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <circle cx="12" cy="12" r="1.5" />
                      <circle cx="19.5" cy="12" r="1.5" />
                      <circle cx="4.5" cy="12" r="1.5" />
                    </svg>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card> */}

          <DiscountCodesCard />
        </div>
        {/* Right Column */}
        <div className="flex flex-col gap-3">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5" /> Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button className="w-full" variant="outline" asChild>
                <Link href="/dashboard/analytics">View Analytics</Link>
              </Button>
              <Button
                className="w-full"
                variant="outline"
                onClick={() => setShowPayoutSettingsModal(true)}
              >
                Payout Settings
              </Button>
              <Button
                className="w-full"
                variant="outline"
                onClick={() => {
                  localStorage.setItem("tabValue", "monetization");
                  router.push("/dashboard/settings/payout-history");
                }}
              >
                Payout History
              </Button>
              <Button
                className="w-full"
                variant="outline"
                onClick={() => {
                  localStorage.setItem("tabValue", "monetization");
                  router.push("/dashboard/settings/transaction-history");
                }}
              >
                Transaction History
              </Button>
            </CardContent>
          </Card>
          {/* Revenue Breakdown */}
          {/* <Card>
            <CardHeader>
              <CardTitle>Revenue Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-2">
                <div className="flex justify-between">
                  <span>Pay-Per-View</span>
                  <span>66%</span>
                </div>
                <div className="flex justify-between">
                  <span>Subscriptions</span>
                  <span>34%</span>
                </div>
                <div className="flex justify-between">
                  <span>Advertising</span>
                  <span>0%</span>
                </div>
              </div>
            </CardContent>
          </Card> */}
          {/* Next Payout */}
          {/* <Card>
            <CardHeader>
              <CardTitle>Next Payout</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-1">$1,250</div>
              <div className="text-muted-foreground text-sm">
                Due January 15th
              </div>
            </CardContent>
          </Card> */}
        </div>
      </div>

      {/* Payout Settings Modal */}
      <Dialog
        open={showPayoutSettingsModal}
        onOpenChange={setShowPayoutSettingsModal}
      >
        <DialogContent className="max-w-md">
          <DialogHeader className="relative">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-accent/20 rounded-lg">
                <Building2 className="w-5 h-5 text-accent" />
              </div>
              <div className="flex-1">
                <DialogTitle className="text-xl font-semibold">
                  Payout Schedule
                </DialogTitle>
                <DialogDescription className="text-sm mt-1">
                  Set your preferred schedule for bank transfers.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {payoutScheduleLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-muted-foreground">Loading...</div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Radio Button Options */}
              <div className="space-y-3">
                {/* Daily Payouts */}
                <label
                  className={cn(
                    "flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-colors",
                    selectedSchedule === PayoutSchedule.DAILY
                      ? "border-accent bg-accent/10"
                      : "border-border bg-muted/50 hover:border-accent/50"
                  )}
                >
                  <div className="flex items-center mt-0.5">
                    <input
                      type="radio"
                      name="payout-schedule"
                      value={PayoutSchedule.DAILY}
                      checked={selectedSchedule === PayoutSchedule.DAILY}
                      onChange={() => setSelectedSchedule(PayoutSchedule.DAILY)}
                      className="w-4 h-4 text-accent  border-border accent-accent"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold mb-1">Daily Payouts</div>
                    <div className="text-sm text-muted-foreground">
                      Receive earnings every business day.
                    </div>
                  </div>
                </label>

                {/* Weekly Payouts */}
                <label
                  className={cn(
                    "flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-colors",
                    selectedSchedule === PayoutSchedule.WEEKLY
                      ? "border-accent bg-accent/10"
                      : "border-border bg-muted/50 hover:border-accent/50"
                  )}
                >
                  <div className="flex items-center mt-0.5">
                    <input
                      type="radio"
                      name="payout-schedule"
                      value={PayoutSchedule.WEEKLY}
                      checked={selectedSchedule === PayoutSchedule.WEEKLY}
                      onChange={() =>
                        setSelectedSchedule(PayoutSchedule.WEEKLY)
                      }
                      className="w-4 h-4 text-accent  border-border accent-accent"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold mb-1">Weekly Payouts</div>
                    <div className="text-sm text-muted-foreground">
                      Payouts are processed every Monday.
                    </div>
                  </div>
                </label>

                {/* Monthly Payouts */}
                <label
                  className={cn(
                    "flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-colors",
                    selectedSchedule === PayoutSchedule.MONTHLY
                      ? "border-accent bg-accent/10"
                      : "border-border bg-muted/50 hover:border-accent/50"
                  )}
                >
                  <div className="flex items-center mt-0.5">
                    <input
                      type="radio"
                      name="payout-schedule"
                      value={PayoutSchedule.MONTHLY}
                      checked={selectedSchedule === PayoutSchedule.MONTHLY}
                      onChange={() =>
                        setSelectedSchedule(PayoutSchedule.MONTHLY)
                      }
                      className="w-4 h-4 text-accent  border-border accent-accent"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold mb-1">Monthly Payouts</div>
                    <div className="text-sm text-muted-foreground">
                      Payouts are processed on the 1st of each month.
                    </div>
                  </div>
                </label>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 justify-end pt-4 border-t border-border">
                <Button
                  variant="outline"
                  onClick={() => setShowPayoutSettingsModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSavePayoutSchedule}
                  disabled={
                    updatePayoutScheduleMutation.isPending ||
                    !selectedSchedule ||
                    selectedSchedule === payoutSchedule?.schedule
                  }
                >
                  {updatePayoutScheduleMutation.isPending
                    ? "Saving..."
                    : "Save Schedule"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </TabsContent>
  );
};

export default MonetizationTab;
