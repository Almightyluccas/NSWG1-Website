"use client"

import { Users, UserPlus, FileText, Calendar } from "lucide-react"
import { AdminStatCard } from "@/components/admin/stat-card"
import { RecentUsersTable } from "@/components/admin/recent-users-table"

const recentUsers = [
  {
    id: "123456789",
    username: "CommanderAlpha",
    discriminator: "1234",
    avatar: "https://cdn.discordapp.com/embed/avatars/0.png",
    roles: ["member", "admin"],
    joinedAt: new Date(2023, 11, 15),
  },
  {
    id: "987654321",
    username: "OperatorBravo",
    discriminator: "5678",
    avatar: "https://cdn.discordapp.com/embed/avatars/1.png",
    roles: ["member"],
    joinedAt: new Date(2024, 0, 5),
  },
  {
    id: "456789123",
    username: "RecruitCharlie",
    discriminator: "9012",
    avatar: "https://cdn.discordapp.com/embed/avatars/2.png",
    roles: ["candidate"],
    joinedAt: new Date(2024, 1, 20),
  },
  {
    id: "789123456",
    username: "SniperDelta",
    discriminator: "3456",
    avatar: "https://cdn.discordapp.com/embed/avatars/3.png",
    roles: ["member"],
    joinedAt: new Date(2024, 2, 10),
  },
  {
    id: "321654987",
    username: "MedicEcho",
    discriminator: "7890",
    avatar: "https://cdn.discordapp.com/embed/avatars/4.png",
    roles: ["candidate"],
    joinedAt: new Date(2024, 2, 25),
  },
]

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-gray-500 dark:text-zinc-400">Welcome to the NSWG1 admin dashboard.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <AdminStatCard
          title="Total Users"
          value="156"
          icon={<Users className="h-6 w-6 text-accent" />}
          trend={{ value: 12, isPositive: true }}
        />
        <AdminStatCard
          title="New Users"
          value="24"
          description="Last 30 days"
          icon={<UserPlus className="h-6 w-6 text-accent" />}
          trend={{ value: 8, isPositive: true }}
        />
        <AdminStatCard title="Pending Applications" value="7" icon={<FileText className="h-6 w-6 text-accent" />} />
        <AdminStatCard
          title="Upcoming Events"
          value="3"
          description="Next 7 days"
          icon={<Calendar className="h-6 w-6 text-accent" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RecentUsersTable users={recentUsers} />
        </div>
        <div className="bg-white dark:bg-zinc-800 rounded-lg border border-gray-200 dark:border-zinc-700 shadow-sm p-6">
          <h3 className="text-lg font-medium mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <a
              href="/admin/perscom/submissions/enlistment"
              className="block p-3 bg-gray-50 dark:bg-zinc-700/50 rounded-md hover:bg-gray-100 dark:hover:bg-zinc-700 transition-colors"
            >
              <div className="font-medium">Review Enlistment Applications</div>
              <div className="text-sm text-gray-500 dark:text-zinc-400">7 pending applications</div>
            </a>
            <a
              href="/admin/perscom/submissions/leave"
              className="block p-3 bg-gray-50 dark:bg-zinc-700/50 rounded-md hover:bg-gray-100 dark:hover:bg-zinc-700 transition-colors"
            >
              <div className="font-medium">Review Leave Requests</div>
              <div className="text-sm text-gray-500 dark:text-zinc-400">2 pending requests</div>
            </a>
            <a
              href="/admin/users"
              className="block p-3 bg-gray-50 dark:bg-zinc-700/50 rounded-md hover:bg-gray-100 dark:hover:bg-zinc-700 transition-colors"
            >
              <div className="font-medium">Manage Users</div>
              <div className="text-sm text-gray-500 dark:text-zinc-400">Edit roles and permissions</div>
            </a>
            <a
              href="/admin/perscom/organization/units"
              className="block p-3 bg-gray-50 dark:bg-zinc-700/50 rounded-md hover:bg-gray-100 dark:hover:bg-zinc-700 transition-colors"
            >
              <div className="font-medium">Manage Units</div>
              <div className="text-sm text-gray-500 dark:text-zinc-400">Configure unit structure and assignments</div>
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
