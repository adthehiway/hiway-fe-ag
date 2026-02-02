"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import PageTitle from "@/components/dashboard/layout/PageTitle";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FluxTabs } from "@/components/dashboard/flux/FluxTabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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
  Radio,
  Plus,
  Activity,
  Calendar,
  Clock,
  Video,
  Users,
  Play,
  Eye,
  Zap,
  Shield,
  Code,
  ChevronDown,
  ChevronRight,
  Settings,
  Volume2,
  Search,
  ArrowUpDown,
  ChevronLeft,
  MoreVertical,
  Pencil,
  Trash2,
  Square,
  RefreshCw,
  Maximize2,
  VolumeX,
  AlertTriangle,
  Gauge,
  HelpCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ============ SHARED DATA ============

const quickStats = {
  activeStreams: 2,
  scheduledStreams: 5,
  pastStreams: 8,
  totalViewers: 4521,
};

// ============ CREATE TAB DATA ============

interface ProtocolOption {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  urls: string[];
}

const protocols: ProtocolOption[] = [
  {
    id: "mpeg-ts",
    name: "MPEG-TS",
    description: "Perfect for low-latency and interactive streams.",
    icon: Radio,
    urls: ["udp://live.hiway.io:1234", "udp://live.hiway.io:1235"],
  },
  {
    id: "rtmp",
    name: "RTMP",
    description: "Reliable for stable broadcasts with high-quality transmission.",
    icon: Zap,
    urls: ["rtmp://live.hiway.io/stream", "rtmp://live.hiway.io/backup"],
  },
  {
    id: "srt",
    name: "SRT",
    description: "Secure and adaptive for unpredictable networks.",
    icon: Shield,
    urls: ["srt://live.hiway.io:9000", "srt://live.hiway.io:9001"],
  },
  {
    id: "custom",
    name: "Custom",
    description: "Enter a custom URL.",
    icon: Code,
    urls: [],
  },
];

const accessGroups = [
  { id: "1", name: "Production Team" },
  { id: "2", name: "Marketing" },
  { id: "3", name: "External Partners" },
];

const libraries = [
  { id: "1", name: "Main Content Library" },
  { id: "2", name: "Live Events" },
  { id: "3", name: "Archived Streams" },
];

const retentionOptions = [
  { id: "24h", name: "24 Hours" },
  { id: "7d", name: "7 Days" },
  { id: "30d", name: "30 Days" },
  { id: "90d", name: "90 Days" },
  { id: "forever", name: "Forever" },
];

const encryptionOptions = [
  { id: "drm-public", name: "DRM - Public Access" },
  { id: "drm-all", name: "DRM - All Formats" },
  { id: "drm-fairplay", name: "DRM - Fairplay" },
  { id: "drm-hls-widevine", name: "DRM - HLS Widevine" },
  { id: "drm-hls-playready", name: "DRM - HLS PlayReady" },
  { id: "clear", name: "Clear" },
];

// ============ MONITOR TAB DATA ============

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
  bufferHealth: number;
  audioLevelL: number;
  audioLevelR: number;
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

// ============ SCHEDULE TAB DATA ============

interface ScheduledStream {
  id: string;
  title: string;
  date: string;
  time: string;
  status: "scheduled" | "draft" | "live";
  description?: string;
}

const initialScheduledStreams: ScheduledStream[] = [
  { id: "1", title: "Film Premiere: The Midnight Chronicles", date: "Jan 25, 2025", time: "8:00 PM EST", status: "scheduled", description: "World premiere" },
  { id: "2", title: "Q&A with Director", date: "Jan 28, 2025", time: "3:00 PM EST", status: "scheduled", description: "Interactive session" },
  { id: "3", title: "Behind the Scenes Special", date: "Feb 1, 2025", time: "7:00 PM EST", status: "draft", description: "Exclusive footage" },
  { id: "4", title: "Cast Reunion Stream", date: "Feb 5, 2025", time: "6:00 PM EST", status: "scheduled" },
  { id: "5", title: "Documentary Preview", date: "Feb 10, 2025", time: "4:00 PM EST", status: "draft" },
];

// ============ HISTORY TAB DATA ============

interface PastStream {
  id: string;
  title: string;
  date: string;
  viewers: number;
  duration: string;
  vodAvailable: boolean;
}

const pastStreamsData: PastStream[] = [
  { id: "1", title: "Ocean Depths Premiere", date: "Jan 15, 2025", viewers: 1234, duration: "2:15:34", vodAvailable: true },
  { id: "2", title: "Cast Interview Live", date: "Jan 10, 2025", viewers: 876, duration: "1:05:22", vodAvailable: true },
  { id: "3", title: "Film Festival Coverage", date: "Jan 5, 2025", viewers: 2345, duration: "3:42:18", vodAvailable: false },
  { id: "4", title: "Director's Commentary", date: "Dec 28, 2024", viewers: 567, duration: "1:30:00", vodAvailable: true },
  { id: "5", title: "New Year's Eve Special", date: "Dec 31, 2024", viewers: 4521, duration: "4:00:00", vodAvailable: true },
  { id: "6", title: "Behind the Scenes", date: "Dec 20, 2024", viewers: 892, duration: "0:45:12", vodAvailable: false },
];

// ============ MAIN COMPONENT ============

export default function LiveStreamPage() {
  const [activeTab, setActiveTab] = useState("create");

  // Create tab state
  const [selectedProtocol, setSelectedProtocol] = useState<string>("");
  const [selectedUrl, setSelectedUrl] = useState<string>("");
  const [customUrl, setCustomUrl] = useState<string>("");
  const [streamName, setStreamName] = useState("");
  const [displayTitle, setDisplayTitle] = useState("");
  const [description, setDescription] = useState("");
  const [accessGroup, setAccessGroup] = useState("");
  const [permission, setPermission] = useState("");
  const [library, setLibrary] = useState("");
  const [retention, setRetention] = useState("");
  const [encryption, setEncryption] = useState("");
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);

  // Monitor tab state
  const [activeStreams, setActiveStreams] = useState<ActiveStream[]>(initialActiveStreams);
  const [stopDialogOpen, setStopDialogOpen] = useState(false);
  const [streamToStop, setStreamToStop] = useState<string | null>(null);

  // Schedule tab state
  const [scheduledStreams, setScheduledStreams] = useState<ScheduledStream[]>(initialScheduledStreams);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [streamToDelete, setStreamToDelete] = useState<string | null>(null);

  // History tab state
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<"date" | "viewers" | "duration">("date");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Real-time updates for monitor
  useEffect(() => {
    if (activeTab !== "monitor") return;
    const interval = setInterval(() => {
      setActiveStreams((prev) =>
        prev.map((stream) => ({
          ...stream,
          viewers: Math.max(0, stream.viewers + Math.floor(Math.random() * 10) - 5),
          audioLevelL: Math.min(100, Math.max(0, stream.audioLevelL + Math.floor(Math.random() * 20) - 10)),
          audioLevelR: Math.min(100, Math.max(0, stream.audioLevelR + Math.floor(Math.random() * 20) - 10)),
          bitrate: Math.min(5000, Math.max(2000, stream.bitrate + Math.floor(Math.random() * 200) - 100)),
          bufferHealth: Math.min(100, Math.max(50, stream.bufferHealth + Math.floor(Math.random() * 10) - 5)),
        }))
      );
    }, 1000);
    return () => clearInterval(interval);
  }, [activeTab]);

  const tabs = [
    { id: "create", label: "Create", icon: Plus },
    { id: "schedule", label: "Schedule", icon: Calendar, count: scheduledStreams.length },
    { id: "history", label: "History", icon: Clock, count: pastStreamsData.length },
    { id: "monitor", label: "Monitor", icon: Activity, count: activeStreams.length },
  ];

  const selectedProtocolData = protocols.find((p) => p.id === selectedProtocol);

  // History filtering/sorting
  const filteredStreams = pastStreamsData.filter((stream) =>
    stream.title.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const sortedStreams = [...filteredStreams].sort((a, b) => {
    let comparison = 0;
    switch (sortField) {
      case "date": comparison = new Date(a.date).getTime() - new Date(b.date).getTime(); break;
      case "viewers": comparison = a.viewers - b.viewers; break;
      case "duration":
        const toSec = (d: string) => { const p = d.split(":").map(Number); return p[0] * 3600 + p[1] * 60 + p[2]; };
        comparison = toSec(a.duration) - toSec(b.duration); break;
    }
    return sortDirection === "asc" ? comparison : -comparison;
  });
  const totalPages = Math.ceil(sortedStreams.length / itemsPerPage);
  const paginatedStreams = sortedStreams.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Handlers
  const handleProtocolSelect = (protocolId: string) => {
    setSelectedProtocol(protocolId);
    setSelectedUrl("");
    setCustomUrl("");
  };

  const handleStopStream = (id: string) => { setStreamToStop(id); setStopDialogOpen(true); };
  const confirmStopStream = () => {
    if (streamToStop) { setActiveStreams(activeStreams.filter((s) => s.id !== streamToStop)); setStopDialogOpen(false); setStreamToStop(null); }
  };
  const toggleMute = (id: string) => { setActiveStreams(activeStreams.map((s) => s.id === id ? { ...s, muted: !s.muted } : s)); };

  const handleDeleteScheduled = (id: string) => { setStreamToDelete(id); setDeleteDialogOpen(true); };
  const confirmDeleteScheduled = () => {
    if (streamToDelete) { setScheduledStreams(scheduledStreams.filter((s) => s.id !== streamToDelete)); setDeleteDialogOpen(false); setStreamToDelete(null); }
  };
  const handleGoLive = (id: string) => { setScheduledStreams(scheduledStreams.map((s) => s.id === id ? { ...s, status: "live" as const } : s)); };

  const getScheduleStatusBadge = (status: ScheduledStream["status"]) => {
    switch (status) {
      case "live": return <Badge className="bg-red-500 text-white"><span className="h-2 w-2 rounded-full bg-white animate-pulse mr-1.5" />Live</Badge>;
      case "scheduled": return <Badge className="bg-[#00B4B4] text-white">Scheduled</Badge>;
      case "draft": return <Badge variant="secondary">Draft</Badge>;
    }
  };

  const getMonitorStatusBadge = (status: ActiveStream["status"]) => {
    switch (status) {
      case "live": return <Badge className="bg-green-500 text-white"><span className="h-2 w-2 rounded-full bg-white animate-pulse mr-1.5" />Live</Badge>;
      case "buffering": return <Badge className="bg-amber-500 text-white"><RefreshCw className="h-3 w-3 mr-1.5 animate-spin" />Buffering</Badge>;
      case "error": return <Badge className="bg-red-500 text-white"><AlertTriangle className="h-3 w-3 mr-1.5" />Error</Badge>;
    }
  };

  const AudioMeter = ({ level, label }: { level: number; label: string }) => (
    <div className="flex items-center gap-2">
      <span className="text-xs text-slate-500 w-3">{label}</span>
      <div className="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
        <div className={cn("h-full transition-all duration-100 rounded-full", level > 90 ? "bg-red-500" : level > 70 ? "bg-amber-500" : "bg-green-500")} style={{ width: `${level}%` }} />
      </div>
    </div>
  );

  const HealthIndicator = ({ value, max, label, unit, warning }: { value: number; max: number; label: string; unit: string; warning?: boolean }) => (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-slate-500">{label}</span>
        <span className={cn("font-medium", warning ? "text-amber-500" : "text-slate-700 dark:text-slate-300")}>{value}{unit}</span>
      </div>
      <div className="h-1 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
        <div className={cn("h-full transition-all rounded-full", warning ? "bg-amber-500" : "bg-[#00B4B4]")} style={{ width: `${(value / max) * 100}%` }} />
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <PageTitle
        title="Live Stream"
        description="Manage your live streaming operations"
        content={
          <Button className="bg-[#00B4B4] hover:bg-[#009999]" onClick={() => setActiveTab("create")}>
            <Plus className="h-4 w-4 mr-2" />
            Create Stream
          </Button>
        }
      />

      {/* Quick Stats - Compact */}
      <div className="grid grid-cols-4 gap-3">
        <Card>
          <CardContent className="py-2 px-3 flex items-center gap-2">
            <div className="h-7 w-7 rounded-md bg-red-500/10 flex items-center justify-center">
              <Radio className="h-3.5 w-3.5 text-red-500" />
            </div>
            <div className="flex items-baseline gap-2">
              <p className="text-lg font-bold text-slate-900 dark:text-foreground">{quickStats.activeStreams}</p>
              <p className="text-xs text-slate-500">Active Now</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-2 px-3 flex items-center gap-2">
            <div className="h-7 w-7 rounded-md bg-[#00B4B4]/10 flex items-center justify-center">
              <Calendar className="h-3.5 w-3.5 text-[#00B4B4]" />
            </div>
            <div className="flex items-baseline gap-2">
              <p className="text-lg font-bold text-slate-900 dark:text-foreground">{quickStats.scheduledStreams}</p>
              <p className="text-xs text-slate-500">Scheduled</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-2 px-3 flex items-center gap-2">
            <div className="h-7 w-7 rounded-md bg-slate-100 dark:bg-muted flex items-center justify-center">
              <Clock className="h-3.5 w-3.5 text-slate-500" />
            </div>
            <div className="flex items-baseline gap-2">
              <p className="text-lg font-bold text-slate-900 dark:text-foreground">{quickStats.pastStreams}</p>
              <p className="text-xs text-slate-500">Past Streams</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-2 px-3 flex items-center gap-2">
            <div className="h-7 w-7 rounded-md bg-purple-500/10 flex items-center justify-center">
              <Users className="h-3.5 w-3.5 text-purple-500" />
            </div>
            <div className="flex items-baseline gap-2">
              <p className="text-lg font-bold text-slate-900 dark:text-foreground">{quickStats.totalViewers.toLocaleString()}</p>
              <p className="text-xs text-slate-500">Total Viewers</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <FluxTabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

      {/* ============ MONITOR TAB ============ */}
      {activeTab === "monitor" && (
        <div className="space-y-4">
          {activeStreams.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Radio className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                <h3 className="text-lg font-medium text-slate-900 dark:text-foreground mb-2">No Active Streams</h3>
                <p className="text-slate-500 mb-4">Go live to see monitoring data here.</p>
                <Button className="bg-[#00B4B4] hover:bg-[#009999]" onClick={() => setActiveTab("create")}>
                  <Radio className="h-4 w-4 mr-2" />Go Live
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {activeStreams.map((stream) => (
                <Card key={stream.id} className="overflow-hidden">
                  <div className="relative aspect-video bg-slate-900">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Play className="h-12 w-12 text-slate-600" />
                    </div>
                    <div className="absolute top-2 left-2 flex items-center gap-2">
                      {getMonitorStatusBadge(stream.status)}
                      <Badge variant="secondary" className="bg-black/50 text-white text-xs">
                        <Clock className="h-3 w-3 mr-1" />{stream.duration}
                      </Badge>
                    </div>
                    <div className="absolute top-2 right-2">
                      <Badge variant="secondary" className="bg-black/50 text-white text-xs">
                        <Eye className="h-3 w-3 mr-1" />{stream.viewers.toLocaleString()}
                      </Badge>
                    </div>
                    <div className="absolute bottom-2 left-2 right-2 flex justify-between">
                      <Button size="icon" variant="secondary" className="h-7 w-7 bg-black/50 hover:bg-black/70 text-white" onClick={() => toggleMute(stream.id)}>
                        {stream.muted ? <VolumeX className="h-3 w-3" /> : <Volume2 className="h-3 w-3" />}
                      </Button>
                      <Button size="icon" variant="secondary" className="h-7 w-7 bg-black/50 hover:bg-black/70 text-white">
                        <Maximize2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <CardContent className="p-3 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-slate-900 dark:text-foreground text-sm">{stream.title}</h3>
                        <p className="text-xs text-slate-500">Started {stream.startTime} · Peak: {stream.peakViewers.toLocaleString()}</p>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-7 w-7"><MoreVertical className="h-4 w-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem><RefreshCw className="h-4 w-4 mr-2" />Restart</DropdownMenuItem>
                          <DropdownMenuItem><Maximize2 className="h-4 w-4 mr-2" />Fullscreen</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleStopStream(stream.id)} className="text-red-600"><Square className="h-4 w-4 mr-2" />Stop</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-2 bg-slate-50 dark:bg-muted rounded-lg space-y-1.5">
                        <div className="flex items-center gap-1 text-xs font-medium text-slate-600 dark:text-slate-400">
                          <Volume2 className="h-3 w-3" />Audio
                        </div>
                        <AudioMeter level={stream.audioLevelL} label="L" />
                        <AudioMeter level={stream.audioLevelR} label="R" />
                      </div>
                      <div className="p-2 bg-slate-50 dark:bg-muted rounded-lg space-y-1.5">
                        <div className="flex items-center gap-1 text-xs font-medium text-slate-600 dark:text-slate-400">
                          <Gauge className="h-3 w-3" />Health
                        </div>
                        <HealthIndicator value={stream.bitrate} max={stream.targetBitrate} label="Bitrate" unit=" kbps" warning={stream.bitrate < stream.targetBitrate * 0.7} />
                        <HealthIndicator value={stream.bufferHealth} max={100} label="Buffer" unit="%" warning={stream.bufferHealth < 70} />
                      </div>
                    </div>
                    {(stream.status === "buffering" || stream.droppedFrames > 30) && (
                      <div className="flex items-center gap-2 p-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                        <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />
                        <p className="text-xs text-amber-800 dark:text-amber-200">
                          {stream.status === "buffering" ? "Buffering - check connection" : "High dropped frames"}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ============ CREATE TAB ============ */}
      {activeTab === "create" && (
        <div className="max-w-4xl space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Radio className="h-4 w-4 text-[#00B4B4]" />Streaming Protocol
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {protocols.map((protocol) => {
                  const Icon = protocol.icon;
                  const isSelected = selectedProtocol === protocol.id;
                  return (
                    <div key={protocol.id} onClick={() => handleProtocolSelect(protocol.id)}
                      className={cn("p-3 rounded-xl border-2 cursor-pointer transition-all", isSelected ? "border-[#00B4B4] bg-[#00B4B4]/5" : "border-slate-200 dark:border-border hover:border-slate-300")}>
                      <div className="flex items-start gap-3">
                        <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center", isSelected ? "bg-[#00B4B4] text-white" : "bg-slate-100 dark:bg-muted text-slate-500")}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-slate-900 dark:text-foreground text-sm">{protocol.name}</h4>
                          <p className="text-xs text-slate-500 mt-0.5">{protocol.description}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              {selectedProtocol && selectedProtocol !== "custom" && selectedProtocolData && (
                <div className="space-y-2">
                  <Label className="text-sm">Available URLs</Label>
                  <Select value={selectedUrl} onValueChange={setSelectedUrl}>
                    <SelectTrigger><SelectValue placeholder="Select URL..." /></SelectTrigger>
                    <SelectContent>
                      {selectedProtocolData.urls.map((url) => (<SelectItem key={url} value={url}>{url}</SelectItem>))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              {selectedProtocol === "custom" && (
                <div className="space-y-2">
                  <Label className="text-sm">Custom URL</Label>
                  <Input placeholder="Enter custom streaming URL..." value={customUrl} onChange={(e) => setCustomUrl(e.target.value)} />
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">General</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-sm">Name <span className="text-red-500">*</span></Label>
                  <Input placeholder="Stream name" value={streamName} onChange={(e) => setStreamName(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm">Display Title</Label>
                  <Input placeholder="Public title (optional)" value={displayTitle} onChange={(e) => setDisplayTitle(e.target.value)} />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm">Description</Label>
                <Textarea placeholder="Description..." value={description} onChange={(e) => setDescription(e.target.value)} rows={2} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Access</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-sm">Access Group</Label>
                  <Select value={accessGroup} onValueChange={setAccessGroup}>
                    <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                    <SelectContent>{accessGroups.map((g) => (<SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>))}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm">Permission</Label>
                  <Select value={permission} onValueChange={setPermission}>
                    <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">Public</SelectItem>
                      <SelectItem value="private">Private</SelectItem>
                      <SelectItem value="restricted">Restricted</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm">Library <span className="text-red-500">*</span></Label>
                  <Select value={library} onValueChange={setLibrary}>
                    <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                    <SelectContent>{libraries.map((l) => (<SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>))}</SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-muted/50 transition-colors" onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Settings className="h-4 w-4 text-[#00B4B4]" />Advanced Settings
                </CardTitle>
                {isAdvancedOpen ? <ChevronDown className="h-4 w-4 text-slate-500" /> : <ChevronRight className="h-4 w-4 text-slate-500" />}
              </div>
            </CardHeader>
            {isAdvancedOpen && (
              <CardContent className="pt-0">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-sm">Retention</Label>
                    <Select value={retention} onValueChange={setRetention}>
                      <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                      <SelectContent>{retentionOptions.map((o) => (<SelectItem key={o.id} value={o.id}>{o.name}</SelectItem>))}</SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-sm flex items-center gap-1">
                      Playback Encryption
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <HelpCircle className="h-3.5 w-3.5 text-slate-400 hover:text-slate-600 cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent side="right" className="max-w-xs bg-slate-900 text-white p-3">
                          <div className="space-y-2 text-xs">
                            <p><strong>DRM - Public Access:</strong> Basic protection for publicly accessible content</p>
                            <p><strong>DRM - All Formats:</strong> Full DRM support across all playback formats</p>
                            <p><strong>DRM - Fairplay:</strong> Apple's DRM for Safari and iOS devices</p>
                            <p><strong>DRM - HLS Widevine:</strong> Google's DRM for Chrome and Android</p>
                            <p><strong>DRM - HLS PlayReady:</strong> Microsoft's DRM for Edge and Windows</p>
                            <p><strong>Clear:</strong> No encryption, content plays without DRM</p>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </Label>
                    <Select value={encryption} onValueChange={setEncryption}>
                      <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                      <SelectContent>{encryptionOptions.map((o) => (<SelectItem key={o.id} value={o.id}>{o.name}</SelectItem>))}</SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            )}
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Volume2 className="h-4 w-4 text-[#00B4B4]" />Audio
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-sm text-amber-800 dark:text-amber-200">
                To apply audio settings, the object must be probed first.
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-3 pb-4">
            <Button variant="outline" onClick={() => setActiveTab("monitor")}>Cancel</Button>
            <Button className="bg-[#00B4B4] hover:bg-[#009999]" disabled={!streamName || !library || (!selectedUrl && !customUrl)}>Create Stream</Button>
          </div>
        </div>
      )}

      {/* ============ SCHEDULE TAB ============ */}
      {activeTab === "schedule" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Upcoming Streams</h3>
            <Button className="bg-[#00B4B4] hover:bg-[#009999]" onClick={() => setActiveTab("create")}>
              <Plus className="h-4 w-4 mr-2" />Schedule Stream
            </Button>
          </div>
          {scheduledStreams.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Calendar className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                <h3 className="text-lg font-medium mb-2">No scheduled streams</h3>
                <Button className="bg-[#00B4B4] hover:bg-[#009999]" onClick={() => setActiveTab("create")}>
                  <Plus className="h-4 w-4 mr-2" />Schedule Stream
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {scheduledStreams.map((stream) => (
                <Card key={stream.id}>
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={cn("h-10 w-10 rounded-lg flex items-center justify-center", stream.status === "live" ? "bg-red-500/10" : stream.status === "scheduled" ? "bg-[#00B4B4]/10" : "bg-slate-100 dark:bg-muted")}>
                          {stream.status === "live" ? <Radio className="h-5 w-5 text-red-500" /> : <Calendar className={cn("h-5 w-5", stream.status === "scheduled" ? "text-[#00B4B4]" : "text-slate-500")} />}
                        </div>
                        <div>
                          <h4 className="font-semibold text-slate-900 dark:text-foreground text-sm">{stream.title}</h4>
                          <p className="text-xs text-slate-500">{stream.date} at {stream.time}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getScheduleStatusBadge(stream.status)}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8"><MoreVertical className="h-4 w-4" /></Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem><Pencil className="h-4 w-4 mr-2" />Edit</DropdownMenuItem>
                            {stream.status !== "live" && (<DropdownMenuItem onClick={() => handleGoLive(stream.id)}><Play className="h-4 w-4 mr-2" />Go Live</DropdownMenuItem>)}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleDeleteScheduled(stream.id)} className="text-red-600"><Trash2 className="h-4 w-4 mr-2" />Delete</DropdownMenuItem>
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
      )}

      {/* ============ HISTORY TAB ============ */}
      {activeTab === "history" && (
        <div className="space-y-4">
          <Card>
            <CardContent className="p-3">
              <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input placeholder="Search streams..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
                </div>
                <Select value={`${sortField}-${sortDirection}`} onValueChange={(v) => { const [f, d] = v.split("-") as ["date" | "viewers" | "duration", "asc" | "desc"]; setSortField(f); setSortDirection(d); }}>
                  <SelectTrigger className="w-[180px]">
                    <ArrowUpDown className="h-4 w-4 mr-2" /><SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="date-desc">Date (Newest)</SelectItem>
                    <SelectItem value="date-asc">Date (Oldest)</SelectItem>
                    <SelectItem value="viewers-desc">Viewers (High)</SelectItem>
                    <SelectItem value="viewers-asc">Viewers (Low)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-0">
              <table className="w-full">
                <thead className="bg-slate-50 dark:bg-muted border-b border-slate-200 dark:border-border">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Stream</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Viewers</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Duration</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">VOD</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-border">
                  {paginatedStreams.map((stream) => (
                    <tr key={stream.id} className="hover:bg-slate-50 dark:hover:bg-muted/50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Video className="h-4 w-4 text-slate-400" />
                          <span className="font-medium text-sm text-slate-900 dark:text-foreground">{stream.title}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600 dark:text-muted-foreground">{stream.date}</td>
                      <td className="px-4 py-3 text-sm text-slate-600 dark:text-muted-foreground">{stream.viewers.toLocaleString()}</td>
                      <td className="px-4 py-3 text-sm text-slate-600 dark:text-muted-foreground">{stream.duration}</td>
                      <td className="px-4 py-3">
                        <Badge className={cn(stream.vodAvailable ? "bg-green-500/20 text-green-600" : "bg-slate-500/20 text-slate-600")}>
                          {stream.vodAvailable ? "Available" : "No VOD"}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button variant="outline" size="sm"><Eye className="h-3 w-3 mr-1" />View</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 dark:border-border">
                  <p className="text-xs text-slate-500">Showing {(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, sortedStreams.length)} of {sortedStreams.length}</p>
                  <div className="flex items-center gap-1">
                    <Button variant="outline" size="sm" onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1}><ChevronLeft className="h-4 w-4" /></Button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <Button key={page} variant={currentPage === page ? "default" : "outline"} size="sm" onClick={() => setCurrentPage(page)} className={cn(currentPage === page && "bg-[#00B4B4] hover:bg-[#009999]")}>{page}</Button>
                    ))}
                    <Button variant="outline" size="sm" onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}><ChevronRight className="h-4 w-4" /></Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Dialogs */}
      <Dialog open={stopDialogOpen} onOpenChange={setStopDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Stop Live Stream</DialogTitle>
            <DialogDescription>Are you sure? All viewers will be disconnected.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setStopDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={confirmStopStream}>Stop Stream</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Scheduled Stream</DialogTitle>
            <DialogDescription>This action cannot be undone.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={confirmDeleteScheduled}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
