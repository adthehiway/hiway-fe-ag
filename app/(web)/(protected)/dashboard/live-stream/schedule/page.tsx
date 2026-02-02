"use client";

import { useState } from "react";
import Link from "next/link";
import PageTitle from "@/components/dashboard/layout/PageTitle";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Calendar,
  Plus,
  ArrowLeft,
  MoreVertical,
  Pencil,
  Trash2,
  Play,
  Clock,
  Radio,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ScheduledStream {
  id: string;
  title: string;
  date: string;
  time: string;
  status: "scheduled" | "draft" | "live";
  description?: string;
  thumbnail?: string;
}

const initialScheduledStreams: ScheduledStream[] = [
  {
    id: "1",
    title: "Film Premiere: The Midnight Chronicles",
    date: "Jan 25, 2025",
    time: "8:00 PM EST",
    status: "scheduled",
    description: "World premiere of our latest production",
  },
  {
    id: "2",
    title: "Q&A with Director",
    date: "Jan 28, 2025",
    time: "3:00 PM EST",
    status: "scheduled",
    description: "Interactive session with the director",
  },
  {
    id: "3",
    title: "Behind the Scenes Special",
    date: "Feb 1, 2025",
    time: "7:00 PM EST",
    status: "draft",
    description: "Exclusive behind the scenes footage",
  },
  {
    id: "4",
    title: "Cast Reunion Stream",
    date: "Feb 5, 2025",
    time: "6:00 PM EST",
    status: "scheduled",
    description: "Reuniting the cast for a special event",
  },
  {
    id: "5",
    title: "Documentary Preview",
    date: "Feb 10, 2025",
    time: "4:00 PM EST",
    status: "draft",
    description: "Preview of upcoming documentary",
  },
];

export default function StreamSchedulePage() {
  const [streams, setStreams] = useState<ScheduledStream[]>(initialScheduledStreams);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [streamToDelete, setStreamToDelete] = useState<string | null>(null);

  const handleDelete = (id: string) => {
    setStreamToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (streamToDelete) {
      setStreams(streams.filter((s) => s.id !== streamToDelete));
      setDeleteDialogOpen(false);
      setStreamToDelete(null);
    }
  };

  const handleGoLive = (id: string) => {
    setStreams(
      streams.map((s) =>
        s.id === id ? { ...s, status: "live" as const } : s
      )
    );
  };

  const getStatusBadge = (status: ScheduledStream["status"]) => {
    switch (status) {
      case "live":
        return (
          <Badge className="bg-red-500 text-white">
            <span className="h-2 w-2 rounded-full bg-white animate-pulse mr-1.5" />
            Live
          </Badge>
        );
      case "scheduled":
        return (
          <Badge className="bg-[#00B4B4] text-white">
            Scheduled
          </Badge>
        );
      case "draft":
        return (
          <Badge variant="secondary" className="bg-slate-200 dark:bg-muted text-slate-600 dark:text-muted-foreground">
            Draft
          </Badge>
        );
    }
  };

  const scheduledCount = streams.filter((s) => s.status === "scheduled").length;
  const draftCount = streams.filter((s) => s.status === "draft").length;
  const liveCount = streams.filter((s) => s.status === "live").length;

  return (
    <div className="space-y-6">
      <PageTitle
        title="Scheduled Streams"
        description="Manage your upcoming live streams"
        content={
          <div className="flex gap-2">
            <Link href="/dashboard/live-stream">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </Link>
            <Link href="/dashboard/live-stream/create">
              <Button className="bg-[#00B4B4] hover:bg-[#009999]">
                <Plus className="h-4 w-4 mr-2" />
                Schedule Stream
              </Button>
            </Link>
          </div>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-[#00B4B4]/10 flex items-center justify-center">
              <Calendar className="h-6 w-6 text-[#00B4B4]" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900 dark:text-foreground">
                {scheduledCount}
              </p>
              <p className="text-sm text-slate-500">Scheduled</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-slate-100 dark:bg-muted flex items-center justify-center">
              <Clock className="h-6 w-6 text-slate-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900 dark:text-foreground">
                {draftCount}
              </p>
              <p className="text-sm text-slate-500">Drafts</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-red-500/10 flex items-center justify-center">
              <Radio className="h-6 w-6 text-red-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900 dark:text-foreground">
                {liveCount}
              </p>
              <p className="text-sm text-slate-500">Live Now</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Streams List */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-foreground">
          Upcoming Streams
        </h3>

        {streams.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-slate-300" />
              <h3 className="text-lg font-medium text-slate-900 dark:text-foreground mb-2">
                No scheduled streams
              </h3>
              <p className="text-slate-500 mb-4">
                Schedule your first stream to get started
              </p>
              <Link href="/dashboard/live-stream/create">
                <Button className="bg-[#00B4B4] hover:bg-[#009999]">
                  <Plus className="h-4 w-4 mr-2" />
                  Schedule Stream
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {streams.map((stream) => (
              <Card key={stream.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div
                        className={cn(
                          "h-14 w-14 rounded-xl flex items-center justify-center",
                          stream.status === "live"
                            ? "bg-red-500/10"
                            : stream.status === "scheduled"
                            ? "bg-[#00B4B4]/10"
                            : "bg-slate-100 dark:bg-muted"
                        )}
                      >
                        {stream.status === "live" ? (
                          <Radio className="h-7 w-7 text-red-500" />
                        ) : (
                          <Calendar
                            className={cn(
                              "h-7 w-7",
                              stream.status === "scheduled"
                                ? "text-[#00B4B4]"
                                : "text-slate-500"
                            )}
                          />
                        )}
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-900 dark:text-foreground">
                          {stream.title}
                        </h4>
                        <p className="text-sm text-slate-500 dark:text-muted-foreground">
                          {stream.date} at {stream.time}
                        </p>
                        {stream.description && (
                          <p className="text-sm text-slate-400 mt-1">
                            {stream.description}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {getStatusBadge(stream.status)}

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Pencil className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          {stream.status !== "live" && (
                            <DropdownMenuItem onClick={() => handleGoLive(stream.id)}>
                              <Play className="h-4 w-4 mr-2" />
                              Go Live Now
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleDelete(stream.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Scheduled Stream</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this scheduled stream? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
