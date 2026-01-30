import { navItems, bottomItems, SidebarItem } from "@/config/dashboard/sidebar";
import { hasPermission, Permission } from "@/lib/permissions";
import { CompanyRole, IUser } from "@/types";

/**
 * Find the first accessible route for a user based on their permissions
 * @param role - The user's role
 * @param user - The user object (for collaborator permissions)
 * @returns The first accessible route href, or null if none found
 */
export function getFirstAccessibleRoute(
  role: CompanyRole | null,
  user?: IUser
): string | null {
  if (!role) return null;

  // Combine all available routes (excluding coming soon items)
  const allRoutes: SidebarItem[] = [
    ...navItems,
    ...bottomItems.filter((item) => !item.comingSoon),
  ];

  // Check each route in order
  for (const route of allRoutes) {
    if (!route.href || route.comingSoon) continue;

    // If route has no required permission, it's accessible
    if (!route.requiredPermission) {
      return route.href;
    }

    // Check if user has required permission(s)
    const permissions = Array.isArray(route.requiredPermission)
      ? route.requiredPermission
      : [route.requiredPermission];

    const hasAccess = permissions.some((permission) =>
      hasPermission(role, permission as Permission, user)
    );

    if (hasAccess) {
      return route.href;
    }
  }

  return "/dashboard/settings";
}
