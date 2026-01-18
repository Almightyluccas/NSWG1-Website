import React, { useEffect } from "react";
import { useRouter } from "next/navigation";

interface RoleGuardProps {
  roles: string[];
  allowedRoles: string[];
  hide?: boolean;
  children: React.ReactNode;
}

export default function RoleGuard({
  roles,
  allowedRoles,
  hide = false,
  children,
}: RoleGuardProps) {
  const router = useRouter();
  const isAllowed = allowedRoles.some((r) => roles.includes(r));

  useEffect(() => {
    if (!isAllowed && !hide) {
      router.push("/unauthorized");
    }
  }, [isAllowed, hide, router]);

  if (!isAllowed && hide) {
    return null;
  }

  return <>{children}</>;
}
