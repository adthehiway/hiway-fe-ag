"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Users,
  Search,
  FileText,
  Mail,
  Calendar,
  Building2,
  UserPlus,
} from "lucide-react";
import PageTitle from "@/components/dashboard/layout/PageTitle";

interface Contact {
  id: string;
  name: string;
  email: string;
  company: string;
  type: string;
}

const mockContacts: Contact[] = [
  { id: "1", name: "Sarah Chen", email: "sarah.chen@netflix.com", company: "Netflix Inc.", type: "Distributor" },
  { id: "2", name: "Michael Rodriguez", email: "m.rodriguez@amazon.com", company: "Amazon Prime Video", type: "Distributor" },
  { id: "3", name: "Emma Thompson", email: "e.thompson@hulu.com", company: "Hulu", type: "Aggregator" },
  { id: "4", name: "James Wilson", email: "j.wilson@canal.fr", company: "Canal+", type: "Distributor" },
  { id: "5", name: "Lisa Park", email: "l.park@tencent.com", company: "Tencent Video", type: "Distributor" },
  { id: "6", name: "David Brown", email: "d.brown@discovery.com", company: "Discovery+", type: "Aggregator" },
  { id: "7", name: "Anna Mueller", email: "a.mueller@viaplay.com", company: "Viaplay", type: "Distributor" },
  { id: "8", name: "Robert Kim", email: "r.kim@stan.com.au", company: "Stan", type: "Distributor" },
  { id: "9", name: "Sophie Martin", email: "s.martin@tf1.fr", company: "TF1", type: "Distributor" },
  { id: "10", name: "John Davis", email: "j.davis@lionsgate.com", company: "Lionsgate", type: "Sales Agent" },
  { id: "11", name: "Maria Garcia", email: "m.garcia@wildfilms.com", company: "Wild Films Productions", type: "Producer" },
  { id: "12", name: "Thomas Lee", email: "t.lee@bankside.com", company: "Bankside Films", type: "Sales Agent" },
  { id: "13", name: "Jennifer White", email: "j.white@a24.com", company: "A24", type: "Producer" },
  { id: "14", name: "Chris Johnson", email: "c.johnson@endeavor.com", company: "Endeavor Content", type: "Agency" },
  { id: "15", name: "Rachel Green", email: "r.green@filmnation.com", company: "FilmNation", type: "Sales Agent" },
];

const mockTemplates = [
  { id: "1", name: "Standard Distribution Agreement" },
  { id: "2", name: "Exclusive Licensing Deal" },
  { id: "3", name: "Multi-Platform Syndication" },
  { id: "4", name: "Co-Production Partnership" },
  { id: "5", name: "SVOD Window Deal" },
];

export default function InviteSyndicationPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [entryMode, setEntryMode] = useState<"crm" | "manual">("crm");
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [startDate, setStartDate] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [emailSubject, setEmailSubject] = useState("You've been invited to review a distribution contract");
  const [emailMessage, setEmailMessage] = useState(
    "Hi,\n\nWe're excited to share this distribution agreement with you. Please review the terms and let us know if you have any questions."
  );

  const filteredContacts = mockContacts.filter(
    (contact) =>
      contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleContact = (id: string) => {
    setSelectedContacts((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const selectAllVisible = () => {
    const visibleIds = filteredContacts.map((c) => c.id);
    const allSelected = visibleIds.every((id) => selectedContacts.includes(id));
    if (allSelected) {
      setSelectedContacts((prev) => prev.filter((id) => !visibleIds.includes(id)));
    } else {
      setSelectedContacts((prev) => [...new Set([...prev, ...visibleIds])]);
    }
  };

  const typeColors: Record<string, string> = {
    Distributor: "bg-blue-500/20 text-blue-600",
    Aggregator: "bg-purple-500/20 text-purple-600",
    "Sales Agent": "bg-orange-500/20 text-orange-600",
    Producer: "bg-green-500/20 text-green-600",
    Agency: "bg-pink-500/20 text-pink-600",
  };

  return (
    <div className="space-y-6">
      <PageTitle
        title="Send Contract Invitations"
        description="Invite partners to review and sign distribution agreements."
        content={null}
      />

      <div className="grid grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="col-span-2 space-y-6">
          {/* Recipients */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-[#00B4B4]" />
                Recipients
              </CardTitle>
              <CardDescription>Search your B2B contacts or manually enter email addresses.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Entry Mode Toggle */}
              <div className="flex gap-2">
                <Button
                  variant={entryMode === "crm" ? "default" : "outline"}
                  onClick={() => setEntryMode("crm")}
                  className={entryMode === "crm" ? "bg-[#00B4B4] hover:bg-[#009999]" : ""}
                >
                  <Search className="h-4 w-4 mr-2" />
                  Search B2B CRM
                </Button>
                <Button
                  variant={entryMode === "manual" ? "default" : "outline"}
                  onClick={() => setEntryMode("manual")}
                  className={entryMode === "manual" ? "bg-[#00B4B4] hover:bg-[#009999]" : ""}
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Manual Entry
                </Button>
              </div>

              {entryMode === "crm" ? (
                <>
                  {/* Search Input */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      placeholder="Search contacts by name, email, company, or type..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  {/* Select All */}
                  <div className="flex justify-between items-center">
                    <Button variant="ghost" size="sm" onClick={selectAllVisible}>
                      Select All Visible
                    </Button>
                    <span className="text-sm text-slate-500">
                      {selectedContacts.length} selected
                    </span>
                  </div>

                  {/* Contacts List */}
                  <div className="max-h-[400px] overflow-y-auto space-y-2 border border-slate-200 dark:border-border rounded-xl p-2">
                    {filteredContacts.map((contact) => (
                      <div
                        key={contact.id}
                        className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors ${
                          selectedContacts.includes(contact.id)
                            ? "bg-[#00B4B4]/10 border border-[#00B4B4]"
                            : "bg-slate-50 dark:bg-muted hover:bg-slate-100 dark:hover:bg-muted/80"
                        }`}
                        onClick={() => toggleContact(contact.id)}
                      >
                        <Checkbox
                          checked={selectedContacts.includes(contact.id)}
                          onCheckedChange={() => toggleContact(contact.id)}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-slate-900 dark:text-foreground">{contact.name}</div>
                          <div className="text-sm text-slate-500 truncate">{contact.email}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-slate-600 dark:text-muted-foreground">{contact.company}</div>
                          <Badge className={typeColors[contact.type] || "bg-slate-500/20 text-slate-600"}>
                            {contact.type}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-slate-500">Enter email addresses manually, one per line.</p>
                  <Textarea
                    placeholder="partner@company.com&#10;distributor@platform.com"
                    rows={6}
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Select Contract */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-[#00B4B4]" />
                Select Contract
              </CardTitle>
              <CardDescription>Choose a contract template and set the contract dates.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Contract Template</Label>
                <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                  <SelectTrigger>
                    <SelectValue placeholder="Search and select a contract template..." />
                  </SelectTrigger>
                  <SelectContent>
                    {mockTemplates.map((template) => (
                      <SelectItem key={template.id} value={template.id}>
                        {template.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Start Date</Label>
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Expiry Date</Label>
                  <Input
                    type="date"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Email Message */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-[#00B4B4]" />
                Email Message
              </CardTitle>
              <CardDescription>Customize the invitation email.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Subject Line</Label>
                <Input
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Message</Label>
                <Textarea
                  value={emailMessage}
                  onChange={(e) => setEmailMessage(e.target.value)}
                  rows={4}
                />
              </div>
              <p className="text-xs text-slate-500">
                The contract link will be automatically appended to the email.
              </p>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Link href="/dashboard/syndication">
              <Button variant="outline">Cancel</Button>
            </Link>
            <Button
              className="bg-[#00B4B4] hover:bg-[#009999]"
              disabled={selectedContacts.length === 0}
            >
              Send Invitations ({selectedContacts.length})
            </Button>
          </div>
        </div>

        {/* Summary Sidebar */}
        <div className="col-span-1">
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle>Invitation Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-xs text-slate-500">Recipients</Label>
                {selectedContacts.length > 0 ? (
                  <div className="space-y-1 mt-1">
                    {selectedContacts.slice(0, 5).map((id) => {
                      const contact = mockContacts.find((c) => c.id === id);
                      return contact ? (
                        <div key={id} className="text-sm flex items-center gap-2">
                          <Building2 className="h-3 w-3 text-slate-400" />
                          <span>{contact.company}</span>
                        </div>
                      ) : null;
                    })}
                    {selectedContacts.length > 5 && (
                      <p className="text-sm text-slate-500">
                        +{selectedContacts.length - 5} more
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500 mt-1">No recipients added yet</p>
                )}
              </div>

              <div>
                <Label className="text-xs text-slate-500">Contract</Label>
                <p className="font-medium text-slate-900 dark:text-foreground mt-1">
                  {selectedTemplate
                    ? mockTemplates.find((t) => t.id === selectedTemplate)?.name
                    : "Not selected"}
                </p>
              </div>

              <div>
                <Label className="text-xs text-slate-500">Start Date</Label>
                <p className="font-medium text-slate-900 dark:text-foreground mt-1">
                  {startDate || "Not set"}
                </p>
              </div>

              <div>
                <Label className="text-xs text-slate-500">Expiry Date</Label>
                <p className="font-medium text-slate-900 dark:text-foreground mt-1">
                  {expiryDate || "Not set"}
                </p>
              </div>

              {selectedContacts.length === 0 && (
                <div className="text-center py-4 text-slate-500">
                  <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Add recipients</p>
                  <p className="text-xs">Search your CRM or add emails manually</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
