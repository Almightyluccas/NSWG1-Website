import type React from "react";
import { AdminSidebar } from "@/components/admin/layout/sidebar";
import { AdminHeader } from "@/components/admin/layout/header";
import ServerRoleGuard from "@/components/auth/server-role-guard";
import { Toaster } from "sonner";
import { UserRole } from "@/types/database";

// TODO: Use perscom Webhook to setup notifications
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ServerRoleGuard
      allowedRoles={[UserRole.admin, UserRole.superAdmin, UserRole.instructor]}
    >
      <div className="flex h-screen bg-gray-100 dark:bg-zinc-900">
        <div className={"md:block"}>
          <AdminSidebar />
        </div>
        <div className="flex-1 flex flex-col overflow-hidden">
          <AdminHeader />
          <main className="flex-1 overflow-y-auto p-6">
            {children}
            <Toaster theme="dark" richColors />
          </main>
        </div>
      </div>
    </ServerRoleGuard>
  );
}
