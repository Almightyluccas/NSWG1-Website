import type React from "react"
import { AdminSidebar } from "@/components/admin/sidebar"
import { AdminHeader } from "@/components/admin/header"
import ServerRoleGuard from "@/components/auth/server-role-guard";

// TODO: Use perscom Webhook to setup notifications
export default function AdminLayout({ children }: { children: React.ReactNode }) {

  return (
    <ServerRoleGuard allowedRoles={['admin', 'superAdmin', 'instructor']}>
      <div className="flex h-screen bg-gray-100 dark:bg-zinc-900">
        <div className={ "md:block" }>
          <AdminSidebar />
        </div>
        <div className="flex-1 flex flex-col overflow-hidden">
          <AdminHeader />

          <main className="flex-1 overflow-y-auto p-6">{children}</main>
        </div>
      </div>
    </ServerRoleGuard>

  )
}
