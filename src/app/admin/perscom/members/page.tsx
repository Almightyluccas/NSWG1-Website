// import { UserPlus } from "lucide-react"
// import { Button } from "@/components/ui/button"
import {MembersTable} from "@/app/admin/perscom/members/members-table.client";
import {getUsers} from "@/lib/perscomApi";
import ServerRoleGuard from "@/components/auth/server-role-guard";
import {PerscomUserResponse} from "@/types/perscomApi";




export default async function UsersPage() {
  const members: PerscomUserResponse[] = await getUsers();

  //TODO: Add feature to modify users

  return (
    <ServerRoleGuard allowedRoles={["admin", "superAdmin", "instructor"]}>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Members</h1>
            <p className="text-gray-500 dark:text-zinc-400">Manage Perscom member accounts.</p>
          </div>
          {/*<Button className="bg-accent hover:bg-accent-darker text-black">*/}
          {/*  <UserPlus className="h-4 w-4 mr-2" /> Add User*/}
          {/*</Button>*/}
        </div>
        <MembersTable members={members}/>
      </div>
    </ServerRoleGuard>
  )
}
