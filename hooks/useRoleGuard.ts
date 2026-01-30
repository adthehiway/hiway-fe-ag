import { useUser } from "./useUser";
import { useEffectiveRole } from "./useUserRole";
import { hasPermission, Permission } from "@/lib/permissions";

/**
 * Hook to check if user has required permission(s)
 * Returns loading state and access status
 */
export function useRoleGuard(requiredPermission: Permission | Permission[]) {
  const { data: user, isLoading } = useUser();
  const effectiveRole = useEffectiveRole();

  const permissions = Array.isArray(requiredPermission)
    ? requiredPermission
    : [requiredPermission];

  const hasAccess =
    !isLoading &&
    effectiveRole !== null &&
    user !== undefined &&
    permissions.some((permission) =>
      hasPermission(effectiveRole, permission, user)
    );

  return {
    hasAccess,
    isLoading,
    effectiveRole,
    user,
  };
}
