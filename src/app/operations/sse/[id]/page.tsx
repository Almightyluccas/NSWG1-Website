import { Suspense } from "react";
import { SseDetailClient } from "./sse-detail-client";
import { Skeleton } from "@/components/ui/skeleton";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { DashboardHeader } from "@/components/dashboard/header";
import { getAuthSession } from "@/lib/authOptions";
import { UserRole } from "@/types/database";

export default async function SseDetailPage({ params }: { params: { id: string } }) {
  const session = await getAuthSession();
  const isMember = session?.user?.roles?.includes(UserRole.member);

  const pageContent = (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2 text-zinc-100 uppercase tracking-widest">
          SSE Record Review
        </h1>
        <p className="text-zinc-400 text-sm font-mono uppercase tracking-wider">
          Intelligence Exploitation // SYS_ID: {params.id}
        </p>
      </div>

      <Suspense
        fallback={
          <div className="space-y-8">
            <Skeleton className="h-[600px] w-full max-w-5xl rounded-sm bg-zinc-900/50" />
          </div>
        }
      >
        <SseDetailClient id={params.id} />
      </Suspense>
    </div>
  );

  if (isMember) {
    return (
      <div className="flex h-screen bg-zinc-900 overflow-hidden">
        <DashboardSidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <DashboardHeader />
          <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-10">{pageContent}</main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pt-24 pb-12">
        <div className="container mx-auto px-4">
          {pageContent}
        </div>
      </main>
      <Footer />
    </div>
  );
}
