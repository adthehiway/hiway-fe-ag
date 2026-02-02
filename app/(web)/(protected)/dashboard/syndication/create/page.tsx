"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FileText,
  DollarSign,
  Eye,
} from "lucide-react";
import PageTitle from "@/components/dashboard/layout/PageTitle";

export default function CreateSyndicationContractPage() {
  const [contractName, setContractName] = useState("");
  const [description, setDescription] = useState("");
  const [revenueSplit, setRevenueSplit] = useState([30]);
  const [feeBasis, setFeeBasis] = useState("gross");
  const [payoutTiming, setPayoutTiming] = useState("monthly");
  const [shareAnalytics, setShareAnalytics] = useState(true);
  const [shareRevenue, setShareRevenue] = useState(true);
  const [shareCRM, setShareCRM] = useState(false);

  return (
    <div className="space-y-6">
      <PageTitle
        title="New Syndication Contract"
        description="Create a distribution agreement between parties."
        content={
          <div className="flex gap-2">
            <Link href="/dashboard/syndication">
              <Button variant="outline">Cancel</Button>
            </Link>
            <Button variant="outline">Save Draft</Button>
          </div>
        }
      />

      <div className="grid grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="col-span-2 space-y-6">
          {/* Contract Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-[#00B4B4]" />
                Contract Details
              </CardTitle>
              <CardDescription>Give your contract a name and description.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="contractName">Contract Name</Label>
                <Input
                  id="contractName"
                  placeholder="e.g., Global Distribution Agreement"
                  value={contractName}
                  onChange={(e) => setContractName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Briefly describe the purpose and scope of this contract..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Commercial Terms */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-[#00B4B4]" />
                Commercial Terms
              </CardTitle>
              <CardDescription>Define revenue splits and payout behaviour.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <Label>Revenue Split</Label>
                <div className="flex items-center justify-between text-sm">
                  <div>
                    <span className="font-medium">Distributor (You)</span>
                    <span className="ml-2 text-[#00B4B4] font-bold">{revenueSplit[0]}%</span>
                  </div>
                  <div>
                    <span className="font-medium">Producer</span>
                    <span className="ml-2 text-[#00B4B4] font-bold">{100 - revenueSplit[0]}%</span>
                  </div>
                </div>
                <Slider
                  value={revenueSplit}
                  onValueChange={setRevenueSplit}
                  max={100}
                  step={5}
                  className="w-full"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Fee Basis</Label>
                  <Select value={feeBasis} onValueChange={setFeeBasis}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gross">Gross Revenue</SelectItem>
                      <SelectItem value="net">Net Revenue</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-slate-500">Basis for calculating the split.</p>
                </div>
                <div className="space-y-2">
                  <Label>Payout Timing</Label>
                  <Select value={payoutTiming} onValueChange={setPayoutTiming}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">Monthly Automated</SelectItem>
                      <SelectItem value="quarterly">Quarterly</SelectItem>
                      <SelectItem value="annually">Annually</SelectItem>
                      <SelectItem value="manual">Manual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Data Sharing */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5 text-[#00B4B4]" />
                Data Sharing
              </CardTitle>
              <CardDescription>Resolve "who can see what" permissions.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-muted rounded-xl">
                <div>
                  <div className="font-medium text-slate-900 dark:text-foreground">Viewer Analytics</div>
                  <div className="text-sm text-slate-500">Counterparty can see your performance stats.</div>
                </div>
                <Switch checked={shareAnalytics} onCheckedChange={setShareAnalytics} />
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-muted rounded-xl">
                <div>
                  <div className="font-medium text-slate-900 dark:text-foreground">Revenue Figures</div>
                  <div className="text-sm text-slate-500">Counterparty can see gross and net sales.</div>
                </div>
                <Switch checked={shareRevenue} onCheckedChange={setShareRevenue} />
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-muted rounded-xl">
                <div>
                  <div className="font-medium text-slate-900 dark:text-foreground">CRM & Customer Data</div>
                  <div className="text-sm text-slate-500">Share customer data with counterparty.</div>
                </div>
                <Switch checked={shareCRM} onCheckedChange={setShareCRM} />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Summary Sidebar */}
        <div className="col-span-1">
          <Card className="sticky top-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Contract Summary</CardTitle>
                <Badge variant="secondary">draft</Badge>
              </div>
              <CardDescription>ID: CNT-{new Date().getFullYear()}-001</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-xs text-slate-500">Contract Name</Label>
                <p className="font-medium text-slate-900 dark:text-foreground">
                  {contractName || "Not set"}
                </p>
              </div>

              <div>
                <Label className="text-xs text-slate-500">Commercial Terms</Label>
                <div className="grid grid-cols-2 gap-2 mt-1 text-sm">
                  <div>
                    <span className="text-slate-500">Distributor</span>
                    <p className="font-bold text-[#00B4B4]">{revenueSplit[0]}%</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Producer</span>
                    <p className="font-bold text-[#00B4B4]">{100 - revenueSplit[0]}%</p>
                  </div>
                </div>
                <div className="mt-2 text-sm">
                  <span className="text-slate-500">Basis: </span>
                  <span className="capitalize">{feeBasis}</span>
                </div>
              </div>

              <div>
                <Label className="text-xs text-slate-500">Data Sharing</Label>
                <div className="space-y-1 mt-1 text-sm">
                  <p>Analytics: {shareAnalytics ? "On" : "Off"}</p>
                  <p>Revenue: {shareRevenue ? "On" : "Off"}</p>
                  <p>CRM: {shareCRM ? "On" : "Off"}</p>
                </div>
              </div>

              <Button className="w-full bg-[#00B4B4] hover:bg-[#009999]">
                Save Template
              </Button>

              <p className="text-xs text-slate-400 text-center">
                Last edited today at {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
