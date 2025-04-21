"use client"

import { useState } from "react"
import Image from "next/image"
import { Search, Filter, UserPlus, MoreHorizontal } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

// Mock user data
const mockUsers = [
  {
    id: "123456789",
    username: "CommanderAlpha",
    discriminator: "1234",
    avatar: "https://cdn.discordapp.com/embed/avatars/0.png",
    name: "J. Smith",
    email: "jsmith@example.com",
    roles: ["member", "admin"],
    steamId: "STEAM_0:1:12345678",
    dateJoined: "2023-11-15T00:00:00Z",
    unit: "Task Force 160th",
    position: "Commander",
    status: "Active",
  },
  {
    id: "987654321",
    username: "OperatorBravo",
    discriminator: "5678",
    avatar: "https://cdn.discordapp.com/embed/avatars/1.png",
    name: "R. Johnson",
    email: "rjohnson@example.com",
    roles: ["member"],
    steamId: "STEAM_0:0:23456789",
    dateJoined: "2024-01-05T00:00:00Z",
    unit: "TACDEVRON2",
    position: "Operator",
    status: "Active",
  },
  {
    id: "456789123",
    username: "RecruitCharlie",
    discriminator: "9012",
    avatar: "https://cdn.discordapp.com/embed/avatars/2.png",
    name: "M. Williams",
    email: "mwilliams@example.com",
    roles: ["candidate"],
    steamId: "STEAM_0:1:34567890",
    dateJoined: "2024-02-20T00:00:00Z",
    unit: "Pending Assignment",
    position: "Recruit",
    status: "In Training",
  },
  {
    id: "789123456",
    username: "SniperDelta",
    discriminator: "3456",
    avatar: "https://cdn.discordapp.com/embed/avatars/3.png",
    name: "T. Brown",
    email: "tbrown@example.com",
    roles: ["member"],
    steamId: "STEAM_0:0:45678901",
    dateJoined: "2024-03-10T00:00:00Z",
    unit: "Task Force 160th",
    position: "Marksman",
    status: "Active",
  },
  {
    id: "321654987",
    username: "MedicEcho",
    discriminator: "7890",
    avatar: "https://cdn.discordapp.com/embed/avatars/4.png",
    name: "A. Davis",
    email: "adavis@example.com",
    roles: ["candidate"],
    steamId: "STEAM_0:1:56789012",
    dateJoined: "2024-03-25T00:00:00Z",
    unit: "Pending Assignment",
    position: "Recruit",
    status: "In Training",
  },
]

export default function UsersPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [isUserDetailsOpen, setIsUserDetailsOpen] = useState(false)

  // Filter users based on search query
  const filteredUsers = mockUsers.filter((user) => {
    const searchLower = searchQuery.toLowerCase()
    return (
      user.username.toLowerCase().includes(searchLower) ||
      user.name.toLowerCase().includes(searchLower) ||
      user.email.toLowerCase().includes(searchLower) ||
      user.roles.some((role) => role.toLowerCase().includes(searchLower))
    )
  })

  const handleViewDetails = (user: any) => {
    setSelectedUser(user)
    setIsUserDetailsOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Users</h1>
          <p className="text-gray-500 dark:text-zinc-400">Manage user accounts and permissions.</p>
        </div>
        <Button className="bg-accent hover:bg-accent-darker text-black">
          <UserPlus className="h-4 w-4 mr-2" /> Add User
        </Button>
      </div>

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
                Unit
              </th>
              <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-zinc-400 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-zinc-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-zinc-700">
            {filteredUsers.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-zinc-700/50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="relative h-10 w-10 rounded-full overflow-hidden mr-3">
                      <Image
                        src={user.avatar || "/placeholder.svg"}
                        alt={user.username || 'empty'}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <div className="font-medium">
                        {user.username}#{user.discriminator}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-zinc-400">{user.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">{user.name}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex flex-wrap gap-1">
                    {user.roles.map((role: string) => (
                      <Badge key={role} variant="outline" className="capitalize">
                        {role}
                      </Badge>
                    ))}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">{user.unit}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Badge
                    variant={user.status === "Active" ? "accent" : "outline"}
                    className={user.status === "Active" ? "" : ""}
                  >
                    {user.status}
                  </Badge>
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
                      <DropdownMenuItem>Edit User</DropdownMenuItem>
                      <DropdownMenuItem className="text-red-500 dark:text-red-400">Suspend User</DropdownMenuItem>
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

        <div className="p-4 border-t border-gray-200 dark:border-zinc-700 flex items-center justify-between">
          <div className="text-sm text-gray-500 dark:text-zinc-400">
            Showing <span className="font-medium">{filteredUsers.length}</span> of{" "}
            <span className="font-medium">{mockUsers.length}</span> users
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" disabled>
              Previous
            </Button>
            <Button variant="outline" size="sm">
              Next
            </Button>
          </div>
        </div>
      </div>

      {/* User Details Dialog */}
      {selectedUser && (
        <Dialog open={isUserDetailsOpen} onOpenChange={setIsUserDetailsOpen}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>User Details</DialogTitle>
              <DialogDescription>Detailed information about the selected user.</DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-1">
                <div className="flex flex-col items-center">
                  <div className="relative h-32 w-32 rounded-full overflow-hidden mb-4">
                    <Image
                      src={selectedUser.avatar || "/placeholder.svg"}
                      alt={selectedUser.username}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <h3 className="text-lg font-bold">
                    {selectedUser.username}#{selectedUser.discriminator}
                  </h3>
                  <p className="text-gray-500 dark:text-zinc-400">{selectedUser.name}</p>
                  <div className="mt-2 flex flex-wrap justify-center gap-1">
                    {selectedUser.roles.map((role: string) => (
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
                        <p className="text-sm text-gray-500 dark:text-zinc-400">{selectedUser.steamId}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Discord ID</p>
                      <p className="text-sm text-gray-500 dark:text-zinc-400">{selectedUser.id}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Date Joined</p>
                      <p className="text-sm text-gray-500 dark:text-zinc-400">
                        {new Date(selectedUser.dateJoined).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-500 dark:text-zinc-400 uppercase tracking-wider mb-2">
                    Unit Information
                  </h4>
                  <div className="bg-gray-50 dark:bg-zinc-700/50 rounded-md p-4 space-y-2">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <p className="text-sm font-medium">Unit</p>
                        <p className="text-sm text-gray-500 dark:text-zinc-400">{selectedUser.unit}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Position</p>
                        <p className="text-sm text-gray-500 dark:text-zinc-400">{selectedUser.position}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Status</p>
                      <p className="text-sm text-gray-500 dark:text-zinc-400">{selectedUser.status}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-500 dark:text-zinc-400 uppercase tracking-wider mb-2">
                    Role Management
                  </h4>
                  <div className="bg-gray-50 dark:bg-zinc-700/50 rounded-md p-4">
                    {/*<RoleManager userId={selectedUser.id} currentRoles={selectedUser.roles} />*/}
                  </div>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
