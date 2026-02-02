"use client";

import { useState } from "react";
import Link from "next/link";
import PageTitle from "@/components/dashboard/layout/PageTitle";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Video,
  Search,
  ArrowLeft,
  ArrowUpDown,
  Eye,
  Clock,
  Users,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface PastStream {
  id: string;
  title: string;
  date: string;
  viewers: number;
  peakViewers: number;
  duration: string;
  vodAvailable: boolean;
  thumbnail?: string;
}

const pastStreams: PastStream[] = [
  {
    id: "1",
    title: "Ocean Depths Premiere",
    date: "Jan 15, 2025",
    viewers: 1234,
    peakViewers: 1567,
    duration: "2:15:34",
    vodAvailable: true,
  },
  {
    id: "2",
    title: "Cast Interview Live",
    date: "Jan 10, 2025",
    viewers: 876,
    peakViewers: 1023,
    duration: "1:05:22",
    vodAvailable: true,
  },
  {
    id: "3",
    title: "Film Festival Coverage",
    date: "Jan 5, 2025",
    viewers: 2345,
    peakViewers: 3120,
    duration: "3:42:18",
    vodAvailable: false,
  },
  {
    id: "4",
    title: "Director's Commentary Stream",
    date: "Dec 28, 2024",
    viewers: 567,
    peakViewers: 789,
    duration: "1:30:00",
    vodAvailable: true,
  },
  {
    id: "5",
    title: "New Year's Eve Special",
    date: "Dec 31, 2024",
    viewers: 4521,
    peakViewers: 5678,
    duration: "4:00:00",
    vodAvailable: true,
  },
  {
    id: "6",
    title: "Behind the Scenes: Making Of",
    date: "Dec 20, 2024",
    viewers: 892,
    peakViewers: 1100,
    duration: "0:45:12",
    vodAvailable: false,
  },
  {
    id: "7",
    title: "Q&A with Cast",
    date: "Dec 15, 2024",
    viewers: 1567,
    peakViewers: 2000,
    duration: "1:15:30",
    vodAvailable: true,
  },
  {
    id: "8",
    title: "Exclusive Sneak Peek",
    date: "Dec 10, 2024",
    viewers: 3210,
    peakViewers: 4000,
    duration: "0:30:00",
    vodAvailable: true,
  },
];

type SortField = "date" | "viewers" | "duration";
type SortDirection = "asc" | "desc";

export default function StreamHistoryPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<SortField>("date");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const filteredStreams = pastStreams.filter((stream) =>
    stream.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedStreams = [...filteredStreams].sort((a, b) => {
    let comparison = 0;
    switch (sortField) {
      case "date":
        comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
        break;
      case "viewers":
        comparison = a.viewers - b.viewers;
        break;
      case "duration":
        const durationToSeconds = (d: string) => {
          const parts = d.split(":").map(Number);
          return parts[0] * 3600 + parts[1] * 60 + parts[2];
        };
        comparison = durationToSeconds(a.duration) - durationToSeconds(b.duration);
        break;
    }
    return sortDirection === "asc" ? comparison : -comparison;
  });

  const totalPages = Math.ceil(sortedStreams.length / itemsPerPage);
  const paginatedStreams = sortedStreams.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  return (
    <div className="space-y-6">
      <PageTitle
        title="Stream History"
        description="View and manage your past live streams"
        content={
          <Link href="/dashboard/live-stream">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
        }
      />

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search streams..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select
              value={`${sortField}-${sortDirection}`}
              onValueChange={(value) => {
                const [field, direction] = value.split("-") as [SortField, SortDirection];
                setSortField(field);
                setSortDirection(direction);
              }}
            >
              <SelectTrigger className="w-[200px]">
                <ArrowUpDown className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Sort by..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date-desc">Date (Newest)</SelectItem>
                <SelectItem value="date-asc">Date (Oldest)</SelectItem>
                <SelectItem value="viewers-desc">Viewers (High to Low)</SelectItem>
                <SelectItem value="viewers-asc">Viewers (Low to High)</SelectItem>
                <SelectItem value="duration-desc">Duration (Longest)</SelectItem>
                <SelectItem value="duration-asc">Duration (Shortest)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Streams Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 dark:bg-muted border-b border-slate-200 dark:border-border">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Stream Name
                  </th>
                  <th
                    className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider cursor-pointer hover:text-slate-700"
                    onClick={() => handleSort("date")}
                  >
                    <div className="flex items-center gap-1">
                      Date
                      <ArrowUpDown className="h-3 w-3" />
                    </div>
                  </th>
                  <th
                    className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider cursor-pointer hover:text-slate-700"
                    onClick={() => handleSort("viewers")}
                  >
                    <div className="flex items-center gap-1">
                      Viewers
                      <ArrowUpDown className="h-3 w-3" />
                    </div>
                  </th>
                  <th
                    className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider cursor-pointer hover:text-slate-700"
                    onClick={() => handleSort("duration")}
                  >
                    <div className="flex items-center gap-1">
                      Duration
                      <ArrowUpDown className="h-3 w-3" />
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    VOD Status
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-border">
                {paginatedStreams.map((stream) => (
                  <tr
                    key={stream.id}
                    className="hover:bg-slate-50 dark:hover:bg-muted/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-slate-100 dark:bg-muted flex items-center justify-center">
                          <Video className="h-5 w-5 text-slate-500" />
                        </div>
                        <span className="font-medium text-slate-900 dark:text-foreground">
                          {stream.title}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-muted-foreground">
                      {stream.date}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 text-slate-600 dark:text-muted-foreground">
                        <Users className="h-4 w-4" />
                        {stream.viewers.toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 text-slate-600 dark:text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        {stream.duration}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge
                        className={cn(
                          stream.vodAvailable
                            ? "bg-green-500/20 text-green-600 dark:text-green-400"
                            : "bg-slate-500/20 text-slate-600 dark:text-slate-400"
                        )}
                      >
                        {stream.vodAvailable ? "VOD Available" : "No VOD"}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 dark:border-border">
              <p className="text-sm text-slate-500">
                Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                {Math.min(currentPage * itemsPerPage, sortedStreams.length)} of{" "}
                {sortedStreams.length} streams
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(page)}
                    className={cn(
                      currentPage === page && "bg-[#00B4B4] hover:bg-[#009999]"
                    )}
                  >
                    {page}
                  </Button>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Empty State */}
          {paginatedStreams.length === 0 && (
            <div className="text-center py-12">
              <Video className="h-12 w-12 mx-auto mb-4 text-slate-300" />
              <h3 className="text-lg font-medium text-slate-900 dark:text-foreground mb-2">
                No streams found
              </h3>
              <p className="text-slate-500">
                {searchQuery
                  ? "Try adjusting your search query"
                  : "Your past streams will appear here"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
