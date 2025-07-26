import { RosterClient } from "@/app/perscom/roster/roster-client"
import ServerRoleGuard from "@/components/auth/server-role-guard"
import { UserRole } from "@/types/database"

export default function RosterPage() {
  return (
    <ServerRoleGuard allowedRoles={[UserRole.member]}>
      <RosterClient />
    </ServerRoleGuard>
  )
}
