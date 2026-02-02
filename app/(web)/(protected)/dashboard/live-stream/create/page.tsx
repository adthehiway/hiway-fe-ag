"use client";

import { useState } from "react";
import Link from "next/link";
import PageTitle from "@/components/dashboard/layout/PageTitle";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Radio,
  Zap,
  Shield,
  Code,
  ChevronDown,
  ChevronRight,
  Settings,
  Volume2,
  ArrowLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";

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
    description: "Perfect for low-latency and interactive streams, widely used in live broadcasting applications.",
    icon: Radio,
    urls: ["udp://live.hiway.io:1234", "udp://live.hiway.io:1235"],
  },
  {
    id: "rtmp",
    name: "RTMP",
    description: "Reliable for stable broadcasts, ensuring high-quality video and audio transmission.",
    icon: Zap,
    urls: ["rtmp://live.hiway.io/stream", "rtmp://live.hiway.io/backup"],
  },
  {
    id: "srt",
    name: "SRT",
    description: "Secure and adaptive, ideal for streaming over unpredictable networks with error recovery features.",
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
  { id: "none", name: "None" },
  { id: "clear", name: "Clear" },
  { id: "drm", name: "DRM Protected" },
];

export default function CreateLiveStreamPage() {
  const [selectedProtocol, setSelectedProtocol] = useState<string>("");
  const [selectedUrl, setSelectedUrl] = useState<string>("");
  const [customUrl, setCustomUrl] = useState<string>("");
  const [name, setName] = useState("");
  const [displayTitle, setDisplayTitle] = useState("");
  const [description, setDescription] = useState("");
  const [accessGroup, setAccessGroup] = useState("");
  const [permission, setPermission] = useState("");
  const [library, setLibrary] = useState("");
  const [retention, setRetention] = useState("");
  const [encryption, setEncryption] = useState("");
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);

  const selectedProtocolData = protocols.find((p) => p.id === selectedProtocol);

  const handleProtocolSelect = (protocolId: string) => {
    setSelectedProtocol(protocolId);
    setSelectedUrl("");
    setCustomUrl("");
  };

  return (
    <div className="space-y-6">
      <PageTitle
        title="Create Live Stream"
        description="Configure and launch a new live stream"
        content={
          <Link href="/dashboard/live-stream">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
        }
      />

      <div className="max-w-4xl space-y-6">
        {/* Streaming Protocol Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Radio className="h-5 w-5 text-[#00B4B4]" />
              Streaming Protocol
            </CardTitle>
            <CardDescription>Select the streaming protocol for your live stream</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {protocols.map((protocol) => {
                const Icon = protocol.icon;
                const isSelected = selectedProtocol === protocol.id;
                return (
                  <div
                    key={protocol.id}
                    onClick={() => handleProtocolSelect(protocol.id)}
                    className={cn(
                      "p-4 rounded-xl border-2 cursor-pointer transition-all",
                      isSelected
                        ? "border-[#00B4B4] bg-[#00B4B4]/5"
                        : "border-slate-200 dark:border-border hover:border-slate-300 dark:hover:border-border/80"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={cn(
                          "h-10 w-10 rounded-lg flex items-center justify-center",
                          isSelected
                            ? "bg-[#00B4B4] text-white"
                            : "bg-slate-100 dark:bg-muted text-slate-500"
                        )}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-slate-900 dark:text-foreground">
                          {protocol.name}
                        </h4>
                        <p className="text-sm text-slate-500 dark:text-muted-foreground mt-1">
                          {protocol.description}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {selectedProtocol && selectedProtocol !== "custom" && selectedProtocolData && (
              <div className="space-y-2">
                <Label>Available URLs</Label>
                <Select value={selectedUrl} onValueChange={setSelectedUrl}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a pre-allocated URL..." />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedProtocolData.urls.map((url) => (
                      <SelectItem key={url} value={url}>
                        {url}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {selectedProtocol === "custom" && (
              <div className="space-y-2">
                <Label>Custom URL</Label>
                <Input
                  placeholder="Enter your custom streaming URL..."
                  value={customUrl}
                  onChange={(e) => setCustomUrl(e.target.value)}
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* General Section */}
        <Card>
          <CardHeader>
            <CardTitle>General</CardTitle>
            <CardDescription>Basic information about your live stream</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">
                Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                placeholder="Enter stream name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="displayTitle">Display Title</Label>
              <Input
                id="displayTitle"
                placeholder="Public-facing title (optional)"
                value={displayTitle}
                onChange={(e) => setDisplayTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Enter a description to provide more details and context."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
              <p className="text-xs text-slate-500">
                Enter a description to provide more details and context.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Access Section */}
        <Card>
          <CardHeader>
            <CardTitle>Access</CardTitle>
            <CardDescription>Configure access and storage settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Access Group</Label>
              <Select value={accessGroup} onValueChange={setAccessGroup}>
                <SelectTrigger>
                  <SelectValue placeholder="Select access group..." />
                </SelectTrigger>
                <SelectContent>
                  {accessGroups.map((group) => (
                    <SelectItem key={group.id} value={group.id}>
                      {group.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-slate-500">
                Access Group responsible for managing your live stream object.
              </p>
            </div>
            <div className="space-y-2">
              <Label>Permission</Label>
              <Select value={permission} onValueChange={setPermission}>
                <SelectTrigger>
                  <SelectValue placeholder="Select permission level..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">Public</SelectItem>
                  <SelectItem value="private">Private</SelectItem>
                  <SelectItem value="restricted">Restricted</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>
                Library <span className="text-red-500">*</span>
              </Label>
              <Select value={library} onValueChange={setLibrary}>
                <SelectTrigger>
                  <SelectValue placeholder="Select library..." />
                </SelectTrigger>
                <SelectContent>
                  {libraries.map((lib) => (
                    <SelectItem key={lib.id} value={lib.id}>
                      {lib.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-slate-500">
                Select the library where your live stream object will be stored.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Advanced Section */}
        <Card>
          <CardHeader
            className="cursor-pointer hover:bg-slate-50 dark:hover:bg-muted/50 transition-colors rounded-t-xl"
            onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-[#00B4B4]" />
                <CardTitle>Advanced Settings</CardTitle>
              </div>
              {isAdvancedOpen ? (
                <ChevronDown className="h-5 w-5 text-slate-500" />
              ) : (
                <ChevronRight className="h-5 w-5 text-slate-500" />
              )}
            </div>
          </CardHeader>
          {isAdvancedOpen && (
            <CardContent className="space-y-4 pt-0">
                <div className="space-y-2">
                  <Label>Retention</Label>
                  <Select value={retention} onValueChange={setRetention}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select retention period..." />
                    </SelectTrigger>
                    <SelectContent>
                      {retentionOptions.map((option) => (
                        <SelectItem key={option.id} value={option.id}>
                          {option.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-slate-500">
                    Select a retention period for how long stream parts will exist until they are removed from the fabric.
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>Playback Encryption</Label>
                  <Select value={encryption} onValueChange={setEncryption}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select encryption option..." />
                    </SelectTrigger>
                    <SelectContent>
                      {encryptionOptions.map((option) => (
                        <SelectItem key={option.id} value={option.id}>
                          {option.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-slate-500">
                    Select a playback encryption option. Enable Clear or Digital Rights Management (DRM) copy protection during playback.
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>Playout Ladder</Label>
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-muted text-center">
                    <p className="text-sm text-slate-500">
                      No profiles are configured. Create a profile in Settings.
                    </p>
                  </div>
                </div>
              </CardContent>
          )}
        </Card>

        {/* Audio Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Volume2 className="h-5 w-5 text-[#00B4B4]" />
              Audio
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 mb-4">
              <p className="text-sm text-amber-800 dark:text-amber-200">
                To apply audio stream settings, the object must be probed first.
              </p>
            </div>
            <div className="border border-slate-200 dark:border-border rounded-xl overflow-hidden">
              <table className="w-full">
                <thead className="bg-slate-50 dark:bg-muted">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">I/O</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Index</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Codec</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Bitrate</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Label</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Language</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-slate-500 uppercase">Default</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-slate-500 uppercase">Record</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-slate-500 uppercase">Playout</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td colSpan={9} className="px-4 py-8 text-center text-slate-500">
                      No audio tracks found
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Form Actions */}
        <div className="flex justify-end gap-3 pb-6">
          <Link href="/dashboard/live-stream">
            <Button variant="outline">Cancel</Button>
          </Link>
          <Button
            className="bg-[#00B4B4] hover:bg-[#009999]"
            disabled={!name || !library || (!selectedUrl && !customUrl)}
          >
            Create Stream
          </Button>
        </div>
      </div>
    </div>
  );
}
