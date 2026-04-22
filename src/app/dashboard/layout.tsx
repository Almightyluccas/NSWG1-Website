import type React from "react";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { DashboardHeader } from "@/components/dashboard/header";
import { getAuthSession } from "@/lib/authOptions";
import { hasMinRole, UserRole } from "@/types/database";
import { DashboardLightModeScope } from "@/components/theme/theme-provider";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Dashboard - Naval Special Warfare Group One",
  description: "Member Operations Dashboard",
};

export default async function DashboardGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getAuthSession();
  if (!session) {
    redirect("/login");
  }

  if (!hasMinRole(session.user.roles ?? [], UserRole.member)) {
    redirect("/unauthorized");
  }

  return (
    <DashboardLightModeScope>
      <div className="flex h-screen overflow-hidden bg-white dark:bg-zinc-900">
        <DashboardSidebar />
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          <DashboardHeader />
          <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
        </div>
      </div>
    </DashboardLightModeScope>
  );
}
