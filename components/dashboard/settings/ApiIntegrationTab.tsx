"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import InputEnhanced from "@/components/ui/input-enhanced";
import { TabsContent } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Copy, ExternalLink, Key, Plus, Trash2, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "react-toastify";
import { useCompany } from "@/hooks/useCompanies";
import {
  useApiKeys,
  useCreateApiKey,
  useRevokeApiKey,
} from "@/hooks/useApiKeys";
import { ApiKeyType, ApiKeyResponseDto } from "@/types";
import { format } from "date-fns";
import { getApiDocumentationUrl } from "@/lib/utils";

const AVAILABLE_SCOPES: { value: string; label: string }[] = [
  { value: "read:media", label: "Read Media" },
];

const ApiIntegrationTab = () => {
  const { data: company } = useCompany();
  const { data: apiKeys, isLoading } = useApiKeys(company?.id);
  const createApiKeyMutation = useCreateApiKey();
  const revokeApiKeyMutation = useRevokeApiKey();

  const [newTokenName, setNewTokenName] = useState("");
  const [selectedScopes, setSelectedScopes] = useState<string[]>([
    "read:media",
  ]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [keyToDelete, setKeyToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [newApiKey, setNewApiKey] = useState<{
    apiKey: string;
    name: string;
  } | null>(null);

  const formatKeyId = (keyPrefix: string, keyId: string): string => {
    const prefix = keyPrefix.replace("hwy_", "").toUpperCase();
    const maskedId =
      keyId.length > 8
        ? `${keyId.slice(0, 4)}...${keyId.slice(-4)}`
        : "•".repeat(keyId.length);
    return `${prefix} • ${maskedId}`;
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  const handleToggleScope = (scope: string) => {
    setSelectedScopes((prev) =>
      prev.includes(scope) ? prev.filter((s) => s !== scope) : [...prev, scope]
    );
  };

  const handleGenerateToken = () => {
    if (!newTokenName.trim()) {
      toast.error("Please enter a token name");
      return;
    }

    if (selectedScopes.length === 0) {
      toast.error("Please select at least one scope");
      return;
    }

    if (!company?.id) {
      toast.error("Company not found");
      return;
    }

    createApiKeyMutation.mutate(
      {
        companyId: company.id,
        dto: {
          type:
            process.env.NEXT_PUBLIC_ENVIRONMENT === "production"
              ? ApiKeyType.LIVE
              : ApiKeyType.TEST,
          name: newTokenName.trim(),
          scopes: selectedScopes,
        },
      },
      {
        onSuccess: (data) => {
          setNewApiKey({
            apiKey: data.apiKey,
            name: data.name,
          });
          setNewTokenName("");
          setSelectedScopes(["read:media"]);
          setIsCreateModalOpen(false);
        },
      }
    );
  };

  const handleDeleteToken = (keyId: string, keyName: string) => {
    setKeyToDelete({ id: keyId, name: keyName });
  };

  const confirmDeleteToken = () => {
    if (!keyToDelete || !company?.id) {
      toast.error("Company not found");
      return;
    }

    revokeApiKeyMutation.mutate(
      {
        companyId: company.id,
        keyId: keyToDelete.id,
      },
      {
        onSuccess: () => {
          setKeyToDelete(null);
        },
      }
    );
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Never";
    try {
      return format(new Date(dateString), "MMM dd, yyyy");
    } catch {
      return dateString;
    }
  };

  return (
    <TabsContent value="api-integration" className="space-y-3">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="w-5 h-5" />
            API Keys
          </CardTitle>
          <CardDescription>
            Create and manage API keys for programmatic access
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Existing Keys */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Existing API Keys</h3>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : !apiKeys || apiKeys.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No API keys created yet
              </p>
            ) : (
              <div className="space-y-4">
                {apiKeys.map((key) => (
                  <div
                    key={key.id}
                    className="p-4 border rounded-lg bg-secondary/30 space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium text-sm">{key.name}</p>
                          <span
                            className={`text-xs px-2 py-0.5 rounded ${
                              key.keyPrefix === "hwy_live"
                                ? "bg-red-500/20 text-red-600 dark:text-red-400"
                                : "bg-blue-500/20 text-blue-600 dark:text-blue-400"
                            }`}
                          >
                            {key.keyPrefix === "hwy_live" ? "LIVE" : "TEST"}
                          </span>
                          {key.revokedAt && (
                            <span className="text-xs px-2 py-0.5 rounded bg-destructive/20 text-destructive">
                              Revoked
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mb-2">
                          Created: {formatDate(key.createdAt)}
                          {key.lastUsedAt && (
                            <> • Last used: {formatDate(key.lastUsedAt)}</>
                          )}
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {key.scopes.map((scope) => (
                            <span
                              key={scope}
                              className="text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground"
                            >
                              {scope}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 px-3 py-2 bg-muted rounded text-sm flex items-center gap-2">
                        <span className="text-muted-foreground font-medium">
                          {formatKeyId(key.keyPrefix, key.id)}
                        </span>
                        <span className="text-xs text-muted-foreground/70">
                          (Key ID)
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => handleDeleteToken(key.id, key.name)}
                        title="Revoke key"
                        disabled={!!key.revokedAt}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Create New Key Button */}
          <div className="pt-4 border-t">
            <Button
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-teal-500 hover:bg-teal-600"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create API Key
            </Button>
          </div>

          {/* API Documentation */}
          <div className="space-y-2 pt-4 border-t">
            <h3 className="text-sm font-medium">API Documentation</h3>
            <p className="text-xs text-muted-foreground">
              Learn how to integrate with our API
            </p>
            <Button variant="outline" size="sm" asChild>
              <a
                href={getApiDocumentationUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2"
              >
                View Documentation
                <ExternalLink className="w-4 h-4" />
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Create API Key Modal */}
      <Dialog
        open={isCreateModalOpen}
        onOpenChange={(open) => {
          setIsCreateModalOpen(open);
          if (!open) {
            setNewTokenName("");
            setSelectedScopes(["read:media"]);
          }
        }}
      >
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create New API Key</DialogTitle>
            <DialogDescription>
              Configure your API key settings and permissions
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium mb-2 block">Key Name</Label>
              <InputEnhanced
                placeholder="Key name (e.g., Production API)"
                value={newTokenName}
                onChange={(e) => setNewTokenName(e.target.value)}
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Permissions</Label>
                <span className="text-xs text-muted-foreground">
                  {selectedScopes.length} selected
                </span>
              </div>
              <div className="border rounded-lg p-3 space-y-2 bg-secondary/30">
                {AVAILABLE_SCOPES.map((scope) => (
                  <div
                    key={scope.value}
                    className="flex items-center space-x-2"
                  >
                    <Checkbox
                      id={`modal-${scope.value}`}
                      checked={selectedScopes.includes(scope.value)}
                      onCheckedChange={() => handleToggleScope(scope.value)}
                    />
                    <Label
                      htmlFor={`modal-${scope.value}`}
                      className="text-sm font-normal cursor-pointer flex-1"
                    >
                      {scope.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => setIsCreateModalOpen(false)}
                disabled={createApiKeyMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                onClick={handleGenerateToken}
                disabled={createApiKeyMutation.isPending}
                className="bg-teal-500 hover:bg-teal-600"
              >
                {createApiKeyMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Create API Key
                  </>
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              The API key will be shown once. Make sure to copy it to a secure
              location.
            </p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete API Key Alert Modal */}
      <AlertDialog
        open={!!keyToDelete}
        onOpenChange={(open) => !open && setKeyToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Revoke API Key</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to revoke the API key{" "}
              <strong>"{keyToDelete?.name}"</strong>? This action cannot be
              undone and the key will immediately stop working.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={revokeApiKeyMutation.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteToken}
              disabled={revokeApiKeyMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {revokeApiKeyMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Revoking...
                </>
              ) : (
                "Revoke Key"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* New API Key Created Modal */}
      <Dialog open={!!newApiKey} onOpenChange={() => setNewApiKey(null)}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>API Key Created Successfully</DialogTitle>
            <DialogDescription>
              Your API key has been created. Make sure to copy it now as it
              won't be shown again.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium mb-2 block">
                Key Name: {newApiKey?.name}
              </Label>
              <div className="flex items-center gap-2">
                <code className="flex-1 px-3 py-2 bg-muted rounded text-sm font-mono break-all">
                  {newApiKey?.apiKey}
                </code>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() =>
                    copyToClipboard(newApiKey?.apiKey || "", "API Key")
                  }
                  title="Copy API key"
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
              <p className="text-sm text-yellow-600 dark:text-yellow-400">
                ⚠️ This API key will only be shown once. Please save it
                securely.
              </p>
            </div>
            <Button
              onClick={() => setNewApiKey(null)}
              className="w-full bg-teal-500 hover:bg-teal-600"
            >
              I've saved the key
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </TabsContent>
  );
};

export default ApiIntegrationTab;
