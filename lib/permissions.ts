import { CompanyRole, IUser } from "@/types";

export type Resource =
  | "dashboard"
  | "media"
  | "smartlink"
  | "smartroom"
  | "company"
  | "crm"
  | "analytics"
  | "monetization"
  | "billing"
  | "events";

export type Action = "read" | "write" | "delete" | "update";

export type Permission = `${Resource}:${Action}` | `${Resource}:*`;

export const OWNER_PERMISSIONS: Permission[] = [
  "dashboard:*",
  "media:*",
  "smartlink:*",
  "smartroom:*",
  "company:*",
  "crm:*",
  "analytics:*",
  "monetization:*",
  "billing:*",
  "events:*",
];

export const ADMIN_PERMISSIONS: Permission[] = [
  "dashboard:*",
  "media:*",
  "smartlink:*",
  "smartroom:*",
  "company:*",
  "crm:*",
  "analytics:*",
  "monetization:*",
  "events:*",
];

export const MEMBER_PERMISSIONS: Permission[] = [
  "dashboard:*",
  "company:read",
  "media:read",
  "media:write",
  "smartlink:*",
  "smartroom:*",
  "events:*",
];

export const COLLABORATOR_PERMISSIONS: Permission[] = [];

export const ROLE_PERMISSIONS: Record<CompanyRole, Permission[]> = {
  [CompanyRole.OWNER]: OWNER_PERMISSIONS,
  [CompanyRole.ADMIN]: ADMIN_PERMISSIONS,
  [CompanyRole.MEMBER]: MEMBER_PERMISSIONS,
  [CompanyRole.COLLABORATOR]: COLLABORATOR_PERMISSIONS,
};

/**
 * Check if a permission string matches a pattern (supports wildcards)
 *
 * When checking if a user has a permission:
 * - If user has "company:*", they have all company permissions (company:read, company:write, etc.)
 * - If user has "company:read", they only have read permission, NOT "company:*"
 */
function matchesPermission(
  userPermission: Permission,
  requiredPermission: Permission
): boolean {
  // Exact match
  if (userPermission === requiredPermission) {
    return true;
  }

  // If user has a wildcard permission (e.g., "company:*"), it matches any specific permission for that resource
  // Example: user has "company:*" and we check for "company:read" -> true
  if (userPermission.endsWith(":*")) {
    const userResource = userPermission.split(":")[0];
    const requiredResource = requiredPermission.split(":")[0];
    return userResource === requiredResource;
  }

  // If we're checking for a wildcard permission (e.g., "company:*"),
  // the user must actually have that exact wildcard permission, not just any permission for that resource
  // Example: user has "company:read" and we check for "company:*" -> false
  // Only return true if the user also has the exact wildcard
  if (requiredPermission.endsWith(":*")) {
    // Check if user has the exact wildcard permission
    return userPermission === requiredPermission;
  }

  return false;
}

/**
 * Check if a role has a specific permission
 */
export function hasPermission(
  role: CompanyRole | null,
  permission: Permission,
  user?: IUser
): boolean {
  if (!role) return false;
  // For COLLABORATOR role, use permissions from user object if available
  if (role === CompanyRole.COLLABORATOR && user?.company?.permissions) {
    const userPermissions = user.company.permissions as Permission[];
    return userPermissions.some((p) => matchesPermission(p, permission));
  }

  // For other roles, use the hardcoded permissions
  const rolePermissions = ROLE_PERMISSIONS[role] || [];
  return rolePermissions.some((p) => matchesPermission(p, permission));
}

/**
 * Check if a role has any of the specified permissions
 */
export function hasAnyPermission(
  role: CompanyRole,
  permissions: Permission[] | Permission,
  user?: IUser
): boolean {
  return Array.isArray(permissions)
    ? permissions.some((permission) => hasPermission(role, permission, user))
    : hasPermission(role, permissions, user);
}

/**
 * Check if a role has all of the specified permissions
 */
export function hasAllPermissions(
  role: CompanyRole,
  permissions: Permission[],
  user?: IUser
): boolean {
  return permissions.every((permission) =>
    hasPermission(role, permission, user)
  );
}

/**
 * Get all permissions for a role
 * For COLLABORATOR role, returns permissions from user object if available
 */
export function getRolePermissions(
  role: CompanyRole,
  user?: IUser
): Permission[] {
  // For COLLABORATOR role, use permissions from user object if available
  if (role === CompanyRole.COLLABORATOR && user?.company?.permissions) {
    return user.company.permissions as Permission[];
  }

  // For other roles, use the hardcoded permissions
  return ROLE_PERMISSIONS[role] || [];
}

/**
 * Check if a role can invite users
 */
export function canInviteUsers(role: CompanyRole, user?: IUser): boolean {
  return hasPermission(role, "company:update", user);
}

/**
 * Check if a role can assign a specific role to users
 * Owners can assign any role, Admins cannot assign Owner role
 */
export function canAssignRole(
  role: CompanyRole,
  targetRole: CompanyRole
): boolean {
  if (role === CompanyRole.OWNER) {
    return true;
  }
  if (role === CompanyRole.ADMIN) {
    return targetRole !== CompanyRole.OWNER;
  }
  return false;
}

/**
 * Check if a role can manage billing
 */
export function canManageBilling(role: CompanyRole, user?: IUser): boolean {
  return (
    hasPermission(role, "billing:*", user) ||
    hasPermission(role, "billing:update", user)
  );
}

/**
 * Check if a role can delete company
 */
export function canDeleteCompany(role: CompanyRole, user?: IUser): boolean {
  return hasPermission(role, "company:delete", user);
}

/**
 * Check if a role can write to media
 */
export function canWriteMedia(role: CompanyRole | null, user?: IUser): boolean {
  return (
    hasPermission(role, "media:write", user) ||
    hasPermission(role, "media:*", user)
  );
}

/**
 * Check if a role can write to smartlinks
 */
export function canWriteSmartlinks(
  role: CompanyRole | null,
  user?: IUser
): boolean {
  return (
    hasPermission(role, "smartlink:write", user) ||
    hasPermission(role, "smartlink:*", user)
  );
}

/**
 * Check if a role can update smartlinks
 */
export function canUpdateSmartlinks(
  role: CompanyRole | null,
  user?: IUser
): boolean {
  return (
    hasPermission(role, "smartlink:update", user) ||
    hasPermission(role, "smartlink:*", user)
  );
}

/**
 * Check if a role can delete media
 */
export function canDeleteMedia(role: CompanyRole, user?: IUser): boolean {
  return (
    hasPermission(role, "media:delete", user) ||
    hasPermission(role, "media:*", user)
  );
}

/**
 * Check if a role can delete smartlinks
 */
export function canDeleteSmartlinks(
  role: CompanyRole | null,
  user?: IUser
): boolean {
  return (
    hasPermission(role, "smartlink:delete", user) ||
    hasPermission(role, "smartlink:*", user)
  );
}

/**
 * Check if a role can view analytics
 */
export function canViewAnalytics(role: CompanyRole, user?: IUser): boolean {
  return (
    hasPermission(role, "analytics:read", user) ||
    hasPermission(role, "analytics:*", user)
  );
}

/**
 * Check if a role can access monetization settings
 */
export function canAccessMonetization(
  role: CompanyRole,
  user?: IUser
): boolean {
  return (
    hasPermission(role, "monetization:read", user) ||
    hasPermission(role, "monetization:write", user) ||
    hasPermission(role, "monetization:update", user) ||
    hasPermission(role, "monetization:*", user)
  );
}

/**
 * Check if a role can write to smartrooms
 */
export function canWriteSmartrooms(
  role: CompanyRole | null,
  user?: IUser
): boolean {
  return (
    hasPermission(role, "smartroom:write", user) ||
    hasPermission(role, "smartroom:*", user)
  );
}

/**
 * Check if a role can update smartrooms
 */
export function canUpdateSmartrooms(
  role: CompanyRole | null,
  user?: IUser
): boolean {
  return (
    hasPermission(role, "smartroom:update", user) ||
    hasPermission(role, "smartroom:*", user)
  );
}

/**
 * Check if a role can delete smartrooms
 */
export function canDeleteSmartrooms(
  role: CompanyRole | null,
  user?: IUser
): boolean {
  return (
    hasPermission(role, "smartroom:delete", user) ||
    hasPermission(role, "smartroom:*", user)
  );
}
