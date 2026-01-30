"use client";

import { useState } from "react";
import { Resource, Action, Permission } from "@/lib/permissions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { X, ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Modal } from "@/components/ui/modal";

const RESOURCE_LABELS: Record<Resource, string> = {
  dashboard: "Dashboard",
  company: "Company",
  media: "Media",
  smartlink: "Smart Links",
  smartroom: "Smart Rooms",
  crm: "CRM",
  analytics: "Analytics",
  monetization: "Monetization",
  billing: "Billing",
  events: "Events",
};

const ACTION_LABELS: Record<Action, string> = {
  read: "Read",
  write: "Write",
  delete: "Delete",
  update: "Update",
};

interface PermissionSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  value: Permission[];
  onChange: (permissions: Permission[]) => void;
}

export function PermissionSelectorModal({
  isOpen,
  onClose,
  value,
  onChange,
}: PermissionSelectorModalProps) {
  const [expandedResources, setExpandedResources] = useState<Set<Resource>>(
    new Set()
  );

  const toggleResource = (resource: Resource) => {
    const newExpanded = new Set(expandedResources);
    if (newExpanded.has(resource)) {
      newExpanded.delete(resource);
    } else {
      newExpanded.add(resource);
    }
    setExpandedResources(newExpanded);
  };

  const togglePermission = (resource: Resource, action: Action) => {
    const permission = `${resource}:${action}` as Permission;
    if (value.includes(permission)) {
      onChange(value.filter((p) => p !== permission));
    } else {
      const filtered = value.filter(
        (p) => p !== `${resource}:*` && p !== permission
      );
      onChange([...filtered, permission]);
    }
  };

  const hasPermission = (resource: Resource, action: Action): boolean => {
    return value.includes(`${resource}:${action}` as Permission);
  };

  const hasAllPermissions = (resource: Resource): boolean => {
    return value.includes(`${resource}:*` as Permission);
  };

  const toggleAllPermissions = (resource: Resource) => {
    if (hasAllPermissions(resource)) {
      // Remove all permissions for this resource
      onChange(value.filter((p) => !p.startsWith(`${resource}:`)));
    } else {
      // Add wildcard permission for this resource
      const otherPermissions = value.filter(
        (p) => !p.startsWith(`${resource}:`)
      );
      onChange([...otherPermissions, `${resource}:*` as Permission]);
    }
  };

  const removePermission = (permission: Permission) => {
    onChange(value.filter((p) => p !== permission));
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Select Permissions"
      description="Choose the permissions for this collaborator. At least one permission is required."
      className="w-[min(90vw,600px)]"
    >
      <div className="space-y-4">
        {/* Selected Permissions */}
        {value.length > 0 && (
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
              Selected Permissions ({value.length})
            </label>
            <div className="flex flex-wrap gap-1.5 p-2 bg-muted/30 rounded-md border border-border min-h-[40px]">
              {value.map((permission) => (
                <Badge
                  key={permission}
                  variant="secondary"
                  className="flex items-center gap-1 pr-1 text-xs h-6"
                >
                  <span className="text-[11px]">{permission}</span>
                  <button
                    type="button"
                    onClick={() => removePermission(permission)}
                    className="ml-0.5 hover:bg-muted-foreground/20 rounded-full p-0.5"
                  >
                    <X className="w-2.5 h-2.5" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Permission Selector */}
        <div>
          <label className="text-sm font-medium text-white mb-2 block">
            Available Permissions
          </label>
          <div className="border border-border rounded-md bg-muted/20 divide-y divide-border max-h-[400px] overflow-y-auto">
            {Object.keys(RESOURCE_LABELS).map((resource) => {
              const isExpanded = expandedResources.has(resource as Resource);
              const hasAll = hasAllPermissions(resource as Resource);
              const hasAny =
                Object.keys(ACTION_LABELS).some((action) =>
                  hasPermission(resource as Resource, action as Action)
                ) || hasAll;

              return (
                <div key={resource} className="bg-card">
                  <button
                    type="button"
                    onClick={() => toggleResource(resource as Resource)}
                    className={cn(
                      "w-full flex items-center justify-between p-2.5 hover:bg-muted/30 transition-colors",
                      hasAny && "bg-accent/10"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                      )}
                      <span className="text-sm font-medium text-white">
                        {RESOURCE_LABELS[resource as Resource]}
                      </span>
                      {hasAll && (
                        <Badge variant="outline" className="text-xs h-5 px-1.5">
                          All
                        </Badge>
                      )}
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleAllPermissions(resource as Resource);
                      }}
                      className="h-6 text-xs px-2"
                    >
                      {hasAll ? "Clear" : "All"}
                    </Button>
                  </button>
                  {isExpanded && (
                    <div className="p-2.5 pt-0 border-t border-border bg-muted/10">
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5">
                        {Object.keys(ACTION_LABELS).map((action) => {
                          const permission =
                            `${resource}:${action}` as Permission;
                          const isSelected =
                            hasPermission(
                              resource as Resource,
                              action as Action
                            ) || hasAll;

                          return (
                            <label
                              key={action}
                              className={cn(
                                "flex items-center gap-1.5 p-1.5 rounded text-xs cursor-pointer transition-colors",
                                isSelected
                                  ? "bg-accent/20 text-accent-foreground"
                                  : "hover:bg-muted/50"
                              )}
                            >
                              <Checkbox
                                checked={isSelected}
                                onCheckedChange={(checked) => {
                                  if (checked !== isSelected) {
                                    togglePermission(
                                      resource as Resource,
                                      action as Action
                                    );
                                  }
                                }}
                                className="w-3.5 h-3.5"
                              />
                              <span className="text-[11px]">
                                {ACTION_LABELS[action as unknown as Action]}
                              </span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          {value.length === 0 && (
            <p className="text-xs text-muted-foreground mt-1.5">
              At least one permission is required
            </p>
          )}
        </div>

        <div className="flex gap-3 justify-end pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Done
          </Button>
        </div>
      </div>
    </Modal>
  );
}
