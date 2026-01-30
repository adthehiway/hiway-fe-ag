"use client";

import SmartRoomModal from "@/components/dashboard/common/SmartRoomModal";
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
import { useSmartRooms, useDeleteSmartRoom } from "@/hooks/useSmartRooms";
import { useSmartRoomsAnalytics } from "@/hooks/useSmartRoomsAnalytics";
import { copyToClipboard, formatNumber, valueToLabel, cn } from "@/lib/utils";
import { ISmartRoom, SmartLinkAccess } from "@/types";
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
import { useState } from "react";
import { toast } from "react-toastify";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useEffectiveRole } from "@/hooks/useUserRole";
import { useUser } from "@/hooks/useUser";
import {
  canDeleteSmartrooms,
  canUpdateSmartrooms,
  canWriteSmartrooms,
} from "@/lib/permissions";
import { RoleGuard } from "@/components/dashboard/common/RoleGuard";

const getSmartRoomUrl = (slug: string) => {
  const baseUrl = process.env.NEXT_PUBLIC_WATCH_URL || window.location.origin;
  return `${baseUrl}/room/${slug}`;
};

const SmartRoomsPageContent = () => {
  const router = useRouter();
  const [tab, setTab] = useState<SmartLinkAccess>(SmartLinkAccess.PRIVATE);
  const [search, setSearch] = useState("");
  const [smartRoomModalOpen, setSmartRoomModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [roomToDelete, setRoomToDelete] = useState<ISmartRoom | null>(null);
  const effectiveRole = useEffectiveRole();
  const { data: user } = useUser();

  const {
    data: stats,
    isLoading: analyticsLoading,
    isError: analyticsError,
    refetch: refetchAnalytics,
  } = useSmartRoomsAnalytics();

  const {
    smartRooms,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  } = useSmartRooms({
    access: tab,
    search,
    perPage: 50,
  });

  // Mutation hooks
  const deleteSmartRoomMutation = useDeleteSmartRoom();

  const handleDeleteClick = (room: ISmartRoom) => {
    setRoomToDelete(room);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!roomToDelete) return;

    try {
      await deleteSmartRoomMutation.mutateAsync(roomToDelete.id);
      setDeleteModalOpen(false);
      setRoomToDelete(null);
      toast.success("Smart Room deleted successfully");
    } catch (error) {
      console.error("Failed to delete smart room:", error);
      toast.error("Failed to delete smart room");
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModalOpen(false);
    setRoomToDelete(null);
  };

  // Handle errors
  if (isError || analyticsError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-white mb-2">
            {isError
              ? "Failed to load Smart Rooms"
              : "Failed to load analytics"}
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

  const TABS = [
    {
      key: SmartLinkAccess.PRIVATE,
      label: "Private Rooms",
      count: stats?.privateRooms || 0,
      icon: EyeOff,
    },
    {
      key: SmartLinkAccess.PUBLIC,
      label: "Public Rooms",
      count: stats?.publicRooms || 0,
      icon: Eye,
    },
    {
      key: SmartLinkAccess.SHARED,
      label: "Public Data Rooms",
      count: stats?.sharedRooms || 0,
      icon: GlobeIcon,
    },
    {
      key: SmartLinkAccess.PAYWALL,
      label: "Paywalled Rooms",
      count: stats?.paywallRooms || 0,
      icon: LockIcon,
    },
  ];

  const getAccessIcon = (access: SmartLinkAccess) => {
    switch (access) {
      case SmartLinkAccess.PUBLIC:
        return Eye;
      case SmartLinkAccess.SHARED:
        return GlobeIcon;
      case SmartLinkAccess.PRIVATE:
        return EyeOff;
      case SmartLinkAccess.PAYWALL:
        return LockIcon;
      default:
        return Eye;
    }
  };

  const analytics = [
    {
      title: "Total Rooms",
      key: "total",
      icon: Eye,
      iconColor: "text-accent",
      value: stats?.totalRooms || 0,
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

  return (
    <>
      <PageTitle
        title="Smart Rooms"
        description="Manage your Smart Rooms - bundles of multiple media items"
        content={
          canWriteSmartrooms(effectiveRole, user) && (
            <Button onClick={() => setSmartRoomModalOpen(true)}>
              <Plus size={18} className="shrink-0 mr-2" />
              Create Smart Room
            </Button>
          )
        }
      />
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
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
                  <CardTitle className="tracking-tight text-sm font-medium text-white">
                    {item.title}
                  </CardTitle>
                  <item.icon className={`h-4 w-4 ${item.iconColor}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-white">
                    {item.currency && "$"} {formatNumber(item.value)} {item.percentage && "%"}
                  </div>
                  <p className={`text-muted-foreground text-sm`}>{item.text}</p>
                </CardContent>
              </Card>
            ))}
      </div>

      <div className="space-y-6">
        {/* Tabs */}
        <Tabs
          value={tab}
          onValueChange={(val) => setTab(val as SmartLinkAccess)}
        >
          <TabsList className="grid w-full grid-cols-4">
            {TABS.map((tabItem) => (
              <TabsTrigger
                key={tabItem.key}
                value={tabItem.key}
                className="flex items-center gap-2"
              >
                <tabItem.icon size={16} />
                <span>{tabItem.label}</span>
                <span className="ml-2 px-2 py-0.5 rounded-full text-xs font-bold bg-white text-black">
                  {tabItem.count}
                </span>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {/* Search */}
        <div className="flex gap-4">
          <div className="flex-1">
            <InputEnhanced
              placeholder="Search smart rooms..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              // icon prop removed because it's not in InputEnhancedProps
            />
          </div>
        </div>

        {/* Table */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        ) : smartRooms.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <p className="text-muted-foreground mb-4">No smart rooms found</p>
              <Button onClick={() => setSmartRoomModalOpen(true)}>
                <Plus size={18} className="mr-2" />
                Create Your First Smart Room
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Smart Rooms</CardTitle>
              <CardDescription>
                {smartRooms.length} room{smartRooms.length !== 1 ? "s" : ""}{" "}
                found
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b text-left">
                      <th className="py-3 px-6 font-semibold text-white">
                        Name
                      </th>
                      <th className="py-3 px-6 font-semibold text-white">
                        Slug
                      </th>
                      <th className="py-3 px-6 font-semibold text-white">
                        Access
                      </th>
                      <th className="py-3 px-6 font-semibold text-white">
                        Media Items
                      </th>
                      <th className="py-3 px-6 font-semibold text-white">
                        Price
                      </th>
                      <th className="py-3 px-6 font-semibold text-white">
                        Created
                      </th>
                      <th className="py-3 px-6 font-semibold text-white">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="text-white text-sm">
                    {smartRooms.map((room) => {
                      const AccessIcon = getAccessIcon(room.access);
                      return (
                        <tr key={room.id} className="border-b">
                          <td className="py-3 px-6 font-medium">
                            {room.name || "-"}
                          </td>
                          <td className="py-3 px-6">
                            <div className="flex items-center gap-2">
                              <Link
                                href={
                                  room.slug ? getSmartRoomUrl(room.slug) : "#"
                                }
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-accent hover:underline font-medium"
                              >
                                {room.slug || "-"}
                              </Link>
                              <Button
                                variant="secondary"
                                size="iconSm"
                                onClick={() =>
                                  copyToClipboard(
                                    room.slug ? getSmartRoomUrl(room.slug) : ""
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
                                    room.slug ? getSmartRoomUrl(room.slug) : "",
                                    "_blank"
                                  )
                                }
                                title="Open in new tab"
                              >
                                <ExternalLink size={16} />
                              </Button>
                            </div>
                          </td>
                          <td className="py-3 px-6">
                            <div className="flex items-center gap-2">
                              <AccessIcon size={16} />
                              {valueToLabel(room.access)}
                            </div>
                          </td>
                          <td className="py-3 px-6">
                            {room.smartLinks?.length || 0} item
                            {(room.smartLinks?.length || 0) !== 1 ? "s" : ""}
                          </td>
                          <td className="py-3 px-6">
                            {room.access === SmartLinkAccess.PAYWALL &&
                            room.price
                                ? `${room.currency || "USD"} ${formatNumber(
                                  room.price
                                )}`
                              : "-"}
                          </td>
                          <td className="py-3 px-6">
                            {moment(room.createdAt).format("MMM DD, YYYY")}
                          </td>
                          <td className="py-3 px-6">
                            {(canUpdateSmartrooms(effectiveRole, user) ||
                              canDeleteSmartrooms(effectiveRole, user)) && (
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="iconSm">
                                    <MoreHorizontal size={16} />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  {canUpdateSmartrooms(effectiveRole, user) && (
                                    <DropdownMenuItem
                                      onClick={() =>
                                        router.push(
                                          `/dashboard/smartrooms/${room.id}/edit`
                                        )
                                      }
                                    >
                                      Edit
                                    </DropdownMenuItem>
                                  )}
                                  {canDeleteSmartrooms(effectiveRole, user) && (
                                    <DropdownMenuItem
                                      onClick={() => handleDeleteClick(room)}
                                      className="text-destructive"
                                    >
                                      Delete
                                    </DropdownMenuItem>
                                  )}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className="mt-4">
                <TableLoadMore
                  continuationToken={hasNextPage ? 1 : undefined}
                  fetchInProgress={isFetchingNextPage}
                  onEnterView={() => {
                    if (hasNextPage && !isFetchingNextPage) {
                      fetchNextPage();
                    }
                  }}
                  isLoading={isLoading}
                />
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Create Modal */}
      <SmartRoomModal
        isOpen={smartRoomModalOpen}
        onClose={() => setSmartRoomModalOpen(false)}
      />

      {/* Delete Modal */}
      <AlertModal
        isOpen={deleteModalOpen}
        onCancel={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Delete Smart Room"
        message={`Are you sure you want to delete "${roomToDelete?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        danger={true}
      />
    </>
  );
};

const SmartRoomsPage = () => {
  return (
    <RoleGuard requiredPermission={["smartroom:read", "smartroom:*"]}>
      <SmartRoomsPageContent />
    </RoleGuard>
  );
};

export default SmartRoomsPage;
