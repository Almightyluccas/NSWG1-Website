import { hasMinRole, UserRole } from "@/types/database";

export type ViewerAccessContext = {
  userId: string;
  roles: string[];
};

export type DocumentAccessContext = {
  minimumRole: string;
  allowedRoles: string[];
  allowedUsers: string[];
};

export function canAccessDocument(
  viewer: ViewerAccessContext,
  doc: DocumentAccessContext
): boolean {
  if (
    viewer.roles.includes(UserRole.admin) ||
    viewer.roles.includes(UserRole.superAdmin) ||
    viewer.roles.includes(UserRole.developer)
  ) {
    return true;
  }

  if (
    !hasMinRole(viewer.roles, (doc.minimumRole || UserRole.member) as UserRole)
  ) {
    return false;
  }

  if (
    doc.allowedRoles.length > 0 &&
    !doc.allowedRoles.some((role) => viewer.roles.includes(role))
  ) {
    return false;
  }

  if (
    doc.allowedUsers.length > 0 &&
    !doc.allowedUsers.includes(viewer.userId)
  ) {
    return false;
  }

  return true;
}
