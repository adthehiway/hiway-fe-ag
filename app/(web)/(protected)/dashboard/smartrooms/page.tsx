"use client";

import SmartRoomModal from "@/components/dashboard/common/SmartRoomModal";
import PageTitle from "@/components/dashboard/layout/PageTitle";
import AlertModal from "@/components/ui/alert-modal.component";
import { Badge } from "@/components/ui/badge";
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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  Users,
  TrendingUp,
} from "lucide-react";
import moment from "moment";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "react-toastify";
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
          <h3 className="text-lg font-semibold text-foreground mb-2">
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
      label: "Private",
      count: stats?.privateRooms || 0,
      icon: EyeOff,
    },
    {
      key: SmartLinkAccess.PUBLIC,
      label: "Public",
      count: stats?.publicRooms || 0,
      icon: Eye,
    },
    {
      key: SmartLinkAccess.SHARED,
      label: "Data Rooms",
      count: stats?.sharedRooms || 0,
      icon: GlobeIcon,
    },
    {
      key: SmartLinkAccess.PAYWALL,
      label: "Paywalled",
      count: stats?.paywallRooms || 0,
      icon: LockIcon,
    },
  ];

  const getAccessBadge = (access: SmartLinkAccess) => {
    switch (access) {
      case SmartLinkAccess.PUBLIC:
        return <Badge className="bg-green-500/20 text-green-600 border-0">Public</Badge>;
      case SmartLinkAccess.SHARED:
        return <Badge className="bg-blue-500/20 text-blue-600 border-0">Data Room</Badge>;
      case SmartLinkAccess.PRIVATE:
        return <Badge className="bg-orange-500/20 text-orange-600 border-0">Private</Badge>;
      case SmartLinkAccess.PAYWALL:
        return <Badge className="bg-purple-500/20 text-purple-600 border-0">Paywalled</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const analytics = [
    {
      title: "Total Rooms",
      key: "total",
      icon: Users,
      value: stats?.totalRooms || 0,
      text: "Across all types",
    },
    {
      title: "Active Rooms",
      key: "active",
      icon: Eye,
      value: stats?.publicRooms || 0,
      text: "Currently active",
    },
    {
      title: "Total Views",
      key: "clicks",
      icon: TrendingUp,
      value: stats?.totalClicks || 0,
      text: "All time views",
    },
    {
      title: "Total Revenue",
      key: "revenue",
      icon: DollarSign,
      value: stats?.totalRevenue || 0,
      text: "From paywalled rooms",
      currency: true,
      highlight: true,
    },
  ];

  return (
    <div className="space-y-6">
      <PageTitle
        title="Smart Rooms"
        description="Manage your Smart Rooms - bundles of multiple media items"
      />

      {/* Tab Switcher - Pill Style */}
      <div className="flex rounded-lg overflow-hidden border border-border">
        {TABS.map((tabItem) => {
          const Icon = tabItem.icon;
          const isActive = tab === tabItem.key;
          return (
            <button
              key={tabItem.key}
              onClick={() => setTab(tabItem.key)}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-3 px-4 text-sm font-medium transition-colors",
                isActive
                  ? "bg-[#00B4B4] text-white"
                  : "bg-card text-muted-foreground hover:bg-muted"
              )}
            >
              <Icon size={18} />
              <span>{tabItem.label}</span>
              <span className={cn(
                "px-2 py-0.5 rounded-full text-xs font-bold",
                isActive ? "bg-white/20 text-white" : "bg-muted text-muted-foreground"
              )}>
                {tabItem.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {analyticsLoading
          ? Array.from({ length: 4 }).map((_, index) => (
              <Card key={`analytics-skeleton-${index}`}>
                <CardContent className="py-5 px-5">
                  <Skeleton className="h-4 w-24 mb-3" />
                  <Skeleton className="h-8 w-20 mb-2" />
                  <Skeleton className="h-4 w-32" />
                </CardContent>
              </Card>
            ))
          : analytics.map((item, index) => (
              <Card key={`analytics-${index}`}>
                <CardContent className="py-5 px-5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-muted-foreground">
                      {item.title}
                    </span>
                    <item.icon className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className={cn(
                    "text-2xl font-bold",
                    item.highlight ? "text-[#00B4B4]" : "text-foreground"
                  )}>
                    {item.currency && "$"}{formatNumber(item.value)}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{item.text}</p>
                </CardContent>
              </Card>
            ))}
      </div>

      {/* Search and Filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search smart rooms..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select defaultValue="all">
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
        {canWriteSmartrooms(effectiveRole, user) && (
          <Button
            className="bg-[#00B4B4] hover:bg-[#009999] ml-auto"
            onClick={() => setSmartRoomModalOpen(true)}
          >
            <Plus size={18} className="mr-2" />
            Add Room
          </Button>
        )}
      </div>

      {/* Table */}
      {isLoading ? (
        <Card>
          <CardContent className="p-0">
            <div className="p-6 space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-10 w-10 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-24" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : smartRooms.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No smart rooms found</h3>
            <p className="text-muted-foreground mb-4">Create your first smart room to get started.</p>
            {canWriteSmartrooms(effectiveRole, user) && (
              <Button
                className="bg-[#00B4B4] hover:bg-[#009999]"
                onClick={() => setSmartRoomModalOpen(true)}
              >
                <Plus size={18} className="mr-2" />
                Create Smart Room
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50 border-b border-border">
                  <tr>
                    <th className="py-3 px-4 text-left text-xs font-medium text-muted-foreground uppercase">
                      Room
                    </th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-muted-foreground uppercase">
                      Access
                    </th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-muted-foreground uppercase">
                      Items
                    </th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-muted-foreground uppercase">
                      Price
                    </th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-muted-foreground uppercase">
                      Status
                    </th>
                    <th className="py-3 px-4"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {smartRooms.map((room) => (
                    <tr key={room.id} className="hover:bg-muted/30 transition-colors">
                      <td className="py-4 px-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-foreground">
                              {room.name || "Untitled"}
                            </span>
                            <button
                              onClick={() => window.open(room.slug ? getSmartRoomUrl(room.slug) : "", "_blank")}
                              className="text-muted-foreground hover:text-foreground"
                            >
                              <ExternalLink size={14} />
                            </button>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <Link
                              href={room.slug ? getSmartRoomUrl(room.slug) : "#"}
                              target="_blank"
                              className="text-xs text-[#00B4B4] hover:underline"
                            >
                              /{room.slug || "---"}
                            </Link>
                            <button
                              onClick={() => copyToClipboard(room.slug ? getSmartRoomUrl(room.slug) : "")}
                              className="text-muted-foreground hover:text-foreground"
                            >
                              <Copy size={12} />
                            </button>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            Created {moment(room.createdAt).format("MMM DD, YYYY")}
                          </p>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        {getAccessBadge(room.access)}
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-sm text-foreground">
                          {room.smartLinks?.length || 0} items
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-sm font-medium text-foreground">
                          {room.access === SmartLinkAccess.PAYWALL && room.price
                            ? `$${formatNumber(room.price)}`
                            : "—"}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <Badge className="bg-[#00B4B4] text-white border-0">Active</Badge>
                      </td>
                      <td className="py-4 px-4">
                        {(canUpdateSmartrooms(effectiveRole, user) ||
                          canDeleteSmartrooms(effectiveRole, user)) && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal size={16} />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => copyToClipboard(room.slug ? getSmartRoomUrl(room.slug) : "")}
                              >
                                <Copy className="h-4 w-4 mr-2" />
                                Copy Link
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => window.open(room.slug ? getSmartRoomUrl(room.slug) : "", "_blank")}
                              >
                                <ExternalLink className="h-4 w-4 mr-2" />
                                Open Room
                              </DropdownMenuItem>
                              {canUpdateSmartrooms(effectiveRole, user) && (
                                <DropdownMenuItem
                                  onClick={() => router.push(`/dashboard/smartrooms/${room.id}/edit`)}
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
                  ))}
                </tbody>
              </table>
            </div>
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
          </CardContent>
        </Card>
      )}

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
    </div>
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
