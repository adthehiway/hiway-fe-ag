"use client";

import SmartLinkModal from "@/components/dashboard/common/SmartLinkModal";
import PageTitle from "@/components/dashboard/layout/PageTitle";
import AlertModal from "@/components/ui/alert-modal.component";
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
import { TableLoadMore } from "@/components/ui/table-load-more.component";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useSmartLinks,
  useSmartLinksAnalytics,
  useDeleteSmartLink,
  useCreateSmartLink,
  useUpdateSmartLink,
} from "@/hooks/useSmartLinks";
import {
  copyToClipboard,
  formatNumber,
  getSmartLinkUrl,
  valueToLabel,
  cn,
} from "@/lib/utils";
import { ISmartLink, SmartLinkAccess, SmartLinkStatus } from "@/types";
import {
  ArrowUpRightFromSquare,
  Copy,
  DollarSign,
  ExternalLink,
  Eye,
  EyeOff,
  Filter,
  GlobeIcon,
  LockIcon,
  MoreHorizontal,
  Plus,
  Search,
  RefreshCcw,
} from "lucide-react";
import moment from "moment";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { toast } from "react-toastify";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useEffectiveRole } from "@/hooks/useUserRole";
import { useUser } from "@/hooks/useUser";
import {
  canDeleteSmartlinks,
  canUpdateSmartlinks,
  canWriteSmartlinks,
} from "@/lib/permissions";
import { RoleGuard } from "@/components/dashboard/common/RoleGuard";

const SmartLinksPageContent = () => {
  const router = useRouter();
  const [tab, setTab] = useState(SmartLinkAccess.PRIVATE);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<SmartLinkStatus>(SmartLinkStatus.ALL);
  const statusDropdownTrigger = useRef<any>(null);
  const [smartLinkModalOpen, setSmartLinkModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [linkToDelete, setLinkToDelete] = useState<ISmartLink | null>(null);
  const effectiveRole = useEffectiveRole();
  const { data: user } = useUser();
  // Use the comprehensive hooks
  const {
    data: stats,
    isLoading: analyticsLoading,
    isError: analyticsError,
    refetch: refetchAnalytics,
  } = useSmartLinksAnalytics();

  const {
    smartLinks,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  } = useSmartLinks({
    access: tab,
    search,
    status,
    perPage: 50,
  });

  // Mutation hooks
  const deleteSmartLinkMutation = useDeleteSmartLink();
  const createSmartLinkMutation = useCreateSmartLink();
  const updateSmartLinkMutation = useUpdateSmartLink();

  const handleDeleteClick = (link: ISmartLink) => {
    setLinkToDelete(link);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!linkToDelete) return;

    try {
      await deleteSmartLinkMutation.mutateAsync(linkToDelete.id);
      setDeleteModalOpen(false);
      setLinkToDelete(null);
      toast.success("SmartLink deleted successfully");
    } catch (error) {
      console.error("Failed to delete smartlink:", error);
      toast.error("Failed to delete smartlink");
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModalOpen(false);
    setLinkToDelete(null);
  };

  // Handle errors
  if (isError || analyticsError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-slate-900 mb-2">
            {isError ? "Failed to load SmartLinks" : "Failed to load analytics"}
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

  const analytics = [
    {
      title: "Total SmartLinks",
      key: "total",
      icon: Eye,
      iconColor: "text-accent",
      value: stats?.totalLinks || 0,
      text: "Across all types",
    },
    {
      title: "Total Clicks",
      key: "clicks",
      icon: ArrowUpRightFromSquare,
      iconColor: "text-accent",
      value: stats?.totalClicks || 0,
      text: "All time clicks",
    },
    {
      title: "Paywalled Revenue",
      key: "revenue",
      icon: LockIcon,
      iconColor: "text-accent",
      value: stats?.totalRevenue || 0,
      text: "From paywalled content",
      currency: true,
    },
    {
      title: "Conversion Rate",
      key: "conversionRate",
      icon: DollarSign,
      iconColor: "text-accent",
      value: stats?.conversionRate || 0,
      text: "Paywalled conversion",
      percentage: true,
    },
  ];

  const TABS = [
    {
      key: SmartLinkAccess.PRIVATE,
      label: "Private Links",
      count: stats?.privateLinks || 0,
      icon: EyeOff,
    },
    {
      key: SmartLinkAccess.PUBLIC,
      label: "Public Links",
      count: stats?.publicLinks || 0,
      icon: Eye,
    },
    {
      key: SmartLinkAccess.SHARED,
      label: "Public Data Links",
      count: stats?.sharedLinks || 0,
      icon: GlobeIcon,
    },
    {
      key: SmartLinkAccess.PAYWALL,
      label: "Paywalled Links",
      count: stats?.paywallLinks || 0,
      icon: LockIcon,
    },
  ];

  const statusOptions = [
    { name: "All", click: () => setStatus(SmartLinkStatus.ALL) },
    { name: "Active", click: () => setStatus(SmartLinkStatus.ACTIVE) },
    { name: "Inactive", click: () => setStatus(SmartLinkStatus.INACTIVE) },
  ];

  return (
    <>
      {/* Header */}
      <PageTitle
        title="SmartLinks"
        description="Create and manage your SmartLinks for content you've shared and kept private."
      />
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 ">
        {analyticsLoading
          ? // Loading skeletons for analytics cards
            Array.from({ length: 4 }).map((_, index) => (
              <Card key={`analytics-skeleton-${index}`}>
                <CardHeader className="flex flex-row items-center justify-between">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-4 rounded-full" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-16 mb-2" />
                  <Skeleton className="h-4 w-32" />
                </CardContent>
              </Card>
            ))
          : analytics.map((item, index) => (
              <Card key={`analytics-${index}`}>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="tracking-tight text-sm font-medium text-slate-900">
                    {item.title}
                  </CardTitle>
                  <item.icon className={`h-4 w-4 ${item.iconColor}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-slate-900">
                    {item.currency && "$"} {formatNumber(item.value)}{" "}
                    {item.percentage && "%"}
                  </div>
                  <p className={`text-muted-foreground text-sm`}>{item.text}</p>
                </CardContent>
              </Card>
            ))}
      </div>
      {/* Filters and Actions */}
      <div className="flex flex-col md:flex-row md:items-center gap-3 my-6">
        <div className="relative w-full md:w-auto flex-1 max-w-xs">
          <InputEnhanced
            iconLeft={<Search size={16} />}
            placeholder="Search SmartLinks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-muted"
          />
        </div>
        <div className="flex gap-2 items-center">
          <div className="relative" ref={statusDropdownTrigger}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="secondary">
                  <Filter size={16} /> Status: {valueToLabel(status)}
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
          </div>
        </div>
        <div className="flex-1" />
        {canWriteSmartlinks(effectiveRole, user) && (
          <Button
            variant="outline"
            className="text-sm md:w-auto w-full"
            onClick={() => setSmartLinkModalOpen(true)}
            disabled={createSmartLinkMutation.isPending}
          >
            <Plus size={16} />
            {createSmartLinkMutation.isPending
              ? "Creating..."
              : "Create SmartLink"}
          </Button>
        )}
      </div>
      {/* Tabs */}
      <Tabs
        value={tab}
        onValueChange={(v) => setTab(v as SmartLinkAccess)}
        className="w-full"
      >
        <TabsList className="flex w-full mb-4 rounded-lg overflow-hidden">
          {TABS.map((t, idx) => {
            const Icon = t.icon;
            return (
              <TabsTrigger key={t.key} value={t.key}>
                <Icon size={20} />
                <span>{t.label}</span>
                <span className="ml-2 px-2 py-0.5 rounded-full text-xs font-bold bg-white text-black">
                  {t.count}
                </span>
              </TabsTrigger>
            );
          })}
        </TabsList>
        {/* Table */}
        <TabsContent value={tab}>
          <Card className=" overflow-x-auto min-h-[300px]">
            <CardHeader>
              {tab === SmartLinkAccess.PAYWALL && (
                <>
                  <CardTitle className="flex items-center gap-2">
                    <LockIcon size={22} className="text-accent" />
                    Paywalled SmartLinks
                  </CardTitle>
                  <CardDescription>
                    Links created with a paywall on them (views / download /
                    paywall)
                  </CardDescription>
                </>
              )}
              {tab === SmartLinkAccess.PUBLIC && (
                <>
                  <CardTitle className="flex items-center gap-2">
                    <Eye size={22} className="text-accent" />
                    Public SmartLinks
                  </CardTitle>
                  <CardDescription>
                    Links that are publicly accessible by anyone with the link
                  </CardDescription>
                </>
              )}
              {tab === SmartLinkAccess.SHARED && (
                <>
                  <CardTitle className="flex items-center gap-2">
                    <GlobeIcon size={22} className="text-accent" />
                    Public Data Links
                  </CardTitle>
                  <CardDescription>
                    Public links with data collection
                  </CardDescription>
                </>
              )}
              {tab === SmartLinkAccess.PRIVATE && (
                <>
                  <CardTitle className="flex items-center gap-2">
                    <EyeOff size={22} className="text-accent" />
                    Private SmartLinks
                  </CardTitle>
                  <CardDescription>
                    Links that are private and only accessible by you
                  </CardDescription>
                </>
              )}
            </CardHeader>
            <CardContent>
              {isLoading ? (
                // Loading skeleton for table
                <div className="space-y-4">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <div
                      key={index}
                      className="flex items-center space-x-4 p-4 border-b"
                    >
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-4 w-48" />
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-4 w-24" />
                      {tab === SmartLinkAccess.PAYWALL && (
                        <Skeleton className="h-4 w-16" />
                      )}
                      {tab === SmartLinkAccess.PAYWALL && (
                        <Skeleton className="h-4 w-20" />
                      )}
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-4 w-8" />
                    </div>
                  ))}
                </div>
              ) : smartLinks.length === 0 ? (
                // Empty state
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="text-muted-foreground mb-4">
                    <Eye className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <h3 className="text-lg font-semibold mb-2">
                      No SmartLinks found
                    </h3>
                    <p className="text-sm">
                      {search
                        ? "No SmartLinks match your search criteria."
                        : "Create your first SmartLink to get started."}
                    </p>
                  </div>
                  {!search && (
                    <Button onClick={() => setSmartLinkModalOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create SmartLink
                    </Button>
                  )}
                </div>
              ) : (
                <>
                  <table className="min-w-full text-left">
                    <thead>
                      <tr className="border-b  text-muted-foreground uppercase text-xs">
                        <th className="py-3 px-6 font-semibold">Name</th>
                        <th className="py-3 px-6 font-semibold">Slug</th>
                        <th className="py-3 px-6 font-semibold">Clicks</th>
                        {/* <th className="py-3 px-6 font-semibold">Shares</th> */}
                        <th className="py-3 px-6 font-semibold">Views</th>
                        <th className="py-3 px-6 font-semibold">Expiry Date</th>
                        {tab === SmartLinkAccess.PAYWALL && (
                          <th className="py-3 px-6 font-semibold">Price</th>
                        )}
                        {tab === SmartLinkAccess.PAYWALL && (
                          <th className="py-3 px-6 font-semibold">
                            Conversions
                          </th>
                        )}
                        <th className="py-3 px-6 font-semibold">Status</th>
                        <th className="py-3 px-6 font-semibold"></th>
                      </tr>
                    </thead>
                    <tbody className="text-slate-900 text-sm">
                      {smartLinks.map((link) => (
                        <tr key={link.id} className="border-b ">
                          <td className="py-3 px-6 font-medium">
                            {link.name ? link.name : "-"}
                          </td>
                          <td className="py-3 px-6">
                            <div className="flex items-center gap-2">
                              <Link
                                href={
                                  link.slug
                                    ? getSmartLinkUrl({
                                        slug: link.slug,
                                      })
                                    : "#"
                                }
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-accent hover:underline font-medium"
                              >
                                {link.slug || "-"}
                              </Link>
                              <Button
                                variant="secondary"
                                size="iconSm"
                                onClick={() =>
                                  copyToClipboard(
                                    link.slug
                                      ? getSmartLinkUrl({
                                          slug: link.slug,
                                        })
                                      : "",
                                  )
                                }
                                title="Copy full URL"
                              >
                                <Copy size={16} />
                              </Button>
                              <Button
                                variant="secondary"
                                size="iconSm"
                                onClick={() =>
                                  window.open(
                                    link.slug
                                      ? getSmartLinkUrl({
                                          slug: link.slug,
                                        })
                                      : "",
                                    "_blank",
                                  )
                                }
                                title="Open in new tab"
                              >
                                <ExternalLink size={16} />
                              </Button>
                            </div>
                          </td>
                          <td className="py-3 px-6">
                            {formatNumber(link.totalClicks ?? 0)}
                          </td>
                          {/* <td className="py-3 px-6">{link.shares ?? "-"}</td> */}
                          <td className="py-3 px-6">
                            {formatNumber(link.totalViews ?? 0)} /{" "}
                            {link.maxViews ? formatNumber(link.maxViews) : "∞"}
                          </td>
                          <td className="py-3 px-6">
                            {link.expiresAt
                              ? moment(link.expiresAt).format("YYYY-MM-DD")
                              : "Never"}
                          </td>
                          {tab === SmartLinkAccess.PAYWALL && (
                            <td className="py-3 px-6 text-accent font-bold">
                              {link.price
                                ? `${formatNumber(link.price)} ${link.currency ?? "USD"}`
                                : "-"}
                            </td>
                          )}
                          {tab === SmartLinkAccess.PAYWALL && (
                            <td className="py-3 px-6">
                              {link.conversionRate}%
                            </td>
                          )}
                          <td className="py-3 px-6">
                            <span
                              className={
                                link.status === SmartLinkStatus.ACTIVE
                                  ? "bg-accent text-accent-foreground px-4 py-1 rounded-full text-xs font-semibold"
                                  : "bg-muted text-muted-foreground px-4 py-1 rounded-full text-xs font-semibold"
                              }
                            >
                              {link.status === SmartLinkStatus.ACTIVE
                                ? "Active"
                                : "Inactive"}
                            </span>
                          </td>
                          <td className="py-3 px-6">
                            {(canUpdateSmartlinks(effectiveRole, user) ||
                              canDeleteSmartlinks(effectiveRole, user)) && (
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="secondary" size="iconSm">
                                    <MoreHorizontal size={18} />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                  className="w-56"
                                  align="start"
                                >
                                  {canUpdateSmartlinks(effectiveRole, user) && (
                                    <DropdownMenuItem
                                      onClick={() =>
                                        router.push(
                                          `/dashboard/smartlinks/${link.id}/edit`,
                                        )
                                      }
                                    >
                                      Edit
                                    </DropdownMenuItem>
                                  )}
                                  {canDeleteSmartlinks(effectiveRole, user) && (
                                    <DropdownMenuItem
                                      variant="destructive"
                                      onClick={() => handleDeleteClick(link)}
                                    >
                                      Delete
                                    </DropdownMenuItem>
                                  )}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <TableLoadMore
                    fetchInProgress={isFetchingNextPage}
                    continuationToken={hasNextPage ? 1 : undefined}
                    onEnterView={() => {
                      if (hasNextPage && !isFetchingNextPage) {
                        fetchNextPage();
                      }
                    }}
                    isLoading={isLoading}
                  />
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      <SmartLinkModal
        isOpen={smartLinkModalOpen}
        onClose={() => setSmartLinkModalOpen(false)}
      />
      <AlertModal
        isOpen={deleteModalOpen}
        title="Delete SmartLink"
        message={`Are you sure you want to delete "${
          linkToDelete?.name || "this smartlink"
        }"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        danger={true}
      />
    </>
  );
};

const SmartLinksPage = () => {
  return (
    <RoleGuard requiredPermission={["smartlink:read", "smartlink:*"]}>
      <SmartLinksPageContent />
    </RoleGuard>
  );
};

export default SmartLinksPage;
