import type React from "react";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { DashboardHeader } from "@/components/dashboard/header";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { getAuthSession } from "@/lib/authOptions";
import { UserRole } from "@/types/database";
import { DashboardLightModeScope } from "@/components/theme/theme-provider";

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
  const isMember = session?.user?.roles?.includes(UserRole.member);

  if (isMember) {
    return (
      <DashboardLightModeScope>
        <div className="flex h-screen overflow-hidden bg-white dark:bg-zinc-900">
          <DashboardSidebar />
          <div className="flex-1 flex flex-col overflow-hidden min-w-0">
            <DashboardHeader />
            <main className="flex-1 overflow-y-auto p-4 md:p-6">
              {children}
            </main>
          </div>
        </div>
      </DashboardLightModeScope>
    );
  }

  return (
    <DashboardLightModeScope>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 pt-24 pb-12">
          <div className="container mx-auto px-4">
            <div className="max-w-7xl mx-auto">{children}</div>
          </div>
        </main>
        <Footer />
      </div>
    </DashboardLightModeScope>
  );
}
