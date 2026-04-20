import { UserRole } from "@/types/database";

/**
 * When false, users cannot change accent color or light/dark mode in the UI.
 * Set `NEXT_PUBLIC_THEME_USER_CUSTOMIZATION_ENABLED=false` to lock themes for the unit.
 */
export const THEME_USER_CUSTOMIZATION_ENABLED =
  process.env.NEXT_PUBLIC_THEME_USER_CUSTOMIZATION_ENABLED !== "false";

/** Roles that may use light mode inside the member dashboard route group only. */
const LIGHT_MODE_ELIGIBLE_ROLES: UserRole[] = [
  UserRole.member,
  UserRole.candidate,
  UserRole.applicant,
];

export function isLightModeEligibleRole(
  roles: UserRole[] | string[] | undefined
): boolean {
  if (!roles?.length) return false;
  return roles.some((r) =>
    LIGHT_MODE_ELIGIBLE_ROLES.includes(r as UserRole)
  );
}
