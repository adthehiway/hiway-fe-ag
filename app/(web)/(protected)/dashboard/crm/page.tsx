"use client";

import { RoleGuard } from "@/components/dashboard/common/RoleGuard";
import PageTitle from "@/components/dashboard/layout/PageTitle";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import InputEnhanced from "@/components/ui/input-enhanced";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Users,
  Lock,
  Eye,
  DollarSign,
  Search,
  Filter,
  Plus,
  MoreHorizontal,
  Globe,
  EyeOff,
  Download,
} from "lucide-react";
import { useState } from "react";
import { formatNumber } from "@/lib/utils";
import Link from "next/link";
import { useCRMAnalytics, useCRMContacts } from "@/hooks/useCRM";
import { useUser } from "@/hooks/useUser";
import { useDebounce } from "@/hooks/useDebounce";
import { SmartLinkAccess } from "@/types";
import CRMService from "@/services/crm";
import { toast } from "react-toastify";

const CRMContent = () => {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All Types");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [activeTab, setActiveTab] = useState("public");
  const [isExporting, setIsExporting] = useState(false);

  const debouncedSearch = useDebounce(search, 500);

  const { data: user } = useUser();
  const {
    data: analytics,
    isLoading: analyticsLoading,
    error: analyticsError,
  } = useCRMAnalytics();

  // Map activeTab to SmartLinkAccess
  const getAccessType = (tab: string): SmartLinkAccess | undefined => {
    switch (tab) {
      case "public":
        return SmartLinkAccess.PUBLIC;
      case "private":
        return SmartLinkAccess.PRIVATE;
      case "premium":
        return SmartLinkAccess.PAYWALL;
      default:
        return undefined;
    }
  };

  const {
    data: contactsData,
    isLoading: contactsLoading,
    error: contactsError,
  } = useCRMContacts({
    id: user?.company?.id || "",
    perPage: 50,
    access: getAccessType(activeTab),
    q: debouncedSearch || undefined,
  });

  const analyticsCards = [
    {
      title: "Total Contacts",
      value: analytics?.totalContacts || 0,
      description: "Across all access types.",
      icon: Users,
      iconColor: "text-accent",
    },
    {
      title: "Premium Contacts",
      value: analytics?.premiumContacts || 0,
      description: "Paying customers.",
      icon: Lock,
      iconColor: "text-accent",
    },
    {
      title: "Total Clicks",
      value: formatNumber(analytics?.totalClicks || 0),
      description: "All time clicks.",
      icon: Eye,
      iconColor: "text-accent",
    },
    {
      title: "Revenue",
      value: `$${analytics?.totalRevenue || 0}`,
      description: "From premium content.",
      icon: DollarSign,
      iconColor: "text-accent",
    },
  ];

  const tabs = [
    {
      key: "public",
      label: "Public Links",
      count: analytics?.publicContacts || 0,
      icon: Globe,
    },
    {
      key: "private",
      label: "Private Links",
      count: analytics?.privateContacts || 0,
      icon: EyeOff,
    },
    {
      key: "premium",
      label: "Premium",
      count: analytics?.paywallContacts || 0,
      icon: Lock,
    },
  ];

  const typeOptions = [
    { name: "All Types", click: () => setTypeFilter("All Types") },
    { name: "Consumer", click: () => setTypeFilter("Consumer") },
    { name: "Business", click: () => setTypeFilter("Business") },
  ];

  const statusOptions = [
    { name: "All Status", click: () => setStatusFilter("All Status") },
    { name: "Active", click: () => setStatusFilter("Active") },
    { name: "Inactive", click: () => setStatusFilter("Inactive") },
  ];

  const getEngagementColor = (level: string) => {
    switch (level) {
      case "High":
        return "bg-accent text-accent-foreground";
      case "Medium":
        return "bg-muted text-muted-foreground";
      case "Low":
        return "bg-muted text-muted-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getStatusColor = (status: string) => {
    return status === "Active"
      ? "bg-accent text-accent-foreground"
      : "bg-muted text-muted-foreground";
  };

  const handleExport = async () => {
    try {
      setIsExporting(true);
      const blob = await CRMService.exportContacts();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const filename = `crm-export-${
        new Date().toISOString().split("T")[0]
      }.csv`;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }, 100);
      toast.success("CRM contacts exported successfully");
    } catch (error: any) {
      console.error("Error exporting contacts:", error);
      toast.error(
        error?.response?.data?.message || "Failed to export contacts"
      );
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <>
      <PageTitle
        title="CRM"
        description="Manage your audience and business relationships based on content access patterns."
      />

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {analyticsLoading ? (
          Array.from({ length: 4 }).map((_, index) => (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-3 w-32" />
              </CardContent>
            </Card>
          ))
        ) : analyticsError ? (
          <div className="col-span-full text-center py-8">
            <p className="text-muted-foreground">
              Failed to load analytics data
            </p>
          </div>
        ) : (
          analyticsCards.map((item, index) => (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="tracking-tight text-sm font-medium text-slate-900">
                  {item.title}
                </CardTitle>
                <item.icon className={`h-4 w-4 ${item.iconColor}`} />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-slate-900">
                  {item.value}
                </div>
                <p className="text-muted-foreground text-sm">
                  {item.description}
                </p>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Filters and Actions */}
      <div className="flex flex-col md:flex-row md:items-center gap-3 my-6">
        <div className="relative w-full md:w-auto flex-1 max-w-xs">
          <InputEnhanced
            iconLeft={<Search size={16} />}
            placeholder="Search contacts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-muted"
          />
        </div>
        {/* <div className="flex gap-2 items-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary">
                <Filter size={16} /> {typeFilter}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {typeOptions.map((option) => (
                <DropdownMenuItem
                  key={option.name}
                  onClick={() => option.click()}
                >
                  {option.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary">
                <Filter size={16} /> {statusFilter}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {statusOptions.map((option) => (
                <DropdownMenuItem
                  key={option.name}
                  onClick={() => option.click()}
                >
                  {option.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div> */}
        <div className="flex-1" />
        <Button
          variant="outline"
          className="text-sm md:w-auto w-full"
          onClick={handleExport}
          disabled={isExporting}
        >
          <Download size={16} className="mr-2" />
          {isExporting ? "Exporting..." : "Export CSV"}
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="flex w-full mb-4 rounded-lg overflow-hidden">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <TabsTrigger key={tab.key} value={tab.key}>
                <Icon size={20} />
                <span>{tab.label}</span>
                <span className="ml-2 px-2 py-0.5 rounded-full text-xs font-bold bg-white text-black">
                  {tab.count}
                </span>
              </TabsTrigger>
            );
          })}
        </TabsList>

        {/* Content */}
        <TabsContent value={activeTab}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {activeTab === "public" && (
                  <>
                    <Globe size={22} className="text-accent" />
                    Public Content Access
                  </>
                )}
                {activeTab === "private" && (
                  <>
                    <EyeOff size={22} className="text-accent" />
                    Private Content Access
                  </>
                )}
                {activeTab === "premium" && (
                  <>
                    <Lock size={22} className="text-accent" />
                    Premium Content Access
                  </>
                )}
              </CardTitle>
              <CardDescription>
                {activeTab === "public" &&
                  "Contacts who accessed publicly available content links."}
                {activeTab === "private" &&
                  "Contacts who accessed private content links."}
                {activeTab === "premium" &&
                  "Contacts who accessed premium content links."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="min-w-full text-left">
                  <thead>
                    <tr className="border-b text-muted-foreground uppercase text-xs">
                      <th className="py-3 px-6 font-semibold">Contact</th>
                      {/* <th className="py-3 px-6 font-semibold">Type</th> */}
                      <th className="py-3 px-6 font-semibold">Engagement</th>
                      <th className="py-3 px-6 font-semibold">Status</th>
                      <th className="py-3 px-6 font-semibold"></th>
                    </tr>
                  </thead>
                  <tbody className="text-slate-900 text-sm">
                    {contactsLoading ? (
                      Array.from({ length: 3 }).map((_, index) => (
                        <tr key={index} className="border-b">
                          <td className="py-3 px-6">
                            <div>
                              <Skeleton className="h-4 w-32 mb-1" />
                              <Skeleton className="h-3 w-40" />
                            </div>
                          </td>
                          <td className="py-3 px-6">
                            <div className="flex items-center gap-2">
                              <Skeleton className="h-4 w-16" />
                              <Skeleton className="h-6 w-12 rounded-full" />
                            </div>
                          </td>
                          <td className="py-3 px-6">
                            <Skeleton className="h-6 w-16 rounded-full" />
                          </td>
                          <td className="py-3 px-6">
                            <Skeleton className="h-8 w-8 rounded" />
                          </td>
                        </tr>
                      ))
                    ) : contactsError ? (
                      <tr>
                        <td colSpan={4} className="py-8 text-center">
                          <p className="text-muted-foreground">
                            Failed to load contacts
                          </p>
                        </td>
                      </tr>
                    ) : contactsData?.items?.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="py-8 text-center">
                          <p className="text-muted-foreground">
                            No contacts found
                          </p>
                        </td>
                      </tr>
                    ) : (
                      contactsData?.items?.map((contact) => (
                        <tr key={contact.id} className="border-b">
                          <td className="py-3 px-6">
                            <div>
                              <div className="font-medium">{contact.name}</div>
                              <div className="text-muted-foreground text-xs">
                                {contact.email}
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-6">
                            <div className="flex items-center gap-2">
                              <span>{contact.totalClicks} clicks</span>
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-semibold ${getEngagementColor(
                                  contact.engagementLevel
                                )}`}
                              >
                                {contact.engagementLevel}
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-6">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                                "Active"
                              )}`}
                            >
                              Active
                            </span>
                          </td>
                          <td className="py-3 px-6">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="secondary" size="iconSm">
                                  <MoreHorizontal size={18} />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem asChild>
                                  <Link
                                    href={`/dashboard/crm/contacts/${contact.id}`}
                                  >
                                    View Details
                                  </Link>
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </>
  );
};

const CRM = () => {
  return (
    <RoleGuard requiredPermission={["crm:read", "crm:*"]}>
      <CRMContent />
    </RoleGuard>
  );
};

export default CRM;
