import { Suspense } from "react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { DashboardHeader } from "@/components/dashboard/header";
import { OperationsClient } from "./operations-client";
import { Skeleton } from "@/components/ui/skeleton";
import { getAuthSession } from "@/lib/authOptions";
import { UserRole } from "@/types/database";
import { perscom } from "@/lib/perscom/api";
import { PerscomUserResponse } from "@/types/api/perscomApi";

export default async function OperationsPage() {
  const session = await getAuthSession();
  const isMember = session?.user?.roles?.includes(UserRole.member);

  let userCombatRecords: { id: number; text: string; documentParsed?: any }[] = [];
  
  if (session?.user?.perscomId) {
    try {
      const allUsers: PerscomUserResponse[] = await perscom.get.users();
      const user = allUsers.find((u) => u.id === Number(session!.user!.perscomId));
      if (user?.combat_records) {
         userCombatRecords = user.combat_records.map(record => ({
            id: record.id,
            text: record.text || "",
            documentParsed: record.document_parsed
         }));
      }
    } catch (e) {
      console.error("Failed to fetch user combat records for operations center", e);
    }
  }

  const pageContent = (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2 text-zinc-100 uppercase tracking-widest">
          Operations Center
        </h1>
        <p className="text-zinc-400 text-sm font-mono uppercase tracking-wider">
          Command & Control // Joint Operations Registry
        </p>
      </div>

      <Suspense
        fallback={
          <div className="space-y-8">
            <Skeleton className="h-[600px] w-full rounded-sm bg-zinc-900/50" />
          </div>
        }
      >
        <OperationsClient userCombatRecords={userCombatRecords} />
      </Suspense>
    </div>
  );

  // If member, render inside dashboard layout
  if (isMember) {
    return (
      <div className="flex h-screen bg-zinc-900 overflow-hidden">
        <DashboardSidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <DashboardHeader />
          <main className="flex-1 overflow-y-auto p-4 md:p-6">{pageContent}</main>
        </div>
      </div>
    );
  }

  // Not a member? Basic layout
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pt-24 pb-12">
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto">{pageContent}</div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
