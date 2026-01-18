import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { User } from "@/types/database";

interface RecentUsersTableProps {
  users: User[];
}

export function RecentUsersTable({ users }: RecentUsersTableProps) {
  return (
    <div className="bg-white dark:bg-zinc-800 rounded-lg border border-gray-200 dark:border-zinc-700 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-gray-200 dark:border-zinc-700">
        <h3 className="text-lg font-medium">Recent Users</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 dark:bg-zinc-700/50 text-left">
              <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-zinc-400 uppercase tracking-wider">
                User
              </th>
              <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-zinc-400 uppercase tracking-wider">
                Roles
              </th>
              <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-zinc-400 uppercase tracking-wider">
                Joined
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-zinc-700">
            {users.map((user) => (
              <tr
                key={user.id}
                className="hover:bg-gray-50 dark:hover:bg-zinc-700/50 transition-colors"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="relative h-10 w-10 rounded-full overflow-hidden mr-3">
                      <Image
                        src={user.imageUrl || "/placeholder.svg"}
                        alt={user.name || "User Avatar"}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <div className="font-medium">
                        {user.name || user.discord_username}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-zinc-400">
                        ID: {user.id}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex flex-wrap gap-1">
                    {user.role.map((role) => (
                      <Badge
                        key={role}
                        variant="outline"
                        className="capitalize"
                      >
                        {role}
                      </Badge>
                    ))}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-zinc-400">
                  {formatDistanceToNow(user.created_at, { addSuffix: true })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
