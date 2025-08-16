import {RosterTable} from "@/app/perscom/roster/roster-table.client";
import ServerRoleGuard from "@/components/auth/server-role-guard";
import { UserRole } from "@/types/database";
import { perscom } from "@/lib/perscom/api";
import { PerscomUserResponse, Rank } from "@/types/api/perscomApi";

export default async function RosterPage() {
  const members: PerscomUserResponse[] = await perscom.get.users();
  const ranks: Rank[] = await perscom.get.ranks();

  return (
    <ServerRoleGuard allowedRoles={[UserRole.member]}>
      <div className="container mx-auto px-4 pt-24 pb-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Personnel Roster</h1>
          <p className="text-gray-500 dark:text-zinc-400">
            View the complete roster of personnel organized by command structure
          </p>
        </div>
        <RosterTable members={members} ranks={ranks} />
      </div>
    </ServerRoleGuard>
  )
}
