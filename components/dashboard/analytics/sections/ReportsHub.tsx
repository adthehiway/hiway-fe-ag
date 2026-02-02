"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  Download,
  Calendar,
  Clock,
  Plus,
  BarChart3,
  PieChart,
  TrendingUp,
  Mail,
  Settings,
  Play,
  CheckCircle,
} from "lucide-react";

const reportTemplates = [
  {
    id: 1,
    name: "Monthly Performance Summary",
    description: "Overview of views, revenue, and engagement metrics",
    icon: BarChart3,
    lastGenerated: "Jan 31, 2025",
    frequency: "Monthly"
  },
  {
    id: 2,
    name: "Revenue Breakdown Report",
    description: "Detailed revenue by content, region, and monetization type",
    icon: PieChart,
    lastGenerated: "Jan 28, 2025",
    frequency: "Weekly"
  },
  {
    id: 3,
    name: "Content Performance Analysis",
    description: "Deep dive into individual content metrics",
    icon: TrendingUp,
    lastGenerated: "Jan 25, 2025",
    frequency: "On-demand"
  },
  {
    id: 4,
    name: "Audience Demographics Report",
    description: "Geographic and device breakdown of viewers",
    icon: BarChart3,
    lastGenerated: "Jan 20, 2025",
    frequency: "Monthly"
  },
];

const scheduledReports = [
  { name: "Weekly Executive Summary", nextRun: "Feb 3, 2025", recipients: 3, status: "active" },
  { name: "Monthly Revenue Report", nextRun: "Feb 1, 2025", recipients: 5, status: "active" },
  { name: "Quarterly Performance Review", nextRun: "Apr 1, 2025", recipients: 8, status: "active" },
];

const recentReports = [
  { name: "Monthly Performance - January 2025", date: "Jan 31, 2025", size: "2.4 MB", format: "PDF" },
  { name: "Revenue Breakdown - Week 4", date: "Jan 28, 2025", size: "1.8 MB", format: "PDF" },
  { name: "Content Analysis - Q4 2024", date: "Jan 15, 2025", size: "4.2 MB", format: "PDF" },
  { name: "Audience Report - December", date: "Jan 5, 2025", size: "3.1 MB", format: "PDF" },
];

export function ReportsHubSection() {
  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-foreground">Reports Hub</h2>
          <p className="text-sm text-slate-500 dark:text-muted-foreground">Generate, schedule, and download analytics reports</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Calendar className="h-4 w-4 mr-2" />
            Schedule Report
          </Button>
          <Button className="bg-[#00B4B4] hover:bg-[#009999]">
            <Plus className="h-4 w-4 mr-2" />
            Create Report
          </Button>
        </div>
      </div>

      {/* Report Templates */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-[#00B4B4]" />
            Report Templates
          </CardTitle>
          <CardDescription>Quick-generate reports from templates</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            {reportTemplates.map((template) => {
              const Icon = template.icon;
              return (
                <div
                  key={template.id}
                  className="p-4 border border-slate-200 dark:border-border rounded-xl hover:border-[#00B4B4] transition-colors cursor-pointer group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="h-10 w-10 rounded-xl bg-[#00B4B4]/10 flex items-center justify-center">
                      <Icon className="h-5 w-5 text-[#00B4B4]" />
                    </div>
                    <Badge variant="secondary">{template.frequency}</Badge>
                  </div>
                  <h4 className="font-medium text-slate-900 dark:text-foreground mb-1">{template.name}</h4>
                  <p className="text-sm text-slate-500 dark:text-muted-foreground mb-3">{template.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400">Last: {template.lastGenerated}</span>
                    <Button size="sm" variant="ghost" className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <Play className="h-3 w-3 mr-1" /> Generate
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-6">
        {/* Scheduled Reports */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-[#00B4B4]" />
              Scheduled Reports
            </CardTitle>
            <CardDescription>Automated report delivery</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {scheduledReports.map((report, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-muted rounded-xl">
                  <div>
                    <div className="font-medium text-slate-900 dark:text-foreground">{report.name}</div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" /> {report.nextRun}
                      </span>
                      <span className="flex items-center gap-1">
                        <Mail className="h-3 w-3" /> {report.recipients} recipients
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-green-500/20 text-green-600">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Active
                    </Badge>
                    <Button size="icon" variant="ghost">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Reports */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5 text-[#00B4B4]" />
              Recent Reports
            </CardTitle>
            <CardDescription>Download generated reports</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentReports.map((report, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-muted rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-red-500/10 flex items-center justify-center">
                      <FileText className="h-5 w-5 text-red-500" />
                    </div>
                    <div>
                      <div className="font-medium text-slate-900 dark:text-foreground text-sm">{report.name}</div>
                      <div className="text-xs text-slate-500">{report.date} · {report.size}</div>
                    </div>
                  </div>
                  <Button size="sm" variant="outline">
                    <Download className="h-3 w-3 mr-1" /> Download
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
