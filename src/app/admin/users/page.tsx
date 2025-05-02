import { UsersTable } from "@/app/admin/users/users-table.client";
import ServerRoleGuard from "@/components/auth/server-role-guard";
import { UserRole } from "@/types/database";
import { database } from "@/database";


export default async function UsersPage() {

  return (
    <ServerRoleGuard allowedRoles={[UserRole.developer, UserRole.admin, UserRole.superAdmin]}>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Users</h1>
            <p className="text-gray-500 dark:text-zinc-400">Manage user accounts and permissions.</p>
          </div>
        </div>

        <UsersTable users={await database.get.users()}/>

      </div>
    </ServerRoleGuard>
  )
}
