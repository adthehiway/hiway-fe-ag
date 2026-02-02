"use client";

import SmartLinkModal from "@/components/dashboard/common/SmartLinkModal";
import PageTitle from "@/components/dashboard/layout/PageTitle";
import AlertModal from "@/components/ui/alert-modal.component";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { Switch } from "@/components/ui/switch";
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
  Link as LinkIcon,
  Clock,
  Folder,
  FolderOpen,
  ChevronRight,
  ChevronDown,
  Tag,
  Bookmark,
  TrendingUp,
  AlertCircle,
} from "lucide-react";
import moment from "moment";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { toast } from "react-toastify";
import { useEffectiveRole } from "@/hooks/useUserRole";
import { useUser } from "@/hooks/useUser";
import {
  canDeleteSmartlinks,
  canUpdateSmartlinks,
  canWriteSmartlinks,
} from "@/lib/permissions";
import { RoleGuard } from "@/components/dashboard/common/RoleGuard";

// Mock folder data
const mockFolders = [
  {
    id: "all",
    name: "All SmartLinks",
    count: 50,
    children: [],
  },
  {
    id: "q1-2026",
    name: "Q1 2026 Releases",
    count: 24,
    children: [
      { id: "horror", name: "Horror", count: 8 },
      { id: "drama", name: "Drama", count: 10 },
      { id: "documentary", name: "Documentary", count: 6 },
    ],
  },
  {
    id: "clients",
    name: "Client Projects",
    count: 45,
    children: [
      { id: "netflix", name: "Netflix", count: 15 },
      { id: "amazon", name: "Amazon", count: 12 },
      { id: "hbo", name: "HBO", count: 18 },
    ],
  },
  {
    id: "marketing",
    name: "Marketing Campaigns",
    count: 18,
    children: [],
  },
  {
    id: "festivals",
    name: "Festival Submissions",
    count: 32,
    children: [],
  },
  {
    id: "archive",
    name: "Archive",
    count: 156,
    children: [],
  },
];

const savedFilters = [
  { id: "active-revenue", name: "Active & High Revenue", icon: TrendingUp },
  { id: "expiring", name: "Expiring This Week", icon: Clock },
  { id: "top-performers", name: "Top Performers", icon: TrendingUp },
  { id: "draft", name: "Draft Links", icon: Bookmark },
  { id: "paywalled", name: "Paywalled Links", icon: LockIcon },
  { id: "private", name: "Private Links", icon: EyeOff },
  { id: "public", name: "Public Links", icon: Eye },
];

interface FolderItemProps {
  folder: typeof mockFolders[0];
  selectedFolder: string;
  onSelect: (id: string) => void;
  expandedFolders: string[];
  onToggleExpand: (id: string) => void;
  level?: number;
}

const FolderItem = ({
  folder,
  selectedFolder,
  onSelect,
  expandedFolders,
  onToggleExpand,
  level = 0,
}: FolderItemProps) => {
  const hasChildren = folder.children && folder.children.length > 0;
  const isExpanded = expandedFolders.includes(folder.id);
  const isSelected = selectedFolder === folder.id;

  return (
    <div>
      <div
        className={cn(
          "flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer text-sm transition-colors",
          isSelected
            ? "bg-[#00B4B4]/10 text-[#00B4B4]"
            : "hover:bg-muted text-slate-600 dark:text-slate-400"
        )}
        style={{ paddingLeft: `${8 + level * 16}px` }}
        onClick={() => onSelect(folder.id)}
      >
        {hasChildren && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleExpand(folder.id);
            }}
            className="p-0.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded"
          >
            {isExpanded ? (
              <ChevronDown className="h-3 w-3" />
            ) : (
              <ChevronRight className="h-3 w-3" />
            )}
          </button>
        )}
        {!hasChildren && <span className="w-4" />}
        {isExpanded ? (
          <FolderOpen className="h-4 w-4 shrink-0" />
        ) : (
          <Folder className="h-4 w-4 shrink-0" />
        )}
        <span className="flex-1 truncate">{folder.name}</span>
        <span className="text-xs text-slate-400">{folder.count}</span>
      </div>
      {hasChildren && isExpanded && (
        <div>
          {folder.children.map((child) => (
            <FolderItem
              key={child.id}
              folder={{ ...child, children: [] }}
              selectedFolder={selectedFolder}
              onSelect={onSelect}
              expandedFolders={expandedFolders}
              onToggleExpand={onToggleExpand}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const SmartLinksPageContent = () => {
  const router = useRouter();
  const [tab, setTab] = useState(SmartLinkAccess.PRIVATE);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string>("all");
  const [smartLinkModalOpen, setSmartLinkModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [linkToDelete, setLinkToDelete] = useState<ISmartLink | null>(null);
  const [selectedFolder, setSelectedFolder] = useState("all");
  const [expandedFolders, setExpandedFolders] = useState<string[]>(["q1-2026", "clients"]);
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);
  const effectiveRole = useEffectiveRole();
  const { data: user } = useUser();

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
    status: status === "all" ? SmartLinkStatus.ALL : status === "active" ? SmartLinkStatus.ACTIVE : SmartLinkStatus.INACTIVE,
    perPage: 50,
  });

  const deleteSmartLinkMutation = useDeleteSmartLink();
  const createSmartLinkMutation = useCreateSmartLink();

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

  const toggleExpand = (id: string) => {
    setExpandedFolders((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
    );
  };

  if (isError || analyticsError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-foreground mb-2">
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

  const kpiStats = [
    {
      label: "Total Links",
      value: stats?.totalLinks || 50,
      subtext: `${stats?.totalLinks ? Math.floor(stats.totalLinks * 0.8) : 40} active`,
      icon: LinkIcon,
      iconBg: "bg-[#00B4B4]/10",
      iconColor: "text-[#00B4B4]",
    },
    {
      label: "Total Views",
      value: stats?.totalClicks || 349000,
      subtext: "+12% this month",
      subtextColor: "text-green-500",
      icon: Eye,
      iconBg: "bg-green-500/10",
      iconColor: "text-green-500",
    },
    {
      label: "Revenue",
      value: stats?.totalRevenue || 216900,
      prefix: "$",
      subtext: "+8% this month",
      subtextColor: "text-green-500",
      icon: DollarSign,
      iconBg: "bg-amber-500/10",
      iconColor: "text-amber-500",
    },
    {
      label: "Expiring Soon",
      value: 1,
      subtext: "Within next 7 days",
      icon: AlertCircle,
      iconBg: "bg-orange-500/10",
      iconColor: "text-orange-500",
    },
  ];

  const getAccessBadge = (access: SmartLinkAccess) => {
    switch (access) {
      case SmartLinkAccess.PRIVATE:
        return <Badge className="bg-orange-500/20 text-orange-600">Private</Badge>;
      case SmartLinkAccess.PUBLIC:
        return <Badge className="bg-green-500/20 text-green-600">Public</Badge>;
      case SmartLinkAccess.PAYWALL:
        return <Badge className="bg-purple-500/20 text-purple-600">Paywalled</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const getStatusBadge = (linkStatus: SmartLinkStatus) => {
    return linkStatus === SmartLinkStatus.ACTIVE ? (
      <Badge className="bg-[#00B4B4] text-white">Active</Badge>
    ) : (
      <Badge variant="secondary">Draft</Badge>
    );
  };

  return (
    <div className="space-y-6">
      <PageTitle
        title="SmartLinks"
        description="Manage and organize your distribution links at scale."
        content={
          canWriteSmartlinks(effectiveRole, user) ? (
            <Button
              className="bg-[#00B4B4] hover:bg-[#009999]"
              onClick={() => setSmartLinkModalOpen(true)}
              disabled={createSmartLinkMutation.isPending}
            >
              <Plus className="h-4 w-4 mr-2" />
              {createSmartLinkMutation.isPending ? "Creating..." : "Create SmartLink"}
            </Button>
          ) : null
        }
      />

      {/* KPI Cards - Compact */}
      <div className="grid grid-cols-4 gap-3">
        {analyticsLoading
          ? Array.from({ length: 4 }).map((_, idx) => (
              <Card key={idx}>
                <CardContent className="py-3 px-4">
                  <Skeleton className="h-4 w-20 mb-2" />
                  <Skeleton className="h-6 w-16 mb-1" />
                  <Skeleton className="h-3 w-24" />
                </CardContent>
              </Card>
            ))
          : kpiStats.map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <Card key={idx}>
                  <CardContent className="py-3 px-4">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-slate-500">{stat.label}</span>
                      <div className={cn("h-7 w-7 rounded-md flex items-center justify-center", stat.iconBg)}>
                        <Icon className={cn("h-4 w-4", stat.iconColor)} />
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-slate-900 dark:text-foreground">
                      {stat.prefix}
                      {typeof stat.value === "number" && stat.value >= 1000
                        ? `${(stat.value / 1000).toFixed(stat.value >= 100000 ? 0 : 1)}K`
                        : stat.value}
                    </div>
                    <p className={cn("text-xs", stat.subtextColor || "text-slate-400")}>
                      {stat.subtext}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
      </div>

      {/* Main Content with Sidebar */}
      <div className="flex gap-6">
        {/* Left Sidebar - Folders */}
        <div className="w-64 shrink-0 space-y-4">
          <Card>
            <CardHeader className="py-3 px-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold">Folders</CardTitle>
                <Button variant="ghost" size="icon" className="h-6 w-6">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="py-2 px-2">
              <div className="space-y-0.5">
                {mockFolders.map((folder) => (
                  <FolderItem
                    key={folder.id}
                    folder={folder}
                    selectedFolder={selectedFolder}
                    onSelect={setSelectedFolder}
                    expandedFolders={expandedFolders}
                    onToggleExpand={toggleExpand}
                  />
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="py-3 px-4">
              <CardTitle className="text-sm font-semibold">Saved Filters</CardTitle>
            </CardHeader>
            <CardContent className="py-2 px-2">
              <div className="space-y-0.5">
                {savedFilters.map((filter) => {
                  const Icon = filter.icon;
                  return (
                    <div
                      key={filter.id}
                      onClick={() => setSelectedFilter(filter.id === selectedFilter ? null : filter.id)}
                      className={cn(
                        "flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer text-sm transition-colors",
                        selectedFilter === filter.id
                          ? "bg-[#00B4B4]/10 text-[#00B4B4]"
                          : "hover:bg-muted text-slate-600 dark:text-slate-400"
                      )}
                    >
                      <Bookmark className="h-4 w-4" />
                      <span className="truncate">{filter.name}</span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {/* Search and Filters */}
          <div className="flex items-center gap-3 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search SmartLinks..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Draft</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Tag className="h-4 w-4 mr-2" />
              Tags
            </Button>
          </div>

          {/* Table */}
          <Card>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="p-4 space-y-3">
                  {Array.from({ length: 5 }).map((_, idx) => (
                    <div key={idx} className="flex items-center gap-4">
                      <Skeleton className="h-4 w-4" />
                      <Skeleton className="h-4 w-40" />
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-5 w-16" />
                      <Skeleton className="h-5 w-14" />
                      <Skeleton className="h-4 w-12" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                  ))}
                </div>
              ) : smartLinks.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <LinkIcon className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                  <h3 className="text-lg font-semibold mb-2">No SmartLinks found</h3>
                  <p className="text-sm text-slate-500 mb-4">
                    {search ? "No SmartLinks match your search." : "Create your first SmartLink to get started."}
                  </p>
                  {!search && canWriteSmartlinks(effectiveRole, user) && (
                    <Button className="bg-[#00B4B4] hover:bg-[#009999]" onClick={() => setSmartLinkModalOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create SmartLink
                    </Button>
                  )}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50 dark:bg-muted border-b border-slate-200 dark:border-border">
                      <tr>
                        <th className="w-8 px-4 py-3">
                          <input type="checkbox" className="rounded" />
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Name</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Production Company</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Access</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Status</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Views</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Revenue</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Tags</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Wallet</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Expiry</th>
                        <th className="px-4 py-3"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-border">
                      {smartLinks.map((link) => (
                        <tr key={link.id} className="hover:bg-slate-50 dark:hover:bg-muted/50">
                          <td className="px-4 py-3">
                            <input type="checkbox" className="rounded" />
                          </td>
                          <td className="px-4 py-3">
                            <div>
                              <p className="font-medium text-slate-900 dark:text-foreground">
                                {link.name || "Untitled"}
                              </p>
                              <Link
                                href={link.slug ? getSmartLinkUrl({ slug: link.slug }) : "#"}
                                target="_blank"
                                className="text-xs text-[#00B4B4] hover:underline flex items-center gap-1"
                              >
                                <LinkIcon className="h-3 w-3" />
                                /{link.slug || "---"}
                              </Link>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-slate-600 dark:text-muted-foreground">
                            {link.mediaTitle || "—"}
                          </td>
                          <td className="px-4 py-3">
                            {getAccessBadge(link.access)}
                          </td>
                          <td className="px-4 py-3">
                            {getStatusBadge(link.status)}
                          </td>
                          <td className="px-4 py-3 text-sm text-slate-600 dark:text-muted-foreground">
                            {formatNumber(link.totalViews || 0)}
                          </td>
                          <td className="px-4 py-3 text-sm text-slate-600 dark:text-muted-foreground">
                            ${formatNumber(link.price ? link.price * (link.totalViews || 0) * 0.01 : 0)}
                          </td>
                          <td className="px-4 py-3">
                            {link.tags && link.tags.length > 0 ? (
                              <div className="flex gap-1">
                                {link.tags.slice(0, 2).map((tag, idx) => (
                                  <Badge key={idx} variant="outline" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            ) : (
                              <span className="text-slate-400">—</span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <Switch checked={link.access === SmartLinkAccess.PAYWALL} />
                          </td>
                          <td className="px-4 py-3 text-sm text-slate-600 dark:text-muted-foreground">
                            {link.expiresAt ? moment(link.expiresAt).format("DD/MM") : "Never"}
                          </td>
                          <td className="px-4 py-3">
                            {(canUpdateSmartlinks(effectiveRole, user) || canDeleteSmartlinks(effectiveRole, user)) && (
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem
                                    onClick={() => copyToClipboard(link.slug ? getSmartLinkUrl({ slug: link.slug }) : "")}
                                  >
                                    <Copy className="h-4 w-4 mr-2" />
                                    Copy Link
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => window.open(link.slug ? getSmartLinkUrl({ slug: link.slug }) : "", "_blank")}
                                  >
                                    <ExternalLink className="h-4 w-4 mr-2" />
                                    Open Link
                                  </DropdownMenuItem>
                                  {canUpdateSmartlinks(effectiveRole, user) && (
                                    <DropdownMenuItem onClick={() => router.push(`/dashboard/smartlinks/${link.id}/edit`)}>
                                      Edit
                                    </DropdownMenuItem>
                                  )}
                                  {canDeleteSmartlinks(effectiveRole, user) && (
                                    <DropdownMenuItem variant="destructive" onClick={() => handleDeleteClick(link)}>
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
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <SmartLinkModal isOpen={smartLinkModalOpen} onClose={() => setSmartLinkModalOpen(false)} />
      <AlertModal
        isOpen={deleteModalOpen}
        title="Delete SmartLink"
        message={`Are you sure you want to delete "${linkToDelete?.name || "this smartlink"}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        danger={true}
      />
    </div>
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
