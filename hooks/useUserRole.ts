import { useUser } from "./useUser";
import { CompanyRole, Role } from "@/types";

/**
 * Hook to get the user's platform-level role (ADMIN or USER)
 * This is the role at the platform level, not company level
 */
export function useUserRole(): Role | null {
  const { data: user } = useUser();

  if (!user || !user.role) return null;

  // user.role is a string, map it to Role enum
  if (user.role === "ADMIN") {
    return Role.ADMIN;
  }
  if (user.role === "USER") {
    return Role.USER;
  }
  if (user.role === "APIM") {
    return Role.APIM;
  }

  return null;
}

/**
 * Hook to get the user's company-level role (OWNER, ADMIN, MEMBER, COLLABORATOR)
 * This is the role within the company
 */
export function useCompanyRole(): CompanyRole | null {
  const { data: user } = useUser();

  if (!user?.company?.role) return null;

  return user.company.role as CompanyRole;
}

/**
 * Hook to get the effective role for permission checks
 * Otherwise returns the company role
 */
export function useEffectiveRole(): CompanyRole | null {
  const userRole = useUserRole();
  const companyRole = useCompanyRole();

  // Otherwise return the company role
  return companyRole;
}
