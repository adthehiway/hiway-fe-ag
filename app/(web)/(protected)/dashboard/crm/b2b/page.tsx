"use client";

import { RoleGuard } from "@/components/dashboard/common/RoleGuard";
import PageTitle from "@/components/dashboard/layout/PageTitle";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Users,
  Handshake,
  Eye,
  DollarSign,
  Search,
  Plus,
  MoreHorizontal,
  Building2,
  User,
  MapPin,
  Download,
  Upload,
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

// Mock data for B2B contacts
const mockB2BContacts = [
  {
    id: "1",
    name: "Sarah Chen",
    email: "sarah.chen@techcorp.com",
    title: "VP of Content",
    company: "TechCorp Media",
    location: "San Francisco, CA",
    category: "Enterprise",
    tags: ["Film", "Documentary"],
    revenue: 12500,
    lastActivity: "Jan 15, 2024",
    status: "Active",
  },
  {
    id: "2",
    name: "Michael Rodriguez",
    email: "m.rodriguez@mediahub.io",
    title: "Content Director",
    company: "MediaHub",
    location: "New York, NY",
    category: "Agency",
    tags: ["Series", "Drama"],
    revenue: 8750,
    lastActivity: "Jan 12, 2024",
    status: "Active",
  },
  {
    id: "3",
    name: "Emily Watson",
    email: "emily.w@streamnet.com",
    title: "Acquisitions Manager",
    company: "StreamNet",
    location: "Los Angeles, CA",
    category: "Distributor",
    tags: ["Film", "Comedy"],
    revenue: 15200,
    lastActivity: "Jan 10, 2024",
    status: "Active",
  },
  {
    id: "4",
    name: "James Park",
    email: "jpark@globalent.com",
    title: "Head of Licensing",
    company: "Global Entertainment",
    location: "London, UK",
    category: "Enterprise",
    tags: ["Documentary", "Series"],
    revenue: 22000,
    lastActivity: "Jan 8, 2024",
    status: "Pending",
  },
  {
    id: "5",
    name: "Lisa Thompson",
    email: "lisa.t@indiefilms.co",
    title: "Producer",
    company: "Indie Films Co",
    location: "Austin, TX",
    category: "Production",
    tags: ["Film", "Indie"],
    revenue: 5600,
    lastActivity: "Jan 5, 2024",
    status: "Active",
  },
  {
    id: "6",
    name: "Robert Martinez",
    email: "r.martinez@studiox.com",
    title: "VP Acquisitions",
    company: "Studio X",
    location: "Los Angeles, CA",
    category: "Enterprise",
    tags: ["Film", "Action"],
    revenue: 45000,
    lastActivity: "Jan 18, 2024",
    status: "Active",
  },
  {
    id: "7",
    name: "Amanda Foster",
    email: "amanda.f@netstream.io",
    title: "Content Manager",
    company: "NetStream",
    location: "Seattle, WA",
    category: "Distributor",
    tags: ["Series", "Documentary"],
    revenue: 18500,
    lastActivity: "Jan 16, 2024",
    status: "Active",
  },
];

const B2BCRMContent = () => {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isExporting, setIsExporting] = useState(false);

  const debouncedSearch = useDebounce(search, 500);

  const { data: user } = useUser();
  const {
    data: analytics,
    isLoading: analyticsLoading,
    error: analyticsError,
  } = useCRMAnalytics();

  const {
    data: contactsData,
    isLoading: contactsLoading,
    error: contactsError,
  } = useCRMContacts({
    id: user?.company?.id || "",
    perPage: 50,
    access: SmartLinkAccess.PRIVATE,
    q: debouncedSearch || undefined,
  });

  // Filter contacts based on search, category, and status
  const filteredContacts = mockB2BContacts.filter((contact) => {
    const matchesSearch = !debouncedSearch ||
      contact.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      contact.email.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      contact.company.toLowerCase().includes(debouncedSearch.toLowerCase());
    const matchesCategory = categoryFilter === "all" || contact.category === categoryFilter;
    const matchesStatus = statusFilter === "all" || contact.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const analyticsCards = [
    {
      title: "Total B2B Contacts",
      value: analytics?.totalContacts || 89,
      icon: Users,
      change: "+15%",
    },
    {
      title: "Active Relationships",
      value: analytics?.premiumContacts || 62,
      icon: Handshake,
      change: "+12%",
    },
    {
      title: "Links Watched",
      value: formatNumber(analytics?.totalClicks || 847),
      icon: Eye,
      change: "+28%",
    },
    {
      title: "Total Revenue",
      value: `$${formatNumber(analytics?.totalRevenue || 127550)}`,
      icon: DollarSign,
      change: "+22%",
      highlight: true,
    },
  ];

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Enterprise":
      case "Agency":
      case "Distributor":
      case "Production":
        return Building2;
      default:
        return User;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Enterprise":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300";
      case "Agency":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
      case "Distributor":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
      case "Production":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-[#00B4B4] text-white";
      case "Pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300";
      case "Inactive":
        return "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const handleExport = async () => {
    try {
      setIsExporting(true);
      const blob = await CRMService.exportContacts();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const filename = `crm-b2b-export-${new Date().toISOString().split("T")[0]}.csv`;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }, 100);
      toast.success("B2B contacts exported successfully");
    } catch (error: any) {
      console.error("Error exporting contacts:", error);
      toast.error(error?.response?.data?.message || "Failed to export contacts");
    } finally {
      setIsExporting(false);
    }
  };

  const categories = ["Enterprise", "Agency", "Distributor", "Production"];

  return (
    <div className="space-y-6">
      <PageTitle
        title="B2B CRM"
        description="Manage your business-to-business relationships and enterprise clients."
      />

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {analyticsLoading ? (
          Array.from({ length: 4 }).map((_, index) => (
            <Card key={index} className="p-6">
              <Skeleton className="h-4 w-24 mb-3" />
              <Skeleton className="h-8 w-20 mb-2" />
              <Skeleton className="h-3 w-16" />
            </Card>
          ))
        ) : analyticsError ? (
          <div className="col-span-full text-center py-8">
            <p className="text-muted-foreground">Failed to load analytics data</p>
          </div>
        ) : (
          analyticsCards.map((item, index) => (
            <Card
              key={index}
              className={`p-6 ${item.highlight ? "bg-[#00B4B4] text-white" : ""}`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className={`text-sm font-medium ${item.highlight ? "text-white/90" : "text-muted-foreground"}`}>
                  {item.title}
                </span>
                <item.icon className={`h-5 w-5 ${item.highlight ? "text-white/80" : "text-[#00B4B4]"}`} />
              </div>
              <div className={`text-3xl font-bold ${item.highlight ? "text-white" : "text-foreground"}`}>
                {item.value}
              </div>
              <p className={`text-sm mt-1 ${item.highlight ? "text-white/80" : "text-green-600"}`}>
                {item.change} from last month
              </p>
            </Card>
          ))
        )}
      </div>

      {/* Filters and Actions */}
      <div className="flex flex-col md:flex-row md:items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search contacts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-background"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="Active">Active</SelectItem>
            <SelectItem value="Pending">Pending</SelectItem>
            <SelectItem value="Inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex-1" />
        <Button
          variant="outline"
          className="gap-2"
        >
          <Upload className="h-4 w-4" />
          Import
        </Button>
        <Button
          variant="outline"
          className="gap-2"
          onClick={handleExport}
          disabled={isExporting}
        >
          <Download className="h-4 w-4" />
          {isExporting ? "Exporting..." : "Export"}
        </Button>
        <Button className="gap-2 bg-[#00B4B4] hover:bg-[#00B4B4]/90 text-white">
          <Plus className="h-4 w-4" />
          Add Contact
        </Button>
      </div>

      {/* Contacts Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/30">
                  <th className="py-4 px-6 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="py-4 px-6 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Category
                  </th>
                  <th className="py-4 px-6 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Tags
                  </th>
                  <th className="py-4 px-6 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Revenue
                  </th>
                  <th className="py-4 px-6 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Status
                  </th>
                  <th className="py-4 px-6 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {contactsLoading ? (
                  Array.from({ length: 5 }).map((_, index) => (
                    <tr key={index}>
                      <td className="py-4 px-6">
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-3 w-48" />
                          <Skeleton className="h-3 w-24" />
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <Skeleton className="h-6 w-20 rounded-full" />
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex gap-1">
                          <Skeleton className="h-6 w-16 rounded-full" />
                          <Skeleton className="h-6 w-20 rounded-full" />
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <Skeleton className="h-4 w-16" />
                      </td>
                      <td className="py-4 px-6">
                        <Skeleton className="h-6 w-16 rounded-full" />
                      </td>
                      <td className="py-4 px-6">
                        <Skeleton className="h-8 w-8 rounded ml-auto" />
                      </td>
                    </tr>
                  ))
                ) : filteredContacts.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center">
                      <p className="text-muted-foreground">No contacts found</p>
                    </td>
                  </tr>
                ) : (
                  filteredContacts.map((contact) => {
                    const CategoryIcon = getCategoryIcon(contact.category);
                    return (
                      <tr key={contact.id} className="hover:bg-muted/30 transition-colors">
                        <td className="py-4 px-6">
                          <div>
                            <div className="font-medium text-foreground">{contact.name}</div>
                            <div className="text-sm text-muted-foreground">{contact.email}</div>
                            <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                              {contact.title && (
                                <span className="flex items-center gap-1">
                                  <User className="h-3 w-3" />
                                  {contact.title}
                                </span>
                              )}
                              {contact.company && (
                                <span className="flex items-center gap-1">
                                  <Building2 className="h-3 w-3" />
                                  {contact.company}
                                </span>
                              )}
                              {contact.location && (
                                <span className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  {contact.location}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <Badge
                            variant="secondary"
                            className={`gap-1 ${getCategoryColor(contact.category)}`}
                          >
                            <CategoryIcon className="h-3 w-3" />
                            {contact.category}
                          </Badge>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex flex-wrap gap-1">
                            {contact.tags.map((tag) => (
                              <Badge
                                key={tag}
                                variant="outline"
                                className="border-[#00B4B4] text-[#00B4B4] bg-transparent"
                              >
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div>
                            <div className="font-semibold text-foreground">
                              ${contact.revenue.toLocaleString()}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {contact.lastActivity}
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <Badge className={getStatusColor(contact.status)}>
                            {contact.status}
                          </Badge>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem asChild>
                                <Link href={`/dashboard/crm/contacts/${contact.id}`}>
                                  View Details
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem>Edit Contact</DropdownMenuItem>
                              <DropdownMenuItem>Send Email</DropdownMenuItem>
                              <DropdownMenuItem className="text-red-600">
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const B2BCRM = () => {
  return (
    <RoleGuard requiredPermission={["crm:read", "crm:*"]}>
      <B2BCRMContent />
    </RoleGuard>
  );
};

export default B2BCRM;
