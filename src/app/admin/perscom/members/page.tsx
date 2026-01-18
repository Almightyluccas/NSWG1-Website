import { MembersTable } from "@/app/admin/perscom/members/members-table.client";
import ServerRoleGuard from "@/components/auth/server-role-guard";
import { PerscomUserResponse } from "@/types/api/perscomApi";
import { perscom } from "@/lib/perscom/api";

export default async function UsersPage() {
  const members: PerscomUserResponse[] = await perscom.get.users();

  return (
    <ServerRoleGuard allowedRoles={["admin", "superAdmin", "instructor"]}>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Members</h1>
            <p className="text-gray-500 dark:text-zinc-400">
              Manage Perscom member accounts.
            </p>
          </div>
        </div>
        <MembersTable members={members} />
      </div>
    </ServerRoleGuard>
  );
}
