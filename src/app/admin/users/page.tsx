import {UsersTable} from "@/app/admin/users/users-table.client";
import {getAllUsersDb} from "@/db/client";


export default async function UsersPage() {
  //TODO: add ability to add roles to members

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Users</h1>
          <p className="text-gray-500 dark:text-zinc-400">Manage user accounts and permissions.</p>
        </div>
      </div>

      <UsersTable users={await getAllUsersDb()}/>

    </div>
  )
}
