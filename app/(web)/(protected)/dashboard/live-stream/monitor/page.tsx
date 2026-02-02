"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import PageTitle from "@/components/dashboard/layout/PageTitle";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
  Radio,
  Play,
  Pause,
  Square,
  RefreshCw,
  Maximize2,
  ArrowLeft,
  MoreVertical,
  Volume2,
  VolumeX,
  Wifi,
  AlertTriangle,
  Users,
  Clock,
  Activity,
  Gauge,
  Eye,
  Calendar,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ActiveStream {
  id: string;
  title: string;
  status: "live" | "buffering" | "error";
  startTime: string;
  duration: string;
  viewers: number;
  peakViewers: number;
  bitrate: number;
  targetBitrate: number;
  frameRate: number;
  droppedFrames: number;
  bufferHealth: number; // 0-100
  audioLevelL: number; // 0-100
  audioLevelR: number; // 0-100
  muted: boolean;
}

const initialActiveStreams: ActiveStream[] = [
  {
    id: "1",
    title: "Film Premiere: The Midnight Chronicles",
    status: "live",
    startTime: "8:00 PM",
    duration: "01:23:45",
    viewers: 1234,
    peakViewers: 1567,
    bitrate: 4500,
    targetBitrate: 5000,
    frameRate: 29.97,
    droppedFrames: 12,
    bufferHealth: 95,
    audioLevelL: 72,
    audioLevelR: 68,
    muted: false,
  },
  {
    id: "2",
    title: "Behind the Scenes Stream",
    status: "buffering",
    startTime: "7:30 PM",
    duration: "00:45:12",
    viewers: 567,
    peakViewers: 890,
    bitrate: 3200,
    targetBitrate: 5000,
    frameRate: 30,
    droppedFrames: 45,
    bufferHealth: 62,
    audioLevelL: 55,
    audioLevelR: 58,
    muted: false,
  },
];

export default function StreamMonitorPage() {
  const [streams, setStreams] = useState<ActiveStream[]>(initialActiveStreams);
  const [stopDialogOpen, setStopDialogOpen] = useState(false);
  const [streamToStop, setStreamToStop] = useState<string | null>(null);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setStreams((prev) =>
        prev.map((stream) => ({
          ...stream,
          viewers: stream.viewers + Math.floor(Math.random() * 10) - 5,
          audioLevelL: Math.min(100, Math.max(0, stream.audioLevelL + Math.floor(Math.random() * 20) - 10)),
          audioLevelR: Math.min(100, Math.max(0, stream.audioLevelR + Math.floor(Math.random() * 20) - 10)),
          bitrate: Math.min(5000, Math.max(2000, stream.bitrate + Math.floor(Math.random() * 200) - 100)),
          bufferHealth: Math.min(100, Math.max(50, stream.bufferHealth + Math.floor(Math.random() * 10) - 5)),
        }))
      );
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleStopStream = (id: string) => {
    setStreamToStop(id);
    setStopDialogOpen(true);
  };

  const confirmStopStream = () => {
    if (streamToStop) {
      setStreams(streams.filter((s) => s.id !== streamToStop));
      setStopDialogOpen(false);
      setStreamToStop(null);
    }
  };

  const toggleMute = (id: string) => {
    setStreams(
      streams.map((s) =>
        s.id === id ? { ...s, muted: !s.muted } : s
      )
    );
  };

  const getStatusBadge = (status: ActiveStream["status"]) => {
    switch (status) {
      case "live":
        return (
          <Badge className="bg-green-500 text-white">
            <span className="h-2 w-2 rounded-full bg-white animate-pulse mr-1.5" />
            Live
          </Badge>
        );
      case "buffering":
        return (
          <Badge className="bg-amber-500 text-white">
            <RefreshCw className="h-3 w-3 mr-1.5 animate-spin" />
            Buffering
          </Badge>
        );
      case "error":
        return (
          <Badge className="bg-red-500 text-white">
            <AlertTriangle className="h-3 w-3 mr-1.5" />
            Error
          </Badge>
        );
    }
  };

  const AudioMeter = ({ level, label }: { level: number; label: string }) => (
    <div className="flex items-center gap-2">
      <span className="text-xs text-slate-500 w-4">{label}</span>
      <div className="flex-1 h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
        <div
          className={cn(
            "h-full transition-all duration-100 rounded-full",
            level > 90 ? "bg-red-500" : level > 70 ? "bg-amber-500" : "bg-green-500"
          )}
          style={{ width: `${level}%` }}
        />
      </div>
      <span className="text-xs text-slate-500 w-8 text-right">{level}%</span>
    </div>
  );

  const HealthIndicator = ({ value, max, label, unit, warning }: {
    value: number;
    max: number;
    label: string;
    unit: string;
    warning?: boolean;
  }) => (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-slate-500">{label}</span>
        <span className={cn(
          "font-medium",
          warning ? "text-amber-500" : "text-slate-700 dark:text-slate-300"
        )}>
          {value}{unit}
        </span>
      </div>
      <div className="h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
        <div
          className={cn(
            "h-full transition-all rounded-full",
            warning ? "bg-amber-500" : "bg-[#00B4B4]"
          )}
          style={{ width: `${(value / max) * 100}%` }}
        />
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <PageTitle
        title="Stream Monitor"
        description="Monitor active live streams in real-time"
        content={
          <div className="flex gap-2">
            <Link href="/dashboard/live-stream">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </Link>
            <Button variant="outline" onClick={() => window.location.reload()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        }
      />

      {streams.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Radio className="h-16 w-16 mx-auto mb-4 text-slate-300" />
            <h3 className="text-xl font-medium text-slate-900 dark:text-foreground mb-2">
              No Active Streams
            </h3>
            <p className="text-slate-500 mb-6 max-w-md mx-auto">
              Schedule a stream or go live to see monitoring data here. All active streams will appear in real-time.
            </p>
            <div className="flex justify-center gap-3">
              <Link href="/dashboard/live-stream/schedule">
                <Button variant="outline">
                  <Calendar className="h-4 w-4 mr-2" />
                  View Schedule
                </Button>
              </Link>
              <Link href="/dashboard/live-stream/create">
                <Button className="bg-[#00B4B4] hover:bg-[#009999]">
                  <Radio className="h-4 w-4 mr-2" />
                  Go Live
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {streams.map((stream) => (
            <Card key={stream.id} className="overflow-hidden">
              {/* Video Preview */}
              <div className="relative aspect-video bg-slate-900">
                <div className="absolute inset-0 flex items-center justify-center">
                  <Play className="h-16 w-16 text-slate-600" />
                </div>

                {/* Status Overlay */}
                <div className="absolute top-3 left-3 flex items-center gap-2">
                  {getStatusBadge(stream.status)}
                  <Badge variant="secondary" className="bg-black/50 text-white">
                    <Clock className="h-3 w-3 mr-1" />
                    {stream.duration}
                  </Badge>
                </div>

                {/* Viewer Count Overlay */}
                <div className="absolute top-3 right-3">
                  <Badge variant="secondary" className="bg-black/50 text-white">
                    <Eye className="h-3 w-3 mr-1" />
                    {stream.viewers.toLocaleString()} watching
                  </Badge>
                </div>

                {/* Controls Overlay */}
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                  <div className="flex gap-2">
                    <Button
                      size="icon"
                      variant="secondary"
                      className="h-8 w-8 bg-black/50 hover:bg-black/70 text-white"
                      onClick={() => toggleMute(stream.id)}
                    >
                      {stream.muted ? (
                        <VolumeX className="h-4 w-4" />
                      ) : (
                        <Volume2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <Button
                    size="icon"
                    variant="secondary"
                    className="h-8 w-8 bg-black/50 hover:bg-black/70 text-white"
                  >
                    <Maximize2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <CardContent className="p-4 space-y-4">
                {/* Stream Title & Actions */}
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-foreground">
                      {stream.title}
                    </h3>
                    <p className="text-sm text-slate-500">
                      Started at {stream.startTime} · Peak: {stream.peakViewers.toLocaleString()} viewers
                    </p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Restart Stream
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Eye className="h-4 w-4 mr-2" />
                        View Full Details
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Maximize2 className="h-4 w-4 mr-2" />
                        Open in Player
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleStopStream(stream.id)}
                        className="text-red-600"
                      >
                        <Square className="h-4 w-4 mr-2" />
                        Stop Stream
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Audio Meters */}
                <div className="p-3 bg-slate-50 dark:bg-muted rounded-xl space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    <Volume2 className="h-4 w-4" />
                    Audio Levels
                  </div>
                  <AudioMeter level={stream.audioLevelL} label="L" />
                  <AudioMeter level={stream.audioLevelR} label="R" />
                </div>

                {/* Health Metrics */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-slate-50 dark:bg-muted rounded-xl space-y-3">
                    <div className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                      <Activity className="h-4 w-4" />
                      Stream Health
                    </div>
                    <HealthIndicator
                      value={stream.bitrate}
                      max={stream.targetBitrate}
                      label="Bitrate"
                      unit=" kbps"
                      warning={stream.bitrate < stream.targetBitrate * 0.7}
                    />
                    <HealthIndicator
                      value={stream.frameRate}
                      max={30}
                      label="Frame Rate"
                      unit=" fps"
                    />
                    <HealthIndicator
                      value={stream.bufferHealth}
                      max={100}
                      label="Buffer"
                      unit="%"
                      warning={stream.bufferHealth < 70}
                    />
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-muted rounded-xl">
                    <div className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                      <Gauge className="h-4 w-4" />
                      Statistics
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Dropped Frames</span>
                        <span className={cn(
                          "font-medium",
                          stream.droppedFrames > 30 ? "text-red-500" : "text-slate-700 dark:text-slate-300"
                        )}>
                          {stream.droppedFrames}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Current Viewers</span>
                        <span className="font-medium text-slate-700 dark:text-slate-300">
                          {stream.viewers.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Peak Viewers</span>
                        <span className="font-medium text-slate-700 dark:text-slate-300">
                          {stream.peakViewers.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Duration</span>
                        <span className="font-medium text-slate-700 dark:text-slate-300">
                          {stream.duration}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Alert Banner */}
                {(stream.status === "buffering" || stream.droppedFrames > 30 || stream.bufferHealth < 70) && (
                  <div className="flex items-center gap-2 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
                    <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0" />
                    <p className="text-sm text-amber-800 dark:text-amber-200">
                      {stream.status === "buffering" && "Stream is buffering. Check network connection."}
                      {stream.droppedFrames > 30 && stream.status !== "buffering" && "High dropped frame count detected."}
                      {stream.bufferHealth < 70 && stream.status !== "buffering" && stream.droppedFrames <= 30 && "Buffer health is low."}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Stop Stream Confirmation Dialog */}
      <Dialog open={stopDialogOpen} onOpenChange={setStopDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Stop Live Stream</DialogTitle>
            <DialogDescription>
              Are you sure you want to stop this live stream? All viewers will be disconnected immediately.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setStopDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmStopStream}>
              Stop Stream
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
