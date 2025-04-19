"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useDiscordAuth, type UserRole } from "@/lib/discord-auth-context"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { FadeIn } from "@/components/fade-in"
import { RoleManager } from "@/components/admin/role-manager"
import Image from "next/image"

// Mock users for demonstration
const mockUsers: Array<{
  id: string
  username: string
  discriminator: string
  avatar: string
  roles: UserRole[]
}> = [
  {
    id: "123456789",
    username: "CommanderAlpha",
    discriminator: "1234",
    avatar: "https://cdn.discordapp.com/embed/avatars/0.png",
    roles: ["member", "admin"] as UserRole[],
  },
  {
    id: "987654321",
    username: "OperatorBravo",
    discriminator: "5678",
    avatar: "https://cdn.discordapp.com/embed/avatars/1.png",
    roles: ["member"] as UserRole[],
  },
  {
    id: "456789123",
    username: "RecruitCharlie",
    discriminator: "9012",
    avatar: "https://cdn.discordapp.com/embed/avatars/2.png",
    roles: ["candidate"] as UserRole[],
  },
]

export default function AdminUsersPage() {
  const { user, hasRole } = useDiscordAuth()
  const router = useRouter()

  // Check if user is admin
  useEffect(() => {
    if (!user) {
      router.push("/login")
    } else if (!hasRole("admin")) {
      router.push("/")
    }
  }, [user, hasRole, router])

  if (!user || !hasRole("admin")) {
    return null
  }

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-zinc-900">
      <Navbar />

      <section className="relative pt-20">
        <div className="absolute inset-0 z-0 h-64">
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-transparent z-10"></div>
          <Image src="/images/realism-background.png" alt="Admin Dashboard" fill className="object-cover" />
        </div>

        <div className="container mx-auto px-4 z-10 relative pt-10 pb-6">
          <FadeIn>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">User Management</h1>
            <p className="text-lg text-gray-300 max-w-2xl">Manage user roles and permissions for NSWG1 members.</p>
          </FadeIn>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-lg overflow-hidden">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-6">Users</h2>

              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                  <tr className="border-b border-gray-200 dark:border-zinc-700">
                    <th className="text-left py-3 px-4">User</th>
                    <th className="text-left py-3 px-4">Discord ID</th>
                    <th className="text-left py-3 px-4">Roles</th>
                    <th className="text-left py-3 px-4">Actions</th>
                  </tr>
                  </thead>
                  <tbody>
                  {mockUsers.map((mockUser) => (
                    <tr key={mockUser.id} className="border-b border-gray-200 dark:border-zinc-700">
                      <td className="py-4 px-4">
                        <div className="flex items-center">
                          <div className="relative w-10 h-10 rounded-full overflow-hidden mr-3">
                            <Image
                              src={mockUser.avatar || "/placeholder.svg"}
                              alt={mockUser.username}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div>
                            <div className="font-medium">
                              {mockUser.username}#{mockUser.discriminator}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-gray-500 dark:text-zinc-400">{mockUser.id}</td>
                      <td className="py-4 px-4">
                        <div className="flex flex-wrap gap-1">
                          {mockUser.roles.map((role) => (
                            <span
                              key={role}
                              className="inline-block bg-gray-100 dark:bg-zinc-700 rounded-full px-2 py-1 text-xs font-semibold"
                            >
                                {role.charAt(0).toUpperCase() + role.slice(1)}
                              </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <RoleManager userId={mockUser.id} currentRoles={mockUser.roles} />
                      </td>
                    </tr>
                  ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
