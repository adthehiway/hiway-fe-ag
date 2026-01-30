"use client";

import { useState, useEffect } from "react";
import { TabsContent } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCompany } from "@/hooks/useCompanies";
import {
  useCompanyMembersInfinite,
  useCompanyInvitationsInfinite,
  useRemoveMember,
  useRevokeInvitation,
  useChangeMemberRole,
  useUpdateMemberPermissions,
} from "@/hooks/useInvitations";
import { useInView } from "react-intersection-observer";
import { CompanyRole, ICompanyMember, IInvitation } from "@/types";
import {
  Plus,
  Mail,
  UserX,
  MoreVertical,
  Trash2,
  Shield,
  Settings,
  Clock,
} from "lucide-react";
import InviteMemberModal from "./InviteMemberModal";
import { PermissionSelectorModal } from "./PermissionSelectorModal";
import { Permission } from "@/lib/permissions";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useUser } from "@/hooks/useUser";
import { useEffectiveRole } from "@/hooks/useUserRole";
import { Loader } from "@/components/ui/loader";
import { Skeleton } from "@/components/ui/skeleton";
import moment from "moment";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const roleLabels: Record<CompanyRole, string> = {
  [CompanyRole.OWNER]: "Owner",
  [CompanyRole.ADMIN]: "Admin",
  [CompanyRole.MEMBER]: "Member",
  [CompanyRole.COLLABORATOR]: "Collaborator",
};

const roleColors: Record<CompanyRole, string> = {
  [CompanyRole.OWNER]: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  [CompanyRole.ADMIN]: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  [CompanyRole.MEMBER]: "bg-gray-500/20 text-gray-400 border-gray-500/30",
  [CompanyRole.COLLABORATOR]:
    "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
};

export default function MembersTab() {
  const { data: company } = useCompany();
  const { data: user } = useUser();
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState<ICompanyMember | null>(
    null
  );
  const [memberToChangeRole, setMemberToChangeRole] =
    useState<ICompanyMember | null>(null);
  const [newRole, setNewRole] = useState<CompanyRole | null>(null);
  const [memberToUpdatePermissions, setMemberToUpdatePermissions] =
    useState<ICompanyMember | null>(null);
  const [permissions, setPermissions] = useState<Permission[]>([]);

  const {
    items: members,
    isLoading: membersLoading,
    fetchNextPage: fetchNextMembers,
    hasNextPage: hasNextMembers,
    isFetchingNextPage: isFetchingNextMembers,
  } = useCompanyMembersInfinite(company?.id, { limit: 20 });

  const {
    items: invitations,
    isLoading: invitationsLoading,
    fetchNextPage: fetchNextInvitations,
    hasNextPage: hasNextInvitations,
    isFetchingNextPage: isFetchingNextInvitations,
  } = useCompanyInvitationsInfinite(company?.id, 20);

  // Infinite scroll for members
  const { ref: membersRef, inView: membersInView } = useInView({
    threshold: 0.1,
  });

  // Infinite scroll for invitations
  const { ref: invitationsRef, inView: invitationsInView } = useInView({
    threshold: 0.1,
  });

  useEffect(() => {
    if (membersInView && hasNextMembers && !isFetchingNextMembers) {
      fetchNextMembers();
    }
  }, [membersInView, hasNextMembers, isFetchingNextMembers, fetchNextMembers]);

  useEffect(() => {
    if (invitationsInView && hasNextInvitations && !isFetchingNextInvitations) {
      fetchNextInvitations();
    }
  }, [
    invitationsInView,
    hasNextInvitations,
    isFetchingNextInvitations,
    fetchNextInvitations,
  ]);
  const { mutate: removeMember } = useRemoveMember();
  const { mutate: revokeInvitation } = useRevokeInvitation();
  const { mutate: changeRole } = useChangeMemberRole();
  const { mutate: updatePermissions } = useUpdateMemberPermissions();

  const effectiveRole = useEffectiveRole() || CompanyRole.MEMBER;
  const canManageMembers =
    effectiveRole === CompanyRole.OWNER || effectiveRole === CompanyRole.ADMIN;
  const canInvite = canManageMembers;
  const canRemoveMembers = effectiveRole === CompanyRole.OWNER;
  const canChangeRoles = effectiveRole === CompanyRole.OWNER;

  const handleRemoveMember = () => {
    if (!memberToRemove || !company?.id) return;
    removeMember(
      {
        companyId: company.id,
        memberId: memberToRemove.id,
      },
      {
        onSuccess: () => {
          setMemberToRemove(null);
        },
      }
    );
  };

  const handleChangeRole = () => {
    if (!memberToChangeRole || !company?.id || !newRole) return;
    changeRole(
      {
        companyId: company.id,
        memberId: memberToChangeRole.id,
        role: newRole,
      },
      {
        onSuccess: () => {
          setMemberToChangeRole(null);
          setNewRole(null);
        },
      }
    );
  };

  const getInitials = (
    firstName?: string,
    lastName?: string,
    email?: string
  ) => {
    if (firstName && lastName) {
      return `${firstName[0]}${lastName[0]}`.toUpperCase();
    }
    if (firstName) {
      return firstName[0].toUpperCase();
    }
    if (email) {
      return email[0].toUpperCase();
    }
    return "?";
  };

  const getDisplayName = (member: ICompanyMember) => {
    if (member.user.firstName && member.user.lastName) {
      return `${member.user.firstName} ${member.user.lastName}`;
    }
    if (member.user.firstName) {
      return member.user.firstName;
    }
    if (member.user.username) {
      return member.user.username;
    }
    return member.user.email;
  };

  return (
    <TabsContent value="members" className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Shield className="w-5 h-5" /> Team Members
              </CardTitle>
              <CardDescription className="text-muted-foreground text-sm mt-1">
                Manage team members and their access permissions
              </CardDescription>
            </div>
            {canInvite && (
              <Button onClick={() => setIsInviteModalOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Member
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {/* Active Members */}
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-white mb-3">
                Active Members ({members?.length || 0})
              </h3>
              {membersLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : members && members.length > 0 ? (
                <>
                  <div className="space-y-3">
                    {members.map((member) => (
                      <div
                        key={member.id}
                        className="flex items-center justify-between p-4 bg-muted/40 rounded-lg border border-border hover:bg-muted/60 transition-colors"
                      >
                        <div className="flex items-center gap-4 flex-1 min-w-0">
                          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-lg font-bold text-white shrink-0">
                            {member.user.image ? (
                              <img
                                src={member.user.image}
                                alt={getDisplayName(member)}
                                className="w-full h-full rounded-full object-cover"
                              />
                            ) : (
                              getInitials(
                                member.user.firstName,
                                member.user.lastName,
                                member.user.email
                              )
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-white truncate">
                              {getDisplayName(member)}
                            </div>
                            <div className="text-sm text-muted-foreground truncate">
                              {member.user.email}
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                              Joined{" "}
                              {moment(member.createdAt).format("MMM DD, YYYY")}
                            </div>
                          </div>
                          <Badge
                            className={`${
                              roleColors[member.role]
                            } border text-xs px-3 py-1`}
                          >
                            {roleLabels[member.role]}
                          </Badge>
                          {member.role === CompanyRole.COLLABORATOR && (
                            <div className="flex flex-col gap-1 text-xs text-muted-foreground">
                              <div>
                                {member.customPermissions?.length || 0}{" "}
                                permission
                                {(member.customPermissions?.length || 0) !== 1
                                  ? "s"
                                  : ""}
                              </div>
                              {member.expiresAt && (
                                <div className="flex items-center gap-1 text-yellow-400/80">
                                  <Clock className="w-3 h-3" />
                                  Expires{" "}
                                  {moment(member.expiresAt).format(
                                    "MMM DD, YYYY"
                                  )}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                        {(canRemoveMembers ||
                          canChangeRoles ||
                          (canChangeRoles &&
                            member.role === CompanyRole.COLLABORATOR)) && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="ml-2 shrink-0"
                              >
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {canChangeRoles &&
                                member.role !== CompanyRole.OWNER && (
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setMemberToChangeRole(member);
                                      setNewRole(member.role);
                                    }}
                                  >
                                    Change Role
                                  </DropdownMenuItem>
                                )}
                              {canChangeRoles &&
                                member.role === CompanyRole.COLLABORATOR && (
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setMemberToUpdatePermissions(member);
                                      // Populate with existing customPermissions
                                      setPermissions(
                                        (member.customPermissions as Permission[]) ||
                                          []
                                      );
                                    }}
                                  >
                                    <Settings className="w-4 h-4 mr-2" />
                                    Manage Permissions
                                  </DropdownMenuItem>
                                )}
                              {canRemoveMembers &&
                                member.userId !== user?.id &&
                                member.role !== CompanyRole.OWNER && (
                                  <>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                      className="text-destructive"
                                      onClick={() => setMemberToRemove(member)}
                                    >
                                      <Trash2 className="w-4 h-4 mr-2" />
                                      Remove Member
                                    </DropdownMenuItem>
                                  </>
                                )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>
                    ))}
                  </div>
                  {/* Infinite scroll trigger for members */}
                  {hasNextMembers && (
                    <div ref={membersRef} className="py-4">
                      {isFetchingNextMembers ? (
                        <div className="flex justify-center">
                          <Loader />
                        </div>
                      ) : (
                        <div className="h-4" />
                      )}
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No members found
                </div>
              )}
            </div>

            {/* Pending Invitations */}
            {invitations && invitations.length > 0 && (
              <div className="mt-6">
                <h3 className="text-sm font-semibold text-white mb-3">
                  Pending Invitations (
                  {
                    invitations.filter(
                      (inv) => !inv.acceptedAt && !inv.revokedAt
                    ).length
                  }
                  )
                </h3>
                <div className="space-y-3">
                  {invitations
                    .filter((inv) => !inv.acceptedAt && !inv.revokedAt)
                    .map((invitation) => (
                      <div
                        key={invitation.id}
                        className="flex items-center justify-between p-4 bg-muted/20 rounded-lg border border-border"
                      >
                        <div className="flex items-center gap-4 flex-1 min-w-0">
                          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-lg font-bold text-white shrink-0">
                            <Mail className="w-5 h-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-white truncate">
                              {invitation.email}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Invited as {roleLabels[invitation.role]}
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                              Expires{" "}
                              {moment(invitation.expiresAt).format(
                                "MMM DD, YYYY"
                              )}
                            </div>
                          </div>
                          <Badge
                            variant="outline"
                            className="text-xs px-3 py-1 border-yellow-500/30 text-yellow-400"
                          >
                            Pending
                          </Badge>
                        </div>
                        {canManageMembers && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => revokeInvitation(invitation.id)}
                            className="ml-2 shrink-0"
                          >
                            <UserX className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  {/* Infinite scroll trigger for invitations */}
                  {hasNextInvitations && (
                    <div ref={invitationsRef} className="py-4">
                      {isFetchingNextInvitations ? (
                        <div className="flex justify-center">
                          <Loader />
                        </div>
                      ) : (
                        <div className="h-4" />
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Invite Modal */}
      {company && (
        <InviteMemberModal
          isOpen={isInviteModalOpen}
          onClose={() => setIsInviteModalOpen(false)}
          companyId={company.id}
          userRole={effectiveRole}
        />
      )}

      {/* Remove Member Dialog */}
      <AlertDialog
        open={!!memberToRemove}
        onOpenChange={(open) => !open && setMemberToRemove(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Team Member</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove{" "}
              {memberToRemove && getDisplayName(memberToRemove)} from your
              company? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemoveMember}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Change Role Dialog */}
      <AlertDialog
        open={!!memberToChangeRole}
        onOpenChange={(open) => {
          if (!open) {
            setMemberToChangeRole(null);
            setNewRole(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Change Member Role</AlertDialogTitle>
            <AlertDialogDescription>
              Select a new role for{" "}
              {memberToChangeRole && getDisplayName(memberToChangeRole)}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Select
              value={newRole || undefined}
              onValueChange={(value) => setNewRole(value as CompanyRole)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(roleLabels)
                  .filter(
                    ([role]) =>
                      role !== CompanyRole.OWNER ||
                      memberToChangeRole?.role === CompanyRole.OWNER
                  )
                  .map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleChangeRole}
              disabled={!newRole || newRole === memberToChangeRole?.role}
            >
              Update Role
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Update Permissions Modal */}
      {memberToUpdatePermissions && company && (
        <PermissionSelectorModal
          isOpen={!!memberToUpdatePermissions}
          onClose={() => {
            // Only update if permissions are set, otherwise just close
            if (permissions.length > 0) {
              updatePermissions(
                {
                  companyId: company.id,
                  memberId: memberToUpdatePermissions.id,
                  customPermissions: permissions,
                },
                {
                  onSuccess: () => {
                    setMemberToUpdatePermissions(null);
                    setPermissions([]);
                  },
                }
              );
            } else {
              // Close without updating if no permissions selected
              setMemberToUpdatePermissions(null);
              setPermissions([]);
            }
          }}
          value={permissions}
          onChange={(newPermissions) => {
            setPermissions(newPermissions);
          }}
        />
      )}
    </TabsContent>
  );
}
