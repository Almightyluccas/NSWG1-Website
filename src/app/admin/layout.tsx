"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { AdminSidebar } from "@/components/admin/sidebar"
import { AdminHeader } from "@/components/admin/header"
import { useSession } from "next-auth/react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const { data: session } = useSession();
  const router = useRouter()

  useEffect(() => {
    if (!session) {
      router.push("/login")
    } else if (!["admin", "superAdmin"].some(role => session.user.roles.includes(role))) {
      router.push("/")
    }
  }, [session, session?.user.roles, router])

  if (!session || !["admin", "superAdmin"].some(role => session.user.roles.includes(role))) {
    return null
  }

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-zinc-900">
      <div className={`${sidebarOpen ? "block" : "hidden"} md:block`}>
        <AdminSidebar />
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  )
}
