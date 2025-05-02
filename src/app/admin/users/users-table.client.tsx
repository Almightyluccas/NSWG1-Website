"use client"

import {useState} from "react";
import {Filter, MoreHorizontal, Search} from "lucide-react";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import Image from "next/image";
import {Badge} from "@/components/ui/badge";
import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger} from "@/components/ui/dropdown-menu";
import {Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import {UserInformation} from "@/types/database";
import { useSession } from "next-auth/react";
import { UserRole } from "@/types/database";
import { PaginationBar } from "@/components/ui/pagination";
import RoleGuard from "@/components/auth/role-guard";
import { RoleManager } from "@/app/admin/users/role-manager";

interface UserTableProps {
  users: UserInformation[]
}
const itemsPerPage = 10;


export const UsersTable = ({ users } : UserTableProps ) => {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedUser, setSelectedUser] = useState<UserInformation | null>(null);
  const [isUserDetailsOpen, setIsUserDetailsOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1);
  const [isRoleManagerOpen, setIsRoleManagerOpen] = useState(false);

  const { data: session } = useSession();

  const filteredUsers = users.filter((user) => {
    const searchLower = searchQuery.toLowerCase()
    return (
      user.name?.toLowerCase().includes(searchLower) ||
      user.discord_username.toLowerCase().includes(searchLower) ||
      user.email.toLowerCase().includes(searchLower) ||
      user.role.some((role) => role.toLowerCase().includes(searchLower))
    )
  })

  const handleViewDetails = (user: UserInformation) => {
    setSelectedUser(user);
    setIsUserDetailsOpen(true);

  };
  const handleDialogOpenChange = (open: boolean) => {
    setIsUserDetailsOpen(open);
    if (!open) {
      setSelectedUser(null);
      document.body.focus();
      setTimeout(() => {
        document.body.style.pointerEvents = "auto";
      }, 100);
    }
  };

  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  const prioritizeRoles = (roles: string[]) => {
    const priorityRoles = [
      UserRole.admin.toString(),
      UserRole.superAdmin.toString(),
      UserRole.developer.toString()
    ];
    const displayRoles = [];

    for (const role of priorityRoles) {
      if (roles.includes(role)) {
        displayRoles.push(role);
      }
    }
    for (const role of roles) {
      if (!priorityRoles.includes(role) && displayRoles.length < 4) {
        displayRoles.push(role);
      }
    }
    return {
      displayRoles: displayRoles.slice(0, 4),
      hasMore: roles.length > 4
    };
  };

  return (
    <>
      <div className="bg-white dark:bg-zinc-800 rounded-lg border border-gray-200 dark:border-zinc-700 shadow-sm">
        <div className="p-6 border-b border-gray-200 dark:border-zinc-700 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-zinc-500" />
            <Input
              type="text"
              placeholder="Search users..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button variant="outline" className="flex items-center gap-2">
            <Filter className="h-4 w-4" /> Filter
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
            <tr className="bg-gray-50 dark:bg-zinc-700/50 text-left">
              <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-zinc-400 uppercase tracking-wider">
                User
              </th>
              <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-zinc-400 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-zinc-400 uppercase tracking-wider">
                Roles
              </th>
              <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-zinc-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-zinc-700">
            {paginatedUsers.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-zinc-700/50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="relative h-10 w-10 rounded-full overflow-hidden mr-3">
                      <Image
                        src={user.imageUrl || "/placeholder.svg"}
                        alt={user.name || 'empty'}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <div className="font-medium">
                        {user.discord_username}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-zinc-400">{user.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">{user.name}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex flex-wrap gap-1">
                    {(() => {
                      const {displayRoles, hasMore} = prioritizeRoles(user.role);
                      return (
                        <>
                          {displayRoles.map((role: string) => (
                            <Badge key={role} variant="outline" className="capitalize">
                              {role}
                            </Badge>
                          ))}
                          {hasMore && (
                            <Badge variant="outline" className="bg-gray-100 dark:bg-zinc-700">
                              +{user.role.length - displayRoles.length}
                            </Badge>
                          )}
                        </>
                      );
                    })()}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleViewDetails(user)}>View Details</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => {
                        setSelectedUser(user);
                        setIsRoleManagerOpen(true);
                      }}>Edit Roles</DropdownMenuItem>
                      {/*<DropdownMenuItem className="text-red-500 dark:text-red-400">Suspend User</DropdownMenuItem>*/}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="p-6 text-center">
            <p className="text-gray-500 dark:text-zinc-400">No users found matching your search criteria.</p>
          </div>
        )}

        <div className="p-4 border-t border-gray-200 dark:border-zinc-700 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-sm text-gray-500 dark:text-zinc-400">
            Showing <span className="font-medium">{paginatedUsers.length}</span> of{" "}
            <span className="font-medium">{users.length}</span> users
          </div>
        </div>
      </div>

      <PaginationBar
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />

      {/* User Details Dialog */}
      {selectedUser && (
        <Dialog open={isUserDetailsOpen} onOpenChange={handleDialogOpenChange}>
          <DialogContent className="w-[90vw] md:w-[50vw] !max-w-none">
            <DialogHeader>
              <DialogTitle>User Details</DialogTitle>
              <DialogDescription>Detailed information about the selected user.</DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-1">
                <div className="flex flex-col items-center">
                  <div className="relative h-32 w-32 rounded-full overflow-hidden mb-4">
                    <Image
                      src={selectedUser.imageUrl || "/placeholder.svg"}
                      alt={selectedUser.name || ''}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <h3 className="text-lg font-bold">
                    {selectedUser.discord_username}
                  </h3>
                  <p className="text-gray-500 dark:text-zinc-400">{selectedUser.name}</p>
                  <div className="mt-2 flex flex-wrap justify-center gap-1">
                    {selectedUser.role.map((role: string) => (
                      <Badge key={role} variant="outline" className="capitalize">
                        {role}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              <div className="md:col-span-2 space-y-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-500 dark:text-zinc-400 uppercase tracking-wider mb-2">
                    Personal Information
                  </h4>
                  <div className="bg-gray-50 dark:bg-zinc-700/50 rounded-md p-4 space-y-2">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <p className="text-sm font-medium">Email</p>
                        <p className="text-sm text-gray-500 dark:text-zinc-400">{selectedUser.email}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Steam ID</p>
                        <p className="text-sm text-gray-500 dark:text-zinc-400">{selectedUser.steam_id}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Discord ID</p>
                      <p className="text-sm text-gray-500 dark:text-zinc-400">{selectedUser.id}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Date Joined</p>
                      <p className="text-sm text-gray-500 dark:text-zinc-400">
                        {new Date(selectedUser.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
                <RoleGuard roles={session?.user.roles || []} allowedRoles={[UserRole.superAdmin]} hide={true}>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 dark:text-zinc-400 uppercase tracking-wider mb-2">
                      Role Management
                    </h4>
                    <div className="bg-gray-50 dark:bg-zinc-700/50 rounded-md p-4">
                      {/*<RoleManager userId={selectedUser.id} currentRoles={selectedUser.roles} />*/}
                    </div>
                  </div>
                </RoleGuard>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
      {selectedUser && (
        <RoleManager
          open={isRoleManagerOpen}
          onOpenChangeAction={setIsRoleManagerOpen}
          currentRoles={selectedUser.role}
          userId={selectedUser.id}
          currentUserRoles={session?.user.roles || []}
        />
      )}
    </>
  )
}