"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  FileText,
  Plus,
  Search,
  MoreVertical,
  Pencil,
  Copy,
  Trash2,
  ArrowLeft,
} from "lucide-react";
import PageTitle from "@/components/dashboard/layout/PageTitle";

interface Template {
  id: string;
  name: string;
  description: string;
  lastModified: string;
  usedCount: number;
  revenueSplit: number;
  analyticsShared: boolean;
  revenueShared: boolean;
  crmShared: boolean;
}

const initialTemplates: Template[] = [
  {
    id: "1",
    name: "Standard Distribution Agreement",
    description: "Basic distribution contract for VOD and streaming platforms with standard revenue sharing terms.",
    lastModified: "Jan 15, 2026",
    usedCount: 24,
    revenueSplit: 70,
    analyticsShared: true,
    revenueShared: true,
    crmShared: false,
  },
  {
    id: "2",
    name: "Exclusive Licensing Deal",
    description: "Template for exclusive territorial licensing with holdback periods and minimum guarantees.",
    lastModified: "Jan 10, 2026",
    usedCount: 12,
    revenueSplit: 60,
    analyticsShared: true,
    revenueShared: true,
    crmShared: true,
  },
  {
    id: "3",
    name: "Multi-Platform Syndication",
    description: "Syndication agreement covering multiple platforms with tiered pricing and data sharing provisions.",
    lastModified: "Dec 28, 2025",
    usedCount: 8,
    revenueSplit: 75,
    analyticsShared: true,
    revenueShared: false,
    crmShared: false,
  },
  {
    id: "4",
    name: "Co-Production Partnership",
    description: "Joint production agreement with shared rights, costs, and revenue distribution.",
    lastModified: "Dec 20, 2025",
    usedCount: 3,
    revenueSplit: 50,
    analyticsShared: true,
    revenueShared: true,
    crmShared: true,
  },
  {
    id: "5",
    name: "SVOD Window Deal",
    description: "Subscription VOD template with specific window and exclusivity terms.",
    lastModified: "Dec 15, 2025",
    usedCount: 15,
    revenueSplit: 65,
    analyticsShared: false,
    revenueShared: true,
    crmShared: false,
  },
  {
    id: "6",
    name: "Theatrical Release Agreement",
    description: "Cinema exhibition contract with box office splits and marketing commitments.",
    lastModified: "Nov 30, 2025",
    usedCount: 6,
    revenueSplit: 55,
    analyticsShared: true,
    revenueShared: true,
    crmShared: false,
  },
];

export default function SyndicationTemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>(initialTemplates);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const filteredTemplates = templates.filter(
    (template) =>
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const openEditDialog = (template: Template) => {
    setEditingTemplate(template);
    setEditName(template.name);
    setEditDescription(template.description);
    setIsEditDialogOpen(true);
  };

  const handleSaveEdit = () => {
    if (editingTemplate) {
      setTemplates(
        templates.map((t) =>
          t.id === editingTemplate.id
            ? { ...t, name: editName, description: editDescription }
            : t
        )
      );
      setIsEditDialogOpen(false);
      setEditingTemplate(null);
    }
  };

  const handleDuplicate = (template: Template) => {
    const newTemplate: Template = {
      ...template,
      id: Date.now().toString(),
      name: `${template.name} (Copy)`,
      lastModified: new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      usedCount: 0,
    };
    setTemplates([newTemplate, ...templates]);
  };

  const handleDelete = (templateId: string) => {
    setTemplates(templates.filter((t) => t.id !== templateId));
  };

  return (
    <div className="space-y-6">
      <PageTitle
        title="Contract Templates"
        description="Create and manage reusable contract templates for your distribution deals."
        content={
          <div className="flex gap-2">
            <Link href="/dashboard/syndication">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Contracts
              </Button>
            </Link>
            <Link href="/dashboard/syndication/create">
              <Button className="bg-[#00B4B4] hover:bg-[#009999]">
                <Plus className="h-4 w-4 mr-2" />
                New Template
              </Button>
            </Link>
          </div>
        }
      />

      {/* Templates Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Your Templates</CardTitle>
              <CardDescription>{templates.length} templates available</CardDescription>
            </div>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search templates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredTemplates.map((template) => (
              <Card key={template.id} className="border border-slate-200 dark:border-border">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-slate-900 dark:text-foreground text-lg">
                        {template.name}
                      </h3>
                      <p className="text-sm text-slate-500 mt-1 line-clamp-2">
                        {template.description}
                      </p>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="shrink-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEditDialog(template)}>
                          <Pencil className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDuplicate(template)}>
                          <Copy className="h-4 w-4 mr-2" />
                          Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDelete(template.id)}
                          className="text-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-slate-500 mb-4">
                    <span>Last modified: {template.lastModified}</span>
                    <span>Used {template.usedCount} times</span>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    <Badge variant="secondary" className="bg-[#00B4B4]/10 text-[#00B4B4]">
                      {template.revenueSplit}% Revenue Split
                    </Badge>
                    <Badge variant={template.analyticsShared ? "secondary" : "outline"}>
                      Analytics: {template.analyticsShared ? "Shared" : "Not Shared"}
                    </Badge>
                    <Badge variant={template.revenueShared ? "secondary" : "outline"}>
                      Revenue: {template.revenueShared ? "Shared" : "Not Shared"}
                    </Badge>
                    <Badge variant={template.crmShared ? "secondary" : "outline"}>
                      CRM: {template.crmShared ? "Shared" : "Not Shared"}
                    </Badge>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEditDialog(template)}
                    className="w-full"
                  >
                    <Pencil className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredTemplates.length === 0 && (
            <div className="text-center py-12 text-slate-500">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No templates found</p>
              <p className="text-sm">Try adjusting your search or create a new template.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Template Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Template</DialogTitle>
            <DialogDescription>
              Make changes to your contract template.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="templateName">Template Name</Label>
              <Input
                id="templateName"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="templateDescription">Description</Label>
              <Textarea
                id="templateDescription"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSaveEdit}
              className="bg-[#00B4B4] hover:bg-[#009999]"
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
