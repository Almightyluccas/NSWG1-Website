import type React from "react";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { DashboardHeader } from "@/components/dashboard/header";
import ServerRoleGuard from "@/components/auth/server-role-guard";
import { UserRole } from "@/types/database";

export const metadata = {
  title: "Dashboard - Naval Special Warfare Group One",
  description: "Member Operations Dashboard",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ServerRoleGuard allowedRoles={[UserRole.member]}>
      <div className="flex h-screen bg-zinc-900 overflow-hidden">
        <DashboardSidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <DashboardHeader />
          <main className="flex-1 overflow-y-auto p-6">{children}</main>
        </div>
      </div>
    </ServerRoleGuard>
  );
}
