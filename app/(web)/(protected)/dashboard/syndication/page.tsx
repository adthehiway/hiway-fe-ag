"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import PageTitle from "@/components/dashboard/layout/PageTitle";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { QuickStatsGrid } from "@/components/dashboard/flux/KPICard";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Search,
  Filter,
  MoreHorizontal,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  FileText,
  Calendar,
  DollarSign,
  Globe,
  Building2,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  Trash2,
  Edit,
  Eye,
  Plus,
  ArrowUpDown,
  Send,
  FileStack,
} from "lucide-react";
import { cn } from "@/lib/utils";

type ContractStatus = "active" | "awaiting_approval" | "rejected" | "expired" | "terminated";

interface Contract {
  id: string;
  title: string;
  partner: string;
  partnerLogo?: string;
  status: ContractStatus;
  startDate: string;
  endDate: string;
  revenueShare: number;
  territories: string[];
  contentType: string;
  totalRevenue: number;
  lastActivity: string;
}

// Mock data
const mockContracts: Contract[] = [
  {
    id: "CNT-001",
    title: "The Midnight Chronicles",
    partner: "Netflix",
    status: "active",
    startDate: "2024-01-15",
    endDate: "2025-01-15",
    revenueShare: 70,
    territories: ["US", "CA", "UK", "AU"],
    contentType: "Feature Film",
    totalRevenue: 125000,
    lastActivity: "2025-01-20",
  },
  {
    id: "CNT-002",
    title: "Ocean Depths Documentary",
    partner: "Amazon Prime",
    status: "awaiting_approval",
    startDate: "2024-06-01",
    endDate: "2025-06-01",
    revenueShare: 65,
    territories: ["Worldwide"],
    contentType: "Documentary",
    totalRevenue: 0,
    lastActivity: "2025-01-18",
  },
  {
    id: "CNT-003",
    title: "Indie Shorts Collection",
    partner: "Mubi",
    status: "active",
    startDate: "2024-03-01",
    endDate: "2025-03-01",
    revenueShare: 75,
    territories: ["EU", "UK"],
    contentType: "Short Film",
    totalRevenue: 45000,
    lastActivity: "2025-01-15",
  },
  {
    id: "CNT-004",
    title: "Festival Highlights 2024",
    partner: "Vimeo OTT",
    status: "expired",
    startDate: "2023-06-01",
    endDate: "2024-06-01",
    revenueShare: 60,
    territories: ["US"],
    contentType: "Compilation",
    totalRevenue: 28000,
    lastActivity: "2024-06-01",
  },
  {
    id: "CNT-005",
    title: "Behind the Lens Series",
    partner: "Apple TV+",
    status: "rejected",
    startDate: "2024-09-01",
    endDate: "2025-09-01",
    revenueShare: 72,
    territories: ["Worldwide"],
    contentType: "Documentary Series",
    totalRevenue: 0,
    lastActivity: "2024-08-15",
  },
  {
    id: "CNT-006",
    title: "Urban Stories Anthology",
    partner: "Hulu",
    status: "active",
    startDate: "2024-02-01",
    endDate: "2025-02-01",
    revenueShare: 68,
    territories: ["US"],
    contentType: "Anthology Series",
    totalRevenue: 89000,
    lastActivity: "2025-01-22",
  },
  {
    id: "CNT-007",
    title: "Classic Cinema Restored",
    partner: "Criterion Channel",
    status: "awaiting_approval",
    startDate: "2025-01-01",
    endDate: "2026-01-01",
    revenueShare: 80,
    territories: ["US", "CA"],
    contentType: "Feature Film",
    totalRevenue: 0,
    lastActivity: "2024-12-20",
  },
  {
    id: "CNT-008",
    title: "Sports Highlights 2024",
    partner: "ESPN+",
    status: "terminated",
    startDate: "2024-01-01",
    endDate: "2024-12-31",
    revenueShare: 55,
    territories: ["US"],
    contentType: "Sports",
    totalRevenue: 156000,
    lastActivity: "2024-11-30",
  },
];

const statusConfig = {
  active: { bg: "bg-green-500/20", text: "text-green-600 dark:text-green-400", icon: CheckCircle, label: "Active" },
  awaiting_approval: { bg: "bg-yellow-500/20", text: "text-yellow-600 dark:text-yellow-400", icon: Clock, label: "Awaiting Approval" },
  rejected: { bg: "bg-red-500/20", text: "text-red-600 dark:text-red-400", icon: XCircle, label: "Rejected" },
  expired: { bg: "bg-gray-500/20", text: "text-gray-600 dark:text-gray-400", icon: AlertCircle, label: "Expired" },
  terminated: { bg: "bg-red-500/20", text: "text-red-600 dark:text-red-400", icon: XCircle, label: "Terminated" },
};

function ContractStatusBadge({ status }: { status: ContractStatus }) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <Badge className={cn("flex items-center gap-1 font-medium", config.bg, config.text)}>
      <Icon className="h-3 w-3" />
      {config.label}
    </Badge>
  );
}

export default function SyndicationPage() {
  const [contracts] = useState<Contract[]>(mockContracts);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<ContractStatus | "all">("all");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<keyof Contract | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Calculate stats
  const stats = useMemo(() => ({
    total: contracts.length,
    active: contracts.filter(c => c.status === "active").length,
    pending: contracts.filter(c => c.status === "awaiting_approval").length,
    totalRevenue: contracts.reduce((sum, c) => sum + c.totalRevenue, 0),
  }), [contracts]);

  // Filter and sort contracts
  const filteredContracts = useMemo(() => {
    let result = [...contracts];

    // Status filter
    if (statusFilter !== "all") {
      result = result.filter(c => c.status === statusFilter);
    }

    // Search filter
    if (search) {
      const searchLower = search.toLowerCase();
      result = result.filter(c =>
        c.title.toLowerCase().includes(searchLower) ||
        c.partner.toLowerCase().includes(searchLower) ||
        c.id.toLowerCase().includes(searchLower)
      );
    }

    // Sorting
    if (sortBy) {
      result.sort((a, b) => {
        const aVal = a[sortBy];
        const bVal = b[sortBy];
        const comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
        return sortOrder === "asc" ? comparison : -comparison;
      });
    }

    return result;
  }, [contracts, statusFilter, search, sortBy, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(filteredContracts.length / itemsPerPage);
  const paginatedContracts = filteredContracts.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  const handleSort = (column: keyof Contract) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("asc");
    }
  };

  const handleSelectAll = () => {
    if (selectedIds.length === paginatedContracts.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(paginatedContracts.map(c => c.id));
    }
  };

  const handleSelectOne = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const viewContract = (contract: Contract) => {
    setSelectedContract(contract);
    setIsDetailOpen(true);
  };

  return (
    <div className="space-y-6">
      <PageTitle
        title="Syndication"
        description="Manage your content distribution contracts and partnerships"
        content={
          <div className="flex gap-2">
            <Link href="/dashboard/syndication/templates">
              <Button variant="outline">
                <FileStack className="h-4 w-4 mr-2" />
                Templates
              </Button>
            </Link>
            <Link href="/dashboard/syndication/invite">
              <Button variant="outline">
                <Send className="h-4 w-4 mr-2" />
                Invite
              </Button>
            </Link>
            <Link href="/dashboard/syndication/create">
              <Button className="bg-[#00B4B4] hover:bg-[#009999]">
                <Plus className="h-4 w-4 mr-2" />
                New Contract
              </Button>
            </Link>
          </div>
        }
      />

      {/* Quick Stats */}
      <QuickStatsGrid
        stats={[
          { title: "Total Contracts", value: stats.total, icon: FileText },
          { title: "Active Contracts", value: stats.active, icon: CheckCircle, iconColor: "text-green-600" },
          { title: "Pending Approval", value: stats.pending, icon: Clock, iconColor: "text-yellow-600" },
          { title: "Total Revenue", value: `$${stats.totalRevenue.toLocaleString()}`, icon: DollarSign, iconColor: "text-[#00B4B4]" },
        ]}
      />

      {/* Contracts Table */}
      <Card>
        {/* Filters Bar */}
        <div className="p-4 border-b border-slate-100 dark:border-border flex flex-wrap items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search contracts..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                Status: {statusFilter === "all" ? "All" : statusConfig[statusFilter].label}
                <ChevronDown className="h-4 w-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setStatusFilter("all")}>All</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setStatusFilter("active")}>Active</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("awaiting_approval")}>Awaiting Approval</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("rejected")}>Rejected</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("expired")}>Expired</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("terminated")}>Terminated</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {selectedIds.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="default" className="bg-[#00B4B4] hover:bg-[#009999]">
                  Bulk Actions ({selectedIds.length})
                  <ChevronDown className="h-4 w-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>Set Active</DropdownMenuItem>
                <DropdownMenuItem>Set Pending</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-600">Terminate</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 dark:bg-muted">
              <tr>
                <th className="w-12 p-4">
                  <Checkbox
                    checked={selectedIds.length === paginatedContracts.length && paginatedContracts.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                </th>
                <th className="text-left p-4 text-sm font-semibold text-slate-600 dark:text-muted-foreground">
                  <button
                    onClick={() => handleSort("title")}
                    className="flex items-center gap-1 hover:text-slate-900 dark:hover:text-foreground"
                  >
                    Title <ArrowUpDown className="h-3.5 w-3.5" />
                  </button>
                </th>
                <th className="text-left p-4 text-sm font-semibold text-slate-600 dark:text-muted-foreground">
                  <button
                    onClick={() => handleSort("partner")}
                    className="flex items-center gap-1 hover:text-slate-900 dark:hover:text-foreground"
                  >
                    Partner <ArrowUpDown className="h-3.5 w-3.5" />
                  </button>
                </th>
                <th className="text-left p-4 text-sm font-semibold text-slate-600 dark:text-muted-foreground">
                  Status
                </th>
                <th className="text-left p-4 text-sm font-semibold text-slate-600 dark:text-muted-foreground">
                  <button
                    onClick={() => handleSort("endDate")}
                    className="flex items-center gap-1 hover:text-slate-900 dark:hover:text-foreground"
                  >
                    End Date <ArrowUpDown className="h-3.5 w-3.5" />
                  </button>
                </th>
                <th className="text-left p-4 text-sm font-semibold text-slate-600 dark:text-muted-foreground">
                  <button
                    onClick={() => handleSort("revenueShare")}
                    className="flex items-center gap-1 hover:text-slate-900 dark:hover:text-foreground"
                  >
                    Rev % <ArrowUpDown className="h-3.5 w-3.5" />
                  </button>
                </th>
                <th className="text-left p-4 text-sm font-semibold text-slate-600 dark:text-muted-foreground">
                  Revenue
                </th>
                <th className="w-12 p-4"></th>
              </tr>
            </thead>
            <tbody>
              {paginatedContracts.map((contract) => (
                <tr
                  key={contract.id}
                  className="border-t border-slate-100 dark:border-border hover:bg-slate-50/50 dark:hover:bg-muted/50"
                >
                  <td className="p-4">
                    <Checkbox
                      checked={selectedIds.includes(contract.id)}
                      onCheckedChange={() => handleSelectOne(contract.id)}
                    />
                  </td>
                  <td className="p-4">
                    <div>
                      <div className="font-medium text-slate-900 dark:text-foreground">
                        {contract.title}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-muted-foreground">
                        {contract.id}
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-lg bg-slate-100 dark:bg-muted flex items-center justify-center">
                        <Building2 className="h-4 w-4 text-slate-500" />
                      </div>
                      <span className="text-slate-700 dark:text-foreground">{contract.partner}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <ContractStatusBadge status={contract.status} />
                  </td>
                  <td className="p-4 text-slate-600 dark:text-muted-foreground">
                    {contract.endDate}
                  </td>
                  <td className="p-4 text-slate-600 dark:text-muted-foreground">
                    {contract.revenueShare}%
                  </td>
                  <td className="p-4 font-medium text-[#00B4B4]">
                    ${contract.totalRevenue.toLocaleString()}
                  </td>
                  <td className="p-4">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => viewContract(contract)}>
                          <Eye className="h-4 w-4 mr-2" /> View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="h-4 w-4 mr-2" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <ExternalLink className="h-4 w-4 mr-2" /> View Partner
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600">
                          <Trash2 className="h-4 w-4 mr-2" /> Terminate
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-slate-100 dark:border-border flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-muted-foreground">
            <span>Showing {((page - 1) * itemsPerPage) + 1}-{Math.min(page * itemsPerPage, filteredContracts.length)} of {filteredContracts.length}</span>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setPage(1);
              }}
              className="px-2 py-1 border border-slate-200 dark:border-border rounded-lg bg-white dark:bg-muted text-sm"
            >
              <option value={10}>10 per page</option>
              <option value={20}>20 per page</option>
              <option value={50}>50 per page</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm text-slate-600 dark:text-muted-foreground">
              Page {page} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>

      {/* Contract Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedContract?.title}</DialogTitle>
            <DialogDescription>Contract ID: {selectedContract?.id}</DialogDescription>
          </DialogHeader>
          {selectedContract && (
            <div className="grid grid-cols-2 gap-6 py-4">
              <div>
                <label className="text-sm font-medium text-slate-500 dark:text-muted-foreground">Partner</label>
                <p className="text-slate-900 dark:text-foreground font-medium">{selectedContract.partner}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-500 dark:text-muted-foreground">Status</label>
                <div className="mt-1">
                  <ContractStatusBadge status={selectedContract.status} />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-500 dark:text-muted-foreground">Revenue Share</label>
                <p className="text-slate-900 dark:text-foreground font-medium">{selectedContract.revenueShare}%</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-500 dark:text-muted-foreground">Total Revenue</label>
                <p className="text-[#00B4B4] font-bold">${selectedContract.totalRevenue.toLocaleString()}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-500 dark:text-muted-foreground">Start Date</label>
                <p className="text-slate-900 dark:text-foreground">{selectedContract.startDate}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-500 dark:text-muted-foreground">End Date</label>
                <p className="text-slate-900 dark:text-foreground">{selectedContract.endDate}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-500 dark:text-muted-foreground">Content Type</label>
                <p className="text-slate-900 dark:text-foreground">{selectedContract.contentType}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-500 dark:text-muted-foreground">Territories</label>
                <div className="flex flex-wrap gap-1 mt-1">
                  {selectedContract.territories.map(t => (
                    <Badge key={t} variant="secondary">{t}</Badge>
                  ))}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailOpen(false)}>
              Close
            </Button>
            <Button>Edit Contract</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
