import { UserRole } from "@/types/database";

interface RoutePermission {
  minimumRole?: UserRole; // Optional: The minimum hierarchical role needed
  specificRoles?: UserRole[]; // Optional: A list of specific roles that grant access
}

export const routePermissions: Record<string, RoutePermission> = {
  "/admin": { minimumRole: UserRole.admin },

  "/perscom": { minimumRole: UserRole.member },
  "/calendar": { minimumRole: UserRole.member },
  "/forms": { minimumRole: UserRole.member },
  "/documents": { minimumRole: UserRole.member },
};
