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
  User,
  MapPin,
  Download,
  Upload,
  Star,
  ShoppingBag,
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

// Mock data for D2C contacts
const mockD2CContacts = [
  {
    id: "1",
    name: "Alex Johnson",
    email: "alex.j@gmail.com",
    title: "Film Enthusiast",
    location: "Chicago, IL",
    category: "Premium",
    tags: ["Action", "Thriller"],
    revenue: 299,
    lastActivity: "Jan 14, 2024",
    status: "Active",
  },
  {
    id: "2",
    name: "Maria Garcia",
    email: "maria.garcia@yahoo.com",
    title: "Content Creator",
    location: "Miami, FL",
    category: "Premium",
    tags: ["Documentary", "Drama"],
    revenue: 449,
    lastActivity: "Jan 13, 2024",
    status: "Active",
  },
  {
    id: "3",
    name: "David Kim",
    email: "dkim@outlook.com",
    title: "Blogger",
    location: "Seattle, WA",
    category: "Subscriber",
    tags: ["Series", "Comedy"],
    revenue: 99,
    lastActivity: "Jan 11, 2024",
    status: "Inactive",
  },
  {
    id: "4",
    name: "Jennifer Brown",
    email: "jen.brown@gmail.com",
    title: "Cinephile",
    location: "Denver, CO",
    category: "Premium",
    tags: ["Indie", "Foreign"],
    revenue: 599,
    lastActivity: "Jan 17, 2024",
    status: "Active",
  },
  {
    id: "5",
    name: "Chris Wilson",
    email: "cwilson@icloud.com",
    title: "Film Student",
    location: "Boston, MA",
    category: "Subscriber",
    tags: ["Documentary", "Classic"],
    revenue: 149,
    lastActivity: "Jan 9, 2024",
    status: "Active",
  },
  {
    id: "6",
    name: "Emma Davis",
    email: "emma.d@hotmail.com",
    title: "Movie Reviewer",
    location: "Portland, OR",
    category: "Premium",
    tags: ["Horror", "Sci-Fi"],
    revenue: 349,
    lastActivity: "Jan 15, 2024",
    status: "Active",
  },
  {
    id: "7",
    name: "Ryan Lee",
    email: "ryanlee@gmail.com",
    title: "Casual Viewer",
    location: "Phoenix, AZ",
    category: "Subscriber",
    tags: ["Comedy", "Action"],
    revenue: 79,
    lastActivity: "Jan 6, 2024",
    status: "Pending",
  },
  {
    id: "8",
    name: "Sophie Turner",
    email: "sophie.t@yahoo.com",
    title: "Binge Watcher",
    location: "Nashville, TN",
    category: "Premium",
    tags: ["Series", "Drama"],
    revenue: 499,
    lastActivity: "Jan 18, 2024",
    status: "Active",
  },
];

const D2CCRMContent = () => {
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
    access: SmartLinkAccess.PUBLIC,
    q: debouncedSearch || undefined,
  });

  // Filter contacts based on search, category, and status
  const filteredContacts = mockD2CContacts.filter((contact) => {
    const matchesSearch = !debouncedSearch ||
      contact.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      contact.email.toLowerCase().includes(debouncedSearch.toLowerCase());
    const matchesCategory = categoryFilter === "all" || contact.category === categoryFilter;
    const matchesStatus = statusFilter === "all" || contact.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const analyticsCards = [
    {
      title: "Total D2C Contacts",
      value: analytics?.totalContacts || 1247,
      icon: Users,
      change: "+18%",
    },
    {
      title: "Premium Members",
      value: analytics?.premiumContacts || 342,
      icon: Star,
      change: "+24%",
    },
    {
      title: "Content Views",
      value: formatNumber(analytics?.totalClicks || 15847),
      icon: Eye,
      change: "+32%",
    },
    {
      title: "Total Revenue",
      value: `$${formatNumber(analytics?.totalRevenue || 48250)}`,
      icon: DollarSign,
      change: "+28%",
      highlight: true,
    },
  ];

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Premium":
        return Star;
      case "Subscriber":
        return ShoppingBag;
      default:
        return User;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Premium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300";
      case "Subscriber":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
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
      const filename = `crm-d2c-export-${new Date().toISOString().split("T")[0]}.csv`;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }, 100);
      toast.success("D2C contacts exported successfully");
    } catch (error: any) {
      console.error("Error exporting contacts:", error);
      toast.error(error?.response?.data?.message || "Failed to export contacts");
    } finally {
      setIsExporting(false);
    }
  };

  const categories = ["Premium", "Subscriber"];

  return (
    <div className="space-y-6">
      <PageTitle
        title="D2C CRM"
        description="Manage your direct-to-consumer relationships and individual subscribers."
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
                    Membership
                  </th>
                  <th className="py-4 px-6 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Interests
                  </th>
                  <th className="py-4 px-6 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Lifetime Value
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

const D2CCRM = () => {
  return (
    <RoleGuard requiredPermission={["crm:read", "crm:*"]}>
      <D2CCRMContent />
    </RoleGuard>
  );
};

export default D2CCRM;
