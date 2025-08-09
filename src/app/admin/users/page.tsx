"use server"

import { UsersTable } from "@/app/admin/users/users-table.client";
import ServerRoleGuard from "@/components/auth/server-role-guard";
import { UserRole } from "@/types/database";
import { database } from "@/database";


export default async function UsersPage() {

  const rawUsers = await database.get.users();

  const processedUsers = await Promise.all(
    rawUsers.map(async (user) => {
      if (user.imageUrl && !user.imageUrl.startsWith("http") && process.env.OCI_PROFILE_PAR_URL) {
        const signedUrl = process.env.OCI_PROFILE_PAR_URL + user.imageUrl;
        return { ...user, imageUrl: signedUrl };
      }
      return user;
    })
  );

  return (
    <ServerRoleGuard allowedRoles={[UserRole.developer, UserRole.admin, UserRole.superAdmin]}>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Users</h1>
            <p className="text-gray-500 dark:text-zinc-400">Manage user accounts and permissions.</p>
          </div>
        </div>

        <UsersTable users={processedUsers}/>

      </div>
    </ServerRoleGuard>
  )
}
