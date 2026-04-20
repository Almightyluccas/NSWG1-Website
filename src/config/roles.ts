import { UserRole } from "@/types/database";

interface RoutePermission {
  minimumRole?: UserRole; // Optional: The minimum hierarchical role needed
  specificRoles?: UserRole[]; // Optional: A list of specific roles that grant access
}

export const routePermissions: Record<string, RoutePermission> = {
  "/admin": { minimumRole: UserRole.admin },

  "/dashboard": { minimumRole: UserRole.member },
  "/dashboard/perscom": { minimumRole: UserRole.member },
  "/dashboard/calendar": { minimumRole: UserRole.member },
  "/dashboard/forms": { minimumRole: UserRole.member },
  "/dashboard/documents": { minimumRole: UserRole.member },
};
