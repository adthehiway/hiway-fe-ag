import { useUser } from "./useUser";
import { useEffectiveRole } from "./useUserRole";
import {
  hasPermission as hasPermissionFn,
  hasAnyPermission as hasAnyPermissionFn,
  hasAllPermissions as hasAllPermissionsFn,
  getRolePermissions as getRolePermissionsFn,
  canInviteUsers,
  canAssignRole,
  canManageBilling,
  canDeleteCompany,
  canWriteMedia,
  canWriteSmartlinks,
  canUpdateSmartlinks,
  canDeleteMedia,
  canDeleteSmartlinks,
  canWriteSmartrooms,
  canUpdateSmartrooms,
  canDeleteSmartrooms,
  canViewAnalytics,
  canAccessMonetization,
  Permission,
} from "@/lib/permissions";
import { CompanyRole } from "@/types";

/**
 * Hook to check permissions with user context
 * Automatically uses custom permissions for COLLABORATOR role from user object
 */
export function usePermissions() {
  const { data: user } = useUser();
  const effectiveRole = useEffectiveRole();

  const hasPermission = (permission: Permission): boolean => {
    if (!effectiveRole) return false;
    return hasPermissionFn(effectiveRole, permission, user || undefined);
  };

  const hasAnyPermission = (permissions: Permission[]): boolean => {
    if (!effectiveRole) return false;
    return hasAnyPermissionFn(effectiveRole, permissions, user || undefined);
  };

  const hasAllPermissions = (permissions: Permission[]): boolean => {
    if (!effectiveRole) return false;
    return hasAllPermissionsFn(effectiveRole, permissions, user || undefined);
  };

  const getPermissions = (): Permission[] => {
    if (!effectiveRole) return [];
    return getRolePermissionsFn(effectiveRole, user || undefined);
  };

  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    getPermissions,
    role: effectiveRole,
    user,
  };
}

/**
 * Hook for permission helper functions with user context
 */
export function usePermissionHelpers() {
  const { data: user } = useUser();
  const effectiveRole = useEffectiveRole();

  if (!effectiveRole) {
    return {
      canInviteUsers: () => false,
      canAssignRole: () => false,
      canManageBilling: () => false,
      canDeleteCompany: () => false,
      canWriteMedia: () => false,
      canWriteSmartlinks: () => false,
      canUpdateSmartlinks: () => false,
      canDeleteMedia: () => false,
      canDeleteSmartlinks: () => false,
      canWriteSmartrooms: () => false,
      canUpdateSmartrooms: () => false,
      canDeleteSmartrooms: () => false,
      canViewAnalytics: () => false,
      canAccessMonetization: () => false,
    };
  }

  // Create wrapper functions that pass user context
  return {
    canInviteUsers: () => canInviteUsers(effectiveRole, user || undefined),
    canAssignRole: (targetRole: CompanyRole) =>
      canAssignRole(effectiveRole, targetRole),
    canManageBilling: () => canManageBilling(effectiveRole, user || undefined),
    canDeleteCompany: () => canDeleteCompany(effectiveRole, user || undefined),
    canWriteMedia: () => canWriteMedia(effectiveRole, user || undefined),
    canWriteSmartlinks: () =>
      canWriteSmartlinks(effectiveRole, user || undefined),
    canUpdateSmartlinks: () =>
      canUpdateSmartlinks(effectiveRole, user || undefined),
    canDeleteMedia: () => canDeleteMedia(effectiveRole, user || undefined),
    canDeleteSmartlinks: () =>
      canDeleteSmartlinks(effectiveRole, user || undefined),
    canWriteSmartrooms: () =>
      canWriteSmartrooms(effectiveRole, user || undefined),
    canUpdateSmartrooms: () =>
      canUpdateSmartrooms(effectiveRole, user || undefined),
    canDeleteSmartrooms: () =>
      canDeleteSmartrooms(effectiveRole, user || undefined),
    canViewAnalytics: () => canViewAnalytics(effectiveRole, user || undefined),
    canAccessMonetization: () =>
      canAccessMonetization(effectiveRole, user || undefined),
  };
}
