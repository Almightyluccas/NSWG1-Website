import { Suspense } from "react";
import { SseLibraryClient } from "./sse-client";
import { Skeleton } from "@/components/ui/skeleton";
import { getAuthSession } from "@/lib/authOptions";

export default async function SseLibraryPage() {
  const session = await getAuthSession();
  const userRoles = session?.user?.roles ?? [];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold mb-1.5 text-zinc-900 dark:text-zinc-100 uppercase tracking-widest">
          Sensitive Site Exploitation
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400 text-sm font-mono uppercase tracking-wider">
          Global Intel &amp; Evidence Repository
        </p>
      </div>

      <Suspense
        fallback={
          <div className="space-y-4">
            <Skeleton className="h-32 w-full rounded-lg" />
            <Skeleton className="h-64 w-full rounded-lg" />
          </div>
        }
      >
        <SseLibraryClient userRoles={userRoles} />
      </Suspense>
    </div>
  );
}
