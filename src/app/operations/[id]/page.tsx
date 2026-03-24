import { Suspense } from "react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { DashboardHeader } from "@/components/dashboard/header";
import { OperationDetailClient } from "./operation-detail";
import { Skeleton } from "@/components/ui/skeleton";
import { getAuthSession } from "@/lib/authOptions";
import { UserRole } from "@/types/database";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default async function OperationDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getAuthSession();
  const isMember = session?.user?.roles?.includes(UserRole.member);
  const { id } = params;

  const pageContent = (
    <div className="space-y-6">
      <Link 
        href="/operations"
        className="inline-flex items-center text-xs font-mono text-zinc-500 hover:text-accent transition-colors"
      >
        <ChevronLeft className="h-4 w-4 mr-1" />
        BACK TO OPERATIONS CENTER
      </Link>

      <Suspense
        fallback={
          <div className="space-y-4">
            <Skeleton className="h-40 w-full rounded-sm bg-zinc-900/50" />
            <Skeleton className="h-[500px] w-full rounded-sm bg-zinc-900/50" />
          </div>
        }
      >
        <OperationDetailClient id={id} />
      </Suspense>
    </div>
  );

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
