import { Navbar } from "@/components/navbar"
import { SettingsClient } from "./settings-client"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/authOptions"
import { redirect } from "next/navigation"

export default async function SettingsPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-900">
      <Navbar />
      <main className="pt-24 pb-12">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
              <p className="text-gray-600 dark:text-zinc-400 mt-2">
                Manage your account settings and website preferences
              </p>
            </div>
            <SettingsClient user={session.user} />
          </div>
        </div>
      </main>
    </div>
  )
}
