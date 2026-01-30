"use client";

import { useUser } from "@/hooks/useUser";
import { useEffectiveRole } from "@/hooks/useUserRole";
import { hasPermission, Permission } from "@/lib/permissions";
import { Loader } from "@/components/ui/loader";
import { AccessDenied } from "./AccessDenied";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface RoleGuardProps {
  children: React.ReactNode;
  requiredPermission: Permission | Permission[];
  fallback?: React.ReactNode;
  redirectTo?: string;
  showAccessDenied?: boolean;
}

/**
 * RoleGuard component that protects pages/routes based on permissions
 *
 * @example
 * // Protect a page with a single permission
 * <RoleGuard requiredPermission="media:write">
 *   <UploadPage />
 * </RoleGuard>
 *
 * @example
 * // Protect with multiple permissions (user needs at least one)
 * <RoleGuard requiredPermission={["analytics:read", "analytics:write"]}>
 *   <AnalyticsPage />
 * </RoleGuard>
 *
 * @example
 * // Redirect instead of showing access denied
 * <RoleGuard
 *   requiredPermission="company:billing"
 *   redirectTo="/dashboard/settings"
 * >
 *   <BillingPage />
 * </RoleGuard>
 *
 * @param children - Content to render if user has permission
 * @param requiredPermission - Single permission or array of permissions (user needs at least one)
 * @param fallback - Custom component to show if access is denied (defaults to AccessDenied)
 * @param redirectTo - URL to redirect to if access is denied (takes precedence over fallback)
 * @param showAccessDenied - Whether to show the AccessDenied component (default: true if no redirectTo)
 */
export function RoleGuard({
  children,
  requiredPermission,
  fallback,
  redirectTo,
  showAccessDenied = !redirectTo,
}: RoleGuardProps) {
  const { data: user, isLoading } = useUser();
  const effectiveRole = useEffectiveRole();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && effectiveRole && user) {
      const permissions = Array.isArray(requiredPermission)
        ? requiredPermission
        : [requiredPermission];

      const hasAccess = permissions.some((permission) =>
        hasPermission(effectiveRole, permission, user)
      );

      if (!hasAccess && redirectTo) {
        router.push(redirectTo);
      }
    }
  }, [isLoading, effectiveRole, user, requiredPermission, redirectTo, router]);

  // Show loader while checking permissions
  if (isLoading || !effectiveRole || !user) {
    return <Loader />;
  }

  // Check if user has required permission(s)
  const permissions = Array.isArray(requiredPermission)
    ? requiredPermission
    : [requiredPermission];

  const hasAccess = permissions.some((permission) =>
    hasPermission(effectiveRole, permission, user)
  );

  // If redirecting, show loader while redirect happens
  if (!hasAccess && redirectTo) {
    return <Loader />;
  }

  // If no access, show fallback or AccessDenied
  if (!hasAccess) {
    if (fallback) {
      return <>{fallback}</>;
    }
    if (showAccessDenied) {
      return <AccessDenied requiredPermission={permissions} />;
    }
    return null;
  }

  // User has access, render children
  return <>{children}</>;
}
