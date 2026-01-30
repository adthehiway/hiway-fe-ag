"use client";

import { useState, useEffect } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import InputEnhanced from "@/components/ui/input-enhanced";
import { useCreateInvitation } from "@/hooks/useInvitations";
import { CompanyRole } from "@/types";
import { Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { PermissionSelectorModal } from "./PermissionSelectorModal";
import { Permission } from "@/lib/permissions";
import { Settings } from "lucide-react";

interface InviteMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  companyId: string;
  userRole: CompanyRole;
}

const roleOptions = [
  { value: CompanyRole.MEMBER, label: "Member" },
  { value: CompanyRole.ADMIN, label: "Admin" },
  { value: CompanyRole.COLLABORATOR, label: "Collaborator" },
];

// Only owners can invite other owners
const ownerRoleOption = { value: CompanyRole.OWNER, label: "Owner" };

export default function InviteMemberModal({
  isOpen,
  onClose,
  companyId,
  userRole,
}: InviteMemberModalProps) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<CompanyRole>(CompanyRole.MEMBER);
  const [note, setNote] = useState("");
  const [customPermissions, setCustomPermissions] = useState<Permission[]>([]);
  const [memberExpiresAt, setMemberExpiresAt] = useState("");
  const [isPermissionModalOpen, setIsPermissionModalOpen] = useState(false);
  const [errors, setErrors] = useState<{ customPermissions?: string }>({});
  const { mutate: createInvitation, isPending } = useCreateInvitation();

  // Reset custom permissions and expiry when role changes
  useEffect(() => {
    if (role !== CompanyRole.COLLABORATOR) {
      setCustomPermissions([]);
      setMemberExpiresAt("");
      setErrors({});
    }
  }, [role]);

  const availableRoles =
    userRole === CompanyRole.OWNER
      ? [...roleOptions, ownerRoleOption]
      : roleOptions;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    // Validate custom permissions for COLLABORATOR
    if (role === CompanyRole.COLLABORATOR) {
      if (customPermissions.length === 0) {
        setErrors({
          customPermissions:
            "At least one custom permission is required for collaborators",
        });
        return;
      }

      // Validate expiry date if provided
      if (memberExpiresAt && new Date(memberExpiresAt) <= new Date()) {
        setErrors({
          customPermissions: "Expiry date must be in the future",
        });
        return;
      }
    }

    setErrors({});

    createInvitation(
      {
        companyId,
        data: {
          email: email.trim(),
          role,
          note: note.trim() || undefined,
          ...(role === CompanyRole.COLLABORATOR && {
            customPermissions: customPermissions,
            memberExpiresAt: memberExpiresAt || undefined,
          }),
        },
      },
      {
        onSuccess: () => {
          setEmail("");
          setRole(CompanyRole.MEMBER);
          setNote("");
          setCustomPermissions([]);
          setMemberExpiresAt("");
          setErrors({});
          onClose();
        },
      }
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Invite Team Member"
      description="Send an invitation to join your company. The invitation will expire in 7 days."
      className="w-[min(90vw,500px)]"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-sm font-medium text-white mb-2 block">
            Email Address
          </label>
          <InputEnhanced
            type="email"
            placeholder="user@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isPending}
          />
        </div>

        <div>
          <label className="text-sm font-medium text-white mb-2 block">
            Role
          </label>
          <Select
            value={role}
            onValueChange={(value) => setRole(value as CompanyRole)}
            disabled={isPending}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a role" />
            </SelectTrigger>
            <SelectContent>
              {availableRoles.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground mt-1">
            {role === CompanyRole.OWNER && "Owners have full company control"}
            {role === CompanyRole.ADMIN &&
              "Admins can manage members and settings"}
            {role === CompanyRole.MEMBER && "Members have standard access"}
            {role === CompanyRole.COLLABORATOR &&
              "Collaborators have limited resource access"}
          </p>
        </div>

        {/* Custom Permissions for COLLABORATOR */}
        {role === CompanyRole.COLLABORATOR && (
          <div>
            <label className="text-sm font-medium text-white mb-2 block">
              Custom Permissions *
            </label>
            <div className="space-y-2">
              {customPermissions.length > 0 ? (
                <div className="flex flex-wrap gap-1.5 p-2 bg-muted/30 rounded-md border border-border min-h-[40px]">
                  {customPermissions.map((permission) => (
                    <Badge
                      key={permission}
                      variant="secondary"
                      className="text-xs h-6"
                    >
                      {permission}
                    </Badge>
                  ))}
                </div>
              ) : (
                <div className="p-3 bg-muted/20 rounded-md border border-border text-sm text-muted-foreground">
                  No permissions selected
                </div>
              )}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsPermissionModalOpen(true)}
                disabled={isPending}
                className="w-full"
              >
                <Settings className="w-4 h-4 mr-2" />
                {customPermissions.length > 0
                  ? `Manage Permissions (${customPermissions.length})`
                  : "Select Permissions"}
              </Button>
              {errors.customPermissions && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.customPermissions}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Member Expiry Date for COLLABORATOR */}
        {role === CompanyRole.COLLABORATOR && (
          <div>
            <label className="text-sm font-medium text-white mb-2 block">
              Access Expiry Date (Optional)
            </label>
            <InputEnhanced
              type="datetime-local"
              value={memberExpiresAt}
              onChange={(e) => setMemberExpiresAt(e.target.value)}
              disabled={isPending}
              min={new Date().toISOString().slice(0, 16)}
            />
            <p className="text-xs text-muted-foreground mt-1">
              The collaborator's access will automatically expire on this date
            </p>
          </div>
        )}

        <div>
          <label className="text-sm font-medium text-white mb-2 block">
            Optional Message
          </label>
          <InputEnhanced
            textarea
            placeholder="Add a personal message (optional)"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            disabled={isPending}
          />
        </div>

        <div className="flex gap-3 justify-end pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={
              isPending ||
              !email.trim() ||
              (role === CompanyRole.COLLABORATOR &&
                customPermissions.length === 0)
            }
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Sending...
              </>
            ) : (
              "Send Invitation"
            )}
          </Button>
        </div>
      </form>

      {/* Permission Selector Modal */}
      <PermissionSelectorModal
        isOpen={isPermissionModalOpen}
        onClose={() => setIsPermissionModalOpen(false)}
        value={customPermissions}
        onChange={setCustomPermissions}
      />
    </Modal>
  );
}
